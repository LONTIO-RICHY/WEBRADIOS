# ERRORS.md - Project Error Tracking Log

## [2026-06-25 04:08] - RangeError in Public Planning Page

- **Type**: Runtime
- **Severity**: High
- **File**: `src/components/PlanningPublic.jsx:26`
- **Agent**: @orchestrator
- **Root Cause**: `toLocaleTimeString` was called with invalid format options `{ hour: '2h', minute: '2h' }` instead of `{ hour: '2-digit', minute: '2-digit' }`, causing all time listings to crash and show "Heure invalide".
- **Error Message**: `RangeError: Option value is invalid: hour: "2h"`
- **Fix Applied**: Replaced `'2h'` option values with `'2-digit'`.
- **Prevention**: Avoid using custom strings like `'2h'` in browser locale formatting options. Always use standard values like `'2-digit'` or `'numeric'`.
- **Status**: Fixed

---

## [2026-06-25 04:08] - UI Limitation: No Emission Selector in Planning Form

- **Type**: Logic / UX
- **Severity**: Medium
- **File**: `src/components/AdminDashboard.jsx:671`
- **Agent**: @orchestrator
- **Root Cause**: The planning form required the admin to manually type the emission title (`track_info`) rather than picking from the selected channel's actual list of emissions, making scheduling difficult and error-prone.
- **Fix Applied**: Added `isManualTrack` state and replaced the manual text input with a `<select>` dropdown populated dynamically with the selected channel's emissions. Provided a "Saisir manuellement" fallback option.
- **Prevention**: Use contextual selects instead of manual text inputs when dealing with related entities in forms.
- **Status**: Fixed

---

## [2026-06-25 04:12] - UI Limitation: Unsorted and Uncategorized Channel Selector in Planning Form

- **Type**: UX / UI
- **Severity**: Medium
- **File**: `src/components/AdminDashboard.jsx:675`
- **Agent**: @orchestrator
- **Root Cause**: The channel select dropdown listed 135 channels (combining custom user channels and imported radios) in a flat, unsorted sequence. Finding local custom channels was extremely difficult. Additionally, the `appearance-none` class hid the dropdown indicator, causing users to mistake it for a static text box.
- **Fix Applied**: Sorted all channels alphabetically, split them using `<optgroup>` labels ("Chaînes Locales" vs. "Radios Importées"), and removed `appearance-none` to display standard browser dropdown arrows.
- **Prevention**: Avoid using `appearance-none` on select tags without a custom SVG arrow fallback, and categorize long lists of options for readability.
- **Status**: Fixed

---

## [2026-06-25 04:20] - Business Rule: Antenna Stream Protection & Local-Only Channel Planning

- **Type**: Access Control / Logic
- **Severity**: High
- **Files**: 
  - `backend/code/main.py:276` (WebSocket connection control)
  - `src/components/AdminDashboard.jsx:675` (Frontend select filter)
  - `src/components/Studio.jsx:327` (Frontend WebSocket close handling)
- **Agent**: @orchestrator
- **Root Cause**: 
  1. The administrator wants to only plan local channels. Imported channels should not be available for planning.
  2. If a local channel is scheduled (has at least one entry in `broadcast_slots`), the creator must NOT be allowed to stream outside their scheduled hours. If the channel is not scheduled at all, they can stream freely.
- **Fix Applied**:
  1. Filtered the channel select in `AdminDashboard.jsx` to list *only* local channels (`c.owner_name !== "Radio-Browser Import"`).
  2. Modified `/ws/stream/{channel_id}` endpoint in `main.py` for `role == "broadcaster"`: it checks if the channel has any entries in `broadcast_slots`. If so, it ensures the current system time (`datetime.now()`) lies within one of those slots. Otherwise, it closes the WebSocket with custom code `4003`.
  3. Added `onclose` event handler in `Studio.jsx` to catch code `4003` and display a clear toast warning.
- **Prevention**: Enforce schedule validation on WebSocket connection handshakes in the backend.
- **Status**: Fixed

---

## [2026-06-25 04:26] - UI Issue: Stale Dashboard Data & Sensitive Filter Match for Local Channels

- **Type**: Logic / UX
- **Severity**: High
- **File**: `src/components/AdminDashboard.jsx:38`
- **Agent**: @orchestrator
- **Root Cause**: 
  1. The `useEffect` fetching the dashboard data had only `[currentUser, navigate]` as dependencies, meaning data was only loaded once on component mount. Switching tabs did not trigger a refresh, leaving states (like `channels` or `planning`) stale if entities were created or modified elsewhere.
  2. String matching on `c.owner_name` was exact and sensitive to casing or whitespace variations, which could potentially filter out local channels if their owner name format differed slightly.
- **Fix Applied**:
  1. Added `activeTab` to the `useEffect` dependency array in `AdminDashboard.jsx` so data is re-fetched and kept fresh whenever the user switches views.
  2. Refined the channel filter to be robust against casing and whitespace: `(c.owner_name || "").toLowerCase().trim() !== "radio-browser import"`.
