/**
 * Property-based tests for Demo Data Service
 * 
 * Feature: approval-rationale-tracker, Property 16: Demo Data Determinism
 * Validates: Requirements 8.5
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { loadDemoData, createDemoLoan, createDemoRationales } from './demoData';

describe('DemoData', () => {
  describe('createDemoLoan', () => {
    it('should return a valid loan with expected ID', () => {
      const loan = createDemoLoan();
      expect(loan.id).toBe('CML-2024-00847');
      expect(loan.approvalDate).toBeInstanceOf(Date);
      expect(loan.borrowerReference).toBeTruthy();
    });
  });

  describe('createDemoRationales', () => {
    it('should return rationales in all three status states', () => {
      const rationales = createDemoRationales();
      const statuses = rationales.map(r => r.status);
      
      expect(statuses).toContain('Fresh');
      expect(statuses).toContain('Review Due');
      expect(statuses).toContain('Stale');
    });

    it('should include contextual signals for each rationale', () => {
      const rationales = createDemoRationales();
      
      for (const rationale of rationales) {
        expect(rationale.contextualSignals.length).toBeGreaterThanOrEqual(1);
        expect(rationale.contextualSignals.length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('loadDemoData', () => {
    it('should return both loan and rationales', () => {
      const data = loadDemoData();
      
      expect(data.loan).toBeDefined();
      expect(data.loan.id).toBeTruthy();
      expect(data.rationales).toBeDefined();
      expect(data.rationales.length).toBeGreaterThan(0);
    });
  });

  /**
   * Property 16: Demo Data Determinism
   * 
   * For any two consecutive invocations of "Load Demo Data" without intervening
   * state changes, the resulting loan and rationale data SHALL be identical.
   * 
   * Validates: Requirements 8.5
   */
  describe('Property 16: Demo Data Determinism', () => {
    // Feature: approval-rationale-tracker, Property 16: Demo Data Determinism
    // Validates: Requirements 8.5
    it('should return identical loan data on consecutive calls', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (numCalls) => {
            const results: ReturnType<typeof createDemoLoan>[] = [];
            
            for (let i = 0; i < numCalls; i++) {
              results.push(createDemoLoan());
            }
            
            // All results should have identical loan ID and approval date
            const firstLoan = results[0];
            return results.every(loan => 
              loan.id === firstLoan.id &&
              loan.approvalDate.getTime() === firstLoan.approvalDate.getTime() &&
              loan.borrowerReference === firstLoan.borrowerReference
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 16: Demo Data Determinism
    // Validates: Requirements 8.5
    it('should return identical rationale structure on consecutive calls', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }),
          (numCalls) => {
            const results: ReturnType<typeof createDemoRationales>[] = [];
            
            for (let i = 0; i < numCalls; i++) {
              results.push(createDemoRationales());
            }
            
            const first = results[0];
            return results.every(rationales => 
              rationales.length === first.length &&
              rationales.every((r, idx) => 
                r.id === first[idx].id &&
                r.title === first[idx].title &&
                r.description === first[idx].description
              )
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 16: Demo Data Determinism
    // Validates: Requirements 8.5
    it('should return identical full demo data on consecutive calls', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const data1 = loadDemoData();
            const data2 = loadDemoData();
            
            // Loan should be identical
            const loanMatch = 
              data1.loan.id === data2.loan.id &&
              data1.loan.approvalDate.getTime() === data2.loan.approvalDate.getTime();
            
            // Rationales should have same structure
            const rationalesMatch = 
              data1.rationales.length === data2.rationales.length &&
              data1.rationales.every((r, idx) => 
                r.id === data2.rationales[idx].id &&
                r.title === data2.rationales[idx].title
              );
            
            return loanMatch && rationalesMatch;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
