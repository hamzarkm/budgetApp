import { PieChart, Pie, Cell, Label, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, CalendarClock, Wallet, AlertTriangle } from 'lucide-react';
import { getCat } from '../api';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#16161f',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#f0f0f5',
    fontSize: '13px',
    padding: '8px 14px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
  },
};

function CenterLabel({ viewBox, value, sub }) {
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-6" fill="#f0f0f5" fontSize="18" fontWeight="700">{value}</tspan>
      <tspan x={cx} dy="20" fill="#555570" fontSize="10">{sub}</tspan>
    </text>
  );
}

function getHealth(percent) {
  if (percent >= 40) return { color: '#34d399', bg: 'rgba(52,211,153,0.1)', label: 'Confortable' };
  if (percent >= 20) return { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', label: 'Attention' };
  if (percent >= 0) return { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Serre' };
  return { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Deficit' };
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
        <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border flex items-center justify-center mb-5">
          <Wallet size={28} className="text-text-muted" />
        </div>
        <p className="text-lg font-medium text-text-primary">Configurez votre budget</p>
        <p className="text-sm text-text-muted mt-2">Ajoutez vos revenus et charges dans l'onglet dedie</p>
      </div>
    );
  }

  const chargesByCategory = {};
  for (const c of charges.filter(c => c.active)) {
    const cat = getCat(c.category);
    if (!chargesByCategory[c.category]) chargesByCategory[c.category] = { name: cat.name, color: cat.color, total: 0 };
    chargesByCategory[c.category].total += c.amount;
  }
  const pieData = Object.values(chargesByCategory);

  const today = new Date();
  const isCurrentMonth = currentMonth === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const todayDay = today.getDate();

  const timeline = [
    ...incomes.filter(i => i.active).map(i => ({ day: i.dayOfMonth, name: i.name, amount: i.amount, type: 'income' })),
    ...charges.filter(c => c.active).map(c => ({ day: c.dayOfMonth, name: c.name, amount: c.amount, type: 'charge', category: c.category })),
    ...planned.map(p => ({ day: parseInt(p.date.slice(-2)), name: p.name, amount: p.amount, type: 'planned', done: p.done, category: p.category })),
  ].sort((a, b) => a.day - b.day);

  const cards = [
    { label: 'Revenus', value: totalIncome, prefix: '+', icon: TrendingUp, color: '#34d399', gradient: 'rgba(52,211,153,0.08)' },
    { label: 'Charges fixes', value: totalCharges, prefix: '-', icon: TrendingDown, color: '#f87171', gradient: 'rgba(248,113,113,0.08)' },
    { label: 'Depenses prevues', value: totalPlanned, prefix: '-', icon: CalendarClock, color: '#fb923c', gradient: 'rgba(251,146,60,0.08)' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in">
        {cards.map(({ label, value, prefix, icon: Icon, color, gradient }) => (
          <div key={label} className="card p-5" style={{ background: `linear-gradient(145deg, ${gradient}, rgba(12,12,18,0.95))` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: gradient }}>
                <Icon size={14} style={{ color }} />
              </div>
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
            </div>
            <p className="text-xl font-bold text-text-primary">
              <span style={{ color }} className="mr-0.5">{prefix}</span>
              {value.toFixed(2)}
              <span className="text-sm text-text-muted font-normal ml-1">EUR</span>
            </p>
          </div>
        ))}
      </div>

      <div className="card p-6 animate-in animate-in-delay-1" style={{ background: 'linear-gradient(145deg, rgba(99,102,241,0.04), rgba(12,12,18,0.95))' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet size={15} style={{ color: health.color }} />
            <span className="text-sm text-text-secondary">Reste a vivre</span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: health.bg, color: health.color }}>
            {health.label}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-5">
          <span className="text-4xl font-bold text-text-primary tracking-tight">{reste.toFixed(2)}</span>
          <span className="text-lg text-text-muted">EUR</span>
        </div>
        <div className="h-2.5 rounded-full bg-bg-input overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
            width: `${Math.max(0, Math.min(100, percent))}%`,
            background: `linear-gradient(90deg, ${health.color}, ${health.color}88)`,
          }} />
        </div>
        <p className="text-xs text-text-muted">
          {percent > 0 ? `${percent.toFixed(0)}% de vos revenus disponibles` : 'Budget depasse'}
        </p>
        {isAlert && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <AlertTriangle size={14} className="text-accent-red shrink-0" />
            <span className="text-xs text-accent-red">Reste a vivre inferieur a {settings.alertThreshold} EUR</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 animate-in animate-in-delay-2">
          <h3 className="text-sm font-medium text-text-secondary mb-4">Echeancier du mois</h3>
          {timeline.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">Aucun evenement</p>
          ) : (
            <div className="space-y-0.5 max-h-[360px] overflow-y-auto pr-1">
              {timeline.map((event, i) => {
                const isPast = isCurrentMonth && event.day < todayDay;
                const isToday = isCurrentMonth && event.day === todayDay;
                const lineColor = event.type === 'income' ? '#34d399' : event.type === 'planned' ? '#fb923c' : getCat(event.category).color;
                return (
                  <div key={`${event.type}-${event.name}-${i}`} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all ${isPast ? 'opacity-35' : ''} ${isToday ? 'bg-accent-blue/5 ring-1 ring-accent-blue/15' : 'hover:bg-bg-hover'}`}>
                    <span className="w-7 text-right text-xs font-mono font-semibold text-text-muted shrink-0">{event.day}</span>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: lineColor }} />
                    <span className={`flex-1 text-sm truncate ${event.type === 'planned' && event.done ? 'line-through text-text-muted' : 'text-text-primary'}`}>{event.name}</span>
                    {isToday && <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>Aujourd'hui</span>}
                    <span className={`text-sm font-semibold tabular-nums shrink-0 ${event.type === 'income' ? 'text-accent-green' : 'text-text-primary'}`}>
                      {event.type === 'income' ? '+' : '-'}{event.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6 animate-in animate-in-delay-3">
          <h3 className="text-sm font-medium text-text-secondary mb-4">Repartition des charges</h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">Aucune charge</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                    {pieData.map(e => <Cell key={e.name} fill={e.color} />)}
                    <Label content={<CenterLabel value={totalCharges.toFixed(0)} sub="EUR / mois" />} position="center" />
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(v) => [`${v.toFixed(2)} EUR`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-3">
                {pieData.map(cat => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-text-muted">{cat.name}</span>
                    <span className="font-medium text-text-primary">{cat.total.toFixed(0)} EUR</span>
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
