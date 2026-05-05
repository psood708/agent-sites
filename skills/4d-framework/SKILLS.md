---
name: 4d-framework
description: >
  Apply the 4D Framework (Discover → Design → Develop → Deploy) to structure
  AI-assisted project work from kickoff to delivery. Use this skill whenever
  a user starts a new project, feature, or initiative — especially if they say
  "let's kick off", "starting a new project", "help me plan", "where do I begin",
  "scope this out", or describe a goal without a clear structure. Also trigger
  for mid-project pivots, sprint planning, or when someone asks how to use AI
  effectively on a specific problem. This skill turns vague intent into a
  concrete, AI-augmented execution plan across all four phases.
---

# 4D Framework for AI-Assisted Projects

The 4D Framework structures how you use AI across the full lifecycle of a project:

| Phase        | Goal                         | AI Role                           | Human Role                         |
| ------------ | ---------------------------- | --------------------------------- | ---------------------------------- |
| **Discover** | Understand the problem space | Research, summarize, surface gaps | Define success, validate context   |
| **Design**   | Architect the solution       | Generate options, draft specs     | Make trade-offs, approve direction |
| **Develop**  | Build the thing              | Generate, debug, iterate fast     | Review, test, integrate judgment   |
| **Deploy**   | Ship and sustain             | Monitor signals, draft comms      | Own reliability, act on feedback   |

---

## How to Apply This Skill

When a project is mentioned, run through all four D's — either fully upfront or phase by phase. Always make the **AI vs. Human split explicit** for each task. Never let AI own decisions that require human judgment, domain knowledge, or accountability.

---

## Phase 1: DISCOVER

**Purpose**: Turn a vague problem into a well-understood, bounded scope.

### AI Tasks in Discover

- Summarize background context the user provides
- Generate a "5 Whys" or problem tree to find root causes
- List known unknowns and research questions
- Pull in comparable cases, prior art, or relevant domain knowledge (use web search if available)
- Draft a stakeholder map: who cares, what do they want, what do they fear?
- Identify regulatory, technical, or market constraints

### Human Tasks in Discover

- Validate that AI's understanding matches reality
- Add tacit knowledge AI can't infer
- Decide which unknowns are blockers vs. acceptable risks
- Confirm problem boundaries

### Discover Output Template

```
## Problem Statement
[1-2 sentences: what is broken or missing, and why it matters]

## Success Criteria
- [ ] Metric 1 with target
- [ ] Metric 2 with target

## Scope
In: [what's included]
Out: [what's explicitly excluded]

## Key Risks / Unknowns
1. [Risk + mitigation idea]
2. ...

## Stakeholders
| Who | Interest | Concern |
|---|---|---|
```

---

## Phase 2: DESIGN

**Purpose**: Go from "what" to "how" — architecture, task breakdown, and delegation plan.

### AI Tasks in Design

- Generate 2-3 solution options with trade-offs
- Draft system architecture / flow diagrams (in Mermaid or prose)
- Break the project into a Work Breakdown Structure (WBS)
- Identify which tasks are AI-automatable vs. human-required
- Flag dependencies and sequencing risks
- Draft a data model, API contract, or schema if applicable

### Human Tasks in Design

- Choose between AI-generated options (own the trade-off)
- Validate the WBS against real constraints (time, team, tools)
- Identify tasks that require your specific domain expertise
- Approve the delegation plan before development starts

### Design Output Template

```
## Solution Architecture
[Diagram or prose description]

## Work Breakdown
| Task | Owner | AI-Assisted? | Priority |
|---|---|---|---|
| Task 1 | Human | Yes (drafting) | P0 |
| Task 2 | AI | Fully | P1 |

## AI Delegation Plan
- Fully delegate to AI: [list]
- AI drafts, human reviews: [list]
- Human-only (no AI): [list]

## Technical Decisions Made
1. Decision → Rationale
```

---

## Phase 3: DEVELOP

**Purpose**: Build fast using AI as a pair-programmer, writer, and analyst.

### AI Tasks in Develop

- Write code, tests, configs, migrations
- Generate boilerplate and scaffold project structure
- Debug errors with full stack traces or logs
- Write documentation, docstrings, and inline comments
- Draft copy, emails, reports, or data pipelines
- Suggest refactors and spot code smells
- Run iterative loops: generate → test → fix → repeat

