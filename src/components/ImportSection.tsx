/**
 * ImportSection Component
 * Minimal PDF import zone with demo data option
 * 
 * Requirements: 1.1, 1.2, 1.4, 1.5
 */
import React, { useRef, useState } from 'react';
import { validatePdfFile } from '../services/fileValidation';

interface ImportSectionProps {
  onFileImport: (file: File) => void;
  onLoadDemoData: () => void;
  isProcessing: boolean;
  hasData?: boolean;
  extractionError?: string | null;
}

/**
 * ImportSection provides a minimal, visually secondary import zone
 * 
 * Requirements:
 * - 1.1: Accept PDF files for import
 * - 1.2: Reject non-PDF files with validation message
 * - 1.4: Visually minimal and secondary to main cockpit
 * - 1.5: Allow users to proceed with mock demonstration data
 */
export function ImportSection({ 
  onFileImport, 
  onLoadDemoData, 
  isProcessing,
  hasData = false,
  extractionError = null,
}: ImportSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid file');
      return;
    }
    setValidationError(null);
    onFileImport(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Reduced visual prominence when data is loaded
  if (hasData) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-sm text-gray-600 font-medium">
              Switch data source
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClick}
              disabled={isProcessing}
              className="group px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl 
                         hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {isProcessing ? 'Processing...' : 'Import PDF'}
            </button>
            <button
              onClick={onLoadDemoData}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl 
                         hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Load Demo
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          disabled={isProcessing}
          className="hidden"
        />
        {(validationError || extractionError) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200/50">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {validationError || extractionError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full -translate-y-32 translate-x-32 opacity-50" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-full translate-y-24 -translate-x-24 opacity-50" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Import Credit Memo
              </h2>
              <p className="text-sm text-gray-500">Demo proxy for LOS integration</p>
            </div>
          </div>
          <button
            onClick={onLoadDemoData}
            disabled={isProcessing}
            className="px-5 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 
                       rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                       border border-indigo-100 hover:border-indigo-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Load Demo Data
          </button>
        </div>

        {/* Drop zone */}
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
            ${isDragOver 
              ? 'border-indigo-400 bg-indigo-50/50 scale-[1.02]' 
              : 'border-gray-200 bg-gradient-to-br from-gray-50/50 to-white hover:border-indigo-300 hover:bg-indigo-50/30'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            disabled={isProcessing}
            className="hidden"
          />
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300
                            ${isDragOver 
                              ? 'bg-indigo-100 scale-110' 
                              : 'bg-gradient-to-br from-gray-100 to-gray-50'}`}>
              {isProcessing ? (
                <svg className="w-8 h-8 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className={`w-8 h-8 transition-colors duration-300 ${isDragOver ? 'text-indigo-500' : 'text-gray-400'}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <p className="text-base font-medium text-gray-700 mb-1">
              {isProcessing ? 'Processing document...' : isDragOver ? 'Drop to upload' : 'Drop PDF here or click to browse'}
            </p>
            <p className="text-sm text-gray-400">
              Credit Memo PDF files only
            </p>
          </div>
        </div>

        {/* Validation or extraction error */}
        {(validationError || extractionError) && (
          <div className="mt-4 flex items-center gap-3 text-sm text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 
                          px-4 py-3 rounded-xl border border-amber-200/50 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span>{validationError || extractionError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
