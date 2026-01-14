# Approval Rationale Tracker (ART)

**Approval Rationale Tracker (ART)** is a governance and decision-memory system for commercial loan portfolios.

While banks continuously monitor loan performance, the original reasons a loan was approved are typically frozen in PDFs and never revisited — even as conditions change.

Instead of scoring risk or predicting defaults, ART keeps the *original approval logic* visible, time-aware, and reviewable — enabling banks to govern *why* a loan was approved, not just *how it performs*.

---

## 🧠 The Problem

In commercial lending:

- Loan approvals rely heavily on **qualitative reasoning** (market position, management strength, regulatory stability).
- This reasoning lives in **credit memos (PDFs)** and is rarely revisited.
- As a result, assumptions quietly become outdated without triggering traditional Early Warning Systems — creating a blind spot in governance.
- When issues emerge, institutions face **audit gaps, governance risk, and regulatory scrutiny**.

There is currently **no systematic way to track whether approval logic itself is still valid**.

---

## 💡 The Solution

ART introduces **time-aware governance for qualitative loan approval logic**.
It is not analytics software — it is governance infrastructure.

It transforms static approval rationales into **structured, reviewable objects** that:

- Remain visible throughout the loan lifecycle
- Age over time if not re-verified by a human
- Support annual reviews, audits, and risk governance
- Require *no automated decision-making*

ART augments — not replaces — professional judgment.

---

## 🔍 What ART Does (and Why It’s Different)

### 1. Import Approval Reasoning (Demo Proxy)
- Ingests Credit Memo PDFs (demo proxy for LOS integration)
- Uses LLMs to extract approval rationales
- Requires **human confirmation** before anything becomes a record

### 2. Approval Logic Cockpit
- Single-screen, enterprise-grade interface
- Displays all approval rationales for a loan at a glance
- Shows how old each piece of logic is

### 3. Time-Based Staleness Tracking
Each rationale is classified purely by time since last human review — not risk models or predictions:
- **Fresh** – reviewed within 30 days  
- **Review Due** – 31–90 days  
- **Stale** – over 90 days  

> No risk scores. No alerts. No predictions.

### 4. Passive Contextual Signals
- Each rationale displays 1–2 **read-only contextual signals**
- Signals provide awareness, not interpretation
- No scoring, recommendations, or automation

### 5. Annual Review Summary
- Generates a plain-text summary of rationales needing review
- Designed for governance, audit, and compliance workflows

---

## 🚫 What ART Explicitly Does NOT Do

ART intentionally avoids automation where human judgment is required:
- Credit scoring or default prediction
- Automated alerts or notifications
- Lending decisions or recommendations
- Borrower-facing features
- Chatbot or conversational interfaces
- Portfolio-wide dashboards

This keeps ART compliant, auditable, and regulator-friendly.

---

## 🎯 Target Users

- Commercial bank **Credit Officers**
- **Portfolio Managers**
- **Risk Governance & Audit Teams**
- Institutions managing **low-volume, high-value commercial loans**

---

## 🏦 Why This Matters

ART solves a real governance gap in modern lending:

- Prevents “zombie logic” — outdated approval assumptions that persist unnoticed inside active loan books
- Improves audit readiness and regulatory defensibility
- Aligns qualitative judgment with lifecycle governance
- Scales across portfolios without increasing manual workload

This is infrastructure software — quiet, unsexy, and essential.

---

## 🧩 Technology Stack

- **Frontend**: React + TypeScript  
- **Styling**: Tailwind CSS (enterprise-neutral design)  
- **PDF Processing**: pdf.js  
- **LLM Extraction**: OpenAI API (with mock fallback)  
- **State Management**: React Context + Reducer  
- **Persistence**: localStorage (demo only)  
- **Build Tooling**: Vite  

---

## 🧪 Demo Notes

- Includes deterministic mock data for judges
- Demo flow:
  1. Load demo data or import a sample Credit Memo
  2. Review approval rationales
  3. Mark rationales as reviewed
  4. Generate annual review summary

---

## 🔐 Data & Privacy

- No real borrower data
- No authentication or backend
- Demo-only persistence
- No external system integrations

---

## 📈 Commercial Vision (Post-Hackathon)

In production, ART would integrate with:
- Loan Origination Systems (LOS)
- Credit workflow platforms
- Governance and audit tooling

Future extensions could include:
- Configurable review thresholds
- Portfolio-level governance views
- Regulatory reporting support

---

## 🏁 Summary

Approval Rationale Tracker reframes loan monitoring:

> From **“Is the borrower performing?”**  
> to **“Is our original reasoning still valid?”**

ART brings accountability, memory, and governance to the most human — and least governed — part of lending: judgment itself.
