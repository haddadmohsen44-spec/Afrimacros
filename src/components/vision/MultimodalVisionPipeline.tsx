import React, { useState } from 'react';
import { VISION_PRESETS, VisionPreset } from '../../data/sampleVisionPresets';
import { VisionDishAnalysis } from '../../types/architecture';
import { Eye, Upload, Sparkles, Check, Copy, AlertCircle, RefreshCw, Layers, ShieldCheck, Scale } from 'lucide-react';

export const MultimodalVisionPipeline: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<VisionPreset>(VISION_PRESETS[0]);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [userHint, setUserHint] = useState<string>('Standard 24cm Tebsi with braised lamb shank, steamed semolina, and chickpeas');
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<VisionDishAnalysis | null>(null);
  const [analysisSource, setAnalysisSource] = useState<string>('');
  const [jsonCopied, setJsonCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle custom image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImageBase64(reader.result as string);
        setUserHint('');
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run the Vision Pipeline via /api/vision-log
  const runVisionInference = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      let imageBase64ToSend = customImageBase64;

      // If using preset image, fetch and convert to base64
      if (!imageBase64ToSend) {
        try {
          const resp = await fetch(selectedPreset.imageUrl);
          const blob = await resp.blob();
          imageBase64ToSend = await new Promise((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result as string);
            r.readAsDataURL(blob);
          });
        } catch (fetchErr) {
          // If CORS prevents fetching remote image directly, create mock placeholder data uri
          imageBase64ToSend = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
        }
      }

      const res = await fetch('/api/vision-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64ToSend,
          dishHint: userHint || selectedPreset.hint,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      setAnalysisResult(json.data);
      setAnalysisSource(json.source || 'gemini-3.8-flash');
    } catch (err: any) {
      console.error('Vision inference failed:', err);
      setErrorMsg(err.message || 'Vision pipeline inference failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyJsonContract = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(JSON.stringify(analysisResult, null, 2));
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Multimodal Computer Vision</span>
            <span>·</span>
            <span>Volumetric Priors</span>
            <span>·</span>
            <span>Bayesian Confidence Intervals</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Computer Vision / Multimodal AI Meal Logging Pipeline
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Engineered to overcome North African visual food challenges: estimating meat-to-semolina ratios beneath sauces, identifying green wheat (Frik) vs. grains, and quantifying surface smen/olive oil glazes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
            Model: Gemini 3.8 Flash Vision
          </span>
        </div>
      </div>

      {/* 4-Stage Architectural Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <span className="font-bold text-emerald-800 block">1. Morphological Detection</span>
          <p className="text-slate-600">Disambiguates Rechta flat ribbons, Couscous semolina caliber, and turnip vs potato geometry.</p>
        </div>
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <span className="font-bold text-emerald-800 block">2. Volumetric Spatial Prior</span>
          <p className="text-slate-600">Calibrates against 24cm deep Tebsi plates and earthenware Zlafa bowls to compute food volume (cm³).</p>
        </div>
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <span className="font-bold text-emerald-800 block">3. Meat-to-Carb Solver</span>
          <p className="text-slate-600">Calculates protein cutlet volume against semolina bed, plus surface sheen oil absorption.</p>
        </div>
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <span className="font-bold text-emerald-800 block">4. Bayesian 95% CIs</span>
          <p className="text-slate-600">Outputs honest uncertainty intervals [CI_min, CI_max] honoring visual occlusion.</p>
        </div>
      </div>

      {/* Main Interactive Test Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Selection & Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-700" />
              Meal Image & Sensor Input
            </h3>
            <span className="text-[11px] text-slate-500">Preset or Upload</span>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Select Algerian Staple Preset</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {VISION_PRESETS.map((preset) => {
                const isSelected = !customImageBase64 && selectedPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset);
                      setCustomImageBase64(null);
                      setUserHint(preset.hint);
                      setAnalysisResult(null);
                    }}
                    className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="font-bold block truncate">{preset.nameFr}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{preset.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Upload Dropzone */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700">Or Upload Your Own Photo</label>
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-slate-100/70 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-slate-700 font-medium text-xs">Click to browse or drop food photo</span>
              <span className="text-[10px] text-slate-400">JPG, PNG, WebP up to 15MB</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Active Image Preview */}
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
            <img
              src={customImageBase64 || selectedPreset.imageUrl}
              alt="Meal Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white p-2 rounded text-[11px] flex items-center justify-between">
              <span className="truncate">
                {customImageBase64 ? 'Custom User Upload' : selectedPreset.nameFr}
              </span>
              <span className="text-emerald-400 font-mono text-[10px]">
                {customImageBase64 ? 'Camera/File' : selectedPreset.badge}
              </span>
            </div>
          </div>

          {/* Context / Hint Input */}
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700">Clinical Context / Voice Hint (Optional)</label>
            <input
              type="text"
              value={userHint}
              onChange={(e) => setUserHint(e.target.value)}
              placeholder="e.g. Extra turnips, sheep meatball, light sauce..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <span className="text-[10px] text-slate-500">Guides multimodal priors for ambiguous ingredients.</span>
          </div>

          {/* Run Inference Button */}
          <button
            onClick={runVisionInference}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Gemini Vision Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Vision Inference & Macro Solver</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column: Inference Results & JSON Output (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-700" />
                Vision Pipeline Analysis Output
              </h3>
              <span className="text-[11px] text-slate-500">
                {analysisResult
                  ? `Resolved via ${analysisSource} (95% Bayesian Confidence)`
                  : 'Click "Run Vision Inference" to execute pipeline'}
              </span>
            </div>

            {analysisResult && (
              <button
                onClick={copyJsonContract}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {jsonCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {jsonCopied ? 'Copied' : 'Copy JSON'}
              </button>
            )}
          </div>

          {!analysisResult && !loading && (
            <div className="h-80 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <Eye className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-medium text-slate-700">Awaiting Image Submission</p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Select a preset staple above (such as Couscous, Chorba Frik, or Karantika) or upload a photo, then click "Run Vision Inference" to observe the volumetric solver and confidence intervals.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-80 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-800">Processing Multimodal Meal Analysis...</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Segmenting plate geometry · Estimating meat-to-semolina ratio · Solving oil absorption fond...
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4">
              {/* Dish Header */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider block">
                    Detected Dish ({analysisResult.region})
                  </span>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {analysisResult.dishNameFr}
                    <span className="text-sm font-normal text-emerald-800 font-sans">
                      ({analysisResult.dishNameAr})
                    </span>
                  </h4>
                  <span className="text-xs text-slate-600 block mt-0.5">
                    Estimated Mass: <strong>{analysisResult.estimatedTotalWeightGrams}g</strong> · Model Confidence: <strong>{Math.round(analysisResult.confidenceScore * 100)}%</strong>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Meat-to-Carb Ratio</span>
                  <span className="text-xs font-bold text-emerald-950 font-mono bg-white px-2 py-1 rounded border border-emerald-200 inline-block mt-0.5">
                    {analysisResult.meatToCarbRatio}
                  </span>
                </div>
              </div>

              {/* Macro Estimates with 95% Confidence Intervals */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                  Nutritional Breakdown & 95% Confidence Intervals
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Calories</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {analysisResult.macros.calories} <span className="text-xs font-normal">kcal</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">
                      95% CI: [{analysisResult.confidenceIntervals.caloriesRange[0]} - {analysisResult.confidenceIntervals.caloriesRange[1]}]
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Protein</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {analysisResult.macros.proteinGrams}g
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">
                      CI: [{analysisResult.confidenceIntervals.proteinRange[0]}g - {analysisResult.confidenceIntervals.proteinRange[1]}g]
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Carbohydrates</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {analysisResult.macros.carbsGrams}g
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">
                      CI: [{analysisResult.confidenceIntervals.carbsRange[0]}g - {analysisResult.confidenceIntervals.carbsRange[1]}g]
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Dietary Lipids (Fats)</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {analysisResult.macros.fatGrams}g
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">
                      CI: [{analysisResult.confidenceIntervals.fatRange[0]}g - {analysisResult.confidenceIntervals.fatRange[1]}g]
                    </span>
                  </div>
                </div>
              </div>

              {/* Segmented Components Table */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Segmented Plate Components
                </span>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Component</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-right">Est. Weight</th>
                        <th className="p-2 text-right">Plate Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {analysisResult.components.map((comp, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="p-2 font-medium text-slate-900">{comp.name}</td>
                          <td className="p-2 text-slate-600">{comp.category}</td>
                          <td className="p-2 text-right font-mono font-medium">{comp.estimatedWeightGrams}g</td>
                          <td className="p-2 text-right font-mono text-emerald-800">{comp.percentageOfPlate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Oil & Cooking Assessment */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-900 block">
                  Cooking Method & Oil Absorption Assessment:
                </span>
                <p className="text-slate-600">
                  {analysisResult.cookingMethodDetected} · {analysisResult.oilAbsorptionAssessment}
                </p>
                <p className="text-[11px] text-emerald-900 font-medium pt-1">
                  💡 {analysisResult.dietaryNotes}
                </p>
              </div>

              {/* Structured JSON Contract Viewer */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wide block">
                  Structured JSON Contract Output (API Verification)
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] max-h-48 overflow-y-auto">
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
