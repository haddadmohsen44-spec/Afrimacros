import React, { useState, useMemo } from 'react';
import {
  generatePersonalizedWeeklyPlan,
  WEEKLY_SHOPPING_LIST,
} from '../../data/weeklyMealTemplates';
import { ProgramGoal, RegionalStyle, ProgramMeal } from '../../types/weeklyProgram';
import {
  Calendar,
  Sparkles,
  Utensils,
  RefreshCw,
  ShoppingBag,
  Clock,
  Flame,
  Check,
  ChevronRight,
  TrendingUp,
  HeartPulse,
  Printer,
  Sliders,
  CheckCircle2,
  X,
  Compass
} from 'lucide-react';

interface WeeklyProgramPlannerProps {
  onLogMealToDashboard?: (meal: {
    nameFr: string;
    nameAr: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

export const WeeklyProgramPlanner: React.FC<WeeklyProgramPlannerProps> = ({ onLogMealToDashboard }) => {
  // Config states
  const [goal, setGoal] = useState<ProgramGoal>('fat_loss');
  const [regionalStyle, setRegionalStyle] = useState<RegionalStyle>('pan_algerian');
  const [calorieTarget, setCalorieTarget] = useState<number>(1950);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6); // Default Friday (Couscous day!)
  const [showShoppingList, setShowShoppingList] = useState<boolean>(false);
  const [loggedNotification, setLoggedNotification] = useState<string | null>(null);

  // Shopping list checked items
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Generate the active weekly plan
  const plan = useMemo(() => {
    return generatePersonalizedWeeklyPlan(calorieTarget, goal, regionalStyle);
  }, [calorieTarget, goal, regionalStyle]);

  const activeDay = plan.days[selectedDayIndex] || plan.days[0];

  const handleToggleCheck = (itemName: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const handleLogSingleMeal = (meal: ProgramMeal) => {
    if (onLogMealToDashboard) {
      onLogMealToDashboard({
        nameFr: meal.dishNameFr,
        nameAr: meal.dishNameAr,
        grams: meal.portionGrams,
        calories: meal.macros.calories,
        protein: meal.macros.proteinGrams,
        carbs: meal.macros.carbsGrams,
        fat: meal.macros.fatGrams,
      });
      setLoggedNotification(`Added "${meal.dishNameFr}" to today's diary!`);
      setTimeout(() => setLoggedNotification(null), 3000);
    }
  };

  const handleLogWholeDay = () => {
    if (onLogMealToDashboard) {
      activeDay.meals.forEach((meal) => {
        onLogMealToDashboard({
          nameFr: meal.dishNameFr,
          nameAr: meal.dishNameAr,
          grams: meal.portionGrams,
          calories: meal.macros.calories,
          protein: meal.macros.proteinGrams,
          carbs: meal.macros.carbsGrams,
          fat: meal.macros.fatGrams,
        });
      });
      setLoggedNotification(`Logged all 4 meals of ${activeDay.dayNameFr} to your diary!`);
      setTimeout(() => setLoggedNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>7-Day Adaptive Nutrition</span>
            <span>·</span>
            <span>Culinary & Regional Variety</span>
            <span>·</span>
            <span>Ancestral North African Rhythm</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Weekly Algerian Meal Program & Dietary Diversity
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Carefully curated across 5 North African regions with cyclical carbohydrate pacing—featuring Friday communal Couscous refuel and 34+ plant species to maximize gut microbiome vitality.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowShoppingList(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            Marché Grocery List
          </button>
          <button
            onClick={handleLogWholeDay}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            Log {activeDay.dayNameFr} to Diary
          </button>
        </div>
      </div>

      {loggedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>{loggedNotification}</span>
          <button onClick={() => setLoggedNotification(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Program Customization Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* Goal Selector */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 block">Metabolic Goal</label>
          <select
            value={goal}
            onChange={(e) => {
              const newGoal = e.target.value as ProgramGoal;
              setGoal(newGoal);
              if (newGoal === 'fat_loss') setCalorieTarget(1850);
              else if (newGoal === 'maintenance') setCalorieTarget(2100);
              else if (newGoal === 'muscle_gain') setCalorieTarget(2450);
              else if (newGoal === 'fasting_ramadan') setCalorieTarget(1950);
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer font-medium"
          >
            <option value="fat_loss">Fat Loss (-0.5 kg/wk · 1850 kcal/day)</option>
            <option value="maintenance">Metabolic Equilibrium (2100 kcal/day)</option>
            <option value="muscle_gain">Lean Mass Building (+0.25 kg/wk · 2450 kcal)</option>
            <option value="fasting_ramadan">Fasting / Ramadan Pacing (Iftar & Suhour)</option>
          </select>
        </div>

        {/* Regional Style */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 block">Regional Culinary Focus</label>
          <select
            value={regionalStyle}
            onChange={(e) => setRegionalStyle(e.target.value as RegionalStyle)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer font-medium"
          >
            <option value="pan_algerian">Pan-Algerian Diversity (All 5 Regions)</option>
            <option value="coastal">Coastal Mediterranean (Algérois & Oranais)</option>
            <option value="mountain_kabyle">Mountain Berber (Kabyle & Chaoui)</option>
            <option value="saharan">Saharan & Oasis (Biskri & Southern Traditions)</option>
          </select>
        </div>

        {/* Energy Target Slider */}
        <div className="space-y-1">
          <div className="flex justify-between font-semibold text-slate-700">
            <span>Daily Average Target:</span>
            <span className="font-mono text-emerald-800 font-bold">{calorieTarget} kcal</span>
          </div>
          <input
            type="range"
            min="1500"
            max="2800"
            step="50"
            value={calorieTarget}
            onChange={(e) => setCalorieTarget(parseInt(e.target.value))}
            className="w-full accent-emerald-700 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>P: {plan.macroRatio.proteinPct}%</span>
            <span>C: {plan.macroRatio.carbsPct}%</span>
            <span>F: {plan.macroRatio.fatPct}%</span>
          </div>
        </div>
      </div>

      {/* Weekly Variety Metrics Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-slate-500 block text-[11px]">Distinct Meals</span>
          <span className="text-xl font-bold text-slate-900 font-mono">
            {plan.varietyMetrics.uniqueDishesCount}
          </span>
          <span className="text-[10px] text-emerald-700 block font-medium">Zero repeated lunches</span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-slate-500 block text-[11px]">Plant Species Count</span>
          <span className="text-xl font-bold text-emerald-800 font-mono">
            {plan.varietyMetrics.plantSpeciesCount}+
          </span>
          <span className="text-[10px] text-slate-500 block">Exceeds 30/wk microbiome target</span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-slate-500 block text-[11px]">Regional Coverage</span>
          <span className="text-xl font-bold text-slate-900 font-mono">
            {plan.varietyMetrics.regionsRepresentedCount} Regions
          </span>
          <span className="text-[10px] text-slate-500 block">Algérois, Oran, Kabyle, Biskra</span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-slate-500 block text-[11px]">Avg Daily Fiber</span>
          <span className="text-xl font-bold text-emerald-800 font-mono">
            {plan.varietyMetrics.weeklyFiberAverageGrams}g
          </span>
          <span className="text-[10px] text-slate-500 block">Frik, chickpeas & vegetables</span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-slate-500 block text-[11px]">Carb Cycling Delta</span>
          <span className="text-xl font-bold text-amber-700 font-mono">
            +{plan.varietyMetrics.carbCyclingDeltaKcal} kcal
          </span>
          <span className="text-[10px] text-amber-800 block">Friday Couscous buffer</span>
        </div>
      </div>

      {/* 7-Day Horizontal Day Picker (Saturday to Friday) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {plan.days.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const isFriday = day.dayOfWeek === 'Friday';
          return (
            <button
              key={day.dayOfWeek}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-1 min-w-[130px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs ring-2 ring-emerald-700/50'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {day.dayNameFr}
                </span>
                <span className={`text-[11px] font-sans ${isSelected ? 'text-emerald-200' : 'text-emerald-800 font-semibold'}`}>
                  {day.dayNameAr}
                </span>
              </div>
              <span className={`text-[10px] block mt-1 truncate ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                {day.primaryRegion}
              </span>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/40 text-[11px] font-mono">
                <span className={isSelected ? 'text-emerald-100' : 'text-slate-800 font-semibold'}>
                  {day.targetCalories} kcal
                </span>
                {isFriday && (
                  <span className={`text-[9px] px-1 rounded font-sans ${isSelected ? 'bg-emerald-800 text-amber-200' : 'bg-amber-100 text-amber-800'}`}>
                    Couscous
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Day Overview Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-emerald-950 text-sm">
              {activeDay.dayNameFr} ({activeDay.dayNameAr}): {activeDay.themeTitle}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-900 font-semibold">
              {activeDay.primaryRegion}
            </span>
          </div>
          <p className="text-emerald-900">
            {activeDay.themeDescription}
          </p>
        </div>

        <div className="flex items-center gap-4 text-emerald-950 font-mono shrink-0">
          <div>
            <span className="text-[10px] text-emerald-800 block">Total Target</span>
            <span className="font-bold text-sm">{activeDay.targetCalories} kcal</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-800 block">Macros</span>
            <span className="text-xs">P: {activeDay.dailyMacros.proteinGrams}g · C: {activeDay.dailyMacros.carbsGrams}g · F: {activeDay.dailyMacros.fatGrams}g</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-800 block">Fiber</span>
            <span className="font-bold text-emerald-900">{activeDay.dailyMacros.fiberGrams}g</span>
          </div>
        </div>
      </div>

      {/* 4 Daily Meals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeDay.meals.map((meal) => (
          <div
            key={meal.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div>
              {/* Meal Type Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {meal.mealTypeNameFr}
                  </span>
                  <span className="text-xs text-slate-400 font-sans">{meal.mealTypeNameAr}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{meal.cookingTimeMinutes} min</span>
                </div>
              </div>

              {/* Dish Name */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {meal.dishNameFr}
                </h4>
                <span className="text-xs text-emerald-800 font-sans block mt-0.5">
                  {meal.dishNameAr}
                </span>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {meal.portionDescription}
                </p>
              </div>

              {/* Macro Badges */}
              <div className="grid grid-cols-4 gap-1.5 pt-3 text-center text-xs">
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Energy</span>
                  <span className="font-mono font-bold text-slate-900">{meal.macros.calories}</span>
                  <span className="text-[9px] text-slate-400 block">kcal</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Protein</span>
                  <span className="font-mono font-bold text-blue-900">{meal.macros.proteinGrams}g</span>
                  <span className="text-[9px] text-slate-400 block">amino</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Carbs</span>
                  <span className="font-mono font-bold text-amber-900">{meal.macros.carbsGrams}g</span>
                  <span className="text-[9px] text-slate-400 block">durum</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Lipids</span>
                  <span className="font-mono font-bold text-emerald-900">{meal.macros.fatGrams}g</span>
                  <span className="text-[9px] text-slate-400 block">olive oil</span>
                </div>
              </div>

              {/* Key Ingredients */}
              <div className="pt-3 flex flex-wrap gap-1 text-[10px] text-slate-600">
                <span className="font-semibold text-slate-700">Ingredients:</span>
                {meal.keyIngredients.map((ing, i) => (
                  <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                    {ing}
                  </span>
                ))}
              </div>

              {/* Clinical Note */}
              <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                💡 <strong>Clinical Insight:</strong> {meal.clinicalHighlights}
              </div>
            </div>

            {/* Meal Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500 font-mono">
                Portion: {meal.portionGrams}g · Fiber: {meal.macros.fiberGrams}g
              </span>
              <button
                onClick={() => handleLogSingleMeal(meal)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Log to Diary
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Marché & Souk Weekly Grocery List Modal */}
      {showShoppingList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-700" />
                  Liste de Courses Hebdomadaire (Souk & Marché)
                </h3>
                <span className="text-xs text-slate-500">
                  Ingrédients exacts pour les 7 jours de repas variés (28 recettes complètes)
                </span>
              </div>
              <button
                onClick={() => setShowShoppingList(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1 text-xs">
              {WEEKLY_SHOPPING_LIST.map((cat, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200/80 pb-1.5">
                    <span className="font-bold text-slate-900 text-xs">{cat.categoryName}</span>
                    <span className="text-[11px] text-emerald-800 font-sans">{cat.categoryNameAr}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.items.map((item, i) => {
                      const isChecked = !!checkedItems[item.name];
                      return (
                        <div
                          key={i}
                          onClick={() => handleToggleCheck(item.name)}
                          className={`p-2 rounded-lg border flex items-start gap-2 cursor-pointer transition-colors ${
                            isChecked ? 'bg-emerald-50 border-emerald-300 line-through text-slate-400' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${isChecked ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300'}`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <span className="font-semibold block">{item.name}</span>
                            <span className="text-[10px] text-emerald-800 font-mono font-medium block">{item.amount}</span>
                            <span className="text-[9px] text-slate-500 block truncate">Pour: {item.forDishes.join(', ')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">
                {Object.values(checkedItems).filter(Boolean).length} / 30 articles achetés
              </span>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer la Liste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
