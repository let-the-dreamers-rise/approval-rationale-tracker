/**
 * File Validation Service
 * Validates uploaded files for PDF format
 * 
 * Requirements: 1.1, 1.2
 */

/**
 * Result of file validation
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that a file is a PDF (synchronous check for extension only)
 * 
 * @param file - The file to validate
 * @returns Validation result with isValid flag and optional error message
 * 
 * Requirements:
 * - 1.1: Accept PDF files for import
 * - 1.2: Reject non-PDF files with validation message
 */
export function validatePdfFile(file: File): FileValidationResult {
  // Check file extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.pdf')) {
    return {
      isValid: false,
      error: 'Please import a PDF file',
    };
  }

  return { isValid: true };
}

/**
 * Validates PDF by reading the file header bytes
 * PDF files start with %PDF-
 * 
 * @param file - The file to validate
 * @returns Promise resolving to validation result
 */
export async function validatePdfHeader(file: File): Promise<FileValidationResult> {
  try {
    const headerBytes = await file.slice(0, 5).arrayBuffer();
    const header = new TextDecoder().decode(headerBytes);
    
    if (header !== '%PDF-') {
      return {
        isValid: false,
        error: 'Please import a valid PDF file',
      };
    }
    
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Unable to read file',
    };
  }
}

/**
 * Checks if a file has a PDF extension
 */
export function isPdfExtension(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.pdf');
}

/**
 * Checks if a MIME type is PDF
 */
export function isPdfMimeType(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}
