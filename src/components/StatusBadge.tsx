/**
 * StatusBadge Component
 * Displays rationale status with enterprise-appropriate styling
 * 
 * Requirements: 4.4
 * 
 * Status Badge Visual Treatment:
 * - Fresh: Light gray (#F3F4F6) bg, Dark gray (#374151) text
 * - Review Due: Light amber (#FEF3C7) bg, Amber (#92400E) text
 * - Stale: Light slate (#F1F5F9) bg, Slate (#475569) text, 1px border
 */
import type { RationaleStatus } from '../types';

interface StatusBadgeProps {
  status: RationaleStatus;
}

const statusConfig: Record<RationaleStatus, { 
  bg: string; 
  text: string; 
  dot: string;
  glow: string;
}> = {
  'Fresh': { 
    bg: 'bg-gradient-to-r from-emerald-50 to-teal-50', 
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    glow: 'shadow-emerald-500/25',
  },
  'Review Due': { 
    bg: 'bg-gradient-to-r from-amber-50 to-orange-50', 
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    glow: 'shadow-amber-500/25',
  },
  'Stale': { 
    bg: 'bg-gradient-to-r from-rose-50 to-pink-50', 
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    glow: 'shadow-rose-500/25',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold 
                      ${config.bg} ${config.text} ring-1 ring-inset ring-current/10
                      shadow-sm ${config.glow} transition-all duration-200 hover:shadow-md`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      {status}
    </span>
  );
}
