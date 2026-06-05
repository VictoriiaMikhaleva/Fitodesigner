import { useCallback, useEffect, useMemo, useState } from "react";
import { pickRandomBrief } from "../data/briefs";
import type { Brief, Difficulty, Plant, ScoreResult, TrainingPhase } from "../types";
import {
  applyRoundResult,
  getLevelTitle,
  type GameProgress,
  type RoundUpdate,
} from "../utils/gameProgress";
import { scoreSelection } from "../utils/scoring";
import { AchievementPopup } from "./AchievementPopup";
import { BriefCard } from "./BriefCard";
import { Confetti } from "./Confetti";
import { DesignerTip } from "./DesignerTip";
import { DifficultySelector } from "./DifficultySelector";
import { GameToast, type ToastMessage } from "./GameToast";
import { MissionProgress } from "./MissionProgress";
import { PlantCatalog } from "./PlantCatalog";
import { ScoreResult as ScoreResultView } from "./ScoreResult";
import { SelectedPlantsPanel } from "./SelectedPlantsPanel";

type TrainingScreenProps = {
  plants: Plant[];
  progress: GameProgress;
  onProgressChange: (progress: GameProgress) => void;
  onBackHome: () => void;
};

function createToast(text: string, tone: ToastMessage["tone"] = "info"): ToastMessage {
  return { id: `${Date.now()}-${Math.random()}`, text, tone };
}

