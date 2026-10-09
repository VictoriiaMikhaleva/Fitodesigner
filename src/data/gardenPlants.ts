import type { Plant } from "../types";
import gardenJson from "./garden-plants.json";

type GardenCardJson = {
  id: number;
  nameRu: string;
  nameLat: string;
  color: string;
  colorLabel: string;
  height: string;
  bloom: string;
  bloomNote: string;
  sun: string;
  sunLabel: string;
  photo: string;
  lifeCycle: string;
  gardenCycle: string;
  russiaWintering: string;
  soilMoistureMin: string;
  soilMoistureMax: string;
  moistureLabel: string;
};

const cards = gardenJson as GardenCardJson[];

export const gardenPlants: Plant[] = cards.map((card) => ({
  id: String(card.id),
  nameRu: card.nameRu,
  nameLat: card.nameLat,
  family: "",
  category: card.colorLabel,
  light: card.sun,
  humidity: "",
  temperature: "",
  watering: card.bloomNote,
  soil: card.moistureLabel,
  ph: "",
  petSafe: null,
  toxicity: "",
  comment: "",
  imageUrl: card.photo,
  garden: {
    sourceId: card.id,
    color: card.color,
    colorLabel: card.colorLabel,
    height: card.height,
    bloom: card.bloom,
    bloomNote: card.bloomNote,
    sun: card.sun,
    sunLabel: card.sunLabel,
    moistureLabel: card.moistureLabel,
    lifeCycle: card.lifeCycle,
    gardenCycle: card.gardenCycle,
    russiaWintering: card.russiaWintering,
    soilMoistureMin: card.soilMoistureMin,
    soilMoistureMax: card.soilMoistureMax,
  },
}));
