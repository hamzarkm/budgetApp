import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Repeat, CalendarClock, PiggyBank, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { getIncomes, getCharges, getPlanned, getSavings, getSettings } from './api';
import MonthPicker from './components/MonthPicker';
import Dashboard from './components/Dashboard';
import RecurringManager from './components/RecurringManager';
import PlannedExpenses from './components/PlannedExpenses';
import SavingsGoals from './components/SavingsGoals';
import Settings from './components/Settings';

function formatMonth(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark(d => !d)];
}

export default function App() {
  const [dark, toggleDark] = useTheme();
  const [currentMonth, setCurrentMonth] = useState(formatMonth(new Date()));
  const [activeTab, setActiveTab] = useState('overview');
  const [incomes, setIncomes] = useState([]);
  const [charges, setCharges] = useState([]);
  const [planned, setPlanned] = useState([]);
  const [savings, setSavings] = useState([]);
  const [settings, setSettings] = useState({ alertThreshold: 300, currency: 'EUR' });

  const refreshAll = useCallback(() => {
    getIncomes().then(setIncomes);
    getCharges().then(setCharges);
    getSavings().then(setSavings);
    getSettings().then(setSettings);
  }, []);

  const refreshPlanned = useCallback(() => {
    getPlanned(currentMonth).then(setPlanned);
  }, [currentMonth]);

  useEffect(() => { refreshAll(); }, [refreshAll]);
  useEffect(() => { refreshPlanned(); }, [refreshPlanned]);

  const currency = settings.currency || 'EUR';

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'recurring', label: 'Revenus & Charges', icon: Repeat },
    { id: 'planned', label: 'Depenses prevues', icon: CalendarClock },
    { id: 'savings', label: 'Epargne', icon: PiggyBank },
    { id: 'settings', label: 'Parametres', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#6366f1' }}>
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">MonBudget</h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MonthPicker value={currentMonth} onChange={setCurrentMonth} />
            <button onClick={toggleDark} className="p-2 sm:p-2.5 rounded-xl border border-border bg-bg-primary text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all shrink-0" title={dark ? 'Mode clair' : 'Mode sombre'}>
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 flex gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg mx-0.5 ${
                activeTab === id ? 'text-accent-indigo bg-indigo-50' : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
              }`}
              style={activeTab === id ? { background: 'var(--today-bg)' } : undefined}
            >
              <Icon size={14} className="sm:w-[15px] sm:h-[15px]" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(' ')[0]}</span>
              {activeTab === id && (
                <span className="absolute bottom-0 left-2 right-2 sm:left-3 sm:right-3 h-[2px] rounded-full bg-accent-indigo" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        {activeTab === 'overview' && (
          <Dashboard incomes={incomes} charges={charges} planned={planned} savings={savings} settings={settings} currentMonth={currentMonth} currency={currency} />
        )}
        {activeTab === 'recurring' && (
          <RecurringManager incomes={incomes} charges={charges} onRefresh={refreshAll} currency={currency} />
        )}
        {activeTab === 'planned' && (
          <PlannedExpenses planned={planned} currentMonth={currentMonth} onRefresh={() => { refreshPlanned(); refreshAll(); }} currency={currency} />
        )}
        {activeTab === 'savings' && (
          <SavingsGoals savings={savings} onRefresh={refreshAll} currency={currency} />
        )}
        {activeTab === 'settings' && (
          <Settings settings={settings} onRefresh={refreshAll} />
        )}
      </main>
    </div>
  );
}
