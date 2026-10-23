import React, { useState, useMemo } from 'react';
import {
  DEFAULT_METABOLIC_PARAMS,
  calculateWeeklyTargetAdjustment,
  evaluateNonJudgmentalNudge,
  generateSimulated30DayLog,
} from '../../utils/metabolicEngine';
import { DailyLogEntry, MetabolicParameters } from '../../types/architecture';
import { Flame, Sliders, Activity, Info, HeartPulse, RefreshCw } from 'lucide-react';

export const MetabolicEngineLab: React.FC = () => {
  // Parameters
  const [params, setParams] = useState<MetabolicParameters>(DEFAULT_METABOLIC_PARAMS);
  const [initialWeightKg, setInitialWeightKg] = useState(82.5);
  const [initialTdee, setInitialTdee] = useState(2600);
  const [selectedDayIndex, setSelectedDayIndex] = useState(29); // Latest day
  const [activeScenario, setActiveScenario] = useState<'normal' | 'couscous' | 'salty_chorba' | 'high_fiber'>('normal');

  // Generate 30-day simulated logs based on parameters
  const simulatedLogs: DailyLogEntry[] = useMemo(() => {
    return generateSimulated30DayLog(initialWeightKg, initialTdee - 550, initialTdee);
  }, [initialWeightKg, initialTdee]);

  const selectedLog = simulatedLogs[selectedDayIndex] || simulatedLogs[simulatedLogs.length - 1];
  const previousLog = selectedDayIndex > 0 ? simulatedLogs[selectedDayIndex - 1] : undefined;

  // Active non-judgmental nudge calculation
  const activeNudge = useMemo(() => {
    if (activeScenario === 'couscous') {
      return evaluateNonJudgmentalNudge({
        ...selectedLog,
        carbsGrams: 285,
        rawWeightKg: selectedLog.smoothedWeightKg + 0.65,
      }, selectedLog);
    } else if (activeScenario === 'salty_chorba') {
      return evaluateNonJudgmentalNudge({
        ...selectedLog,
        sodiumMg: 3100,
        rawWeightKg: selectedLog.smoothedWeightKg + 0.55,
      }, selectedLog);
    } else if (activeScenario === 'high_fiber') {
      const highFiberLog = { ...selectedLog };
      (highFiberLog as any).fiberGrams = 34;
      return evaluateNonJudgmentalNudge(highFiberLog, selectedLog);
    }
    return evaluateNonJudgmentalNudge(selectedLog, previousLog);
  }, [selectedLog, previousLog, activeScenario]);

  // Weekly adjustment calculation for current smoothed weight & TDEE
  const weeklyRecalibration = useMemo(() => {
    return calculateWeeklyTargetAdjustment(
      selectedLog.caloricIntake,
      selectedLog.smoothedWeightKg,
      selectedLog.estimatedTdee,
      params
    );
  }, [selectedLog, params]);

  // Compute SVG chart points
  const chartData = useMemo(() => {
    const minW = Math.min(...simulatedLogs.map((l) => Math.min(l.rawWeightKg, l.smoothedWeightKg))) - 0.5;
    const maxW = Math.max(...simulatedLogs.map((l) => Math.max(l.rawWeightKg, l.smoothedWeightKg))) + 0.5;
    const height = 180;
    const width = 640;
    const padding = 30;

    const scaleX = (i: number) => padding + (i / (simulatedLogs.length - 1)) * (width - 2 * padding);
    const scaleY = (val: number) => height - padding - ((val - minW) / (maxW - minW)) * (height - 2 * padding);

    const rawPoints = simulatedLogs.map((l, i) => `${scaleX(i)},${scaleY(l.rawWeightKg)}`).join(' ');
    const smoothedPoints = simulatedLogs.map((l, i) => `${scaleX(i)},${scaleY(l.smoothedWeightKg)}`).join(' ');

    return { minW, maxW, width, height, padding, scaleX, scaleY, rawPoints, smoothedPoints };
  }, [simulatedLogs]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Metabolic Physics</span>
            <span>·</span>
            <span>Wishnofsky-Hall Energy Equivalence</span>
            <span>·</span>
            <span>EWMA Noise Filter</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dynamic Metabolic & Expenditure Engine (Interactive Simulator)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Observe how exponentially weighted moving averages (EWMA) neutralize day-to-day fluid retention noise, compute rolling TDEE, and trigger 7-day adaptive macro recalibrations without judgmental alerts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Current Rolling TDEE</span>
            <span className="text-xl font-bold text-emerald-800 font-mono">
              {selectedLog.estimatedTdee} <span className="text-xs font-normal text-slate-600">kcal/day</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 30-Day Trajectory Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">
                30-Day Trajectory: Raw Weigh-Ins vs. Smoothed EWMA Trend
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
                <span className="text-slate-600">Raw Daily Scale (Fluid Noise)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-600 inline-block rounded"></span>
                <span className="text-slate-900 font-medium">Smoothed EWMA (α = {params.alphaWeight})</span>
              </div>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="relative bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-hidden">
            <svg
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              className="w-full h-48 select-none"
            >
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = chartData.padding + ratio * (chartData.height - 2 * chartData.padding);
                const val = (chartData.maxW - ratio * (chartData.maxW - chartData.minW)).toFixed(1);
                return (
                  <g key={ratio}>
                    <line
                      x1={chartData.padding}
                      y1={y}
                      x2={chartData.width - chartData.padding}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={chartData.padding - 6}
                      y={y + 3}
                      fontSize="9"
                      fill="#64748b"
                      textAnchor="end"
                      className="font-mono"
                    >
                      {val}kg
                    </text>
                  </g>
                );
              })}

              {/* Raw weigh-in line & points */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                points={chartData.rawPoints}
                opacity="0.7"
              />
              {simulatedLogs.map((l, i) => {
                const cx = chartData.scaleX(i);
                const cy = chartData.scaleY(l.rawWeightKg);
                const isSelected = i === selectedDayIndex;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 4 : 2}
                    fill={isSelected ? '#0284c7' : '#38bdf8'}
                    className="cursor-pointer transition-all hover:r-4"
                    onClick={() => setSelectedDayIndex(i)}
                  />
                );
              })}

              {/* Smoothed EWMA curve */}
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                points={chartData.smoothedPoints}
              />

              {/* Day selector cursor */}
              {selectedDayIndex !== null && (
                <line
                  x1={chartData.scaleX(selectedDayIndex)}
                  y1={chartData.padding}
                  x2={chartData.scaleX(selectedDayIndex)}
                  y2={chartData.height - chartData.padding}
                  stroke="#059669"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}
            </svg>
          </div>

          {/* Interactive Day Inspector */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Inspecting Day {selectedLog.day} ({selectedLog.date})</span>
              <span className="font-semibold text-slate-800">
                Raw: <span className="font-mono text-cyan-700">{selectedLog.rawWeightKg} kg</span> · Smoothed Trend: <span className="font-mono text-emerald-800">{selectedLog.smoothedWeightKg} kg</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500 block">Intake Logged</span>
                <span className="font-mono font-medium text-slate-800">{selectedLog.caloricIntake} kcal</span>
              </div>
              <div>
                <span className="text-slate-500 block">Carbs / Sodium</span>
                <span className="font-mono text-slate-700">{selectedLog.carbsGrams}g / {selectedLog.sodiumMg}mg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Engine Parameters & Sliders */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Engine Coefficients</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Weight EWMA Alpha (α_W)</span>
                <span className="font-mono font-bold text-emerald-900">{params.alphaWeight}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.25"
                step="0.01"
                value={params.alphaWeight}
                onChange={(e) => setParams({ ...params, alphaWeight: parseFloat(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Lower = smoother curve; Higher = faster reaction to scale.</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Target Weekly Change (kg)</span>
                <span className="font-mono font-bold text-emerald-900">{params.targetWeeklyChangeKg} kg/wk</span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="0.5"
                step="0.1"
                value={params.targetWeeklyChangeKg}
                onChange={(e) => setParams({ ...params, targetWeeklyChangeKg: parseFloat(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">-0.5kg/wk equates to -550 kcal/day sustainable deficit.</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Protein Target (g/kg Bodyweight)</span>
                <span className="font-mono font-bold text-emerald-900">{params.proteinPerKg} g/kg</span>
              </div>
              <input
                type="range"
                min="1.4"
                max="2.4"
                step="0.1"
                value={params.proteinPerKg}
                onChange={(e) => setParams({ ...params, proteinPerKg: parseFloat(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Clinically sets protein pool to protect lean muscle tissue.</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Base Initial TDEE (kcal)</span>
                <span className="font-mono font-bold text-emerald-900">{initialTdee} kcal</span>
              </div>
              <input
                type="range"
                min="2000"
                max="3400"
                step="50"
                value={initialTdee}
                onChange={(e) => setInitialTdee(parseInt(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Macro Recalibration Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              7-Day Macro Recalibration Output (Next Cycle Allocation)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Safety Floor: {params.minCaloricFloor} kcal · Clamp: ±{params.maxWeeklyAdjustmentKcal} kcal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg">
            <span className="text-xs text-emerald-800 block mb-1">New Caloric Target</span>
            <span className="text-2xl font-bold text-emerald-950 font-mono">
              {weeklyRecalibration.newCaloricTarget} <span className="text-xs font-normal">kcal/day</span>
            </span>
            <span className="text-[11px] text-emerald-800 block mt-1">
              {weeklyRecalibration.adjustmentKcal >= 0 ? `+${weeklyRecalibration.adjustmentKcal}` : weeklyRecalibration.adjustmentKcal} kcal from previous
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs text-slate-600 block mb-1">Protein Allocation (1.8g/kg)</span>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {weeklyRecalibration.macros.proteinGrams}g
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {weeklyRecalibration.macros.proteinGrams * 4} kcal ({Math.round((weeklyRecalibration.macros.proteinGrams * 4 / weeklyRecalibration.newCaloricTarget) * 100)}% of target)
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs text-slate-600 block mb-1">Lipids Floor (Olive Oil / Smen)</span>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {weeklyRecalibration.macros.fatGrams}g
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {weeklyRecalibration.macros.fatGrams * 9} kcal ({Math.round((weeklyRecalibration.macros.fatGrams * 9 / weeklyRecalibration.newCaloricTarget) * 100)}% of target)
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs text-slate-600 block mb-1">Carbohydrates Flex Pool</span>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {weeklyRecalibration.macros.carbsGrams}g
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {weeklyRecalibration.macros.carbsGrams * 4} kcal ({Math.round((weeklyRecalibration.macros.carbsGrams * 4 / weeklyRecalibration.newCaloricTarget) * 100)}% of target)
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <strong>Clinical Rationale:</strong> {weeklyRecalibration.reasoning}
        </p>
      </div>

      {/* Non-Judgmental Messaging Engine Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Non-Judgmental Guidance Engine (Scenario Simulator)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Select a physiological event to test how the UI communicates with the user:
          </span>
        </div>

        {/* Scenario buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'normal', label: '1. Standard Day (Steady Progress)' },
            { id: 'couscous', label: '2. Couscous Friday (+0.65kg Glycogen & Water Binding)' },
            { id: 'salty_chorba', label: '3. Salty Chorba & Olives (Sodium Fluid Retention)' },
            { id: 'high_fiber', label: '4. Frik & Legumes (High Microbiome Fiber)' },
          ].map((scen) => (
            <button
              key={scen.id}
              onClick={() => setActiveScenario(scen.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeScenario === scen.id
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {scen.label}
            </button>
          ))}
        </div>

        {/* Rendered Guidance Card */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-700" />
              {activeNudge.headline}
            </span>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
              {activeNudge.metricObserved}
            </span>
          </div>
          <p className="text-xs text-emerald-950 leading-relaxed">
            {activeNudge.body}
          </p>
          <div className="pt-2 border-t border-emerald-200/60 text-xs text-emerald-900 font-medium">
            💡 <strong>Actionable Context:</strong> {activeNudge.actionableContext}
          </div>
        </div>
      </div>
    </div>
  );
};
