/**
 * PDF Text Extraction Service
 * Uses pdf.js to extract text from uploaded PDF files
 * 
 * Requirements: 1.1, 1.3
 */
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure pdf.js worker using local bundled worker (avoids CORS issues)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Error types for PDF extraction
 */
export type PDFExtractionErrorType = 'file_read' | 'pdf_parse' | 'empty_text' | 'invalid_pdf';

/**
 * Result of PDF extraction
 */
export interface PDFExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
  errorType?: PDFExtractionErrorType;
}

/**
 * PDFExtractor interface
 */
export interface PDFExtractor {
  extractText(file: File): Promise<string>;
}

/**
 * Validates PDF header by checking first bytes
 * PDF files start with %PDF-
 */
async function validatePdfHeader(file: File): Promise<boolean> {
  try {
    const headerBytes = await file.slice(0, 5).arrayBuffer();
    const header = new TextDecoder().decode(headerBytes);
    return header === '%PDF-';
  } catch {
    return false;
  }
}

/**
 * Extracts text content from a PDF file
 * 
 * @param file - The PDF file to extract text from
 * @returns Extraction result with text or error
 * 
 * Requirements:
 * - 1.1: Accept PDF files for import
 * - 1.3: Display extracted rationales for human confirmation
 */
export async function extractTextFromPdf(file: File): Promise<PDFExtractionResult> {
  // Validate PDF header first
  const isValidPdf = await validatePdfHeader(file);
  if (!isValidPdf) {
    return {
      success: false,
      error: 'Unable to extract text from this document',
      errorType: 'invalid_pdf',
    };
  }

  let arrayBuffer: ArrayBuffer;
  
  // Step 1: Read file to ArrayBuffer
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('File read error:', error);
    }
    return {
      success: false,
      error: 'Unable to extract text from this document',
      errorType: 'file_read',
    };
  }

  // Step 2: Parse PDF document
  let pdf: pdfjsLib.PDFDocumentProxy;
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    pdf = await loadingTask.promise;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('PDF parsing error:', error);
    }
    return {
      success: false,
      error: 'Unable to extract text from this document',
      errorType: 'pdf_parse',
    };
  }

  // Step 3: Extract text from all pages
  try {
    const textParts: string[] = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      textParts.push(pageText);
    }
    
    const fullText = textParts.join('\n\n');
    
    // Dev-only logging for debugging
    if (import.meta.env.DEV) {
      console.log(`PDF extraction successful: ${fullText.length} characters extracted`);
    }
    
    if (!fullText.trim()) {
      return {
        success: false,
        error: 'Unable to extract text from this document',
        errorType: 'empty_text',
      };
    }
    
    return {
      success: true,
      text: fullText,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Text extraction error:', error);
    }
    return {
      success: false,
      error: 'Unable to extract text from this document',
      errorType: 'pdf_parse',
    };
  }
}

/**
 * Creates a PDFExtractor instance
 */
export function createPDFExtractor(): PDFExtractor {
  return {
    extractText: async (file: File) => {
      const result = await extractTextFromPdf(file);
      if (!result.success || !result.text) {
        throw new Error(result.error || 'Extraction failed');
      }
      return result.text;
    },
  };
}
