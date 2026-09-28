
# SCOUTAI — FINAL WORK & BUILD GUIDE
## Locked Architecture, Product Strategy, OSS Reuse, Component Contracts, and Piece-by-Piece Implementation Method

**Document status:** FINAL WORK GUIDE  
**Architecture review status:** LOCK AFTER THIS DOCUMENT  
**Last architecture review:** Claude independent review + ChatGPT final evaluation  
**Build/implementation tool:** Cursor  
**Architecture, research, teaching, evaluation:** Adhithya + ChatGPT  
**Primary application:** Oracle APEX / Endless Aisle UAT  
**Initial known coverage:** 19 existing business flows  
**Build philosophy:** Full architecture now, incremental implementation forever  
**Core rule:** Never build the next major piece while the previous piece is not proven.

---

# 0. PURPOSE OF THIS DOCUMENT

This is the final working guide for ScoutAI.

After this document is accepted, there should be **no repeated architecture redesign loop**.

The architecture is considered locked. During implementation, architecture may change only when a real technical requirement exposes a material problem. Any such change requires a short Architecture Decision Record (ADR) and explicit approval by Adhithya. Normal implementation issues must be fixed inside the existing boundaries, not used as an excuse to redesign the platform.

This document is intentionally detailed.

It is the main operating contract for:

- the human builder
- ChatGPT as architecture/evaluation/teaching support
- Cursor as implementation/refinement agent
- future contributors
- future agents reading the project knowledge base

---

# 1. THE PRODUCT WE ARE BUILDING

## 1.1 One-sentence product definition

> **ScoutAI is an intelligent QA discovery and automation platform that continuously observes a real application, builds a structured understanding of its pages/states/interactions, discovers possible QA flows and scenarios, sends them for SME review, turns approved coverage into deterministic Playwright automation, executes tests in real time, produces evidence and reports, and repeats discovery to detect application changes and coverage gaps.**

## 1.2 What ScoutAI is NOT

ScoutAI is not primarily:

- a chatbot that clicks buttons
- a single autonomous browser agent
- a static set of 19 scripts
- a large multi-agent framework
- a vector database product
- a replacement for Playwright
- an LLM wrapper

The product's value is the **continuous QA knowledge loop**:

```text
APPLICATION
    ↓
DISCOVER
    ↓
UNDERSTAND
    ↓
PROPOSE
    ↓
SME APPROVE
    ↓
AUTOMATE
    ↓
EXECUTE
    ↓
REPORT
    ↓
RE-DISCOVER
    ↓
COMPARE
    ↓
UPDATE COVERAGE
```

---

# 2. THE PRODUCT REQUIREMENTS

The system must eventually support all of the following.

## 2.1 Discovery

The system must be able to:

- authenticate into the target application
- crawl reachable safe application areas
- discover pages
- discover UI states that may not have unique URLs
- discover navigation transitions
- discover interactive controls
- inspect forms
- inspect dialogs
- inspect tabs
- inspect reports/tables
- safely explore non-destructive interactions
- build an application/state map
- avoid duplicate states
- stop safely under configured budgets
- preserve evidence and observations

## 2.2 Intelligence

The system must be able to:

- interpret structured application observations
- identify likely business/user flows
- distinguish alternate entry paths
- propose useful test scenarios
- propose meaningful negative scenarios
- suggest expected outcomes as proposals
- identify coverage gaps
- explain application changes
- rank changes for SME attention
- attach provenance/confidence to AI-generated proposals

## 2.3 SME governance

The system must be able to:

- present proposed flows
- present proposed scenarios
- allow approve
- allow edit
- allow reject
- keep version history
- mark obsolete proposals
- request re-review when application state changes
- keep a clear audit trail

AI confidence is never a substitute for SME approval.

## 2.4 Automation

The system must:

- generate ordinary Playwright tests
- use reusable fixtures/helpers
- keep business steps readable
- inject runtime test data
- support screenshots
- support traces
- optionally support video
- produce a standard Playwright HTML report
- execute in headed mode locally when requested
- execute headless in CI when requested
- maintain reliable browser lifecycle

## 2.5 Realtime

The system must:

- show crawl progress
- show flow/scenario analysis progress
- show SME queue changes
- show test execution progress
- show evidence arrival
- show report completion
- survive browser/page refresh
- survive reconnect
- never duplicate a run because of reconnect/polling

## 2.6 Continuous / daily intelligence

The system must:

- run a daily crawl
- compare the new application map with the previous baseline
- detect structural changes
- detect contract changes
- ignore cosmetic noise by default
- detect approved flows affected by changes
- detect stale automation
- detect coverage gaps
- create grouped SME review items

---

# 3. CORE DESIGN PHILOSOPHY

## 3.1 Expanded architecture, clean implementation

The architecture is deliberately broad.

The implementation is deliberately incremental.

This means:

```text
ARCHITECTURE:
complete enough for the future

CODE:
only what the current piece requires
```

Do not confuse:

```text
simple architecture
```

with:

```text
limited functionality
```

A clean architecture may contain many components.

A bad architecture can contain very few files but put everything into one giant file.

## 3.2 The LLM is not the kernel

Use this rule everywhere:

```text
LLM
    = reason / interpret / infer / propose / generate / explain

DETERMINISTIC CODE
    = crawl / identify / fingerprint / deduplicate / enforce safety /
      execute / assert / diff / persist

SME
    = approve business meaning and expected outcomes
```

## 3.3 Open source first

Before writing a significant component:

1. check Playwright
2. check the OSS sources listed in this guide
3. inspect whether a proven implementation or pattern exists
4. reuse when the license and architecture permit
5. write only the missing glue/product-specific code

Priority:

```text
Official Playwright
    >
compatible OSS implementation
    >
small custom module
    >
new framework
```

## 3.4 Build for learning

The user is building this to understand the system.

Every piece must therefore answer:

- what is it?
- why is it needed?
- how does it work?
- why did we select this approach?
- what did OSS already provide?
- what are the inputs?
- what are the outputs?
- how do we verify it?
- what can go wrong?

---

# 4. FINAL ARCHITECTURE

## 4.1 Primary architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                         EXPERIENCE LAYER                               │
│                                                                        │
│                         Web UI / REST                                 │
│                    Scheduler trigger / future CLI                     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           CONTROL LAYER                               │
│                                                                        │
│                         RUN COORDINATOR                               │
│                                                                        │
│     Run State Machine │ HITL Gates │ Idempotency │ Cancellation       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         CAPABILITY LAYER                               │
│                                                                        │
│ Discovery │ Flow Inference │ Scenario Design │ Test Generation         │
│ Execution │ Diff           │ Reporting       │ Bounded Healing         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         PORTS / ADAPTERS                              │
│                                                                        │
│ Browser ↔ Playwright                                                  │
│ LLM     ↔ provider                                                     │
│ Store   ↔ SQLite                                                       │
│ Files   ↔ filesystem                                                   │
│ Clock   ↔ system/test clock                                           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DATA / ARTIFACTS                              │
│                                                                        │
│ SQLite: runs / events / states / pages / flows / scenarios             │
│ Files: snapshots / evidence / traces / reports / generated tests      │
└────────────────────────────────────────────────────────────────────────┘

Cross-cutting:
Event Log + Audit + Security/Redaction + LLM Audit/Cost
```

## 4.2 Domain packs sit beside the reusable core

```text
                       REUSABLE QA CORE
                              │
                ┌─────────────┴─────────────┐
                │                           │
             APEX PACK              ENDLESS AISLE PACK
                │                           │
       generic Oracle APEX             business-specific
       behavior/semantics              rules/test data
