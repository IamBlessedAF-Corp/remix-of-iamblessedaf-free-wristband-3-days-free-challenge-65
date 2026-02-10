

# Full Implementation Plan: `/board` Kanban System

## Overview

The `/board` route is an admin-only, Trello-style Kanban project management system with a 13-column Six Sigma-inspired pipeline, AI-powered task processing, decision matrix scoring, and a publish gate quality control system. Below is every component, how they interact, and how to recreate them in another project.

---

## Architecture

```text
/board (route)
  |
  +-- Board.tsx (page)
        |
        +-- useAdminAuth() --> useAuth() --> Supabase Auth
        +-- useBoard() --> board_cards + board_columns tables
        +-- useAutoExecute() --> process-board-task edge function
        |
        +-- BoardLoginForm (unauthenticated)
        +-- PipelineControls (automation toolbar)
        +-- SmsTrackingPanel --> useSmsDeliveries()
        +-- KanbanBoard
              |
              +-- KanbanColumn (x13, droppable)
              |     +-- KanbanCard (draggable, per card)
              |
              +-- CardDetailModal (edit card)
              |     +-- DecisionMatrixInput
              |     +-- StageSelector
              |     +-- CardAIChat --> card-ai-chat edge function
              |
              +-- CreateCardModal
              |     +-- DecisionMatrixInput
              |     +-- StageSelector
              |
              +-- PublishGateModal (quality gate for Done column)
```

---

## 1. Database Tables Required

### `board_columns`
Stores the 13 pipeline stages. Fields: `id`, `name`, `position`, `color`, `created_at`. RLS: authenticated users can SELECT; only admins can INSERT/UPDATE/DELETE.

### `board_cards`
All task cards. Key fields include:
- Standard: `title`, `description`, `column_id`, `position`, `priority`, `labels[]`, `stage`
- AI pipeline: `master_prompt`, `summary`, `logs`, `staging_status`
- Review evidence: `screenshots[]`, `preview_link`, `completed_at`
- Decision matrix: `vs_score`, `cc_score`, `hu_score`, `r_score`, `ad_score`, `delegation_score`

RLS: authenticated can SELECT; only admins can INSERT/UPDATE/DELETE.

### `user_roles`
Maps users to roles (enum `app_role`: admin, user). RLS: users can only SELECT own roles.

### `sms_deliveries`
Tracks Twilio SMS delivery status (used by SmsTrackingPanel). Admin-only access.

### Supporting function
- `has_role(uuid, app_role)` -- checks admin status in RLS policies
- `compute_delegation_score()` -- trigger that auto-computes delegation score on card insert/update

### Storage bucket
- `board-screenshots` (public) -- stores proof screenshots uploaded to cards

---

## 2. Frontend Files (12 files)

### Page
| File | Purpose |
|------|---------|
| `src/pages/Board.tsx` | Entry point. Auth gate, search bar, header, renders KanbanBoard + PipelineControls |

### Components (`src/components/board/`)
| File | Purpose |
|------|---------|
| `BoardLoginForm.tsx` | Email/password login + signup form |
| `KanbanBoard.tsx` | DragDropContext, manages drag logic, WIP limits, publish gate intercept, proof prompts |
| `KanbanColumn.tsx` | Droppable column with header (color, count, manual badge), add-card button |
| `KanbanCard.tsx` | Draggable card with priority bar, stage badge, delegation score, next-action button, screenshot upload, evidence indicators |
| `CardDetailModal.tsx` | Full card editor: all fields, labels, review evidence (screenshots, logs, summary, preview link), paste-from-clipboard |
| `CreateCardModal.tsx` | New card form with title, description, master prompt, priority, column, stage, decision matrix |
| `PipelineControls.tsx` | Mode selector (Clarify/Execute/Validate/Six Sigma/Full Pipeline), column picker, Go + Sweep buttons |
| `PublishGateModal.tsx` | 4-check quality gate (screenshots, preview link, logs, summary) with confetti on success |
| `CardAIChat.tsx` | In-card AI assistant with "Suggest Next Steps" and "Execute Task" quick actions |
| `DecisionMatrixInput.tsx` | 5-axis slider (VS, CC, HU, R, AD) with delegation score badge |
| `StageSelector.tsx` | Dropdown for 5 project stages (MVP, Payments, Comms, Scale, DAO) |
| `SmsTrackingPanel.tsx` | Sheet panel showing SMS delivery stats and individual message status |

### Hooks (`src/hooks/`)
| File | Purpose |
|------|---------|
| `useAuth.ts` | Base Supabase auth (session, sign in/up/out) |
| `useAdminAuth.ts` | Extends useAuth, checks `user_roles` for admin role |
| `useBoard.ts` | CRUD for `board_columns` + `board_cards`, auto-sets `completed_at` on Done |
| `useAutoExecute.ts` | Orchestrates AI pipeline: single-phase batch, full end-to-end, and sweep modes |
| `useSmsDeliveries.ts` | Fetches last 50 SMS deliveries with stats |

