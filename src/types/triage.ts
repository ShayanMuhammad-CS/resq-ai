/**
 * ResQ-AI: Emergency Disaster & Medical Triage Types
 * Universal START Protocol (Simple Triage and Rapid Treatment)
 */

export type TriagePriority = 'IMMEDIATE' | 'DELAYED' | 'MINOR' | 'EXPECTANT';

export interface TriageBadgeConfig {
  priority: TriagePriority;
  code: 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';
  label: string;
  description: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgePulse: boolean;
}

export interface VitalAssessmentInput {
  ambulatory: boolean;          // Can the patient walk?
  spontaneousBreathing: boolean; // Are they breathing?
  airwayRepositioned?: boolean;  // Did breathing resume after airway repositioning?
  respiratoryRate?: number;      // Breaths per minute (<30 or >30)
  radialPulsePresent?: boolean;  // Is radial pulse palpable?
  capillaryRefillSeconds?: number; // < 2s or > 2s
  followsSimpleCommands?: boolean; // Mental status / can follow instructions?
  observedSymptoms?: string[];   // e.g. ["arterial bleeding", "head trauma", "burns"]
  ageCategory?: 'adult' | 'pediatric' | 'geriatric';
}

export interface TriageAssessmentResult {
  priority: TriagePriority;
  badge: TriageBadgeConfig;
  primaryRationale: string;
  immediateActions: string[];
  criticalCautions: string[];
  recommendedTransport: 'AIR_EVAC' | 'GROUND_AMBULANCE' | 'WALKING_WOUNDED_STAGING' | 'MORTUARY_STAGING';
  estimatedCareWindowMinutes: number; // e.g. 15 mins for Immediate, 120 for Delayed
}

export interface IncidentLocation {
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  accuracyMeters?: number;
  placenameFallback?: string;
}

export interface IncidentReport {
  id: string;
  timestamp: number;
  victimIdentifier: string; // e.g. "Victim #104 (Adult Female)"
  location: IncidentLocation;
  vitals: VitalAssessmentInput;
  triage: TriageAssessmentResult;
  responderNotes: string;
  offlineCreated: boolean;
  syncedToCloud: boolean;
  syncedTimestamp?: number;
  localAuditHash: string;
}

export interface RegionalCrisisSummary {
  incidentCount: number;
  priorityCounts: Record<TriagePriority, number>;
  criticalSupplyDeficits: string[];
  evacuationBottlenecks: string[];
  highRiskSectors: string[];
  synthesisTimestamp: number;
  cloudModelSignature: string;
}
