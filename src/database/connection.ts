import Database from '@tauri-apps/plugin-sql';
import { schema } from './schema';

const DB_PATH = 'sqlite:lounge.db';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load(DB_PATH);
  }
  return dbInstance;
}

export async function initDatabase() {
  try {
    const db = await getDb();

    // Enable foreign key enforcement
    await db.execute('PRAGMA foreign_keys = ON');

    // Split schema into individual executable statements, filtering empty ones
    const statements = schema
      .split(/;/)
      .map(s => s.replace(/--.*$/gm, '').trim())  // remove SQL comments then trim
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await db.execute(statement + ';');
    }

    console.log('Database initialized successfully');
  } catch (error: unknown) {
    console.error('Failed to initialize database:', error);
    // tauri-plugin-sql throws string errors sometimes, not Error objects
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(msg);
  }
}
