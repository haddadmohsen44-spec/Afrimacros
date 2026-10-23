import React, { useState } from 'react';
import { Copy, Check, Download, BookOpen, Layers, Cpu, Database, Eye, Smartphone, ShieldCheck, Flame, Scale } from 'lucide-react';

export const TechSpecViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'metabolic' | 'ontology' | 'vision' | 'wireframes' | 'crdt'>('all');

  const fullMarkdownSpec = `# AfriMacros: Technical Specification & Architecture Document
**Target Domain:** Local-First North African & Algerian Metabolic Nutrition Intelligence
**Role:** Lead Health-Tech Product Architect & AI Systems Engineer
**Document Version:** 1.0.0-PROD
**Date:** October 2026

---

## 1. Executive Summary & Architectural Pillars

Traditional diet applications (e.g., MyFitnessPal, MacroFactor) fail in North African contexts due to three fundamental flaws:
1. **Linear Calorie Fallacy & Volatility:** Weight spikes triggered by high-sodium broths (Chorba Frik) or carbohydrate loading (Couscous, Rechta) cause punitive UI warnings ("Over Goal!") leading to user abandonment.
2. **Western Nutritional Bias:** Databases lack regional dish physics—failing to model smen/olive oil absorption in Tajine sauces versus steam hydration in Keskas cooking.
3. **Communal Pot Asymmetry:** Family meals are prepared in large pots (Qedra, Tajine) and portioned intuitively into communal or individual dishes (*Zlafa*, *Tebsi*), making standard single-ingredient entry impossible.

**AfriMacros solves this through four pillars:**
- **Local-First, Offline-Authoritative State:** Data stored in client-side SQLite/IndexedDB with CRDT synchronization for privacy and zero-latency performance across regions with intermittent connectivity.
- **Dynamic EWMA Metabolic Engine:** Adaptive rolling TDEE calculations filtering physiological water weight noise with compassionate, non-judgmental UI semantics.
- **Biophysical North African Food Ontology:** Modeling variable cooking dynamics (oil absorption coefficient $\\eta_{\\text{oil}}$, steam expansion $\\kappa_{\\text{moisture}}$, and Cooked-to-Raw reverse mappings).
- **Multimodal Visual AI Pipeline:** Zero-friction photo logging utilizing Gemini Vision to resolve dish identification, meat-to-semolina ratios, and Bayesian macro confidence intervals.

---

## 2. Component 1: Dynamic Metabolic & Expenditure Engine

### 2.1 Mathematical Formulation

The engine continuously models the user's Total Daily Energy Expenditure ($TDEE$) as a rolling state variable derived from daily caloric intake and exponential weight trends:

#### Weight Smoothing (EWMA)
$$EWMA_W(t) = \\alpha_W \\cdot W_t + (1 - \\alpha_W) \\cdot EWMA_W(t-1)$$
*Where:*
- $W_t$ is the raw morning scale weigh-in on day $t$.
- $\\alpha_W \\in [0.10, 0.15]$ (Nominal default: $0.12$). This half-life of $\\approx 6\\text{ days}$ suppresses short-term fluid shifts caused by sodium retention, bowel transit, and glycogen-bound water ($1\\text{g glycogen} \\approx 3\\text{--}4\\text{g } H_2O$).

#### Caloric Intake Smoothing
$$EWMA_C(t) = \\alpha_C \\cdot C_t + (1 - \\alpha_C) \\cdot EWMA_C(t-1)$$
*Where:*
- $C_t$ is total logged intake on day $t$.
- $\\alpha_C = 0.14$ (7-day exponential smoothing window).

#### Energy Conservation & Expenditure Formulation
Tissue mass alteration is modeled via the Wishnofsky-Hall biophysical energy equivalent:
$$\\kappa_{\\text{energy}} \\approx 7700 \\text{ kcal/kg}$$

Over any evaluation window $\\Delta t$ (days):
$$\\Delta W_{\\text{trend}}(t) = EWMA_W(t) - EWMA_W(t - \\Delta t)$$

Daily energy balance equation:
$$TDEE_{\\text{rolling}}(t) = \\overline{EWMA_C}(t) - \\left( \\frac{\\Delta W_{\\text{trend}}(t)}{\\Delta t} \\times 7700 \\right)$$

### 2.2 7-Day Macro Recalibration Cycle

Rather than volatile daily recalculations, target allocations are updated every $N = 7$ days:
1. **Desired Rate of Change:** Let $\\Delta W_{\\text{goal}}$ be the user's weekly target (e.g. $-0.5\\text{ kg/week}$).
2. **Target Deficit / Surplus:**
   $$\\Delta C_{\\text{target}} = \\frac{\\Delta W_{\\text{goal}} \\times 7700}{7} = -550 \\text{ kcal/day}$$
3. **Unclamped Calorie Target:**
   $$C^* = TDEE_{\\text{rolling}} + \\Delta C_{\\text{target}}$$
4. **Safety Clamping:**
   $$C_{\\text{new}} = \\text{clamp}\\left(C^*, C_{\\text{prev}} - 150, C_{\\text{prev}} + 150\\right)$$
   $$\\text{Subject to: } C_{\\text{new}} \\ge \\text{CaloricFloor} \\text{ (1400 kcal female, 1600 kcal male)}$$
5. **Macro Allocation Matrix:**
   - **Protein ($P$):** Fixed to fat-free mass preservation: $1.8\\text{ g/kg}$ of smoothed weight:
     $$P_{\\text{target}} = \\text{round}(EWMA_W \\times 1.8)$$
   - **Lipids ($F$):** Essential for hormonal homeostasis (olive oil, smen): minimum $25\\%$ of total calories:
     $$F_{\\text{target}} = \\text{round}\\left(\\frac{\\max(C_{\\text{new}} \\times 0.25, EWMA_W \\times 0.8 \\times 9)}{9}\\right)$$
   - **Carbohydrates ($C$):** Remainder flex pool:
     $$C_{\\text{target}} = \\text{round}\\left(\\frac{C_{\\text{new}} - (4 \\times P_{\\text{target}}) - (9 \\times F_{\\text{target}})}{4}\\right)$$

### 2.3 Non-Judgmental UI Messaging Engine

The interface completely bans punitive UI artifacts:
- **No red progress bars** when exceeding target calories.
- **No "Failure" or "Over Goal" dialogs**.
- **Physiological attribution heuristic:**
  - *Trigger:* Scale spike $> 0.3\\text{ kg}$ + Sodium $> 2400\\text{ mg}$ (e.g. Chorba Frik, Tajine Zitoun).
  - *UI Presentation:* "Normal fluid shift observed. High mineral and sodium intake temporarily binds extracellular water. The 7-day trend remains on track."
  - *Trigger:* Carbs $> 240\\text{ g}$ (e.g. Couscous Friday).
  - *UI Presentation:* "Glycogen replenishment: Muscles loaded healthy complex energy. Each gram of stored glycogen holds 3–4g of cellular water."

---

## 3. Component 2: Algerian Food Ontology & Database Design

### 3.1 JSON Database Schema

\`\`\`json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AfriMacrosRegionalDish",
  "type": "object",
  "properties": {
    "dishId": { "type": "string" },
    "nameFr": { "type": "string" },
    "nameAr": { "type": "string" },
    "transliteration": { "type": "string" },
    "region": { "enum": ["Algérois", "Oranais", "Constantinois", "Biskri / Saharan", "Kabyle", "National"] },
    "category": { "enum": ["Soups & Broths", "Steamed Pastas & Semolinas", "Baked Dishes", "Tajines & Meatballs", "Stuffed Vegetables", "Breads & Pastries"] },
    "sauceType": { "enum": ["Sauce Blanche (Merqa Beida)", "Sauce Rouge (Merqa Hamra)", "Sauce Jaune", "Broth / Frik Base", "Dry / Baked"] },
    "cookingDynamics": {
      "type": "object",
      "properties": {
        "method": { "enum": ["steamed", "simmered_stew", "oven_baked", "pan_fried", "clay_pot_braised"] },
        "oilAbsorptionCoefficient": { "type": "number", "description": "Ratio of lipid retention from fond/smen" },
        "moistureYieldFactor": { "type": "number", "description": "Raw-to-cooked mass multiplier" },
        "brothEvaporationRate": { "type": "number", "description": "Percentage liquid reduction" }
      },
      "required": ["method", "oilAbsorptionCoefficient", "moistureYieldFactor", "brothEvaporationRate"]
    },
    "macrosPer100g": {
      "type": "object",
      "properties": {
        "calories": { "type": "number" },
        "proteinGrams": { "type": "number" },
        "carbsGrams": { "type": "number" },
        "fatGrams": { "type": "number" },
        "fiberGrams": { "type": "number" }
      },
      "required": ["calories", "proteinGrams", "carbsGrams", "fatGrams", "fiberGrams"]
    },
    "micronutrientsPer100g": {
      "type": "object",
      "properties": {
        "ironMg": { "type": "number" },
        "sodiumMg": { "type": "number" },
        "potassiumMg": { "type": "number" },
        "calciumMg": { "type": "number" }
      },
      "required": ["ironMg", "sodiumMg", "potassiumMg"]
    },
    "traditionalPortions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "nameFr": { "type": "string" },
          "nameAr": { "type": "string" },
          "grams": { "type": "number" }
        },
        "required": ["id", "nameFr", "nameAr", "grams"]
      }
    }
  },
  "required": ["dishId", "nameFr", "nameAr", "region", "cookingDynamics", "macrosPer100g", "micronutrientsPer100g"]
}
\`\`\`

### 3.2 Algerian Staples Nutritional Profile (per 100g cooked)

| Dish | Region | Method | Cal (kcal) | Pro (g) | Carb (g) | Fat (g) | Fiber (g) | Iron (mg) | Sodium (mg) | Key Dynamics |
|---|---|---|---|---|---|---|---|---|---|---|
| **Chorba Frik** | Algérois | Braised / Simmer | 108 | 6.8 | 11.7 | 3.9 | 2.2 | 1.3 | 215 | Frik expansion 3.1x; prebiotic resistant starch |
| **Rechta Algéroise** | Algérois | Steamed (Keskas) | 124 | 8.6 | 15.2 | 3.2 | 1.5 | 0.9 | 152 | Smen coating $\\eta_{\\text{oil}} = 1.15$; turnip glucosinolates |
| **Karantika** | Oranais | Oven Custard | 157 | 6.7 | 16.6 | 7.3 | 3.1 | 1.5 | 236 | 1:4 hydration ratio; high lysine |
| **Mtewem** | Algérois | Sauce Blanche | 182 | 15.4 | 4.8 | 11.2 | 1.4 | 2.2 | 280 | High protein & zinc; garlic allicin |
| **Chakhchoukha Biskra** | Biskri | Clay Pot Braise | 148 | 7.9 | 18.4 | 4.8 | 2.4 | 1.8 | 310 | Red chili thermogenesis; sauce immersion |
| **Tajine El Koucha** | Constantinois | Oven Tray | 164 | 9.8 | 14.1 | 7.6 | 2.1 | 1.4 | 245 | Potato lipid absorption $\\eta_{\\text{oil}} = 1.28$ |
| **Dolma Algérienne** | Algérois | Simmered Stew | 98 | 7.2 | 6.8 | 4.4 | 1.9 | 1.2 | 185 | Low GI; high vegetable-to-calorie ratio |

### 3.3 Cooked-to-Raw Conversion Factor Table

To resolve the challenge of measuring food in communal pots versus single serving sizes:

| Raw Ingredient | Cooked Form | Cooking Method | Multiplier ($F_y$) | Water Delta (%) | Fat Delta (%) | Practical Logging Guidance |
|---|---|---|---|---|---|---|
| **Semoule de blé dur** | Steamed Couscous | Triple steaming in Keskas | **2.60x** | +160% | +10% | $200\\text{g cooked} \\div 2.60 = 76.9\\text{g raw semolina}$ |
| **Frik (Blé vert)** | Chorba Frik base | Slow broth simmer | **3.10x** | +210% | +15% | $1\\text{ Zlafa (350g)} \\approx 50\\text{g raw frik grain}$ |
| **Pâte Rechta fraîche** | Steamed Rechta | Steam bath + smen aerate | **2.30x** | +130% | +12% | $100\\text{g raw dough} \\to 230\\text{g tender ribbons}$ |
| **Farine pois chiches** | Karantika flan | 1:4 liquid oven bake | **3.80x** | +280% | +100% | $200\\text{g slice} = 52.6\\text{g raw flour} + 8\\text{ml oil}$ |
| **Pois chiches secs** | Homs mijotés | Overnight soak + simmer | **2.25x** | +125% | +5% | $50\\text{g garnish} = 22\\text{g dry legume}$ |
| **Épaule d'agneau** | Agneau mijoté | Slow braise in stew | **0.68x** | -32% | -25% (fond) | $100\\text{g cooked meat} = 147\\text{g raw trimmed cut}$ |
| **Viande hachée** | Boulettes Mtewem | Poached in white sauce | **0.78x** | -22% | -18% | $100\\text{g raw beef} \\to 78\\text{g cooked meatball}$ |
| **Pommes de terre** | Batata Koucha | Open tray roast with oil | **0.84x** | -16% | +25% (absorbed) | High lipid absorption factor from baking pan |

---

## 4. Component 3: Computer Vision / Multimodal AI Meal Logging Pipeline

### 4.1 Four-Stage Vision Pipeline Architecture

1. **Stage 1: Dish Classification & Morphological Identification**
   - High-resolution feature extraction to disambiguate subtle regional nuances (e.g. Rechta flat ribbon vs Italian tagliatelle; green roasted Frik granules vs lentils; white turnip discs vs potato chunks).
2. **Stage 2: Spatial Volumetric & Density Priors**
   - Bounding geometry referenced against standard North African tableware:
     - Standard *Tebsi* (flat or shallow rim plate): $24\\text{--}26\\text{ cm}$ diameter.
     - Earthenware *Zlafa* (soup bowl): $14\\text{ cm}$ top diameter, $350\\text{--}400\\text{ ml}$ volume.
3. **Stage 3: Ingredient & Ratio Disaggregation Solver**
   - Solves the Meat-to-Carb ratio ($R_{M:C}$):
     $$R_{M:C} = \\frac{\\text{Estimated Meat Volume } \\times \\rho_{\\text{meat}}}{\\text{Estimated Semolina Volume } \\times \\rho_{\\text{semolina}}}$$
   - Identifies sauce saturation index and surface lipid sheen (detecting smen/olive oil glazes).
4. **Stage 4: Bayesian Macro Synthesis with 95% Confidence Intervals**
   - Combines detected volumes with the regional food ontology, outputting a distribution $[CI_{\\text{low}}, CI_{\\text{high}}]$ acknowledging inherent visual occlusion.

### 4.2 System Prompt & API Contract

\`\`\`json
{
  "request": {
    "model": "gemini-3.8-flash",
    "systemInstruction": "You are AfriMacros Vision Engine, an expert North African clinical dietitian and computer vision specialist. Identify Algerian dishes, compute meat-to-carb ratios, assess cooking method lipid absorption, and output structured JSON with 95% confidence intervals.",
    "responseMimeType": "application/json"
  },
  "responseExample": {
    "dishNameFr": "Couscous Algérien à l'Agneau",
    "dishNameAr": "كسكسي جزائري بلحم الخروف والخضر",
    "region": "National",
    "confidenceScore": 0.95,
    "estimatedTotalWeightGrams": 450,
    "meatToCarbRatio": "1:2.3 (Braised Lamb to Steamed Semolina)",
    "cookingMethodDetected": "Triple steamed semolina with smen, slow-braised lamb shanks",
    "oilAbsorptionAssessment": "High sauce retention: semolina absorbs ~16ml of braise fat and smen",
    "components": [
      { "name": "Steamed Semolina (Cooked)", "estimatedWeightGrams": 220, "percentageOfPlate": 49, "category": "Complex Carb" },
      { "name": "Braised Lamb Shank", "estimatedWeightGrams": 95, "percentageOfPlate": 21, "category": "Protein" },
      { "name": "Stewed Vegetables (Turnips, Carrots, Zucchini)", "estimatedWeightGrams": 90, "percentageOfPlate": 20, "category": "Vegetable Fiber" },
      { "name": "Chickpeas in Spiced Broth", "estimatedWeightGrams": 45, "percentageOfPlate": 10, "category": "Legume" }
    ],
    "macros": {
      "calories": 615,
      "proteinGrams": 34.0,
      "carbsGrams": 74.5,
      "fatGrams": 20.8,
      "fiberGrams": 8.9,
      "sodiumMg": 710,
      "ironMg": 4.8
    },
    "confidenceIntervals": {
      "caloriesRange": [550, 680],
      "proteinRange": [29.0, 39.0],
      "carbsRange": [67.0, 83.0],
      "fatRange": [16.5, 25.5]
    }
  }
}
\`\`\`

---

## 5. Component 4: UI/UX Wireframe Specification

### 5.1 Screen A: Daily Dashboard
- **Caloric & Macro Ring Visualization:** Concentric circular SVG rings (Calories, Protein, Carbs, Fat) displaying current vs target without red deficit styling.
- **Dynamic EWMA Weight Trend Line:** Dual curve visualization displaying noisy raw weigh-ins vs. smoothed trend line ($EWMA_W$).
- **North African Hydration Tracker:** Instant quick-add pills for:
  - Pure Mineral Water ($250\\text{ ml}$)
  - Maghrebi Mint Tea / Atay ($150\\text{ ml}$)
  - Cafe Pressé / Mazagran ($120\\text{ ml}$)
  - Broth Water from Chorba ($180\\text{ ml}$)
- **Non-Judgmental Guidance Banner:** Real-time physiological reassurance when sodium or carbohydrates fluctuate.

### 5.2 Screen B: Quick-Log Modal
- **Tab 1: Regional GS1 Barcode Scanner:** High-speed scanner supporting Algerian manufactured staples (Candia Algérie, Soummam yogurts, Amor Benamor semolina/pastas, Sim couscous).
- **Tab 2: Multimodal AI Photo Scan:** Direct camera or gallery input with bounding box confirmation and confidence sliders.
- **Tab 3: Regional Database Search:** Search in French, Arabic, or transliteration with traditional portion selectors (*Zlafa*, *Tebsi*, *Morceau*, *Khobza*).

### 5.3 Screen C: Batch Recipe Builder (Pot Cooking Calculator)
- **Communal Cooking Resolution:** Users input raw pot ingredients (e.g. 800g lamb, 750g semolina, 150g chickpeas, 60ml olive oil).
- **Evaporation & Absorption Engine:** Applies biophysical yield multipliers to compute total cooked pot weight ($W_{\\text{cooked}}$).
- **Family Serving Splits:**
  - Option A: Equal division ($N$ servings).
  - Option B: Asymmetric plate taring (e.g. Father $350\\text{g}$, Mother $280\\text{g}$, Youth $180\\text{g}$).
- Automatically writes calibrated macros into the user's personal offline log.

---

## 6. Weekly Program & Regional Dietary Variety Engine

### 6.1 7-Day Cyclical Carbohydrate & Energy Architecture
To honor ancestral cultural eating rhythms while optimizing metabolic health, AfriMacros structures the weekly meal cycle:
- **Saturday (Algérois Heritage):** Delicate white broths, turnip glucosinolates, stuffed courgettes (*Dolma*).
- **Sunday (Oranais Coastal):** Plant-protein lysine from *Karantika*, marine omega-3s from fresh grilled sardines with Chermoula.
- **Monday (Kabyle Mountain):** High-fiber mountain barley (*Bsissa*), broad beans, steamed wild vegetables (*Amekfoul*), and dried mountain figs.
- **Tuesday (Constantinois Aromatics):** Oven-tray potato roasting (*Tajine El Koucha*), olive polyphenols and turmeric (*Tajine Zitoun*).
- **Wednesday (Metabolic High-Protein & Recovery):** Garlic-allium meatballs (*Mtewem*), live probiotic *Lben*, charred *Mechouia* tuna.
- **Thursday (Saharan Warmth & High Fiber):** Thermal capsaicin from Biskra chili (*Chakhchoukha*), 16g prebiotic fiber from chickpea & fava stew (*Doubara*).
- **Friday (Communal Tradition & Carbohydrate Refuel):** Strategic $+300\\text{ kcal}$ glycogen loading from 7-vegetable lamb couscous, absorbed by the EWMA engine without guilt or compensatory starvation.

### 6.2 Dietary Diversity & Microbiome Metrics
- **Plant Species Target:** $>30$ distinct botanicals per week (whole grains, durum, frik, legumes, wild herbs, root vegetables, alliums, and spices).
- **Zero-Repeat Constraint:** 28 distinct preparations across 7 days.

---

## 7. Local-First Architecture & Privacy Integrity

- **Offline-First Persistence:** Database stored locally in IndexedDB / SQLite via Dexie / CRDTs (Yjs / Automerge).
- **Zero-Cloud Leakage of Private Biometrics:** Daily weights, photos, and personal logs stay on-device; only anonymized vision embeddings pass through inference endpoints.
- **Deterministic Edge Execution:** The EWMA metabolic engine executes 100% locally in TypeScript with zero server latency.
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullMarkdownSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdownFile = () => {
    const blob = new Blob([fullMarkdownSpec], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AfriMacros-Technical-Specification.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Health-Tech Architecture Blueprint</span>
            <span>·</span>
            <span>Local-First Dietetics</span>
            <span>·</span>
            <span>Algeria & North Africa</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            AfriMacros Technical Specification & System Architecture
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Production engineering documentation defining the EWMA expenditure solver, regional ontology, computer vision pipeline, and wireframe UX flows.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Spec (MD)'}
          </button>
          <button
            onClick={downloadMarkdownFile}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Spec
          </button>
        </div>
      </div>

      {/* Chapter Filter Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Complete Document', icon: BookOpen },
          { id: 'metabolic', label: '1. EWMA Metabolic Engine', icon: Flame },
          { id: 'ontology', label: '2. Food Ontology & Physics', icon: Database },
          { id: 'vision', label: '3. Multimodal Vision AI', icon: Eye },
          { id: 'wireframes', label: '4. UI/UX Wireframe Specs', icon: Smartphone },
          { id: 'crdt', label: '5. Local-First & CRDTs', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Spec Content Cards */}
      <div className="space-y-6">
        {/* Section 1: Metabolic Engine */}
        {(activeSection === 'all' || activeSection === 'metabolic') && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold tracking-wide uppercase">
              <Cpu className="w-4 h-4" />
              <span>Section 01 · Mathematical Formulation</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Dynamic Metabolic & Expenditure Engine (EWMA Solver)
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standard linear caloric tracking assumes static metabolic rates, creating frustration when users experience natural water weight swings. AfriMacros models Total Daily Energy Expenditure ($TDEE$) as a rolling state variable using exponentially weighted moving averages (EWMA) to filter high-frequency fluid noise while capturing true metabolic adaptation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Weight Smoothing (EWMA)</span>
                <div className="font-mono text-sm bg-white p-3 rounded border border-slate-200 text-emerald-900 font-medium">
                  EWMA_W(t) = α_W · W(t) + (1 - α_W) · EWMA_W(t-1)
                </div>
                <p className="text-xs text-slate-600">
                  Smoothing coefficient <strong>α_W = 0.12</strong> (half-life of ~6 days). Strips transient fluid retention caused by sodium in Chorba and glycogen hydration from Couscous.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Rolling TDEE Energy Balance</span>
                <div className="font-mono text-sm bg-white p-3 rounded border border-slate-200 text-emerald-900 font-medium">
                  TDEE(t) = EWMA_C(t) - [ (ΔEWMA_W / Δt) × 7700 kcal/kg ]
                </div>
                <p className="text-xs text-slate-600">
                  Applying the Wishnofsky-Hall energy equivalence: 1 kg tissue loss ≈ 7700 kcal energy deficit.
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-lg space-y-2">
              <span className="text-xs font-bold text-emerald-900">7-Day Recalibration Cycle & Non-Judgmental UI Ethics</span>
              <ul className="text-xs text-emerald-950 space-y-1.5 list-disc pl-4">
                <li><strong>7-Day Evaluation Horizon:</strong> Macro targets never oscillate daily. Target deficit is calculated as (Target_Weekly_Change × 7700) / 7.</li>
                <li><strong>Safety Floor & Clamping:</strong> Max adjustments clamped to ±150 kcal/week with absolute minimum floor of 1400 kcal (female) / 1600 kcal (male).</li>
                <li><strong>Zero-Pills, Zero-Red Warnings:</strong> Elimination of red "Over Target" alerts. When sodium or carbs spike, the engine displays physiological explanations (e.g. glycogen water binding or temporary electrolyte equilibrium).</li>
              </ul>
            </div>
          </section>
        )}

        {/* Section 2: Algerian Food Ontology */}
        {(activeSection === 'all' || activeSection === 'ontology') && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold tracking-wide uppercase">
              <Database className="w-4 h-4" />
              <span>Section 02 · Regional Ontology & Physics</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Algerian Food Ontology & Cooking Dynamics Schema
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Algerian culinary science exhibits severe variability depending on heat and moisture mechanics. Unlike Western dry baking, North African dishes utilize steam hydration (Keskas), prolonged low-temperature smen/olive oil braising (Tajine), and high-liquid flour custard baking (Karantika).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-2.5">Staple Dish</th>
                    <th className="p-2.5">Region</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5 text-right">Kcal/100g</th>
                    <th className="p-2.5 text-right">Protein</th>
                    <th className="p-2.5 text-right">Carbs</th>
                    <th className="p-2.5 text-right">Fat</th>
                    <th className="p-2.5 text-right">Fiber</th>
                    <th className="p-2.5 text-right">Iron (mg)</th>
                    <th className="p-2.5">Cooking Dynamics & Physics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">Chorba Frik</td>
                    <td className="p-2.5 text-slate-600">Algérois</td>
                    <td className="p-2.5 text-slate-600">Clay Simmer</td>
                    <td className="p-2.5 text-right font-mono font-medium">108</td>
                    <td className="p-2.5 text-right font-mono">6.8g</td>
                    <td className="p-2.5 text-right font-mono">11.7g</td>
                    <td className="p-2.5 text-right font-mono">3.9g</td>
                    <td className="p-2.5 text-right font-mono">2.2g</td>
                    <td className="p-2.5 text-right font-mono">1.3</td>
                    <td className="p-2.5 text-slate-600">Frik expansion 3.1x; resistant starch matrix</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">Rechta Algéroise</td>
                    <td className="p-2.5 text-slate-600">Algérois</td>
                    <td className="p-2.5 text-slate-600">Steamed Keskas</td>
                    <td className="p-2.5 text-right font-mono font-medium">124</td>
                    <td className="p-2.5 text-right font-mono">8.6g</td>
                    <td className="p-2.5 text-right font-mono">15.2g</td>
                    <td className="p-2.5 text-right font-mono">3.2g</td>
                    <td className="p-2.5 text-right font-mono">1.5g</td>
                    <td className="p-2.5 text-right font-mono">0.9</td>
                    <td className="p-2.5 text-slate-600">Smen glaze (η_oil = 1.15); turnip glucosinolates</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">Karantika</td>
                    <td className="p-2.5 text-slate-600">Oranais</td>
                    <td className="p-2.5 text-slate-600">Oven Custard</td>
                    <td className="p-2.5 text-right font-mono font-medium">157</td>
                    <td className="p-2.5 text-right font-mono">6.7g</td>
                    <td className="p-2.5 text-right font-mono">16.6g</td>
                    <td className="p-2.5 text-right font-mono">7.3g</td>
                    <td className="p-2.5 text-right font-mono">3.1g</td>
                    <td className="p-2.5 text-right font-mono">1.5</td>
                    <td className="p-2.5 text-slate-600">1:4 water ratio; chickpea lysine powerhouse</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">Mtewem</td>
                    <td className="p-2.5 text-slate-600">Algérois</td>
                    <td className="p-2.5 text-slate-600">Sauce Blanche</td>
                    <td className="p-2.5 text-right font-mono font-medium">182</td>
                    <td className="p-2.5 text-right font-mono">15.4g</td>
                    <td className="p-2.5 text-right font-mono">4.8g</td>
                    <td className="p-2.5 text-right font-mono">11.2g</td>
                    <td className="p-2.5 text-right font-mono">1.4g</td>
                    <td className="p-2.5 text-right font-mono">2.2</td>
                    <td className="p-2.5 text-slate-600">Garlic allicin; meatball condensation (0.82x)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">Chakhchoukha Biskria</td>
                    <td className="p-2.5 text-slate-600">Biskri</td>
                    <td className="p-2.5 text-slate-600">Clay Braise</td>
                    <td className="p-2.5 text-right font-mono font-medium">148</td>
                    <td className="p-2.5 text-right font-mono">7.9g</td>
                    <td className="p-2.5 text-right font-mono">18.4g</td>
                    <td className="p-2.5 text-right font-mono">4.8g</td>
                    <td className="p-2.5 text-right font-mono">2.4g</td>
                    <td className="p-2.5 text-right font-mono">1.8</td>
                    <td className="p-2.5 text-slate-600">Capsaicin thermogenesis; high marrow iron</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">Tajine El Koucha</td>
                    <td className="p-2.5 text-slate-600">Constantine</td>
                    <td className="p-2.5 text-slate-600">Oven Tray</td>
                    <td className="p-2.5 text-right font-mono font-medium">164</td>
                    <td className="p-2.5 text-right font-mono">9.8g</td>
                    <td className="p-2.5 text-right font-mono">14.1g</td>
                    <td className="p-2.5 text-right font-mono">7.6g</td>
                    <td className="p-2.5 text-right font-mono">2.1g</td>
                    <td className="p-2.5 text-right font-mono">1.4</td>
                    <td className="p-2.5 text-slate-600">High oil absorption in potatoes (η_oil = 1.28)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">Dolma Algérienne</td>
                    <td className="p-2.5 text-slate-600">Algérois</td>
                    <td className="p-2.5 text-slate-600">Simmered Stew</td>
                    <td className="p-2.5 text-right font-mono font-medium">98</td>
                    <td className="p-2.5 text-right font-mono">7.2g</td>
                    <td className="p-2.5 text-right font-mono">6.8g</td>
                    <td className="p-2.5 text-right font-mono">4.4g</td>
                    <td className="p-2.5 text-right font-mono">1.9g</td>
                    <td className="p-2.5 text-right font-mono">1.2</td>
                    <td className="p-2.5 text-slate-600">High vegetable volume; low caloric density</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-xs font-bold text-slate-800">Cooked-to-Raw Conversion Factor Mechanics</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Traditional cooking involves batch pots. When a user serves themselves from a couscoussier, measuring raw dry semolina is impossible. The engine applies the reverse yield multiplier:
                <br />
                <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-emerald-800">
                  Raw_Weight = Cooked_Portion ÷ Yield_Factor (e.g. Semolina: 260g cooked ÷ 2.60 = 100g raw)
                </code>
              </p>
            </div>
          </section>
        )}

        {/* Section 3: Multimodal Vision AI Pipeline */}
        {(activeSection === 'all' || activeSection === 'vision') && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold tracking-wide uppercase">
              <Eye className="w-4 h-4" />
              <span>Section 03 · Computer Vision & Multimodal Pipeline</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Multimodal Vision AI Meal Logging Architecture
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              North African food photography poses severe challenges: monochromatic couscous sauce saturation, hidden meat chunks beneath semolina mounds, and variable density broths. The AfriMacros pipeline implements a 4-stage inference topology.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-xs font-bold text-emerald-800">Stage 1: Classification</span>
                <p className="text-[11px] text-slate-600">Disambiguates regional pasta morphology (Rechta vs noodles), grain types (Frik vs rice), and sauce chrominance.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-xs font-bold text-emerald-800">Stage 2: Volumetric Spatial</span>
                <p className="text-[11px] text-slate-600">References standard 24cm Tebsi plates and 350ml Zlafa bowls to estimate cubic centimeter food volumes.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-xs font-bold text-emerald-800">Stage 3: Meat-to-Carb Ratio</span>
                <p className="text-[11px] text-slate-600">Computes the ratio of protein cutlets/meatballs to complex semolina bed, plus surface lipid sheen.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-xs font-bold text-emerald-800">Stage 4: Bayesian CIs</span>
                <p className="text-[11px] text-slate-600">Produces 95% Confidence Intervals [min, max] rather than misleading single-digit pseudoprecision.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto">
              <span className="text-slate-400 block mb-2">// Server-Side Gemini 3.8 Flash Vision Pipeline Payload Schema</span>
              {`{
  "dishNameFr": "Couscous Algérien à l'Agneau",
  "dishNameAr": "كسكسي جزائري بلحم الخروف والخضر",
  "confidenceScore": 0.95,
  "meatToCarbRatio": "1:2.3 (Braised Lamb to Steamed Semolina)",
  "components": [
    { "name": "Steamed Semolina", "estimatedWeightGrams": 220, "percentageOfPlate": 49 },
    { "name": "Braised Lamb Shank", "estimatedWeightGrams": 95, "percentageOfPlate": 21 },
    { "name": "Seven Vegetables", "estimatedWeightGrams": 90, "percentageOfPlate": 20 },
    { "name": "Chickpeas in Sauce", "estimatedWeightGrams": 45, "percentageOfPlate": 10 }
  ],
  "macros": { "calories": 615, "proteinGrams": 34.0, "carbsGrams": 74.5, "fatGrams": 20.8 },
  "confidenceIntervals": { "caloriesRange": [550, 680], "proteinRange": [29.0, 39.0] }
}`}
            </div>
          </section>
        )}

        {/* Section 4: UI/UX Wireframe Specification */}
        {(activeSection === 'all' || activeSection === 'wireframes') && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold tracking-wide uppercase">
              <Smartphone className="w-4 h-4" />
              <span>Section 04 · UI/UX Wireframe Specification</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Wireframe & Screen Flow Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-900 block">Screen A: Daily Dashboard</span>
                <ul className="text-slate-600 space-y-1 list-disc pl-3">
                  <li>Macro & Caloric concentric SVG ring charts.</li>
                  <li>Dual EWMA weight trend graph (raw vs smoothed).</li>
                  <li>Algerian hydration tracker (Water, Atay tea, Mazagran, Chorba broth).</li>
                  <li>Non-judgmental physiological guidance card.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-900 block">Screen B: Quick-Log Modal</span>
                <ul className="text-slate-600 space-y-1 list-disc pl-3">
                  <li>GS1 barcode scanner supporting Algerian brands (Soummam, Candia, Sim, Benamor).</li>
                  <li>AI Photo meal scanner with ratio confirmation.</li>
                  <li>Regional dish search with traditional units (*Zlafa*, *Tebsi*, *Morceau*).</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-900 block">Screen C: Batch Recipe Builder</span>
                <ul className="text-slate-600 space-y-1 list-disc pl-3">
                  <li>Communal pot ingredient aggregator (couscoussier/tajine).</li>
                  <li>Automatic cooked yield and oil retention calculator.</li>
                  <li>Family serving split divider (equal shares or tared bowl weights).</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Section 5: Local-First & CRDTs */}
        {(activeSection === 'all' || activeSection === 'crdt') && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Section 05 · Local-First Architecture & Data Sovereignty</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Local-First Offline-Authoritative Persistence (CRDTs & SQLite)
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              In accordance with privacy-first health principles and North African network topologies, AfriMacros operates on an offline-authoritative model:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">Zero Latency Local Storage</span>
                <p className="text-slate-600">IndexedDB and SQLite via WASM store full logs on-device. All mathematical calculations run instantaneously in local memory.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">CRDT Multi-Device Sync</span>
                <p className="text-slate-600">Conflict-free replicated data types (state-based CRDTs) reconcile offline logs without race conditions or data loss.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">Health Privacy Sovereignty</span>
                <p className="text-slate-600">Personal weights, meal photographs, and metabolic profiles remain exclusively in user possession. Zero third-party telemetry.</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
