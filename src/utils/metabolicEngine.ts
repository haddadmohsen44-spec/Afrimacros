import {
  DailyLogEntry,
  MetabolicParameters,
  NonJudgmentalNudge,
  MacroNutrients,
} from '../types/architecture';

export const DEFAULT_METABOLIC_PARAMS: MetabolicParameters = {
  alphaWeight: 0.12,             // 7 to 10 day smoothing weight factor
  alphaIntake: 0.14,             // 7-day exponential half-life for calories
  caloricTissueEquivalent: 7700, // 1 kg tissue ≈ 7700 kcal
  targetWeeklyChangeKg: -0.5,    // Standard sustainable fat loss (-0.5 kg/week)
  proteinPerKg: 1.8,             // 1.8g protein per kg of body weight
  fatPercentageFloor: 0.25,      // 25% of calories from fat minimum
  maxWeeklyAdjustmentKcal: 150,  // Clamp to prevent drastic swings
  minCaloricFloor: 1400,         // Absolute safety floor
};

/**
 * Calculates rolling EWMA for weight and caloric intake
 */
export function calculateEwmaStep(
  currentValue: number,
  previousEwma: number,
  alpha: number
): number {
  return alpha * currentValue + (1 - alpha) * previousEwma;
}

/**
 * Estimates rolling TDEE from smoothed weight delta and smoothed intake
 * TDEE = EWMA_Intake - (Delta_EWMA_Weight / Days * 7700)
 */
export function estimateRollingTdee(
  smoothedIntake: number,
  weightDeltaKg: number,
  days: number,
  tissueEquivKcal: number = 7700
): number {
  const dailyCaloricDeficitOrSurplus = (weightDeltaKg / days) * tissueEquivKcal;
  // If weight decreased, weightDelta is negative, so subtracting negative yields TDEE > intake
  const tdee = smoothedIntake - dailyCaloricDeficitOrSurplus;
  return Math.round(tdee);
}

/**
 * Recalculates Target Macros every 7 days without judgmental shifts
 */
