# CURRENT_STATUS

# Phase 3 — Core Messaging (Without Real-Time)

**Status: IN PROGRESS** (last updated 2026-10-25)

Target: a person can log in, see their conversations, open one, read the messages they are allowed to see, scroll back through history, send a message and start a new chat, all without real-time delivery (new messages from others appear after a reload). Phase 2 is DONE (data model, factories, seeder, `ConversationPolicy`). Tests come in Phase 13, so each step is verified in the browser, in Tinker and with `npm run types:check` (baseline: 0 errors). After `php artisan migrate:fresh --seed`, log in with `test@example.com` / `password`.

Open items:

- Database engine: MariaDB 10.4.32 through Laravel's `mysql` driver. Before Phase 15 (Docker) and Phase 16, check Laravel 13's supported versions, whether 10.4 is still maintained, and what engine the chosen free host runs.
- Groups have no name: the `conversations` table has no `name` column. Decide in 3.2.0: show member names, or add a nullable `name` column now (the database can be wiped and rebuilt).
- Layout: `app.tsx` gives every page outside `welcome`, `auth/` and `settings/` the starter kit's sidebar `AppLayout`. Decide in 3.2.0 whether chats live inside it or get their own full-height layout.
- The seeder repeats the "start a direct chat" rule (ordered pair, participant rows). Replace that with one shared place used by both the seeder and the real feature (3.7).
- A leaver (member with `left_at` set) can read their window but not post: the UI shows a read-only bar, not an error page (3.5).
- Check Inertia's own append/merge features for loading older messages before choosing `fetch` for good (3.4).
- Phase 4: live-channel authorization must exclude people who left (use `send`-style logic, not `view`).
- Phase 6: when adding someone to a group, set their `joined_at` at or before the "X joined" system message's `created_at`.
- Phase 7: how to show a reply that quotes a message the viewer cannot see; how "delete for everyone" rows are listed; the hide flag for "delete chat" and the matching change to the policy's `view`.
- Phase 13: test every conversation route as a stranger (expect 404); a guard test that message listing goes through `visibleMessages()`.
- Phase 14: indexing review (the conversation list was deliberately not indexed in Phase 2).
- Phase 16: plain sequential ids are used in URLs (safe because every access is authorized and non-members get an identical 404). Revisit if random public ids are wanted.

Rules carried from Phase 2:

- All message-listing code goes through `Participant::visibleMessages()`, never `Message::query()` directly. This includes the chat list's last-message preview: a cleared or left chat must not preview a message the viewer can no longer see.
- Every conversation route calls `Gate::authorize` (`view` to read, `send` to post). Non-members get 404; a leaver denied posting gets 403 with a message. Hiding a button in the UI protects nothing.
- Server-set fields (`sender_id`, `conversation_id`) are never mass-assignable and never come from a request.
- PHP runs in UTC and the database connection is pinned to `+00:00`. Times are converted to the viewer's zone only in the browser.
- Rows whose times are compared (messages, participants) are written through their models (microsecond precision), never raw `DB::table()` inserts.

Rules adopted (Phase 3):

- Data that a page needs on arrival (chat list, first page of messages) arrives as Inertia props from a controller.
- Actions inside an already-open page (older messages, sending) use JSON `fetch` through one central wrapper that handles 401, 419, 403 and 404 in a single place.
- An open chat has the URL `/chats/{conversation}` (plain integer id). Refresh, Back, a new tab and phone Back all work from the URL alone.
- Chat routes live inside the existing `auth` and `verified` group in `routes/web.php`, and call the policy.
- React calls Wayfinder's generated route functions, never hand-typed URL strings.

- 3.1 Architecture: how data reaches the browser
    - 3.1.1 Props versus JSON `fetch` - DONE (props on arrival; `fetch` for older messages and sending, through one central wrapper)
    - 3.1.2 URL shape for an open chat - DONE (`/chats/{conversation}`)
      **Status: DONE**

