import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Save,
  Clock,
  Sparkles,
  Stethoscope,
  Flame,
  Droplet,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VitalAssessmentInput, TriageAssessmentResult, IncidentReport } from '../types/triage';
import { evaluateStartTriage } from '../services/triage_rules';
import { nanoTriageService } from '../services/nano_triage_service';
import { localIncidentStore } from '../services/local_incident_store';

interface TriageScannerProps {
  onIncidentSaved?: () => void;
}

export const TriageScanner: React.FC<TriageScannerProps> = ({ onIncidentSaved }) => {
  // Input states
  const [victimIdentifier, setVictimIdentifier] = useState<string>('Casualty #101');
  const [ambulatory, setAmbulatory] = useState<boolean>(false);
  const [spontaneousBreathing, setSpontaneousBreathing] = useState<boolean>(true);
  const [airwayRepositioned, setAirwayRepositioned] = useState<boolean>(false);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(24);
  const [radialPulsePresent, setRadialPulsePresent] = useState<boolean>(true);
  const capillaryRefillSeconds = 1.5;
  const [followsSimpleCommands, setFollowsSimpleCommands] = useState<boolean>(true);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [responderNotes, setResponderNotes] = useState<string>('');

  // AI & Tactical Advice States
  const [tacticalAdvice, setTacticalAdvice] = useState<string>('');
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const COMMON_SYMPTOMS = [
    { id: 'bleed', label: 'Arterial Bleeding', icon: Droplet, color: 'text-rose-400' },
    { id: 'head', label: 'Head Trauma / Confusion', icon: AlertCircle, color: 'text-amber-400' },
    { id: 'burns', label: 'Severe Burns', icon: Flame, color: 'text-orange-400' },
    { id: 'crush', label: 'Crush Injury', icon: Zap, color: 'text-purple-400' },
    { id: 'chest', label: 'Penetrating Chest Wound', icon: Activity, color: 'text-red-500' },
  ];

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  // Immediate deterministic START evaluation
  const vitals: VitalAssessmentInput = {
    ambulatory,
    spontaneousBreathing,
    airwayRepositioned,
    respiratoryRate,
    radialPulsePresent,
    capillaryRefillSeconds,
    followsSimpleCommands,
    observedSymptoms: selectedSymptoms,
  };

  const triageResult: TriageAssessmentResult = evaluateStartTriage(vitals);

  // Generate on-device Gemini Nano advice
  const handleGenerateTacticalAdvice = async () => {
    setIsGeneratingAdvice(true);
    try {
      const summary = `Victim: ${victimIdentifier}, Symptoms: ${selectedSymptoms.join(', ') || 'None recorded'}. Notes: ${responderNotes || 'None'}`;
      const advice = await nanoTriageService.generateTacticalGuidance(vitals, triageResult, summary);
      setTacticalAdvice(advice);
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  // Save to IndexedDB
  const handleSaveIncident = async () => {
    setIsSaving(true);
    try {
      // Default to disaster staging coordinates if GPS is unpermitted
      let latitude = 34.1986;
      let longitude = 72.0404;

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch {
          // Fall back to default
        }
      }

      const report: IncidentReport = {
        id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        victimIdentifier,
        location: { latitude, longitude, placenameFallback: 'Field Sector Delta-4' },
        vitals,
        triage: triageResult,
        responderNotes,
        offlineCreated: true,
        syncedToCloud: false,
        localAuditHash: Math.random().toString(36).substring(2, 10),
      };

      await localIncidentStore.saveIncident(report);
      setSaveSuccess(true);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
      if (onIncidentSaved) onIncidentSaved();
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Triage Outcome Card */}
      <div
        className={`border-2 rounded-2xl p-6 transition-all duration-300 shadow-2xl relative overflow-hidden ${triageResult.badge.bgClass} ${triageResult.badge.borderClass}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest bg-black/40 text-slate-300 px-2 py-0.5 rounded border border-white/10">
                START Protocol Output
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Care Window: ~{triageResult.estimatedCareWindowMinutes}m
              </span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${triageResult.badge.textClass}`}>
              {triageResult.badge.label}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              {triageResult.primaryRationale}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400">RECOMMENDED TRANSPORT:</span>
            <span className="text-xs font-mono font-bold bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-slate-200">
              {triageResult.recommendedTransport.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Immediate Action Checklist */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-200 block mb-1.5">Priority Actions:</span>
            <ul className="space-y-1">
              {triageResult.immediateActions.map((action: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-bold text-rose-300 block mb-1.5">Critical Cautions:</span>
            <ul className="space-y-1">
              {triageResult.criticalCautions.map((caution: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5 text-rose-200/90">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{caution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Field Input Wizard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
            <Stethoscope className="w-5 h-5 text-rose-500" />
            <span>Field Triage Assessment (Rapid Vitals)</span>
          </div>
          <input
            type="text"
            value={victimIdentifier}
            onChange={(e) => setVictimIdentifier(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 font-mono w-40 text-right focus:border-rose-500 focus:outline-none"
            placeholder="Victim ID"
          />
        </div>

        {/* Rapid Vital Gates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gate 1: Ambulatory */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">1. Can the patient walk? (Ambulatory)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAmbulatory(true)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  ambulatory ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                YES (Walking)
              </button>
              <button
                type="button"
                onClick={() => setAmbulatory(false)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  !ambulatory ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                NO (Non-Ambulatory)
              </button>
            </div>
          </div>

          {/* Gate 2: Breathing & Airway */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">2. Spontaneous Breathing?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSpontaneousBreathing(true)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  spontaneousBreathing ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                YES (Breathing)
              </button>
              <button
                type="button"
                onClick={() => setSpontaneousBreathing(false)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  !spontaneousBreathing ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                NO (Apneic)
              </button>
            </div>
            {!spontaneousBreathing && (
              <label className="flex items-center gap-2 pt-2 text-xs text-amber-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={airwayRepositioned}
                  onChange={(e) => setAirwayRepositioned(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
                />
                <span>Breathing resumed after airway repositioning?</span>
              </label>
            )}
          </div>

          {/* Gate 3: Respiratory Rate */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">3. Respiratory Rate (Breaths/min)</label>
              <span className={`text-xs font-mono font-bold ${respiratoryRate > 30 ? 'text-rose-400' : 'text-slate-200'}`}>
                {respiratoryRate} bpm {respiratoryRate > 30 && '(CRITICAL)'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={respiratoryRate}
              onChange={(e) => setRespiratoryRate(Number(e.target.value))}
              className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 (Apnea)</span>
              <span>12–20 (Normal)</span>
              <span className="text-rose-400">&gt;30 (Immediate Red)</span>
            </div>
          </div>

          {/* Gate 4: Circulation / Perfusion */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">4. Radial Pulse & Perfusion</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRadialPulsePresent(true)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  radialPulsePresent ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                PULSE PALPABLE
              </button>
              <button
                type="button"
                onClick={() => setRadialPulsePresent(false)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  !radialPulsePresent ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                NO PULSE (Shock)
              </button>
            </div>
          </div>

          {/* Gate 5: Mental Status */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-300 block">5. Can the patient follow simple commands?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFollowsSimpleCommands(true)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  followsSimpleCommands ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                YES (Alert / Follows Commands)
              </button>
              <button
                type="button"
                onClick={() => setFollowsSimpleCommands(false)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  !followsSimpleCommands ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                NO (Confused / Altered Mental Status)
              </button>
            </div>
          </div>
        </div>

        {/* Observed Injury Chips */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Observed Injury Indicators:</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((sym) => {
              const active = selectedSymptoms.includes(sym.label);
              const Icon = sym.icon;
              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => toggleSymptom(sym.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? 'bg-slate-800 border-rose-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${sym.color}`} />
                  <span>{sym.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Field Notes Input */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">Responder Observations & Trauma Notes:</label>
          <textarea
            value={responderNotes}
            onChange={(e) => setResponderNotes(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
            placeholder="e.g. Entrapped under collapsed masonry, tourniquet applied to left thigh at 14:15, conscious."
          />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleGenerateTacticalAdvice}
            disabled={isGeneratingAdvice}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs transition-all w-full sm:w-auto justify-center"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{isGeneratingAdvice ? 'Consulting Gemini Nano...' : 'Get Gemini Nano Tactical Directive'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveIncident}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-lg w-full sm:w-auto justify-center ${
              saveSuccess
                ? 'bg-emerald-600 shadow-emerald-950'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/60'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>SAVED TO OFFLINE QUEUE!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Encrypting & Storing...' : 'SAVE INCIDENT (OFFLINE LEDGER)'}</span>
              </>
            )}
          </button>
        </div>

        {/* AI Tactical Directive Output Box */}
        {tacticalAdvice && (
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-xs text-cyan-200 space-y-1 animate-fadeIn">
            <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] block">
              On-Device AI Tactical Directive:
            </span>
            <p className="leading-relaxed">{tacticalAdvice}</p>
          </div>
        )}
      </div>
    </div>
  );
};
