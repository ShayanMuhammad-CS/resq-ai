import React, { useEffect, useState } from 'react';
import type { IncidentReport } from '../types/triage';
import { localIncidentStore } from '../services/local_incident_store';
import { Clock, MapPin, CheckCircle2, Cloud, HardDrive, Trash2 } from 'lucide-react';

interface IncidentQueueProps {
  onIncidentsUpdated?: () => void;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({ onIncidentsUpdated }) => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await localIncidentStore.getAllIncidents();
      setIncidents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleDelete = async (id: string) => {
    await localIncidentStore.deleteIncident(id);
    await loadIncidents();
    if (onIncidentsUpdated) onIncidentsUpdated();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-rose-500" />
            <span>Local Incident Queue (IndexedDB)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-loss local storage ledger. Incidents are cached locally and automatically sync to Firebase upon connection.
          </p>
        </div>
        <div className="text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          Total Cached: <strong className="text-rose-400">{incidents.length}</strong>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-mono">Loading local ledger...</div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Incidents in Queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use the START Triage scanner to evaluate and record casualties in the field.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => {
            const badge = inc.triage.badge;
            return (
              <div
                key={inc.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}>
                      {badge.label}
                    </span>
                    <span className="font-bold text-sm text-slate-200">{inc.victimIdentifier}</span>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(inc.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {inc.triage.primaryRationale}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {inc.location.latitude.toFixed(4)}, {inc.location.longitude.toFixed(4)}
                    </span>
                    <span className="text-slate-400">
                      Transport: <strong className="text-slate-300">{inc.triage.recommendedTransport.replace(/_/g, ' ')}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-1 rounded flex items-center gap-1 ${
                      inc.syncedToCloud
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                    }`}
                  >
                    {inc.syncedToCloud ? (
                      <>
                        <Cloud className="w-3 h-3" /> Synced to Firebase
                      </>
                    ) : (
                      <>
                        <HardDrive className="w-3 h-3" /> Offline Queued
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => handleDelete(inc.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
