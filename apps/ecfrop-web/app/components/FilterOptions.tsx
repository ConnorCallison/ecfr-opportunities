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
      className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
        isSelected
          ? 'bg-blue-600 text-white shadow-lg scale-105'
          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:scale-105'
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
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
    <div className="flex flex-wrap gap-3 mb-8">
      {filterOptions.map((option) => (
        <FilterOption
          key={option.id}
          {...option}
          isSelected={currentFilter === option.id}
          onClick={onFilterChange}
        />
      ))}
    </div>
  );
}
