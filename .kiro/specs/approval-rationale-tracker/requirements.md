# Requirements Document

## Introduction

Approval Rationale Tracker (ART) is a governance, auditability, and decision-memory system for loan portfolios. ART solves the problem of loan approval reasoning being frozen in PDFs and never revisited as conditions change. The system keeps approval logic visible, time-aware, and reviewable for commercial bank credit officers, portfolio managers, and risk governance/audit teams.

This is a desktop web prototype for a fintech hackathon demonstrating enterprise-grade governance tooling.

## Design Principles

- Enterprise-grade, conservative visual language
- Calm, neutral color palette (no gradients or playful accents)
- High information density with clear hierarchy
- Status communicated via text and subtle indicators, not alarms
- Interface should feel suitable for internal bank use, not consumer software

## Glossary

- **ART**: Approval Rationale Tracker - the system being specified
- **Rationale**: A structured, time-aware object representing a specific piece of approval logic extracted from a Credit Memo
- **Credit_Memo**: A PDF document containing loan approval reasoning (demo proxy for LOS integration)
- **Staleness**: The time elapsed since a rationale was last reviewed by a human
- **Cockpit**: The single-screen UI displaying all loan approval logic
- **Contextual_Signal**: A passive, read-only data point relevant to a rationale (timestamped, no scoring)
- **LOS**: Loan Origination System (production integration target, not in scope for demo)
- **Review_Summary**: A text output highlighting rationales needing re-verification

## Absolute Constraints

ART SHALL NOT:
- Calculate credit risk scores
- Predict default probability
- Automate lending decisions
- Trigger alerts or notifications
- Recommend financial actions
- Replace human judgment
- Act as a borrower-facing tool
- Resemble a chatbot interface
- Resemble a document AI / RAG application

## Requirements

### Requirement 1: Import Credit Memo (Demo Proxy)

**User Story:** As a credit officer, I want to import a Credit Memo (demo proxy for LOS integration), so that I can extract approval rationales without manual data entry.

#### Acceptance Criteria

1. WHEN a user imports a Credit Memo PDF file, THE ART SHALL accept the file and initiate extraction processing
2. WHEN a non-PDF file is imported, THE ART SHALL reject the import and display a validation message
3. WHEN extraction processing completes, THE ART SHALL display extracted rationales for human confirmation
4. THE Import_UI SHALL appear visually minimal and secondary to the main cockpit interface
5. WHEN no Credit Memo has been imported, THE ART SHALL allow users to proceed with mock demonstration data

### Requirement 2: Rationale Extraction and Confirmation

**User Story:** As a credit officer, I want to review and confirm LLM-extracted rationales, so that I can ensure accuracy before they become structured records.

#### Acceptance Criteria

1. WHEN extraction completes, THE ART SHALL display each extracted rationale with title and description
2. WHEN a user edits a rationale title or description, THE ART SHALL update the rationale with the edited content
3. WHEN a user confirms a rationale, THE ART SHALL convert it to a structured, time-aware object with current timestamp
4. WHEN a user rejects a rationale, THE ART SHALL remove it from the pending list
5. THE Rationale_Editor SHALL allow editing of title (short text) and description (1-2 lines)

### Requirement 3: Loan Approval Logic Cockpit Display

**User Story:** As a portfolio manager, I want to view all approval rationales for a loan on a single screen, so that I can understand the complete approval logic at a glance.

#### Acceptance Criteria

1. THE Cockpit SHALL display loan identification information in the top section including Loan_ID and Approval_Date
2. THE Cockpit SHALL display "Approval Logic Age: X months" calculated from the approval date
3. THE Cockpit SHALL display a list of Approval_Rationale_Cards in the main section
4. WHEN the cockpit loads, THE ART SHALL render all confirmed rationales as cards
5. THE Cockpit SHALL be the only screen in the application with no tabs, dashboards, settings, or side navigation

### Requirement 4: Approval Rationale Card Structure

**User Story:** As a risk governance officer, I want each rationale displayed as a structured card, so that I can quickly scan approval logic and review status.

#### Acceptance Criteria

