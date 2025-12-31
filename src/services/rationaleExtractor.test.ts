/**
 * Property-based tests for Rationale Extraction
 * 
 * Feature: approval-rationale-tracker, Property 2: Extraction Result Structure
 * Validates: Requirements 1.3, 2.1
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { mockExtractRationales } from './rationaleExtractor';

describe('RationaleExtractor', () => {
  describe('mockExtractRationales', () => {
    it('should extract rationales from text containing cash flow keyword', () => {
      const text = 'The borrower has shown strong cash flow generation over the past 3 years. This demonstrates financial stability.';
      const rationales = mockExtractRationales(text);
      
      expect(rationales.length).toBeGreaterThan(0);
      expect(rationales.some(r => r.title.toLowerCase().includes('cash flow'))).toBe(true);
    });

    it('should extract rationales from text containing collateral keyword', () => {
      const text = 'The collateral valuation supports the loan amount requested. Asset coverage is adequate.';
      const rationales = mockExtractRationales(text);
      
      expect(rationales.length).toBeGreaterThan(0);
      expect(rationales.some(r => r.title.toLowerCase().includes('collateral'))).toBe(true);
    });

    it('should return generic rationale for text without keywords', () => {
      const text = 'This is some generic text without specific keywords that is long enough to be extracted.';
      const rationales = mockExtractRationales(text);
      
      expect(rationales.length).toBe(1);
      expect(rationales[0].title).toBe('Approval Rationale');
    });

    it('should return empty array for empty text', () => {
      const rationales = mockExtractRationales('');
      expect(rationales).toHaveLength(0);
    });
  });

  /**
   * Property 2: Extraction Result Structure
   * 
   * For any successful extraction operation, the resulting pending rationales
   * SHALL each contain a non-empty title and non-empty description.
   * 
   * Validates: Requirements 1.3, 2.1
   */
  describe('Property 2: Extraction Result Structure', () => {
    // Feature: approval-rationale-tracker, Property 2: Extraction Result Structure
    // Validates: Requirements 1.3, 2.1
    it('should always produce rationales with non-empty titles', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }),
          (text) => {
            const rationales = mockExtractRationales(text);
            return rationales.every(r => r.title.length > 0);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 2: Extraction Result Structure
    // Validates: Requirements 1.3, 2.1
    it('should always produce rationales with non-empty descriptions', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }),
          (text) => {
            const rationales = mockExtractRationales(text);
            return rationales.every(r => r.description.length > 0);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 2: Extraction Result Structure
    // Validates: Requirements 1.3, 2.1
    it('should always produce rationales with valid IDs', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }),
          (text) => {
            const rationales = mockExtractRationales(text);
            return rationales.every(r => r.id.length > 0 && r.id.startsWith('rat-'));
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 2: Extraction Result Structure
    // Validates: Requirements 1.3, 2.1
    it('should always produce rationales with extractedAt timestamp', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }),
          (text) => {
            const rationales = mockExtractRationales(text);
            return rationales.every(r => r.extractedAt instanceof Date);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 2: Extraction Result Structure
    // Validates: Requirements 1.3, 2.1
    it('should produce unique IDs for each rationale', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 500 }),
          (text) => {
            // Add multiple keywords to get multiple rationales
            const enhancedText = text + ' revenue collateral management cash flow';
            const rationales = mockExtractRationales(enhancedText);
            const ids = rationales.map(r => r.id);
            const uniqueIds = new Set(ids);
            return ids.length === uniqueIds.size;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
