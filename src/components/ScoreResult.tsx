import { AnimatedScoreRing } from "./AnimatedScoreRing";
import type { ScoreResult as ScoreResultData } from "../types";

type ScoreResultProps = {
  result: ScoreResultData;
  xpGained?: number;
};

function scoreTone(score: number): string {
  if (score >= 80) return "text-emerald-700 bg-emerald-50";
  if (score >= 60) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
}

export function ScoreResult({ result, xpGained }: ScoreResultProps) {
  return (
    <section className="card space-y-6 p-5">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <AnimatedScoreRing score={result.totalScore} level={result.level} />

        <div>
          <p className="text-sm font-medium text-sage-500">Результат проверки</p>
          {xpGained !== undefined && (
            <p className="mt-2 inline-flex rounded-full bg-sage-100 px-3 py-1 text-sm font-medium text-sage-700">
              +{xpGained} XP
            </p>
          )}
          <div className="mt-4 rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-700">
            Разбор по каждому растению — ниже. Используйте его, чтобы улучшить следующий подбор.
          </div>
        </div>
      </div>

      {result.strengths.length > 0 && (
        <div>
          <h3 className="font-semibold text-sage-800">Сильные стороны</h3>
          <ul className="mt-2 space-y-2">
            {result.strengths.map((item) => (
              <li key={item} className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.mistakes.length > 0 && (
        <div>
          <h3 className="font-semibold text-sage-800">Ошибки</h3>
          <ul className="mt-2 space-y-2">
            {result.mistakes.map((item) => (
              <li key={item} className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.recommendations.length > 0 && (
        <div>
          <h3 className="font-semibold text-sage-800">Рекомендации</h3>
          <ul className="mt-2 space-y-2">
            {result.recommendations.map((item) => (
              <li key={item} className="rounded-xl bg-sand-100 px-3 py-2 text-sm text-sage-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-sage-800">Разбор по растениям</h3>
        <div className="mt-3 space-y-4">
          {result.plantResults.map((entry, index) => (
            <article
              key={entry.plantId}
              className="rounded-2xl border border-sage-200 p-4 animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="font-semibold text-sage-800">{entry.plantName}</h4>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${scoreTone(entry.score)}`}>
                  {entry.score} баллов
                </span>
              </div>

              {entry.pros.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-sage-600">Плюсы</p>
                  <ul className="mt-1 space-y-1 text-sm text-sage-700">
                    {entry.pros.map((item) => (
                      <li key={item}>+ {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.risks.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-sage-600">Риски</p>
                  <ul className="mt-1 space-y-1 text-sm text-red-700">
                    {entry.risks.map((item) => (
                      <li key={item}>− {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-3 text-sm text-sage-700">{entry.recommendation}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
