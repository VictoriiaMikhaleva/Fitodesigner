import type { Brief, Difficulty, GardenTask } from "../types";

const MONTHS = [
  "",
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

const SUN_LABELS: Record<number, string> = {
  1: "Тень",
  2: "Теневыносливое",
  3: "Полутень",
  4: "Светолюбивое",
  5: "Полное солнце",
};

const COLOR_LABELS: Record<string, string> = {
  white: "Белые",
  blue: "Сине-зелёные (листва)",
  sky: "Синие / голубые",
  purple: "Фиолетовые",
  yellow: "Жёлтые",
  orange: "Оранжевые",
  red: "Красные",
  pink: "Розовые",
};

const MOISTURE_LABELS: Record<string, string> = {
  dry: "Сухой",
  moderate: "Умеренно влажный",
  moist: "Равномерно влажный",
  wet: "Постоянно влажный",
};

function spanLabel(range: [number, number], labels: Record<number, string>): string {
  const start = labels[range[0]] || String(range[0]);
  const end = labels[range[1]] || String(range[1]);
  return range[0] === range[1] ? start : `${start} — ${end}`;
}

function briefFrom(input: {
  id: string;
  title: string;
  roomType: string;
  description: string;
  difficulty: Difficulty;
  minPlants: number;
  maxPlants: number;
  requirements: string[];
  garden: GardenTask;
}): Brief {
  const sunLabel = spanLabel(input.garden.sun, SUN_LABELS);
  const colorValue = input.garden.colors?.length
    ? input.garden.colors.map((color) => COLOR_LABELS[color] || color).join(", ")
    : "Любая окраска каталога";
  const bloomValue = input.garden.bloom ? spanLabel(input.garden.bloom, MONTHS) : "Без отдельного ограничения";
  const moistureValue = input.garden.moisture?.length
    ? input.garden.moisture.map((item) => MOISTURE_LABELS[item] || item).join(", ")
    : "Без отдельного ограничения";
  const winterValue = input.garden.wintering || "Без отдельного ограничения";

  return {
    id: input.id,
    title: input.title,
    roomType: input.roomType,
    light: `${input.garden.sun[0]}–${input.garden.sun[1]} · ${sunLabel}`,
    humidity: moistureValue,
    temperature: winterValue,
    hasPets: false,
    requirements: input.requirements,
    difficulty: input.difficulty,
    minPlants: input.minPlants,
    maxPlants: input.maxPlants,
    description: input.description,
    garden: input.garden,
    facts: [
      { label: "Солнце", value: `${input.garden.sun[0]}–${input.garden.sun[1]} · ${sunLabel}` },
      { label: "Окраска", value: colorValue },
      { label: "Цветение", value: bloomValue },
      { label: input.garden.moisture ? "Почва" : "Зимовка", value: input.garden.moisture ? moistureValue : winterValue },
    ],
  };
}

export const gardenBriefs: Brief[] = [
  briefFrom({
    id: "garden-sunny-bed",
    title: "Солнечная клумба",
    roomType: "Цветник",
    description:
      "Открытая клумба на полном солнце. Нужны растения, которым подходит солнце 4–5, с цветением в июне–августе.",
    difficulty: "novice",
    minPlants: 3,
    maxPlants: 5,
    requirements: ["Солнце 4–5", "Цветение в июне–августе"],
    garden: { sun: [4, 5], bloom: [6, 8] },
  }),
  briefFrom({
    id: "garden-shade",
    title: "Теневой уголок",
    roomType: "Тень",
    description:
      "Угол сада в тени или полутени. Нужны растения, чей диапазон солнца пересекается с 1–3.",
    difficulty: "novice",
    minPlants: 2,
    maxPlants: 4,
    requirements: ["Солнце 1–3"],
    garden: { sun: [1, 3] },
  }),
  briefFrom({
    id: "garden-white-sun",
    title: "Белый солнечный цветник",
    roomType: "Цветник",
    description:
      "Солнечное место и белая окраска. Берите карточки с окраской «Белые» и солнцем, которое доходит до 4–5.",
    difficulty: "practitioner",
    minPlants: 3,
    maxPlants: 5,
    requirements: ["Белая окраска", "Солнце 4–5"],
    garden: { sun: [4, 5], colors: ["white"] },
  }),
  briefFrom({
    id: "garden-spring",
    title: "Весеннее цветение",
    roomType: "Весенний сад",
    description: "Нужны растения, которые цветут в апреле–мае. Солнце может быть от теневыносливого до полного.",
    difficulty: "practitioner",
    minPlants: 3,
    maxPlants: 6,
    requirements: ["Цветение в апреле–мае"],
    garden: { sun: [2, 5], bloom: [4, 5] },
  }),
  briefFrom({
    id: "garden-moist",
    title: "Влажный участок",
    roomType: "Влажная почва",
    description:
      "Место с равномерно влажной или постоянно влажной почвой. Солнце от теневыносливого до полного.",
    difficulty: "practitioner",
    minPlants: 3,
    maxPlants: 5,
    requirements: ["Влажная почва", "Солнце 2–5"],
    garden: { sun: [2, 5], moisture: ["moist", "wet"] },
  }),
  briefFrom({
    id: "garden-pink-hardy",
    title: "Зимостойкий розовый микс",
    roomType: "Солнечная клумба",
    description:
      "Розовые карточки для полного солнца, которые зимуют в открытом грунте. Другая окраска той же культуры не подходит.",
    difficulty: "pro",
    minPlants: 4,
    maxPlants: 6,
    requirements: ["Розовая окраска", "Солнце 4–5", "Зимует в открытом грунте"],
    garden: { sun: [4, 5], colors: ["pink"], wintering: "Зимует в открытом грунте" },
  }),
  briefFrom({
    id: "garden-autumn-sun",
    title: "Осенний солнечный цветник",
    roomType: "Осенний цветник",
    description:
      "Солнце 4–5, цветение в августе–октябре и зимовка в открытом грунте. Окраска любая.",
    difficulty: "pro",
    minPlants: 4,
    maxPlants: 7,
    requirements: ["Солнце 4–5", "Цветение в августе–октябре", "Зимует в открытом грунте"],
    garden: { sun: [4, 5], bloom: [8, 10], wintering: "Зимует в открытом грунте" },
  }),
];

export function pickGardenBrief(difficulty: Difficulty, excludeId?: string): Brief {
  const matched = gardenBriefs.filter((brief) => brief.difficulty === difficulty && brief.id !== excludeId);
  const sameLevel = gardenBriefs.filter((brief) => brief.difficulty === difficulty);
  const source = matched.length > 0 ? matched : sameLevel.length > 0 ? sameLevel : gardenBriefs;
  return source[Math.floor(Math.random() * source.length)];
}
