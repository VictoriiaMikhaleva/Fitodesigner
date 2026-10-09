import type { Brief, Difficulty, Plant, PlantScoreEntry, ScoreResult } from "../types";
import { discreteOverlap, moistureOverlaps, parseBound } from "./gardenFilters";

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function applyDifficulty(score: number, max: number, difficulty: Difficulty): number {
  let next = score;
  if (difficulty === "novice") next = Math.min(max, next * 1.08 + 1.5);
  if (difficulty === "pro") next = next * 0.92;
  return Math.min(max, Math.max(0, Math.round(next)));
}

function levelFromScore(totalScore: number): string {
  if (totalScore >= 90) return "Профессиональный подбор";
  if (totalScore >= 70) return "Хорошее решение";
  if (totalScore >= 50) return "Есть спорные растения";
  return "Подбор нужно доработать";
}

function recommendation(score: number, risks: string[]): string {
  if (score >= 85) return "Оставить в подборе — карточка подходит под это задание.";
  if (score >= 65) return "Можно оставить, но сверьте солнце, окраску и срок цветения.";
  if (risks.length > 0) return "Лучше заменить на другую карточку из садового каталога.";
  return "Стоит выбрать вариант, который точнее попадает в условия задания.";
}

type Part = { score: number; max: number; pros: string[]; risks: string[] };

function scoreSun(brief: Brief, plant: Plant, difficulty: Difficulty): Part {
  const max = 25;
  const task = brief.garden;
  const profile = plant.garden;
  const pros: string[] = [];
  const risks: string[] = [];
  if (!task || !profile) return { score: 0, max, pros, risks };

  const sun = parseBound(profile.sun);
  const ratio = sun ? discreteOverlap(sun, task.sun) : 0;
  const raw = ratio > 0 ? max * ratio : max * 0.2;
  if (ratio >= 0.99) pros.push(`Солнце карточки подходит: ${profile.sunLabel}.`);
  else if (ratio > 0) pros.push("Диапазон солнца частично совпадает с заданием.");
  else risks.push(`Солнце карточки не пересекается с заданием: ${profile.sunLabel}.`);

  return { score: applyDifficulty(raw, max, difficulty), max, pros, risks };
}

function scoreBloom(brief: Brief, plant: Plant, difficulty: Difficulty): Part | null {
  const task = brief.garden;
  const profile = plant.garden;
  if (!task?.bloom || !profile) return null;
  const max = 15;
  const bloom = parseBound(profile.bloom);
  const ratio = bloom ? discreteOverlap(bloom, task.bloom) : 0;
  const pros: string[] = [];
  const risks: string[] = [];
  if (ratio >= 0.99) pros.push(`Срок цветения подходит: ${profile.bloomNote}.`);
  else if (ratio > 0) pros.push(`Цветение частично попадает в срок задания: ${profile.bloomNote}.`);
  else risks.push(`Цветение не попадает в срок задания: ${profile.bloomNote}.`);
  return { score: applyDifficulty(ratio > 0 ? max * ratio : max * 0.2, max, difficulty), max, pros, risks };
}

function scoreMoisture(brief: Brief, plant: Plant, difficulty: Difficulty): Part | null {
  const task = brief.garden;
  const profile = plant.garden;
  if (!task?.moisture?.length || !profile) return null;
  const max = 20;
  const match = moistureOverlaps(plant, task.moisture);
  const pros: string[] = [];
  const risks: string[] = [];
  if (match) pros.push(`Почва подходит: ${profile.moistureLabel}.`);
  else risks.push(`Почва карточки другая: ${profile.moistureLabel}.`);
  return { score: applyDifficulty(match ? max : max * 0.2, max, difficulty), max, pros, risks };
}

function scoreColor(brief: Brief, plant: Plant, difficulty: Difficulty): Part | null {
  const task = brief.garden;
  const profile = plant.garden;
  if (!task?.colors?.length || !profile) return null;
  const max = 20;
  const match = task.colors.includes(profile.color);
  const pros: string[] = [];
  const risks: string[] = [];
  if (match) pros.push(`Окраска совпадает с заданием: ${profile.colorLabel}.`);
  else risks.push(`Нужна другая окраска. У этой карточки: ${profile.colorLabel}.`);
  const raw = match ? max : difficulty === "novice" ? max * 0.25 : 0;
  return { score: applyDifficulty(raw, max, difficulty), max, pros, risks };
}

