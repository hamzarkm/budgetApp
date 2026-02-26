import { useState, useEffect } from 'react';
import { Plus, Save, X, Pencil, Trash2, PiggyBank } from 'lucide-react';
import { createSaving, updateSaving, deleteSaving } from '../api';

export default function SavingsGoals({ savings, onRefresh, currency = 'EUR' }) {
  const [form, setForm] = useState({ name: '', target: '', monthly: '', saved: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (editing) setForm({ name: editing.name, target: String(editing.target), monthly: String(editing.monthly), saved: String(editing.saved || 0) });
    else setForm({ name: '', target: '', monthly: '', saved: '' });
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name: form.name, target: parseFloat(form.target), monthly: parseFloat(form.monthly), saved: parseFloat(form.saved || 0) };
    if (editing) { await updateSaving(editing.id, data); setEditing(null); }
    else await createSaving(data);
    onRefresh();
  };

  const totalMonthly = savings.reduce((s, g) => s + g.monthly, 0);

  return (
    <div className="space-y-6 animate-in">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--icon-green-bg)' }}>
              <PiggyBank size={15} className="text-accent-green" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Objectifs d'epargne</h3>
          </div>
          <span className="text-sm font-bold text-accent-green">-{totalMonthly.toFixed(2)} {currency}/mois</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_100px_auto] gap-2 mb-5">
          <input placeholder="Nom de l'objectif" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
          <input type="number" step="0.01" min="0" placeholder="Cible" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="input-field" required />
          <input type="number" step="0.01" min="0" placeholder="Par mois" value={form.monthly} onChange={e => setForm({ ...form, monthly: e.target.value })} className="input-field" required />
          <input type="number" step="0.01" min="0" placeholder="Deja epargne" value={form.saved} onChange={e => setForm({ ...form, saved: e.target.value })} className="input-field" />
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

        {savings.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-text-muted">Aucun objectif d'epargne</p>
            <p className="text-xs text-text-muted mt-1 opacity-60">Definissez vos objectifs pour mieux epargner</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savings.map(item => {
              const percent = item.target > 0 ? Math.min(100, (item.saved / item.target) * 100) : 0;
              const monthsLeft = item.monthly > 0 ? Math.ceil(Math.max(0, item.target - item.saved) / item.monthly) : Infinity;
              return (
                <div key={item.id} className="p-4 rounded-xl border border-border bg-bg-primary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">{item.name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-accent-blue transition-colors"><Pencil size={13} /></button>
                      <button onClick={async () => { await deleteSaving(item.id); if (editing?.id === item.id) setEditing(null); onRefresh(); }} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-accent-red transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-lg font-bold text-text-primary">{item.saved.toFixed(0)}</span>
                    <span className="text-sm text-text-muted">/ {item.target.toFixed(0)} {currency}</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-input overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-accent-green transition-all duration-500" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{percent.toFixed(0)}% atteint</span>
                    <span>{item.monthly.toFixed(0)} {currency}/mois{monthsLeft < Infinity ? ` · ${monthsLeft} mois restants` : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
