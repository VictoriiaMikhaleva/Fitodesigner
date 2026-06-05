type HeaderProps = {
  onHome: () => void;
  onCatalog: () => void;
};

export function Header({ onHome, onCatalog }: HeaderProps) {
  return (
    <header className="card flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <button type="button" onClick={onHome} className="text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-500">Fitodesigner</p>
        <h1 className="text-2xl font-semibold text-sage-800">Фитодизайнер</h1>
        <p className="mt-1 text-sm text-sage-600">Обучающий тренажёр по подбору растений для интерьера</p>
      </button>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={onCatalog}>
          Открыть каталог
        </button>
        <button type="button" className="btn-secondary" onClick={onHome}>
          На главный экран
        </button>
      </div>
    </header>
  );
}