- **Prevention**: Include route/tab states in React data-fetching dependencies to avoid stale view variables.
- **Status**: Fixed

---

## [2026-06-25 04:33] - Uncaught React Hook Violation & 401 Console Errors on Logout

- **Type**: Runtime / Logic
- **Severity**: Critical
- **Files**:
  - `src/components/AiAssistant.jsx:27` (Early return violating hook rules)
  - `src/components/AdminDashboard.jsx:52` (TypeError & Recharts warnings on null credentials)
  - `src/components/AdminDashboard.jsx:53-157` (Axios 401 requests due to missing token on logout)
- **Agent**: @frontend-specialist
- **Root Cause**:
  1. In `AiAssistant.jsx`, the early return `if (!user) return null;` was declared before two `useEffect` hooks. When a user logged out, `user` became `null` and skipped these hooks, causing React to throw `Rendered fewer hooks than expected`.
  2. In `AdminDashboard.jsx`, logging out updated `currentUser` to `null`. This triggered a TypeError in the JSX (`currentUser.username`) and console warnings from Recharts since the component stayed mounted during the route transition. Additionally, `useEffect` or other state transitions made API requests with an invalid/cleared token.
- **Fix Applied**:
  1. Moved the early return in `AiAssistant.jsx` below all hook declarations and safeguarded all async helper functions.
  2. Added an early render guard `if (!currentUser || !currentUser.is_admin) return null;` in `AdminDashboard.jsx` after all hook declarations.
  3. Added `if (!currentUser?.token) return;` safeguards to all data-fetching functions on the dashboard.
- **Prevention**: Never place early returns before hook declarations in React. Add rendering guards and check for token availability before initiating authenticated requests on state transitions.
- **Status**: Fixed

---

## [2026-06-25 04:40] - Logical Bug: Default System Imported Channels Still Shown in Planning List

- **Type**: Logic / UX
- **Severity**: High
- **File**: `src/components/AdminDashboard.jsx:692`
- **Agent**: @frontend-specialist
- **Root Cause**: The filter condition `owner_name !== "Radio-Browser Import"` successfully excluded imported radio-browser channels, but failed to filter out the 12 default system-imported radios (e.g., Africa Radio, Radio Okapi, Royal FM Cameroun) because they are initialized with the admin user's name (`owner_name = "LUKO Admin"`) in the database.
- **Fix Applied**: Updated the dropdown filter logic to exclude channels by checking `payment_method !== "Import"`, which is set uniformly to `"Import"` on all default and radio-browser imports, leaving only true local channels (`payment_method == "Mobile Money"`).
- **Prevention**: Use system-wide constant fields (like `payment_method` or structural database tags) instead of personal username checks to classify content types.
- **Status**: Fixed

---

## [2026-06-25 05:15] - Logical Bug: Admin User's Owned Properties List ("Mes Propriétés") Mixed with System Imports

- **Type**: Logic / UX
- **Severity**: High
- **Files**:
  - `backend/code/main.py:453` (Route `/api/my-channels`)
  - `src/components/ChainesGauche.jsx:95` (Frontend list mapping)
- **Agent**: @frontend-specialist
- **Root Cause**: The admin user `luko` owns all default system-imported channels (`owner_id = admin.id`) in the database. As a result, the sidebar section "Mes Propriétés" (which queries `/api/my-channels`) listed all 132 imported channels mixed with the admin's actual local channels, cluttering the UI and making channel management impossible.
- **Fix Applied**: 
  1. Updated the backend query in [main.py](file:///C:/projetStage/mon-projet-react/backend/code/main.py#L453) to exclude channels where `payment_method == "Import"`.
  2. Applied the same filter condition `payment_method !== "import"` in the frontend component [ChainesGauche.jsx](file:///C:/projetStage/mon-projet-react/src/components/ChainesGauche.jsx#L95) to double-safeguard the properties list.
- **Prevention**: Limit personal resource list endpoints to only fetch user-created content by checking payment statuses or classification fields (like checking that the content is not marked as import).
- **Status**: Fixed

---

## [2026-06-25 05:20] - UI Bug: Channel Page Sidebar Lists (Discover & Favorites) Mixed with Imported Radios

- **Type**: Logic / UX
- **Severity**: High
- **File**: `src/components/ChainesGauche.jsx:45`
- **Agent**: @frontend-specialist
- **Root Cause**: The sidebar panels "Découvrir" (Discover) and "Coups de cœur" (Favorites) fetched all system channels without checking if they were imported. This caused the user (like `richy`) to see imported browser-radio channels in the public list, violating the design requirement to only show local creator channels on this page.
- **Fix Applied**: Added the filter condition `payment_method !== "import"` to `toutesLesChaines` and `mesFavoris` in [ChainesGauche.jsx](file:///C:/projetStage/mon-projet-react/src/components/ChainesGauche.jsx#L45) to ensure the panels show only local custom radio channels.
- **Prevention**: Establish separate public API paths or client filters for local custom content vs. global stream aggregators.
- **Status**: Fixed




