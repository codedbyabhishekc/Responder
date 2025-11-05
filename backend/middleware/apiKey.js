import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';

export function requireValidApiKeyForOwner(ownerId) {
  return (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (!key) return res.status(401).json({ error: 'x-api-key required' });
    const db = getDb();
    const owner = db.prepare('SELECT api_key_hash FROM users WHERE id = ? AND active = 1')
      .get(ownerId);
    if (!owner || !owner.api_key_hash) return res.status(401).json({ error: 'API key not set' });
    const ok = bcrypt.compareSync(key, owner.api_key_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid API key' });
    next();
  };
}