- 3.2 Chat list (backend and UI)
    - 3.2.0 Design - NOT STARTED (group name decision, layout decision, list query ordered by latest activity, preview respecting the visibility window, how a direct chat and a self-chat are named)
    - 3.2.1 Route, controller and Inertia props for `/chats` - DONE (verified as David the leaver: 2 chats, `has_left: true` on the left group, preview older than `left_at`; Test User's 7-chat list to be glanced at during 3.2.3). Routes live in `routes/chats.php`, required from `web.php` like `settings.php`. Query cost: 4 queries plus 2 per chat (known, fixed in Phase 14). Plan: `/chats` and `/chats/{id}` render the same page component so a chat click can use a partial reload; confirm in the Network tab at 3.3; check docs for the installed Inertia version first. No `prefetch` on chat links.
    - 3.2.2 TypeScript types for a chat-list item - DONE (`types/chat.ts` with `ChatSummary` and `ChatPreview`; exported from `types/index.ts`; verified: `types:check` 0 errors; a deliberate `chat.name` typo gave `TS2339` while the page still ran and showed blank titles; Test User's 7 chats shown; cost: PHP array and TS type are kept in sync by hand)
    - 3.2.3 Chat list UI, `ChatLayout` and the sidebar entry - DONE (`layouts/chat-layout.tsx`; new `chats/` case in `app.tsx`; `components/chat/chat-list.tsx` and `chat-avatar.tsx`; page renders the list plus an empty "Select a chat" panel on desktop; user menu reuses `UserMenuContent` in a plain dropdown, not `NavUser`; rows are not links until 3.3; no sidebar entry, since chats have their own layout; narrowing introduced for `ChatPreview | null`). Known wart: `ChatAvatar` strips the " (You)" suffix from the title to get initials; replace with a server-sent `avatar_name` in Phase 11.
    - 3.2.4 Verify in the browser with seeded data - DONE (Test User: 7 chats, Emma first; David: leaver group shows "Left", preview older than `left_at`; phone width shows list only; settings, dashboard and profile pages unchanged)
      **Status: DONE**

- 3.3 Open a chat: newest messages and timestamps
    - 3.3.1 Route `/chats/{conversation}` with `Gate::authorize('view')`; first page of messages through `visibleMessages()` - NOT STARTED
    - 3.3.2 TypeScript `Message` type and the message list UI - NOT STARTED
    - 3.3.3 Adaptive timestamps ("10:42", "Yesterday", "Mon", "12/10/26") and date separators, converted from UTC in the browser - NOT STARTED
    - 3.3.4 Auto-scroll to the newest message - NOT STARTED
    - 3.3.5 Verify: member, stranger (404), made-up id (404), leaver (read-only) - NOT STARTED
      **Status: NOT STARTED**

- 3.4 Load older messages
    - 3.4.1 Design: pagination by `id`, and Inertia merge/append versus `fetch` - NOT STARTED
    - 3.4.2 Central `fetch` wrapper (expired session 401/419, errors) - NOT STARTED
    - 3.4.3 Endpoint and infinite scroll upward, keeping the scroll position - NOT STARTED
    - 3.4.4 "Scroll to bottom" button - NOT STARTED
    - 3.4.5 Verify on the 2,000-message chat - NOT STARTED
      **Status: NOT STARTED**

- 3.5 Send a message
    - 3.5.1 Validation, endpoint and `Gate::authorize('send')` - NOT STARTED
    - 3.5.2 Retry safety with `client_uuid` (a duplicate returns the existing message) - NOT STARTED
    - 3.5.3 Composer UI and the leaver's read-only bar - NOT STARTED
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
    - 3.8.1 Two panes on desktop, list-then-chat on mobile - NOT STARTED
    - 3.8.2 Skeleton loaders, empty states, friendly error states - NOT STARTED
    - 3.8.3 Basic expired-session handling (401/419) in the central wrapper - NOT STARTED
    - 3.8.4 Rate limiting and spam protection on message sending - NOT STARTED
      **Status: NOT STARTED**

**NEXT STEP: 3.2.0 design (group name, layout, chat-list query). Before any code, request the current `app/Models/Participant.php`, `Message.php`, `User.php` and `routes/web.php`.**
