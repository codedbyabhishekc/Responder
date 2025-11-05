import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dir, 'data.sqlite');
const db = new Database(dbPath);

export function getDb() { return db; }

if (process.argv.includes('--init')) {
  const schemaFile = path.join(__dir, 'schema.sql');
  const schema = fs.readFileSync(schemaFile, 'utf-8');
  db.exec(schema);

  // Seed admin (admin/admin123) if not exists
  const bcrypt = await import('bcryptjs');
  const existing = db.prepare('SELECT 1 FROM users WHERE email = ?').get('admin@example.com');
  if (!existing) {
    const hash = bcrypt.default.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (email, username, name, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin@example.com', 'admin', 'Admin', hash, 'admin');
    console.log('DB initialized: admin@example.com / admin123 (username: admin)');
  }
}
