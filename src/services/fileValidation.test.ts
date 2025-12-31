/**
 * Property-based tests for File Validation
 * 
 * Feature: approval-rationale-tracker, Property 1: File Type Validation
 * Validates: Requirements 1.1, 1.2
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isPdfExtension, isPdfMimeType } from './fileValidation';

describe('FileValidation', () => {
  describe('isPdfExtension', () => {
    it('should return true for .pdf extension', () => {
      expect(isPdfExtension('document.pdf')).toBe(true);
    });

    it('should return true for .PDF extension (case insensitive)', () => {
      expect(isPdfExtension('document.PDF')).toBe(true);
    });

    it('should return false for non-pdf extensions', () => {
      expect(isPdfExtension('document.txt')).toBe(false);
      expect(isPdfExtension('document.doc')).toBe(false);
      expect(isPdfExtension('document.xlsx')).toBe(false);
    });

    it('should return false for files without extension', () => {
      expect(isPdfExtension('document')).toBe(false);
    });
  });

  describe('isPdfMimeType', () => {
    it('should return true for application/pdf', () => {
      expect(isPdfMimeType('application/pdf')).toBe(true);
    });

    it('should return false for other mime types', () => {
      expect(isPdfMimeType('text/plain')).toBe(false);
      expect(isPdfMimeType('application/msword')).toBe(false);
      expect(isPdfMimeType('image/png')).toBe(false);
    });
  });

  /**
   * Property 1: File Type Validation
   * 
   * For any file submitted to the import function, if the file has a .pdf
   * extension and valid PDF header, the system SHALL accept it; otherwise,
   * the system SHALL reject it with a validation message.
   * 
   * Validates: Requirements 1.1, 1.2
   */
  describe('Property 1: File Type Validation', () => {
    // Feature: approval-rationale-tracker, Property 1: File Type Validation
    // Validates: Requirements 1.1, 1.2
    it('should accept any filename ending with .pdf (case insensitive)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('.')),
          fc.constantFrom('.pdf', '.PDF', '.Pdf', '.pDf'),
          (baseName, extension) => {
            const fileName = baseName + extension;
            return isPdfExtension(fileName) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 1: File Type Validation
    // Validates: Requirements 1.1, 1.2
    it('should reject any filename not ending with .pdf', () => {
      const nonPdfExtensions = ['.txt', '.doc', '.docx', '.xlsx', '.jpg', '.png', '.html', '.xml', ''];
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('.')),
          fc.constantFrom(...nonPdfExtensions),
          (baseName, extension) => {
            const fileName = baseName + extension;
            return isPdfExtension(fileName) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 1: File Type Validation
    // Validates: Requirements 1.1, 1.2
    it('should only accept application/pdf mime type', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (mimeType) => {
            const isValid = isPdfMimeType(mimeType);
            return isValid === (mimeType === 'application/pdf');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
