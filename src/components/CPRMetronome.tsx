import React, { useState, useEffect, useRef } from 'react';
import { Heart, Play, Square, Volume2, VolumeX, AlertCircle } from 'lucide-react';

export const CPRMetronome: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [compressions, setCompressions] = useState<number>(0);
  const [cycle, setCycle] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isBreathPhase, setIsBreathPhase] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Initialize Web Audio API on first user gesture
  const playBeep = (freq: number = 880, duration: number = 0.05) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + duration);
    } catch (e) {
      console.warn('Audio click generation failed:', e);
    }
  };

  const startMetronome = () => {
    setIsRunning(true);
    setCompressions(0);
    setIsBreathPhase(false);
  };

  const stopMetronome = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 110 BPM -> 60000ms / 110 = ~545ms per compression
  const INTERVAL_MS = 545;

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      setCompressions((prev) => {
        const next = prev + 1;
        if (next >= 30) {
          playBeep(440, 0.2); // Low alert tone for rescue breaths
          setIsBreathPhase(true);
          setTimeout(() => {
            setIsBreathPhase(false);
          }, 3500); // 3.5s window for 2 breaths
          setCycle((c) => c + 1);
          return 0;
        } else {
          // Regular compression beat
          playBeep(next === 1 ? 1200 : 880, 0.04);
          return next;
        }
      });
    }, INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, soundEnabled]);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* CPR Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center relative overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm tracking-wider uppercase">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            <span>AHA Adult CPR Protocol</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all"
            title="Toggle Audio Clicks"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

        {/* Central Pulsing Heart Metronome */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div
            className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-150 ${
              isBreathPhase
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-2xl shadow-cyan-900/60'
                : isRunning
                ? 'bg-rose-950/70 border-rose-500 text-white shadow-2xl shadow-rose-950/80 animate-cpr-beat'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            {isBreathPhase ? (
              <>
                <span className="text-xl font-black uppercase tracking-wider text-cyan-300">BREATHE</span>
                <span className="text-xs text-cyan-400 mt-1">2 Rescue Breaths</span>
              </>
            ) : (
              <>
                <span className="text-5xl font-black font-mono tracking-tighter">
                  {isRunning ? compressions || 30 : '110'}
                </span>
                <span className="text-xs uppercase font-bold tracking-widest text-slate-400 mt-1">
                  {isRunning ? '/ 30 BEATS' : 'BPM TARGET'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tactical Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={startMetronome}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-base shadow-lg shadow-rose-950/60 transition-all transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>START CPR RHYTHM</span>
            </button>
          ) : (
            <button
              onClick={stopMetronome}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base transition-all"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>STOP METRONOME</span>
            </button>
          )}
        </div>

        {/* Live Cycle Counter */}
        {isRunning && (
          <div className="mt-6 flex items-center justify-center gap-6 text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-4">
            <div>
              <span className="text-slate-500">CYCLE: </span>
              <span className="text-rose-400 font-bold">#{cycle}</span>
            </div>
            <div>
              <span className="text-slate-500">TOTAL COMPRESSIONS: </span>
              <span className="text-slate-200 font-bold">{(cycle - 1) * 30 + compressions}</span>
            </div>
          </div>
        )}
      </div>

      {/* Clinical Guidance Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2.5">
        <div className="flex items-center gap-2 text-rose-400 font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>Clinical CPR Rules (AHA / ERC Standard)</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-400 leading-relaxed">
          <li>Compress the center of the chest hard and fast at <strong className="text-slate-200">2 to 2.4 inches (5–6 cm) deep</strong>.</li>
          <li>Allow complete chest recoil between each compression. Avoid leaning on chest.</li>
          <li>Ratio: <strong className="text-slate-200">30 compressions to 2 breaths</strong>. If untrained or no barrier mask, deliver continuous hands-only CPR.</li>
          <li>Switch rescuers every 2 minutes (approx. 5 cycles) to prevent responder fatigue.</li>
        </ul>
      </div>
    </div>
  );
};
