/**
 * LoanCockpit Context and State Management
 * Uses useReducer for predictable state updates
 * 
 * Requirements: 3.1, 3.3, 3.4
 */
import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { LoanInfo, Rationale, PendingRationale, LoanCockpitState } from '../types';
import { calculateStatus } from '../services/stalenessCalculator';
import { loadDemoData } from '../services/demoData';

// Storage key for localStorage persistence
const STORAGE_KEY = 'art-loan-cockpit-state';

/**
 * Action types for the reducer
 */
type LoanCockpitAction =
  | { type: 'LOAD_DEMO_DATA' }
  | { type: 'START_EXTRACTION'; payload: { loan: LoanInfo; pendingRationales: PendingRationale[] } }
  | { type: 'SET_LOAN'; payload: LoanInfo }
  | { type: 'SET_RATIONALES'; payload: Rationale[] }
  | { type: 'ADD_PENDING_RATIONALES'; payload: PendingRationale[] }
  | { type: 'CONFIRM_RATIONALE'; payload: PendingRationale }
  | { type: 'REJECT_RATIONALE'; payload: string }
  | { type: 'CONFIRM_ALL_RATIONALES' }
  | { type: 'MARK_REVIEWED'; payload: string }
  | { type: 'SET_EXTRACTING'; payload: boolean }
  | { type: 'SET_SHOW_CONFIRMATION'; payload: boolean }
  | { type: 'CLEAR_STATE' }
  | { type: 'RESTORE_STATE'; payload: LoanCockpitState }
  | { type: 'SET_EXTRACTION_ERROR' };

/**
 * Initial state
 */
const initialState: LoanCockpitState = {
  loan: null,
  rationales: [],
  pendingRationales: [],
  isExtracting: false,
  showConfirmation: false,
  dataSource: 'none',
};

/**
 * Reducer function for state management
 */
function loanCockpitReducer(state: LoanCockpitState, action: LoanCockpitAction): LoanCockpitState {
  switch (action.type) {
    case 'LOAD_DEMO_DATA': {
      const demoData = loadDemoData();
      return {
        ...state,
        loan: demoData.loan,
        rationales: demoData.rationales,
        pendingRationales: [],
        showConfirmation: false,
        dataSource: 'demo',
      };
    }

    case 'START_EXTRACTION': {
      // Clear existing data and enter extraction mode
      return {
        ...state,
        loan: action.payload.loan,
        rationales: [], // Clear existing rationales
        pendingRationales: action.payload.pendingRationales,
        showConfirmation: action.payload.pendingRationales.length > 0,
        isExtracting: false,
        dataSource: 'extracted',
      };
    }

    case 'SET_EXTRACTION_ERROR': {
      // On extraction failure, remain in empty state
      return {
        ...initialState,
        isExtracting: false,
      };
    }

    case 'SET_LOAN':
      return { ...state, loan: action.payload };

    case 'SET_RATIONALES':
      return { ...state, rationales: action.payload };

    case 'ADD_PENDING_RATIONALES':
      return {
        ...state,
        pendingRationales: [...state.pendingRationales, ...action.payload],
        showConfirmation: action.payload.length > 0,
      };

    case 'CONFIRM_RATIONALE': {
      const pending = action.payload;
      const now = new Date();
      const newRationale: Rationale = {
        id: pending.id,
        title: pending.title,
        description: pending.description,
        createdAt: now,
        lastReviewedAt: now,
        status: calculateStatus(now, now),
        contextualSignals: [],
      };
      return {
        ...state,
        rationales: [...state.rationales, newRationale],
        pendingRationales: state.pendingRationales.filter(p => p.id !== pending.id),
        showConfirmation: state.pendingRationales.length > 1,
      };
    }

    case 'REJECT_RATIONALE':
      return {
        ...state,
        pendingRationales: state.pendingRationales.filter(p => p.id !== action.payload),
        showConfirmation: state.pendingRationales.length > 1,
      };

    case 'CONFIRM_ALL_RATIONALES': {
      const now = new Date();
      const newRationales: Rationale[] = state.pendingRationales.map(pending => ({
        id: pending.id,
        title: pending.title,
        description: pending.description,
        createdAt: now,
        lastReviewedAt: now,
        status: calculateStatus(now, now),
        contextualSignals: [],
      }));
      return {
        ...state,
        rationales: [...state.rationales, ...newRationales],
        pendingRationales: [],
        showConfirmation: false,
      };
    }

    case 'MARK_REVIEWED': {
      const now = new Date();
      return {
        ...state,
        rationales: state.rationales.map(r =>
          r.id === action.payload
            ? { ...r, lastReviewedAt: now, status: calculateStatus(now, now) }
            : r
        ),
      };
    }

    case 'SET_EXTRACTING':
      return { ...state, isExtracting: action.payload };

    case 'SET_SHOW_CONFIRMATION':
      return { ...state, showConfirmation: action.payload };

    case 'CLEAR_STATE':
      return initialState;

    case 'RESTORE_STATE':
      return action.payload;

    default:
      return state;
  }
}


/**
 * Context type definition
 */
