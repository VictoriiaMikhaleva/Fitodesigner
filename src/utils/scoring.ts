import type { Brief, Difficulty, Plant, PlantScoreEntry, ScoreResult } from "../types";

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function parseRange(text: string): { min: number; max: number } | null {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*[–\-—]\s*(\d+(?:[.,]\d+)?)/);
  if (!match) return null;

  return {
    min: Number(match[1].replace(",", ".")),
    max: Number(match[2].replace(",", ".")),
  };
}

function parseSingleNumber(text: string): number | null {
  const match = text.match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : null;
}

function overlapRatio(
  briefRange: { min: number; max: number },
  plantRange: { min: number; max: number },
): number {
  const overlapMin = Math.max(briefRange.min, plantRange.min);
  const overlapMax = Math.min(briefRange.max, plantRange.max);
  if (overlapMax < overlapMin) return 0;

  const overlap = overlapMax - overlapMin;
  const briefSpan = Math.max(briefRange.max - briefRange.min, 1);
  return overlap / briefSpan;
}

function getBriefLightLevel(light: string): "low" | "medium" | "high" | "unknown" {
  const text = normalize(light);
  if (/слаб|темн|мало|низк|искусствен/.test(text)) return "low";
  if (/ярк|солнеч|панорам|много света/.test(text)) return "high";
  if (/рассеян|средн|умерен/.test(text)) return "medium";
  return "unknown";
}

function getPlantLightLevel(plant: Plant): "low" | "medium" | "high" | "unknown" {
  const text = normalize(`${plant.light} ${plant.comment}`);
  const range = parseRange(plant.light);

  if (range) {
    const avg = (range.min + range.max) / 2;
    if (range.max <= 1000 || avg < 900) return "low";
    if (range.min >= 2000 || avg > 2400) return "high";
    return "medium";
  }

  if (/тенев|слабое освещ|офис/.test(text)) return "low";
  if (/ярк|солнеч|прям/.test(text)) return "high";
  if (/рассеян/.test(text)) return "medium";
  return "unknown";
}

function scoreLight(brief: Brief, plant: Plant, difficulty: Difficulty): { score: number; pros: string[]; risks: string[] } {
  const max = 25;
  const briefLevel = getBriefLightLevel(brief.light);
  const plantLevel = getPlantLightLevel(plant);
  const pros: string[] = [];
  const risks: string[] = [];

  let score = max * 0.55;

  if (briefLevel === plantLevel && briefLevel !== "unknown") {
    score = max;
    pros.push("Освещённость соответствует условиям помещения.");
  } else if (briefLevel === "low" && plantLevel === "medium") {
    score = max * 0.75;
    pros.push("Растение может переносить умеренный свет.");
  } else if (briefLevel === "low" && plantLevel === "high") {
    score = max * 0.25;
    risks.push("Растению нужен более яркий свет, чем есть в помещении.");
  } else if (briefLevel === "high" && plantLevel === "medium") {
    score = max * 0.7;
    pros.push("При ярком рассеянном свете растение может чувствовать себя хорошо.");
  } else if (briefLevel === "high" && plantLevel === "low") {
    score = max * 0.2;
    risks.push("Для выразительного роста не хватает света.");
  } else if (briefLevel === "medium" && plantLevel !== "unknown") {
    score = plantLevel === "medium" ? max * 0.9 : max * 0.6;
  }

  const briefRange = parseRange(brief.light);
  const plantRange = parseRange(plant.light);
  if (briefRange && plantRange) {
    const ratio = overlapRatio(briefRange, plantRange);
    score = Math.max(score, max * Math.max(ratio, 0.25));
  }

  if (/теневынослив/.test(normalize(plant.comment)) && briefLevel === "low") {
    score = Math.min(max, score + 4);
    pros.push("Комментарий подтверждает теневыносливость.");
  }

  if (/яркий свет/.test(normalize(plant.comment)) && briefLevel === "low") {
    score = Math.max(0, score - 6);
    risks.push("В описании указана потребность в ярком свете.");
  }

  if (difficulty === "novice") score = Math.min(max, score * 1.08 + 1.5);
  if (difficulty === "pro") score = score * 0.92;

  return { score: Math.min(max, Math.round(score)), pros, risks };
}

