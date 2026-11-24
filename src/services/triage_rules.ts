/**
 * ResQ-AI Deterministic Medical Triage Engine
 * Standardized START Protocol (Simple Triage and Rapid Treatment)
 * Guaranteed 100% offline, zero-network, sub-1ms execution.
 */

import type {
  TriagePriority,
  TriageBadgeConfig,
  VitalAssessmentInput,
  TriageAssessmentResult,
} from '../types/triage';

export const TRIAGE_BADGES: Record<TriagePriority, TriageBadgeConfig> = {
  IMMEDIATE: {
    priority: 'IMMEDIATE',
    code: 'RED',
    label: 'Priority 1: Immediate',
    description: 'Critical, life-threatening injury requiring surgical or advanced airway stabilization within 15–60 mins.',
    bgClass: 'bg-rose-950/80',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500',
    badgePulse: true,
  },
  DELAYED: {
    priority: 'DELAYED',
    code: 'YELLOW',
    label: 'Priority 2: Delayed',
    description: 'Serious non-ambulatory injury, but breathing and perfusion are stable. Care window: 2–4 hours.',
    bgClass: 'bg-amber-950/80',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500',
    badgePulse: false,
  },
  MINOR: {
    priority: 'MINOR',
    code: 'GREEN',
    label: 'Priority 3: Minor',
    description: 'Walking wounded. Stable vitals with superficial lacerations or minor sprains. Evacuate to field clinic.',
    bgClass: 'bg-emerald-950/80',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500',
    badgePulse: false,
  },
  EXPECTANT: {
    priority: 'EXPECTANT',
    code: 'BLACK',
    label: 'Priority 0: Expectant / Deceased',
    description: 'No spontaneous respirations after airway repositioning, or catastrophic injuries incompatible with survival.',
    bgClass: 'bg-slate-900',
    textClass: 'text-slate-400',
    borderClass: 'border-slate-700',
    badgePulse: false,
  },
};

/**
 * Executes standard START triage algorithm.
 */
