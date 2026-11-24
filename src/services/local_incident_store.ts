/**
 * ResQ-AI Local Incident Store
 * High-reliability, zero-data-loss IndexedDB storage for offline field operations.
 */

import { get, set, keys, del } from 'idb-keyval';
import type { IncidentReport, RegionalCrisisSummary } from '../types/triage';

const INCIDENT_PREFIX = 'resq_incident_';
const CRISIS_SUMMARY_KEY = 'resq_latest_crisis_summary';

export const localIncidentStore = {
  /**
   * Saves an incident report to IndexedDB.
   */
  async saveIncident(incident: IncidentReport): Promise<void> {
    const key = `${INCIDENT_PREFIX}${incident.id}`;
    await set(key, incident);
  },

  /**
   * Retrieves an incident report by ID.
   */
  async getIncident(id: string): Promise<IncidentReport | undefined> {
    return await get<IncidentReport>(`${INCIDENT_PREFIX}${id}`);
  },

  /**
   * Returns all stored incident reports sorted newest first.
   */
  async getAllIncidents(): Promise<IncidentReport[]> {
    const allKeys = await keys();
    const incidentKeys = allKeys.filter(
      (k): k is string => typeof k === 'string' && k.startsWith(INCIDENT_PREFIX)
    );
    const reports: IncidentReport[] = [];
    for (const key of incidentKeys) {
      const item = await get<IncidentReport>(key);
      if (item) {
        reports.push(item);
      }
    }
    return reports.sort((a, b) => b.timestamp - a.timestamp);
  },

  /**
   * Returns all incidents that have not yet been synchronized to Firebase Firestore.
   */
  async getUnsyncedIncidents(): Promise<IncidentReport[]> {
    const all = await this.getAllIncidents();
    return all.filter((r) => !r.syncedToCloud);
  },

  /**
   * Marks a batch of incidents as synced to cloud.
   */
  async markAsSynced(ids: string[]): Promise<void> {
    const now = Date.now();
    for (const id of ids) {
      const record = await this.getIncident(id);
      if (record) {
        record.syncedToCloud = true;
        record.syncedTimestamp = now;
        await this.saveIncident(record);
      }
    }
  },

  /**
   * Stores latest regional crisis summary from Cloud Gemini.
   */
  async saveCrisisSummary(summary: RegionalCrisisSummary): Promise<void> {
    await set(CRISIS_SUMMARY_KEY, summary);
  },

  /**
   * Retrieves the cached regional crisis summary.
   */
  async getCrisisSummary(): Promise<RegionalCrisisSummary | undefined> {
    return await get<RegionalCrisisSummary>(CRISIS_SUMMARY_KEY);
  },

  /**
   * Clears a single incident (e.g. for testing or test data resets).
   */
  async deleteIncident(id: string): Promise<void> {
    await del(`${INCIDENT_PREFIX}${id}`);
  },
};
