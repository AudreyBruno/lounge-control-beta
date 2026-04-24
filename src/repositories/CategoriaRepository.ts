import { getDb } from '../database/connection';
import { Categoria } from '../types/database';

export class CategoriaRepository {
  async create(categoria: Omit<Categoria, 'id'>): Promise<number> {
    const db = await getDb();
    const result = await db.execute(
      'INSERT INTO categoria (nome, status) VALUES ($1, $2)',
      [categoria.nome, categoria.status ? 1 : 0]
    );
    return result.lastInsertId ?? 0;
  }

  async update(id: number, categoria: Partial<Categoria>): Promise<void> {
    const db = await getDb();
    
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (categoria.nome !== undefined) {
      updates.push(`nome = $${idx++}`);
      values.push(categoria.nome);
    }
    if (categoria.status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(categoria.status ? 1 : 0);
    }

    if (updates.length === 0) return;

    values.push(id);
    const query = `UPDATE categoria SET ${updates.join(', ')} WHERE id = $${idx}`;
    
    await db.execute(query, values);
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.execute('DELETE FROM categoria WHERE id = $1', [id]);
  }

  async findById(id: number): Promise<Categoria | null> {
    const db = await getDb();
    const results = await db.select<Categoria[]>('SELECT * FROM categoria WHERE id = $1', [id]);
    if (results.length > 0) {
      return {
        ...results[0],
        status: Boolean(results[0].status)
      };
    }
    return null;
  }

  async list(): Promise<Categoria[]> {
    const db = await getDb();
    const results = await db.select<Categoria[]>('SELECT * FROM categoria');
    return results.map(row => ({
      ...row,
      status: Boolean(row.status)
    }));
  }
}
