# CURRENT_STATUS

# Phase 3 — Core Messaging (Without Real-Time)

**Status: IN PROGRESS** (last updated 2026-10-28)

Target: a person can log in, see their conversations, open one, read the messages they are allowed to see, scroll back through history, send a message and start a new chat, all without real-time delivery (new messages from others appear after a reload). Phase 2 is DONE (data model, factories, seeder, `ConversationPolicy`). Tests come in Phase 13, so each step is verified in the browser, in Tinker and with `npm run types:check` (baseline: 0 errors). After `php artisan migrate:fresh --seed`, log in with `test@example.com` / `password`. Installed: Inertia v3 (`@inertiajs/react ^3.0.0`, `inertiajs/inertia-laravel ^3.0`).

Open items:

- Database engine: MariaDB 10.4.32 through Laravel's `mysql` driver. Before Phase 15 (Docker) and Phase 16, check Laravel 13's supported versions, whether 10.4 is still maintained, and what engine the chosen free host runs.
- 3.3.5: confirm in the browser's Network tab that a chat click is a partial reload (request header `X-Inertia-Partial-Data: activeChat`, response holds `activeChat` and no `chats`). Not yet reported.
- 3.4.1: decide how older messages load: Inertia v3's `<InfiniteScroll reverse>` with `Inertia::scroll()`, or our own JSON endpoint. Docs read (merging props and infinite scroll). Unverified points to test in a spike: does `data` accept the nested key `activeChat.messages` or does `messages` need its own top-level prop; does the scroll position hold when older messages are added inside our scroll container; does a chat link accept `reset`. Prop merging happens on any partial reload, and a chat click is one, so switching chats must reset the merged prop or two chats' messages would be mixed.
- 3.5: check Inertia v3's own plain-HTTP helper before building a central `fetch` wrapper; the wrapper (or the helper) must handle expired sessions (401/419), 403 and 404 in one place.
- After a send, the chat list (preview, order) is stale, because a partial reload of `activeChat` does not refresh `chats` (3.5/3.6).
- The seeder repeats the "start a direct chat" rule (ordered pair, participant rows). Replace that with one shared place used by both the seeder and the real feature (3.7).
- A leaver sees a read-only bar (done in 3.3.2). The endpoint's 403 for a leaver posting is enforced in 3.5.
- Time labels are computed at render, so a page left open past midnight shows stale "Today" labels. Inertia SSR (Phase 16 decision) would render in the server's zone; keep SSR off or guard against it.
- Following new messages as they arrive (3.5/3.6, Phase 4) needs the rule: glue to the bottom only if the person was already near it. Images that load late shift the bottom (Phase 8).
- Phase 4: live-channel authorization must exclude people who left (use `send`-style logic, not `view`).
- Phase 6: when adding someone to a group, set their `joined_at` at or before the "X joined" system message's `created_at`. Group names arrive as a `name` column; `Conversation::titleFor` then uses the name before member names.
- Phase 7: how to show a reply that quotes a message the viewer cannot see; how "delete for everyone" rows are listed (a soft-deleted last message currently makes the chat-list preview fall back to an earlier message); the hide flag for "delete chat" and the matching change to the policy's `view`.
- Phase 11: replace the " (You)" stripping in `ChatAvatar` with a server-sent `avatar_name`.
- Phase 13: test every conversation route as a stranger (expect 404); a guard test that message listing goes through `visibleMessages()`; unit tests for `lib/time.ts` with a fixed `now`.
- Phase 14: indexing review (the conversation list was deliberately not indexed in Phase 2); the chat list costs 4 queries plus 2 per chat and `show` looks up the viewer's membership three times (move the window rule into a `Message` query scope).
- Phase 16: plain sequential ids are used in URLs (safe because every access is authorized and non-members get an identical 404). Revisit if random public ids are wanted.

Rules carried from Phase 2:

