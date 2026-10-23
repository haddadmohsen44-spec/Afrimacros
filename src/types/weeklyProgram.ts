import { MacroNutrients, Micronutrients } from './architecture';

export type ProgramGoal = 'fat_loss' | 'maintenance' | 'muscle_gain' | 'fasting_ramadan';
export type RegionalStyle = 'pan_algerian' | 'coastal' | 'saharan' | 'mountain_kabyle';

export interface ProgramMeal {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  mealTypeNameFr: string;
  mealTypeNameAr: string;
  dishNameFr: string;
  dishNameAr: string;
  region: string;
  portionDescription: string;
  portionGrams: number;
  macros: MacroNutrients;
  micronutrients: {
    ironMg: number;
    sodiumMg: number;
    fiberGrams: number;
  };
  keyIngredients: string[];
  clinicalHighlights: string;
  cookingTimeMinutes: number;
  alternatives?: {
    dishNameFr: string;
    dishNameAr: string;
    portionGrams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

export interface DailyProgram {
  id?: string;
  dayOfWeek: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  dayNameFr: string;
  dayNameAr: string;
  themeTitle: string;
  themeDescription: string;
  primaryRegion: string;
  targetCalories: number;
  dailyMacros: MacroNutrients;
  micronutrientTotals: {
    ironMg: number;
    sodiumMg: number;
    potassiumMg: number;
    fiberGrams: number;
  };
  glycemicPacing: 'Steep' | 'Moderate' | 'Sustained Low GI';
  meals: ProgramMeal[];
}

export interface WeeklyProgramPlan {
  id: string;
  title: string;
  goal: ProgramGoal;
  regionalStyle: RegionalStyle;
  averageDailyCalories: number;
  macroRatio: {
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
  varietyMetrics: {
    uniqueDishesCount: number;
    plantSpeciesCount: number;
    regionsRepresentedCount: number;
    weeklyFiberAverageGrams: number;
    carbCyclingDeltaKcal: number;
  };
  days: DailyProgram[];
}

export interface ShoppingCategory {
  categoryName: string;
  categoryNameAr: string;
  items: {
    name: string;
    amount: string;
    checked?: boolean;
    forDishes: string[];
  }[];
}
