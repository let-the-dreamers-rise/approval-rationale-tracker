/**
 * Property-based tests for Approval Logic Age Calculator
 * 
 * Feature: approval-rationale-tracker, Property 6: Approval Logic Age Calculation
 * Validates: Requirements 3.2
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateApprovalLogicAge } from './approvalLogicAge';

describe('ApprovalLogicAge', () => {
  describe('calculateApprovalLogicAge', () => {
    it('should return 0 for same month', () => {
      const approvalDate = new Date('2024-12-01');
      const currentDate = new Date('2024-12-28');
      expect(calculateApprovalLogicAge(approvalDate, currentDate)).toBe(0);
    });

    it('should return 1 for exactly one month later', () => {
      const approvalDate = new Date('2024-11-15');
      const currentDate = new Date('2024-12-15');
      expect(calculateApprovalLogicAge(approvalDate, currentDate)).toBe(1);
    });

    it('should return 9 for March to December (9 months)', () => {
      const approvalDate = new Date('2024-03-15');
      const currentDate = new Date('2024-12-28');
      expect(calculateApprovalLogicAge(approvalDate, currentDate)).toBe(9);
    });

    it('should handle year boundaries', () => {
      const approvalDate = new Date('2023-06-15');
      const currentDate = new Date('2024-12-28');
      expect(calculateApprovalLogicAge(approvalDate, currentDate)).toBe(18);
    });

    it('should return 0 for future approval date', () => {
      const approvalDate = new Date('2025-06-15');
      const currentDate = new Date('2024-12-28');
      expect(calculateApprovalLogicAge(approvalDate, currentDate)).toBe(0);
    });

    it('should subtract a month if day not yet reached', () => {
      const approvalDate = new Date('2024-11-30');
      const currentDate = new Date('2024-12-15');
      // Only 15 days, not a full month yet
      expect(calculateApprovalLogicAge(approvalDate, currentDate)).toBe(0);
    });
  });

  /**
   * Property 6: Approval Logic Age Calculation
   * 
   * For any approval date and current date, the calculated approval logic age
   * in months SHALL equal the floor of the number of months between the two dates.
   * 
   * Validates: Requirements 3.2
   */
  describe('Property 6: Approval Logic Age Calculation', () => {
    // Feature: approval-rationale-tracker, Property 6: Approval Logic Age Calculation
    // Validates: Requirements 3.2
    it('should always return a non-negative integer', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          (approvalDate, currentDate) => {
            const age = calculateApprovalLogicAge(approvalDate, currentDate);
            return Number.isInteger(age) && age >= 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 6: Approval Logic Age Calculation
    // Validates: Requirements 3.2
    it('should increase by 1 when moving forward exactly one month', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2020, max: 2025 }),
          fc.integer({ min: 0, max: 11 }),
          fc.integer({ min: 1, max: 28 }), // Use 28 to avoid month-end issues
          (year, month, day) => {
            const approvalDate = new Date(year, month, day);
            const currentDate = new Date(year, month, day);
            const oneMonthLater = new Date(year, month + 1, day);
            
            const ageNow = calculateApprovalLogicAge(approvalDate, currentDate);
            const ageOneMonthLater = calculateApprovalLogicAge(approvalDate, oneMonthLater);
            
            return ageOneMonthLater === ageNow + 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 6: Approval Logic Age Calculation
    // Validates: Requirements 3.2
    it('should return 0 when approval date equals current date', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          (date) => {
            const age = calculateApprovalLogicAge(date, date);
            return age === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
