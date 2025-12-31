/**
 * Property-based tests for Confirmation Actions
 * 
 * Feature: approval-rationale-tracker, Property 4 & 5: Confirmation and Rejection
 * Validates: Requirements 2.3, 2.4
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { confirmPendingRationale, rejectPendingRationale } from './confirmationActions';
import type { PendingRationale } from '../types';

// Arbitrary for generating pending rationales
const pendingRationaleArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 250 }),
  extractedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
  sourceText: fc.string({ minLength: 1, maxLength: 500 }),
});

describe('ConfirmationActions', () => {
  describe('confirmPendingRationale', () => {
    it('should create a rationale with the same title and description', () => {
      const pending: PendingRationale = {
        id: 'test-001',
        title: 'Test Title',
        description: 'Test Description',
        extractedAt: new Date(),
        sourceText: 'Source text',
      };
      
      const confirmed = confirmPendingRationale(pending);
      
      expect(confirmed.title).toBe(pending.title);
      expect(confirmed.description).toBe(pending.description);
    });

    it('should set createdAt and lastReviewedAt to the confirm time', () => {
      const pending: PendingRationale = {
        id: 'test-001',
        title: 'Test Title',
        description: 'Test Description',
        extractedAt: new Date('2024-01-01'),
        sourceText: 'Source text',
      };
      
      const confirmTime = new Date('2024-12-28T12:00:00Z');
      const confirmed = confirmPendingRationale(pending, confirmTime);
      
      expect(confirmed.createdAt).toEqual(confirmTime);
      expect(confirmed.lastReviewedAt).toEqual(confirmTime);
    });

    it('should set status to Fresh when confirmed', () => {
      const pending: PendingRationale = {
        id: 'test-001',
        title: 'Test Title',
        description: 'Test Description',
        extractedAt: new Date(),
        sourceText: 'Source text',
      };
      
      const confirmed = confirmPendingRationale(pending);
      
      expect(confirmed.status).toBe('Fresh');
    });
  });

  describe('rejectPendingRationale', () => {
    it('should remove the rationale with the given ID', () => {
      const pendingList: PendingRationale[] = [
        { id: 'rat-1', title: 'Title 1', description: 'Desc 1', extractedAt: new Date(), sourceText: '' },
        { id: 'rat-2', title: 'Title 2', description: 'Desc 2', extractedAt: new Date(), sourceText: '' },
        { id: 'rat-3', title: 'Title 3', description: 'Desc 3', extractedAt: new Date(), sourceText: '' },
      ];
      
      const result = rejectPendingRationale(pendingList, 'rat-2');
      
      expect(result).toHaveLength(2);
      expect(result.find(r => r.id === 'rat-2')).toBeUndefined();
    });

    it('should not modify the list if ID not found', () => {
      const pendingList: PendingRationale[] = [
        { id: 'rat-1', title: 'Title 1', description: 'Desc 1', extractedAt: new Date(), sourceText: '' },
      ];
      
      const result = rejectPendingRationale(pendingList, 'non-existent');
      
      expect(result).toHaveLength(1);
    });
  });

  /**
   * Property 4: Confirmation Creates Timestamped Object
   * 
   * For any pending rationale that is confirmed, the resulting structured rationale
   * SHALL have a createdAt timestamp within 1 second of the confirmation time
   * and a lastReviewedAt timestamp equal to createdAt.
   * 
   * Validates: Requirements 2.3
   */
  describe('Property 4: Confirmation Creates Timestamped Object', () => {
    // Feature: approval-rationale-tracker, Property 4: Confirmation Creates Timestamped Object
    // Validates: Requirements 2.3
    it('should set createdAt to the confirmation time for any pending rationale', () => {
      fc.assert(
        fc.property(
          pendingRationaleArbitrary,
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          (pending, confirmTime) => {
            const confirmed = confirmPendingRationale(pending, confirmTime);
            return confirmed.createdAt.getTime() === confirmTime.getTime();
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 4: Confirmation Creates Timestamped Object
    // Validates: Requirements 2.3
    it('should set lastReviewedAt equal to createdAt for any pending rationale', () => {
      fc.assert(
        fc.property(
          pendingRationaleArbitrary,
          (pending) => {
            const confirmed = confirmPendingRationale(pending);
            return confirmed.lastReviewedAt.getTime() === confirmed.createdAt.getTime();
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 4: Confirmation Creates Timestamped Object
    // Validates: Requirements 2.3
    it('should always result in Fresh status when confirmed', () => {
      fc.assert(
        fc.property(
          pendingRationaleArbitrary,
          (pending) => {
            const confirmed = confirmPendingRationale(pending);
            return confirmed.status === 'Fresh';
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Rejection Removes from Pending
   * 
   * For any pending rationale list and any rationale ID that is rejected,
   * the resulting pending list SHALL NOT contain a rationale with that ID.
   * 
   * Validates: Requirements 2.4
   */
  describe('Property 5: Rejection Removes from Pending', () => {
    // Feature: approval-rationale-tracker, Property 5: Rejection Removes from Pending
    // Validates: Requirements 2.4
    it('should not contain the rejected ID in the result', () => {
      fc.assert(
        fc.property(
          fc.array(pendingRationaleArbitrary, { minLength: 1, maxLength: 10 }),
          fc.nat(),
          (pendingList, indexSeed) => {
            // Pick a random rationale to reject
            const index = indexSeed % pendingList.length;
            const idToReject = pendingList[index].id;
            
            const result = rejectPendingRationale(pendingList, idToReject);
            
            return !result.some(r => r.id === idToReject);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 5: Rejection Removes from Pending
    // Validates: Requirements 2.4
    it('should reduce list length by 1 when rejecting existing ID', () => {
      fc.assert(
        fc.property(
          fc.array(pendingRationaleArbitrary, { minLength: 1, maxLength: 10 }),
          fc.nat(),
          (pendingList, indexSeed) => {
            const index = indexSeed % pendingList.length;
            const idToReject = pendingList[index].id;
            
            const result = rejectPendingRationale(pendingList, idToReject);
            
            return result.length === pendingList.length - 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: approval-rationale-tracker, Property 5: Rejection Removes from Pending
    // Validates: Requirements 2.4
    it('should preserve all other rationales when rejecting', () => {
      fc.assert(
        fc.property(
          fc.array(pendingRationaleArbitrary, { minLength: 2, maxLength: 10 }),
          fc.nat(),
          (pendingList, indexSeed) => {
            const index = indexSeed % pendingList.length;
            const idToReject = pendingList[index].id;
            
            const result = rejectPendingRationale(pendingList, idToReject);
            const otherIds = pendingList.filter(p => p.id !== idToReject).map(p => p.id);
            
            return otherIds.every(id => result.some(r => r.id === id));
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
