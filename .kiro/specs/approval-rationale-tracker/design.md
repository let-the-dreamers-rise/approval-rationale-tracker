# Design Document: Approval Rationale Tracker (ART)

## Overview

ART is a single-screen desktop web application that transforms frozen loan approval reasoning into structured, time-aware, reviewable objects. The system provides a "Loan Approval Logic Cockpit" where credit officers, portfolio managers, and audit teams can view, verify, and track the staleness of approval rationales.

The architecture prioritizes:
- **Simplicity**: Single-screen UI with no navigation complexity
- **Auditability**: Every rationale has timestamps and review history
- **Human-in-the-loop**: LLM extraction requires human confirmation
- **Enterprise aesthetics**: Conservative, calm, high-density information display

### Technical Stack (Hackathon-Grade)

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS (enterprise-neutral palette)
- **State Management**: React Context + useReducer (no external state library)
- **PDF Processing**: pdf.js for text extraction
- **LLM Integration**: OpenAI API for rationale extraction (mock-able)
- **Persistence**: localStorage for demo (no backend required)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Loan Approval Logic Cockpit                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Header Section                        │    │
│  │  Loan ID | Approval Date | Approval Logic Age: X months │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Import Credit Memo (Demo Proxy)             │    │
│  │         [Minimal, visually secondary drop zone]          │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Rationale Cards List                    │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │ Rationale Card                                   │    │    │
│  │  │ Title | Description | Last Reviewed | Status    │    │    │
│  │  │ [Context Panel: 1-2 signals with timestamps]    │    │    │
│  │  │ [Mark as Reviewed]                              │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │  ... more cards ...                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         [Generate Annual Review Summary]                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
PDF Import → Text Extraction → LLM Rationale Extraction → Human Confirmation → Structured Rationales → Cockpit Display
                                                                                        ↓
                                                              Staleness Calculation ← Time-based Status
                                                                        ↓
                                                              Review Summary Generation
```

## Components and Interfaces

### Core Components

#### 1. LoanCockpit (Root Component)
The single-screen container managing all state and child components.

```typescript
interface LoanCockpitState {
  loan: LoanInfo | null;
  rationales: Rationale[];
  pendingRationales: PendingRationale[];
  isExtracting: boolean;
  showConfirmation: boolean;
}
```

#### 2. HeaderSection
Displays loan identification and approval logic age.

```typescript
interface HeaderSectionProps {
  loanId: string;
  approvalDate: Date;
  approvalLogicAgeMonths: number;
}
```

#### 3. ImportSection
Minimal PDF import zone (visually secondary).

```typescript
interface ImportSectionProps {
  onFileImport: (file: File) => void;
  onLoadDemoData: () => void;
  isProcessing: boolean;
}
```

#### 4. RationaleCard
Individual rationale display with context panel.

```typescript
interface RationaleCardProps {
  rationale: Rationale;
  onMarkReviewed: (id: string) => void;
}
```

#### 5. ContextPanel
Read-only contextual signals display.

```typescript
interface ContextPanelProps {
  signals: ContextualSignal[];
}
```

#### 6. ConfirmationModal
Human confirmation of extracted rationales.

```typescript
interface ConfirmationModalProps {
  pendingRationales: PendingRationale[];
  onConfirm: (rationale: PendingRationale) => void;
  onReject: (id: string) => void;
  onEdit: (id: string, updates: Partial<PendingRationale>) => void;
  onConfirmAll: () => void;
}
```

#### 7. ReviewSummaryOutput
Plain text summary generation.

```typescript
interface ReviewSummaryOutputProps {
  rationales: Rationale[];
  loanId: string;
  onGenerate: () => string;
}
```

### Service Interfaces

#### PDFExtractor
```typescript
interface PDFExtractor {
  extractText(file: File): Promise<string>;
}
```

#### RationaleExtractor
```typescript
interface RationaleExtractor {
  extractRationales(text: string): Promise<PendingRationale[]>;
}
```

#### StalenessCalculator
```typescript
interface StalenessCalculator {
  calculateStatus(lastReviewedDate: Date): RationaleStatus;
  getDaysSinceReview(lastReviewedDate: Date): number;
}
```

## Data Models

### LoanInfo
```typescript
interface LoanInfo {
  id: string;
  approvalDate: Date;
  borrowerReference: string; // Anonymized reference, no PII
}
```

### Rationale
```typescript
interface Rationale {
  id: string;
  title: string;           // Short text, max 100 chars
  description: string;     // 1-2 lines, max 250 chars
  createdAt: Date;
  lastReviewedAt: Date;
  status: RationaleStatus;
  contextualSignals: ContextualSignal[];
}
```

### RationaleStatus
```typescript
type RationaleStatus = 'Fresh' | 'Review Due' | 'Stale';
```

### PendingRationale
```typescript
interface PendingRationale {
  id: string;
  title: string;
  description: string;
  extractedAt: Date;
  sourceText: string;      // Original text from PDF
}
```

### ContextualSignal
```typescript
interface ContextualSignal {
  id: string;
  description: string;     // Neutral language, no interpretation
  updatedAt: Date;
}
```

### ReviewSummary
```typescript
interface ReviewSummary {
  generatedAt: Date;
  loanId: string;
  rationalesNeedingReview: {
    title: string;
    status: RationaleStatus;
    daysSinceReview: number;
  }[];
  summaryText: string;
}
```

## UI Wireframe (Text-Based)

### Screen: Loan Approval Logic Cockpit

```
┌────────────────────────────────────────────────────────────────────────────┐
│ LOAN APPROVAL LOGIC COCKPIT                                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Loan ID: CML-2024-00847          Approval Date: March 15, 2024           │
│  Approval Logic Age: 9 months                                              │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Import Credit Memo (Demo Proxy)                    [Load Demo Data] │ │
│  │  ┌────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Import Credit Memo (PDF)                                      │  │ │
│  │  │  (Visually minimal, muted colors)                              │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────┤
│  APPROVAL RATIONALES                                                       │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Revenue Stability Assessment                              [Fresh]   │ │
│  │  Borrower demonstrated 3 consecutive years of stable revenue         │ │
│  │  growth with diversified customer base.                              │ │
│  │  Last reviewed: December 1, 2024                                     │ │
│  │  ┌────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Context: Industry revenue data updated 2 weeks ago            │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  │                                              [Mark as Reviewed]      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Collateral Valuation Basis                           [Review Due]   │ │
│  │  Property valuation based on Q1 2024 appraisal with 15%              │ │
│  │  haircut applied per policy.                                         │ │
│  │  Last reviewed: September 20, 2024                                   │ │
│  │  ┌────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Context: Regional property index updated 6 weeks ago          │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  │                                              [Mark as Reviewed]      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Management Experience Consideration                        [Stale]  │ │
│  │  CEO has 20+ years industry experience; CFO previously at            │ │
│  │  Fortune 500 company.                                                │ │
│  │  Last reviewed: June 10, 2024                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Context: Executive team composition unchanged                 │  │ │
│  │  │  Context: Industry leadership benchmark updated 4 months ago   │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  │                                              [Mark as Reviewed]      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│                    [Generate Annual Review Summary]                        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Status Badge Visual Treatment

