/**
 * Confirmation Actions Service
 * Handles the logic for confirming and rejecting pending rationales
 * 
 * Requirements: 2.3, 2.4
 */
import type { PendingRationale, Rationale } from '../types';
import { calculateStatus } from './stalenessCalculator';

/**
 * Converts a pending rationale to a confirmed rationale
 * 
 * @param pending - The pending rationale to confirm
 * @param confirmTime - Optional timestamp for testing (defaults to now)
 * @returns Confirmed rationale with timestamps
 * 
 * Requirements:
 * - 2.3: Convert confirmed rationale to structured, time-aware object with current timestamp
 */
export function confirmPendingRationale(
  pending: PendingRationale,
  confirmTime: Date = new Date()
): Rationale {
  return {
    id: pending.id,
    title: pending.title,
    description: pending.description,
    createdAt: confirmTime,
    lastReviewedAt: confirmTime,
    status: calculateStatus(confirmTime, confirmTime),
    contextualSignals: [],
  };
}

/**
 * Removes a rationale from the pending list by ID
 * 
 * @param pendingList - The current list of pending rationales
 * @param rationaleId - The ID of the rationale to reject
 * @returns New list without the rejected rationale
 * 
 * Requirements:
 * - 2.4: Remove rejected rationale from pending list
 */
export function rejectPendingRationale(
  pendingList: PendingRationale[],
  rationaleId: string
): PendingRationale[] {
  return pendingList.filter(p => p.id !== rationaleId);
}

/**
 * Confirms all pending rationales at once
 * 
 * @param pendingList - The list of pending rationales to confirm
 * @param confirmTime - Optional timestamp for testing (defaults to now)
 * @returns Array of confirmed rationales
 */
export function confirmAllPendingRationales(
  pendingList: PendingRationale[],
  confirmTime: Date = new Date()
): Rationale[] {
  return pendingList.map(pending => confirmPendingRationale(pending, confirmTime));
}