1. THE Rationale_Card SHALL display a rationale title (short text)
2. THE Rationale_Card SHALL display a rationale description (1-2 lines)
3. THE Rationale_Card SHALL display the last reviewed date
4. THE Rationale_Card SHALL display a status badge with one of three values: Fresh, Review_Due, or Stale
5. THE Status_Badge SHALL be determined solely by time elapsed since last human review

### Requirement 5: Staleness Calculation

**User Story:** As an audit team member, I want rationale staleness calculated automatically based on time, so that I can identify reasoning that needs re-verification.

#### Acceptance Criteria

1. WHEN a rationale has been reviewed within 30 days, THE ART SHALL assign Fresh status
2. WHEN a rationale has not been reviewed for 31-90 days, THE ART SHALL assign Review_Due status
3. WHEN a rationale has not been reviewed for more than 90 days, THE ART SHALL assign Stale status
4. WHEN a user marks a rationale as reviewed, THE ART SHALL update the last reviewed date to current timestamp
5. THE Staleness_Calculator SHALL use only time and human review events as inputs (no risk scoring)

Note: Time thresholds are configurable in production environments. Fixed thresholds are used in this prototype for demonstration clarity.

### Requirement 6: Contextual Signal Display

**User Story:** As a credit officer, I want to see passive contextual signals for each rationale, so that I have relevant context without automated interpretation.

#### Acceptance Criteria

1. THE Context_Panel SHALL display 1-2 passive signals per rationale
2. THE Contextual_Signal SHALL include a timestamp indicating when the signal was updated
3. THE Contextual_Signal SHALL be read-only with no user interaction
4. THE Contextual_Signal SHALL contain no scoring, interpretation, or recommendations
5. WHEN displaying signals, THE ART SHALL use neutral language (e.g., "Relevant signal updated 3 weeks ago")

Note: Contextual signals shown are illustrative examples and do not represent comprehensive monitoring coverage.

### Requirement 7: Annual Review Summary Generation

**User Story:** As a portfolio manager, I want to generate a text summary of rationales needing review, so that I can prepare for annual governance reviews.

#### Acceptance Criteria

1. THE Cockpit SHALL display exactly one action button labeled "Generate Annual Review Summary"
2. WHEN the button is clicked, THE ART SHALL generate a text summary
3. THE Review_Summary SHALL list rationales with Review_Due or Stale status
4. THE Review_Summary SHALL include how long each listed rationale has been without review
5. THE Review_Summary SHALL be plain text with no charts, scores, or recommendations

### Requirement 8: Mock Data Support

**User Story:** As a hackathon judge, I want to see the system with realistic mock data, so that I can understand the value proposition within 60 seconds.

#### Acceptance Criteria

1. WHEN the application loads, THE ART SHALL offer a "Load Demo Data" option
2. WHEN demo data is loaded, THE ART SHALL populate the cockpit with realistic loan and rationale data
3. THE Mock_Data SHALL include rationales in all three status states (Fresh, Review_Due, Stale)
4. THE Mock_Data SHALL include sample contextual signals with varied timestamps
5. THE Demo_Experience SHALL be deterministic and reproducible

### Requirement 9: Human Review Action

**User Story:** As a credit officer, I want to mark a rationale as reviewed, so that the system records my verification and updates the staleness status.

A review indicates human verification that the approval rationale remains valid under current conditions.

#### Acceptance Criteria

1. THE Rationale_Card SHALL include a "Mark as Reviewed" action
2. WHEN a user clicks "Mark as Reviewed", THE ART SHALL update the last reviewed date to current timestamp
3. WHEN a user clicks "Mark as Reviewed", THE ART SHALL recalculate and update the status badge
4. THE Review_Action SHALL require no additional input beyond the click
5. WHEN a rationale is marked as reviewed, THE ART SHALL provide visual confirmation of the update

## Scope Exclusions (Explicitly Rejected)

The following are explicitly out of scope and must be rejected if proposed:

- Alert systems, email notifications, or push notifications
- Analytics dashboards or reporting charts
- ML explainability features
- Borrower-facing interfaces or borrower data display
- Multi-screen navigation, tabs, or settings pages
- Risk scoring or default prediction
- Automated decision-making or recommendations
- Chat interfaces or conversational UI patterns
- Document AI / RAG-style interfaces emphasizing extraction accuracy
-Integration with external systems (demo uses Credit Memo import as a proxy only)