async function get(url) { return (await fetch(url)).json(); }
async function post(url, data) { return (await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })).json(); }
async function put(url, data) { return (await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })).json(); }
async function del(url) { await fetch(url, { method: 'DELETE' }); }

export const getIncomes = () => get('/api/incomes');
export const createIncome = (d) => post('/api/incomes', d);
export const updateIncome = (id, d) => put(`/api/incomes/${id}`, d);
export const deleteIncome = (id) => del(`/api/incomes/${id}`);

export const getCharges = () => get('/api/charges');
export const createCharge = (d) => post('/api/charges', d);
export const updateCharge = (id, d) => put(`/api/charges/${id}`, d);
export const deleteCharge = (id) => del(`/api/charges/${id}`);

export const getPlanned = (month) => get(`/api/planned?month=${month}`);
export const createPlanned = (d) => post('/api/planned', d);
export const updatePlanned = (id, d) => put(`/api/planned/${id}`, d);
export const deletePlanned = (id) => del(`/api/planned/${id}`);

export const getSettings = () => get('/api/settings');

export const CATEGORIES = [
  { id: 'logement', name: 'Logement', icon: 'home', color: '#fab387' },
  { id: 'abonnements', name: 'Abonnements', icon: 'smartphone', color: '#94e2d5' },
  { id: 'assurance', name: 'Assurance', icon: 'shield', color: '#89b4fa' },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#74c7ec' },
  { id: 'alimentation', name: 'Alimentation', icon: 'shopping-cart', color: '#a6e3a1' },
  { id: 'sante', name: 'Sante', icon: 'heart-pulse', color: '#f38ba8' },
  { id: 'loisirs', name: 'Loisirs', icon: 'gamepad-2', color: '#cba6f7' },
  { id: 'epargne', name: 'Epargne', icon: 'piggy-bank', color: '#f9e2af' },
  { id: 'autre', name: 'Autre', icon: 'circle-dot', color: '#9399b2' },
];

export const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES.at(-1);