function scoreHumidity(brief: Brief, plant: Plant, difficulty: Difficulty): { score: number; pros: string[]; risks: string[] } {
  const max = 20;
  const pros: string[] = [];
  const risks: string[] = [];
  const briefRange = parseRange(brief.humidity) ?? { min: 40, max: 55 };
  const plantRange = parseRange(plant.humidity);
  let score = max * 0.5;

  if (plantRange) {
    const ratio = overlapRatio(briefRange, plantRange);
    score = max * Math.max(ratio, 0.2);
    if (ratio >= 0.6) pros.push("Диапазон влажности совпадает с условиями помещения.");
    if (ratio < 0.3) risks.push("Растение рассчитано на другую влажность воздуха.");
  }

  const text = normalize(`${plant.comment} ${brief.humidity}`);
  if (/ванн|влажн/.test(normalize(brief.roomType + brief.description)) && /влажн|ванн/.test(normalize(plant.comment))) {
    score = Math.min(max, score + 4);
    pros.push("Растение подходит для влажных помещений.");
  }

  if (/сух|офис|низк/.test(normalize(brief.description + brief.humidity)) && /сух|переносит сухой/.test(normalize(plant.comment))) {
    score = Math.min(max, score + 4);
    pros.push("Хорошо переносит сухой воздух.");
  }

  if (/требует высокой влажности|капризн/.test(normalize(plant.comment)) && briefRange.max <= 45) {
    score = Math.max(0, score - 7);
    risks.push("Растение требовательно к влажности для сухого помещения.");
  }

  if (difficulty === "novice") score = Math.min(max, score * 1.08 + 1);
  if (difficulty === "pro") score = score * 0.9;

  return { score: Math.min(max, Math.round(score)), pros, risks };
}

function scoreTemperature(brief: Brief, plant: Plant, difficulty: Difficulty): { score: number; pros: string[]; risks: string[] } {
  const max = 15;
  const pros: string[] = [];
  const risks: string[] = [];
  const briefRange = parseRange(brief.temperature);
  const plantRange = parseRange(plant.temperature);
  let score = max * 0.55;

  if (briefRange && plantRange) {
    const ratio = overlapRatio(briefRange, plantRange);
    score = max * Math.max(ratio, 0.25);
    if (ratio >= 0.5) pros.push("Температурный режим подходит.");
    if (ratio < 0.25) risks.push("Температурные требования расходятся.");
  } else {
    const briefMid = briefRange ? (briefRange.min + briefRange.max) / 2 : 22;
    const plantMid = plantRange
      ? (plantRange.min + plantRange.max) / 2
      : parseSingleNumber(plant.temperature) ?? 22;
    const delta = Math.abs(briefMid - plantMid);
    score = max * Math.max(0.2, 1 - delta / 10);
  }

  if (difficulty === "novice") score = Math.min(max, score + 1.5);
  if (difficulty === "pro") score = score * 0.92;

  return { score: Math.min(max, Math.round(score)), pros, risks };
}

function scorePetSafety(brief: Brief, plant: Plant, difficulty: Difficulty): { score: number; pros: string[]; risks: string[] } {
  const max = brief.hasPets ? 20 : 0;
  const pros: string[] = [];
  const risks: string[] = [];

  if (!brief.hasPets) {
    return { score: 0, pros, risks };
  }

  let score = max * 0.5;

  if (plant.petSafe === true) {
    score = max;
    pros.push("Безопасно для домашних животных.");
  } else if (plant.petSafe === false) {
    score = difficulty === "novice" ? max * 0.25 : 0;
    risks.push("Растение токсично или опасно для питомцев.");
  } else {
    score = max * 0.45;
    risks.push("Безопасность для животных не подтверждена.");
  }

  if (plant.toxicity && plant.petSafe === false) {
    score = Math.min(score, difficulty === "pro" ? 0 : max * 0.15);
  }

  return { score: Math.round(score), pros, risks };
}

function scoreRequirements(brief: Brief, plant: Plant, difficulty: Difficulty): { score: number; pros: string[]; risks: string[] } {
  const max = 20;
  const pros: string[] = [];
  const risks: string[] = [];
  let score = max * 0.45;
  const comment = normalize(plant.comment);
  const requirements = brief.requirements.map(normalize).join(" ");

  const positiveKeywords = ["неприхотлив", "теневынослив", "устойчив", "офис", "декоратив"];
  const negativeKeywords = ["капризн", "требует высокой влажности", "яркий свет", "сложн"];

  for (const keyword of positiveKeywords) {
    if (comment.includes(keyword) && requirements.includes(keyword.slice(0, 5))) {
      score += 2.5;
      pros.push(`Соответствует требованию: «${keyword}».`);
    }
  }

  for (const keyword of negativeKeywords) {
    if (comment.includes(keyword)) {
      if (/сух|офис|низк/.test(requirements) || /темн|слаб/.test(requirements)) {
        score -= 3;
        risks.push(`Описание предупреждает: «${keyword}».`);
      }
    }
  }

  if (/декоратив/.test(requirements) && /декоратив|выразит/.test(comment + plant.category)) {
    score += 3;
    pros.push("Подходит по декоративной задаче.");
  }

  if (/кафе|обществен/.test(normalize(brief.roomType + brief.description)) && /устойчив|неприхотлив/.test(comment)) {
    score += 3;
    pros.push("Подходит для общественного пространства.");
  }

  if (difficulty === "novice") score += 2;
  if (difficulty === "pro" && risks.length > 0) score -= 2;

  return { score: Math.min(max, Math.max(0, Math.round(score))), pros, risks };
}

