/**
 * Review Action Service
 * Handles the logic for marking rationales as reviewed
 * 
 * Requirements: 5.4, 9.2, 9.3
 */
import type { Rationale } from '../types';
import { calculateStatus } from './stalenessCalculator';

/**
 * Creates an updated rationale with new review timestamp and recalculated status
 * 
 * @param rationale - The rationale to mark as reviewed
 * @param reviewTime - Optional timestamp for testing (defaults to now)
 * @returns Updated rationale with new lastReviewedAt and status
 * 
 * Requirements:
 * - 5.4: Update last reviewed date to current timestamp
 * - 9.2: Update last reviewed date on click
 * - 9.3: Recalculate and update status badge
 */
export function markRationaleAsReviewed(
  rationale: Rationale,
  reviewTime: Date = new Date()
): Rationale {
  return {
    ...rationale,
    lastReviewedAt: reviewTime,
    status: calculateStatus(reviewTime, reviewTime),
  };
}
