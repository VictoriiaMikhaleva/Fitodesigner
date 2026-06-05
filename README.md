# Fitodesigner

Обучающий тренажёр «Фитодизайнер» — подбор растений под бриф клиента.

## Запуск локально

```bash
npm install
npm run convert:plants   # если нужно пересобрать plants.json из Excel
npm run dev
```

## GitHub Pages

Сайт публикуется по адресу: **https://victoriiamikhaleva.github.io/Fitodesigner/**

### Почему раньше не открывалось

1. Не был задан `base: '/Fitodesigner/'` в Vite — браузер искал скрипты по `/assets/...` вместо `/Fitodesigner/assets/...`
2. Не было workflow для сборки и деплоя

### Как включить Pages

1. Запушьте код в ветку `main` на GitHub
2. Откройте **Settings → Pages**
3. В **Build and deployment → Source** выберите **GitHub Actions**
4. После push в `main` workflow `.github/workflows/deploy.yml` соберёт и опубликует сайт

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
