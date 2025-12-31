/**
 * Staleness Calculator Service
 * Calculates rationale status based on time since last human review
 * 
 * Requirements: 5.1, 5.2, 5.3, 4.5
 */
import type { RationaleStatus } from '../types';

/**
 * Staleness thresholds in days
 * - Fresh: ≤30 days
 * - Review Due: 31-90 days
 * - Stale: >90 days
 */
const FRESH_THRESHOLD_DAYS = 30;
const REVIEW_DUE_THRESHOLD_DAYS = 90;

/**
 * Interface for the StalenessCalculator service
 */
export interface StalenessCalculator {
  calculateStatus(lastReviewedDate: Date): RationaleStatus;
  getDaysSinceReview(lastReviewedDate: Date): number;
}

/**
 * Calculates the number of days between two dates
 * Uses floor to get whole days elapsed
 */
export function getDaysSinceReview(lastReviewedDate: Date, currentDate: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffMs = currentDate.getTime() - lastReviewedDate.getTime();
  return Math.floor(diffMs / msPerDay);
}

/**
 * Calculates the staleness status based on days since last review
 * 
 * @param lastReviewedDate - The date when the rationale was last reviewed
 * @param currentDate - Optional current date for testing (defaults to now)
 * @returns RationaleStatus - 'Fresh', 'Review Due', or 'Stale'
 * 
 * Requirements:
 * - 5.1: Fresh status when reviewed within 30 days
 * - 5.2: Review Due status when 31-90 days since review
 * - 5.3: Stale status when more than 90 days since review
 * - 4.5: Status determined solely by time elapsed since last human review
 */
export function calculateStatus(lastReviewedDate: Date, currentDate: Date = new Date()): RationaleStatus {
  const daysSinceReview = getDaysSinceReview(lastReviewedDate, currentDate);
  
  if (daysSinceReview <= FRESH_THRESHOLD_DAYS) {
    return 'Fresh';
  }
  
  if (daysSinceReview <= REVIEW_DUE_THRESHOLD_DAYS) {
    return 'Review Due';
  }
  
  return 'Stale';
}

/**
 * Creates a StalenessCalculator instance
 * Allows for dependency injection of current date for testing
 */
export function createStalenessCalculator(getCurrentDate: () => Date = () => new Date()): StalenessCalculator {
  return {
    calculateStatus: (lastReviewedDate: Date) => calculateStatus(lastReviewedDate, getCurrentDate()),
    getDaysSinceReview: (lastReviewedDate: Date) => getDaysSinceReview(lastReviewedDate, getCurrentDate()),
  };
}

// Export default calculator instance
export const stalenessCalculator = createStalenessCalculator();
