import { getDb } from '../database/connection';
import { Produto } from '../types/database';

export class ProdutoRepository {
  async create(produto: Omit<Produto, 'id'>): Promise<number> {
    const db = await getDb();
    const result = await db.execute(
      'INSERT INTO produto (categoria_id, descricao, estoque, valor, movimenta_estoque) VALUES ($1, $2, $3, $4, $5)',
      [produto.categoria_id, produto.descricao, produto.estoque, produto.valor, produto.movimenta_estoque ? 1 : 0]
    );
    return result.lastInsertId ?? 0;
  }

  async update(id: number, produto: Partial<Produto>): Promise<void> {
    const db = await getDb();
    
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (produto.categoria_id !== undefined) {
      updates.push(`categoria_id = $${idx++}`);
      values.push(produto.categoria_id);
    }
    if (produto.descricao !== undefined) {
      updates.push(`descricao = $${idx++}`);
      values.push(produto.descricao);
    }
    if (produto.estoque !== undefined) {
      updates.push(`estoque = $${idx++}`);
      values.push(produto.estoque);
    }
    if (produto.valor !== undefined) {
      updates.push(`valor = $${idx++}`);
      values.push(produto.valor);
    }
    if (produto.movimenta_estoque !== undefined) {
      updates.push(`movimenta_estoque = $${idx++}`);
      values.push(produto.movimenta_estoque ? 1 : 0);
    }

    if (updates.length === 0) return;

    values.push(id);
    const query = `UPDATE produto SET ${updates.join(', ')} WHERE id = $${idx}`;
    
    await db.execute(query, values);
  }

  async updateEstoque(id: number, change: number): Promise<void> {
    const db = await getDb();
    // Ensures atomic update at the DB level
    await db.execute('UPDATE produto SET estoque = estoque + $1 WHERE id = $2 AND movimenta_estoque = 1', [change, id]);
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.execute('DELETE FROM produto WHERE id = $1', [id]);
  }

  async findById(id: number): Promise<Produto | null> {
    const db = await getDb();
    const results = await db.select<Produto[]>('SELECT * FROM produto WHERE id = $1', [id]);
    if (results.length > 0) {
      return {
        ...results[0],
        movimenta_estoque: Boolean(results[0].movimenta_estoque)
      };
    }
    return null;
  }

  async list(): Promise<Produto[]> {
    const db = await getDb();
    const results = await db.select<Produto[]>('SELECT * FROM produto');
    return results.map(row => ({
      ...row,
      movimenta_estoque: Boolean(row.movimenta_estoque)
    }));
  }

  async getLowStock(limit: number): Promise<Produto[]> {
    const db = await getDb();
    const results = await db.select<Produto[]>(
      'SELECT * FROM produto WHERE movimenta_estoque = 1 AND estoque <= $1 ORDER BY estoque ASC',
      [limit]
    );
    return results.map(row => ({
      ...row,
      movimenta_estoque: Boolean(row.movimenta_estoque)
    }));
  }
}
