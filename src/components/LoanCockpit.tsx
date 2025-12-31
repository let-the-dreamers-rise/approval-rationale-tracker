/**
 * LoanCockpit Root Component
 * Single-screen cockpit displaying all loan approval logic
 * 
 * Requirements: 3.5
 */
import { useState } from 'react';
import { useLoanCockpit } from '../context/LoanCockpitContext';
import { HeaderSection } from './HeaderSection';
import { ImportSection } from './ImportSection';
import { RationaleCard } from './RationaleCard';
import { ConfirmationModal } from './ConfirmationModal';
import { ReviewSummaryButton } from './ReviewSummaryButton';
import { extractTextFromPdf } from '../services/pdfExtractor';
import { mockExtractRationales, extractLoanMetadata, parseApprovalDate } from '../services/rationaleExtractor';
import type { PendingRationale, LoanInfo } from '../types';

/**
 * LoanCockpit assembles all components into a single-screen layout
 * 
 * Requirements:
 * - 3.5: Single screen with no tabs, dashboards, settings, or side navigation
 */
export function LoanCockpit() {
  const {
    state,
    loadDemoData,
    startExtraction,
    setExtractionError,
    markReviewed,
    confirmRationale,
    rejectRationale,
    confirmAllRationales,
    setExtracting,
    setShowConfirmation,
    storageError,
  } = useLoanCockpit();

  const [extractionErrorMsg, setExtractionErrorMsg] = useState<string | null>(null);

  const handleFileImport = async (file: File) => {
    setExtracting(true);
    setExtractionErrorMsg(null);
    
    try {
      // Extract text from PDF
      const result = await extractTextFromPdf(file);
      
      if (!result.success || !result.text) {
        // Use the error message from the extractor - no fallback to demo data
        setExtractionErrorMsg(result.error || 'Unable to extract text from this document');
        setExtractionError();
        return;
      }

      // Extract rationales from text (using mock for demo)
      const rationales = mockExtractRationales(result.text);
      
      if (rationales.length === 0) {
        setExtractionErrorMsg('No approval rationales could be identified in this document.');
        setExtractionError();
        return;
      }

      // Extract loan metadata from the PDF text
      const metadata = extractLoanMetadata(result.text);
      
      // Dev logging for debugging
      if (import.meta.env.DEV) {
        console.log('Extracted metadata:', metadata);
      }
      
      // Parse approval date from document, fallback to today
      let approvalDate = new Date();
      if (metadata.approvalDate) {
        const parsedDate = parseApprovalDate(metadata.approvalDate);
        if (parsedDate) {
          approvalDate = parsedDate;
          if (import.meta.env.DEV) {
            console.log('Parsed approval date:', approvalDate);
          }
        } else if (import.meta.env.DEV) {
          console.log('Failed to parse approval date:', metadata.approvalDate);
        }
      }
      
      // Generate loan ID from borrower name or filename
      const loanIdBase = metadata.borrower 
        ? metadata.borrower.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 15).toUpperCase()
        : file.name.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 10).toUpperCase();
      
      // Create loan info from extracted metadata
      const extractedLoan: LoanInfo = {
        id: `LOAN-${loanIdBase}-${Date.now().toString(36).toUpperCase()}`,
        approvalDate: approvalDate,
        borrowerReference: metadata.borrower || `REF-${file.name.replace(/\.pdf$/i, '').substring(0, 15).toUpperCase()}`,
      };

      // Start extraction mode - clears existing data and shows confirmation
      startExtraction(extractedLoan, rationales);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Import error:', error);
      }
      // Do NOT fall back to demo data on failure
      setExtractionErrorMsg('Unable to extract text from this document');
      setExtractionError();
    }
  };

  const handleEditRationale = (id: string, updates: Partial<PendingRationale>) => {
    console.log('Edit rationale:', id, updates);
  };

  const handleLoadDemoData = () => {
    setExtractionErrorMsg(null);
    loadDemoData();
  };

  // Data source label for header
  const dataSourceLabel = state.dataSource === 'demo' 
    ? 'Demo' 
    : state.dataSource === 'extracted' 
      ? 'Imported Credit Memo' 
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 mesh-gradient">
      {/* Storage error warning */}
      {storageError && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/50 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm text-amber-800 font-medium">{storageError}</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      {state.loan ? (
        <HeaderSection
          loanId={state.loan.id}
          approvalDate={state.loan.approvalDate}
          dataSource={dataSourceLabel}
        />
      ) : (
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative px-6 py-8">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-50 animate-pulse" />
                  <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Approval Rationale Tracker
                  </h1>
                  <p className="text-sm text-indigo-300/80">
                    Import a Credit Memo or load demo data to get started
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Import Section - visually reduced when data is loaded */}
        <div className="animate-fade-in">
          <ImportSection
            onFileImport={handleFileImport}
            onLoadDemoData={handleLoadDemoData}
            isProcessing={state.isExtracting}
            hasData={state.rationales.length > 0}
            extractionError={extractionErrorMsg}
          />
        </div>

        {/* Rationale Cards */}
        {state.rationales.length > 0 && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Approval Rationales
                </h2>
                <p className="text-sm text-gray-500">{state.rationales.length} rationale{state.rationales.length !== 1 ? 's' : ''} tracked</p>
              </div>
            </div>
            <div className="space-y-5">
              {state.rationales.map((rationale, index) => (
                <div key={rationale.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <RationaleCard
                    rationale={rationale}
                    onMarkReviewed={markReviewed}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {state.loan && state.rationales.length === 0 && !state.showConfirmation && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No rationales yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Import a Credit Memo to extract and track approval rationales.
            </p>
          </div>
        )}

        {/* Review Summary Button */}
        {state.loan && state.rationales.length > 0 && (
          <section className="pt-4 animate-fade-in">
            <ReviewSummaryButton
              rationales={state.rationales}
              loanId={state.loan.id}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center">
        <p className="text-xs text-gray-400">
          Approval Rationale Tracker • Enterprise Loan Management
        </p>
      </footer>

      {/* Confirmation Modal */}
      {state.showConfirmation && state.pendingRationales.length > 0 && (
        <ConfirmationModal
          pendingRationales={state.pendingRationales}
          onConfirm={confirmRationale}
          onReject={rejectRationale}
          onEdit={handleEditRationale}
          onConfirmAll={confirmAllRationales}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}
