import { BatchIngredient, BatchRecipe, MacroNutrients } from '../types/architecture';

/**
 * Calculates batch pot macros and divides them into serving portions
 */
export function calculateBatchPotNutrition(
  ingredients: BatchIngredient[],
  oilAddedMl: number = 45, // Default olive oil or smen added to pot
  servingsCount: number = 6,
  customPortionGrams?: number[]
): {
  totalRawWeight: number;
  totalCookedWeight: number;
  totalMacros: MacroNutrients;
  perServingMacros: MacroNutrients;
  customPortionMacros?: { portionGrams: number; macros: MacroNutrients }[];
} {
  let totalRawWeight = 0;
  let totalCookedWeight = 0;
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  // Add cooking oil/smen (approx 8.8 kcal/ml, 1g fat/ml)
  const oilCalories = oilAddedMl * 8.84;
  const oilFatGrams = oilAddedMl * 0.99;
  totalFat += oilFatGrams;
  totalCalories += oilCalories;

  ingredients.forEach((item) => {
    totalRawWeight += item.rawWeightGrams;
    const itemCooked = item.rawWeightGrams * item.cookedYieldMultiplier;
    totalCookedWeight += itemCooked;

    const factor = item.rawWeightGrams / 100;
    totalCalories += item.caloriesPer100gRaw * factor;
    totalProtein += item.proteinPer100gRaw * factor;
    totalCarbs += item.carbsPer100gRaw * factor;
    totalFat += item.fatPer100gRaw * factor;
    totalFiber += item.fiberPer100gRaw * factor;
  });

  const totalMacros: MacroNutrients = {
    calories: Math.round(totalCalories),
    proteinGrams: Math.round(totalProtein),
    carbsGrams: Math.round(totalCarbs),
    fatGrams: Math.round(totalFat),
    fiberGrams: Math.round(totalFiber),
  };

  const perServingMacros: MacroNutrients = {
    calories: Math.round(totalCalories / servingsCount),
    proteinGrams: Math.round((totalProtein / servingsCount) * 10) / 10,
    carbsGrams: Math.round((totalCarbs / servingsCount) * 10) / 10,
    fatGrams: Math.round((totalFat / servingsCount) * 10) / 10,
    fiberGrams: Math.round((totalFiber / servingsCount) * 10) / 10,
  };

  let customPortionMacros: { portionGrams: number; macros: MacroNutrients }[] | undefined;
  if (customPortionGrams && customPortionGrams.length > 0 && totalCookedWeight > 0) {
    customPortionMacros = customPortionGrams.map((grams) => {
      const share = grams / totalCookedWeight;
      return {
        portionGrams: grams,
        macros: {
          calories: Math.round(totalCalories * share),
          proteinGrams: Math.round(totalProtein * share * 10) / 10,
          carbsGrams: Math.round(totalCarbs * share * 10) / 10,
          fatGrams: Math.round(totalFat * share * 10) / 10,
          fiberGrams: Math.round(totalFiber * share * 10) / 10,
        },
      };
    });
  }

  return {
    totalRawWeight: Math.round(totalRawWeight),
    totalCookedWeight: Math.round(totalCookedWeight),
    totalMacros,
    perServingMacros,
    customPortionMacros,
  };
}

export const SAMPLE_BATCH_RECIPES: BatchRecipe[] = [
  {
    id: 'batch-couscous-familial',
    title: 'Couscous Familial du Vendredi (Qedra 6 Litres)',
    titleAr: 'كسكسي العائلة للجمعة (قدرة 6 لتر)',
    cookingMethod: 'Couscoussier vapeur + marmite mijotée',
    oilAddedMl: 60, // 4 tablespoons olive oil / smen
    servingsCount: 6,
    servingSplitMethod: 'equal_shares',
    ingredients: [
      {
        id: 'semoule-roulee',
        nameFr: 'Semoule de blé dur moyenne (Raw dry)',
        nameAr: 'سميد متوسط',
        rawWeightGrams: 750,
        cookedYieldMultiplier: 2.60,
        caloriesPer100gRaw: 350,
        proteinPer100gRaw: 12.5,
        carbsPer100gRaw: 72.0,
        fatPer100gRaw: 1.5,
        fiberPer100gRaw: 3.5,
      },
      {
        id: 'epaule-agneau',
        nameFr: 'Épaule d’agneau coupée en morceaux',
        nameAr: 'لحم كتف خروف',
        rawWeightGrams: 900,
        cookedYieldMultiplier: 0.68,
        caloriesPer100gRaw: 282,
        proteinPer100gRaw: 18.0,
        carbsPer100gRaw: 0,
        fatPer100gRaw: 23.5,
        fiberPer100gRaw: 0,
      },
      {
        id: 'homs-trempes',
        nameFr: 'Pois chiches secs trempés',
        nameAr: 'حمص مشمخ',
        rawWeightGrams: 150,
        cookedYieldMultiplier: 2.25,
        caloriesPer100gRaw: 364,
        proteinPer100gRaw: 19.3,
        carbsPer100gRaw: 60.6,
        fatPer100gRaw: 6.0,
        fiberPer100gRaw: 17.4,
      },
      {
        id: 'legumes-couscous',
        nameFr: 'Légumes variés (Courgettes, Navets, Carottes, Potiron)',
        nameAr: 'خضر متنوعة (قرعة، لفت، زرودية، كابويا)',
        rawWeightGrams: 800,
        cookedYieldMultiplier: 0.88,
        caloriesPer100gRaw: 32,
        proteinPer100gRaw: 1.2,
        carbsPer100gRaw: 6.5,
        fatPer100gRaw: 0.2,
        fiberPer100gRaw: 2.5,
      },
      {
        id: 'oignon-tomate',
        nameFr: 'Oignon râpé & purée de tomates',
        nameAr: 'بصل وطماطم مرحية',
        rawWeightGrams: 300,
        cookedYieldMultiplier: 0.80,
        caloriesPer100gRaw: 35,
        proteinPer100gRaw: 1.3,
        carbsPer100gRaw: 7.2,
        fatPer100gRaw: 0.2,
        fiberPer100gRaw: 1.8,
      },
    ],
    totalRawWeightGrams: 2900,
    totalCookedWeightGrams: 3670,
    totalBatchMacros: {
      calories: 5850,
      proteinGrams: 254,
      carbsGrams: 672,
      fatGrams: 245,
      fiberGrams: 62,
    },
  },
];