```

The core must never contain:

- SKU business rules
- Best Deal business meaning
- Customer Order rules
- Endless Aisle-specific business assumptions

---

# 5. LAYER DEFINITIONS

## 5.1 Experience Layer

Responsibilities:

- UI
- REST
- initial request handling
- reading run state
- subscribing to SSE
- user interaction

Must NOT:

- implement crawler logic
- implement business rules
- call SQLite directly
- call Playwright directly
- make LLM decisions

## 5.2 Control Layer — Run Coordinator

This is the only top-level coordinator.

Responsibilities:

- create run
- choose run kind
- enforce idempotency
- transition lifecycle state
- invoke capabilities
- enforce HITL gates
- handle cancellation
- handle crash semantics
- persist state
- trigger events
- link related runs

Must NOT:

- contain page locators
- contain business-specific QA logic
- contain LLM prompts
- directly query SQLite

## 5.3 Capability Layer

Plain, focused modules.

Examples:

```text
Crawler
FlowInference
ScenarioDesign
TestGeneration
Execution
Diff
Reporting
Healing
```

Capabilities should:

- be deterministic where possible
- use typed inputs/outputs
- depend on ports
- not depend on API/UI
- not instantiate infrastructure themselves
- remain independently testable

These remain plain modules. Do not create a skill registry.

## 5.4 Ports

Ports are the small true abstraction boundaries.

Initial real ports:

```text
Browser
LLM
Store
Files
Clock
```

A port defines what the capability needs.

Example:

```ts
interface Browser {
  createSession(...): Promise<...>;
  navigate(...): Promise<...>;
  snapshot(...): Promise<...>;
}
```

The capability should not care whether the browser implementation is Playwright.

## 5.5 Adapters

Adapters implement ports.

Initial adapters:

```text
PlaywrightBrowserAdapter
OpenAI/Anthropic/LocalLLMAdapter
SQLiteStoreAdapter
FilesystemArtifactAdapter
SystemClockAdapter
```

Adapters own infrastructure details.

## 5.6 Data / Artifact layer

Durable storage:

```text
SQLite
filesystem
```

SQLite stores structured state.

Filesystem stores large artifacts.

Do not store screenshots or large DOM dumps in SQLite.

---

# 6. DEPENDENCY RULES

Freeze these rules.

```text
Experience
    ↓
Control
    ↓
Capabilities
    ↓
Ports
    ↕
Adapters
    ↓
Infrastructure
```

Rules:

1. Experience contains no domain/business logic.
2. Control owns run-state transitions.
3. Capabilities never import the API/UI layer.
4. Capabilities never import concrete adapters.
5. Adapters implement ports.
6. Only the Store adapter touches SQLite.
7. Domain packs do not become dependencies of the reusable core.
8. Realtime transport does not become the source of truth.
9. Reconnect/retry/healing/scheduler all enter through the same Coordinator.
10. Model/schemas code must remain pure where possible.

## Mechanical enforcement

Do not leave dependency rules only in prose.

Use an import-boundary rule such as:

- dependency-cruiser
- ESLint import boundaries
- equivalent static check

There must be a test proving an illegal dependency is rejected.

---

# 7. RUN MODEL

The old linear state model was corrected.

A run can mean different jobs.

## 7.1 Run kinds

```text
DISCOVERY
EXECUTION
DAILY
```

### DISCOVERY

```text
create
→ crawl
→ analyze
→ propose
→ done
```

### EXECUTION

```text
create
→ prepare
→ generate/use approved tests
→ execute
→ report
→ done
```

### DAILY

```text
create
→ discovery
→ diff
→ analyze meaningful changes
→ update SME review queue
→ done
```

Approval is NOT a long-running run state.

Approval belongs to proposals.

## 7.2 Run states

Use a small common state model:

```text
CREATED
RUNNING
DONE
FAILED
CANCELLED
INTERRUPTED
BLOCKED
```

Current phase is stored separately.

Example:

```text
state = RUNNING
phase = CRAWLING
```

This avoids mixing lifecycle state with application/business phases.

## 7.3 Terminal states

```text
DONE
FAILED
CANCELLED
INTERRUPTED
BLOCKED
```

`BLOCKED` means the operation did not start due to an unmet precondition, such as:

- forbidden environment
- missing safety policy
- authentication unavailable
- required input missing

## 7.4 Cancellation

Cancellation is cooperative:

```text
Coordinator marks cancel requested
        ↓
Capabilities check between safe boundaries
        ↓
operation stops
        ↓
browser closes in finally
        ↓
state becomes CANCELLED
```

---

# 8. CRASH RECOVERY

## Discovery

Safe to resume.

Persist:

```text
frontier queue
visited/state index
crawl run state
```

On restart:

```text
new browser/login
resume persisted frontier
```

## Execution

Do NOT auto-resume side-effecting test execution.

On process crash:

```text
EXECUTION RUN
    ↓
INTERRUPTED
```

A new attempt is a new run linked to the old one.

This avoids accidental duplicate orders or other side effects.

---

# 9. IDEMPOTENCY

Two distinct guarantees:

## Same key

```text
same idempotency key
      ↓
same run
```

## One active run per application and run kind

Default:

```text
(application, kind)
```

has at most one active run.

A second request returns the existing run ID rather than creating a second execution.

Scheduler example:

```text
daily:{application}:{date}
```

Scheduler must use the same Coordinator entry point as manual runs.

Healing is part of the same run and must not create a new run.

---

# 10. EVENT MODEL

State and event history are different.

## State answers:

> What is the run doing now?

## Event log answers:

> What happened?

Example event:

```json
{
  "run_id": "run_001",
  "seq": 27,
  "type": "crawl.page.completed",
  "payload_version": 1,
  "payload": {},
  "created_at": "..."
}
```

Rules:

- `seq` monotonically increases per run
- event is append-only
- state transition + event write occur in the same SQLite transaction
- notify realtime subscribers only after commit
- event payloads must be redacted
- event payloads should not contain raw secrets or unnecessary page content

---

# 11. REALTIME ARCHITECTURE

Use SSE initially.

The flow:

```text
UI initial GET
     ↓
current run snapshot
     ↓
latest seq
     ↓
SSE subscription with Last-Event-ID
     ↓
replay missed events
     ↓
live events
```

This prevents a common race:

```text
snapshot arrives
event happens
client subscribes too late
event lost
```

The event log makes replay possible.

The UI must never maintain a separate authoritative in-memory copy of run state.

---

# 12. DATA STORAGE

## 12.1 SQLite

Use SQLite for V1.

Recommended settings:

- WAL mode
- busy timeout
- one logical writer path
- explicit transactions

## 12.2 Logical entities

Minimum:

```text
applications
projects
runs
events
pages
states
elements
interactions
flows
scenarios
approvals
tests
test_runs
evidence
```

## 12.3 Files

Use filesystem artifacts for:

```text
crawl snapshots
screenshots
traces
HTML reports
JSON reports
generated specs
debug artifacts
```

---

# 13. CORE DATA MODEL

## 13.1 Page

Concept:

```text
page observation
```

Fields can include:

```text
page_id
state_id
url
normalized_url
title
apex_page_id
state_kind
timestamp
snapshot_artifact
shape_hash
```

## 13.2 State

A state is a meaningful UI state, not merely a URL.

```text
state_id
shape_hash
state_kind
page_id
domain-pack metadata
```

---

# 14. TWO-LEVEL STATE IDENTITY

This is one of the most important architecture decisions.

Do NOT use one fingerprint for everything.

## 14.1 `state_id` — identity

Used for:

- deduplication
- graph nodes
- flow linkage
- crawl coverage

Composition concept:

```text
normalized URL
+
APEX page ID
+
state kind
+
region/landmark skeleton
```

`state_kind`:

```text
page
dialog
tab
```

## 14.2 `shape_hash` — detail

Used for:

- structural change detection
- contract changes
- stale automation detection

Based on an interactive-element digest.

Use:

```text
role
accessible name
landmark/tree position
stable structure
```

Do NOT include:

```text
table rows
input values
session IDs
counts
volatile data
```

For interactive reports, prefer column headers/structure over row data.

## 14.3 APEX settle hook

Fingerprint only after the state has settled.

Domain pack supplies:

```text
waitForSettled()
```

Never fingerprint in the middle of an APEX partial-page refresh.

---

# 15. TWO DIFFERENT ELEMENT IDENTIFIERS

Do not mix these.

## `element_ref`

Snapshot-local.

Used only for:

- LLM grounding
- one snapshot
- current interaction proposal

Example:

```text
snapshot-017 / element-42
```

It can change every crawl.

## `element_key`

Stable semantic identity.

Concept:

```text
state_id
+
role
+
accessible name
+
landmark path
+
ordinal for ties
```

Used by:

- flows
- scenarios
- tests
- diff
- automation linkage

This is the identity that should survive across re-crawls where the underlying UI element remains equivalent.

---

# 16. DOMAIN PACK CONTRACT

This is a real interface, not a vague "hooks" concept.

Initial typed contract:

```ts
interface DomainPack {
  normalizeUrl(url: URL): URL;
  extractPageId(page: Page): Promise<string | undefined>;
  classifyStateKind(context: StateContext): Promise<StateKind>;
  waitForSettled(page: Page): Promise<void>;
  volatileRegions(context: StateContext): string[];
  safeActionOverrides(context: ActionContext): SafeActionOverride[];
  glossary(): Record<string, string>;
}
```

Provide a default no-op/web pack.

## APEX pack

Implements:

```text
session URL normalization
APEX page-ID extraction
dialog/tab recognition
region recognition
partial refresh waiting
APEX-specific volatility
APEX-safe action overrides
APEX glossary
```

## Endless Aisle pack

Provides:

```text
SKU terminology
business vocabulary
business rules
test data
application-specific safe-action exceptions
```

Core never imports these packs directly as hard-coded dependencies.

They are injected/registered through configuration/contract.

---

# 17. SAFE DISCOVERY

Safety is not one denylist.

Use multiple defenses.

## 17.1 Environment protection

Preferred:

```text
read-only account
or
tenant/environment where side effects are impossible
```

This is the strongest control.

## 17.2 Deterministic action classifier

Default-deny when uncertain.

Danger patterns include:

```text
delete
remove
place order
submit order
pay
confirm irreversible action
save destructive update
```

Also inspect:

- accessible name
- action semantics
- form submission
- known dangerous routes/actions

## 17.3 Discovery interaction whitelist

During automatic discovery, prefer:

```text
navigation
tabs
expanders
search/filter controls when non-destructive
dialogs that can be safely closed
```

Do NOT initially:

- fill business forms
- type arbitrary values
- submit orders
- save changes
- trigger irreversible actions

For dialogs:

```text
Cancel
Escape
safe close
```

Never:

```text
Save
Confirm
Submit
```

without explicit allowlisting.

## 17.4 APEX request-level guard

If feasible, investigate a small `wwv_flow`/request-level protection spike.

Do NOT blanket-block POST because APEX can use POST for partial-refresh/read-like behavior as well as writes.

The read-only account remains the primary defense.

---

# 18. TEST DATA / ENVIRONMENT STRATEGY

This must be decided before order-producing flows.

Questions:

```text
Which account?
Which tenant?
Can data be reset?
Can a run use unique IDs?
How is cleanup performed?
What happens if cleanup fails?
```

For flows that create orders:

```text
test data factory
+
cleanup/rollback strategy
+
safe environment
```

This is not a later cosmetic detail.

A technically perfect automation suite can still be unusable if test data is uncontrolled.

---

# 19. DISCOVERY ENGINE

## 19.1 Discovery pipeline

```text
Seed URL
   ↓