### Utils
| File | Purpose |
|------|---------|
| `src/utils/boardHelpers.ts` | `computeDelegationScore()`, `getDelegationBadge()`, `getNextAction()` |
| `src/utils/screenshotUpload.ts` | Upload files to `board-screenshots` bucket and update card |

---

## 3. Edge Functions (Backend, 3 functions)

### `process-board-task`
The AI pipeline engine. 4 modes:
- **Clarify**: AI evaluates relevance, generates master prompt
- **Execute**: AI creates implementation plan from master prompt
- **Validate**: AI QA review (pass/warn/fail), routes failures to Errors column
- **Six Sigma**: DMAIC checklist (12 checks, 70% threshold), blocks or advances

Key features:
- Auto-creates a "Project Documentation" card for context
- Enforces WIP limit (1 card in Work in Progress)
- Processes cards sorted by delegation score (highest first)
- Skips cards in "Needed Credentials" column
- Uses Lovable AI gateway (`google/gemini-3-flash-preview`)

### `card-ai-chat`
Per-card AI assistant. Takes `card_id`, `message`, and optional `action` (suggest_next / execute). Returns contextual AI responses using card + project context.

### `upload-board-screenshot`
Server-side base64 image upload to Supabase storage, updates card's `screenshots[]` array.

---

## 4. Cross-System Interactions

### Roadmap to Board
`BulkSendToBoard.tsx` (in `/roadmap` page) inserts multiple cards into the Backlog column with labels like `roadmap-bulk`.

### Board to other routes
The `inferPreviewLink()` function in the edge function auto-maps card keywords to app routes (e.g., "offer 111" maps to `/offer/111`).

### Route registration
`App.tsx` registers `/board` as `<Route path="/board" element={<Board />} />`.

---

## 5. Key Business Rules

1. **13-column pipeline**: 3 Outcomes -> Ideas -> Backlog -> Clarification -> Today -> WIP -> Security -> Credentials -> Validation (New) -> Validation (System) -> Errors -> Review -> Done
2. **Manual-only columns**: "3 Outcomes", "Ideas", "Review" show an amber "Manual" badge and exclude auto-advance buttons
3. **WIP limit**: Only 1 card allowed in Work in Progress at a time
4. **Publish Gate**: Moving to Done requires screenshots (hard gate), plus preview link, logs, and summary (soft checks). Success triggers confetti.
5. **Proof-of-work prompts**: Moving to Errors or Review without screenshots triggers a toast notification
6. **Critical cards pulse red**; High-priority cards in review columns pulse orange
7. **Credential-blocked cards** blink with a red "BLOCKED" banner
8. **Decision Matrix**: 5-axis weighted score determines delegation priority (green >= 70, yellow >= 40, red < 40)
9. **AI pipeline sorts by delegation score** (highest first) when batch-processing

---

## 6. Dependencies

| Package | Used For |
|---------|----------|
| `@hello-pangea/dnd` | Drag and drop |
| `canvas-confetti` | Publish gate celebration |
| `date-fns` | Date formatting |
| `lucide-react` | Icons |
| `sonner` | Toast notifications |
| `@supabase/supabase-js` | Database + auth + storage |
| `@radix-ui/*` | UI primitives (dialog, select, scroll-area, etc.) |

---

## 7. Required Secrets

| Secret | Used By |
|--------|---------|
| `LOVABLE_API_KEY` | `process-board-task`, `card-ai-chat` (AI gateway) |
| `SUPABASE_URL` | Edge functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge functions (bypasses RLS) |

---

## 8. Implementation Order (for new project)

1. Create database tables (`user_roles`, `board_columns`, `board_cards`) + RLS policies + `has_role` function + `compute_delegation_score` trigger
2. Create storage bucket `board-screenshots` (public)
3. Seed the 13 board columns with correct names, positions, and colors
4. Add `useAuth` + `useAdminAuth` hooks
5. Add `useBoard` hook + `boardHelpers.ts` + `screenshotUpload.ts`
6. Build UI components bottom-up: StageSelector -> DecisionMatrixInput -> KanbanCard -> KanbanColumn -> KanbanBoard -> CardDetailModal -> CreateCardModal -> PublishGateModal -> CardAIChat -> PipelineControls -> SmsTrackingPanel -> BoardLoginForm
7. Create `Board.tsx` page + register route
8. Deploy edge functions: `process-board-task`, `card-ai-chat`, `upload-board-screenshot`
9. Add `useAutoExecute` hook
10. (Optional) Add `BulkSendToBoard` for roadmap integration

