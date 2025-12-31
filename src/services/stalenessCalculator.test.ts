/**
 * Property-based tests for StalenessCalculator
 * 
 * Feature: approval-rationale-tracker, Property 9: Staleness Calculation Correctness
 * Validates: Requirements 5.1, 5.2, 5.3, 4.5
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateStatus, getDaysSinceReview } from './stalenessCalculator';

describe('StalenessCalculator', () => {
  describe('getDaysSinceReview', () => {
    it('should return 0 for same day', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const currentDate = new Date('2024-06-15T18:00:00Z');
      expect(getDaysSinceReview(date, currentDate)).toBe(0);
    });

    it('should return correct days for known dates', () => {
      const lastReviewed = new Date('2024-06-01T00:00:00Z');
      const currentDate = new Date('2024-06-11T00:00:00Z');
      expect(getDaysSinceReview(lastReviewed, currentDate)).toBe(10);
    });
  });

  describe('calculateStatus', () => {
    // Unit tests for boundary conditions
    it('should return Fresh for exactly 30 days', () => {
      const lastReviewed = new Date('2024-06-01T00:00:00Z');
      const currentDate = new Date('2024-07-01T00:00:00Z'); // 30 days later
      expect(calculateStatus(lastReviewed, currentDate)).toBe('Fresh');
    });

    it('should return Review Due for exactly 31 days', () => {
      const lastReviewed = new Date('2024-06-01T00:00:00Z');
      const currentDate = new Date('2024-07-02T00:00:00Z'); // 31 days later
      expect(calculateStatus(lastReviewed, currentDate)).toBe('Review Due');
    });

    it('should return Review Due for exactly 90 days', () => {
      const lastReviewed = new Date('2024-06-01T00:00:00Z');
      const currentDate = new Date('2024-08-30T00:00:00Z'); // 90 days later
      expect(calculateStatus(lastReviewed, currentDate)).toBe('Review Due');
    });

    it('should return Stale for exactly 91 days', () => {
      const lastReviewed = new Date('2024-06-01T00:00:00Z');
      const currentDate = new Date('2024-08-31T00:00:00Z'); // 91 days later
      expect(calculateStatus(lastReviewed, currentDate)).toBe('Stale');
    });
  });

  /**
   * Property 9: Staleness Calculation Correctness
   * 
   * For any rationale with a last reviewed date:
   * - If days since review ≤ 30, status SHALL be "Fresh"
   * - If days since review is 31-90, status SHALL be "Review Due"
   * - If days since review > 90, status SHALL be "Stale"
   * 
   * Validates: Requirements 5.1, 5.2, 5.3, 4.5
   */
  describe('Property 9: Staleness Calculation Correctness', () => {
    // Feature: approval-rationale-tracker, Property 9: Staleness Calculation Correctness
    // Validates: Requirements 5.1, 5.2, 5.3, 4.5
    it('should assign Fresh status for any date within 30 days', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 30 }),
          (daysSinceReview) => {
            const currentDate = new Date('2024-12-28T00:00:00Z');
            const lastReviewed = new Date(currentDate.getTime() - daysSinceReview * 24 * 60 * 60 * 1000);
            
            const status = calculateStatus(lastReviewed, currentDate);
            return status === 'Fresh';
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 9: Staleness Calculation Correctness
    // Validates: Requirements 5.1, 5.2, 5.3, 4.5
    it('should assign Review Due status for any date between 31-90 days', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 31, max: 90 }),
          (daysSinceReview) => {
            const currentDate = new Date('2024-12-28T00:00:00Z');
            const lastReviewed = new Date(currentDate.getTime() - daysSinceReview * 24 * 60 * 60 * 1000);
            
            const status = calculateStatus(lastReviewed, currentDate);
            return status === 'Review Due';
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 9: Staleness Calculation Correctness
    // Validates: Requirements 5.1, 5.2, 5.3, 4.5
    it('should assign Stale status for any date more than 90 days ago', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 91, max: 365 }),
          (daysSinceReview) => {
            const currentDate = new Date('2024-12-28T00:00:00Z');
            const lastReviewed = new Date(currentDate.getTime() - daysSinceReview * 24 * 60 * 60 * 1000);
            
            const status = calculateStatus(lastReviewed, currentDate);
            return status === 'Stale';
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 9: Staleness Calculation Correctness
    // Validates: Requirements 5.1, 5.2, 5.3, 4.5
    it('should always return a valid status for any number of days', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          (daysSinceReview) => {
            const currentDate = new Date('2024-12-28T00:00:00Z');
            const lastReviewed = new Date(currentDate.getTime() - daysSinceReview * 24 * 60 * 60 * 1000);
            
            const status = calculateStatus(lastReviewed, currentDate);
            const days = getDaysSinceReview(lastReviewed, currentDate);
            
            // Verify the status matches the days calculation
            if (days <= 30) {
              return status === 'Fresh';
            } else if (days <= 90) {
              return status === 'Review Due';
            } else {
              return status === 'Stale';
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
