/**
 * RationaleCard Component
 * Displays individual rationale with context panel and review action
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 9.1, 9.2, 9.3, 9.5
 */
import React from 'react';
import type { Rationale } from '../types';
import { StatusBadge } from './StatusBadge';
import { ContextPanel } from './ContextPanel';

interface RationaleCardProps {
  rationale: Rationale;
  onMarkReviewed: (id: string) => void;
}

/**
 * Formats a date for display (e.g., "December 1, 2024")
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get icon for rationale type based on title
 */
function getRationaleIcon(title: string): React.ReactNode {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('cash flow')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (lowerTitle.includes('collateral') || lowerTitle.includes('asset')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }
  if (lowerTitle.includes('operational') || lowerTitle.includes('management')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
  }
  if (lowerTitle.includes('risk')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

/**
 * RationaleCard displays a structured card for each rationale
 * 
 * Requirements:
 * - 4.1: Display rationale title (short text)
 * - 4.2: Display rationale description (1-2 lines)
 * - 4.3: Display last reviewed date
 * - 4.4: Display status badge (Fresh, Review Due, Stale)
 * - 9.1: Include "Mark as Reviewed" action
 * - 9.2: Update last reviewed date on click
 * - 9.3: Recalculate status on review
 * - 9.5: Provide visual confirmation of update
 */
export function RationaleCard({ rationale, onMarkReviewed }: RationaleCardProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMarkReviewed = () => {
    onMarkReviewed(rationale.id);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
  };

  const statusColors = {
    'Fresh': { bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-600' },
    'Review Due': { bg: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/30', icon: 'text-amber-600' },
    'Stale': { bg: 'from-rose-500/10 to-pink-500/10', border: 'border-rose-500/30', icon: 'text-rose-600' },
  };

  const colors = statusColors[rationale.status];

  return (
    <div 
      className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden 
                  transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
        rationale.status === 'Fresh' ? 'from-emerald-500 to-teal-500' :
        rationale.status === 'Review Due' ? 'from-amber-500 to-orange-500' :
        'from-rose-500 to-pink-500'
      }`} />

      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative p-6">
        {/* Header with icon, title and status badge */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} ${colors.border} border 
                          flex items-center justify-center ${colors.icon} transition-transform duration-300 
                          ${isHovered ? 'scale-110' : ''}`}>
            {getRationaleIcon(rationale.title)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-gray-900 leading-snug">
                {rationale.title}
              </h3>
              <StatusBadge status={rationale.status} />
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4 pl-14">
          {rationale.description}
        </p>

        {/* Last reviewed date */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 pl-14">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Last reviewed: {formatDate(rationale.lastReviewedAt)}</span>
        </div>

        {/* Context Panel */}
        <div className="pl-14">
          <ContextPanel signals={rationale.contextualSignals} />
        </div>

        {/* Action button */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-100 pl-14">
          {showConfirmation ? (
            <div className="flex items-center gap-2 text-emerald-600 animate-fade-in">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium">Marked as reviewed</span>
            </div>
          ) : (
            <span />
          )}
          <button
            onClick={handleMarkReviewed}
            className="group/btn relative px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 
                       rounded-xl shadow-md hover:shadow-lg transition-all duration-200 
                       hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 transition-transform group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark as Reviewed
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
