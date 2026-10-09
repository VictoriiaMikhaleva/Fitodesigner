import type { Brief } from "../types";

type BriefCardProps = {
  brief: Brief;
};

export function BriefCard({ brief }: BriefCardProps) {
  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-sage-500">{brief.roomType}</p>
          <h2 className="mt-1 text-2xl font-semibold text-sage-800">{brief.title}</h2>
        </div>
        <span className="rounded-full bg-sand-100 px-3 py-1 text-sm text-sage-700">
          {brief.minPlants}–{brief.maxPlants} растений
        </span>
      </div>

      <p className="mt-4 text-sage-700">{brief.description}</p>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {(brief.facts ?? [
          { label: "Свет", value: brief.light },
          { label: "Влажность", value: brief.humidity },
          { label: "Температура", value: brief.temperature },
          { label: "Питомцы", value: brief.hasPets ? "Есть животные" : "Животных нет" },
        ]).map((fact) => (
          <div key={fact.label} className="rounded-2xl bg-sage-50 p-3">
            <dt className="text-xs uppercase tracking-wide text-sage-500">{fact.label}</dt>
            <dd className="mt-1 text-sm text-sage-800">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <p className="text-sm font-medium text-sage-600">Требования клиента</p>
        <ul className="mt-2 space-y-2">
          {brief.requirements.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-sage-700">
              <span className="text-sage-500">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