- All message-listing code goes through `Participant::visibleMessages()`, never `Message::query()` directly. This includes the chat list's last-message preview: a cleared or left chat must not preview a message the viewer can no longer see.
- Every conversation route calls `Gate::authorize` (`view` to read, `send` to post). Non-members get 404; a leaver denied posting gets 403 with a message. Hiding a button in the UI protects nothing.
- Server-set fields (`sender_id`, `conversation_id`) are never mass-assignable and never come from a request.
- PHP runs in UTC and the database connection is pinned to `+00:00`. Times are converted to the viewer's zone only in the browser.
- Rows whose times are compared (messages, participants) are written through their models (microsecond precision), never raw `DB::table()` inserts.

Rules adopted (Phase 3):

- Data a page needs on arrival (chat list, first page of messages) arrives as Inertia props, wrapped in closures so a partial reload computes only what it asks for. The policy call sits outside the closures, so it runs on every request.
- `/chats` and `/chats/{conversation}` render the same page component (`chats/index`). A chat click is a partial reload (`only: ['activeChat']`, `preserveState`). No `prefetch` on chat links (a cached chat would show stale messages).
- An open chat has the URL `/chats/{conversation}` (plain integer id). Refresh, Back, a new tab and phone Back all work from the URL alone.
- Chat routes live in `routes/chats.php` (required from `web.php`, like `settings.php`), inside the `auth` and `verified` group, named `chats.*`. Wayfinder names its generated file from the part of the route name before the dot, so a misnamed route breaks the typed import.
- React calls Wayfinder's generated route functions, never hand-typed URL strings.
- Times are converted only through `resources/js/lib/time.ts`. Message bodies are rendered as text (React escapes them); never use `dangerouslySetInnerHTML` for a body.
- One page of messages is `PAGE_SIZE = 50` (a constant in `ChatController`).
- Transport for older messages and for sending is decided at 3.4.1 and 3.5, after reading the installed Inertia version's docs.

- 3.1 Architecture: how data reaches the browser
    - 3.1.1 Props versus JSON `fetch` - DONE for page arrival (props); older messages and sending are decided at 3.4.1 and 3.5
    - 3.1.2 URL shape for an open chat - DONE (`/chats/{conversation}`)
      **Status: DONE**

- 3.2 Chat list (backend and UI)
    - 3.2.0 Design - DONE. The list starts from the viewer's participant rows; each row is a small shape (id, type, title, preview, last_activity_at, has_left); preview and ordering are per viewer through `visibleMessages()` (no global `last_message_at` column, because it would leak); the per-chat N+1 query is accepted for now; titles come from one server function (`Conversation::titleFor`: direct = the other person's name, self-chat labelled "(You)", group = other current members' names with "+N" after three, until Phase 6 adds `name`); dedicated `ChatLayout`, with the starter's `UserMenuContent` (not `NavUser`, which needs the sidebar) for Settings and Log out.
    - 3.2.1 Route, controller and Inertia props for `/chats` - DONE (verified as David the leaver: 2 chats, `has_left: true` on the left group, preview older than `left_at`; Test User sees 7 chats, Emma first)
    - 3.2.2 TypeScript types for a chat-list item - DONE (`types/chat.ts`: `ChatSummary`, `ChatPreview`; verified: a deliberate `chat.name` typo gave `TS2339` while the page still ran and showed blank titles)
    - 3.2.3 Chat list UI and `ChatLayout` - DONE (`layouts/chat-layout.tsx`; `chats/` case in `app.tsx`; `components/chat/chat-list.tsx` and `chat-avatar.tsx`; narrowing for `ChatPreview | null`)
    - 3.2.4 Verify in the browser with seeded data - DONE (Test User and David; phone width; settings, dashboard and profile unchanged)
      **Status: DONE**

