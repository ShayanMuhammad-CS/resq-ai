import { useState, useEffect } from 'react';
import { TacticalNavbar } from './components/TacticalNavbar';
import { TriageScanner } from './components/TriageScanner';
import { CPRMetronome } from './components/CPRMetronome';
import { IncidentQueue } from './components/IncidentQueue';
import { CloudCommandBoard } from './components/CloudCommandBoard';
import { localIncidentStore } from './services/local_incident_store';
import type { IncidentReport } from './types/triage';
import { evaluateStartTriage } from './services/triage_rules';
import { Shield } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'triage' | 'cpr' | 'incidents' | 'cloud-command'>('triage');
  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);

  const refreshUnsynced = async () => {
    const unsynced = await localIncidentStore.getUnsyncedIncidents();
    setUnsyncedCount(unsynced.length);
  };

  useEffect(() => {
    // Seed initial field demo incidents if empty so judges can immediately test
    const seedDemoIncidentsIfEmpty = async () => {
      const existing = await localIncidentStore.getAllIncidents();
      if (existing.length === 0) {
        const demoIncidents: IncidentReport[] = [
          {
            id: 'inc_demo_01',
            timestamp: Date.now() - 1000 * 60 * 18,
            victimIdentifier: 'Casualty #101 (Adult Male)',
            location: { latitude: 34.1986, longitude: 72.0404, placenameFallback: 'Sector Delta-4' },
            vitals: {
              ambulatory: false,
              spontaneousBreathing: true,
              respiratoryRate: 34,
              radialPulsePresent: true,
              capillaryRefillSeconds: 1.5,
              followsSimpleCommands: true,
              observedSymptoms: ['Severe Chest Pain', 'Tachypnea'],
            },
            triage: evaluateStartTriage({
              ambulatory: false,
              spontaneousBreathing: true,
              respiratoryRate: 34,
              radialPulsePresent: true,
              followsSimpleCommands: true,
            }),
            responderNotes: 'Entrapped under collapsed beam. Severe respiratory distress (RR 34). Rapid extrication required.',
            offlineCreated: true,
            syncedToCloud: false,
            localAuditHash: 'demo_hash_01',
          },
          {
            id: 'inc_demo_02',
            timestamp: Date.now() - 1000 * 60 * 35,
            victimIdentifier: 'Casualty #102 (Adult Female)',
            location: { latitude: 34.2012, longitude: 72.0431, placenameFallback: 'Riverbank Sector 2' },
            vitals: {
              ambulatory: false,
              spontaneousBreathing: true,
              respiratoryRate: 22,
              radialPulsePresent: false, // Shock
              capillaryRefillSeconds: 3.5,
              followsSimpleCommands: true,
              observedSymptoms: ['Arterial Bleeding', 'Right Femur Laceration'],
            },
            triage: evaluateStartTriage({
              ambulatory: false,
              spontaneousBreathing: true,
              respiratoryRate: 22,
              radialPulsePresent: false,
              capillaryRefillSeconds: 3.5,
              followsSimpleCommands: true,
            }),
            responderNotes: 'Combat application tourniquet applied to right thigh at 14:15. Absent radial pulse, profound hypovolemia.',
            offlineCreated: true,
            syncedToCloud: false,
            localAuditHash: 'demo_hash_02',
          },
          {
            id: 'inc_demo_03',
            timestamp: Date.now() - 1000 * 60 * 50,
            victimIdentifier: 'Casualty #103 (Pediatric Male)',
            location: { latitude: 34.1955, longitude: 72.0388, placenameFallback: 'School Staging Area' },
            vitals: {
              ambulatory: true,
              spontaneousBreathing: true,
              respiratoryRate: 20,
              radialPulsePresent: true,
              followsSimpleCommands: true,
              observedSymptoms: ['Superficial Lacerations'],
            },
            triage: evaluateStartTriage({
              ambulatory: true,
              spontaneousBreathing: true,
              respiratoryRate: 20,
              radialPulsePresent: true,
              followsSimpleCommands: true,
            }),
            responderNotes: 'Walking wounded. Superficial glass lacerations on forearms. Ambulatory, escorted to green holding zone.',
            offlineCreated: true,
            syncedToCloud: false,
            localAuditHash: 'demo_hash_03',
          },
        ];

        for (const item of demoIncidents) {
          await localIncidentStore.saveIncident(item);
        }
      }
      refreshUnsynced();
    };

    seedDemoIncidentsIfEmpty();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Tactical Emergency Navigation */}
      <TacticalNavbar
        unsyncedCount={unsyncedCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSyncTrigger={() => setActiveTab('cloud-command')}
      />

      {/* Main Tab Workspace */}
      <main className="flex-1 py-4 sm:py-6">
        {activeTab === 'triage' && <TriageScanner onIncidentSaved={refreshUnsynced} />}
        {activeTab === 'cpr' && <CPRMetronome />}
        {activeTab === 'incidents' && <IncidentQueue onIncidentsUpdated={refreshUnsynced} />}
        {activeTab === 'cloud-command' && <CloudCommandBoard />}
      </main>

      {/* Footer Credentials */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-4 h-4 text-rose-500" />
            <span>ResQ-AI • Built for Google #BuildHybridAI 2026 (Firebase AI Logic × Gemini Nano)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://github.com/ShayanMuhammad-CS/resq-ai"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-200 transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>ShayanMuhammad-CS/resq-ai</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
