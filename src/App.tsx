import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { HomeScreen } from "./components/HomeScreen";
import { PlantCatalog } from "./components/PlantCatalog";
import { TrainingScreen } from "./components/TrainingScreen";
import { hasPlantsData, plants } from "./data/plantsLoader";
import type { AppScreen } from "./types";

export function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [catalogSelection, setCatalogSelection] = useState<string[]>([]);
  const plantsAvailable = useMemo(() => hasPlantsData(), []);

  if (!plantsAvailable) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
        <section className="card w-full p-8 text-center">
          <h1 className="text-3xl font-semibold text-sage-800">Фитодизайнер</h1>
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
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="space-y-6">
        <Header onHome={() => setScreen("home")} onCatalog={() => setScreen("catalog")} />

        {screen === "home" && (
          <HomeScreen
            plantsCount={plants.length}
            onStartTraining={() => setScreen("training")}
            onOpenCatalog={() => setScreen("catalog")}
          />
        )}

        {screen === "training" && (
          <TrainingScreen plants={plants} onBackHome={() => setScreen("home")} />
        )}

        {screen === "catalog" && (
          <PlantCatalog
            plants={plants}
            selectedIds={catalogSelection}
            title="Каталог растений"
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
    </div>
  );
}