| Status | Background | Text | Border |
|--------|------------|------|--------|
| Fresh | Light gray (#F3F4F6) | Dark gray (#374151) | None |
| Review Due | Light amber (#FEF3C7) | Amber (#92400E) | None |
| Stale | Light slate (#F1F5F9) | Slate (#475569) | 1px slate |

Note: Colors are intentionally muted. No red, no alarming colors.

### Confirmation Modal (Post-Extraction)

```
┌────────────────────────────────────────────────────────────────┐
│  Confirm Extracted Rationales                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  The following rationales were extracted from the Credit Memo. │
│  Please review and confirm each one.                           │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Title: [Revenue Stability Assessment          ]         │ │
│  │  Description:                                            │ │
│  │  [Borrower demonstrated 3 consecutive years of stable   ]│ │
│  │  [revenue growth with diversified customer base.        ]│ │
│  │                                                          │ │
│  │  [Confirm]  [Edit]  [Reject]                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ... more extracted rationales ...                             │
│                                                                │
│                              [Confirm All Remaining]           │
└────────────────────────────────────────────────────────────────┘
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: File Type Validation

*For any* file submitted to the import function, if the file has a `.pdf` extension and valid PDF header, the system SHALL accept it; otherwise, the system SHALL reject it with a validation message.

**Validates: Requirements 1.1, 1.2**

### Property 2: Extraction Result Structure

*For any* successful extraction operation, the resulting pending rationales SHALL each contain a non-empty title and non-empty description.

**Validates: Requirements 1.3, 2.1**

### Property 3: Edit Operation Consistency

*For any* rationale and any edit operation with new title/description values, after the edit completes, the rationale's title and description SHALL equal the provided values.

**Validates: Requirements 2.2**

### Property 4: Confirmation Creates Timestamped Object

*For any* pending rationale that is confirmed, the resulting structured rationale SHALL have a `createdAt` timestamp within 1 second of the confirmation time and a `lastReviewedAt` timestamp equal to `createdAt`.

**Validates: Requirements 2.3**

### Property 5: Rejection Removes from Pending

*For any* pending rationale list and any rationale ID that is rejected, the resulting pending list SHALL NOT contain a rationale with that ID.

**Validates: Requirements 2.4**

### Property 6: Approval Logic Age Calculation

*For any* approval date and current date, the calculated approval logic age in months SHALL equal the floor of the number of months between the two dates.

**Validates: Requirements 3.2**

### Property 7: All Rationales Render

*For any* list of confirmed rationales, the rendered cockpit SHALL contain exactly one card for each rationale in the list.

**Validates: Requirements 3.3, 3.4**

### Property 8: Rationale Card Contains Required Fields

*For any* rationale, the rendered card SHALL display the rationale's title, description, last reviewed date, and a status badge with value in {Fresh, Review Due, Stale}.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 9: Staleness Calculation Correctness

*For any* rationale with a last reviewed date:
- If days since review ≤ 30, status SHALL be "Fresh"
- If days since review is 31-90, status SHALL be "Review Due"  
- If days since review > 90, status SHALL be "Stale"

**Validates: Requirements 5.1, 5.2, 5.3, 4.5**

### Property 10: Review Action Updates State

*For any* rationale that is marked as reviewed, the `lastReviewedAt` timestamp SHALL be updated to within 1 second of the action time, AND the status SHALL be recalculated based on the new timestamp (resulting in "Fresh" status).

**Validates: Requirements 5.4, 9.2, 9.3**

### Property 11: Context Panel Signal Count

*For any* rationale displayed in the cockpit, the context panel SHALL display between 1 and 2 contextual signals (inclusive).

**Validates: Requirements 6.1**

### Property 12: Contextual Signal Structure

*For any* contextual signal, it SHALL contain a non-empty description string and an `updatedAt` timestamp.

**Validates: Requirements 6.2**

### Property 13: Summary Generation Produces Output

*For any* invocation of the summary generation function, the result SHALL be a non-empty string.

**Validates: Requirements 7.2**

### Property 14: Summary Contains Correct Rationales

*For any* generated review summary and the source rationale list, the summary SHALL include all and only rationales with status "Review Due" or "Stale", and for each included rationale, the summary SHALL include the number of days since last review.

**Validates: Requirements 7.3, 7.4**

### Property 15: Demo Data Populates Cockpit

*For any* invocation of the "Load Demo Data" function, the resulting state SHALL contain a non-null loan with valid ID and approval date, AND at least one rationale.

**Validates: Requirements 8.2**

### Property 16: Demo Data Determinism

*For any* two consecutive invocations of "Load Demo Data" without intervening state changes, the resulting loan and rationale data SHALL be identical.

**Validates: Requirements 8.5**

## Error Handling

### Import Errors
- **Invalid file type**: Display inline validation message "Please import a PDF file"
- **PDF parsing failure**: Display "Unable to read Credit Memo. Please ensure the file is not corrupted."
- **Empty extraction**: Display "No approval rationales could be identified in this document."

### State Errors
- **localStorage unavailable**: Fall back to in-memory state with warning "Data will not persist after page refresh"
- **Corrupted stored data**: Clear localStorage and display "Previous session data was corrupted. Starting fresh."

Demo persistence only. No sensitive or real loan data is stored.

### LLM Extraction Errors
- **API timeout**: Display "Extraction is taking longer than expected. Please try again."
- **API failure**: Display "Unable to extract rationales. You may edit extracted rationales or re-run extraction."

### User Input Validation
- **Empty rationale title**: Prevent confirmation, highlight field
- **Title exceeds 100 characters**: Truncate with warning
- **Description exceeds 250 characters**: Truncate with warning

## Testing Strategy

### Unit Tests
Unit tests verify specific examples and edge cases:

1. **Staleness threshold boundaries**: Test exactly 30, 31, 90, 91 days
2. **Age calculation edge cases**: Same month, year boundary, leap years
3. **File validation**: Various file extensions, empty files, corrupted PDFs
4. **Summary generation**: Empty rationale list, all Fresh, mixed statuses

### Property-Based Tests
Property tests verify universal properties across generated inputs:

1. **Staleness calculation**: Generate random dates, verify correct status assignment
2. **Edit consistency**: Generate random edit operations, verify state updates
3. **Summary correctness**: Generate random rationale lists, verify summary content
4. **Demo determinism**: Multiple loads, verify identical output

### Testing Framework
- **Unit tests**: Vitest
- **Property tests**: fast-check (minimum 100 iterations per property)
- **Component tests**: React Testing Library

### Test Annotation Format
Each property test must include:
```typescript
// Feature: approval-rationale-tracker, Property 9: Staleness Calculation Correctness
// Validates: Requirements 5.1, 5.2, 5.3, 4.5
```

## Scope Creep Identification and Rejection

The following features are explicitly OUT OF SCOPE and must be rejected:

| Proposed Feature | Rejection Reason |
|-----------------|------------------|
| Email notifications when rationales become stale | Violates "no alerts/notifications" constraint |
| Dashboard showing portfolio-wide staleness metrics | Violates "one screen only" constraint |
| Risk score display alongside rationales | Violates "no risk scoring" constraint |
| Borrower contact information | Violates "no borrower data" constraint |
| Automated review scheduling | Violates "no automated decisions" constraint |
| Chat interface for querying rationales | Violates "no chatbot" constraint |
| Document comparison/diff view | Violates "no document AI" constraint |
| Export to Excel/CSV | Out of scope for hackathon prototype |
| User authentication/roles | Out of scope for hackathon prototype |
| Multi-loan portfolio view | Violates "one screen only" constraint |
| Historical review audit log | Out of scope for hackathon prototype |
| Integration with external data sources | Out of scope (demo uses mock signals) |
