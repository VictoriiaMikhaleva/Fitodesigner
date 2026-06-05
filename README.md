# Fitodesigner

Обучающий тренажёр «Фитодизайнер» — подбор растений под бриф клиента.

## Запуск локально

```bash
npm install
npm run convert:plants   # если нужно пересобрать plants.json из Excel
npm run dev
```

## GitHub Pages

Сайт: **https://victoriiamikhaleva.github.io/Fitodesigner/**

### Почему был белый экран

GitHub Pages публиковал **исходники** из ветки `main` (файл `index.html` со ссылкой на `/src/main.tsx`).
Браузер не может выполнить TypeScript напрямую — нужна **production-сборка** из папки `dist`.

### Как включить (один раз)

1. Откройте репозиторий на GitHub → **Settings** → **Pages**
2. В **Build and deployment → Source** выберите **Deploy from a branch**
3. **Branch:** `gh-pages` → папка **`/ (root)`** → **Save**
4. После push в `main` workflow соберёт проект и обновит ветку `gh-pages`

> Не используйте ветку `main` как источник Pages — там лежит код для разработки, а не готовый сайт.

### Проверка деплоя

- **Actions** → workflow «Deploy to GitHub Pages» должен быть зелёным
- На ветке `gh-pages` должен появиться `index.html` с путями вида `/Fitodesigner/assets/...`

Локальная production-сборка:

```bash
npm run build
npm run preview
# открыть http://localhost:4173/Fitodesigner/
```

## Игра

- XP и уровни за каждый бриф
- Серия успешных раундов (70+ баллов)
- Достижения и анимации результата
- Прогресс сохраняется в `localStorage`
