import { getDb } from '../database/connection';
import { Venda, VendaItem } from '../types/database';

export class VendaRepository {
  async createVenda(venda: Omit<Venda, 'id' | 'data'>): Promise<number> {
    const db = await getDb();
    const result = await db.execute(
      'INSERT INTO venda (cliente_id, valor_total, valor_pago, pago) VALUES ($1, $2, $3, $4)',
      [venda.cliente_id, venda.valor_total, venda.valor_pago, venda.pago ? 1 : 0]
    );
    return result.lastInsertId ?? 0;
  }

  async createVendaItem(item: Omit<VendaItem, 'id'>): Promise<number> {
    const db = await getDb();
    const result = await db.execute(
      'INSERT INTO venda_item (venda_id, produto_id, valor_unitario, valor_total, quantidade) VALUES ($1, $2, $3, $4, $5)',
      [item.venda_id, item.produto_id, item.valor_unitario, item.valor_total, item.quantidade]
    );
    return result.lastInsertId ?? 0;
  }

  async findVendaById(id: number): Promise<Venda | null> {
    const db = await getDb();
    const results = await db.select<Venda[]>('SELECT * FROM venda WHERE id = $1', [id]);
    if (results.length > 0) {
      return {
        ...results[0],
        pago: Boolean(results[0].pago)
      };
    }
    return null;
  }

  async listVendas(): Promise<Venda[]> {
    const db = await getDb();
    const results = await db.select<Venda[]>('SELECT * FROM venda ORDER BY data DESC');
    return results.map(row => ({
      ...row,
      pago: Boolean(row.pago)
    }));
  }

  async listVendaItems(venda_id: number): Promise<VendaItem[]> {
    const db = await getDb();
    return await db.select<VendaItem[]>('SELECT * FROM venda_item WHERE venda_id = $1', [venda_id]);
  }

  async getSalesTotalByDate(dateStr: string): Promise<number> {
    const db = await getDb();
    // Assuming dateStr is 'YYYY-MM-DD'
    const results = await db.select<{total: number}[]>(
      "SELECT SUM(valor_total) as total FROM venda WHERE date(data) = date($1)", 
      [dateStr]
    );
    return results[0]?.total || 0;
  }
}
