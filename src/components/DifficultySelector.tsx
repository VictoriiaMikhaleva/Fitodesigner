import type { Difficulty } from "../types";

type DifficultySelectorProps = {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
};

const OPTIONS: { id: Difficulty; title: string; description: string }[] = [
  {
    id: "novice",
    title: "Новичок",
    description: "Простые брифы, подсказки сразу, мягкая оценка.",
  },
  {
    id: "practitioner",
    title: "Практик",
    description: "Больше условий, подсказки после проверки, обычная оценка.",
  },
  {
    id: "pro",
    title: "Профи",
    description: "Сложные брифы, строгая оценка, нужно объяснить выбор.",
  },
];

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-2xl border p-4 text-left transition ${
              active
                ? "border-sage-500 bg-sage-100 shadow-sm"
                : "border-sage-200 bg-white hover:border-sage-300"
            }`}
          >
            <p className="font-semibold text-sage-800">{option.title}</p>
            <p className="mt-2 text-sm text-sage-600">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