Authenticate
   ↓
Create discovery browser/context
   ↓
Wait for settled state
   ↓
Capture accessibility tree
   ↓
Capture limited DOM digest
   ↓
Assign element_ref
   ↓
Compute state_id
   ↓
Compute shape_hash
   ↓
Discover links
   ↓
Discover safe interactions
   ↓
Record transitions
   ↓
Add new states to frontier
   ↓
Repeat
```

## 19.2 BFS

Use BFS for page-level traversal.

It is useful because:

- predictable
- easy to reason about
- coverage-friendly
- easy to bound

But BFS alone is insufficient for APEX.

## 19.3 Interaction exploration

Within a state:

Priority:

```text
1. navigation
2. tabs
3. filters/search
4. dialogs
5. expanders
6. other safe non-destructive controls
```

Avoid form entry and destructive actions during general discovery.

---

# 20. STATE-EXPLOSION CONTROL

Required controls:

```text
max_states
max_pages
max_depth
max_interactions_per_page
max_dialog_depth
wall_clock_limit
no_new_state_stop_rule
```

Stop when:

```text
frontier empty
OR
budget exhausted
OR
no new state after N safe interactions
```

The product must report why the crawl stopped.

---

# 21. CRAWL COVERAGE LANGUAGE

Never claim:

> "complete crawl"

as an absolute statement.

Report:

```text
states discovered
pages discovered
edges discovered
interactions attempted
interactions skipped by safety
excluded paths
budget exhausted?
time limit reached?
blocked state count
```

A crawl is complete relative to its declared safety/coverage envelope.

---

# 22. SNAPSHOT STRATEGY

For LLM input:

```text
accessibility tree
+
limited normalized DOM digest
```

Do not send raw entire DOM by default.

Raw DOM may be stored as debug artifact, but the LLM input should be smaller and more stable.

Benefits:

- lower token usage
- clearer semantic structure
- better grounding
- easier reproducibility
- less privacy exposure

---

# 23. LLM GROUNDING

The LLM may only refer to `element_ref` values found in the exact snapshot provided.

Example:

```json
{
  "action": "click",
  "element_ref": "snap_12:el_7"
}
```

The system validates:

```text
Does element_ref exist in snapshot?
   ↓
YES → accept
NO  → reject
     ↓
     retry once
     ↓
     still invalid → proposal flagged
```

The LLM proposes meaning.

The deterministic generator translates the known reference to a locator/action.

This is deliberately much smaller than a giant custom hallucination validator.

---

# 24. AI RESPONSIBILITY MATRIX

| AI/LLM responsibility | Deterministic responsibility |
|---|---|
| Name/group observed pages | Crawl traversal |
| Infer likely flow structure | State identity |
| Propose scenarios | Safety classification |
| Propose negative cases | Element identity |
| Explain changes | Change computation |
| Rank meaningful changes | Deduplication |
| Draft expected outcomes | Test execution |
| Explain coverage gaps | Pass/fail assertions |
| Suggest repair | Persistence |
| Summarize evidence | Run state |

---

# 25. EXPECTED OUTCOME GOVERNANCE

Expected outcomes are a major false-pass risk.

The LLM can propose:

```text
"matching product should be displayed"
```

But a business-critical statement such as:

```text
"order total must equal X"
```

must come from:

- approved requirement
- trusted project knowledge
- SME-approved scenario

Model inference alone is not authoritative.

---

# 26. PROVENANCE AND CONFIDENCE

Every important proposal should distinguish provenance.

Example:

```text
OBSERVED
TRUSTED_REQUIREMENT
SME_DERIVED
LLM_INFERRED
```

Confidence can be:

```text
HIGH
MEDIUM
LOW
```

The proposal should retain both.

Example:

```json
{
  "expectation": "Product result appears",
  "provenance": "OBSERVED",
  "confidence": "HIGH"
}
```

---

# 27. FLOW IDENTITY

Flow identity must survive daily re-crawls.

Never use:

```text
session URLs
volatile query strings
random DOM text
```

The identity should be based on stable concepts such as:

```text
application
domain
entry state
capability/intent
observed transition pattern
```

The exact algorithm can evolve, but the identity fields must be defined before schema-dependent implementation.

---

# 28. SCENARIO MODEL

A scenario should contain approximately:

```text
scenario_id
version
flow_id
type
steps
expected_outcomes
source_state_ids
source_element_keys
provenance
confidence
status
```

Scenario types can include:

```text
POSITIVE
NEGATIVE
BOUNDARY
ALTERNATE_PATH
REGRESSION
```

Do not generate useless combinatorial variants.

The goal is meaningful risk coverage.

---

# 29. PROPOSAL LIFECYCLE

Minimum:

```text
DRAFT
PENDING_REVIEW
APPROVED
REJECTED
SUPERSEDED
NEEDS_RE_REVIEW
DUPLICATE
```

Examples:

```text
page fingerprint changed
→ NEEDS_RE_REVIEW

business flow removed
→ SUPERSEDED

duplicate discovered
→ DUPLICATE
```

This prevents daily-crawl noise from flooding the SME.

---

# 30. SME WORKFLOW

Minimum useful UI:

```text
Proposal list
    ↓
Proposal detail
    ↓
Approve / Edit / Reject
    ↓
Versioned decision
    ↓
