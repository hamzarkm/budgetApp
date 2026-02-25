import { useState, useEffect } from 'react';
import { Plus, Save, X, Pencil, Trash2, Check, CalendarClock } from 'lucide-react';
import { createPlanned, updatePlanned, deletePlanned, CATEGORIES, getCat } from '../api';

const inputClass = 'w-full bg-ctp-surface0 border border-ctp-surface1 rounded-xl px-3 py-2.5 text-sm text-ctp-text placeholder-ctp-overlay0 focus:outline-none focus:border-ctp-lavender transition-all duration-200';
const btnClass = 'flex items-center justify-center p-2.5 rounded-xl transition-all duration-200';

const MONTHS = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
];

function monthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export default function PlannedExpenses({ planned, currentMonth, onRefresh }) {
  const [form, setForm] = useState({ name: '', amount: '', category: '', date: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (editing) {
      setForm({ name: editing.name, amount: String(editing.amount), category: editing.category, date: editing.date });
    } else {
      setForm({ name: '', amount: '', category: '', date: currentMonth + '-01' });
    }
  }, [editing, currentMonth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name: form.name, amount: parseFloat(form.amount), category: form.category, date: form.date };
    if (editing) {
      await updatePlanned(editing.id, data);
      setEditing(null);
    } else {
      await createPlanned(data);
    }
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

  const totalPlanned = planned.reduce((s, p) => s + p.amount, 0);
  const doneCount = planned.filter(p => p.done).length;

  return (
    <div className="space-y-6 animate-in">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarClock size={16} className="text-ctp-peach" />
            <h3 className="text-sm font-medium text-ctp-subtext0">Depenses prevues - {monthLabel(currentMonth)}</h3>
          </div>
          <span className="text-sm font-bold text-ctp-peach">-{totalPlanned.toFixed(2)} EUR</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_1fr_130px_auto] gap-2 mb-5">
          <input placeholder="Description" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} required />
          <input type="number" step="0.01" min="0" placeholder="Montant" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className={inputClass} required />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass} required>
            <option value="">Categorie...</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} required />
          <div className="flex gap-1">
            <button type="submit" className={`${btnClass} bg-ctp-peach/20 text-ctp-peach hover:bg-ctp-peach/30`}>
              {editing ? <Save size={15} /> : <Plus size={15} />}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className={`${btnClass} bg-ctp-surface0 text-ctp-overlay1 hover:bg-ctp-surface1`}>
                <X size={15} />
              </button>
            )}
          </div>
        </form>

        {planned.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-ctp-overlay0">Aucune depense prevue pour {monthLabel(currentMonth)}</p>
            <p className="text-xs text-ctp-surface2 mt-1">Anticipez vos depenses pour mieux gerer votre budget</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-ctp-surface0/50">
              {planned.map(item => {
                const cat = getCat(item.category);
                const d = new Date(item.date + 'T00:00:00');
                const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

                return (
                  <div key={item.id} className={`flex items-center gap-3 py-3.5 transition-all duration-200 ${item.done ? 'opacity-60' : ''}`}>
                    <button
                      onClick={() => toggleDone(item)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                        item.done
                          ? 'bg-ctp-green border-ctp-green'
                          : 'border-ctp-surface2 hover:border-ctp-overlay0'
                      }`}
                    >
                      {item.done && <Check size={11} className="text-ctp-crust" strokeWidth={3} />}
                    </button>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className={`flex-1 text-sm font-medium truncate ${item.done ? 'line-through text-ctp-overlay0' : 'text-ctp-text'}`}>
                      {item.name}
                    </span>
                    <span className="text-xs text-ctp-overlay0 hidden sm:inline">{cat.name}</span>
                    <span className="text-xs text-ctp-overlay0">{dateStr}</span>
                    <span className="text-sm tabular-nums font-semibold text-ctp-text">{item.amount.toFixed(2)} EUR</span>
                    <div className="flex gap-0.5">
                      <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-ctp-surface0 text-ctp-overlay0 hover:text-ctp-blue transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-ctp-surface0 text-ctp-overlay0 hover:text-ctp-red transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-ctp-surface0/50">
              <span className="text-xs text-ctp-overlay0">
                {doneCount}/{planned.length} payee{doneCount > 1 ? 's' : ''}
              </span>
              <span className="text-sm font-semibold text-ctp-peach">
                Impact : -{totalPlanned.toFixed(2)} EUR sur le reste a vivre
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
