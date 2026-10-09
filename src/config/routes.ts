/** Маршруты продукта «Подбор растений».
 *  GitHub Pages остаётся запасным адресом исходного репозитория.
 *  Сборка unified dist подставляет маршруты одного сайта.
 */
const UNIFIED_ROUTES = {
  home: "/",
  indoor: "/indoor/",
  garden: "/garden/",
  trainer: "/trainer/",
} as const;

const GITHUB_ROUTES = {
  home: "https://victoriiamikhaleva.github.io/Choose_your_plant/",
  indoor:
    "https://victoriiamikhaleva.github.io/Choose_your_plant/plant_selector_catalog_v6_photos_lux_fixed.html",
  garden: "https://victoriiamikhaleva.github.io/garden_plants/garden_catalog.html",
  trainer: "https://victoriiamikhaleva.github.io/Fitodesigner/",
} as const;

export const PLANT_ROUTES = __TRAINER_UNIFIED__ ? UNIFIED_ROUTES : GITHUB_ROUTES;
