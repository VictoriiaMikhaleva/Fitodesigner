import type { Difficulty, ScoreResult } from "../types";

export type AchievementId =
  | "first-brief"
  | "pet-guardian"
  | "shadow-master"
  | "pro-picker"
  | "hot-streak"
  | "perfect-round";

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
};

export type GameProgress = {
  xp: number;
  level: number;
  streak: number;
  bestScore: number;
  roundsPlayed: number;
  achievements: AchievementId[];
};

const STORAGE_KEY = "fitodesigner.progress";

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  "first-brief": {
    id: "first-brief",
    title: "Первый бриф",
    description: "Завершите первую тренировку",
    icon: "🌱",
  },
  "pet-guardian": {
    id: "pet-guardian",
    title: "Защитник питомцев",
    description: "Наберите 80+ баллов в брифе с животными",
    icon: "🐾",
  },
  "shadow-master": {
    id: "shadow-master",
    title: "Теневой мастер",
    description: "Отличный подбор для тёмного помещения",
    icon: "🌙",
  },
  "pro-picker": {
    id: "pro-picker",
    title: "Профи-подбор",
    description: "90+ баллов на уровне «Профи»",
    icon: "🏆",
  },
  "hot-streak": {
    id: "hot-streak",
    title: "Горячая серия",
    description: "3 успешных брифа подряд (70+ баллов)",
    icon: "🔥",
  },
  "perfect-round": {
    id: "perfect-round",
    title: "Идеальный раунд",
    description: "100 баллов за один бриф",
    icon: "✨",
  },
};

const LEVEL_TITLES = [
  "Стажёр",
  "Ассистент",
  "Фитодизайнер",
  "Эксперт",
  "Мастер зелени",
];

export function getDefaultProgress(): GameProgress {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    bestScore: 0,
    roundsPlayed: 0,
    achievements: [],
  };
}

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    return { ...getDefaultProgress(), ...JSON.parse(raw) };
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: GameProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function xpForLevel(level: number): number {
  return level * 100;
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? "Мастер";
}

export function getXpProgress(progress: GameProgress): { current: number; max: number; percent: number } {
  let spent = 0;
  for (let level = 1; level < progress.level; level += 1) {
    spent += xpForLevel(level);
  }

  const max = xpForLevel(progress.level);
  const current = Math.max(0, progress.xp - spent);
  const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;

  return { current, max, percent };
}

function levelFromXp(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return level;
}

type RoundMeta = {
  briefId: string;
  difficulty: Difficulty;
  hasPets: boolean;
};

function detectAchievements(
  progress: GameProgress,
  result: ScoreResult,
  meta: RoundMeta,
): AchievementId[] {
  const unlocked: AchievementId[] = [];
  const has = (id: AchievementId) => progress.achievements.includes(id);

  if (!has("first-brief") && progress.roundsPlayed >= 0) {
    unlocked.push("first-brief");
  }

  if (!has("pet-guardian") && meta.hasPets && result.totalScore >= 80) {
    unlocked.push("pet-guardian");
  }

  if (!has("shadow-master") && meta.briefId === "dark-corridor" && result.totalScore >= 80) {
    unlocked.push("shadow-master");
  }

  if (!has("pro-picker") && meta.difficulty === "pro" && result.totalScore >= 90) {
    unlocked.push("pro-picker");
  }

  if (!has("perfect-round") && result.totalScore >= 100) {
    unlocked.push("perfect-round");
  }

  const nextStreak = result.totalScore >= 70 ? progress.streak + 1 : 0;
  if (!has("hot-streak") && nextStreak >= 3) {
    unlocked.push("hot-streak");
  }

  return unlocked;
}

export type RoundUpdate = {
  progress: GameProgress;
  xpGained: number;
  leveledUp: boolean;
  newAchievements: Achievement[];
};

export function applyRoundResult(
  progress: GameProgress,
  result: ScoreResult,
  meta: RoundMeta,
): RoundUpdate {
  const streak = result.totalScore >= 70 ? progress.streak + 1 : 0;
  const baseXp = Math.round(result.totalScore / 10);
  const streakBonus = streak > 1 ? Math.min(streak * 2, 10) : 0;
  const xpGained = baseXp + streakBonus;

  const draft: GameProgress = {
    ...progress,
    xp: progress.xp + xpGained,
    streak,
    bestScore: Math.max(progress.bestScore, result.totalScore),
    roundsPlayed: progress.roundsPlayed + 1,
    achievements: [...progress.achievements],
  };

  const newAchievementIds = detectAchievements(progress, result, meta).filter(
    (id) => !draft.achievements.includes(id),
  );
  draft.achievements.push(...newAchievementIds);

  const previousLevel = progress.level;
  draft.level = levelFromXp(draft.xp);

  saveProgress(draft);

  return {
    progress: draft,
    xpGained,
    leveledUp: draft.level > previousLevel,
    newAchievements: newAchievementIds.map((id) => ACHIEVEMENTS[id]),
  };
}