### Human Tasks in Develop

- Review all AI outputs before merging/shipping
- Handle ambiguous edge cases requiring judgment
- Write tests for critical paths (not just happy paths)
- Validate model outputs, metrics, or data quality
- Integrate pieces across domains AI can't bridge alone

### Develop Principles

1. **Chunk it**: Break work into ≤2-hour AI tasks. Don't prompt "build the whole thing."
2. **Context window is working memory**: Paste the relevant spec/schema/interface into every prompt.
3. **Test-first**: Ask AI to write tests before the implementation when possible.
4. **Never trust blindly**: AI output is a strong first draft, not ground truth.
5. **Version control everything**: Treat AI sessions like pair programming — commit often.

### Prompt Pattern for Develop Phase

```
Context: [paste relevant spec, schema, or existing code]
Task: [specific, scoped ask]
Constraints: [language, library, style guide, perf requirements]
Output format: [function / class / JSON / prose]
```

---

## Phase 4: DEPLOY

**Purpose**: Ship reliably and build feedback loops into the AI workflow.

### AI Tasks in Deploy

- Generate deployment checklists and runbooks
- Draft release notes, changelogs, and user-facing comms
- Summarize monitoring dashboards or log anomalies
- Generate postmortem drafts from incident timelines
- Suggest alerting rules and SLOs based on system description
- Analyze user feedback at scale (sentiment, clustering themes)

### Human Tasks in Deploy

- Own the go/no-go decision
- Interpret ambiguous signals from monitoring
- Communicate with stakeholders during incidents
- Decide when to roll back vs. fix-forward
- Close the loop: feed learnings back into Discover for the next cycle

### Deploy Output Template

```
## Pre-Deploy Checklist
- [ ] Tests passing (unit, integration, E2E)
- [ ] Secrets rotated / env vars set
- [ ] Rollback plan defined
- [ ] Stakeholders notified

## Monitoring Plan
| Signal | Threshold | Owner | Action |
|---|---|---|---|

## Feedback Loop
- How are users reporting issues? [channel]
- What's the retraining/iteration trigger? [threshold]
- When does this cycle back to Discover? [condition]
```

---

## Project Kickoff Protocol

When starting any project, run this sequence:

1. **Paste or describe the goal** → AI generates Problem Statement draft
2. **Review + correct** the Problem Statement (takes 5 min)
3. **AI runs Discover** → outputs scope, risks, stakeholders
4. **Human validates** Discover output (15-30 min)
5. **AI runs Design** → generates WBS + delegation plan
6. **Human approves** Design (30-60 min)
7. **Enter Develop** phase with clear tasks and AI delegation rules
8. **Deploy** with AI-generated checklist; set up feedback loop

---

## AI vs. Human Decision Matrix

| Task Type                   | AI       | Human             |
| --------------------------- | -------- | ----------------- |
| Generating options          | ✅ Fully | Reviews + chooses |
| Making trade-offs           | ❌ Never | ✅ Always         |
| Writing first drafts        | ✅ Fully | Edits             |
| Owning accountability       | ❌ Never | ✅ Always         |
| Pattern matching at scale   | ✅ Fully | Spot checks       |
| Contextual judgment         | ❌ Weak  | ✅ Strong         |
| Repetitive structured tasks | ✅ Fully | Spot checks       |
| Ambiguous requirements      | ❌ Weak  | ✅ Clarifies      |

---

## Anti-Patterns to Avoid

- ❌ **The YOLO Prompt**: Asking AI to "just build the whole thing" without specs
- ❌ **The Trust Fall**: Shipping AI output without human review
- ❌ **The Context Desert**: Giving AI zero context and wondering why output is generic
- ❌ **Phase Skipping**: Jumping to Develop without Discover/Design — always leads to rework
- ❌ **The Infinite Loop**: Staying in Develop forever; never shipping

---

## Reference Files

- `references/prompt-library.md` — Ready-made prompts for each phase
- `references/delegation-patterns.md` — Common patterns for AI task delegation
- `agents/4d-agent.md` — Spec for the autonomous 4D project agent
