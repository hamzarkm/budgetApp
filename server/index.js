import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

function crud(path, collection, nextIdKey) {
  app.get(`/api/${path}`, (req, res) => {
    let items = db.data[collection];
    if (req.query.month) {
      items = items.filter(i => i.date?.startsWith(req.query.month));
    }
    res.json(items);
  });

  app.post(`/api/${path}`, async (req, res) => {
    const item = { id: db.data[nextIdKey]++, ...req.body };
    if (item.active === undefined && collection !== 'planned') item.active = true;
    if (item.done === undefined && collection === 'planned') item.done = false;
    db.data[collection].push(item);
    await db.write();
    res.status(201).json(item);
  });

  app.put(`/api/${path}/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    const idx = db.data[collection].findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    db.data[collection][idx] = { ...db.data[collection][idx], ...req.body };
    await db.write();
    res.json(db.data[collection][idx]);
  });

  app.delete(`/api/${path}/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    db.data[collection] = db.data[collection].filter(i => i.id !== id);
    await db.write();
    res.status(204).end();
  });
}

crud('incomes', 'incomes', 'nextIncomeId');
crud('charges', 'charges', 'nextChargeId');
crud('planned', 'planned', 'nextPlannedId');
crud('savings', 'savings', 'nextSavingId');

app.post('/api/planned/copy', async (req, res) => {
  const { fromMonth, toMonth } = req.body;
  const source = db.data.planned.filter(p => p.date?.startsWith(fromMonth));
  if (source.length === 0) return res.json({ copied: 0 });
  const copied = [];
  for (const p of source) {
    const newDate = toMonth + p.date.slice(7);
    const item = { id: db.data.nextPlannedId++, name: p.name, amount: p.amount, category: p.category, date: newDate, done: false };
    db.data.planned.push(item);
    copied.push(item);
  }
  await db.write();
  res.json({ copied: copied.length, items: copied });
});

app.get('/api/settings', (_req, res) => res.json(db.data.settings));
app.put('/api/settings', async (req, res) => {
  db.data.settings = { ...db.data.settings, ...req.body };
  await db.write();
  res.json(db.data.settings);
});

app.post('/api/reset', async (_req, res) => {
  db.data.incomes = [];
  db.data.charges = [];
  db.data.planned = [];
  db.data.savings = [];
  db.data.settings = { alertThreshold: 300, currency: 'EUR' };
  db.data.nextIncomeId = 1;
  db.data.nextChargeId = 1;
  db.data.nextPlannedId = 1;
  db.data.nextSavingId = 1;
  await db.write();
  res.json({ ok: true });
});

const distPath = join(__dirname, '../client/dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`MonBudget : http://localhost:${PORT}`));
