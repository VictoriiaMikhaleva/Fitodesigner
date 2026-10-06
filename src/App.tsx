import { useMemo, useState } from "react";
import { ContactFooter } from "./components/ContactFooter";
import { Header } from "./components/Header";
import { HomeScreen } from "./components/HomeScreen";
import { PlantCatalog } from "./components/PlantCatalog";
import { TrainingScreen } from "./components/TrainingScreen";
import { hasPlantsData, plants } from "./data/plantsLoader";
import type { AppScreen } from "./types";
import { loadProgress, type GameProgress } from "./utils/gameProgress";

export function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [catalogSelection, setCatalogSelection] = useState<string[]>([]);
  const [progress, setProgress] = useState<GameProgress>(() => loadProgress());
  const plantsAvailable = useMemo(() => hasPlantsData(), []);

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
        {screen === "home" && (
          <HomeScreen
            plantsCount={plants.length}
            progress={progress}
            onStartTraining={() => setScreen("training")}
            onOpenCatalog={() => setScreen("catalog")}
          />
        )}

        {screen === "training" && (
          <TrainingScreen
            plants={plants}
            progress={progress}
            onProgressChange={setProgress}
            onBackHome={() => setScreen("home")}
          />
        )}

        {screen === "catalog" && (
          <PlantCatalog
            plants={plants}
            selectedIds={catalogSelection}
            title="Каталог комнатных растений"
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
    </div>
  );
}
