/**
 * ConfirmationModal Component
 * Displays extracted rationales for human confirmation
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
import { useState } from 'react';
import type { PendingRationale } from '../types';

interface ConfirmationModalProps {
  pendingRationales: PendingRationale[];
  onConfirm: (rationale: PendingRationale) => void;
  onReject: (id: string) => void;
  onEdit: (id: string, updates: Partial<PendingRationale>) => void;
  onConfirmAll: () => void;
  onClose: () => void;
}

interface EditingState {
  [id: string]: {
    title: string;
    description: string;
  };
}

/**
 * ConfirmationModal allows users to review, edit, confirm, or reject extracted rationales
 * 
 * Requirements:
 * - 2.1: Display each extracted rationale with title and description
 * - 2.2: Allow editing of title and description
 * - 2.3: Convert confirmed rationales to structured objects
 * - 2.4: Remove rejected rationales from pending list
 * - 2.5: Allow editing of title (short text) and description (1-2 lines)
 */
export function ConfirmationModal({
  pendingRationales,
  onConfirm,
  onReject,
  onEdit,
  onConfirmAll,
  onClose,
}: ConfirmationModalProps) {
  const [editingState, setEditingState] = useState<EditingState>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleStartEdit = (rationale: PendingRationale) => {
    setEditingId(rationale.id);
    setEditingState({
      ...editingState,
      [rationale.id]: {
        title: rationale.title,
        description: rationale.description,
      },
    });
  };

  const handleSaveEdit = (rationale: PendingRationale) => {
    const edits = editingState[rationale.id];
    if (edits) {
      onEdit(rationale.id, {
        title: edits.title.substring(0, 100),
        description: edits.description.substring(0, 250),
      });
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleConfirm = (rationale: PendingRationale) => {
    // Apply any pending edits before confirming
    const edits = editingState[rationale.id];
    if (edits) {
      onConfirm({
        ...rationale,
        title: edits.title.substring(0, 100),
        description: edits.description.substring(0, 250),
      });
    } else {
      onConfirm(rationale);
    }
  };

  if (pendingRationales.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all animate-fade-in">
          {/* Header */}
          <div className="relative overflow-hidden px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Confirm Extracted Rationales
                </h2>
                <p className="text-sm text-white/80">
                  {pendingRationales.length} rationale{pendingRationales.length !== 1 ? 's' : ''} found • Review and confirm each one
                </p>
              </div>
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[50vh] overflow-y-auto px-8 py-6 space-y-4">
            {pendingRationales.map((rationale, index) => (
              <div
                key={rationale.id}
                className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-5 
                           hover:shadow-lg hover:border-gray-200 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Number badge */}
                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 
                                flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {index + 1}
                </div>

                {editingId === rationale.id ? (
                  // Edit mode
                  <div className="space-y-4 pl-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editingState[rationale.id]?.title || ''}
                        onChange={(e) =>
                          setEditingState({
                            ...editingState,
                            [rationale.id]: {
                              ...editingState[rationale.id],
                              title: e.target.value,
                            },
                          })
                        }
                        maxLength={100}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter rationale title..."
                      />
                      <p className="mt-1 text-xs text-gray-400">{editingState[rationale.id]?.title?.length || 0}/100 characters</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                        Description
                      </label>
                      <textarea
                        value={editingState[rationale.id]?.description || ''}
                        onChange={(e) =>
                          setEditingState({
                            ...editingState,
                            [rationale.id]: {
                              ...editingState[rationale.id],
                              description: e.target.value,
                            },
                          })
                        }
                        maxLength={250}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                        placeholder="Enter rationale description..."
                      />
                      <p className="mt-1 text-xs text-gray-400">{editingState[rationale.id]?.description?.length || 0}/250 characters</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleSaveEdit(rationale)}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 
                                   hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="pl-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {rationale.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {rationale.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirm(rationale)}
                        className="group/btn px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 
                                   hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStartEdit(rationale)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 
                                   hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => onReject(rationale.id)}
                        className="px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 
                                   rounded-xl transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Review Later
            </button>
            <button
              onClick={onConfirmAll}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 
                         hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-md hover:shadow-lg transition-all 
                         flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirm All ({pendingRationales.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
