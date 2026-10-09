import type { Brief, ScoreResult } from "../types";

type DesignerTipProps = {
  brief?: Brief;
  result?: ScoreResult;
  showHints?: boolean;
};

const GENERAL_TIPS = [
  "Красивое растение не всегда подходит под задачу клиента — важнее условия помещения.",
  "Для кафе и общественных пространств лучше выбирать устойчивые растения с понятным уходом.",
];

function gardenTips(brief: Brief): string[] {
  const tips = [
    "Одна культура может встречаться несколькими карточками. Смотрите фотографию и окраску именно этой карточки.",
  ];

  if (brief.garden?.colors?.length) {
    tips.push("Для зачёта окраски нужна карточка с цветом из задания, а не другое фото той же культуры.");
  }

  if (brief.garden && brief.garden.sun[1] <= 3) {
    tips.push("Для тени и полутени берите растения, чей диапазон солнца пересекается с 1–3.");
  } else if (brief.garden && brief.garden.sun[0] >= 4) {
    tips.push("Для солнечного места подходят растения, чей диапазон солнца доходит до 4–5.");
  }

  return tips;
}

function tipsForBrief(brief: Brief): string[] {
  if (brief.garden) return gardenTips(brief);

  const tips: string[] = [];
  const text = `${brief.title} ${brief.description} ${brief.light}`.toLowerCase();

  if (brief.hasPets) {
    tips.push("Если в помещении есть животные, сначала исключай токсичные растения.");
  }

  if (/офис|сух/.test(text)) {
    tips.push("Для сухого офиса лучше выбирать растения, которые спокойно переносят низкую влажность.");
  }

  if (/темн|слаб|коридор/.test(text)) {
    tips.push("В тёмных помещениях не стоит использовать растения, которым нужен яркий рассеянный свет.");
  }

  if (/ванн/.test(text)) {
    tips.push("Для ванной ищи растения, которым комфортна повышенная влажность и стабильная температура.");
  }

  if (/кафе/.test(text)) {
    tips.push("В общественных пространствах важнее устойчивость и простой уход, чем редкая декоративность.");
  }

  return tips;
}

function tipsForResult(result: ScoreResult): string[] {
  const tips: string[] = [];

  if (result.totalScore < 70) {
    tips.push("Пересобери подбор вокруг 1–2 сильных растений и замени спорные позиции.");
  }

  if (result.mistakes.some((item) => item.includes("животных"))) {
    tips.push("Сделай отдельный фильтр «безопасно для животных» — это базовый шаг фитодизайнера.");
  }

  if (result.mistakes.some((item) => item.includes("свет"))) {
    tips.push("Сначала оцени свет в помещении, и только потом выбирай декоративные акценты.");
  }

  return tips;
}

export function DesignerTip({ brief, result, showHints = true }: DesignerTipProps) {
  if (!showHints) return null;

  const generalTips = brief?.garden
    ? ["Фотография карточки принадлежит её id и окраске. Другой цвет той же культуры — другая карточка."]
    : GENERAL_TIPS;

  const tips = [
    ...(brief ? tipsForBrief(brief) : []),
    ...(result ? tipsForResult(result) : []),
    ...generalTips,
  ].slice(0, 3);

  if (tips.length === 0) return null;

  return (
    <aside className="card border-dashed border-sage-300 bg-sage-50/80 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sage-500">Совет фитодизайнера</p>
      <ul className="mt-3 space-y-2">
        {tips.map((tip) => (
          <li key={tip} className="text-sm leading-relaxed text-sage-700">
            {tip}
          </li>
        ))}
      </ul>
    </aside>
  );
}
