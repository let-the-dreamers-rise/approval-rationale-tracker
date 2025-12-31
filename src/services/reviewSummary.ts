/**
 * Review Summary Generation Service
 * Generates text summaries of rationales needing review
 * 
 * Requirements: 7.2, 7.3, 7.4, 7.5
 */
import type { Rationale, ReviewSummary } from '../types';
import { getDaysSinceReview } from './stalenessCalculator';

/**
 * Generates a review summary for rationales needing attention
 * 
 * @param rationales - List of all rationales
 * @param loanId - The loan identifier
 * @param currentDate - Optional current date for testing
 * @returns ReviewSummary object with plain text output
 * 
 * Requirements:
 * - 7.2: Generate a text summary when button is clicked
 * - 7.3: List rationales with Review Due or Stale status
 * - 7.4: Include how long each listed rationale has been without review
 * - 7.5: Plain text with no charts, scores, or recommendations
 */
export function generateReviewSummary(
  rationales: Rationale[],
  loanId: string,
  currentDate: Date = new Date()
): ReviewSummary {
  // Filter rationales that need review (Review Due or Stale)
  const needingReview = rationales.filter(
    r => r.status === 'Review Due' || r.status === 'Stale'
  );

  // Build the rationales needing review list
  const rationalesNeedingReview = needingReview.map(r => ({
    title: r.title,
    status: r.status,
    daysSinceReview: getDaysSinceReview(r.lastReviewedAt, currentDate),
  }));

  // Generate plain text summary
  const summaryText = generateSummaryText(loanId, rationalesNeedingReview, currentDate);

  return {
    generatedAt: currentDate,
    loanId,
    rationalesNeedingReview,
    summaryText,
  };
}

/**
 * Generates the plain text summary content
 */
function generateSummaryText(
  loanId: string,
  rationalesNeedingReview: { title: string; status: string; daysSinceReview: number }[],
  generatedAt: Date
): string {
  const lines: string[] = [];

  // Header
  lines.push('ANNUAL REVIEW SUMMARY');
  lines.push('=====================');
  lines.push('');
  lines.push(`Loan ID: ${loanId}`);
  lines.push(`Generated: ${formatDate(generatedAt)}`);
  lines.push('');

  if (rationalesNeedingReview.length === 0) {
    lines.push('All approval rationales are current. No review required at this time.');
  } else {
    lines.push('RATIONALES REQUIRING REVIEW');
    lines.push('---------------------------');
    lines.push('');

    // Sort by days since review (most stale first)
    const sorted = [...rationalesNeedingReview].sort(
      (a, b) => b.daysSinceReview - a.daysSinceReview
    );

    for (const item of sorted) {
      lines.push(`• ${item.title}`);
      lines.push(`  Status: ${item.status}`);
      lines.push(`  Days since last review: ${item.daysSinceReview}`);
      lines.push('');
    }

    lines.push('---------------------------');
    lines.push(`Total rationales requiring review: ${rationalesNeedingReview.length}`);
  }

  return lines.join('\n');
}

/**
 * Formats a date for display in the summary
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Gets rationales that need review (Review Due or Stale status)
 */
export function getRationalesNeedingReview(rationales: Rationale[]): Rationale[] {
  return rationales.filter(r => r.status === 'Review Due' || r.status === 'Stale');
}