Approved coverage
```

The SME reviews:

- flow meaning
- path
- scenario usefulness
- expected result
- risk
- safety
- regression suitability

---

# 31. GENERATED PLAYWRIGHT TESTS

Generated tests are first-class source artifacts.

Structure:

```text
spec
fixtures
page helpers
flow helpers
```

Generated tests should be readable.

Example:

```ts
test("Item Search — valid SKU", async ({ page, sku }) => {
  await openItemSearch(page);
  await searchProduct(page, sku);
  await expectProductResult(page, sku);
});
```

Do not generate a giant test with raw selectors embedded everywhere.

---

# 32. GENERATED SPEC LIFECYCLE

Generated specs carry metadata such as:

```text
scenario_id@version
state_ids used by the scenario
```

Example header:

```ts
// scenario: scenario_123@4
// states: state_a, state_b, state_c
```

This supports stale automation detection.

Generated specs are regenerated from approved scenarios and should not be treated as handwritten source.

Human-owned reusable browser logic lives in:

```text
pages/
fixtures/
helpers/
```

---

# 33. PLAYWRIGHT LIFECYCLE

## Discovery

```text
one browser
one discovery context
one authenticated session
```

## Execution

For a sequential run:

```text
one run
one browser
one context
one login
selected flows
close once
```

Additional pages/tabs only when truly needed.

## Isolation

A shared context can be used for sequential flow demo/regression runs, but each flow must return to a known start state or otherwise isolate its effects.

Later CI parallelism can use:

```text
one context per worker
+
shared storageState
```

Do not implement that complexity until needed.

---

# 34. AUTHENTICATION

Use Playwright `storageState` where appropriate.

Responsibilities:

- login fixture
- session storage
- session-expiry detection
- re-login on safe discovery resume
- secure storage outside repository

Never commit:

```text
cookies
storageState
tokens
credentials
```

Authenticated artifacts must be treated as sensitive.

---

# 35. PLAYWRIGHT OFFICIAL CAPABILITIES

Playwright currently provides official Test Agents:

```text
Planner
Generator
Healer
```

The official docs describe a planner that explores an app and creates a Markdown test plan, a generator that converts the plan into Playwright tests, and a healer that executes failed tests and proposes/repairs issues. citeturn659202search0turn659202search4turn659202search5

Use these as strong reference/adoption candidates, but integrate them with our SME approval process instead of allowing their assumptions to become the architecture.

---

# 36. PLAYWRIGHT MCP

Microsoft's Playwright MCP exposes browser operations using structured accessibility snapshots and can be used from coding-agent clients. citeturn355930search4turn355930search0

Potential use:

```text
exploratory agent assistance
self-healing investigation
manual AI-assisted exploration
development/debugging
```

It is NOT automatically required for the core runtime.

Important security lesson:

Accessibility snapshots themselves can contain untrusted page text/instructions, so snapshot content sent to an LLM must be treated as untrusted input. citeturn355930search7

That reinforces our grounding and safety model.

---

# 37. OPEN-SOURCE REUSE MATRIX

## Tier A — Production core / direct adoption candidates

### Microsoft Playwright
https://github.com/microsoft/playwright

Use directly for:

- browser automation
- test runner
- fixtures
- assertions
- screenshots
- traces
- HTML report
- storageState
- official test agents
- optional MCP

Current Playwright source includes MIT-licensed components; specific files may carry Apache-2.0 headers, so record the adopted package/revision and its license metadata in `OSS_REUSE.md`. citeturn503479search0turn503479search7

### Sorify
https://github.com/rakutentech/sorify

Use/reference for:

- browser exploration
- DOM analysis
- selector observation
- crawl-to-test concepts
- scheduling ideas
- operational UX

Do NOT import the entire platform.

### AI QA Framework
https://github.com/brentkastner/ai-qa-framework

Use/reference for:

```text
crawl → plan → execute → report
```

and coverage/recovery ideas.

### Autospec
https://github.com/zachblume/autospec

Use/reference for:

- compact TypeScript organization
- planner/executor/report separation
- accessibility-oriented planning
- generated Playwright structure

---

## Tier B — Strong architecture reference

### AutonomousQA Agent
https://github.com/iklymchuk/autonomous-qa-agent

Its current repository describes:

```text
BFS Playwright crawler
DOM snapshots
AI flow inference
dynamic Playwright generation
execution
traces
accessibility auditing
visual diff
severity classification
HTML + JSON reporting
```

This makes it highly relevant to our discovery architecture. citeturn659202search1

Use/reference:

- BFS discovery
- flow inference structure
- generator/executor separation
- report architecture

Verify license and chosen commit before copying source.

---

## Tier C — Reference only unless licensing permits

### jimmytoan/qa-agent
https://github.com/jimmytoan/qa-agent

Reference:

- realtime/SSE
- artifacts
- run history
- screenshot/GIF UX

License must be checked before reuse.

### vostride/agent-qa
https://github.com/vostride/agent-qa

Reference:

- execution memory
- caching
- healing
- diagnostics

License must be checked before reuse.

### browser-use/qa-use
https://github.com/browser-use/qa-use

Reference only.

The repository is archived/read-only as of September 25, 2026. citeturn659202search8

Do not make it the foundation.

### Browser Use
https://github.com/browser-use/browser-use

The main repository is MIT-licensed and active, but we do not need it for core execution because Playwright is already our deterministic backbone. citeturn659202search3

Optional later use:

```text
ambiguous exploratory task
```

not routine deterministic execution.

---

# 38. ADDITIONAL OSS REFERENCES

## Stagehand

https://github.com/browserbase/stagehand

Stagehand combines natural-language and code-based automation and exposes structured operations such as `act`, `extract`, and `observe`; its current repository states that it is MIT-licensed. citeturn355930search1turn355930search8

Use only as:

- semantic action reference
- structured extraction reference
- alternative design study

Do not replace Playwright with it.

---

# 39. ORACLE SKILLS

Repository:

https://github.com/oracle/skills

The repository is a curated collection of practical Oracle skills, including an APEX domain, and can be installed as a domain skill/plugin. citeturn659202search2

Use for:

```text
Oracle APEX terminology
APEX application concepts
APEX domain guidance
APEX-specific interpretation
```

Do not make ScoutAI runtime dependent on the repository.

---

# 40. OSS ATTRIBUTION

Create:

```text
docs/OSS_REUSE.md
```

Required columns:

```text
Repository
URL
Commit/Version
License
Component
Usage
Copied or Referenced
Modified?
ScoutAI Location
Notes
```

Rule:

> Reading a repository is not the same as having permission to copy its code.

Any license not verified at the adopted commit is reference-only.

---

# 41. 19 EXISTING FLOW STRATEGY

The existing 19 flows are a seed benchmark.

Use them early.

After schemas exist:

```text
import 19 known flows
```

Then measure:

```text
Did the crawler discover this flow?
Did it discover the expected states?
Did it discover alternate paths?
Did it find missing scenarios?
Did the fingerprint stay stable?
```

The 19 flows become an objective benchmark for discovery quality.

They are NOT the final set of flows.

---

# 42. FLOW PATH DISCIPLINE

Keep these as separate flows where the business journey differs:

```text
Best Deal → Product
Item Search → Product
All Products → Product
```

Do not collapse them into a generic Product Detail flow.

The difference matters for:

- business intent
- navigation
- state
- coverage
- regression value
- failure modes

---

# 43. EXAMPLE ENDLESS AISLE COVERAGE

Known examples include:

```text
BF-PRODUCT-003
Search Product

BF-HOME-010-01
Item Search

BF-PRODUCT-004
View Product

BF-BEST-DEAL-008
Best Deal

BF-BROWSE-009
Browse

BF-CAT-EAR-010
Category / Earrings

BF-PRODUCT-CATALOGUE-006
Product Catalogue
```

These existing IDs are reference/seed knowledge, not instructions to hard-code the product.

---

# 44. DAILY DIFF MODEL

Compare:

```text
Today state map
       vs
Previous baseline
```

Three tiers.

## Tier 1 — Structural

```text
state added
state removed
navigation edge added
navigation edge removed
control added
control removed
```

## Tier 2 — Contract

```text
form fields
required flags
validation messages
table/column structure
```

## Tier 3 — Cosmetic

```text
styling
position
minor text movement
```

Default:

```text
Tier 1 + Tier 2 → meaningful
Tier 3 → ignore
```

Only meaningful changes that affect:

- an approved flow
- an existing test
- or an important new reachable path

should reach the SME.

Group related changes.

---

# 45. COVERAGE GAP DETECTION

Coverage-gap detection should be deterministic.

Concept:

```text
discovered state/edge
        ↓
maps to approved scenario?
      /   \
    yes    no
    ↓       ↓
 covered    gap
```

The LLM can:

- explain the gap
- propose scenarios

The LLM should not be the source of structural coverage truth.

---

# 46. STALE AUTOMATION

If a state used by an approved test changes:

```text
approved test
    ↓
fingerprint mismatch
    ↓