export function TrainingScreen({
  plants,
  progress,
  onProgressChange,
  onBackHome,
}: TrainingScreenProps) {
  const [phase, setPhase] = useState<TrainingPhase>("difficulty");
  const [difficulty, setDifficulty] = useState<Difficulty>("novice");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [roundUpdate, setRoundUpdate] = useState<RoundUpdate | null>(null);
  const [explanation, setExplanation] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  const showHints = difficulty === "novice" || (difficulty === "practitioner" && phase === "result");

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((text: string, tone: ToastMessage["tone"] = "info") => {
    setToasts((current) => [...current.slice(-2), createToast(text, tone)]);
  }, []);

  const startBrief = (nextDifficulty = difficulty) => {
    const nextBrief = pickRandomBrief(nextDifficulty, brief?.id);
    setDifficulty(nextDifficulty);
    setBrief(nextBrief);
    setSelectedIds([]);
    setResult(null);
    setRoundUpdate(null);
    setExplanation("");
    setElapsedSec(0);
    setShowConfetti(false);
    setShowAchievementPopup(false);
    setPhase("active");
    pushToast(`Новая миссия: «${nextBrief.title}»`, "info");
  };

  useEffect(() => {
    if (phase !== "active" || !brief) return;

    const timer = window.setInterval(() => {
      setElapsedSec((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase, brief]);

  useEffect(() => {
    if (!showConfetti) return;
    const timer = window.setTimeout(() => setShowConfetti(false), 3200);
    return () => window.clearTimeout(timer);
  }, [showConfetti]);

  const togglePlant = (plant: Plant) => {
    if (!brief) return;

    setSelectedIds((current) => {
      if (current.includes(plant.id)) {
        pushToast(`${plant.nameRu} убрано из подбора`, "warning");
        return current.filter((id) => id !== plant.id);
      }

      if (current.length >= brief.maxPlants) {
        pushToast(`Лимит ${brief.maxPlants} растений — удалите одно, чтобы добавить новое`, "warning");
        return current;
      }

      const next = [...current, plant.id];
      pushToast(`+ ${plant.nameRu} (${next.length}/${brief.maxPlants})`, "success");
      return next;
    });
  };

  const handleCheck = () => {
    if (!brief) return;

    const nextResult = scoreSelection(brief, plants, selectedIds, difficulty);
    const update = applyRoundResult(progress, nextResult, {
      briefId: brief.id,
      difficulty,
      hasPets: brief.hasPets,
    });

    setResult(nextResult);
    setRoundUpdate(update);
    onProgressChange(update.progress);
    setPhase("result");
    setShowAchievementPopup(true);

    if (nextResult.totalScore >= 90) {
      setShowConfetti(true);
    }

    if (nextResult.totalScore >= 70) {
      pushToast(`Отлично! +${update.xpGained} XP`, "success");
    } else {
      pushToast("Есть над чем поработать — разберите ошибки и попробуйте снова", "warning");
    }
  };

  const missionSteps = useMemo(() => {
    if (!brief) return [];

    return [
      {
        id: "read",
        label: "Изучите бриф",
        done: true,
        active: phase === "active" && selectedIds.length === 0,
      },
      {
        id: "pick",
        label: `Соберите ${brief.minPlants}–${brief.maxPlants} растений`,
        done: selectedIds.length >= brief.minPlants,
        active: phase === "active" && selectedIds.length > 0 && selectedIds.length < brief.minPlants,
      },
      {
        id: "check",
        label: "Проверьте решение",
        done: phase === "result",
        active: phase === "active" && selectedIds.length >= brief.minPlants,
      },
    ];
  }, [brief, phase, selectedIds.length]);

  const proExplanationMissing = useMemo(
    () => difficulty === "pro" && phase === "active" && explanation.trim().length < 20,
    [difficulty, explanation, phase],
  );

  if (phase === "difficulty") {
    return (
      <div className="space-y-6">
        <section className="card p-6">
          <h2 className="text-2xl font-semibold text-sage-800">Выберите уровень сложности</h2>
          <p className="mt-2 text-sage-600">
            За каждый бриф вы получаете XP, серию успехов и достижения. Чем сложнее уровень — тем строже
            оценка.
          </p>
          <div className="mt-5">
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={() => startBrief()}>
              Получить бриф
            </button>
            <button type="button" className="btn-secondary" onClick={onBackHome}>
              Вернуться на главный экран
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!brief) return null;

  return (
    <>
      <GameToast toasts={toasts} onDismiss={dismissToast} />
      {showConfetti && <Confetti />}

      {showAchievementPopup && roundUpdate && (
        <AchievementPopup
          achievements={roundUpdate.newAchievements}
          xpGained={roundUpdate.xpGained}
          leveledUp={roundUpdate.leveledUp}
          levelTitle={getLevelTitle(roundUpdate.progress.level)}
          onClose={() => setShowAchievementPopup(false)}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-secondary" onClick={() => startBrief()}>
              Новый бриф
            </button>
            <button type="button" className="btn-secondary" onClick={onBackHome}>
              Вернуться на главный экран
            </button>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm text-sage-700 shadow-sm">
            ⏱ {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, "0")}
          </div>
        </div>

        <MissionProgress steps={missionSteps} />
        <BriefCard brief={brief} />
        <DesignerTip brief={brief} result={result ?? undefined} showHints={showHints} />

        {difficulty === "pro" && phase === "active" && (
          <section className="card p-5">
            <label className="block">
              <span className="field-label">Объясните свой подбор</span>
              <textarea
                className="field-input min-h-28"
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                placeholder="Почему вы выбрали именно эти растения для условий брифа?"
              />
            </label>
            {proExplanationMissing && (
              <p className="mt-2 text-sm text-amber-700">
                На уровне «Профи» желательно кратко объяснить логику подбора перед проверкой.
              </p>
            )}
          </section>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <PlantCatalog
            plants={plants}
            selectedIds={selectedIds}
            maxPlants={brief.maxPlants}
            onTogglePlant={togglePlant}
          />

          <SelectedPlantsPanel
            brief={brief}
            plants={plants}
            selectedIds={selectedIds}
            onRemove={(plantId) => {
              setSelectedIds((current) => current.filter((id) => id !== plantId));
              pushToast("Растение удалено из подбора", "info");
            }}
            onCheck={handleCheck}
          />
        </div>

        {result && (
          <>
            <ScoreResultView result={result} xpGained={roundUpdate?.xpGained} />
            <DesignerTip brief={brief} result={result} showHints />
          </>
        )}
      </div>
    </>
  );
}
