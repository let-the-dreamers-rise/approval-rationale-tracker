/**
 * Core data models for Approval Rationale Tracker (ART)
 * Based on design document specifications
 */

/**
 * Status of a rationale based on time since last review
 * - Fresh: ≤30 days since review
 * - Review Due: 31-90 days since review
 * - Stale: >90 days since review
 * 
 * Requirements: 4.4, 5.1, 5.2, 5.3
 */
export type RationaleStatus = 'Fresh' | 'Review Due' | 'Stale';

/**
 * Loan identification information
 */
export interface LoanInfo {
  /** Unique loan identifier (e.g., "CML-2024-00847") */
  id: string;
  /** Date when the loan was approved */
  approvalDate: Date;
  /** Anonymized borrower reference, no PII */
  borrowerReference: string;
}

/**
 * A structured, time-aware object representing approval logic
 * extracted from a Credit Memo
 */
export interface Rationale {
  /** Unique identifier for the rationale */
  id: string;
  /** Short text title, max 100 characters */
  title: string;
  /** Description, 1-2 lines, max 250 characters */
  description: string;
  /** Timestamp when the rationale was created/confirmed */
  createdAt: Date;
  /** Timestamp of the last human review */
  lastReviewedAt: Date;
  /** Current staleness status based on time since last review */
  status: RationaleStatus;
  /** Associated contextual signals (1-2 per rationale) */
  contextualSignals: ContextualSignal[];
}

/**
 * A rationale extracted from PDF but not yet confirmed by human
 */
export interface PendingRationale {
  /** Unique identifier for the pending rationale */
  id: string;
  /** Extracted title */
  title: string;
  /** Extracted description */
  description: string;
  /** Timestamp when extraction occurred */
  extractedAt: Date;
  /** Original text from PDF that was used for extraction */
  sourceText: string;
}

/**
 * A passive, read-only data point relevant to a rationale
 * Contains no scoring, interpretation, or recommendations
 */
export interface ContextualSignal {
  /** Unique identifier for the signal */
  id: string;
  /** Neutral language description (e.g., "Industry revenue data updated 2 weeks ago") */
  description: string;
  /** Timestamp when the signal was last updated */
  updatedAt: Date;
}

/**
 * Text summary of rationales needing review
 * Generated for annual governance reviews
 */
export interface ReviewSummary {
  /** Timestamp when the summary was generated */
  generatedAt: Date;
  /** Associated loan identifier */
  loanId: string;
  /** List of rationales that need review */
  rationalesNeedingReview: {
    title: string;
    status: RationaleStatus;
    daysSinceReview: number;
  }[];
  /** Plain text summary output */
  summaryText: string;
}

/**
 * Data source indicator for the cockpit
 * - 'none': No data loaded
 * - 'demo': Demo data loaded via "Load Demo Data" button
 * - 'extracted': Data extracted from imported Credit Memo
 */
export type DataSource = 'none' | 'demo' | 'extracted';

/**
 * State shape for the LoanCockpit component
 */
export interface LoanCockpitState {
  /** Current loan information, null if no loan loaded */
  loan: LoanInfo | null;
  /** List of confirmed rationales */
  rationales: Rationale[];
  /** List of rationales pending human confirmation */
  pendingRationales: PendingRationale[];
  /** Whether extraction is currently in progress */
  isExtracting: boolean;
  /** Whether the confirmation modal is visible */
  showConfirmation: boolean;
  /** Source of the current data */
  dataSource: DataSource;
}
