import React, { useState } from 'react';
import { ALGERIAN_FOOD_DATABASE } from '../../data/algerianFoodOntology';
import { SAMPLE_BATCH_RECIPES, calculateBatchPotNutrition } from '../../utils/recipeCalculator';
import { RegionalDish, BatchIngredient, BatchRecipe } from '../../types/architecture';
import {
  Plus,
  Barcode,
  Camera,
  Search,
  Droplets,
  TrendingDown,
  Flame,
  Check,
  X,
  Sparkles,
  ChefHat,
  Utensils,
  ChevronRight,
  Info,
  Sliders,
  Scale,
  CupSoda
} from 'lucide-react';

export const AppSimulator: React.FC = () => {
  // Navigation within the wireframe simulator
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'recipe_builder'>('dashboard');
  const [showQuickLogModal, setShowQuickLogModal] = useState<boolean>(false);
  const [quickLogTab, setQuickLogTab] = useState<'barcode' | 'photo' | 'database'>('database');

  // Daily intake state
  const [targetCalories, setTargetCalories] = useState<number>(2050);
  const [dailyLoggedMeals, setDailyLoggedMeals] = useState<
    { id: string; nameFr: string; nameAr: string; grams: number; calories: number; protein: number; carbs: number; fat: number; time: string }[]
  >([
    {
      id: 'log-1',
      nameFr: 'Kesra Rakhsis + Huile d’olive',
      nameAr: 'كسرة رخسيس مع زيت زيتون',
      grams: 80,
      calories: 250,
      protein: 6.8,
      carbs: 41.6,
      fat: 6.2,
      time: '08:30 AM',
    },
    {
      id: 'log-2',
      nameFr: 'Chorba Frik (Zlafa Standard)',
      nameAr: 'شوربة فريك جزائرية',
      grams: 350,
      calories: 378,
      protein: 23.8,
      carbs: 41.0,
      fat: 13.6,
      time: '01:15 PM',
    },
  ]);

  // Water intake state (ml)
  const [waterIntakeMl, setWaterIntakeMl] = useState<number>(1650);
  const waterTargetMl = 2500;

  // Weight Trend view toggle (Raw vs EWMA)
  const [weightViewMode, setWeightViewMode] = useState<'both' | 'ewma' | 'raw'>('both');

  // Quick Log Database Search State
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [selectedDbDish, setSelectedDbDish] = useState<RegionalDish>(ALGERIAN_FOOD_DATABASE[0]);
  const [selectedPortionMultiplier, setSelectedPortionMultiplier] = useState<number>(1);

  // Barcode simulation state
  const [scannedProduct, setScannedProduct] = useState<{ name: string; brand: string; barcode: string; calories: number; pro: number; carb: number; fat: number } | null>(null);

  // Batch Recipe Builder state
  const [activeRecipe, setActiveRecipe] = useState<BatchRecipe>(SAMPLE_BATCH_RECIPES[0]);
  const [recipeServingsCount, setRecipeServingsCount] = useState<number>(6);
  const [customPortionGramInput, setCustomPortionGramInput] = useState<number>(380);

  // Calculate totals
  const totalCaloriesLogged = dailyLoggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProteinLogged = Math.round(dailyLoggedMeals.reduce((acc, m) => acc + m.protein, 0));
  const totalCarbsLogged = Math.round(dailyLoggedMeals.reduce((acc, m) => acc + m.carbs, 0));
  const totalFatLogged = Math.round(dailyLoggedMeals.reduce((acc, m) => acc + m.fat, 0));

  const targetProtein = 145; // g
  const targetCarbs = 230;   // g
  const targetFat = 57;      // g

  // Add water helper
  const addWater = (amountMl: number) => {
    setWaterIntakeMl((prev) => prev + amountMl);
  };

  // Add meal from database modal
  const handleAddDbDish = () => {
    const portionGrams = selectedDbDish.standardPortionGrams * selectedPortionMultiplier;
    const factor = portionGrams / 100;
    const calories = Math.round(selectedDbDish.macrosPer100g.calories * factor);
    const protein = Math.round(selectedDbDish.macrosPer100g.proteinGrams * factor * 10) / 10;
    const carbs = Math.round(selectedDbDish.macrosPer100g.carbsGrams * factor * 10) / 10;
    const fat = Math.round(selectedDbDish.macrosPer100g.fatGrams * factor * 10) / 10;

    const newEntry = {
      id: `log-${Date.now()}`,
      nameFr: `${selectedDbDish.nameFr} (${portionGrams}g)`,
      nameAr: selectedDbDish.nameAr,
      grams: portionGrams,
      calories,
      protein,
      carbs,
      fat,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDailyLoggedMeals([...dailyLoggedMeals, newEntry]);
    setShowQuickLogModal(false);
  };

  // Add scanned barcode product
  const handleAddScannedProduct = () => {
    if (!scannedProduct) return;
    const newEntry = {
      id: `log-${Date.now()}`,
      nameFr: `${scannedProduct.name} - ${scannedProduct.brand}`,
      nameAr: 'منتج مسجل بالباركود',
      grams: 125,
      calories: scannedProduct.calories,
      protein: scannedProduct.pro,
      carbs: scannedProduct.carb,
      fat: scannedProduct.fat,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setDailyLoggedMeals([...dailyLoggedMeals, newEntry]);
    setScannedProduct(null);
    setShowQuickLogModal(false);
  };

  // Add batch recipe portion to daily dashboard
  const handleLogBatchPortion = () => {
    const potCalculation = calculateBatchPotNutrition(
      activeRecipe.ingredients,
      activeRecipe.oilAddedMl,
      recipeServingsCount,
      [customPortionGramInput]
    );

    const portionMacros = potCalculation.customPortionMacros?.[0]?.macros || potCalculation.perServingMacros;

    const newEntry = {
      id: `log-${Date.now()}`,
      nameFr: `${activeRecipe.title} (Portion Maison ${customPortionGramInput}g)`,
      nameAr: activeRecipe.titleAr,
      grams: customPortionGramInput,
      calories: portionMacros.calories,
      protein: portionMacros.proteinGrams,
      carbs: portionMacros.carbsGrams,
      fat: portionMacros.fatGrams,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDailyLoggedMeals([...dailyLoggedMeals, newEntry]);
    setActiveScreen('dashboard');
  };

  // Batch recipe calculations
  const potNutrition = calculateBatchPotNutrition(
    activeRecipe.ingredients,
    activeRecipe.oilAddedMl,
    recipeServingsCount,
    [customPortionGramInput]
  );

  return (
    <div className="space-y-6">
      {/* App Shell Navigation Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-bold text-sm">
            AM
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">AfriMacros Mobile Applet Wireframe</h2>
            <span className="text-[11px] text-slate-500">Local-First UI Simulation · Zero Red Alerts</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subscreen Selector */}
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveScreen('dashboard')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeScreen === 'dashboard' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Dashboard
            </button>
            <button
              onClick={() => setActiveScreen('recipe_builder')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeScreen === 'recipe_builder' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-emerald-700" />
              Batch Recipe Builder
            </button>
          </div>

          <button
            onClick={() => setShowQuickLogModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Quick-Log Meal
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SCREEN A: DAILY DASHBOARD */}
      {/* ============================================================== */}
      {activeScreen === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 Cols): Caloric Rings, Weight Trend & Water */}
          <div className="lg:col-span-8 space-y-6">
            {/* Caloric & Macro Ring Visualization */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs text-slate-500">Today's Metabolic Targets</span>
                  <h3 className="text-base font-bold text-slate-900">
                    Energy & Nutrient Balance
                  </h3>
                </div>
                <span className="text-xs font-mono font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Target: {targetCalories} kcal/day
                </span>
              </div>

              {/* Concentric Macro Rings */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                {/* Calories Main Circle */}
                <div className="sm:col-span-1 flex flex-col items-center justify-center p-2">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="#059669"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 46}
                        strokeDashoffset={
                          2 * Math.PI * 46 * (1 - Math.min(1, totalCaloriesLogged / targetCalories))
                        }
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-bold text-slate-900 font-mono leading-none">
                        {totalCaloriesLogged}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">/ {targetCalories}</span>
                      <span className="text-[9px] text-emerald-700 font-medium">kcal</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 mt-2">Energy (Calories)</span>
                </div>

                {/* Macro Progress Bars (Protein, Carbs, Fat) */}
                <div className="sm:col-span-3 space-y-3.5 pl-0 sm:pl-4">
                  {/* Protein */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Protein (Lean Preservation)</span>
                      <span className="font-mono text-slate-600">
                        <strong>{totalProteinLogged}g</strong> / {targetProtein}g ({Math.round((totalProteinLogged / targetProtein) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (totalProteinLogged / targetProtein) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Carbohydrates */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Carbohydrates (Durum / Frik)</span>
                      <span className="font-mono text-slate-600">
                        <strong>{totalCarbsLogged}g</strong> / {targetCarbs}g ({Math.round((totalCarbsLogged / targetCarbs) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (totalCarbsLogged / targetCarbs) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Lipids (Olive Oil / Smen Fond)</span>
                      <span className="font-mono text-slate-600">
                        <strong>{totalFatLogged}g</strong> / {targetFat}g ({Math.round((totalFatLogged / targetFat) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (totalFatLogged / targetFat) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Non-Judgmental Physiological Banner */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-start gap-3">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-emerald-900 block">
                    Metabolic Stability: High Satiety Index Maintained
                  </span>
                  <p className="text-emerald-950 leading-relaxed">
                    Fiber from green wheat (Frik) and legumes is buffering glycemic absorption smoothly. No restrictive red alerts; continue your planned meals.
                  </p>
                </div>
              </div>
            </div>

            {/* Rolling Weight Trend Line (Dual EWMA View) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs text-slate-500">Weight Tracking</span>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-emerald-700" />
                    Smoothed EWMA Trend vs. Raw Weigh-Ins
                  </h3>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setWeightViewMode('both')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      weightViewMode === 'both' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    Dual View
                  </button>
                  <button
                    onClick={() => setWeightViewMode('ewma')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      weightViewMode === 'ewma' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    EWMA Trend Only
                  </button>
                  <button
                    onClick={() => setWeightViewMode('raw')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      weightViewMode === 'raw' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    Raw Scale Only
                  </button>
                </div>
              </div>

              {/* Trend Preview Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Today's Morning Scale</span>
                  <span className="text-xl font-bold text-slate-900 font-mono">81.8 kg</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">+0.3 kg (Fluid from broth)</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">7-Day Smoothed EWMA (α=0.12)</span>
                  <span className="text-xl font-bold text-emerald-800 font-mono">81.45 kg</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">-0.48 kg sustained this week</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                *The green smoothed trend ignores day-to-day fluid shifts caused by sodium retention and glycogen storage.
              </div>
            </div>

            {/* North African Hydration Tracker */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Hydration & Fluid Balance</h3>
                    <span className="text-[11px] text-slate-500">North African Traditional Beverages</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {waterIntakeMl} / {waterTargetMl} ml ({Math.round((waterIntakeMl / waterTargetMl) * 100)}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (waterIntakeMl / waterTargetMl) * 100)}%` }}
                />
              </div>

              {/* Quick Add Beverage Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => addWater(250)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
                >
                  <Droplets className="w-4 h-4 text-cyan-600 mb-1" />
                  <span className="font-semibold text-slate-800 text-[11px]">Eau Minérale</span>
                  <span className="text-[10px] text-slate-500">+250 ml</span>
                </button>

                <button
                  onClick={() => addWater(150)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
                >
                  <CupSoda className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="font-semibold text-slate-800 text-[11px]">Thé à la Menthe</span>
                  <span className="text-[10px] text-slate-500">+150 ml</span>
                </button>

                <button
                  onClick={() => addWater(120)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
                >
                  <Utensils className="w-4 h-4 text-stone-600 mb-1" />
                  <span className="font-semibold text-slate-800 text-[11px]">Café Mazagran</span>
                  <span className="text-[10px] text-slate-500">+120 ml</span>
                </button>

                <button
                  onClick={() => addWater(180)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
                >
                  <Droplets className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="font-semibold text-slate-800 text-[11px]">Bouillon Chorba</span>
                  <span className="text-[10px] text-slate-500">+180 ml</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 Cols): Today's Meal Diary */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Meal Diary</h3>
                <span className="text-[11px] text-slate-500">{dailyLoggedMeals.length} entries recorded</span>
              </div>
              <button
                onClick={() => setShowQuickLogModal(true)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Meal
              </button>
            </div>

            {/* List of meals */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {dailyLoggedMeals.map((meal) => (
                <div key={meal.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug">{meal.nameFr}</h4>
                      <span className="text-[11px] text-emerald-800 font-sans block">{meal.nameAr}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                      {meal.calories} kcal
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                    <span>P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fat}g</span>
                    <span>{meal.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Totals Summary */}
            <div className="p-3 bg-slate-100 rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Total Energy Consumed:</span>
                <span className="font-mono">{totalCaloriesLogged} kcal</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Remaining to Target:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {Math.max(0, targetCalories - totalCaloriesLogged)} kcal
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN C: BATCH RECIPE BUILDER (TRADITIONAL POT COOKING) */}
      {/* ============================================================== */}
      {activeScreen === 'recipe_builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 Cols): Ingredients & Pot Settings */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-500">Traditional Pot Cooking Solver</span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-emerald-700" />
                  {activeRecipe.title}
                </h3>
                <span className="text-xs text-emerald-800 font-sans">{activeRecipe.titleAr}</span>
              </div>
              <span className="text-xs font-mono px-2 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
                {activeRecipe.cookingMethod}
              </span>
            </div>

            {/* Pot Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Family Pot Servings Count</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={recipeServingsCount}
                    onChange={(e) => setRecipeServingsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                  <span className="text-slate-500">portions</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Added Cooking Oil / Smen Fond</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    step="5"
                    value={activeRecipe.oilAddedMl}
                    onChange={(e) => setActiveRecipe({ ...activeRecipe, oilAddedMl: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                  <span className="text-slate-500 font-mono">ml</span>
                </div>
              </div>
            </div>

            {/* Batch Raw Ingredients Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Raw Pot Ingredients & Cooked Yield Multipliers
              </span>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Ingredient</th>
                      <th className="p-2.5 text-right">Raw Mass</th>
                      <th className="p-2.5 text-right">Yield Multiplier</th>
                      <th className="p-2.5 text-right">Cooked Mass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeRecipe.ingredients.map((item) => (
                      <tr key={item.id} className="bg-white">
                        <td className="p-2.5">
                          <span className="font-medium text-slate-900 block">{item.nameFr}</span>
                          <span className="text-[10px] text-slate-500 font-sans">{item.nameAr}</span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-medium">{item.rawWeightGrams}g</td>
                        <td className="p-2.5 text-right font-mono text-emerald-800">{item.cookedYieldMultiplier}x</td>
                        <td className="p-2.5 text-right font-mono text-slate-900 font-semibold">
                          {Math.round(item.rawWeightGrams * item.cookedYieldMultiplier)}g
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pot Biophysical Totals */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Total Raw Ingredients Weight</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {potNutrition.totalRawWeight} <span className="text-xs font-normal">grams</span>
                </span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-emerald-800 block">Total Cooked Pot Weight</span>
                <span className="text-lg font-bold text-emerald-950 font-mono">
                  {potNutrition.totalCookedWeight} <span className="text-xs font-normal">grams</span>
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">
                  Includes steam hydration & oil absorption
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (5 Cols): Portion Splits & Log to Dashboard */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-700" />
                Portion Split Solver (My Bowl Tare)
              </h3>
              <span className="text-[11px] text-slate-500">Individual bowl weight vs communal pot ratio</span>
            </div>

            {/* Average Equal Share Option */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Average Serving ({recipeServingsCount} portions)</span>
                <span className="font-mono font-bold text-emerald-800">
                  {potNutrition.perServingMacros.calories} kcal
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>P: {potNutrition.perServingMacros.proteinGrams}g</span>
                <span>C: {potNutrition.perServingMacros.carbsGrams}g</span>
                <span>F: {potNutrition.perServingMacros.fatGrams}g</span>
                <span>Fiber: {potNutrition.perServingMacros.fiberGrams}g</span>
              </div>
            </div>

            {/* Custom Scale Tare Serving Option */}
            <div className="space-y-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs">
              <span className="font-bold text-emerald-950 block">
                Option B: Exact Digital Scale Plate Weight
              </span>
              <p className="text-[11px] text-emerald-900">
                Tare your plate on a food scale and weigh your personal serving from the communal pot.
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-emerald-950">My Plate Serving Weight</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="100"
                    max="1000"
                    step="10"
                    value={customPortionGramInput}
                    onChange={(e) => setCustomPortionGramInput(Math.max(10, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg font-mono text-emerald-950 font-bold"
                  />
                  <span className="font-mono text-emerald-900">grams</span>
                </div>
              </div>

              {/* Resolved Macros for Personal Portion */}
              {potNutrition.customPortionMacros && (
                <div className="pt-2 border-t border-emerald-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-emerald-950">
                    <span>Personal Portion Energy:</span>
                    <span className="font-mono text-base">
                      {potNutrition.customPortionMacros[0].macros.calories} kcal
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-emerald-900 font-mono pt-1">
                    <div>P: {potNutrition.customPortionMacros[0].macros.proteinGrams}g</div>
                    <div>C: {potNutrition.customPortionMacros[0].macros.carbsGrams}g</div>
                    <div>F: {potNutrition.customPortionMacros[0].macros.fatGrams}g</div>
                    <div>Fiber: {potNutrition.customPortionMacros[0].macros.fiberGrams}g</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action button */}
            <button
              onClick={handleLogBatchPortion}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Log Portion to Today's Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* QUICK-LOG MODAL */}
      {/* ============================================================== */}
      {showQuickLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-5 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Quick-Log Meal Entry</h3>
                <span className="text-xs text-slate-500">North African Food Database & Multi-Modal Logging</span>
              </div>
              <button
                onClick={() => setShowQuickLogModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Tab Switcher */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setQuickLogTab('database')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  quickLogTab === 'database' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Regional DB
              </button>
              <button
                onClick={() => setQuickLogTab('barcode')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  quickLogTab === 'barcode' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Barcode className="w-3.5 h-3.5" />
                Barcode Scan
              </button>
              <button
                onClick={() => setQuickLogTab('photo')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  quickLogTab === 'photo' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                AI Photo Scan
              </button>
            </div>

            {/* Tab 1: Regional Database Search */}
            {quickLogTab === 'database' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search staple dish (Chorba, Karantika, Rechta, Mtewem...)"
                    value={dbSearchQuery}
                    onChange={(e) => setDbSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                {/* Dish Selector list */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {ALGERIAN_FOOD_DATABASE.filter(
                    (d) =>
                      d.nameFr.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
                      d.nameAr.includes(dbSearchQuery)
                  ).map((dish) => {
                    const isSelected = selectedDbDish.id === dish.id;
                    return (
                      <div
                        key={dish.id}
                        onClick={() => setSelectedDbDish(dish)}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{dish.nameFr}</span>
                          <span className="text-[11px] text-emerald-800 font-sans">{dish.nameAr}</span>
                        </div>
                        <span className="font-mono text-slate-700 font-medium">
                          {dish.macrosPer100g.calories} kcal/100g
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Traditional Portion Size Multiplier */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Portion Serving:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedDbDish.standardPortionGrams * selectedPortionMultiplier} grams
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { label: '0.5x Half', val: 0.5 },
                      { label: '1.0x Standard', val: 1 },
                      { label: '1.5x Large', val: 1.5 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        onClick={() => setSelectedPortionMultiplier(p.val)}
                        className={`flex-1 py-1.5 rounded border text-[11px] font-medium cursor-pointer transition-colors ${
                          selectedPortionMultiplier === p.val
                            ? 'bg-emerald-900 text-white border-emerald-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddDbDish}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Confirm & Add to Today's Diary
                </button>
              </div>
            )}

            {/* Tab 2: Barcode Scanner */}
            {quickLogTab === 'barcode' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl text-center space-y-2">
                  <Barcode className="w-12 h-12 mx-auto text-emerald-400" />
                  <p className="font-semibold">Simulated GS1 North African Scanner</p>
                  <p className="text-[11px] text-slate-400">
                    Supports Algerian manufactured products (GS1 prefix 613): Soummam, Candia, Sim, Benamor.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-slate-700 block">Test Sample Barcodes:</span>
                  <div className="space-y-1.5">
                    {[
                      { name: 'Yaourt Brassé Nature', brand: 'Laiterie Soummam', barcode: '6131234567890', calories: 92, pro: 4.2, carb: 8.5, fat: 3.8 },
                      { name: 'Double Concentré de Tomate', brand: 'Amor Benamor', barcode: '6139876543210', calories: 75, pro: 3.8, carb: 14.2, fat: 0.3 },
                      { name: 'Lait Entier Pasteurisé', brand: 'Candia Algérie', barcode: '6135555444433', calories: 128, pro: 6.4, carb: 9.6, fat: 7.2 },
                    ].map((item) => (
                      <div
                        key={item.barcode}
                        onClick={() => setScannedProduct(item)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          scannedProduct?.barcode === item.barcode
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-[10px] text-slate-500">{item.brand} ({item.barcode})</span>
                        </div>
                        <span className="font-mono font-medium text-slate-800">{item.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>

                {scannedProduct && (
                  <button
                    onClick={handleAddScannedProduct}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Add {scannedProduct.name} to Diary
                  </button>
                )}
              </div>
            )}

            {/* Tab 3: AI Photo Scan */}
            {quickLogTab === 'photo' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-center">
                  <Camera className="w-10 h-10 mx-auto text-emerald-700" />
                  <p className="font-bold text-emerald-950">AI Multimodal Photo Logging</p>
                  <p className="text-[11px] text-emerald-900">
                    Takes a photo of your plate, estimates meat-to-semolina ratios, and logs directly with 95% confidence intervals.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <span className="font-bold text-slate-800 block">Instant Sample: Couscous Bel Khodra w Lhem</span>
                  <div className="flex justify-between font-mono text-[11px] text-slate-600">
                    <span>Calories: 615 kcal</span>
                    <span>P: 34g · C: 74g · F: 21g</span>
                  </div>
                  <button
                    onClick={() => {
                      const newEntry = {
                        id: `log-${Date.now()}`,
                        nameFr: 'Couscous Algérien à l’Agneau (Scan Photo)',
                        nameAr: 'كسكسي جزائري بلحم الغنم',
                        grams: 450,
                        calories: 615,
                        protein: 34,
                        carbs: 74,
                        fat: 21,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      };
                      setDailyLoggedMeals([...dailyLoggedMeals, newEntry]);
                      setShowQuickLogModal(false);
                    }}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold transition-colors cursor-pointer"
                  >
                    Accept AI Detection & Log Meal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
