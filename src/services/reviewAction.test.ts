/**
 * Property-based tests for Review Action
 * 
 * Feature: approval-rationale-tracker, Property 10: Review Action Updates State
 * Validates: Requirements 5.4, 9.2, 9.3
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { markRationaleAsReviewed } from './reviewAction';
import type { Rationale, RationaleStatus } from '../types';

// Arbitrary for generating valid rationales
const rationaleArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 250 }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
  lastReviewedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
  status: fc.constantFrom<RationaleStatus>('Fresh', 'Review Due', 'Stale'),
  contextualSignals: fc.constant([]),
});

describe('ReviewAction', () => {
  describe('markRationaleAsReviewed', () => {
    it('should update lastReviewedAt to the provided time', () => {
      const rationale: Rationale = {
        id: 'test-001',
        title: 'Test Rationale',
        description: 'Test description',
        createdAt: new Date('2024-01-01'),
        lastReviewedAt: new Date('2024-06-01'),
        status: 'Stale',
        contextualSignals: [],
      };
      
      const reviewTime = new Date('2024-12-28T12:00:00Z');
      const updated = markRationaleAsReviewed(rationale, reviewTime);
      
      expect(updated.lastReviewedAt).toEqual(reviewTime);
    });

    it('should set status to Fresh when reviewed now', () => {
      const rationale: Rationale = {
        id: 'test-001',
        title: 'Test Rationale',
        description: 'Test description',
        createdAt: new Date('2024-01-01'),
        lastReviewedAt: new Date('2024-06-01'),
        status: 'Stale',
        contextualSignals: [],
      };
      
      const reviewTime = new Date();
      const updated = markRationaleAsReviewed(rationale, reviewTime);
      
      expect(updated.status).toBe('Fresh');
    });

    it('should preserve other rationale properties', () => {
      const rationale: Rationale = {
        id: 'test-001',
        title: 'Test Rationale',
        description: 'Test description',
        createdAt: new Date('2024-01-01'),
        lastReviewedAt: new Date('2024-06-01'),
        status: 'Stale',
        contextualSignals: [{ id: 'sig-1', description: 'Test signal', updatedAt: new Date() }],
      };
      
      const updated = markRationaleAsReviewed(rationale);
      
      expect(updated.id).toBe(rationale.id);
      expect(updated.title).toBe(rationale.title);
      expect(updated.description).toBe(rationale.description);
      expect(updated.createdAt).toEqual(rationale.createdAt);
      expect(updated.contextualSignals).toEqual(rationale.contextualSignals);
    });
  });

  /**
   * Property 10: Review Action Updates State
   * 
   * For any rationale that is marked as reviewed, the lastReviewedAt timestamp
   * SHALL be updated to within 1 second of the action time, AND the status
   * SHALL be recalculated based on the new timestamp (resulting in "Fresh" status).
   * 
   * Validates: Requirements 5.4, 9.2, 9.3
   */
  describe('Property 10: Review Action Updates State', () => {
    // Feature: approval-rationale-tracker, Property 10: Review Action Updates State
    // Validates: Requirements 5.4, 9.2, 9.3
    it('should update lastReviewedAt to the review time for any rationale', () => {
      fc.assert(
        fc.property(
          rationaleArbitrary,
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          (rationale, reviewTime) => {
            const updated = markRationaleAsReviewed(rationale, reviewTime);
            return updated.lastReviewedAt.getTime() === reviewTime.getTime();
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 10: Review Action Updates State
    // Validates: Requirements 5.4, 9.2, 9.3
    it('should always result in Fresh status when reviewed at the same time', () => {
      fc.assert(
        fc.property(
          rationaleArbitrary,
          (rationale) => {
            const reviewTime = new Date();
            const updated = markRationaleAsReviewed(rationale, reviewTime);
            // When reviewed at the current time, status should be Fresh (0 days since review)
            return updated.status === 'Fresh';
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 10: Review Action Updates State
    // Validates: Requirements 5.4, 9.2, 9.3
    it('should preserve all other rationale properties', () => {
      fc.assert(
        fc.property(
          rationaleArbitrary,
          (rationale) => {
            const updated = markRationaleAsReviewed(rationale);
            return (
              updated.id === rationale.id &&
              updated.title === rationale.title &&
              updated.description === rationale.description &&
              updated.createdAt.getTime() === rationale.createdAt.getTime() &&
              updated.contextualSignals === rationale.contextualSignals
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
