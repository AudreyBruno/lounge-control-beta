import { getDb } from '../database/connection';
import { Cliente } from '../types/database';

export class ClienteRepository {
  async create(cliente: Omit<Cliente, 'id'>): Promise<number> {
    const db = await getDb();
    const result = await db.execute(
      'INSERT INTO clientes (nome, numero, status, permite_venda_prazo) VALUES ($1, $2, $3, $4)',
      [cliente.nome, cliente.numero, cliente.status ? 1 : 0, cliente.permite_venda_prazo ? 1 : 0]
    );
    return result.lastInsertId ?? 0;
  }

  async update(id: number, cliente: Partial<Cliente>): Promise<void> {
    const db = await getDb();
    
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (cliente.nome !== undefined) {
      updates.push(`nome = $${idx++}`);
      values.push(cliente.nome);
    }
    if (cliente.numero !== undefined) {
      updates.push(`numero = $${idx++}`);
      values.push(cliente.numero);
    }
    if (cliente.status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(cliente.status ? 1 : 0);
    }
    if (cliente.permite_venda_prazo !== undefined) {
      updates.push(`permite_venda_prazo = $${idx++}`);
      values.push(cliente.permite_venda_prazo ? 1 : 0);
    }

    if (updates.length === 0) return;

    values.push(id);
    const query = `UPDATE clientes SET ${updates.join(', ')} WHERE id = $${idx}`;
    
    await db.execute(query, values);
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.execute('DELETE FROM clientes WHERE id = $1', [id]);
  }

  async findById(id: number): Promise<Cliente | null> {
    const db = await getDb();
    const results = await db.select<Cliente[]>('SELECT * FROM clientes WHERE id = $1', [id]);
    if (results.length > 0) {
      return {
        ...results[0],
        status: Boolean(results[0].status),
        permite_venda_prazo: Boolean(results[0].permite_venda_prazo)
      };
    }
    return null;
  }

  async list(): Promise<Cliente[]> {
    const db = await getDb();
    const results = await db.select<Cliente[]>('SELECT * FROM clientes');
    return results.map(row => ({
      ...row,
      status: Boolean(row.status),
      permite_venda_prazo: Boolean(row.permite_venda_prazo)
    }));
  }
}
