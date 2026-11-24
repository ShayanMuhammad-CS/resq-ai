import React, { useEffect, useState } from 'react';
import { ShieldAlert, Radio, Wifi, WifiOff, Cpu } from 'lucide-react';
import { networkSentinel } from '../services/network_sentinel';
import { nanoTriageService, type NanoEngineStatus } from '../services/nano_triage_service';

interface TacticalNavbarProps {
  unsyncedCount: number;
  onSyncTrigger?: () => void;
  activeTab: 'triage' | 'cpr' | 'incidents' | 'cloud-command';
  setActiveTab: (tab: 'triage' | 'cpr' | 'incidents' | 'cloud-command') => void;
}

export const TacticalNavbar: React.FC<TacticalNavbarProps> = ({
  unsyncedCount,
  onSyncTrigger,
  activeTab,
  setActiveTab,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(networkSentinel.isOperationalOnline());
  const [isSimulated, setIsSimulated] = useState<boolean>(networkSentinel.isSimulated());
  const [nanoStatus, setNanoStatus] = useState<NanoEngineStatus>(nanoTriageService.getStatus());

  useEffect(() => {
    nanoTriageService.initialize().then(setNanoStatus);
    const unsubscribe = networkSentinel.subscribe((online, simulated) => {
      setIsOnline(online);
      setIsSimulated(simulated);
    });
    return unsubscribe;
  }, []);

  const handleToggleBlackout = () => {
    networkSentinel.toggleSimulatedBlackout();
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Mission Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center p-2 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-500 shadow-lg shadow-rose-950/30">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-wider text-slate-50">ResQ-AI</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded">
                  Hybrid
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Disaster Resilience & Medical Triage</p>
            </div>
          </div>

          {/* AI Engine Status Pill (Mobile) */}
          <div className="md:hidden flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{nanoStatus.hasHardwareNano ? 'Gemini Nano' : 'Client Nano'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 w-full md:w-auto justify-center">
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'triage'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-950 font-bold'
                : 'hover:text-slate-200'
            }`}
          >
            START Triage
          </button>
          <button
            onClick={() => setActiveTab('cpr')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'cpr'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-950 font-bold'
                : 'hover:text-slate-200'
            }`}
          >
            CPR Metronome
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'incidents'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-950 font-bold'
                : 'hover:text-slate-200'
            }`}
          >
            Incident Queue
            {unsyncedCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                {unsyncedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('cloud-command')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'cloud-command'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950 font-bold'
                : 'hover:text-slate-200 text-cyan-400/80'
            }`}
          >
            Cloud Synthesis
          </button>
        </nav>

        {/* Tactical Controls & Network Killswitch */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* AI Engine Status Pill (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400">Engine:</span>
            <span className="text-cyan-400 font-bold">
              {nanoStatus.hasHardwareNano ? 'Gemini Nano (Hardware)' : 'Client Nano (On-Device)'}
            </span>
          </div>

          {/* Dual-Layer Blackout Mode Switch */}
          <button
            onClick={handleToggleBlackout}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-lg ${
              !isOnline
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-rose-950/50 animate-pulse'
                : 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-emerald-950/30'
            }`}
            title="Click to toggle simulated cellular/fiber blackout"
          >
            {!isOnline ? (
              <>
                <WifiOff className="w-4 h-4 text-rose-400" />
                <span>BLACKOUT MODE {isSimulated && '(SIM)'}</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>UPLINK ONLINE</span>
              </>
            )}
          </button>

          {/* Sync Trigger button when unsynced records exist */}
          {unsyncedCount > 0 && isOnline && onSyncTrigger && (
            <button
              onClick={onSyncTrigger}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-all"
            >
              <Radio className="w-3.5 h-3.5 animate-spin" />
              <span>Sync ({unsyncedCount})</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
