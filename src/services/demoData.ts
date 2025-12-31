/**
 * Demo Data Service
 * Provides deterministic mock data for hackathon demonstration
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
import type { LoanInfo, Rationale, ContextualSignal } from '../types';
import { calculateStatus } from './stalenessCalculator';

/**
 * Creates a deterministic demo loan
 * Requirements: 8.1, 8.2
 */
export function createDemoLoan(): LoanInfo {
  return {
    id: 'CML-2024-00847',
    approvalDate: new Date('2024-03-15'),
    borrowerReference: 'REF-ACME-2024',
  };
}

/**
 * Creates deterministic contextual signals
 * Requirements: 8.4
 */
function createContextualSignals(): Record<string, ContextualSignal[]> {
  const now = new Date();
  
  return {
    revenue: [
      {
        id: 'sig-001',
        description: 'Industry revenue data updated 2 weeks ago',
        updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      },
    ],
    collateral: [
      {
        id: 'sig-002',
        description: 'Regional property index updated 6 weeks ago',
        updatedAt: new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000),
      },
    ],
    management: [
      {
        id: 'sig-003',
        description: 'Executive team composition unchanged',
        updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'sig-004',
        description: 'Industry leadership benchmark updated 4 months ago',
        updatedAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      },
    ],
  };
}

/**
 * Creates deterministic demo rationales covering all three status states
 * Requirements: 8.3
 */
export function createDemoRationales(): Rationale[] {
  const now = new Date();
  const signals = createContextualSignals();
  
  // Fresh rationale - reviewed within 30 days
  const freshReviewDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  
  // Review Due rationale - reviewed 45 days ago (31-90 days)
  const reviewDueDate = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
  
  // Stale rationale - reviewed 120 days ago (>90 days)
  const staleReviewDate = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
  
  const createdAt = new Date('2024-03-15');

  return [
    {
      id: 'rat-001',
      title: 'Revenue Stability Assessment',
      description: 'Borrower demonstrated 3 consecutive years of stable revenue growth with diversified customer base.',
      createdAt,
      lastReviewedAt: freshReviewDate,
      status: calculateStatus(freshReviewDate, now),
      contextualSignals: signals.revenue,
    },
    {
      id: 'rat-002',
      title: 'Collateral Valuation Basis',
      description: 'Property valuation based on Q1 2024 appraisal with 15% haircut applied per policy.',
      createdAt,
      lastReviewedAt: reviewDueDate,
      status: calculateStatus(reviewDueDate, now),
      contextualSignals: signals.collateral,
    },
    {
      id: 'rat-003',
      title: 'Management Experience Consideration',
      description: 'CEO has 20+ years industry experience; CFO previously at Fortune 500 company.',
      createdAt,
      lastReviewedAt: staleReviewDate,
      status: calculateStatus(staleReviewDate, now),
      contextualSignals: signals.management,
    },
  ];
}

/**
 * Loads all demo data at once
 * Returns deterministic data for reproducible demos
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export function loadDemoData(): { loan: LoanInfo; rationales: Rationale[] } {
  return {
    loan: createDemoLoan(),
    rationales: createDemoRationales(),
  };
}
