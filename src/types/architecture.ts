/**
 * AfriMacros System Architecture & Data Types
 * Tailored for North African / Algerian Metabolic Nutrition
 */

export interface MacroNutrients {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export interface Micronutrients {
  ironMg: number;       // Vital for North African nutritional markers
  sodiumMg: number;     // Key for broth/smen/spices water retention tracking
  potassiumMg: number;  // Fluid balance counter-weight
  calciumMg?: number;
  vitaminAMcg?: number;
  vitaminCMg?: number;
}

export interface CookingDynamics {
  method: 'steamed' | 'simmered_stew' | 'oven_baked' | 'pan_fried' | 'clay_pot_braised';
  oilAbsorptionCoefficient: number; // e.g. 1.0 = baseline, 1.25 = tagine oil retention
  moistureYieldFactor: number;      // raw-to-cooked multiplier (e.g. semolina 2.6x, meat 0.7x)
  brothEvaporationRate: number;     // percentage reduction during simmer
  cookingLossNotes: string;
}

export interface PortionUnit {
  id: string;
  nameFr: string;
  nameAr: string;
  grams: number;
  description: string;
}

export interface RegionalDish {
  id: string;
  nameFr: string;
  nameAr: string;
  transliteration: string;
  region: 'Algérois' | 'Oranais' | 'Constantinois' | 'Biskri / Saharan' | 'Kabyle' | 'National';
  category: 'Soups & Broths' | 'Steamed Pastas & Semolinas' | 'Baked Dishes' | 'Tajines & Meatballs' | 'Stuffed Vegetables' | 'Breads & Pastries';
  sauceType: 'Sauce Blanche (Merqa Beida)' | 'Sauce Rouge (Merqa Hamra)' | 'Sauce Jaune' | 'Broth / Frik Base' | 'Dry / Baked';
  cookingDynamics: CookingDynamics;
  macrosPer100g: MacroNutrients;
  micronutrientsPer100g: Micronutrients;
  standardPortionGrams: number;
  traditionalPortions: PortionUnit[];
  glycemicImpact: 'Low' | 'Moderate' | 'Sustained Complex';
  keyIngredients: string[];
  cookedToRawMultiplier: number;
  clinicalDietaryNotes: string;
}

export interface CookedRawConversion {
  id: string;
  ingredientNameFr: string;
  ingredientNameAr: string;
  category: 'Grains & Semolina' | 'Legumes' | 'Meats & Poultry' | 'Vegetables' | 'Baking Mixes';
  rawWeightGrams: number;
  cookedWeightGrams: number;
  conversionMultiplier: number; // Cooked Weight / Raw Weight
  waterAbsorptionPct: number;
  fatRetentionPct: number;
  cookingMethod: string;
  practicalGuidance: string;
}

export interface DailyLogEntry {
  day: number;
  date: string;
  rawWeightKg: number;
  smoothedWeightKg: number;
  caloricIntake: number;
  smoothedIntake: number;
  estimatedTdee: number;
  carbsGrams: number;
  proteinGrams: number;
  fatGrams: number;
  sodiumMg: number;
  waterIntakeMl: number;
  physiologicalEvent?: string;
}

export interface MetabolicParameters {
  alphaWeight: number;      // EWMA smoothing factor for weight (default 0.12)
  alphaIntake: number;      // EWMA smoothing factor for intake (default 0.14)
  caloricTissueEquivalent: number; // 7700 kcal per kg of tissue change
  targetWeeklyChangeKg: number;    // e.g. -0.5 kg/week
  proteinPerKg: number;            // e.g. 1.8 g/kg bodyweight
  fatPercentageFloor: number;      // e.g. 0.25 (25% total calories from healthy fats)
  maxWeeklyAdjustmentKcal: number; // e.g. 150 kcal clamp
  minCaloricFloor: number;         // e.g. 1400 kcal safety limit
}

export interface NonJudgmentalNudge {
  type: 'glycogen_water' | 'sodium_retention' | 'metabolic_adaptation' | 'steady_progress' | 'fiber_satiety';
  headline: string;
  body: string;
  metricObserved: string;
  actionableContext: string;
}

export interface VisionDishAnalysis {
  dishNameFr: string;
  dishNameAr: string;
  region: string;
  confidenceScore: number;
  estimatedTotalWeightGrams: number;
  meatToCarbRatio: string;
  cookingMethodDetected: string;
  oilAbsorptionAssessment: string;
  components: {
    name: string;
    estimatedWeightGrams: number;
    percentageOfPlate: number;
    category: string;
  }[];
  macros: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
    sodiumMg: number;
    ironMg: number;
  };
  confidenceIntervals: {
    caloriesRange: [number, number];
    proteinRange: [number, number];
    carbsRange: [number, number];
    fatRange: [number, number];
  };
  dietaryNotes: string;
}

export interface BatchIngredient {
  id: string;
  nameFr: string;
  nameAr?: string;
  rawWeightGrams: number;
  cookedYieldMultiplier: number;
  caloriesPer100gRaw: number;
  proteinPer100gRaw: number;
  carbsPer100gRaw: number;
  fatPer100gRaw: number;
  fiberPer100gRaw: number;
}

export interface BatchRecipe {
  id: string;
  title: string;
  titleAr: string;
  cookingMethod: string;
  oilAddedMl: number;
  ingredients: BatchIngredient[];
  totalRawWeightGrams: number;
  totalCookedWeightGrams: number;
  totalBatchMacros: MacroNutrients;
  servingsCount: number;
  servingSplitMethod: 'equal_shares' | 'custom_proportions';
  customPortionGrams?: number[];
}
