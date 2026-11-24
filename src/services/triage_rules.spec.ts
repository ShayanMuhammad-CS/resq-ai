import { describe, it, expect } from 'vitest';
import { evaluateStartTriage } from './triage_rules';
import type { VitalAssessmentInput } from '../types/triage';

describe('ResQ-AI START Medical Triage Engine', () => {
  it('assigns MINOR (Green) to ambulatory walking wounded patients', () => {
    const input: VitalAssessmentInput = {
      ambulatory: true,
      spontaneousBreathing: true,
      respiratoryRate: 22,
      radialPulsePresent: true,
      followsSimpleCommands: true,
    };

    const result = evaluateStartTriage(input);
    expect(result.priority).toBe('MINOR');
    expect(result.badge.code).toBe('GREEN');
    expect(result.recommendedTransport).toBe('WALKING_WOUNDED_STAGING');
    expect(result.estimatedCareWindowMinutes).toBe(240);
  });

  it('assigns EXPECTANT (Black) to non-breathing patients when airway maneuver fails', () => {
    const input: VitalAssessmentInput = {
      ambulatory: false,
      spontaneousBreathing: false,
      airwayRepositioned: false,
    };

    const result = evaluateStartTriage(input);
    expect(result.priority).toBe('EXPECTANT');
    expect(result.badge.code).toBe('BLACK');
    expect(result.recommendedTransport).toBe('MORTUARY_STAGING');
  });

  it('assigns IMMEDIATE (Red) to patients whose breathing resumes after airway repositioning', () => {
    const input: VitalAssessmentInput = {
      ambulatory: false,
      spontaneousBreathing: false,
      airwayRepositioned: true,
    };

    const result = evaluateStartTriage(input);
    expect(result.priority).toBe('IMMEDIATE');
    expect(result.badge.code).toBe('RED');
    expect(result.estimatedCareWindowMinutes).toBeLessThanOrEqual(15);
  });

  it('assigns IMMEDIATE (Red) when respiratory rate exceeds 30 breaths per minute', () => {
    const input: VitalAssessmentInput = {
      ambulatory: false,
      spontaneousBreathing: true,
      respiratoryRate: 38, // Severe tachypnea
      radialPulsePresent: true,
      capillaryRefillSeconds: 1.5,
      followsSimpleCommands: true,
    };

    const result = evaluateStartTriage(input);
    expect(result.priority).toBe('IMMEDIATE');
    expect(result.badge.code).toBe('RED');
    expect(result.primaryRationale).toContain('Severe tachypnea');
  });

  it('assigns IMMEDIATE (Red) when radial pulse is absent (shock / hypoperfusion)', () => {
    const input: VitalAssessmentInput = {
      ambulatory: false,
      spontaneousBreathing: true,
      respiratoryRate: 20,
      radialPulsePresent: false, // Shock
      followsSimpleCommands: true,
    };

    const result = evaluateStartTriage(input);
    expect(result.priority).toBe('IMMEDIATE');
    expect(result.badge.code).toBe('RED');
    expect(result.immediateActions).toEqual(
      expect.arrayContaining([expect.stringContaining('tourniquet')])
    );
  });

  it('assigns IMMEDIATE (Red) when capillary refill is delayed (> 2.0 seconds)', () => {
    const input: VitalAssessmentInput = {
      ambulatory: false,
      spontaneousBreathing: true,
      respiratoryRate: 20,
      radialPulsePresent: true,
      capillaryRefillSeconds: 3.5, // > 2s
      followsSimpleCommands: true,
    };

    const result = evaluateStartTriage(input);
    expect(result.priority).toBe('IMMEDIATE');
    expect(result.badge.code).toBe('RED');
  });

  it('assigns IMMEDIATE (Red) when patient cannot follow simple commands (altered mental status)', () => {
    const input: VitalAssessmentInput = {
      ambulatory: false,
      spontaneousBreathing: true,
      respiratoryRate: 18,
      radialPulsePresent: true,
      capillaryRefillSeconds: 1.2,
      followsSimpleCommands: false, // Confused / unresponsive
    };

    const result = evaluateStartTriage(input);
    expect(result.priority).toBe('IMMEDIATE');
    expect(result.badge.code).toBe('RED');
  });

  it('assigns DELAYED (Yellow) to stable non-ambulatory patients who pass all physiological gates', () => {
    const input: VitalAssessmentInput = {
      ambulatory: false,
      spontaneousBreathing: true,
      respiratoryRate: 18,
      radialPulsePresent: true,
      capillaryRefillSeconds: 1.5,
      followsSimpleCommands: true,
    };

    const result = evaluateStartTriage(input);
    expect(result.priority).toBe('DELAYED');
    expect(result.badge.code).toBe('YELLOW');
    expect(result.recommendedTransport).toBe('GROUND_AMBULANCE');
    expect(result.estimatedCareWindowMinutes).toBe(120);
  });
});
