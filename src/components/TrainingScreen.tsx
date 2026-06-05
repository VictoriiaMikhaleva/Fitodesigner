import { useMemo, useState } from "react";
import { pickRandomBrief } from "../data/briefs";
import type { Brief, Difficulty, Plant, ScoreResult, TrainingPhase } from "../types";
import { scoreSelection } from "../utils/scoring";
import { BriefCard } from "./BriefCard";
import { DesignerTip } from "./DesignerTip";
import { DifficultySelector } from "./DifficultySelector";
import { PlantCatalog } from "./PlantCatalog";
import { ScoreResult as ScoreResultView } from "./ScoreResult";
import { SelectedPlantsPanel } from "./SelectedPlantsPanel";

type TrainingScreenProps = {
  plants: Plant[];
  onBackHome: () => void;
};

export function TrainingScreen({ plants, onBackHome }: TrainingScreenProps) {
  const [phase, setPhase] = useState<TrainingPhase>("difficulty");
  const [difficulty, setDifficulty] = useState<Difficulty>("novice");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [explanation, setExplanation] = useState("");

  const showHints = difficulty === "novice" || (difficulty === "practitioner" && phase === "result");

  const startBrief = (nextDifficulty = difficulty) => {
    const nextBrief = pickRandomBrief(nextDifficulty, brief?.id);
    setDifficulty(nextDifficulty);
    setBrief(nextBrief);
    setSelectedIds([]);
    setResult(null);
    setExplanation("");
    setPhase("active");
  };

  const togglePlant = (plant: Plant) => {
    if (!brief) return;

    setSelectedIds((current) => {
      if (current.includes(plant.id)) {
        return current.filter((id) => id !== plant.id);
      }

      if (current.length >= brief.maxPlants) {
        return current;
      }

      return [...current, plant.id];
    });
  };

  const handleCheck = () => {
    if (!brief) return;

    const nextResult = scoreSelection(brief, plants, selectedIds, difficulty);
    setResult(nextResult);
    setPhase("result");
  };

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
            От уровня зависят бриф, подсказки, строгость оценки и необходимость объяснить выбор.
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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-secondary" onClick={() => startBrief()}>
          Новый бриф
        </button>
        <button type="button" className="btn-secondary" onClick={onBackHome}>
          Вернуться на главный экран
        </button>
      </div>

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
          onRemove={(plantId) => setSelectedIds((current) => current.filter((id) => id !== plantId))}
          onCheck={handleCheck}
        />
      </div>

      {result && (
        <>
          <ScoreResultView result={result} />
          <DesignerTip brief={brief} result={result} showHints />
        </>
      )}
    </div>
  );
}
