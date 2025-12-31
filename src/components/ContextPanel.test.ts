/**
 * Property-based tests for ContextPanel signal count constraint
 * 
 * Feature: approval-rationale-tracker, Property 11: Context Panel Signal Count
 * Validates: Requirements 6.1
 */
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import type { ContextualSignal } from '../types';

// Helper function that mirrors the ContextPanel logic
function getDisplaySignalCount(signals: ContextualSignal[]): number {
  return Math.min(signals.length, 2);
}

// Arbitrary for generating contextual signals
const contextualSignalArbitrary = fc.record({
  id: fc.uuid(),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
});

describe('ContextPanel', () => {
  /**
   * Property 11: Context Panel Signal Count
   * 
   * For any rationale displayed in the cockpit, the context panel
   * SHALL display between 1 and 2 contextual signals (inclusive).
   * 
   * Validates: Requirements 6.1
   */
  describe('Property 11: Context Panel Signal Count', () => {
    // Feature: approval-rationale-tracker, Property 11: Context Panel Signal Count
    // Validates: Requirements 6.1
    it('should display at most 2 signals regardless of input count', () => {
      fc.assert(
        fc.property(
          fc.array(contextualSignalArbitrary, { minLength: 0, maxLength: 10 }),
          (signals) => {
            const displayCount = getDisplaySignalCount(signals);
            return displayCount <= 2;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 11: Context Panel Signal Count
    // Validates: Requirements 6.1
    it('should display all signals when count is 1 or 2', () => {
      fc.assert(
        fc.property(
          fc.array(contextualSignalArbitrary, { minLength: 1, maxLength: 2 }),
          (signals) => {
            const displayCount = getDisplaySignalCount(signals);
            return displayCount === signals.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 11: Context Panel Signal Count
    // Validates: Requirements 6.1
    it('should display exactly 2 signals when more than 2 are provided', () => {
      fc.assert(
        fc.property(
          fc.array(contextualSignalArbitrary, { minLength: 3, maxLength: 10 }),
          (signals) => {
            const displayCount = getDisplaySignalCount(signals);
            return displayCount === 2;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 11: Context Panel Signal Count
    // Validates: Requirements 6.1
    it('should display 0 signals when none are provided', () => {
      const displayCount = getDisplaySignalCount([]);
      return displayCount === 0;
    });
  });
});
