import { useState } from 'react';
import { Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { updateSettings, resetAllData } from '../api';

export default function Settings({ settings, onRefresh }) {
  const [form, setForm] = useState({ alertThreshold: String(settings.alertThreshold), currency: settings.currency || 'EUR' });
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateSettings({ alertThreshold: parseFloat(form.alertThreshold), currency: form.currency });
    onRefresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    await resetAllData();
    onRefresh();
    setConfirmReset(false);
  };

  return (
    <div className="space-y-6 animate-in max-w-lg">
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-5">Preferences</h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">Seuil d'alerte reste a vivre</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" step="10" value={form.alertThreshold} onChange={e => setForm({ ...form, alertThreshold: e.target.value })} className="input-field w-32" required />
              <span className="text-sm text-text-muted">{form.currency}</span>
            </div>
            <p className="text-xs text-text-muted mt-1">Une alerte s'affiche quand le reste a vivre passe sous ce seuil</p>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">Devise</label>
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="input-field w-40">
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="CHF">CHF</option>
              <option value="MAD">MAD</option>
            </select>
          </div>

          <button type="submit" className="btn-gradient px-5 py-2.5 flex items-center gap-2 text-sm">
            <Save size={14} />
            {saved ? 'Enregistre !' : 'Enregistrer'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Zone dangereuse</h3>
        <p className="text-xs text-text-muted mb-4">Supprimer toutes les donnees et repartir de zero</p>

        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="px-4 py-2.5 rounded-xl text-accent-red text-sm font-medium transition-colors flex items-center gap-2" style={{ border: '1px solid var(--danger-border)', background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <RotateCcw size={14} />
            Reinitialiser les donnees
          </button>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}>
            <AlertTriangle size={16} className="text-accent-red shrink-0" />
            <span className="text-xs text-accent-red flex-1">Cette action est irreversible. Toutes vos donnees seront supprimees.</span>
            <button onClick={handleReset} className="px-3 py-1.5 rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#ef4444' }}>Confirmer</button>
            <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 rounded-lg border border-border text-text-muted text-xs font-medium hover:text-text-primary transition-colors">Annuler</button>
          </div>
        )}
      </div>
    </div>
  );
}
