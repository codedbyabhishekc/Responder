import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getDb } from './db.js';
dotenv.config();

export function makeToken(u) {
  return jwt.sign(
    { id: u.id, email: u.email, username: u.username, role: u.role, name: u.name },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function login(email, password) {
  const db = getDb();
  const u = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email);
  if (!u) return null;
  const ok = bcrypt.compareSync(password, u.password_hash);
  if (!ok) return null;
  return { token: makeToken(u), user: { id: u.id, email: u.email, username: u.username, role: u.role, name: u.name } };
}
