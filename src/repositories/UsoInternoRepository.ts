import { getDb } from '../database/connection';
import { UsoInterno, UsoInternoItem } from '../types/database';

export class UsoInternoRepository {
  async createUsoInterno(uso: Omit<UsoInterno, 'id' | 'data'>): Promise<number> {
    const db = await getDb();
    const result = await db.execute(
      'INSERT INTO uso_interno (valor_total) VALUES ($1)',
      [uso.valor_total]
    );
    return result.lastInsertId ?? 0;
  }

  async createUsoInternoItem(item: Omit<UsoInternoItem, 'id'>): Promise<number> {
    const db = await getDb();
    const result = await db.execute(
      'INSERT INTO uso_interno_item (uso_interno_id, produto_id, valor_unitario, valor_total, quantidade) VALUES ($1, $2, $3, $4, $5)',
      [item.uso_interno_id, item.produto_id, item.valor_unitario, item.valor_total, item.quantidade]
    );
    return result.lastInsertId ?? 0;
  }


  async findUsoInternoById(id: number): Promise<UsoInterno | null> {
    const db = await getDb();
    const results = await db.select<UsoInterno[]>('SELECT * FROM uso_interno WHERE id = $1', [id]);
    if (results.length > 0) {
      return results[0];
    }
    return null;
  }

  async listUsosInternos(): Promise<UsoInterno[]> {
    const db = await getDb();
    return await db.select<UsoInterno[]>('SELECT * FROM uso_interno ORDER BY data DESC');
  }

  async listUsoInternoItems(uso_interno_id: number): Promise<UsoInternoItem[]> {
    const db = await getDb();
    return await db.select<UsoInternoItem[]>('SELECT * FROM uso_interno_item WHERE uso_interno_id = $1', [uso_interno_id]);
  }
}
