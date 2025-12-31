# Implementation Plan: Approval Rationale Tracker (ART)

## Overview

This plan implements a single-screen desktop web prototype for loan approval rationale tracking. The implementation uses React with TypeScript, Tailwind CSS for enterprise styling, and localStorage for demo persistence. Tasks are ordered to build core data models first, then UI components, then integration.

## Tasks

- [x] 1. Project Setup and Core Types
  - Initialize React + TypeScript + Vite project
  - Configure Tailwind CSS with enterprise-neutral color palette
  - Create TypeScript interfaces for all data models (LoanInfo, Rationale, PendingRationale, ContextualSignal, ReviewSummary, RationaleStatus)
  - Set up Vitest and fast-check for testing
  - _Requirements: 4.4, 5.1, 5.2, 5.3_

- [x] 2. Staleness Calculator Service
  - [x] 2.1 Implement StalenessCalculator with calculateStatus and getDaysSinceReview functions
    - Fresh: ≤30 days, Review Due: 31-90 days, Stale: >90 days
    - _Requirements: 5.1, 5.2, 5.3, 4.5_
  - [x] 2.2 Write property test for staleness calculation
    - **Property 9: Staleness Calculation Correctness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 4.5**

- [x] 3. Approval Logic Age Calculator
  - [x] 3.1 Implement calculateApprovalLogicAge function (months since approval date)
    - _Requirements: 3.2_
  - [x]* 3.2 Write property test for age calculation
    - **Property 6: Approval Logic Age Calculation**
    - **Validates: Requirements 3.2**

- [x] 4. Mock Data and Demo Service
  - [x] 4.1 Create mock loan data with realistic commercial loan details
    - _Requirements: 8.1, 8.2_
  - [x] 4.2 Create mock rationales covering all three status states (Fresh, Review Due, Stale)
    - _Requirements: 8.3_
  - [x] 4.3 Create mock contextual signals with varied timestamps
    - _Requirements: 8.4_
  - [x] 4.4 Write property test for demo data determinism
    - **Property 16: Demo Data Determinism**
    - **Validates: Requirements 8.5**

- [x] 5. State Management
  - [x] 5.1 Create LoanCockpitContext with useReducer for state management
    - State: loan, rationales, pendingRationales, isExtracting, showConfirmation
    - _Requirements: 3.1, 3.3, 3.4_
  - [x] 5.2 Implement localStorage persistence with error handling
    - Handle unavailable localStorage, corrupted data
    - _Requirements: State Errors handling_

- [x] 6. Checkpoint - Core Services Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. HeaderSection Component
  - [x] 7.1 Implement HeaderSection displaying Loan ID, Approval Date, and Approval Logic Age
    - Enterprise styling: calm, high-density, no gradients
    - _Requirements: 3.1, 3.2_

- [x] 8. RationaleCard Component
  - [x] 8.1 Implement RationaleCard with title, description, last reviewed date, status badge
    - Status badge colors: Fresh (light gray), Review Due (light amber), Stale (light slate)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 8.2 Implement "Mark as Reviewed" action button
    - Updates lastReviewedAt to current timestamp, recalculates status
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  - [x] 8.3 Write property test for review action
    - **Property 10: Review Action Updates State**
    - **Validates: Requirements 5.4, 9.2, 9.3**

- [x] 9. ContextPanel Component
  - [x] 9.1 Implement ContextPanel displaying 1-2 contextual signals per rationale
    - Read-only, timestamped, neutral language
    - _Requirements: 6.1, 6.2, 6.5_
  - [x] 9.2 Write property test for signal count constraint
    - **Property 11: Context Panel Signal Count**
    - **Validates: Requirements 6.1**

- [x] 10. ImportSection Component
  - [x] 10.1 Implement minimal import zone with "Import Credit Memo (PDF)" label
    - Visually secondary, muted colors, enterprise styling
    - _Requirements: 1.4_
  - [x] 10.2 Implement file validation (PDF only)
    - Reject non-PDF files with validation message
    - _Requirements: 1.1, 1.2_
  - [x] 10.3 Implement "Load Demo Data" button
    - _Requirements: 1.5, 8.1_
  - [x] 10.4 Write property test for file validation
    - **Property 1: File Type Validation**
    - **Validates: Requirements 1.1, 1.2**

- [x] 11. Checkpoint - UI Components Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. PDF Text Extraction Service
  - [x] 12.1 Implement PDFExtractor using pdf.js to extract text from uploaded PDF
    - Handle parsing errors gracefully
    - _Requirements: 1.1, 1.3_

- [x] 13. Rationale Extraction Service (LLM Integration)
  - [x] 13.1 Implement RationaleExtractor interface with mock implementation
    - Extract title and description from text
    - Return PendingRationale array
    - _Requirements: 2.1_
  - [x] 13.2 Add OpenAI API integration (optional, with mock fallback)
    - Handle API timeout and failure errors
    - _Requirements: LLM Extraction Errors handling_
  - [x]* 13.3 Write property test for extraction result structure
    - **Property 2: Extraction Result Structure**
    - **Validates: Requirements 1.3, 2.1**

- [x] 14. ConfirmationModal Component
  - [x] 14.1 Implement modal displaying extracted rationales for confirmation
    - Editable title and description fields
    - _Requirements: 2.1, 2.5_
  - [x] 14.2 Implement Confirm, Edit, Reject actions per rationale
    - Confirm: converts to structured rationale with timestamp
    - Reject: removes from pending list
    - _Requirements: 2.2, 2.3, 2.4_
  - [x] 14.3 Implement "Confirm All Remaining" bulk action
    - _Requirements: 2.3_
  - [x]* 14.4 Write property tests for confirmation actions
    - **Property 4: Confirmation Creates Timestamped Object**
    - **Property 5: Rejection Removes from Pending**
    - **Validates: Requirements 2.3, 2.4**

- [x] 15. ReviewSummary Generation
  - [x] 15.1 Implement generateReviewSummary function
    - List rationales with Review Due or Stale status
    - Include days since last review for each
    - Plain text output, no charts or scores
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  - [x] 15.2 Implement "Generate Annual Review Summary" button in cockpit
    - Single action button at bottom of screen
    - _Requirements: 7.1_
  - [x]* 15.3 Write property test for summary content
    - **Property 14: Summary Contains Correct Rationales**
    - **Validates: Requirements 7.3, 7.4**

- [x] 16. LoanCockpit Root Component
  - [x] 16.1 Assemble all components into single-screen cockpit layout
    - Header → Import → Rationale Cards → Summary Button
    - No tabs, dashboards, settings, or side navigation
    - _Requirements: 3.5_
  - [x] 16.2 Wire up state management and component interactions
    - Import triggers extraction → Confirmation → Cards display
    - _Requirements: 3.3, 3.4_
  - [x]* 16.3 Write property test for rationale rendering
    - **Property 7: All Rationales Render**
    - **Validates: Requirements 3.3, 3.4**

- [x] 17. Final Styling and Polish
  - [x] 17.1 Apply enterprise color palette across all components
    - Calm, neutral colors; no gradients or playful accents
    - High information density with clear hierarchy
    - _Requirements: Design Principles_
  - [x] 17.2 Ensure status badges use correct visual treatment
    - Fresh: #F3F4F6 bg, #374151 text
    - Review Due: #FEF3C7 bg, #92400E text
    - Stale: #F1F5F9 bg, #475569 text, 1px border
    - _Requirements: 4.4_

- [x] 18. Final Checkpoint - All Tests Pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify demo flow works end-to-end: Load Demo Data → View Cards → Mark Reviewed → Generate Summary

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Demo must be deterministic and reproducible for hackathon judges
