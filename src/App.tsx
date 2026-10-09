import { useMemo, useState } from "react";
import { AchievementPopup } from "./components/AchievementPopup";
import { CatalogModeSwitch } from "./components/CatalogModeSwitch";
import { ContactFooter } from "./components/ContactFooter";
import { Header } from "./components/Header";
import { HomeScreen } from "./components/HomeScreen";
import { PlantCatalog } from "./components/PlantCatalog";
import { TrainingScreen } from "./components/TrainingScreen";
import { plantsForCatalog } from "./data/catalogs";
import { hasPlantsData } from "./data/plantsLoader";
import type { AppScreen, CatalogMode } from "./types";
import { loadProgress, type GameProgress } from "./utils/gameProgress";

function readPreviewLevelReward(): number | null {
  if (!import.meta.env.DEV) return null;
  const raw = new URLSearchParams(window.location.search).get("previewLevelReward");
  if (!raw) return null;
  const level = Number(raw);
  return Number.isFinite(level) && level >= 1 ? Math.floor(level) : null;
}

export function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [catalog, setCatalog] = useState<CatalogMode>("indoor");
  const [catalogSelection, setCatalogSelection] = useState<string[]>([]);
  const [progress, setProgress] = useState<GameProgress>(() => loadProgress("indoor"));
  const [previewLevelReward, setPreviewLevelReward] = useState<number | null>(() => readPreviewLevelReward());
  const plantsAvailable = useMemo(() => hasPlantsData(), []);
  const activePlants = plantsForCatalog(catalog);

  const changeCatalog = (next: CatalogMode) => {
    if (next === catalog) return;
    setCatalog(next);
    setProgress(loadProgress(next));
    setCatalogSelection([]);
  };

  if (!plantsAvailable) {
    return (
      <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
        <section className="card w-full p-8 text-center">
          <h1 className="text-3xl font-medium text-sage-800">Тренажёр насмотренности</h1>
          <p className="mt-4 text-sage-700">
            Каталог растений пока пуст. Сначала положите Excel-файл в папку{" "}
            <code className="rounded bg-sage-100 px-2 py-1">/data</code> и выполните команду{" "}
            <code className="rounded bg-sage-100 px-2 py-1">npm run convert:plants</code>.
          </p>
          <p className="mt-3 text-sm text-sage-600">
            Ожидаемый файл: <strong>Каталог 100 растений для озеленения.xlsx</strong>
          </p>
        </section>
      </div>
      <ContactFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        onHome={() => setScreen("home")}
        onCatalog={() => setScreen("catalog")}
        progress={progress}
        showHud={screen !== "home"}
      />
      <div className="mx-auto max-w-[1540px] space-y-6 px-4 py-8 sm:px-7">
        <CatalogModeSwitch value={catalog} onChange={changeCatalog} />
        {screen === "home" && (
          <HomeScreen
            catalog={catalog}
            plantsCount={activePlants.length}
            progress={progress}
            onStartTraining={() => setScreen("training")}
            onOpenCatalog={() => setScreen("catalog")}
          />
        )}

        {screen === "training" && (
          <TrainingScreen
            key={catalog}
            catalog={catalog}
            plants={activePlants}
            progress={progress}
            onProgressChange={setProgress}
            onBackHome={() => setScreen("home")}
          />
        )}

        {screen === "catalog" && (
          <PlantCatalog
            key={catalog}
            catalog={catalog}
            plants={activePlants}
            selectedIds={catalogSelection}
            title={catalog === "garden" ? "Каталог садовых растений" : "Каталог комнатных растений"}
            onTogglePlant={(plant) =>
              setCatalogSelection((current) =>
                current.includes(plant.id)
                  ? current.filter((id) => id !== plant.id)
                  : [...current, plant.id],
              )
            }
          />
        )}
      </div>
      <ContactFooter />

      {previewLevelReward !== null && (
        <AchievementPopup
          roundsPlayed={previewLevelReward}
          xpGained={12}
          onClose={() => setPreviewLevelReward(null)}
        />
      )}
    </div>
  );
}