export function calculateWeeklyTargetAdjustment(
  currentCaloricTarget: number,
  currentSmoothedWeightKg: number,
  estimatedTdee: number,
  params: MetabolicParameters = DEFAULT_METABOLIC_PARAMS
): {
  newCaloricTarget: number;
  macros: MacroNutrients;
  adjustmentKcal: number;
  reasoning: string;
} {
  // Desired daily delta: e.g. -0.5 kg/week * 7700 / 7 = -550 kcal/day
  const targetDailyEnergyDelta = (params.targetWeeklyChangeKg * params.caloricTissueEquivalent) / 7;
  const unconstrainedTarget = estimatedTdee + targetDailyEnergyDelta;

  // Apply maximum adjustment step clamp (e.g. max ±150 kcal change per week)
  const proposedAdjustment = unconstrainedTarget - currentCaloricTarget;
  const clampedAdjustment = Math.max(
    -params.maxWeeklyAdjustmentKcal,
    Math.min(params.maxWeeklyAdjustmentKcal, proposedAdjustment)
  );

  let newCaloricTarget = Math.round(currentCaloricTarget + clampedAdjustment);

  // Enforce safety floor
  if (newCaloricTarget < params.minCaloricFloor) {
    newCaloricTarget = params.minCaloricFloor;
  }

  // Macro allocation
  // 1. Protein target based on lean mass preservation: 1.8 g/kg
  const proteinGrams = Math.round(currentSmoothedWeightKg * params.proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  // 2. Fat floor: 25% of calories
  const fatCalories = Math.max(
    newCaloricTarget * params.fatPercentageFloor,
    currentSmoothedWeightKg * 0.8 * 9
  );
  const fatGrams = Math.round(fatCalories / 9);

  // 3. Carbs take remainder
  const carbCalories = Math.max(0, newCaloricTarget - proteinCalories - (fatGrams * 9));
  const carbsGrams = Math.round(carbCalories / 4);

  // Approximate fiber guideline: 14g per 1000 kcal
  const fiberGrams = Math.round((newCaloricTarget / 1000) * 14);

  const adjustmentDiff = newCaloricTarget - currentCaloricTarget;
  let reasoning = '';
  if (adjustmentDiff > 0) {
    reasoning = `Expenditure elevated by metabolic adaptation (+${adjustmentDiff} kcal). Calories adjusted upward to preserve lean tissue and energy.`;
  } else if (adjustmentDiff < 0) {
    reasoning = `Expenditure settled steadily (${adjustmentDiff} kcal adjustment). Calories calibrated smoothly to sustain your target progress rate.`;
  } else {
    reasoning = 'Energy balance is in perfect equilibrium with current targets. Maintaining current allocations.';
  }

  return {
    newCaloricTarget,
    macros: {
      calories: newCaloricTarget,
      proteinGrams,
      carbsGrams,
      fatGrams,
      fiberGrams,
    },
    adjustmentKcal: clampedAdjustment,
    reasoning,
  };
}

/**
 * Evaluates daily physiological indicators to generate non-judgmental,
 * scientifically reassuring UI messages.
 */
export function evaluateNonJudgmentalNudge(
  currentDayLog: DailyLogEntry,
  previousDayLog?: DailyLogEntry
): NonJudgmentalNudge {
  const weightDiff = previousDayLog
    ? currentDayLog.rawWeightKg - previousDayLog.rawWeightKg
    : 0;

  // 1. High Sodium Trigger (e.g. after Chorba, cured olives, harissa)
  if (currentDayLog.sodiumMg > 2500 && weightDiff > 0.3) {
    return {
      type: 'sodium_retention',
      headline: 'Normal Fluid Shift Observed',
      body: 'Yesterday’s meal included rich spices and broths (higher sodium content). Your body temporarily retains extra extracellular water to balance electrolytes. This is fluid volume, not fat tissue.',
      metricObserved: `+${weightDiff.toFixed(1)} kg scale reading · ${currentDayLog.sodiumMg} mg Sodium intake`,
      actionableContext: 'Drink 2 glasses of pure water or herbal Louiza tea today; fluid balance will naturally equalize within 24–48 hours.',
    };
  }

  // 2. High Carbohydrate / Glycogen Loading (e.g. Couscous, Rechta, Chakhchoukha)
  if (currentDayLog.carbsGrams > 240 && weightDiff > 0.25) {
    return {
      type: 'glycogen_water',
      headline: 'Glycogen & Cellular Hydration',
      body: 'Your muscles and liver stored healthy complex carbohydrates from semolina/grains. Every gram of stored glycogen binds approximately 3 to 4 grams of water. Your body is well-fueled for training and daily activity.',
      metricObserved: `${currentDayLog.carbsGrams}g Carbs logged · 7-day trend remains stable`,
      actionableContext: 'Notice your energy levels and stamina today. The smoothed EWMA curve filters out this transient hydration.',
    };
  }

  // 3. High Fiber Satiety Day (e.g. Frik, Karantika, Chickpeas)
  const fiberGrams = (currentDayLog as any).fiberGrams || 28;
  if (fiberGrams >= 28) {
    return {
      type: 'fiber_satiety',
      headline: 'Exceptional Gut Microbiome Support',
      body: 'You reached high dietary fiber today with wholesome North African pulses and roasted grains. Soluble fibers slow gastric emptying and stabilize post-prandial blood sugar.',
      metricObserved: `${fiberGrams}g Dietary Fiber · Optimal glycemic stability`,
      actionableContext: 'Keep water intake steady to support smooth digestive transit and sustained fullness.',
    };
  }

  // 4. Default steady progress
  return {
    type: 'steady_progress',
    headline: 'Consistent Energy Balance',
    body: 'Daily weigh-in fluctuations are completely normal physiological noise. The 7-day smoothed trend line accurately reflects your actual metabolic trajectory.',
    metricObserved: `Smoothed trend: ${currentDayLog.smoothedWeightKg.toFixed(2)} kg (EWMA α = 0.12)`,
    actionableContext: 'Consistency over perfection. Continue logging your traditional meals with realistic portion awareness.',
  };
}

/**
 * Generates a realistic 30-day simulated dataset demonstrating
 * noisy raw daily weights vs smoothed EWMA vs rolling TDEE updates.
 */
export function generateSimulated30DayLog(
  initialWeightKg: number = 82.5,
  initialTargetKcal: number = 2100,
  initialTdee: number = 2650
): DailyLogEntry[] {
  const logs: DailyLogEntry[] = [];
  let currentRawWeight = initialWeightKg;
  let currentSmoothedWeight = initialWeightKg;
  let currentSmoothedIntake = initialTargetKcal;
  let currentTdee = initialTdee;

  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const dayIndex = 30 - i;
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Realistic daily intake with weekend bumps (Couscous Friday, etc.)
    const isFriday = date.getDay() === 5;
    const intakeNoise = Math.sin(dayIndex * 0.8) * 120 + (isFriday ? 350 : 0) + (Math.random() * 80 - 40);
    const caloricIntake = Math.round(initialTargetKcal + intakeNoise);

    // Real-world water weight noise (±0.4 to 0.7kg due to sodium, hydration, glycogen)
    const trueWeightTrend = initialWeightKg - (dayIndex * (0.5 / 7)); // Steady loss of ~0.5kg/week
    const waterNoise = Math.sin(dayIndex * 1.4) * 0.55 + (isFriday ? 0.7 : -0.1) + (Math.random() * 0.3 - 0.15);
    currentRawWeight = Number((trueWeightTrend + waterNoise).toFixed(2));

    // EWMA smoothing
    currentSmoothedWeight = calculateEwmaStep(currentRawWeight, currentSmoothedWeight, 0.12);
    currentSmoothedIntake = calculateEwmaStep(caloricIntake, currentSmoothedIntake, 0.14);

    // Rolling TDEE updated based on smoothed delta
    if (dayIndex > 7) {
      const pastLog = logs[dayIndex - 8];
      const deltaW = currentSmoothedWeight - pastLog.smoothedWeightKg;
      currentTdee = estimateRollingTdee(currentSmoothedIntake, deltaW, 7, 7700);
    }

    const carbsGrams = isFriday ? 280 : Math.round(caloricIntake * 0.45 / 4);
    const proteinGrams = Math.round(currentSmoothedWeight * 1.8);
    const fatGrams = Math.round((caloricIntake - (carbsGrams * 4) - (proteinGrams * 4)) / 9);
    const sodiumMg = isFriday ? 2950 : Math.round(1800 + Math.random() * 600);
    const waterIntakeMl = Math.round(2200 + Math.random() * 800);

    logs.push({
      day: dayIndex,
      date: date.toISOString().split('T')[0],
      rawWeightKg: currentRawWeight,
      smoothedWeightKg: Number(currentSmoothedWeight.toFixed(2)),
      caloricIntake,
      smoothedIntake: Math.round(currentSmoothedIntake),
      estimatedTdee: currentTdee,
      carbsGrams,
      proteinGrams,
      fatGrams,
      sodiumMg,
      waterIntakeMl,
      physiologicalEvent: isFriday
        ? 'Communal Couscous Friday (Water & Glycogen Elevation)'
        : dayIndex === 14
        ? '7-Day Non-Judgmental Macro Recalibration (+65 kcal adjustment)'
        : undefined,
    });
  }

  return logs;
}
