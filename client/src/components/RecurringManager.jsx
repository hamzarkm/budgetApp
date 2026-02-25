import { useState, useEffect } from 'react';
import { Plus, Save, X, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { createIncome, updateIncome, deleteIncome, createCharge, updateCharge, deleteCharge, CATEGORIES, getCat } from '../api';

function Toggle({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-[22px] rounded-full p-[2px] transition-colors duration-200 shrink-0 ${
        active ? 'bg-ctp-green' : 'bg-ctp-surface2'
      }`}
    >
      <div className={`w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
        active ? 'translate-x-[18px]' : 'translate-x-0'
      }`} />
    </button>
  );
}

const inputClass = 'w-full bg-ctp-surface0 border border-ctp-surface1 rounded-xl px-3 py-2.5 text-sm text-ctp-text placeholder-ctp-overlay0 focus:outline-none focus:border-ctp-lavender transition-all duration-200';
const btnClass = 'flex items-center justify-center p-2.5 rounded-xl transition-all duration-200';

export default function RecurringManager({ incomes, charges, onRefresh }) {
  const [incomeForm, setIncomeForm] = useState({ name: '', amount: '', dayOfMonth: '' });
  const [editingIncome, setEditingIncome] = useState(null);
  const [chargeForm, setChargeForm] = useState({ name: '', amount: '', category: '', dayOfMonth: '' });
  const [editingCharge, setEditingCharge] = useState(null);

  useEffect(() => {
    if (editingIncome) {
      setIncomeForm({ name: editingIncome.name, amount: String(editingIncome.amount), dayOfMonth: String(editingIncome.dayOfMonth) });
    } else {
      setIncomeForm({ name: '', amount: '', dayOfMonth: '' });
    }
  }, [editingIncome]);

  useEffect(() => {
    if (editingCharge) {
      setChargeForm({ name: editingCharge.name, amount: String(editingCharge.amount), category: editingCharge.category, dayOfMonth: String(editingCharge.dayOfMonth) });
    } else {
      setChargeForm({ name: '', amount: '', category: '', dayOfMonth: '' });
    }
  }, [editingCharge]);

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    const data = { name: incomeForm.name, amount: parseFloat(incomeForm.amount), dayOfMonth: parseInt(incomeForm.dayOfMonth) };
    if (editingIncome) {
      await updateIncome(editingIncome.id, data);
      setEditingIncome(null);
    } else {
      await createIncome(data);
    }
    onRefresh();
  };

  const handleChargeSubmit = async (e) => {
    e.preventDefault();
    const data = { name: chargeForm.name, amount: parseFloat(chargeForm.amount), category: chargeForm.category, dayOfMonth: parseInt(chargeForm.dayOfMonth) };
    if (editingCharge) {
      await updateCharge(editingCharge.id, data);
      setEditingCharge(null);
    } else {
      await createCharge(data);
    }
    onRefresh();
  };

  const totalIncomes = incomes.filter(i => i.active).reduce((s, i) => s + i.amount, 0);
  const totalCharges = charges.filter(c => c.active).reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-8 animate-in">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-ctp-green" />
            <h3 className="text-sm font-medium text-ctp-subtext0">Revenus mensuels</h3>
          </div>
          <span className="text-sm font-bold text-ctp-green">+{totalIncomes.toFixed(2)} EUR</span>
        </div>

        <form onSubmit={handleIncomeSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_80px_auto] gap-2 mb-5">
          <input placeholder="Nom du revenu" value={incomeForm.name} onChange={e => setIncomeForm({ ...incomeForm, name: e.target.value })} className={inputClass} required />
          <input type="number" step="0.01" min="0" placeholder="Montant" value={incomeForm.amount} onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })} className={inputClass} required />
          <input type="number" min="1" max="31" placeholder="Jour" value={incomeForm.dayOfMonth} onChange={e => setIncomeForm({ ...incomeForm, dayOfMonth: e.target.value })} className={inputClass} required />
          <div className="flex gap-1">
            <button type="submit" className={`${btnClass} bg-ctp-green/20 text-ctp-green hover:bg-ctp-green/30`}>
              {editingIncome ? <Save size={15} /> : <Plus size={15} />}
            </button>
            {editingIncome && (
              <button type="button" onClick={() => setEditingIncome(null)} className={`${btnClass} bg-ctp-surface0 text-ctp-overlay1 hover:bg-ctp-surface1`}>
                <X size={15} />
              </button>
            )}
          </div>
        </form>

        {incomes.length === 0 ? (
          <p className="text-sm text-ctp-overlay0 text-center py-4">Ajoutez votre premier revenu</p>
        ) : (
          <div className="divide-y divide-ctp-surface0/50">
            {incomes.map(item => (
              <div key={item.id} className={`flex items-center gap-3 py-3 transition-opacity duration-200 ${!item.active ? 'opacity-40' : ''}`}>
                <Toggle active={item.active} onClick={async () => { await updateIncome(item.id, { active: !item.active }); onRefresh(); }} />
                <span className="flex-1 text-sm font-medium text-ctp-text">{item.name}</span>
                <span className="text-sm tabular-nums text-ctp-text font-semibold">{item.amount.toFixed(2)} EUR</span>
                <span className="text-xs text-ctp-overlay0 w-12 text-right">Le {item.dayOfMonth}</span>
                <div className="flex gap-0.5">
                  <button onClick={() => setEditingIncome(item)} className="p-1.5 rounded-lg hover:bg-ctp-surface0 text-ctp-overlay0 hover:text-ctp-blue transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={async () => { await deleteIncome(item.id); if (editingIncome?.id === item.id) setEditingIncome(null); onRefresh(); }} className="p-1.5 rounded-lg hover:bg-ctp-surface0 text-ctp-overlay0 hover:text-ctp-red transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingDown size={16} className="text-ctp-red" />
            <h3 className="text-sm font-medium text-ctp-subtext0">Charges fixes</h3>
          </div>
          <span className="text-sm font-bold text-ctp-red">-{totalCharges.toFixed(2)} EUR</span>
        </div>

        <form onSubmit={handleChargeSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_1fr_70px_auto] gap-2 mb-5">
          <input placeholder="Nom de la charge" value={chargeForm.name} onChange={e => setChargeForm({ ...chargeForm, name: e.target.value })} className={inputClass} required />
          <input type="number" step="0.01" min="0" placeholder="Montant" value={chargeForm.amount} onChange={e => setChargeForm({ ...chargeForm, amount: e.target.value })} className={inputClass} required />
          <select value={chargeForm.category} onChange={e => setChargeForm({ ...chargeForm, category: e.target.value })} className={inputClass} required>
            <option value="">Categorie...</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" min="1" max="31" placeholder="Jour" value={chargeForm.dayOfMonth} onChange={e => setChargeForm({ ...chargeForm, dayOfMonth: e.target.value })} className={inputClass} required />
          <div className="flex gap-1">
            <button type="submit" className={`${btnClass} bg-ctp-red/20 text-ctp-red hover:bg-ctp-red/30`}>
              {editingCharge ? <Save size={15} /> : <Plus size={15} />}
            </button>
            {editingCharge && (
              <button type="button" onClick={() => setEditingCharge(null)} className={`${btnClass} bg-ctp-surface0 text-ctp-overlay1 hover:bg-ctp-surface1`}>
                <X size={15} />
              </button>
            )}
          </div>
        </form>

        {charges.length === 0 ? (
          <p className="text-sm text-ctp-overlay0 text-center py-4">Ajoutez votre premiere charge</p>
        ) : (
          <div className="divide-y divide-ctp-surface0/50">
            {charges.map(item => {
              const cat = getCat(item.category);
              return (
                <div key={item.id} className={`flex items-center gap-3 py-3 transition-opacity duration-200 ${!item.active ? 'opacity-40' : ''}`}>
                  <Toggle active={item.active} onClick={async () => { await updateCharge(item.id, { active: !item.active }); onRefresh(); }} />
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-sm font-medium text-ctp-text">{item.name}</span>
                  <span className="text-xs text-ctp-overlay0 hidden sm:inline">{cat.name}</span>
                  <span className="text-sm tabular-nums text-ctp-text font-semibold">{item.amount.toFixed(2)} EUR</span>
                  <span className="text-xs text-ctp-overlay0 w-12 text-right">Le {item.dayOfMonth}</span>
                  <div className="flex gap-0.5">
                    <button onClick={() => setEditingCharge(item)} className="p-1.5 rounded-lg hover:bg-ctp-surface0 text-ctp-overlay0 hover:text-ctp-blue transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={async () => { await deleteCharge(item.id); if (editingCharge?.id === item.id) setEditingCharge(null); onRefresh(); }} className="p-1.5 rounded-lg hover:bg-ctp-surface0 text-ctp-overlay0 hover:text-ctp-red transition-colors">
                      <Trash2 size={13} />
                    </button>
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
