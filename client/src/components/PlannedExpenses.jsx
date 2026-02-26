import { useState, useEffect } from 'react';
import { Plus, Save, X, Pencil, Trash2, Check, CalendarClock, Copy } from 'lucide-react';
import { createPlanned, updatePlanned, deletePlanned, copyPlanned, CATEGORIES, getCat } from '../api';

const MONTHS = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
];

function monthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

function prevMonth(month) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function PlannedExpenses({ planned, currentMonth, onRefresh, currency = 'EUR' }) {
  const [form, setForm] = useState({ name: '', amount: '', category: '', date: '' });
  const [editing, setEditing] = useState(null);
  const [showCopy, setShowCopy] = useState(false);
  const [copyFrom, setCopyFrom] = useState(prevMonth(currentMonth));
  const [copyMsg, setCopyMsg] = useState('');

  useEffect(() => {
    if (editing) setForm({ name: editing.name, amount: String(editing.amount), category: editing.category, date: editing.date });
    else setForm({ name: '', amount: '', category: '', date: currentMonth + '-01' });
  }, [editing, currentMonth]);

  useEffect(() => { setCopyFrom(prevMonth(currentMonth)); }, [currentMonth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name: form.name, amount: parseFloat(form.amount), category: form.category, date: form.date };
    if (editing) { await updatePlanned(editing.id, data); setEditing(null); }
    else await createPlanned(data);
    onRefresh();
  };

  const toggleDone = async (item) => {
    await updatePlanned(item.id, { done: !item.done });
    onRefresh();
  };

  const handleDelete = async (id) => {
    await deletePlanned(id);
    if (editing?.id === id) setEditing(null);
    onRefresh();
  };

  const handleCopy = async () => {
    const result = await copyPlanned(copyFrom, currentMonth);
    setCopyMsg(`${result.copied} depense${result.copied > 1 ? 's' : ''} copiee${result.copied > 1 ? 's' : ''}`);
    setShowCopy(false);
    onRefresh();
    setTimeout(() => setCopyMsg(''), 3000);
  };

  const totalPlanned = planned.reduce((s, p) => s + p.amount, 0);
  const doneCount = planned.filter(p => p.done).length;

  const copyMonthOptions = [];
  const [cy, cm] = currentMonth.split('-').map(Number);
  for (let i = 1; i <= 6; i++) {
    const d = new Date(cy, cm - 1 - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    copyMonthOptions.push({ value: val, label: monthLabel(val) });
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--icon-orange-bg)' }}>
              <CalendarClock size={15} className="text-accent-orange" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Depenses prevues - {monthLabel(currentMonth)}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCopy(!showCopy)} className="px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary text-xs font-medium transition-colors flex items-center gap-1.5">
              <Copy size={12} />
              Copier depuis...
            </button>
            <span className="text-sm font-bold text-accent-orange">-{totalPlanned.toFixed(2)} {currency}</span>
          </div>
        </div>

        {showCopy && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl border border-border bg-bg-primary">
            <span className="text-xs text-text-secondary">Copier les depenses de :</span>
            <select value={copyFrom} onChange={e => setCopyFrom(e.target.value)} className="input-field w-auto text-xs py-1.5 px-3">
              {copyMonthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={handleCopy} className="btn-gradient px-3 py-1.5 text-xs">Copier</button>
            <button onClick={() => setShowCopy(false)} className="p-1.5 text-text-muted hover:text-text-primary"><X size={14} /></button>
          </div>
        )}

        {copyMsg && (
          <div className="mb-4 p-2.5 rounded-xl text-xs font-medium text-accent-green" style={{ background: 'var(--icon-green-bg)' }}>
            {copyMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_1fr_130px_auto] gap-2 mb-5">
          <input placeholder="Description" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
          <input type="number" step="0.01" min="0" placeholder="Montant" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-field" required />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field" required>
            <option value="">Categorie...</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field" required />
          <div className="flex gap-1.5">
            <button type="submit" className="btn-gradient px-4 py-2.5 flex items-center gap-1.5 text-sm">
              {editing ? <Save size={14} /> : <Plus size={14} />}
              {editing ? 'Modifier' : 'Ajouter'}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className="p-2.5 rounded-xl bg-bg-input border border-border text-text-muted hover:text-text-primary transition-all">
                <X size={15} />
              </button>
            )}
          </div>
        </form>

        {planned.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-text-muted">Aucune depense prevue pour {monthLabel(currentMonth)}</p>
            <p className="text-xs text-text-muted mt-1 opacity-60">Anticipez vos depenses pour mieux gerer votre budget</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {planned.map(item => {
                const cat = getCat(item.category);
                const d = new Date(item.date + 'T00:00:00');
                const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                return (
                  <div key={item.id} className={`flex items-center gap-3 py-3.5 transition-all duration-200 ${item.done ? 'opacity-50' : ''}`}>
                    <button onClick={() => toggleDone(item)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${item.done ? 'bg-accent-green border-accent-green' : 'border-border hover:border-text-muted'}`}>
                      {item.done && <Check size={11} className="text-white" strokeWidth={3} />}
                    </button>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className={`flex-1 text-sm font-medium truncate ${item.done ? 'line-through text-text-muted' : 'text-text-primary'}`}>{item.name}</span>
                    <span className="text-xs text-text-muted hidden sm:inline">{cat.name}</span>
                    <span className="text-xs text-text-muted">{dateStr}</span>
                    <span className="text-sm tabular-nums font-semibold text-text-primary">{item.amount.toFixed(2)} {currency}</span>
                    <div className="flex gap-0.5">
                      <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-accent-blue transition-colors"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-accent-red transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
              <span className="text-xs text-text-muted">{doneCount}/{planned.length} payee{doneCount > 1 ? 's' : ''}</span>
              <span className="text-sm font-semibold text-accent-orange">Impact : -{totalPlanned.toFixed(2)} {currency} sur le reste a vivre</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
