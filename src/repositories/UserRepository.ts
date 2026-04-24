import { getDb } from '../database/connection';
import { User } from '../types/database';

export class UserRepository {
  async create(user: Omit<User, 'id'>): Promise<number> {
    const db = await getDb();
    const result = await db.execute(
      'INSERT INTO users (name, username, password, is_admin) VALUES ($1, $2, $3, $4)',
      [user.name, user.username, user.password, user.is_admin ? 1 : 0]
    );
    return result.lastInsertId ?? 0;
  }

  async update(id: number, user: Partial<User>): Promise<void> {
    const db = await getDb();
    
    // Simplistic update builder
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (user.name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(user.name);
    }
    if (user.username !== undefined) {
      updates.push(`username = $${idx++}`);
      values.push(user.username);
    }
    if (user.password !== undefined) {
      updates.push(`password = $${idx++}`);
      values.push(user.password);
    }
    if (user.is_admin !== undefined) {
      updates.push(`is_admin = $${idx++}`);
      values.push(user.is_admin ? 1 : 0);
    }

    if (updates.length === 0) return;

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`;
    
    await db.execute(query, values);
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.execute('DELETE FROM users WHERE id = $1', [id]);
  }

  async findById(id: number): Promise<User | null> {
    const db = await getDb();
    const results = await db.select<User[]>('SELECT * FROM users WHERE id = $1', [id]);
    if (results.length > 0) {
      return {
        ...results[0],
        is_admin: Boolean(results[0].is_admin)
      };
    }
    return null;
  }
  
  async findByUsername(username: string): Promise<User | null> {
    const db = await getDb();
    const results = await db.select<User[]>('SELECT * FROM users WHERE username = $1', [username]);
    if (results.length > 0) {
      return {
        ...results[0],
        is_admin: Boolean(results[0].is_admin)
      };
    }
    return null;
  }

  async list(): Promise<User[]> {
    const db = await getDb();
    const results = await db.select<User[]>('SELECT * FROM users');
    return results.map(row => ({
      ...row,
      is_admin: Boolean(row.is_admin)
    }));
  }
}
