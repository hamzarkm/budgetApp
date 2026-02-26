import { PieChart, Pie, Cell, Label, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, CalendarClock, Wallet, AlertTriangle, PiggyBank } from 'lucide-react';
import { getCat } from '../api';

function CenterLabel({ viewBox, value, sub, dark }) {
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-6" fill={dark ? '#f0f0f5' : '#111827'} fontSize="18" fontWeight="700">{value}</tspan>
      <tspan x={cx} dy="20" fill={dark ? '#555570' : '#9ca3af'} fontSize="10">{sub}</tspan>
    </text>
  );
}

function getHealth(percent) {
  if (percent >= 40) return { color: '#10b981', bg: 'var(--health-confortable-bg)', label: 'Confortable' };
  if (percent >= 20) return { color: '#f59e0b', bg: 'var(--health-attention-bg)', label: 'Attention' };
  if (percent >= 0) return { color: '#ef4444', bg: 'var(--health-red-bg)', label: 'Serre' };
  return { color: '#ef4444', bg: 'var(--health-red-bg)', label: 'Deficit' };
}

export default function Dashboard({ incomes, charges, planned, savings = [], settings, currentMonth, currency = 'EUR', dark = false }) {
  const totalIncome = incomes.filter(i => i.active).reduce((s, i) => s + i.amount, 0);
  const totalCharges = charges.filter(c => c.active).reduce((s, c) => s + c.amount, 0);
  const totalPlanned = planned.reduce((s, p) => s + p.amount, 0);
  const totalSavings = savings.reduce((s, g) => s + g.monthly, 0);
  const reste = totalIncome - totalCharges - totalPlanned - totalSavings;
  const percent = totalIncome > 0 ? (reste / totalIncome) * 100 : 0;
  const health = getHealth(percent);
  const isAlert = reste < settings.alertThreshold && totalIncome > 0;

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: dark ? '#12121a' : '#ffffff',
      border: `1px solid ${dark ? '#1e1e2e' : '#e5e7eb'}`,
      borderRadius: '12px',
      color: dark ? '#f0f0f5' : '#111827',
      fontSize: '13px',
      padding: '8px 14px',
      boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
    },
  };

  if (totalIncome === 0 && charges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-in">
        <div className="w-16 h-16 rounded-2xl bg-bg-hover border border-border flex items-center justify-center mb-5">
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

  const stats = [
    { label: 'Revenus', value: totalIncome, prefix: '+', icon: TrendingUp, color: '#10b981', bg: 'var(--icon-green-bg)' },
    { label: 'Charges fixes', value: totalCharges, prefix: '-', icon: TrendingDown, color: '#ef4444', bg: 'var(--icon-red-bg)' },
    { label: 'Depenses prevues', value: totalPlanned, prefix: '-', icon: CalendarClock, color: '#f59e0b', bg: 'var(--icon-orange-bg)' },
    ...(totalSavings > 0 ? [{ label: 'Epargne', value: totalSavings, prefix: '-', icon: PiggyBank, color: '#10b981', bg: 'var(--icon-green-bg)' }] : []),
  ];

  return (
    <div className="space-y-4 animate-in">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet size={15} style={{ color: health.color }} />
              <span className="text-sm text-text-secondary">Reste a vivre</span>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: health.bg, color: health.color }}>
              {health.label}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-text-primary tracking-tight">{reste.toFixed(2)}</span>
            <span className="text-lg text-text-muted">{currency}</span>
          </div>
          <div className="h-2 rounded-full bg-bg-input overflow-hidden mb-1.5">
            <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
              width: `${Math.max(0, Math.min(100, percent))}%`,
              backgroundColor: health.color,
            }} />
          </div>
          <p className="text-xs text-text-muted">
            {percent > 0 ? `${percent.toFixed(0)}% de vos revenus disponibles` : 'Budget depasse'}
          </p>
          {isAlert && (
            <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl" style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}>
              <AlertTriangle size={13} className="text-accent-red shrink-0" />
              <span className="text-xs text-accent-red">Reste a vivre inferieur a {settings.alertThreshold} {currency}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {stats.map(({ label, value, prefix, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4 flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">{label}</p>
                <p className="text-lg font-bold text-text-primary leading-tight">
                  <span style={{ color }} className="mr-0.5 text-sm">{prefix}</span>
                  {value.toFixed(2)}
                  <span className="text-xs text-text-muted font-normal ml-0.5">{currency}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Echeancier du mois</h3>
          {timeline.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">Aucun evenement</p>
          ) : (
            <div className="space-y-0 max-h-[400px] overflow-y-auto">
              {timeline.map((event, i) => {
                const isPast = isCurrentMonth && event.day < todayDay;
                const isToday = isCurrentMonth && event.day === todayDay;
                const lineColor = event.type === 'income' ? '#10b981' : event.type === 'planned' ? '#f59e0b' : getCat(event.category).color;
                return (
                  <div key={`${event.type}-${event.name}-${i}`} className={`flex items-center gap-3 py-2 px-2.5 rounded-lg transition-all ${isPast ? 'opacity-35' : ''}`} style={isToday ? { background: 'var(--today-bg)', boxShadow: 'inset 0 0 0 1px var(--today-ring)' } : undefined}>
                    <span className="w-6 text-right text-xs font-mono font-semibold text-text-muted shrink-0">{event.day}</span>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: lineColor }} />
                    <span className={`flex-1 text-sm truncate ${event.type === 'planned' && event.done ? 'line-through text-text-muted' : 'text-text-primary'}`}>{event.name}</span>
                    {isToday && <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: 'var(--today-badge-bg)', color: 'var(--today-badge-text)' }}>Aujourd'hui</span>}
                    <span className={`text-sm font-semibold tabular-nums shrink-0 ${event.type === 'income' ? 'text-accent-green' : 'text-text-primary'}`}>
                      {event.type === 'income' ? '+' : '-'}{event.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5 flex flex-col">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Repartition des charges</h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">Aucune charge</p>
          ) : (
            <div className="flex flex-col items-center flex-1 justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                    {pieData.map(e => <Cell key={e.name} fill={e.color} />)}
                    <Label content={<CenterLabel value={totalCharges.toFixed(0)} sub={`${currency} / mois`} dark={dark} />} position="center" />
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(v) => [`${v.toFixed(2)} ${currency}`, '']} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 w-full">
                {pieData.map(cat => (
                  <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-text-muted truncate">{cat.name}</span>
                    <span className="font-semibold text-text-primary ml-auto">{cat.total.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 3 : Vue annuelle */}
      {(() => {
        const MNAMES = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
        const [cy, cm] = currentMonth.split('-').map(Number);
        const monthlyReste = totalIncome - totalCharges - totalSavings;
        const yearData = Array.from({ length: 12 }, (_, i) => {
          const m = i + 1;
          return { name: MNAMES[i], value: monthlyReste, month: `${cy}-${String(m).padStart(2, '0')}` };
        });
        const currentIdx = cm - 1;
        return (
          <div className="card p-5 animate-in animate-in-delay-3 mt-4">
            <h3 className="text-sm font-medium text-text-secondary mb-3">Projection annuelle {cy}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={yearData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e1e2e' : '#e5e7eb'} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: dark ? '#555570' : '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: dark ? '#555570' : '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`${v.toFixed(2)} ${currency}`, 'Reste a vivre']} cursor={{ fill: dark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.08)', radius: 4 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {yearData.map((_, i) => (
                    <Cell key={i} fill={i === currentIdx ? '#6366f1' : (dark ? '#1e1e2e' : '#e5e7eb')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })()}
    </div>
  );
}
