import { PieChart, Pie, Cell, Label, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, CalendarClock, Wallet, AlertTriangle } from 'lucide-react';
import { getCat } from '../api';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#1e1e2e',
    border: '1px solid #45475a',
    borderRadius: '12px',
    color: '#cdd6f4',
    fontSize: '13px',
    padding: '8px 12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
};

function CenterLabel({ viewBox, value, sub }) {
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-6" fill="#cdd6f4" fontSize="18" fontWeight="700">{value}</tspan>
      <tspan x={cx} dy="20" fill="#6c7086" fontSize="10">{sub}</tspan>
    </text>
  );
}

function getHealth(percent) {
  if (percent >= 40) return { color: '#a6e3a1', label: 'Confortable' };
  if (percent >= 20) return { color: '#f9e2af', label: 'Attention' };
  if (percent >= 0) return { color: '#f38ba8', label: 'Serre' };
  return { color: '#f38ba8', label: 'Deficit' };
}

export default function Dashboard({ incomes, charges, planned, settings, currentMonth }) {
  const totalIncome = incomes.filter(i => i.active).reduce((s, i) => s + i.amount, 0);
  const totalCharges = charges.filter(c => c.active).reduce((s, c) => s + c.amount, 0);
  const totalPlanned = planned.reduce((s, p) => s + p.amount, 0);
  const reste = totalIncome - totalCharges - totalPlanned;
  const percent = totalIncome > 0 ? (reste / totalIncome) * 100 : 0;
  const health = getHealth(percent);
  const isAlert = reste < settings.alertThreshold && totalIncome > 0;

  if (totalIncome === 0 && charges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-in">
        <div className="w-16 h-16 rounded-2xl bg-ctp-surface0 flex items-center justify-center mb-5">
          <Wallet size={28} className="text-ctp-overlay0" />
        </div>
        <p className="text-lg font-medium text-ctp-subtext1">Configurez votre budget</p>
        <p className="text-sm text-ctp-overlay0 mt-2">
          Ajoutez vos revenus et charges dans l'onglet "Revenus & Charges"
        </p>
      </div>
    );
  }

  const chargesByCategory = {};
  for (const c of charges.filter(c => c.active)) {
    const cat = getCat(c.category);
    if (!chargesByCategory[c.category]) {
      chargesByCategory[c.category] = { name: cat.name, color: cat.color, total: 0 };
    }
    chargesByCategory[c.category].total += c.amount;
  }
  const pieData = Object.values(chargesByCategory);

  const today = new Date();
  const isCurrentMonth = currentMonth === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const todayDay = today.getDate();

  const timeline = [
    ...incomes.filter(i => i.active).map(i => ({
      day: i.dayOfMonth, name: i.name, amount: i.amount, type: 'income',
    })),
    ...charges.filter(c => c.active).map(c => ({
      day: c.dayOfMonth, name: c.name, amount: c.amount, type: 'charge', category: c.category,
    })),
    ...planned.map(p => ({
      day: parseInt(p.date.slice(-2)), name: p.name, amount: p.amount, type: 'planned', done: p.done, category: p.category,
    })),
  ].sort((a, b) => a.day - b.day);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in">
        {[
          { label: 'Revenus', value: totalIncome, prefix: '+', icon: TrendingUp, color: '#a6e3a1' },
          { label: 'Charges fixes', value: totalCharges, prefix: '-', icon: TrendingDown, color: '#f38ba8' },
          { label: 'Depenses prevues', value: totalPlanned, prefix: '-', icon: CalendarClock, color: '#fab387' },
        ].map(({ label, value, prefix, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} style={{ color }} />
              <span className="text-xs text-ctp-overlay0 uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-xl font-bold text-ctp-text">
              <span style={{ color }} className="mr-1">{prefix}</span>
              {value.toFixed(2)}
              <span className="text-sm text-ctp-overlay0 font-normal ml-1">EUR</span>
            </p>
          </div>
        ))}
      </div>

      <div className="card p-6 animate-in animate-in-delay-1" style={{ background: 'linear-gradient(135deg, #181825 0%, #1e1e2e 50%, #181825 100%)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet size={16} style={{ color: health.color }} />
            <span className="text-sm text-ctp-overlay1">Reste a vivre</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: health.color + '20', color: health.color }}>
            {health.label}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold text-ctp-text tracking-tight">{reste.toFixed(2)}</span>
          <span className="text-lg text-ctp-overlay0">EUR</span>
        </div>
        <div className="h-3 rounded-full bg-ctp-surface0 overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, percent))}%`, backgroundColor: health.color }}
          />
        </div>
        <p className="text-xs text-ctp-overlay0">
          {percent > 0 ? `${percent.toFixed(0)}% de vos revenus disponibles` : 'Budget depasse'}
        </p>
        {isAlert && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-ctp-red/10 border border-ctp-red/20">
            <AlertTriangle size={14} className="text-ctp-red shrink-0" />
            <span className="text-xs text-ctp-red">
              Reste a vivre inferieur a {settings.alertThreshold} EUR
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 animate-in animate-in-delay-2">
          <h3 className="text-sm font-medium text-ctp-subtext0 mb-4">Echeancier du mois</h3>
          {timeline.length === 0 ? (
            <p className="text-sm text-ctp-overlay0 py-4 text-center">Aucun evenement</p>
          ) : (
            <div className="space-y-0.5 max-h-[360px] overflow-y-auto pr-1">
              {timeline.map((event, i) => {
                const isPast = isCurrentMonth && event.day < todayDay;
                const isToday = isCurrentMonth && event.day === todayDay;
                const lineColor = event.type === 'income' ? '#a6e3a1'
                  : event.type === 'planned' ? '#fab387'
                  : getCat(event.category).color;

                return (
                  <div
                    key={`${event.type}-${event.name}-${i}`}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all ${
                      isPast ? 'opacity-40' : ''
                    } ${isToday ? 'bg-ctp-lavender/5 ring-1 ring-ctp-lavender/20' : 'hover:bg-ctp-surface0/30'}`}
                  >
                    <span className="w-7 text-right text-xs font-mono font-semibold text-ctp-overlay0 shrink-0">
                      {event.day}
                    </span>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: lineColor }} />
                    <span className={`flex-1 text-sm truncate ${
                      event.type === 'planned' && event.done ? 'line-through text-ctp-overlay0' : 'text-ctp-text'
                    }`}>
                      {event.name}
                    </span>
                    {isToday && (
                      <span className="text-[10px] bg-ctp-lavender/15 text-ctp-lavender px-2 py-0.5 rounded-full shrink-0">
                        Aujourd'hui
                      </span>
                    )}
                    <span className={`text-sm font-semibold tabular-nums shrink-0 ${
                      event.type === 'income' ? 'text-ctp-green' : 'text-ctp-text'
                    }`}>
                      {event.type === 'income' ? '+' : '-'}{event.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6 animate-in animate-in-delay-3">
          <h3 className="text-sm font-medium text-ctp-subtext0 mb-4">Repartition des charges</h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-ctp-overlay0 py-4 text-center">Aucune charge</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                    <Label content={<CenterLabel value={totalCharges.toFixed(0)} sub="EUR / mois" />} position="center" />
                  </Pie>
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v) => [`${v.toFixed(2)} EUR`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-3">
                {pieData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-ctp-subtext0">{cat.name}</span>
                    <span className="font-medium text-ctp-text">{cat.total.toFixed(0)} EUR</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
