type MissionStep = {
  id: string;
  label: string;
  done: boolean;
  active: boolean;
};

type MissionProgressProps = {
  steps: MissionStep[];
};

export function MissionProgress({ steps }: MissionProgressProps) {
  const doneCount = steps.filter((step) => step.done).length;

  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-sage-800">Миссия</h3>
        <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-700">
          {doneCount}/{steps.length}
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`rounded-2xl border px-3 py-3 transition ${
              step.done
                ? "border-emerald-200 bg-emerald-50"
                : step.active
                  ? "border-sage-400 bg-sage-50 shadow-sm"
                  : "border-sage-200 bg-white/70"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
              Шаг {index + 1}
            </p>
            <p className="mt-1 text-sm font-medium text-sage-800">{step.label}</p>
            <p className="mt-2 text-xs text-sage-600">
              {step.done ? "✓ Выполнено" : step.active ? "→ В процессе" : "Ожидает"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
