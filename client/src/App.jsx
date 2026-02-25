import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Repeat, CalendarClock } from 'lucide-react';
import { getIncomes, getCharges, getPlanned, getSettings } from './api';
import MonthPicker from './components/MonthPicker';
import Dashboard from './components/Dashboard';
import RecurringManager from './components/RecurringManager';
import PlannedExpenses from './components/PlannedExpenses';

function formatMonth(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(formatMonth(new Date()));
  const [activeTab, setActiveTab] = useState('overview');
  const [incomes, setIncomes] = useState([]);
  const [charges, setCharges] = useState([]);
  const [planned, setPlanned] = useState([]);
  const [settings, setSettings] = useState({ alertThreshold: 300 });

  const refreshRecurring = useCallback(() => {
    getIncomes().then(setIncomes);
    getCharges().then(setCharges);
  }, []);

  const refreshPlanned = useCallback(() => {
    getPlanned(currentMonth).then(setPlanned);
  }, [currentMonth]);

  useEffect(() => {
    refreshRecurring();
    getSettings().then(setSettings);
  }, [refreshRecurring]);

  useEffect(() => { refreshPlanned(); }, [refreshPlanned]);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'recurring', label: 'Revenus & Charges', icon: Repeat },
    { id: 'planned', label: 'Depenses prevues', icon: CalendarClock },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border" style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.03) 0%, transparent 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <h1 className="text-lg font-semibold text-text-primary tracking-tight">MonBudget</h1>
          </div>
          <MonthPicker value={currentMonth} onChange={setCurrentMonth} />
        </div>
      </header>

      <nav className="border-b border-border sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === id ? 'text-accent-indigo' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon size={15} />
              {label}
              {activeTab === id && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <Dashboard incomes={incomes} charges={charges} planned={planned} settings={settings} currentMonth={currentMonth} />
        )}
        {activeTab === 'recurring' && (
          <RecurringManager incomes={incomes} charges={charges} onRefresh={refreshRecurring} />
        )}
        {activeTab === 'planned' && (
          <PlannedExpenses planned={planned} currentMonth={currentMonth} onRefresh={refreshPlanned} />
        )}
      </main>
    </div>
  );
}