SUSPECT
```

The test can be prioritized in the next run.

This allows the daily crawler to detect likely automation maintenance before the regression simply fails.

---

# 47. VOLATILE REGION SUPPORT

Some application areas are intentionally volatile:

```text
dates
counts
rotating banners
session-generated text
dynamic dashboard values
```

Provide a per-page or per-domain-pack volatile-region configuration.

These regions should not create repeated false-positive daily diffs.

---

# 48. REALTIME REPORTING UX

A run should visibly progress through events such as:

```text
Run created
Crawl started
Authentication complete
Page discovered
State fingerprint calculated
Interactions discovered
New state discovered
Flow candidate created
Scenario candidate created
SME review required
Scenario approved
Test generated
Test started
Test step
Evidence captured
Test completed
Report ready
```

Realtime is transport.

Durable state is storage.

---

# 49. TESTING STRATEGY

Every component gets three levels when relevant.

## Level 1 — Unit

Pure logic.

Examples:

```text
fingerprint generation
safe-action classification
flow identity
schema validation
diff
```

## Level 2 — Integration

Real interactions between components.

Examples:

```text
Store + coordinator
snapshot + fingerprint
coordinator + capability
LLM adapter + schema
```

## Level 3 — Real application

Endless Aisle UAT.

Examples:

```text
login
real crawl
real flow execution
real evidence
```

A feature is not considered proven merely because Level 1 passes.

---

# 50. FIXTURE / RECORDED SNAPSHOT STRATEGY

Live UAT is slow and sometimes unavailable.

Therefore create deterministic test inputs around discovery:

```text
redacted accessibility snapshots
redacted DOM digests
known state metadata
expected fingerprint
expected diff
```

Use them for:

- fingerprint tests
- diff tests
- LLM input tests
- state-explosion tests
- proposal tests
- regression tests

Real UAT remains necessary for end-to-end validation.

---

# 51. SECURITY BASELINE

Security is part of the foundation.

Requirements:

```text
.env not committed
storageState not committed
credentials never logged
tokens never placed in evidence
PII redaction
snapshot redaction
allowed origins
default-deny destructive actions
no arbitrary LLM shell execution
approval before promotion
auditable actions
```

Also decide before Piece 2.1:

```text
what UAT data can be sent to external LLMs?
what must be redacted?
which provider is allowed?
```

---

# 52. LLM OBSERVABILITY

Every LLM call should record:

```text
provider
model
prompt version
input hash
output
timestamp
run_id
purpose
token/cost metadata where available
```

Do not build a large observability platform.

A small structured audit record is enough initially.

Caching can use:

```text
input hash
+
prompt version
+
model
```

---

# 53. PERFORMANCE STRATEGY

Correctness first.

Then optimize:

- browser reuse
- state dedup
- snapshot normalization
- bounded concurrency
- LLM input reduction
- LLM caching
- incremental persistence
- diff filtering
- grouped proposals

Do not add:

```text
Redis
Kafka
distributed workers
Temporal
```

until measured load makes them necessary.

---

# 54. ARCHITECTURE EXTENSIBILITY

The architecture should eventually support:

```text
QA Agent
Developer Agent
Analyst Agent
Security Agent
Performance Agent
Data Agent
DevOps Agent
```

But the Base Agent is intentionally deferred.

Why:

- we currently have one real agent domain
- premature abstraction creates wrong contracts
- true reuse will become obvious when the second agent exists

For now:

```text
reusable QA core
+
ports/adapters
+
domain-pack seam
```

This is enough.

When the second real agent exists, inspect what is genuinely common, then extract Base Agent primitives.

---

# 55. WHY WE DO NOT BUILD A SKILL REGISTRY NOW

A registry sounds reusable but creates:

- more metadata
- more lifecycle
- more validation
- more discovery logic
- more indirection
- more failure modes

Until there are multiple real implementations, use plain modules.

Example:

```text
flow-inference.ts
```

not:

```text
SkillRegistry
SkillDescriptor
SkillLifecycle
SkillResolver
SkillLoader
```

unless actual requirements make those necessary.

---

# 56. WHY WE DO NOT BUILD CONNECTOR ECOSYSTEM NOW

Future integrations may include:

```text
Jira
Azure DevOps
GitHub
Oracle DB
Documents
Email
Slack
Teams
```

But none should become architectural dependencies until actually needed.

When a real integration appears:

```text
capability
   ↓
port
   ↓
adapter
```

Do not create five empty connector abstractions for hypothetical future integrations.

---

# 57. FINAL REPOSITORY SHAPE

Eventual structure:

```text
scoutai/
├── src/
│   ├── app/
│   │   ├── coordinator.ts
│   │   └── lifecycle.ts
│   │
│   ├── capabilities/
│   │   ├── discovery/
│   │   ├── flow-inference/
│   │   ├── scenario-design/
│   │   ├── test-generation/
│   │   ├── execution/
│   │   ├── diff/
│   │   ├── reporting/
│   │   └── healing/
│   │
│   ├── ports/
│   │   ├── browser.ts
│   │   ├── llm.ts
│   │   ├── store.ts
│   │   ├── files.ts
│   │   └── clock.ts
│   │
│   ├── adapters/
│   │   ├── playwright/
│   │   ├── llm/
│   │   ├── sqlite/
│   │   ├── filesystem/
│   │   └── clock/
│   │
│   ├── model/
│   │   ├── run.ts
│   │   ├── events.ts
│   │   ├── fingerprint.ts
│   │   ├── flows.ts
│   │   └── scenarios.ts
│   │
│   ├── domain-packs/
│   │   ├── web/
│   │   ├── apex/
│   │   └── endless-aisle/
│   │
│   ├── realtime/
│   └── api/
│
├── tests/
├── generated-tests/
├── reports/
├── crawl-artifacts/
├── data/
└── docs/
```

Do not create this entire tree initially.

Only create directories required by the current piece.

---

# 58. DOCUMENTATION STRUCTURE

Eventually:

```text
docs/
├── ARCHITECTURE.md
├── ARCHITECTURE_DECISIONS.md
├── OSS_REUSE.md
├── LEARNING_NOTES.md
├── PRODUCT_REQUIREMENTS.md
├── DOMAIN_PACKS.md
├── RUN_MODEL.md
├── EVENT_MODEL.md
├── FINGERPRINT_MODEL.md
├── DISCOVERY_MODEL.md
├── FLOW_MODEL.md
├── SCENARIO_MODEL.md
├── SME_APPROVAL.md
├── EXECUTION_MODEL.md
├── REALTIME_MODEL.md
├── DAILY_DISCOVERY.md
└── phases/
```

Create documents when they become relevant.

Do not generate empty documentation files for every future topic.

---

# 59. ARCHITECTURE DECISION RECORD POLICY

Create:

```text
docs/adr/
```

A change requires an ADR when it changes:

- layer boundaries
- ports
- run semantics
- state model
- persistence model
- domain-pack contract
- browser lifecycle
- LLM data policy
- approval model
- new external infrastructure

Normal bug fixing does not require an ADR.

---

# 60. BUILD METHOD — THE MOST IMPORTANT SECTION

The user explicitly wants:

> Build piece by piece, test every piece, master it, then move forward.

This is the working method.

## 60.1 Every piece follows this exact cycle

```text
1. STUDY
2. UNDERSTAND
3. COMPARE OSS
4. CHOOSE
5. IMPLEMENT
6. UNIT TEST
7. INTEGRATION TEST
8. REAL TEST
9. INSPECT ACTUAL OUTPUT
10. FIX
11. DOCUMENT
12. BASELINE
13. NEXT PIECE
```

## 60.2 Never skip the "actual output" stage

Examples:

If building Playwright:

```text
does Chrome actually open?
```

If building fingerprinting:

```text
does the same APEX state produce the same state_id?
```

If building diff:

```text
does a real structural change produce the expected diff?
```

If building SSE:

```text
does a reconnect receive missed events?
```

If building generation:

```text
does the generated test actually run?
```

---

# 61. PIECE ACCEPTANCE GATE

Every piece is complete only when:

```text
[ ] requirement understood
[ ] OSS investigated
[ ] architecture boundary respected
[ ] implementation focused
[ ] unit tests pass
[ ] integration tests pass if applicable
[ ] real browser test pass if applicable
[ ] actual output inspected
[ ] errors resolved
[ ] documentation updated
[ ] no unrelated changes
[ ] baseline/commit recorded
```

---

# 62. PHASE 0 — FOUNDATION

## P0.1 — Repository Foundation + Guardrails

### Goal

Create a clean project with enforcement of architectural boundaries.

### Implement

- Node LTS
- strict TypeScript
- Playwright Test
- fast unit runner
- schema library
- import-boundary rules
- basic docs
- secure `.gitignore`
- one trivial Playwright test
- one trivial unit test

### No implementation yet for

- crawler
- AI
- SQLite
- UI
- realtime
- test generation
- healing
- domain business logic

### Mandatory proof

Have a deliberately illegal import and prove the boundary checker rejects it.

---

# 63. P0.2 — Playwright Runtime Foundation

Merge earlier 0.2–0.6 into one piece.

Implement:

- headed mode
- browser launcher
- authentication
- `storageState`
- reusable fixture
- screenshot
- trace
- HTML report

### Proof

```text
launch
→ headed Chrome
→ authenticate
→ test
→ screenshot
→ trace
→ HTML report
```

This is the first real application proof.

---

# 64. P0.3 — Store + Run State + Event Model + Idempotency

Implement:

- Store port
- SQLite adapter
- migrations
- run entity
- run kinds
- current state
- phase
- terminal states
- idempotency key
- active-run check
- event model
- transactional state+event writes

### Test

No browser.

Use fake clock.

Prove:

```text
same key → same run
second active run → same run returned
state transition → event written atomically
invalid transition → rejected
```

---

# 65. P0.4 — Schemas + DomainPack

Implement pure schemas for:

```text
state_id
shape_hash
element_ref
element_key
flow
scenario
proposal
run
event
```

And implement the typed `DomainPack` contract.

No APEX behavior yet.

Provide no-op/web default pack.

---

# 66. P0.5 — Snapshot Capture + Redaction

Implement:

- accessibility tree snapshot
- limited DOM digest
- stable raw observation structure
- snapshot-local `element_ref`
- redaction
- no input values
- no data rows
- artifact persistence

Use recorded/redacted fixtures for deterministic tests.

### Proof

Capture a real Endless Aisle page and inspect:

```text
snapshot
redaction
element refs
artifact
```

---

# 67. PHASE 1 — DISCOVERY

## P1.1 — Seed URL

Configurable application seed.

## P1.2 — Authenticated discovery context

Separate discovery context from test execution context.

## P1.3 — Accessibility snapshot

Reliable snapshot pipeline.

## P1.4 — Limited DOM digest

Normalized structural data.

## P1.5 — `element_ref`

Snapshot-local identity.

## P1.6 — `state_id` + `shape_hash`

This must come before broad discovery.

## P1.7 — Link discovery

Same-origin only.

## P1.8 — Interactive element discovery

Record:

```text
role
accessible name
element_key
element_ref
```

## P1.9 — Safe-action classifier

Default deny.

## P1.10 — Read-only environment gate

Must be decided before real UAT interaction exploration.

## P1.11 — Single-state bounded interaction explorer

Only safe interactions.

## P1.12 — State/navigation graph

```text
state A
   ↓ action
