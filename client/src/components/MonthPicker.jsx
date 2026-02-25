import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
];

export default function MonthPicker({ value, onChange }) {
  const [year, month] = value.split('-').map(Number);

  const shift = (delta) => {
    const d = new Date(year, month - 1 + delta, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    onChange(`${y}-${m}`);
  };

  return (
    <div className="flex items-center gap-1 bg-ctp-surface0/50 rounded-xl px-1 py-1">
      <button
        onClick={() => shift(-1)}
        className="p-2 rounded-lg hover:bg-ctp-surface1 text-ctp-overlay0 hover:text-ctp-text transition-all duration-200 active:scale-90"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium text-ctp-subtext1 min-w-[130px] text-center select-none">
        {MONTHS[month - 1]} {year}
      </span>
      <button
        onClick={() => shift(1)}
        className="p-2 rounded-lg hover:bg-ctp-surface1 text-ctp-overlay0 hover:text-ctp-text transition-all duration-200 active:scale-90"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
