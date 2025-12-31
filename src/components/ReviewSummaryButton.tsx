/**
 * ReviewSummaryButton Component
 * Single action button for generating annual review summary
 * 
 * Requirements: 7.1
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Rationale } from '../types';
import { generateReviewSummary } from '../services/reviewSummary';

interface ReviewSummaryButtonProps {
  rationales: Rationale[];
  loanId: string;
}

/**
 * ReviewSummaryButton displays a single action button for generating summaries
 * 
 * Requirements:
 * - 7.1: Display exactly one action button labeled "Generate Annual Review Summary"
 */
export function ReviewSummaryButton({ rationales, loanId }: ReviewSummaryButtonProps) {
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const summary = generateReviewSummary(rationales, loanId);
    setSummaryText(summary.summaryText);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setCopied(false);
  };

  const handleCopy = () => {
    if (summaryText) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <button
        onClick={handleGenerate}
        disabled={rationales.length === 0}
        className="group w-full relative overflow-hidden px-8 py-4 text-base font-semibold text-white 
                   bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 bg-pos-0
                   hover:bg-pos-100 rounded-2xl shadow-lg hover:shadow-xl 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500
                   flex items-center justify-center gap-3"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Generate Annual Review Summary
      </button>

      {/* Summary Modal - rendered via portal to escape container constraints */}
      {showModal && summaryText && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          
          {/* Modal */}
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl animate-fade-in flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="relative overflow-hidden px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-3xl flex-shrink-0">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Annual Review Summary
                  </h2>
                  <p className="text-sm text-white/80">
                    Generated for Loan {loanId}
                  </p>
                </div>
              </div>
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
              <div className="relative">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 leading-relaxed">
                  {summaryText}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between rounded-b-3xl flex-shrink-0">
              <p className="text-sm text-gray-500">
                {rationales.length} rationale{rationales.length !== 1 ? 's' : ''} included
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2
                             ${copied 
                               ? 'text-emerald-700 bg-emerald-100' 
                               : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy to Clipboard
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 
                             hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