state B
```

## P1.13 — BFS frontier

Use:

```text
frontier
visited/state index
budgets
```

## P1.14 — Deduplication/state-explosion controls

Fingerprint-driven.

## P1.15 — Persistence

Store application map.

## P1.16 — Crawl report

Report actual coverage and stop reason.

## P1.17 — Real Endless Aisle crawl

Only after all previous discovery pieces are stable.

---

# 68. PHASE 1 DISCOVERY ACCEPTANCE

A successful discovery demonstration should show:

```text
Endless Aisle
→ login
→ crawl starts
→ pages/states discovered
→ safe interactions explored
→ states deduplicated
→ application map persisted
→ crawl coverage report generated
```

The system must tell us:

```text
what it saw
what it skipped
why it skipped
why it stopped
```

---

# 69. PHASE 2 — FLOW / SCENARIO INTELLIGENCE

## P2.1 — LLM Port + Adapter

Implement only:

```text
LLM port
LLM provider adapter
```

Before using real UAT page content, finalize:

```text
provider
data policy
redaction
allowed content
```

## P2.2 — One snapshot → one flow proposal

No batch complexity.

## P2.3 — Grounded element references

The LLM can use only snapshot element refs.

## P2.4 — Scenario generation

Structured schema.

## P2.5 — Positive scenarios

## P2.6 — Meaningful negative scenarios

## P2.7 — Expected outcome proposals

## P2.8 — Schema and grounding validation

## P2.9 — Provenance + confidence

## P2.10 — Deduplication

## P2.11 — Stable flow identity

## P2.12 — 19-flow benchmark

Compare discovered proposals with existing known flows.

---

# 70. PHASE 2 ACCEPTANCE

Given:

```text
application map
+
trusted context
```

ScoutAI should produce:

```text
flow candidates
scenario candidates
expected outcome proposals
confidence
provenance
evidence links
```

No scenario is auto-approved.

---

# 71. PHASE 3 — SME

## P3.1 — Proposal list

## P3.2 — Proposal detail

## P3.3 — Approve

## P3.4 — Edit

## P3.5 — Reject

## P3.6 — Version

## P3.7 — Proposal lifecycle

Add:

```text
SUPERSEDED
NEEDS_RE_REVIEW
DUPLICATE
```

## P3.8 — Audit

---

# 72. PHASE 3 ACCEPTANCE

```text
AI proposal
→ SME edits/approves
→ approved version
→ audit record
```

The UI must clearly show:

```text
observed
inferred
trusted
approved
```

---

# 73. PHASE 4 — AUTOMATION

## P4.1 — Approved scenario → human-readable plan

## P4.2 — Plan → Playwright test

Time-box official Playwright Planner/Generator integration here instead of implementing a large custom planner.

Official Playwright currently documents a planner/generator/healer sequence. citeturn659202search0

## P4.3 — Fixtures

- auth
- base URL
- test data
- cleanup

## P4.4 — Page helpers

## P4.5 — Test data factory

This is the gate for order-producing flows.

## P4.6 — Runtime parameters

## P4.7 — Assertions

## P4.8 — Evidence/report linkage

---

# 74. PHASE 4 ACCEPTANCE

```text
approved scenario
→ generated Playwright spec
→ headed Chrome
→ execution
→ evidence
→ PASS/FAIL
→ HTML report
```

Generated code must be reviewable.

---

# 75. PHASE 5 — REALTIME

## P5.1

Event persistence already exists from P0.3.

## P5.2

SSE transport.

## P5.3

Initial snapshot + Last-Event-ID replay.

## P5.4

Live UI progress.

## P5.5

Reconnect.

## P5.6

Terminal-state handling.

### Proof

Disconnect the UI during a live run.

Reconnect.

Expected:

```text
same run
no duplicate browser
missed events replay
current state correct
```

---

# 76. PHASE 6 — DAILY INTELLIGENCE

## P6.1

Scheduler.

## P6.2

Baseline.

## P6.3

Structural diff.

## P6.4

Contract diff.

## P6.5

Approved-flow linkage.

## P6.6

Coverage gaps.

## P6.7

Stale automation.

## P6.8

SME review queue.

## P6.9

Volatile region handling.

---

# 77. PHASE 6 ACCEPTANCE

```text
Day 1
→ baseline

Day 2
→ crawl

compare

→ meaningful structural changes
→ meaningful contract changes
→ impacted approved flows
→ new coverage gaps
→ grouped SME proposals
```

Cosmetic noise must not flood the queue.

---

# 78. PHASE 7 — HEALING

Last.

## P7.1

Failure classification.

## P7.2

Current-state capture.

## P7.3

Locator recovery.

## P7.4

Bounded retry.

## P7.5

Official Playwright healer integration where appropriate.

## P7.6

Repair proposal.

## P7.7

SME review if behavior/expected outcome changes.

No infinite healing loop.

Healing must remain in the same run.

---

# 79. PHASE 8 — HARDENING

Only after the core product works.

Improve:

```text
security
performance
concurrency
deployment
caching
model routing
observability
scalability
fault tolerance
```

Only add new infrastructure when measured requirements justify it.

---

# 80. PIECE IMPLEMENTATION TEMPLATE

For every piece, the working notes should look like:

```text
PIECE:
P0.2

OBJECTIVE:
[one precise objective]

WHY:
[real product reason]

CURRENT ARCHITECTURE LAYER:
[exact layer]

REUSABLE COMPONENT:
[yes/no + reason]

OSS SOURCES:
[what was inspected]

OPTIONS COMPARED:
[A/B/C]

