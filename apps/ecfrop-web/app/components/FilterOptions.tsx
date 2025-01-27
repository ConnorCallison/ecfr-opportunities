import type { AnalysisFilter } from '../types/analysis';

interface FilterOptionProps {
  id: AnalysisFilter;
  label: string;
  emoji: string;
  isSelected: boolean;
  onClick: (id: AnalysisFilter) => void;
}

export const filterOptions: {
  id: AnalysisFilter;
  label: string;
  emoji: string;
}[] = [
  { id: 'complexity', label: 'Most Complex', emoji: '🧩' },
  { id: 'business', label: 'Highest Business Impact', emoji: '💼' },
  { id: 'admin', label: 'Highest Admin Cost', emoji: '📊' },
  { id: 'market', label: 'Highest Market Impact', emoji: '📈' },
  { id: 'dei', label: 'DEI Heavy', emoji: '🤝' },
  { id: 'automation', label: 'Automation Potential', emoji: '🤖' },
];

function FilterOption({
  id,
  label,
  emoji,
  isSelected,
  onClick,
}: FilterOptionProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`h-9 px-4 rounded-full flex items-center gap-2 whitespace-nowrap flex-shrink-0 transition-all ${
        isSelected
          ? 'bg-blue-600 text-white shadow-lg scale-105'
          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:scale-105'
      }`}
    >
      <span>{emoji}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

interface FilterOptionsProps {
  currentFilter: AnalysisFilter;
  onFilterChange: (filter: AnalysisFilter) => void;
}

export function FilterOptions({
  currentFilter,
  onFilterChange,
}: FilterOptionsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-500">Filters</h2>
        <p className="text-xs text-gray-400 md:hidden">
          ← Scroll to see more →
        </p>
      </div>
      <div className="w-full overflow-x-auto bg-gray-50 rounded-xl border border-gray-200 p-3">
        <div className="flex gap-2 min-w-min">
          {filterOptions.map((option) => (
            <FilterOption
              key={option.id}
              {...option}
              isSelected={currentFilter === option.id}
              onClick={onFilterChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
