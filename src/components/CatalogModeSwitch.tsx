import type { CatalogMode } from "../types";

type CatalogModeSwitchProps = {
  value: CatalogMode;
  onChange: (value: CatalogMode) => void;
};

const OPTIONS: { id: CatalogMode; label: string }[] = [
  { id: "indoor", label: "Комнатные" },
  { id: "garden", label: "Садовые" },
];

export function CatalogModeSwitch({ value, onChange }: CatalogModeSwitchProps) {
  return (
    <div className="catalog-switch" role="radiogroup" aria-label="Набор растений для тренировки">
      {OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={active ? "is-active" : undefined}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
