import { getDb } from '../database/connection';
import { ContasPagar, ContasReceber } from '../types/database';

export class FinanceRepository {
  // --- Contas a Pagar ---
  
  async createContaPagar(conta: Omit<ContasPagar, 'id'>): Promise<number> {
    const db = await getDb();
    const result = await db.execute(
      'INSERT INTO contas_pagar (data_cadastro, data_vencimento, valor, descricao) VALUES ($1, $2, $3, $4)',
      [conta.data_cadastro, conta.data_vencimento, conta.valor, conta.descricao]
    );
    return result.lastInsertId ?? 0;
  }

  async updateContaPagar(id: number, conta: Partial<ContasPagar>): Promise<void> {
    const db = await getDb();
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (conta.data_vencimento !== undefined) {
      updates.push(`data_vencimento = $${idx++}`);
      values.push(conta.data_vencimento);
    }
    if (conta.valor !== undefined) {
      updates.push(`valor = $${idx++}`);
      values.push(conta.valor);
    }
    if (conta.descricao !== undefined) {
      updates.push(`descricao = $${idx++}`);
      values.push(conta.descricao);
    }

    if (updates.length === 0) return;
    values.push(id);
    await db.execute(`UPDATE contas_pagar SET ${updates.join(', ')} WHERE id = $${idx}`, values);
  }

  async deleteContaPagar(id: number): Promise<void> {
    const db = await getDb();
    await db.execute('DELETE FROM contas_pagar WHERE id = $1', [id]);
  }

  async listContasPagar(): Promise<ContasPagar[]> {
    const db = await getDb();
    return await db.select<ContasPagar[]>('SELECT * FROM contas_pagar ORDER BY data_vencimento ASC');
  }

  // --- Contas a Receber ---

  async createContaReceber(conta: Omit<ContasReceber, 'id'>): Promise<number> {
    const db = await getDb();
    const result = await db.execute(
      'INSERT INTO contas_receber (venda_id, data_cadastro, data_vencimento, valor, descricao, pago) VALUES ($1, $2, $3, $4, $5, $6)',
      [conta.venda_id, conta.data_cadastro, conta.data_vencimento, conta.valor, conta.descricao, conta.pago ? 1 : 0]
    );
    return result.lastInsertId ?? 0;
  }

  async updateContaReceberPago(id: number, pago: boolean): Promise<void> {
    const db = await getDb();

    // Atualiza contas_receber
    await db.execute('UPDATE contas_receber SET pago = $1 WHERE id = $2', [pago ? 1 : 0, id]);

    // Busca o venda_id vinculado e sincroniza a venda
    const rows = await db.select<{ venda_id: number }[]>(
      'SELECT venda_id FROM contas_receber WHERE id = $1',
      [id]
    );
    if (rows.length > 0 && rows[0].venda_id) {
      await db.execute('UPDATE venda SET pago = $1 WHERE id = $2', [pago ? 1 : 0, rows[0].venda_id]);
    }
  }

  async listContasReceberPendentes(): Promise<ContasReceber[]> {
    const db = await getDb();
    const results = await db.select<ContasReceber[]>('SELECT * FROM contas_receber WHERE pago = 0 ORDER BY data_vencimento ASC');
    return results.map(row => ({
      ...row,
      pago: Boolean(row.pago)
    }));
  }

  async listContasReceber(): Promise<ContasReceber[]> {
    const db = await getDb();
    const results = await db.select<ContasReceber[]>('SELECT * FROM contas_receber ORDER BY data_vencimento DESC');
    return results.map(row => ({
      ...row,
      pago: Boolean(row.pago)
    }));
  }

  // --- Dashboard Aggregations ---

  async getPendingReceivablesTotal(): Promise<number> {
    const db = await getDb();
    const results = await db.select<{total: number}[]>(
      'SELECT SUM(valor) as total FROM contas_receber WHERE pago = 0'
    );
    return results[0]?.total || 0;
  }

  // For this demo, let's just get all payables that are equal or later than today
  async getUpcomingPayablesTotal(dateStr: string): Promise<number> {
    const db = await getDb();
    const results = await db.select<{total: number}[]>(
      "SELECT SUM(valor) as total FROM contas_pagar WHERE date(data_vencimento) >= date($1)",
      [dateStr]
    );
    return results[0]?.total || 0;
  }
}