function getResultLevel(totalScore: number): string {
  if (totalScore >= 90) return "Профессиональный подбор";
  if (totalScore >= 70) return "Хорошее решение";
  if (totalScore >= 50) return "Есть спорные растения";
  return "Подбор нужно доработать";
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function buildRecommendation(score: number, risks: string[]): string {
  if (score >= 85) return "Оставить в подборе — хороший выбор для этого брифа.";
  if (score >= 65) return "Можно оставить, но проконтролируйте уход и условия.";
  if (risks.length > 0) return "Лучше заменить на более подходящий вариант из каталога.";
  return "Стоит рассмотреть альтернативу с более точным попаданием в условия.";
}

export function scorePlant(brief: Brief, plant: Plant, difficulty: Difficulty): PlantScoreEntry {
  const light = scoreLight(brief, plant, difficulty);
  const humidity = scoreHumidity(brief, plant, difficulty);
  const temperature = scoreTemperature(brief, plant, difficulty);
  const pets = scorePetSafety(brief, plant, difficulty);
  const requirements = scoreRequirements(brief, plant, difficulty);

  const baseTotal = light.score + humidity.score + temperature.score + pets.score + requirements.score;
  const maxPossible = brief.hasPets ? 100 : 80;
  const normalized = Math.round((baseTotal / maxPossible) * 100);

  const pros = unique([...light.pros, ...humidity.pros, ...temperature.pros, ...pets.pros, ...requirements.pros]);
  const risks = unique([...light.risks, ...humidity.risks, ...temperature.risks, ...pets.risks, ...requirements.risks]);

  return {
    plantId: plant.id,
    plantName: plant.nameRu,
    score: Math.min(100, normalized),
    pros,
    risks,
    recommendation: buildRecommendation(normalized, risks),
  };
}

export function scoreSelection(
  brief: Brief,
  plants: Plant[],
  selectedIds: string[],
  difficulty: Difficulty,
): ScoreResult {
  const selectedPlants = selectedIds
    .map((id) => plants.find((plant) => plant.id === id))
    .filter((plant): plant is Plant => Boolean(plant));

  const plantResults = selectedPlants.map((plant) => scorePlant(brief, plant, difficulty));
  const totalScore =
    plantResults.length > 0
      ? Math.round(plantResults.reduce((sum, item) => sum + item.score, 0) / plantResults.length)
      : 0;

  const strengths: string[] = [];
  const mistakes: string[] = [];
  const recommendations: string[] = [];

  const strongPlants = plantResults.filter((item) => item.score >= 80);
  const weakPlants = plantResults.filter((item) => item.score < 60);

  if (strongPlants.length > 0) {
    strengths.push(
      `Удачные позиции: ${strongPlants.map((item) => item.plantName).join(", ")}.`,
    );
  }

  if (brief.hasPets && selectedPlants.some((plant) => plant.petSafe === false)) {
    mistakes.push("В подбор попали растения, небезопасные для животных.");
    recommendations.push("Сначала отфильтруйте каталог по безопасности для питомцев.");
  }

  if (getBriefLightLevel(brief.light) === "low" && selectedPlants.some((plant) => getPlantLightLevel(plant) === "high")) {
    mistakes.push("Есть растения, которым нужен более яркий свет, чем в помещении.");
    recommendations.push("Для тёмных зон выбирайте теневыносливые виды.");
  }

  if (weakPlants.length > 0) {
    mistakes.push(`Слабые позиции: ${weakPlants.map((item) => item.plantName).join(", ")}.`);
    recommendations.push("Замените спорные растения на варианты с более высоким баллом.");
  }

  if (selectedPlants.length < brief.minPlants) {
    mistakes.push(`Недостаточно растений: нужно минимум ${brief.minPlants}.`);
  }

  if (selectedPlants.length > brief.maxPlants) {
    mistakes.push(`Слишком много растений: максимум ${brief.maxPlants}.`);
  }

  if (strengths.length === 0 && totalScore >= 70) {
    strengths.push("Подбор сбалансирован и закрывает основные условия брифа.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Проверьте полив, свет и влажность перед финальной сдачей проекта клиенту.");
  }

  return {
    totalScore,
    level: getResultLevel(totalScore),
    plantResults,
    strengths: unique(strengths),
    mistakes: unique(mistakes),
    recommendations: unique(recommendations),
  };
}
