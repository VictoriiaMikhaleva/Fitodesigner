import type { Brief, Difficulty } from "../types";

export const briefs: Brief[] = [
  {
    id: "cat-apartment",
    title: "Квартира с кошкой",
    roomType: "Жилая квартира",
    light: "Рассеянный свет",
    humidity: "40–50%",
    temperature: "20–24°C",
    hasPets: true,
    requirements: [
      "Безопасно для животных",
      "Неприхотливые растения",
      "Спокойно переносят бытовые условия",
    ],
    difficulty: "novice",
    minPlants: 3,
    maxPlants: 5,
    description:
      "Клиент живёт с кошкой и хочет озеленить квартиру без риска для питомца. Нужны устойчивые растения для рассеянного света и умеренной влажности.",
  },
  {
    id: "dry-office",
    title: "Сухой офис",
    roomType: "Офис",
    light: "Искусственное или слабое естественное освещение",
    humidity: "30–40%",
    temperature: "21–25°C",
    hasPets: false,
    requirements: [
      "Выносливые растения",
      "Переносят сухой воздух",
      "Подходят для офиса",
    ],
    difficulty: "practitioner",
    minPlants: 3,
    maxPlants: 6,
    description:
      "Открытое офисное пространство с кондиционером, слабым светом и низкой влажностью. Нужны неприхотливые растения, которые не требуют сложного ухода.",
  },
  {
    id: "bright-living",
    title: "Светлая гостиная",
    roomType: "Гостиная",
    light: "Яркий рассеянный свет",
    humidity: "40–60%",
    temperature: "20–25°C",
    hasPets: false,
    requirements: [
      "Декоративные растения",
      "Выразительный внешний вид",
      "Хорошо смотрятся в интерьере",
    ],
    difficulty: "practitioner",
    minPlants: 4,
    maxPlants: 7,
    description:
      "Просторная гостиная с панорамным окном. Клиент хочет эффектные декоративные растения, которые подчеркнут интерьер и будут расти в хорошем свете.",
  },
  {
    id: "bathroom",
    title: "Ванная комната",
    roomType: "Ванная",
    light: "Слабый или рассеянный свет",
    humidity: "60–80%",
    temperature: "20–26°C",
    hasPets: false,
    requirements: [
      "Любят повышенную влажность",
      "Подходят для ванной",
      "Устойчивы к перепадам влажности",
    ],
    difficulty: "practitioner",
    minPlants: 3,
    maxPlants: 5,
    description:
      "Небольшая ванная с естественным рассеянным светом и постоянно повышенной влажностью. Нужны растения, которым комфортно во влажной среде.",
  },
  {
    id: "cafe",
    title: "Кафе",
    roomType: "Кафе",
    light: "Рассеянный свет",
    humidity: "40–55%",
    temperature: "20–24°C",
    hasPets: false,
    requirements: [
      "Декоративные растения",
      "Устойчивые к проходимости",
      "Неприхотливый уход",
      "Подходят для общественного пространства",
    ],
    difficulty: "pro",
    minPlants: 4,
    maxPlants: 7,
    description:
      "Уютное кафе с посадкой у окна. Растения должны быть декоративными, устойчивыми и не слишком капризными — персонал не сможет уделять им много времени.",
  },
  {
    id: "dark-corridor",
    title: "Тёмный коридор",
    roomType: "Коридор",
    light: "Слабое освещение",
    humidity: "35–50%",
    temperature: "19–23°C",
    hasPets: false,
    requirements: [
      "Теневыносливые растения",
      "Неприхотливые",
      "Работают в малоосвещённом пространстве",
    ],
    difficulty: "novice",
    minPlants: 2,
    maxPlants: 4,
    description:
      "Длинный коридор без окон, только искусственный свет. Нужны максимально теневыносливые растения, которые не будут быстро терять декоративность.",
  },
];

export function getBriefsByDifficulty(difficulty: Difficulty): Brief[] {
  const matched = briefs.filter((brief) => brief.difficulty === difficulty);
  if (matched.length > 0) return matched;

  if (difficulty === "pro") {
    return briefs.filter((brief) => brief.difficulty === "practitioner");
  }

  return briefs;
}

export function pickRandomBrief(difficulty: Difficulty, excludeId?: string): Brief {
  const pool = getBriefsByDifficulty(difficulty).filter((brief) => brief.id !== excludeId);
  const source = pool.length > 0 ? pool : briefs;
  return source[Math.floor(Math.random() * source.length)];
}
