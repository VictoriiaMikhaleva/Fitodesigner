export type Plant = {
  id: string;
  nameRu: string;
  nameLat: string;
  family: string;
  category: string;
  light: string;
  humidity: string;
  temperature: string;
  watering: string;
  soil: string;
  ph: string;
  petSafe: boolean | null;
  toxicity: string;
  comment: string;
  imageUrl: string;
};

export type Difficulty = "novice" | "practitioner" | "pro";

export type Brief = {
  id: string;
  title: string;
  roomType: string;
  light: string;
  humidity: string;
  temperature: string;
  hasPets: boolean;
  requirements: string[];
  difficulty: Difficulty;
  minPlants: number;
  maxPlants: number;
  description: string;
};

export type PlantScoreEntry = {
  plantId: string;
  plantName: string;
  score: number;
  pros: string[];
  risks: string[];
  recommendation: string;
};

export type ScoreResult = {
  totalScore: number;
  level: string;
  plantResults: PlantScoreEntry[];
  strengths: string[];
  mistakes: string[];
  recommendations: string[];
};

export type AppScreen = "home" | "training" | "catalog";

export type TrainingPhase = "difficulty" | "active" | "result";

export type PlantFilters = {
  query: string;
  category: string;
  light: string;
  humidity: string;
  petSafeOnly: boolean;
};