CHOSEN:
[one option]

IMPLEMENT:
[small scope]

DO NOT:
[scope boundaries]

TEST:
[commands]

EXPECTED:
[exact output]

ACTUAL:
[what happened]

FIXES:
[what changed]

LESSONS:
[what was learned]

DOCUMENTATION:
[files updated]

BASELINE:
[commit]

NEXT:
[next piece]
```

---

# 81. CURSOR RULES — FINAL

Cursor is the implementer/refiner.

It must:

1. read the KB and this guide
2. inspect current repository
3. inspect relevant OSS before rebuilding functionality
4. implement only the requested piece
5. create tests
6. run tests
7. run real browser validation when relevant
8. report actual output
9. update docs
10. stop

Cursor must NOT:

- implement future phases
- redesign architecture casually
- introduce new services without proof
- build generic abstractions prematurely
- create duplicate execution paths
- bypass the Coordinator
- access SQLite directly from capabilities
- put domain business logic in core
- claim browser success from unit tests alone
- silently change the locked contracts

---

# 82. CHATGPT + ADHITHYA ROLE

Architecture, research, teaching, evaluation, and final acceptance stay with:

```text
Adhithya + ChatGPT
```

Responsibilities:

- validate requirements
- research OSS
- compare choices
- inspect Cursor output
- debug failures
- assess trade-offs
- decide whether a piece is complete
- freeze baselines
- authorize architecture changes/ADRs

---

# 83. CLAUDE ROLE IS NOW COMPLETE

Claude was used as an independent architecture reviewer.

Its final review is incorporated into this guide.

No recurring architecture review cycle is planned.

Future architectural changes happen through:

```text
real requirement
OR
real measured bottleneck
OR
material defect
```

then:

```text
ADR
→ ChatGPT + Adhithya decision
→ Cursor implementation
```

---

# 84. ARCHITECTURE LOCK

The architecture is considered locked after this guide.

Frozen contracts:

## Contract 1
Layer + dependency direction.

## Contract 2
Run model:

```text
DISCOVERY
EXECUTION
DAILY
```

with common lifecycle:

```text
CREATED
RUNNING
DONE
FAILED
CANCELLED
INTERRUPTED
BLOCKED
```

## Contract 3
Event model:

```text
run_id
seq
type
payload_version
payload
timestamp
```

state transition + event in one transaction.

## Contract 4
Two-level fingerprint:

```text
state_id
shape_hash
```

plus:

```text
element_ref
element_key
```

## Contract 5
DomainPack:

```text
normalizeUrl
extractPageId
classifyStateKind
waitForSettled
volatileRegions
safeActionOverrides
glossary
```

## Contract 6
Crash recovery.

Discovery resumes.

Execution becomes interrupted and is not auto-resumed.

## Contract 7
Idempotency.

Same key returns same run.

Default one active run per application/kind.

## Contract 8
LLM grounding.

Snapshot-local refs only.

## Contract 9
SME controls authoritative business expectations.

## Contract 10
Playwright is primary browser execution/discovery engine.

---

# 85. GATED DECISIONS

These are not architecture redesign items. They are implementation decisions tied to specific phases.

## Before P1.10

Decide:

```text
read-only UAT account/tenant
```

Optionally evaluate a small request-level APEX safety guard.

## Before P1.13

Decide defaults:

```text
max_states
max_depth
max_time
max_interactions
no-new-state limit
```

## Before P2.1

Decide:

```text
LLM provider
allowed UAT data
redaction rules
prompt/version strategy
```

## Before P4.5

Decide:

```text
test accounts
data factory
reset/cleanup
```

These are operational gates, not architecture changes.

---

# 86. CURRENT OSS RESEARCH — WHAT EACH PROJECT IS FOR

## Playwright

Core:

```text
browser
test runner
assertions
artifacts
reports
fixtures
storageState
```

## Playwright Test Agents

Useful for:

```text
planning
generation
healing
```

but constrained by our approval/governance architecture.

## Playwright MCP

Useful for:

```text
LLM exploratory interaction
debugging
future long-running semantic exploration
```

but not mandatory for core deterministic runtime. Its structured accessibility snapshots are highly relevant to our observation model. citeturn355930search0turn355930search4

## Sorify

Useful for:

```text
explorer patterns
crawl-to-generation workflow
operational UX
```

## AutonomousQA Agent

Useful for:

```text
BFS
flow inference
generated Playwright
tracing
report architecture
```

## AI QA Framework

Useful for:

```text
simple crawl/plan/execute/report pipeline
coverage concepts
```

## Autospec

Useful for:

```text
compact TypeScript architecture
semantic snapshots
generator/executor structure
```

## Oracle Skills

Useful for:

```text
APEX domain knowledge
```

## Stagehand

Useful for:

```text
observe/act/extract ideas
semantic action patterns
```

but not our primary runtime.

## Browser Use

Optional later:

```text
ambiguous agentic exploration
```

not ordinary test execution.

---

# 87. PROJECT-SPECIFIC DOMAIN RULES

The following are examples of known Endless Aisle context.

Known runtime SKU example:

```text
552811DUDABA00
```

This is runtime test data, not hard-coded generic application knowledge.

The old example:

```text
ABC123
```

was only a dummy example.

Existing known flow examples:

```text
BF-HOME-010-01
BF-PRODUCT-003
BF-PRODUCT-004
BF-BEST-DEAL-008
BF-BROWSE-009
BF-CAT-EAR-010
BF-PRODUCT-CATALOGUE-006
```

Use actual current repository definitions when implementing.

Do not invent business semantics from IDs alone.

---

# 88. PRODUCT-DOMAIN SEPARATION EXAMPLES

## Generic

```text
search
filter
sort
open detail
submit form
```

## Endless Aisle-specific

```text
SKU
Best Deal
Customer Order
factory booking
business rules
```

Generic automation should not import the latter.

---

# 89. EVIDENCE POLICY

Evidence is generated from execution/discovery.

Useful evidence:

```text
screenshot
trace
page snapshot
transition record
test output
```

Evidence should always link to:

```text
run
test
scenario
state
```

Evidence must never contain secrets unnecessarily.

---

# 90. REPORTING

At minimum:

### Crawl report

```text
pages/states
interactions
coverage summary
stops
blocked actions
new states
```

### QA report

```text
run
flow
scenario
test
duration
PASS/FAIL
evidence
trace
```

Use Playwright's standard HTML report as the primary execution report.

ScoutAI's custom UI summarizes and links to it.

Do not build a custom report engine unless standard Playwright output demonstrably cannot satisfy a real requirement.

---

# 91. FAILURE HANDLING

When something fails:

```text
preserve state
preserve evidence
preserve error
record phase
stop or continue according to explicit run policy
```

Never:

```text
silently retry forever
```

Never:

```text
on connection failure → start another execution
```

Never:

```text
on UI refresh → create another run
```

---

# 92. DEVELOPMENT BASELINE POLICY

After each major piece passes:

```text
commit
tag/branch if useful
record baseline
```

The user should be able to identify:

```text
working Piece 0.1
working Piece 0.2
working Piece 0.3
...
```

This makes debugging local.

If Piece 0.8 breaks, compare with Piece 0.7.

---

# 93. RECOMMENDED GIT DISCIPLINE

Suggested branch names:

```text
feature/p0-1-foundation
feature/p0-2-playwright
feature/p0-3-state-store
feature/p0-4-schemas
...
```

Commit messages:

```text
feat: establish playwright foundation
feat: add run state and event model
feat: add domain pack contract
```

Do not combine unrelated work.

---

# 94. "DONE" DOES NOT MEAN "MERGED"

A piece is done when:

```text
implementation
+
tests
+
real proof
+
documentation
+
review
+
baseline
```

Not merely:

```text
Cursor says completed
```

---

# 95. FINAL FIRST PIECE

## P0.1 — Repository Foundation + Guardrails

This is the first task.

Nothing else.

### Objective

Create the clean repository and mechanically enforce the architecture.

### Exact Cursor task

```text
Piece 0.1: repository foundation and guardrails ONLY.

Read:
- SCOUTAI_PROJECT_KB.md
- SCOUTAI_FINAL_WORK_GUIDE.md

Architecture is locked. Do not redesign it.

Implement only:

