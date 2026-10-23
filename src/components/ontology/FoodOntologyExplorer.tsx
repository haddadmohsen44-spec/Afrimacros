import React, { useState } from 'react';
import { ALGERIAN_FOOD_DATABASE } from '../../data/algerianFoodOntology';
import { COOKED_RAW_CONVERSIONS } from '../../data/cookedRawFactors';
import { RegionalDish, CookedRawConversion } from '../../types/architecture';
import { Search, Calculator, ArrowRightLeft, Database, Flame, ShieldAlert, Sparkles, Droplets } from 'lucide-react';

export const FoodOntologyExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedDish, setSelectedDish] = useState<RegionalDish>(ALGERIAN_FOOD_DATABASE[0]);

  // Cooked-to-Raw Calculator state
  const [selectedConversion, setSelectedConversion] = useState<CookedRawConversion>(COOKED_RAW_CONVERSIONS[0]);
  const [conversionDirection, setConversionDirection] = useState<'cooked_to_raw' | 'raw_to_cooked'>('cooked_to_raw');
  const [inputWeightGrams, setInputWeightGrams] = useState<number>(200);

  // Filtered dishes
  const filteredDishes = ALGERIAN_FOOD_DATABASE.filter((dish) => {
    const matchesSearch =
      dish.nameFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.nameAr.includes(searchTerm) ||
      dish.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || dish.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // Calculate conversion output
  const calculatedOutput = React.useMemo(() => {
    if (conversionDirection === 'cooked_to_raw') {
      // User has e.g. 200g of cooked couscous on plate, wants raw semolina weight
      const rawGrams = Math.round((inputWeightGrams / selectedConversion.conversionMultiplier) * 10) / 10;
      return {
        resultGrams: rawGrams,
        label: `Raw ${selectedConversion.ingredientNameFr} Equivalent`,
        explanation: `${inputWeightGrams}g cooked ÷ ${selectedConversion.conversionMultiplier} yield factor = ${rawGrams}g raw dry weight.`,
      };
    } else {
      // User has 100g raw ingredient, wants cooked batch weight
      const cookedGrams = Math.round((inputWeightGrams * selectedConversion.conversionMultiplier) * 10) / 10;
      return {
        resultGrams: cookedGrams,
        label: `Cooked ${selectedConversion.ingredientNameFr} Expected Yield`,
        explanation: `${inputWeightGrams}g raw × ${selectedConversion.conversionMultiplier} yield factor = ${cookedGrams}g cooked food.`,
      };
    }
  }, [selectedConversion, conversionDirection, inputWeightGrams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Biophysical Food Ontology</span>
            <span>·</span>
            <span>Cooking Method Mechanics</span>
            <span>·</span>
            <span>Cooked-to-Raw Reverse Solver</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Algerian Food Ontology & Cooking Dynamics System
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Standard databases miss the biophysics of North African cooking—such as oil absorption in Tajine sauces, steam aeration in Keskas couscoussier, and 3.8x water retention in Karantika.
          </p>
        </div>
      </div>

      {/* Interactive Cooked-to-Raw Conversion Calculator */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Cooked-to-Raw Conversion Solver (Communal Pot → Plate Portions)
            </h3>
          </div>
          <button
            onClick={() =>
              setConversionDirection(
                conversionDirection === 'cooked_to_raw' ? 'raw_to_cooked' : 'cooked_to_raw'
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Switch: {conversionDirection === 'cooked_to_raw' ? 'Cooked → Raw' : 'Raw → Cooked'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Select ingredient */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700">Select Staple Ingredient</label>
            <select
              value={selectedConversion.id}
              onChange={(e) => {
                const found = COOKED_RAW_CONVERSIONS.find((c) => c.id === e.target.value);
                if (found) setSelectedConversion(found);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              {COOKED_RAW_CONVERSIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.ingredientNameFr} ({item.ingredientNameAr})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500 block">
              Yield Factor: <strong>{selectedConversion.conversionMultiplier}x</strong> ({selectedConversion.cookingMethod})
            </span>
          </div>

          {/* Input weight */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700">
              {conversionDirection === 'cooked_to_raw'
                ? 'Cooked Weight on Plate (Grams)'
                : 'Raw Ingredient Mass (Grams)'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="2000"
                step="5"
                value={inputWeightGrams}
                onChange={(e) => setInputWeightGrams(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <span className="text-slate-500 font-mono">g</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={inputWeightGrams}
              onChange={(e) => setInputWeightGrams(parseInt(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer mt-1"
            />
          </div>

          {/* Output box */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-lg flex flex-col justify-between">
            <div>
              <span className="text-xs text-emerald-800 block mb-1 font-medium">{calculatedOutput.label}</span>
              <span className="text-2xl font-bold text-emerald-950 font-mono">
                {calculatedOutput.resultGrams} <span className="text-xs font-normal">grams</span>
              </span>
            </div>
            <p className="text-[11px] text-emerald-900 mt-2 font-mono">
              {calculatedOutput.explanation}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <strong>Practical Guidance:</strong> {selectedConversion.practicalGuidance}
        </p>
      </div>

      {/* Staple Database Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Dishes */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search dish (Chorba, Rechta, Karantika...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            {/* Region Filter */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
              {['All', 'Algérois', 'Oranais', 'Constantinois', 'Biskri / Saharan', 'National'].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap cursor-pointer ${
                    selectedRegion === reg
                      ? 'bg-emerald-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredDishes.map((dish) => {
              const isSelected = selectedDish.id === dish.id;
              return (
                <div
                  key={dish.id}
                  onClick={() => setSelectedDish(dish)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{dish.nameFr}</h4>
                      <span className="text-[11px] text-emerald-800 font-medium block font-sans">
                        {dish.nameAr}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {dish.macrosPer100g.calories} kcal/100g
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1.5">
                    <span>{dish.region}</span>
                    <span>·</span>
                    <span>{dish.sauceType.split(' ')[0]}</span>
                    <span>·</span>
                    <span className="font-mono">P: {dish.macrosPer100g.proteinGrams}g</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Inspection Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span>{selectedDish.region} Region</span>
                <span>·</span>
                <span>{selectedDish.category}</span>
                <span>·</span>
                <span>{selectedDish.sauceType}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {selectedDish.nameFr}
                <span className="text-base font-normal text-emerald-800 font-sans">
                  ({selectedDish.nameAr})
                </span>
              </h3>
              <span className="text-xs text-slate-500 italic block mt-0.5">
                Transliteration: {selectedDish.transliteration}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-right">
              <span className="text-[10px] text-emerald-800 uppercase font-semibold block">Standard Portion ({selectedDish.standardPortionGrams}g)</span>
              <span className="text-xl font-bold text-emerald-950 font-mono">
                {Math.round((selectedDish.macrosPer100g.calories * selectedDish.standardPortionGrams) / 100)} kcal
              </span>
            </div>
          </div>

          {/* Macro Breakdown (per 100g & per portion) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Macronutrient Profile (per 100g cooked)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-slate-500 block text-[11px]">Energy</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {selectedDish.macrosPer100g.calories}
                </span>
                <span className="text-[10px] text-slate-500 block">kcal</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-slate-500 block text-[11px]">Protein</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {selectedDish.macrosPer100g.proteinGrams}g
                </span>
                <span className="text-[10px] text-slate-500 block">lean amino acid</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-slate-500 block text-[11px]">Carbohydrates</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {selectedDish.macrosPer100g.carbsGrams}g
                </span>
                <span className="text-[10px] text-slate-500 block">complex durum</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-slate-500 block text-[11px]">Dietary Lipids</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {selectedDish.macrosPer100g.fatGrams}g
                </span>
                <span className="text-[10px] text-slate-500 block">olive oil / smen</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-slate-500 block text-[11px]">Dietary Fiber</span>
                <span className="text-base font-bold text-emerald-800 font-mono">
                  {selectedDish.macrosPer100g.fiberGrams}g
                </span>
                <span className="text-[10px] text-slate-500 block">prebiotic Frik/pulse</span>
              </div>
            </div>
          </div>

          {/* Micronutrient Markers */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Micronutrient Markers & Electrolyte Balance (per 100g)
            </span>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                <span className="text-amber-900 font-semibold block text-[11px]">Bioavailable Iron (Fe)</span>
                <span className="text-lg font-bold text-amber-950 font-mono">
                  {selectedDish.micronutrientsPer100g.ironMg} mg
                </span>
                <span className="text-[10px] text-amber-800 block mt-0.5">High hematologic density</span>
              </div>
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                <span className="text-blue-900 font-semibold block text-[11px]">Sodium (Na)</span>
                <span className="text-lg font-bold text-blue-950 font-mono">
                  {selectedDish.micronutrientsPer100g.sodiumMg} mg
                </span>
                <span className="text-[10px] text-blue-800 block mt-0.5">Hydration indicator</span>
              </div>
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-lg">
                <span className="text-purple-900 font-semibold block text-[11px]">Potassium (K)</span>
                <span className="text-lg font-bold text-purple-950 font-mono">
                  {selectedDish.micronutrientsPer100g.potassiumMg} mg
                </span>
                <span className="text-[10px] text-purple-800 block mt-0.5">Electrolyte counter-balance</span>
              </div>
            </div>
          </div>

          {/* Cooking Physics & Dynamics */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-700" />
              Cooking Method Dynamics & Physics Analysis
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-500 block">Method:</span>
                <span className="font-medium text-slate-800 capitalize">
                  {selectedDish.cookingDynamics.method.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Oil Absorption Coeff (η_oil):</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedDish.cookingDynamics.oilAbsorptionCoefficient}x
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Moisture Yield Multiplier:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {selectedDish.cookingDynamics.moistureYieldFactor}x
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 pt-1">
              {selectedDish.cookingDynamics.cookingLossNotes}
            </p>
          </div>

          {/* Traditional Portion Reference */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Traditional Regional Portion Sizes
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {selectedDish.traditionalPortions.map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">{p.nameFr}</span>
                    <span className="text-[11px] text-slate-500">{p.description}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900">{p.grams}g</span>
                    <span className="text-[10px] text-slate-500 block">
                      {Math.round((selectedDish.macrosPer100g.calories * p.grams) / 100)} kcal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Dietary Notes */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-950">
            <strong>Clinical Dietary Notes:</strong> {selectedDish.clinicalDietaryNotes}
          </div>
        </div>
      </div>
    </div>
  );
};
