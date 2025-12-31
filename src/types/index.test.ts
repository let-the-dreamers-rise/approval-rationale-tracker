/**
 * Basic tests to verify project setup and type definitions
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { 
  RationaleStatus, 
  LoanInfo, 
  Rationale, 
  PendingRationale, 
  ContextualSignal, 
  ReviewSummary,
  LoanCockpitState 
} from './index';

describe('Project Setup Verification', () => {
  it('should have RationaleStatus type with correct values', () => {
    const validStatuses: RationaleStatus[] = ['Fresh', 'Review Due', 'Stale'];
    expect(validStatuses).toHaveLength(3);
    expect(validStatuses).toContain('Fresh');
    expect(validStatuses).toContain('Review Due');
    expect(validStatuses).toContain('Stale');
  });

  it('should create valid LoanInfo objects', () => {
    const loan: LoanInfo = {
      id: 'CML-2024-00847',
      approvalDate: new Date('2024-03-15'),
      borrowerReference: 'REF-001',
    };
    expect(loan.id).toBe('CML-2024-00847');
    expect(loan.approvalDate).toBeInstanceOf(Date);
    expect(loan.borrowerReference).toBe('REF-001');
  });

  it('should create valid ContextualSignal objects', () => {
    const signal: ContextualSignal = {
      id: 'sig-001',
      description: 'Industry revenue data updated 2 weeks ago',
      updatedAt: new Date(),
    };
    expect(signal.id).toBe('sig-001');
    expect(signal.description).toBeTruthy();
    expect(signal.updatedAt).toBeInstanceOf(Date);
  });

  it('should create valid Rationale objects', () => {
    const rationale: Rationale = {
      id: 'rat-001',
      title: 'Revenue Stability Assessment',
      description: 'Borrower demonstrated 3 consecutive years of stable revenue growth.',
      createdAt: new Date(),
      lastReviewedAt: new Date(),
      status: 'Fresh',
      contextualSignals: [],
    };
    expect(rationale.id).toBe('rat-001');
    expect(rationale.title.length).toBeLessThanOrEqual(100);
    expect(rationale.description.length).toBeLessThanOrEqual(250);
    expect(['Fresh', 'Review Due', 'Stale']).toContain(rationale.status);
  });

  it('should create valid PendingRationale objects', () => {
    const pending: PendingRationale = {
      id: 'pending-001',
      title: 'Extracted Rationale',
      description: 'Description from PDF',
      extractedAt: new Date(),
      sourceText: 'Original text from the credit memo...',
    };
    expect(pending.id).toBe('pending-001');
    expect(pending.sourceText).toBeTruthy();
  });

  it('should create valid ReviewSummary objects', () => {
    const summary: ReviewSummary = {
      generatedAt: new Date(),
      loanId: 'CML-2024-00847',
      rationalesNeedingReview: [
        { title: 'Test Rationale', status: 'Stale', daysSinceReview: 95 },
      ],
      summaryText: 'Summary text here',
    };
    expect(summary.loanId).toBe('CML-2024-00847');
    expect(summary.rationalesNeedingReview).toHaveLength(1);
  });

  it('should create valid LoanCockpitState objects', () => {
    const state: LoanCockpitState = {
      loan: null,
      rationales: [],
      pendingRationales: [],
      isExtracting: false,
      showConfirmation: false,
      dataSource: 'none',
    };
    expect(state.loan).toBeNull();
    expect(state.rationales).toEqual([]);
    expect(state.isExtracting).toBe(false);
    expect(state.dataSource).toBe('none');
  });
});

describe('fast-check Integration Verification', () => {
  it('should work with fast-check property testing', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        return typeof str === 'string';
      }),
      { numRuns: 100 }
    );
  });

  it('should generate valid RationaleStatus values', () => {
    const statusArbitrary = fc.constantFrom<RationaleStatus>('Fresh', 'Review Due', 'Stale');
    
    fc.assert(
      fc.property(statusArbitrary, (status) => {
        return ['Fresh', 'Review Due', 'Stale'].includes(status);
      }),
      { numRuns: 100 }
    );
  });
});