1. Initialize a strict TypeScript project using current Node LTS.
2. Add Playwright Test.
3. Add a fast unit-test runner.
4. Add schema validation tooling.
5. Add mechanical import-boundary rules enforcing:
   - experience/api -> control/capabilities
   - capabilities -> ports/model
   - adapters implement ports
   - capabilities never import adapters
   - capabilities never import api
   - core never imports domain packs
   - only sqlite adapter can access SQLite
   - model contains pure schemas/types and no IO
6. Add one automated test proving an intentional dependency-boundary violation is rejected.
7. Add:
   - docs/ARCHITECTURE.md
   - docs/OSS_REUSE.md
   - docs/adr/
8. Add .gitignore for:
   - .env
   - storageState/auth files
   - traces
   - screenshots/reports where appropriate
   - crawl-artifacts
9. Add:
   - one trivial passing unit test
   - one trivial passing Playwright test
10. Keep the implementation minimal.

DO NOT implement:
- crawler
- database
- LLM
- AI
- UI
- SSE
- realtime runtime
- flow discovery
- scenario generation
- test generation
- healing
- domain-specific Endless Aisle code
- APEX implementation

Before coding:
- inspect the relevant Playwright project structure
- check current dependency versions
- explain the boundary-enforcement choice

After coding report:
- files created/changed
- reason for each
- dependencies added
- commands run
- test output
- boundary-violation proof
- Playwright test output
- anything not completed
```

---

# 96. WHAT WE EXPECT FROM P0.1

Expected:

```text
project exists
TypeScript strict works
Playwright works
unit tests work
architecture rules are mechanically enforced
illegal dependency test fails as intended
legal project passes
```

Not expected:

```text
crawler
AI
browser login
database
UI
```

---

# 97. FINAL OPERATING LOOP

The development loop from this point is:

```text
                    FINAL ARCHITECTURE
                           │
                           ▼
                       PIECE N
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                  STUDY         IMPLEMENT
                    │             │
                    └──────┬──────┘
                           ▼
                          TEST
                           │
                           ▼
                     REAL OUTPUT
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
              CORRECT             WRONG
                 │                   │
                 ▼                   ▼
              DOCUMENT             FIX
                 │                   │
                 └─────────┬─────────┘
                           ▼
                        BASELINE
                           │
                           ▼
                       PIECE N+1
```

---

# 98. NORTH-STAR ARCHITECTURE IN ONE IMAGE

```text
                           SCOUTAI
                              │
                ┌─────────────┴─────────────┐
                │                           │
           EXPERIENCE                   SCHEDULER
                │                           │
                └─────────────┬─────────────┘
                              ▼
                       RUN COORDINATOR
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ▼            ▼            ▼
             DISCOVERY       AI          APPROVAL
                 │            │            │
                 └──────┬─────┴──────┬─────┘
                        ▼            │
                     APPROVED       │
                     COVERAGE       │
                        │           │
                        ▼           │
                    PLAYWRIGHT      │
                    GENERATION      │
                        │           │
                        ▼           │
                    EXECUTION ◄────┘
                        │
               ┌────────┴─────────┐
               ▼                  ▼
            EVIDENCE            REPORT
               │                  │
               └────────┬─────────┘
                        ▼
                 DAILY RE-CRAWL
                        │
                        ▼
                  DIFF / GAPS
                        │
                        ▼
                       SME
```

Underlying:

```text
Ports / Adapters
SQLite / Files
Event Log / Audit
APEX Pack
Endless Aisle Pack
```

---

# 99. FINAL DEFINITION OF THE PRODUCT

ScoutAI is successful when it can do this reliably:

```text
1. Connect to a real application.
2. Authenticate.
3. Discover safe reachable application states.
4. Build a stable application/state map.
5. Use AI to interpret what those states mean.
6. Propose useful flows and scenarios.
7. Let an SME approve/edit/reject them.
8. Generate ordinary Playwright tests.
9. Execute those tests reliably.
10. Show progress in realtime.
11. Produce evidence and Playwright reports.
12. Crawl again later.
13. Detect meaningful change.
14. Detect stale automation and coverage gaps.
15. Send meaningful changes back to the SME.
```

The system should be intelligent without being a black box.

It should be reusable without becoming abstract for no reason.

It should be feature-rich without becoming a distributed system prematurely.

It should be real-time without making transport state authoritative.

It should use AI heavily where reasoning adds value and very little where deterministic code is stronger.

---

# 100. FINAL PRINCIPLE

> **Build the complete architecture once. Build the implementation one proven piece at a time.**

The goal is not the smallest codebase.

The goal is:

```text
minimum necessary architectural complexity
+
maximum useful capability
+
high reliability
+
reusable components
+
clear layers
+
real evidence
```

The platform becomes more capable through additional proven components, not through uncontrolled architectural complexity.

---

# APPENDIX A — SOURCE LINKS

## User-provided repositories

- https://github.com/jimmytoan/qa-agent
- https://github.com/vostride/agent-qa
- https://github.com/rakutentech/sorify
- https://github.com/browser-use/qa-use
- https://github.com/oracle/skills

## Additional repositories reviewed

- https://github.com/microsoft/playwright
- https://github.com/microsoft/playwright-mcp
- https://github.com/iklymchuk/autonomous-qa-agent
- https://github.com/brentkastner/ai-qa-framework
- https://github.com/zachblume/autospec
- https://github.com/browserbase/stagehand
- https://github.com/browser-use/browser-use

---

# APPENDIX B — OPEN-SOURCE SOURCE-TO-SCOUTAI MAPPING

| Source | ScoutAI use |
|---|---|
| Microsoft Playwright | browser/test runner/fixtures/assertions/traces/report |
| Playwright Test Agents | planning/generation/healing reference |
| Playwright MCP | structured accessibility exploration reference |
| Sorify | browser exploration and crawl→test patterns |
| AutonomousQA | BFS, flow inference, generator/executor/report patterns |
| AI QA Framework | simple pipeline and coverage concepts |
| Autospec | compact TS planner/executor structure |
| Oracle Skills | Oracle APEX knowledge |
| Stagehand | semantic action/observe/extract reference |
| Browser Use | optional future ambiguous exploration reference |
| jimmytoan/qa-agent | SSE/realtime UX reference |
| vostride/agent-qa | memory/healing/caching reference |
| browser-use/qa-use | archived/reference only |

---

# APPENDIX C — LICENSE/REUSE PRACTICE

For every code adoption:

```text
1. Record repository.
2. Record exact commit/version.
3. Record license.
4. Inspect dependency licenses.
5. Record what was copied/adapted.
6. Preserve required notices.
7. Put attribution in docs if required.
8. Do not assume repository-level license applies identically to every file/dependency.
```

For uncertain or restrictive licenses:

```text
reference first
→ legal/license check
→ only then source reuse
```

---

# APPENDIX D — QUICK DAILY DEVELOPER CHECKLIST

Before starting work:

```text
[ ] What exact piece am I implementing?
[ ] What layer does it belong to?
[ ] What contract does it use?
[ ] Is it reusable?
[ ] What OSS already exists?
[ ] What must not change?
```

After work:

```text
[ ] Did the piece work?
[ ] Did tests pass?
[ ] Did the real behavior work?
[ ] Did I inspect the output?
[ ] Did I accidentally expand scope?
[ ] Did I document the result?
[ ] Did I baseline the working state?
```

---

# APPENDIX E — WHAT SUCCESS LOOKS LIKE AT THE END OF EACH MAJOR PHASE

## Foundation

```text
Playwright works.
Auth works.
Evidence works.
Report works.
State/event storage works.
```

## Discovery

```text
The application can be crawled safely.
States are stable/deduplicated.
Map is persisted.
```

## Intelligence

```text
The system can propose useful flows/scenarios from observations.
```

## SME

```text
Humans can approve/edit/reject.
```

## Automation

```text
Approved scenarios become reliable Playwright tests.
```

## Realtime

```text
The operator sees progress live and reconnect is safe.
```

## Daily

```text
The system detects meaningful application change and coverage gaps.
```

## Healing

```text
Broken automation can recover in a bounded and auditable way.
```

---

# FINAL PROJECT STATEMENT

**ScoutAI is a reusable, layered, real-time QA discovery and automation platform built around deterministic Playwright execution, structured application understanding, AI-assisted flow/scenario discovery, SME-controlled promotion, durable run/event state, and continuous re-discovery.**

**The architecture is broad. The implementation is incremental.**

**No big-bang V1. No unnecessary infrastructure. No hidden agent magic. No unsupported business assumptions.**

**One proven piece at a time.**
