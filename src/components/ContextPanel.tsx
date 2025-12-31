/**
 * ContextPanel Component
 * Displays read-only contextual signals for a rationale
 * 
 * Requirements: 6.1, 6.2, 6.5
 */
import type { ContextualSignal } from '../types';

interface ContextPanelProps {
  signals: ContextualSignal[];
}

/**
 * Formats the time since a signal was updated in neutral language
 */
function formatTimeSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  const months = Math.floor(diffDays / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

/**
 * ContextPanel displays 1-2 passive signals per rationale
 * Read-only, timestamped, neutral language
 * 
 * Requirements:
 * - 6.1: Display 1-2 passive signals per rationale
 * - 6.2: Include timestamp indicating when signal was updated
 * - 6.5: Use neutral language
 */
export function ContextPanel({ signals }: ContextPanelProps) {
  // Limit to 1-2 signals as per requirements
  const displaySignals = signals.slice(0, 2);
  
  if (displaySignals.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg px-4 py-3 border border-slate-100">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Contextual Signals
        </p>
      </div>
      <div className="space-y-1.5">
        {displaySignals.map((signal) => (
          <p key={signal.id} className="text-xs text-slate-600 leading-relaxed pl-5">
            {signal.description}
            <span className="text-slate-400 ml-1">· {formatTimeSince(signal.updatedAt)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
