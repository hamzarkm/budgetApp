import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
];

export default function MonthPicker({ value, onChange }) {
  const [year, month] = value.split('-').map(Number);

  const shift = (delta) => {
    const d = new Date(year, month - 1 + delta, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border px-1 py-1 bg-bg-primary">
      <button onClick={() => shift(-1)} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-all active:scale-90">
        <ChevronLeft size={15} />
      </button>
      <span className="text-xs sm:text-sm font-medium text-text-primary min-w-[90px] sm:min-w-[130px] text-center select-none">
        <span className="sm:hidden">{MONTHS[month - 1].slice(0, 3)} {year}</span>
        <span className="hidden sm:inline">{MONTHS[month - 1]} {year}</span>
      </span>
      <button onClick={() => shift(1)} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-all active:scale-90">
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