interface LoanCockpitContextType {
  state: LoanCockpitState;
  dispatch: React.Dispatch<LoanCockpitAction>;
  loadDemoData: () => void;
  startExtraction: (loan: LoanInfo, pendingRationales: PendingRationale[]) => void;
  setExtractionError: () => void;
  markReviewed: (rationaleId: string) => void;
  confirmRationale: (rationale: PendingRationale) => void;
  rejectRationale: (rationaleId: string) => void;
  confirmAllRationales: () => void;
  addPendingRationales: (rationales: PendingRationale[]) => void;
  setExtracting: (isExtracting: boolean) => void;
  setShowConfirmation: (show: boolean) => void;
  clearState: () => void;
  storageError: string | null;
}

const LoanCockpitContext = createContext<LoanCockpitContextType | null>(null);

/**
 * Serializes state for localStorage
 */
function serializeState(state: LoanCockpitState): string {
  return JSON.stringify({
    ...state,
    loan: state.loan ? {
      ...state.loan,
      approvalDate: state.loan.approvalDate.toISOString(),
    } : null,
    rationales: state.rationales.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      lastReviewedAt: r.lastReviewedAt.toISOString(),
      contextualSignals: r.contextualSignals.map(s => ({
        ...s,
        updatedAt: s.updatedAt.toISOString(),
      })),
    })),
    pendingRationales: state.pendingRationales.map(p => ({
      ...p,
      extractedAt: p.extractedAt.toISOString(),
    })),
    dataSource: state.dataSource,
  });
}

/**
 * Deserializes state from localStorage
 */
function deserializeState(json: string): LoanCockpitState {
  const parsed = JSON.parse(json);
  return {
    ...parsed,
    loan: parsed.loan ? {
      ...parsed.loan,
      approvalDate: new Date(parsed.loan.approvalDate),
    } : null,
    rationales: parsed.rationales.map((r: Record<string, unknown>) => ({
      ...r,
      createdAt: new Date(r.createdAt as string),
      lastReviewedAt: new Date(r.lastReviewedAt as string),
      contextualSignals: (r.contextualSignals as Record<string, unknown>[]).map(s => ({
        ...s,
        updatedAt: new Date(s.updatedAt as string),
      })),
    })),
    pendingRationales: parsed.pendingRationales.map((p: Record<string, unknown>) => ({
      ...p,
      extractedAt: new Date(p.extractedAt as string),
    })),
    dataSource: parsed.dataSource || 'none',
  };
}

/**
 * Provider component with localStorage persistence
 * Requirements: State Errors handling
 */
export function LoanCockpitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loanCockpitReducer, initialState);
  const [storageError, setStorageError] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restoredState = deserializeState(stored);
        dispatch({ type: 'RESTORE_STATE', payload: restoredState });
      }
    } catch (error) {
      console.error('Failed to restore state from localStorage:', error);
      setStorageError('Previous session data was corrupted. Starting fresh.');
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsInitialized(true);
  }, []);

  // Persist state to localStorage on changes
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, serializeState(state));
      setStorageError(null);
    } catch (error) {
      console.error('Failed to persist state to localStorage:', error);
      setStorageError('Data will not persist after page refresh');
    }
  }, [state, isInitialized]);

  // Action helpers
  const contextValue: LoanCockpitContextType = {
    state,
    dispatch,
    storageError,
    loadDemoData: () => dispatch({ type: 'LOAD_DEMO_DATA' }),
    startExtraction: (loan: LoanInfo, pendingRationales: PendingRationale[]) => 
      dispatch({ type: 'START_EXTRACTION', payload: { loan, pendingRationales } }),
    setExtractionError: () => dispatch({ type: 'SET_EXTRACTION_ERROR' }),
    markReviewed: (rationaleId: string) => dispatch({ type: 'MARK_REVIEWED', payload: rationaleId }),
    confirmRationale: (rationale: PendingRationale) => dispatch({ type: 'CONFIRM_RATIONALE', payload: rationale }),
    rejectRationale: (rationaleId: string) => dispatch({ type: 'REJECT_RATIONALE', payload: rationaleId }),
    confirmAllRationales: () => dispatch({ type: 'CONFIRM_ALL_RATIONALES' }),
    addPendingRationales: (rationales: PendingRationale[]) => dispatch({ type: 'ADD_PENDING_RATIONALES', payload: rationales }),
    setExtracting: (isExtracting: boolean) => dispatch({ type: 'SET_EXTRACTING', payload: isExtracting }),
    setShowConfirmation: (show: boolean) => dispatch({ type: 'SET_SHOW_CONFIRMATION', payload: show }),
    clearState: () => {
      dispatch({ type: 'CLEAR_STATE' });
      localStorage.removeItem(STORAGE_KEY);
    },
  };

  return (
    <LoanCockpitContext.Provider value={contextValue}>
      {children}
    </LoanCockpitContext.Provider>
  );
}

/**
 * Hook to access the LoanCockpit context
 */
export function useLoanCockpit(): LoanCockpitContextType {
  const context = useContext(LoanCockpitContext);
  if (!context) {
    throw new Error('useLoanCockpit must be used within a LoanCockpitProvider');
  }
  return context;
}