function scoreWintering(brief: Brief, plant: Plant, difficulty: Difficulty): Part {
  const max = 20;
  const task = brief.garden;
  const profile = plant.garden;
  const pros: string[] = [];
  const risks: string[] = [];
  if (!task || !profile) return { score: 0, max, pros, risks };

  if (!task.wintering) {
    return { score: applyDifficulty(max * 0.8, max, difficulty), max, pros, risks };
  }

  const match = profile.russiaWintering === task.wintering;
  if (match) pros.push(`Зимовка совпадает: ${profile.russiaWintering}.`);
  else risks.push(`Зимовка другая: ${profile.russiaWintering}.`);
  return { score: applyDifficulty(match ? max : max * 0.2, max, difficulty), max, pros, risks };
}

export function scoreGardenPlant(brief: Brief, plant: Plant, difficulty: Difficulty): PlantScoreEntry {
  const parts = [
    scoreSun(brief, plant, difficulty),
    scoreBloom(brief, plant, difficulty),
    scoreMoisture(brief, plant, difficulty),
    scoreColor(brief, plant, difficulty),
    scoreWintering(brief, plant, difficulty),
  ].filter((part): part is Part => Boolean(part));

  const total = parts.reduce((sum, part) => sum + part.score, 0);
  const maxPossible = parts.reduce((sum, part) => sum + part.max, 0);
  const normalized = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;
  const pros = unique(parts.flatMap((part) => part.pros));
  const risks = unique(parts.flatMap((part) => part.risks));
  const score = Math.min(100, normalized);

  return {
    plantId: plant.id,
    plantName: plant.nameRu,
    score,
    pros,
    risks,
    recommendation: recommendation(score, risks),
  };
}

export function scoreGardenSelection(
  brief: Brief,
  plants: Plant[],
  selectedIds: string[],
  difficulty: Difficulty,
): ScoreResult {
  const selectedPlants = selectedIds
    .map((id) => plants.find((plant) => plant.id === id))
    .filter((plant): plant is Plant => Boolean(plant?.garden));

  const plantResults = selectedPlants.map((plant) => scoreGardenPlant(brief, plant, difficulty));
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
    strengths.push(`Удачные позиции: ${strongPlants.map((item) => item.plantName).join(", ")}.`);
  }

  const task = brief.garden;
  if (task?.colors?.length) {
    const wrongColor = selectedPlants.filter((plant) => !task.colors?.includes(plant.garden?.color || ""));
    if (wrongColor.length > 0) {
      mistakes.push(`Окраска не из задания: ${wrongColor.map((plant) => plant.nameRu).join(", ")}.`);
      recommendations.push("Смотрите поле окраски конкретной карточки, а не только название культуры.");
    }
  }

  if (task) {
    const wrongSun = selectedPlants.filter((plant) => {
      const sun = plant.garden ? parseBound(plant.garden.sun) : null;
      return !sun || discreteOverlap(sun, task.sun) <= 0;
    });
    if (wrongSun.length > 0) {
      mistakes.push(`Солнце не совпадает: ${wrongSun.map((plant) => plant.nameRu).join(", ")}.`);
      recommendations.push("Сначала отберите карточки, чей диапазон солнца пересекается с заданием.");
    }
  }

  if (weakPlants.length > 0) {
    mistakes.push(`Слабые позиции: ${weakPlants.map((item) => item.plantName).join(", ")}.`);
    recommendations.push("Замените спорные карточки на варианты с более точным попаданием.");
  }

  if (selectedPlants.length < brief.minPlants) {
    mistakes.push(`Недостаточно растений: нужно минимум ${brief.minPlants}.`);
  }

  if (selectedPlants.length > brief.maxPlants) {
    mistakes.push(`Слишком много растений: максимум ${brief.maxPlants}.`);
  }

  if (strengths.length === 0 && totalScore >= 70) {
    strengths.push("Подбор закрывает основные условия садового задания.");
  }

  if (recommendations.length === 0) {
    recommendations.push("В следующем раунде может встретиться другая окраска той же культуры.");
  }

  return {
    totalScore,
    level: levelFromScore(totalScore),
    plantResults,
    strengths: unique(strengths),
    mistakes: unique(mistakes),
    recommendations: unique(recommendations),
  };
}
