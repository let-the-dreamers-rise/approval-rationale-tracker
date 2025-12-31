/**
 * Property-based tests for Review Summary Generation
 * 
 * Feature: approval-rationale-tracker, Property 14: Summary Contains Correct Rationales
 * Validates: Requirements 7.3, 7.4
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateReviewSummary, getRationalesNeedingReview } from './reviewSummary';
import type { Rationale, RationaleStatus } from '../types';

// Arbitrary for generating rationales with specific status
const rationaleWithStatusArbitrary = (status: RationaleStatus) => fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 250 }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
  lastReviewedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
  status: fc.constant(status),
  contextualSignals: fc.constant([]),
});

// Arbitrary for generating mixed rationales
const mixedRationalesArbitrary = fc.array(
  fc.oneof(
    rationaleWithStatusArbitrary('Fresh'),
    rationaleWithStatusArbitrary('Review Due'),
    rationaleWithStatusArbitrary('Stale')
  ),
  { minLength: 0, maxLength: 10 }
);

describe('ReviewSummary', () => {
  describe('generateReviewSummary', () => {
    it('should generate a summary with the correct loan ID', () => {
      const rationales: Rationale[] = [];
      const summary = generateReviewSummary(rationales, 'CML-2024-00847');
      
      expect(summary.loanId).toBe('CML-2024-00847');
      expect(summary.summaryText).toContain('CML-2024-00847');
    });

    it('should include rationales with Review Due status', () => {
      const rationales: Rationale[] = [
        {
          id: 'rat-1',
          title: 'Test Rationale',
          description: 'Description',
          createdAt: new Date(),
          lastReviewedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          status: 'Review Due',
          contextualSignals: [],
        },
      ];
      
      const summary = generateReviewSummary(rationales, 'LOAN-001');
      
      expect(summary.rationalesNeedingReview).toHaveLength(1);
      expect(summary.summaryText).toContain('Test Rationale');
    });

    it('should include rationales with Stale status', () => {
      const rationales: Rationale[] = [
        {
          id: 'rat-1',
          title: 'Stale Rationale',
          description: 'Description',
          createdAt: new Date(),
          lastReviewedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          status: 'Stale',
          contextualSignals: [],
        },
      ];
      
      const summary = generateReviewSummary(rationales, 'LOAN-001');
      
      expect(summary.rationalesNeedingReview).toHaveLength(1);
      expect(summary.summaryText).toContain('Stale Rationale');
    });

    it('should exclude rationales with Fresh status', () => {
      const rationales: Rationale[] = [
        {
          id: 'rat-1',
          title: 'Fresh Rationale',
          description: 'Description',
          createdAt: new Date(),
          lastReviewedAt: new Date(),
          status: 'Fresh',
          contextualSignals: [],
        },
      ];
      
      const summary = generateReviewSummary(rationales, 'LOAN-001');
      
      expect(summary.rationalesNeedingReview).toHaveLength(0);
    });
  });

  describe('getRationalesNeedingReview', () => {
    it('should return only Review Due and Stale rationales', () => {
      const rationales: Rationale[] = [
        { id: '1', title: 'Fresh', description: '', createdAt: new Date(), lastReviewedAt: new Date(), status: 'Fresh', contextualSignals: [] },
        { id: '2', title: 'Review Due', description: '', createdAt: new Date(), lastReviewedAt: new Date(), status: 'Review Due', contextualSignals: [] },
        { id: '3', title: 'Stale', description: '', createdAt: new Date(), lastReviewedAt: new Date(), status: 'Stale', contextualSignals: [] },
      ];
      
      const result = getRationalesNeedingReview(rationales);
      
      expect(result).toHaveLength(2);
      expect(result.map(r => r.status)).toEqual(['Review Due', 'Stale']);
    });
  });

  /**
   * Property 14: Summary Contains Correct Rationales
   * 
   * For any generated review summary and the source rationale list, the summary
   * SHALL include all and only rationales with status "Review Due" or "Stale",
   * and for each included rationale, the summary SHALL include the number of
   * days since last review.
   * 
   * Validates: Requirements 7.3, 7.4
   */
  describe('Property 14: Summary Contains Correct Rationales', () => {
    // Feature: approval-rationale-tracker, Property 14: Summary Contains Correct Rationales
    // Validates: Requirements 7.3, 7.4
    it('should include all Review Due and Stale rationales', () => {
      fc.assert(
        fc.property(
          mixedRationalesArbitrary,
          fc.string({ minLength: 1, maxLength: 20 }),
          (rationales, loanId) => {
            const summary = generateReviewSummary(rationales, loanId);
            const expectedCount = rationales.filter(
              r => r.status === 'Review Due' || r.status === 'Stale'
            ).length;
            
            return summary.rationalesNeedingReview.length === expectedCount;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 14: Summary Contains Correct Rationales
    // Validates: Requirements 7.3, 7.4
    it('should not include Fresh rationales', () => {
      fc.assert(
        fc.property(
          mixedRationalesArbitrary,
          fc.string({ minLength: 1, maxLength: 20 }),
          (rationales, loanId) => {
            const summary = generateReviewSummary(rationales, loanId);
            
            return summary.rationalesNeedingReview.every(
              r => r.status === 'Review Due' || r.status === 'Stale'
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 14: Summary Contains Correct Rationales
    // Validates: Requirements 7.3, 7.4
    it('should include days since review for each rationale', () => {
      fc.assert(
        fc.property(
          mixedRationalesArbitrary,
          fc.string({ minLength: 1, maxLength: 20 }),
          (rationales, loanId) => {
            const summary = generateReviewSummary(rationales, loanId);
            
            return summary.rationalesNeedingReview.every(
              r => typeof r.daysSinceReview === 'number' && r.daysSinceReview >= 0
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 14: Summary Contains Correct Rationales
    // Validates: Requirements 7.3, 7.4
    it('should always produce non-empty summary text', () => {
      fc.assert(
        fc.property(
          mixedRationalesArbitrary,
          fc.string({ minLength: 1, maxLength: 20 }),
          (rationales, loanId) => {
            const summary = generateReviewSummary(rationales, loanId);
            return summary.summaryText.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
