import React, { useState } from 'react';
import { TechSpecViewer } from './components/spec/TechSpecViewer';
import { MetabolicEngineLab } from './components/metabolic/MetabolicEngineLab';
import { FoodOntologyExplorer } from './components/ontology/FoodOntologyExplorer';
import { MultimodalVisionPipeline } from './components/vision/MultimodalVisionPipeline';
import { AppSimulator } from './components/wireframes/AppSimulator';
import { WeeklyProgramPlanner } from './components/planner/WeeklyProgramPlanner';
import {
  FileText,
  Flame,
  Database,
  Eye,
  Smartphone,
  CheckCircle2,
  Cpu,
  Layers,
  HeartPulse,
  CalendarDays
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'spec' | 'metabolic' | 'ontology' | 'vision' | 'weekly' | 'wireframes'
  >('weekly');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Architecture Subtitle */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
                AM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                    AfriMacros
                  </h1>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 font-medium">
                    v1.0.0 Architecture
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Local-First Metabolic Dietetics for Algerian & North African Cuisine
                </p>
              </div>
            </div>

            {/* Architecture Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-medium border border-slate-200/60">
              <button
                onClick={() => setActiveTab('spec')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'spec'
                    ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Technical Specification
              </button>

              <button
                onClick={() => setActiveTab('metabolic')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'metabolic'
                    ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                EWMA Metabolic Engine
              </button>

              <button
                onClick={() => setActiveTab('ontology')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'ontology'
                    ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-blue-600" />
                Algerian Food Ontology
              </button>

              <button
                onClick={() => setActiveTab('vision')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'vision'
                    ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                Multimodal AI Vision
              </button>

              <button
                onClick={() => setActiveTab('weekly')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'weekly'
                    ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                Weekly Program
              </button>

              <button
                onClick={() => setActiveTab('wireframes')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'wireframes'
                    ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                Interactive App Wireframes
              </button>
            </nav>

            {/* Quick Status */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Offline-First (CRDT)</span>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Row */}
          <div className="flex lg:hidden overflow-x-auto py-2 gap-1 text-xs border-t border-slate-100">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'weekly' ? 'bg-emerald-900 text-white font-bold' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Weekly Program
            </button>
            <button
              onClick={() => setActiveTab('spec')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'spec' ? 'bg-emerald-900 text-white font-bold' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Tech Spec
            </button>
            <button
              onClick={() => setActiveTab('metabolic')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'metabolic' ? 'bg-emerald-900 text-white font-bold' : 'text-slate-600 bg-slate-100'
              }`}
            >
              EWMA Engine
            </button>
            <button
              onClick={() => setActiveTab('ontology')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'ontology' ? 'bg-emerald-900 text-white font-bold' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Food Ontology
            </button>
            <button
              onClick={() => setActiveTab('vision')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'vision' ? 'bg-emerald-900 text-white font-bold' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Vision Pipeline
            </button>
            <button
              onClick={() => setActiveTab('wireframes')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'wireframes' ? 'bg-emerald-900 text-white font-bold' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Wireframes
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'weekly' && <WeeklyProgramPlanner />}
        {activeTab === 'spec' && <TechSpecViewer />}
        {activeTab === 'metabolic' && <MetabolicEngineLab />}
        {activeTab === 'ontology' && <FoodOntologyExplorer />}
        {activeTab === 'vision' && <MultimodalVisionPipeline />}
        {activeTab === 'wireframes' && <AppSimulator />}
      </main>

      {/* Quiet, clean architectural footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AfriMacros Engineering Architecture</span>
            <span>·</span>
            <span>Local-First Health-Tech Systems Specification</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span>Wishnofsky-Hall (7700 kcal/kg)</span>
            <span>·</span>
            <span>EWMA (α=0.12)</span>
            <span>·</span>
            <span>Gemini Vision</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
