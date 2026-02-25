import { JSONFilePreset } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultData = {
  incomes: [
    { id: 1, name: 'Salaire', amount: 2500, dayOfMonth: 28, active: true },
  ],
  charges: [
    { id: 1, name: 'Loyer', amount: 750, category: 'logement', dayOfMonth: 1, active: true },
    { id: 2, name: 'EDF', amount: 65, category: 'logement', dayOfMonth: 5, active: true },
    { id: 3, name: 'Internet Free', amount: 29.99, category: 'abonnements', dayOfMonth: 8, active: true },
    { id: 4, name: 'Netflix', amount: 13.49, category: 'abonnements', dayOfMonth: 10, active: true },
    { id: 5, name: 'Assurance auto', amount: 45, category: 'assurance', dayOfMonth: 15, active: true },
    { id: 6, name: 'Forfait mobile', amount: 19.99, category: 'abonnements', dayOfMonth: 12, active: true },
    { id: 7, name: 'Mutuelle', amount: 55, category: 'sante', dayOfMonth: 3, active: true },
  ],
  planned: [
    { id: 1, name: 'Dentiste', amount: 55, category: 'sante', date: '2026-02-18', done: false },
    { id: 2, name: 'Cadeau anniversaire', amount: 80, category: 'autre', date: '2026-02-22', done: false },
  ],
  settings: { alertThreshold: 300 },
  nextIncomeId: 2,
  nextChargeId: 8,
  nextPlannedId: 3,
};

const db = await JSONFilePreset(join(__dirname, 'db.json'), defaultData);

export default db;
