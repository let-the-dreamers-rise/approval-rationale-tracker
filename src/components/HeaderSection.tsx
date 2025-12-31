/**
 * HeaderSection Component
 * Displays loan identification and approval logic age
 * 
 * Requirements: 3.1, 3.2
 */
import { calculateApprovalLogicAge } from '../services/approvalLogicAge';

interface HeaderSectionProps {
  loanId: string;
  approvalDate: Date;
  dataSource?: string | null;
}

/**
 * Formats a date for display (e.g., "March 15, 2024")
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * HeaderSection displays loan identification information
 * Enterprise styling: calm, high-density, no gradients
 * 
 * Requirements:
 * - 3.1: Display Loan_ID and Approval_Date in top section
 * - 3.2: Display "Approval Logic Age: X months" calculated from approval date
 */
export function HeaderSection({ loanId, approvalDate, dataSource }: HeaderSectionProps) {
  const approvalLogicAgeMonths = calculateApprovalLogicAge(approvalDate);
  
  // Determine age status for visual indicator
  const ageStatus = approvalLogicAgeMonths < 6 ? 'fresh' : approvalLogicAgeMonths < 12 ? 'moderate' : 'aged';
  const ageColors = {
    fresh: 'from-emerald-500 to-teal-500',
    moderate: 'from-amber-500 to-orange-500',
    aged: 'from-rose-500 to-pink-500',
  };

  return (
    <header className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="relative px-6 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Top row with logo and data source */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Animated logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-50 animate-pulse" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Approval Rationale Tracker
                </h1>
                <p className="text-sm text-indigo-300/80">Loan Approval Logic Cockpit</p>
              </div>
            </div>
            {dataSource && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm text-white/90 font-medium">{dataSource}</span>
              </div>
            )}
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Loan ID Card */}
            <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  <span className="text-xs font-medium text-indigo-300 uppercase tracking-wider">Loan ID</span>
                </div>
                <p className="text-lg font-mono font-semibold text-white truncate" title={loanId}>
                  {loanId}
                </p>
              </div>
            </div>

            {/* Approval Date Card */}
            <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium text-purple-300 uppercase tracking-wider">Approval Date</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {formatDate(approvalDate)}
                </p>
              </div>
            </div>

            {/* Logic Age Card */}
            <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${ageColors[ageStatus]}/20 to-transparent rounded-bl-full`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-amber-300 uppercase tracking-wider">Logic Age</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold bg-gradient-to-r ${ageColors[ageStatus]} bg-clip-text text-transparent`}>
                    {approvalLogicAgeMonths}
                  </span>
                  <span className="text-sm text-white/60">months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