export function evaluateStartTriage(input: VitalAssessmentInput): TriageAssessmentResult {
  const immediateActions: string[] = [];

  // Step 1: Can the patient walk? (Ambulatory check)
  if (input.ambulatory) {
    return {
      priority: 'MINOR',
      badge: TRIAGE_BADGES.MINOR,
      primaryRationale: 'Patient is ambulatory (walking wounded). Capable of self-evacuation or basic buddy-aid.',
      immediateActions: [
        'Direct patient to designated secondary triage / green holding area.',
        'Apply basic pressure dressings for minor bleeding.',
        'Provide clean water and monitor for delayed shock symptoms.',
      ],
      criticalCautions: [
        'Re-evaluate if mental confusion, dizziness, or chest pain develops.',
      ],
      recommendedTransport: 'WALKING_WOUNDED_STAGING',
      estimatedCareWindowMinutes: 240,
    };
  }

  // Step 2: Spontaneous Respirations
  if (!input.spontaneousBreathing) {
    // Attempt airway maneuver (head-tilt / chin-lift or jaw-thrust)
    if (input.airwayRepositioned) {
      immediateActions.push('Maintain airway via recovery position or nasopharyngeal airway (NPA).');
      immediateActions.push('Administer high-flow oxygen if available.');
      return {
        priority: 'IMMEDIATE',
        badge: TRIAGE_BADGES.IMMEDIATE,
        primaryRationale: 'Spontaneous breathing resumed ONLY upon airway repositioning. High risk of airway collapse.',
        immediateActions,
        criticalCautions: [
          'DO NOT leave patient unattended on back; risk of positional asphyxiation.',
          'Suspect cervical spine injury if trauma-induced.',
        ],
        recommendedTransport: 'AIR_EVAC',
        estimatedCareWindowMinutes: 15,
      };
    } else {
      return {
        priority: 'EXPECTANT',
        badge: TRIAGE_BADGES.EXPECTANT,
        primaryRationale: 'Apnea persists following airway repositioning maneuver. In mass-casualty triage, resources are allocated to viable casualties.',
        immediateActions: [
          'Tag patient with Black Expectant marker.',
          'Cover victim respectfully with thermal emergency blanket.',
          'Direct medical resources to viable Priority 1 casualties.',
        ],
        criticalCautions: [
          'Confirm no carotid pulse before confirming expectant status.',
        ],
        recommendedTransport: 'MORTUARY_STAGING',
        estimatedCareWindowMinutes: 0,
      };
    }
  }

  // Step 3: Respiratory Rate (> 30 breaths/min indicates immediate respiratory distress)
  if (input.respiratoryRate !== undefined && input.respiratoryRate > 30) {
    immediateActions.push('Assess for tension pneumothorax, flail chest, or pulmonary contusion.');
    immediateActions.push('Place in semi-Fowler position if conscious and spinal precautions allow.');
    return {
      priority: 'IMMEDIATE',
      badge: TRIAGE_BADGES.IMMEDIATE,
      primaryRationale: `Severe tachypnea detected: ${input.respiratoryRate} breaths/min (threshold: >30). Indicates acute hypoxia or impending respiratory failure.`,
      immediateActions,
      criticalCautions: [
        'Rapid physical deterioration expected without supplemental oxygen or chest decompression.',
      ],
      recommendedTransport: 'AIR_EVAC',
      estimatedCareWindowMinutes: 30,
    };
  }

  // Step 4: Perfusion / Circulation (Radial pulse absent OR Capillary Refill > 2 seconds)
  const poorPerfusion =
    input.radialPulsePresent === false ||
    (input.capillaryRefillSeconds !== undefined && input.capillaryRefillSeconds > 2.0);

  if (poorPerfusion) {
    immediateActions.push('Check for external arterial or venous hemorrhage.');
    immediateActions.push('Apply high-and-tight combat application tourniquet (CAT) on bleeding extremities.');
    immediateActions.push('Keep victim warm with emergency reflective space blanket to combat lethal hypothermia triad.');
    return {
      priority: 'IMMEDIATE',
      badge: TRIAGE_BADGES.IMMEDIATE,
      primaryRationale: 'Hemodynamic instability: absent radial pulse or delayed capillary refill (>2s). Indicative of Class III/IV hypovolemic shock.',
      immediateActions,
      criticalCautions: [
        'Note exact tourniquet time on patient forehead (e.g., TQ 14:32).',
        'DO NOT release tourniquet once placed in field environment.',
      ],
      recommendedTransport: 'AIR_EVAC',
      estimatedCareWindowMinutes: 20,
    };
  }

  // Step 5: Mental Status (Can the patient follow simple commands?)
  if (input.followsSimpleCommands === false) {
    immediateActions.push('Check pupil reactivity and Glasgow Coma Scale (GCS) indicators.');
    immediateActions.push('Maintain spinal immobilization if head or blast trauma suspected.');
    return {
      priority: 'IMMEDIATE',
      badge: TRIAGE_BADGES.IMMEDIATE,
      primaryRationale: 'Altered mental status: unable to follow basic commands. High likelihood of severe traumatic brain injury (TBI) or hypoperfusion.',
      immediateActions,
      criticalCautions: [
        'Protect airway; patient may lose gag reflex and aspirate.',
      ],
      recommendedTransport: 'GROUND_AMBULANCE',
      estimatedCareWindowMinutes: 45,
    };
  }

  // If patient passed all checks (non-ambulatory, breathing <= 30, good perfusion, follows commands)
  return {
    priority: 'DELAYED',
    badge: TRIAGE_BADGES.DELAYED,
    primaryRationale: 'Patient is non-ambulatory with stable respirations (<=30), palpable radial pulse, and alert mental status. Delayed evacuation permitted.',
    immediateActions: [
      'Splint fractures and immobilize sprains in position of comfort.',
      'Cover open wounds with sterile dressings to prevent contamination.',
      'Re-triage every 15–30 minutes to detect delayed shock.',
    ],
    criticalCautions: [
      'Monitor for compartment syndrome if crushing or crush-injury occurred.',
    ],
    recommendedTransport: 'GROUND_AMBULANCE',
    estimatedCareWindowMinutes: 120,
  };
}
