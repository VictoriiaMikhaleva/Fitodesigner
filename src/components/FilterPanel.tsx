import { DEFAULT_FILTERS } from "../utils/plantFilters";
import type { PlantFilters } from "../types";

type FilterPanelProps = {
  filters: PlantFilters;
  categories: string[];
  onChange: (filters: PlantFilters) => void;
};

export function FilterPanel({ filters, categories, onChange }: FilterPanelProps) {
  return (
    <div className="card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-sage-800">Фильтры каталога</h3>
        <button
          type="button"
          className="text-sm font-medium text-sage-600 hover:text-sage-800"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          Сбросить
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="md:col-span-2 xl:col-span-2">
          <span className="field-label">Поиск по названию</span>
          <input
            className="field-input"
            type="search"
            value={filters.query}
            placeholder="Название, семейство, комментарий…"
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
          />
        </label>

        <label>
          <span className="field-label">Категория</span>
          <select
            className="field-input"
            value={filters.category}
            onChange={(event) => onChange({ ...filters, category: event.target.value })}
          >
            <option value="all">Все</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="field-label">Свет</span>
          <select
            className="field-input"
            value={filters.light}
            onChange={(event) => onChange({ ...filters, light: event.target.value })}
          >
            <option value="all">Все</option>
            <option value="low">Слабый / теневой</option>
            <option value="medium">Рассеянный</option>
            <option value="high">Яркий</option>
          </select>
        </label>

        <label>
          <span className="field-label">Влажность</span>
          <select
            className="field-input"
            value={filters.humidity}
            onChange={(event) => onChange({ ...filters, humidity: event.target.value })}
          >
            <option value="all">Все</option>
            <option value="low">Низкая</option>
            <option value="medium">Средняя</option>
            <option value="high">Высокая</option>
          </select>
        </label>

        <label className="flex items-end gap-2 rounded-xl border border-sage-200 bg-sage-50 px-3 py-3 md:col-span-2 xl:col-span-1">
          <input
            id="pet-safe-only"
            type="checkbox"
            checked={filters.petSafeOnly}
            onChange={(event) => onChange({ ...filters, petSafeOnly: event.target.checked })}
          />
          <span className="text-sm text-sage-700">Безопасно для животных</span>
        </label>
      </div>
    </div>
  );
}