- 3.3 Open a chat: newest messages and timestamps
    - 3.3.1 Route `/chats/{conversation}` with `Gate::authorize('view')`; first page of messages through `visibleMessages()` - DONE (`ChatController::show`; `chats` and `activeChat` are lazy closures; fetched as 51 rows to compute `has_more`; messages returned oldest first; `can_send` from the policy; verified: member gets their window, stranger and made-up id both 404, leaver reads with `can_send: false`, `/chats/5` returns 50 messages with `has_more: true`, cleared group shows only post-clear messages)
    - 3.3.2 TypeScript `Message` type and the message list UI - DONE (`ChatMessage` and `ActiveChat` types; `message-bubble.tsx`, `chat-panel.tsx`; rows are Wayfinder links; phone shows list or chat with a back arrow; read-only bar for leavers). Lesson: a route misnamed `chat.show` broke the typed import and the compiler caught it.
    - 3.3.3 Adaptive timestamps and date separators, converted from UTC in the browser - DONE (`lib/time.ts`: `formatClock`, `formatListTime`, `formatDayLabel`, `dayKey`; calendar days in the viewer's zone, a week or older shows a date; verified against the UTC values). TypeScript cannot catch a missing conversion (a string in, a string out), so one tested function is the defence.
    - 3.3.4 Auto-scroll to the newest message - DONE (`useLayoutEffect` keyed on `chat.id` sets the scroll container to the bottom before paint; typed ref with a null check; verified on desktop and phone width, including a short chat with nothing to scroll)
    - 3.3.5 Verify: member, stranger (404), made-up id (404), leaver (read-only) - DONE (covered by the 3.3.1 and 3.3.2 checks). Network-tab confirmation of the partial reload is still open (see Open items).
      **Status: DONE, except the Network-tab confirmation**

- 3.4 Load older messages
    - 3.4.1 Design: cursor (keyset) pagination by `id`; Inertia `<InfiniteScroll reverse>` with `Inertia::scroll()` versus our own JSON endpoint - IN PROGRESS (docs read; decision and a short spike pending, see Open items)
    - 3.4.2 Backend: older messages through `visibleMessages()` with a cursor, never skipping or repeating a message when new ones arrive - NOT STARTED
    - 3.4.3 Frontend: load older as you scroll up, keep the scroll position, reset when switching chats - NOT STARTED
    - 3.4.4 "Scroll to bottom" button with a new-message count - NOT STARTED
    - 3.4.5 Verify on the 2,000-message chat - NOT STARTED
      **Status: IN PROGRESS**

- 3.5 Send a message
    - 3.5.0 Transport: check Inertia v3's own plain-HTTP helper; build a central wrapper (expired session 401/419, 403, 404 in one place) only if needed - NOT STARTED
    - 3.5.1 Validation, endpoint and `Gate::authorize('send')` - NOT STARTED
    - 3.5.2 Retry safety with `client_uuid` (a duplicate returns the existing message) - NOT STARTED
    - 3.5.3 Composer UI; refresh the chat list after a send; follow the newest message only if the person was near the bottom - NOT STARTED
    - 3.5.4 Verify: send, retry with the same uuid, stranger 404, leaver 403 - NOT STARTED
      **Status: NOT STARTED**

- 3.6 Optimistic sending and retry
    - 3.6.1 Show the message at once, then confirm - NOT STARTED
    - 3.6.2 Failure state and retry button - NOT STARTED
    - 3.6.3 Enter to send, Shift+Enter for a new line, controls disabled in flight - NOT STARTED
      **Status: NOT STARTED**

- 3.7 Search users and start a chat
    - 3.7.1 One shared place for the direct-chat rule (used by the seeder too) - NOT STARTED
    - 3.7.2 User search endpoint and UI - NOT STARTED
    - 3.7.3 Start or open the chat; a duplicate-key race returns the existing chat - NOT STARTED
      **Status: NOT STARTED**

- 3.8 Responsive layout, loading and error states, protection
    - 3.8.1 Two panes on desktop, list-then-chat on mobile (the basic version exists from 3.2 and 3.3; review it) - NOT STARTED
    - 3.8.2 Skeleton loaders, empty states, friendly error states - NOT STARTED
    - 3.8.3 Basic expired-session handling (401/419) - NOT STARTED
    - 3.8.4 Rate limiting and spam protection on message sending - NOT STARTED
      **Status: NOT STARTED**

**NEXT STEP: 3.3.5 Network-tab confirmation, then the 3.4.1 decision (Inertia `<InfiniteScroll reverse>` or our own JSON endpoint). Before any code, request the current `ChatController.php`, `chat-panel.tsx`, `types/chat.ts` and `routes/chats.php`.**
