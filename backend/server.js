import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Ajv from 'ajv';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

import { getDb } from './db.js';
import { auth } from './middleware/auth.js';
import { adminOnly } from './middleware/adminOnly.js';
import { login as doLogin } from './auth.js';

dotenv.config();
const app = express();
const ajv = new Ajv({ allErrors: true, strict: false });

const allowed = (process.env.CORS_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors(allowed.length ? { origin: allowed, credentials: false } : {}));
app.use(express.json({ limit: '2mb' }));

// ---- Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const result = doLogin(email, password);
  if (!result) return res.status(401).json({ error: 'Invalid credentials' });
  res.json(result);
});

app.get('/api/me', auth, (req, res) => res.json(req.user));

app.post('/api/me/api-key', auth, (req, res) => {
  const db = getDb();
  const plainKey = `mk_${nanoid(24)}`;
  const hash = bcrypt.hashSync(plainKey, 10);
  db.prepare('UPDATE users SET api_key_hash = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ apiKey: plainKey });
});

// ---- Users (admin)
app.post('/api/users', auth, adminOnly, (req, res) => {
  const { email, username, name, password, role = 'user' } = req.body || {};
  if (!email || !username || !name || !password) return res.status(400).json({ error: 'Missing fields' });
  const db = getDb();
  const hash = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare(
      'INSERT INTO users (email, username, name, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(email, username, name, hash, role);
    res.json({ id: info.lastInsertRowid, email, username, name, role });
  } catch (e) {
    res.status(400).json({ error: 'Email or username already exists' });
  }
});

app.patch('/api/users/:id/revoke', auth, adminOnly, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE users SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---- Endpoints (CRUD)
app.get('/api/endpoints', auth, (req, res) => {
  const db = getDb();
  const mine = db.prepare('SELECT * FROM endpoints WHERE owner_id = ? ORDER BY created_at DESC')
                 .all(req.user.id);
  const pub = db.prepare(`
    SELECT e.*, u.username AS owner_name
      FROM endpoints e
      JOIN users u ON u.id = e.owner_id
     WHERE e.is_public = 1
     ORDER BY e.created_at DESC
  `).all();
  res.json({ mine, public: pub });
});

app.post('/api/endpoints', auth, (req, res) => {
  const {
    name, slug, method = 'GET',
    response_json, is_public = true,
    response_schema, validate_with_schema = false
  } = req.body || {};

  if (!name || !slug || !response_json) return res.status(400).json({ error: 'Missing fields' });
  if (!['GET','POST'].includes(method)) return res.status(400).json({ error: 'Invalid method' });

  let parsedResponse;
  try { parsedResponse = JSON.parse(response_json); }
  catch { return res.status(400).json({ error: 'response_json must be valid JSON' }); }

  let schemaString = null;
  let validateFlag = !!validate_with_schema;

  if (response_schema) {
    try {
      const schemaObj = JSON.parse(response_schema);
      schemaString = JSON.stringify(schemaObj);
      if (validateFlag) {
        const validate = ajv.compile(schemaObj);
        const ok = validate(parsedResponse);
        if (!ok) return res.status(400).json({ error: 'response_json does not match response_schema', details: validate.errors });
      }
    } catch {
      return res.status(400).json({ error: 'response_schema must be valid JSON' });
    }
  } else {
    validateFlag = false;
  }

  const db = getDb();
  try {
    const info = db.prepare(`
      INSERT INTO endpoints (owner_id, name, slug, method, response_json, is_public, response_schema, validate_with_schema)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id, name, slug, method,
      JSON.stringify(parsedResponse),
      is_public ? 1 : 0,
      schemaString,
      validateFlag ? 1 : 0
    );
    res.json({ id: info.lastInsertRowid });
  } catch {
    res.status(400).json({ error: 'Slug already exists for this owner' });
  }
});

app.put('/api/endpoints/:id', auth, (req, res) => {
  const { name, method, response_json, is_public, response_schema, validate_with_schema } = req.body || {};
  const db = getDb();
  const ep = db.prepare('SELECT * FROM endpoints WHERE id = ? AND owner_id = ?')
               .get(req.params.id, req.user.id);
  if (!ep) return res.status(404).json({ error: 'Not found' });

  let newResponse = ep.response_json;
  let newSchema   = ep.response_schema;
  let newValidate = ep.validate_with_schema;

  if (response_json !== undefined) {
    try { newResponse = JSON.stringify(JSON.parse(response_json)); }
    catch { return res.status(400).json({ error: 'response_json must be valid JSON' }); }
  }
  if (response_schema !== undefined) {
    if (!response_schema) { newSchema = null; newValidate = 0; }
    else {
      try { newSchema = JSON.stringify(JSON.parse(response_schema)); }
      catch { return res.status(400).json({ error: 'response_schema must be valid JSON' }); }
    }
  }
  if (validate_with_schema !== undefined) newValidate = validate_with_schema ? 1 : 0;

  if (newValidate && newSchema) {
    const validate = ajv.compile(JSON.parse(newSchema));
    const ok = validate(JSON.parse(newResponse));
    if (!ok) return res.status(400).json({ error: 'response_json does not match response_schema', details: validate.errors });
  }

  db.prepare(`
    UPDATE endpoints
       SET name = COALESCE(?, name),
           method = COALESCE(?, method),
           response_json = ?,
           is_public = COALESCE(?, is_public),
           response_schema = ?,
           validate_with_schema = ?
     WHERE id = ?
  `).run(
    name ?? null,
    method ?? null,
    newResponse,
    (is_public === undefined ? null : (is_public ? 1 : 0)),
    newSchema,
    newValidate,
    req.params.id
  );
  res.json({ ok: true });
});

app.delete('/api/endpoints/:id', auth, (req, res) => {
  const db = getDb();
  const info = db.prepare('DELETE FROM endpoints WHERE id = ? AND owner_id = ?')
                 .run(req.params.id, req.user.id);
  res.json({ deleted: info.changes > 0 });
});

// ---- Runtime endpoint (public/private) under /responder/:username/:slug
app.all('/responder/:owner/:slug', async (req, res) => {
  const db = getDb();

  const owner = db.prepare(`
    SELECT id, username, api_key_hash FROM users
    WHERE active = 1 AND (username = ? OR CAST(id AS TEXT) = ?)
  `).get(req.params.owner, req.params.owner);
  if (!owner) return res.status(404).json({ error: 'Owner not found' });

  const ep = db.prepare(\`SELECT * FROM endpoints WHERE owner_id = ? AND slug = ?\`)
               .get(owner.id, req.params.slug);
  if (!ep) return res.status(404).json({ error: 'Endpoint not found' });
  if (ep.method !== req.method) return res.status(405).json({ error: \`Use \${ep.method}\` });

  if (!ep.is_public) {
    const key = req.headers['x-api-key'];
    if (!key) return res.status(401).json({ error: 'x-api-key required' });
    const ok = owner.api_key_hash && bcrypt.compareSync(key, owner.api_key_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid API key' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(ep.response_json);
});

// ---- Start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Responder API on http://localhost:${PORT}`));
