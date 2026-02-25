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
    <div className="min-h-screen bg-ctp-base">
      <header className="bg-ctp-mantle border-b border-ctp-surface0">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full bg-ctp-lavender" />
            <h1 className="text-xl font-bold text-ctp-text tracking-tight">MonBudget</h1>
          </div>
          <MonthPicker value={currentMonth} onChange={setCurrentMonth} />
        </div>
      </header>

      <nav className="bg-ctp-mantle/80 backdrop-blur-sm border-b border-ctp-surface0 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === id ? 'text-ctp-lavender' : 'text-ctp-overlay0 hover:text-ctp-subtext1'
              }`}
            >
              <Icon size={16} />
              {label}
              {activeTab === id && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-ctp-lavender rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <Dashboard
            incomes={incomes}
            charges={charges}
            planned={planned}
            settings={settings}
            currentMonth={currentMonth}
          />
        )}
        {activeTab === 'recurring' && (
          <RecurringManager
            incomes={incomes}
            charges={charges}
            onRefresh={refreshRecurring}
          />
        )}
        {activeTab === 'planned' && (
          <PlannedExpenses
            planned={planned}
            currentMonth={currentMonth}
            onRefresh={refreshPlanned}
          />
        )}
      </main>
    </div>
  );
}
