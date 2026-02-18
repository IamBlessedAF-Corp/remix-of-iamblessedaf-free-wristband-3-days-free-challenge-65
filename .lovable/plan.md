
# Admin Hub Optimization — 5-Phase Execution Plan

## Phase 1: Refactor the Monolith (Split Tabs to Files)

**Problem**: `AdminHub.tsx` is 1,523 lines with 15+ inline tab components. Every tab's code loads even when not visible.

**Action**: Extract all inline tab functions into standalone files under `src/components/admin/tabs/`.

| Inline Function | New File |
|---|---|
| `DashboardTab` + `RevenueIntelligenceSubTab` + `GrowthMetricsSubTab` | `tabs/DashboardTab.tsx` |
| `ClippersTab` + `ClipRowItem` + `VideoEmbed` | `tabs/ClippersTab.tsx` |
| `CongratsTab` | `tabs/CongratsTab.tsx` |
| `ExpertsTab` | `tabs/ExpertsTab.tsx` |
| `LinksTab` | `tabs/LinksTab.tsx` |
| `CampaignSettingsTab` | (already delegates to `EditableCampaignSettings` -- just inline the wrapper) |
| `IntelligentBlocksTab` + `BlockListItem` + `BLOCK_PREVIEWS` | `tabs/IntelligentBlocksTab.tsx` |
| `RiskEngineTab` | `tabs/RiskEngineTab.tsx` |
| `PaymentsTab` | `tabs/PaymentsTab.tsx` |
| `BoardTab` | `tabs/BoardTab.tsx` |
| `RoadmapTab` | `tabs/RoadmapTab.tsx` |
| `LogsTab` | (one-liner, keep inline or remove) |
| `ForecastTab` | `tabs/ForecastTab.tsx` |
| `FraudMonitorTab` | `tabs/FraudMonitorTab.tsx` |
| `LeaderboardTab` | `tabs/LeaderboardTab.tsx` |
| `AlertsTab` | `tabs/AlertsTab.tsx` |

**Result**: `AdminHub.tsx` shrinks to ~300 lines (sidebar + layout + TabContent switch). Each tab lazy-loads its own hooks (`useClipperAdmin`, `useBudgetControl`, etc.) so initial load is faster.

Move the hardcoded `blocks` array (46 items) to `src/data/intelligentBlocks.ts`.

---

## Phase 2: User Management UI

**Problem**: The `manage-user` and `invite-user` Edge Functions exist but there's no UI beyond basic role invitation to search users, reset passwords, disable accounts, or view user details.

**Action**: Create `src/components/admin/tabs/UserManagementTab.tsx` and add it to the sidebar under "Operations".

**Features**:
- Search users by email (queries `creator_profiles` + `user_roles`)
- View user details: email, role, referral code, created_at, orders count
- Reset password (calls `manage-user` Edge Function)
- Disable/enable account
- Change role (admin/developer/user)
- Add new sidebar entry: `{ id: "users", label: "Users", icon: Users }` under Operations group

**Database**: No schema changes needed -- uses existing `creator_profiles`, `user_roles`, and `manage-user` Edge Function.

---

## Phase 3: Export CSV on All Tables

**Problem**: No export capability on any admin table. Data is trapped in the UI.

**Action**: Create a reusable `ExportCsvButton` component and add it to every table tab.

**Implementation**:
- Create `src/components/admin/ExportCsvButton.tsx` -- a small button that takes `data: Record<string, any>[]`, `filename: string`, and optional `columns: string[]`
- Uses the existing `downloadCsv` utility from `src/utils/csvExport.ts`
- Generic: auto-generates headers from object keys, or uses provided column list

**Tabs to add export**:
| Tab | Data Source |
|---|---|
| Orders | `orders` query |
| Waitlist | `smart_wristband_waitlist` query |
| SMS Deliveries | `sms_deliveries` query |
| SMS Audit | `sms_audit_log` query |
| Experts | `expert_leads` query |
| Clips | `clip_submissions` via `useClipperAdmin` |
| Blessings | `blessings` + `creator_profiles` |
| Affiliates | `affiliate_tiers` |
| Leaderboard | clipper aggregated data |
| Links | already has export via `useLinkAnalytics` |
| Challenge | `challenge_participants` |

---

## Phase 4: Global Search (Cmd+K)

**Problem**: No way to quickly find a user, order, clip, or config across 25+ tabs.

**Action**: Create `src/components/admin/GlobalSearchModal.tsx` using the existing `cmdk` package (already installed).

**Features**:
- Triggered by Cmd+K / Ctrl+K keyboard shortcut from anywhere in admin
- Also accessible via a search icon in the sidebar header
- Searches across:
  - Tab names (navigate to tab)
  - Orders (by email, tier)
  - Creator profiles (by name, email, referral code)
  - Clip submissions (by URL, platform)
  - Waitlist entries (by email)
- Results grouped by category with icons
- Clicking a result navigates to the relevant tab (using existing `admin-navigate-tab` custom event)
- Debounced queries (300ms) to avoid spamming the database

**Integration**: Add the modal to `AdminHub.tsx` layout (outside the tab content area). Wire Cmd+K listener.

---

## Phase 5: Pagination on Heavy Tables

**Problem**: Orders, Waitlist, SMS, and Clips all use `.limit(200)` which will break with scale and already truncates data.

**Action**: Create a reusable `usePaginatedQuery` hook and update the 5 heaviest tabs.

**Hook API**:
```text
usePaginatedQuery({
  table: "orders",
  pageSize: 50,
  orderBy: "created_at",
  filters?: { column, value }[]
})
--> { data, page, totalPages, nextPage, prevPage, isLoading }
```

**Implementation approach**:
- Uses Supabase `.range(from, to)` for offset pagination
- Gets total count with `select("*", { count: "exact", head: true })` 
- Reusable `PaginationControls` component using the existing `src/components/ui/pagination.tsx`

**Tabs to paginate**:
| Tab | Table | Current Limit |
|---|---|---|
| Orders | `orders` | 200 |
| Waitlist | `smart_wristband_waitlist` | 200 |
| SMS Deliveries | `sms_deliveries` | 200 |
| SMS Audit | `sms_audit_log` | 200 |
| Clips (via ClippersTab) | `clip_submissions` | all |
| Expert Leads | `expert_leads` | all |

---

## Execution Order

```text
Phase 1 (Refactor)  -->  Foundation for everything else
Phase 2 (Users)     -->  Critical gap, standalone
Phase 3 (CSV)       -->  Quick wins, touches each tab file
Phase 4 (Cmd+K)     -->  Standalone overlay
Phase 5 (Pagination) --> Touches each tab's data fetching
```

## Technical Notes

- No database migrations needed for any phase
- All changes are frontend-only except Phase 2 which uses existing Edge Functions
- Phase 1 must go first since all other phases touch tab files
- Phases 2-4 can run in parallel after Phase 1
- Phase 5 should go last since it changes data fetching patterns in tabs
