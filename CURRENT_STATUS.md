# CURRENT_STATUS

# Phase 3 — Core Messaging (Without Real-Time)

**Status: IN PROGRESS** (last updated 2026-11-04)

Target: a person can log in, see their conversations, open one, read the messages they are allowed to see, scroll back through history, send a message and start a new chat, all without real-time delivery (new messages from others appear after a reload). Phase 2 is DONE (data model, factories, seeder, `ConversationPolicy`). Automated tests come in Phase 13 (charter rule), so each step is verified in the browser, in Tinker, with console calls and with `npm run types:check` (baseline: 0 errors). After `php artisan migrate:fresh --seed`, log in with `test@example.com` / `password`. Installed: Inertia v3 (`@inertiajs/react ^3.0.0`, `inertiajs/inertia-laravel ^3.0`).

Open items:

- Database engine: MariaDB 10.4.32 through Laravel's `mysql` driver. Before Phase 15 (Docker) and Phase 16, check Laravel 13's supported versions, whether 10.4 is still maintained, and what engine the chosen free host runs.
- A half-typed draft is lost when the person switches chats (the composer is keyed by chat id, by design). Per-chat drafts are parked for 3.8.
- 3.5: `crypto.randomUUID()` works only on secure pages (`https` or `localhost`); fine locally, and production must be HTTPS (Phase 16).
- An unsent message lives only in memory (the outbox in `ChatsIndex`), so a page refresh or leaving the chat pages loses it. Persisting the outbox (for example in browser storage) is a later phase if wanted.
- `OutgoingSender` ends its `post()` with an empty `.catch()` so a handled failure does not also log "Uncaught (in promise)". Trade-off: it would also hide an unexpected error thrown inside a callback. Revisit if a callback ever misbehaves silently.
- 3.8: Enter sends on every device. On phones Enter should probably add a new line (a send button exists); decide in 3.8.
- 3.8: how `useHttp` behaves on an expired session (401/419) is untested; handle it in one place.
- KNOWN DEFECT, PARKED (revisit in Phase 14): after the first older-page load in a long chat, later loads started at scrollTop 0 chain into each other. Prepend detection was proven (logs show it fires with a correction of about 3000px each time), but whether the view holds afterwards was not proven. A snapshot-correction effect is in `chat-panel.tsx`. A hypothesis: no native scroll anchoring at scrollTop 0.
- Cosmetic: the `x-inertia-partial-data` request header lists `messages` twice (probably added by the scroll prop). Harmless.
- The seeder repeats the "start a direct chat" rule (ordered pair, participant rows). Replace that with one shared place used by both the seeder and the real feature (3.7).
- Time labels are computed at render, so a page left open past midnight shows stale "Today" labels. Inertia SSR (Phase 16 decision) would render in the server's zone; keep SSR off or guard against it.
- Following messages that arrive from other people (Phase 4) needs the rule: glue to the bottom only if the person was already near it (`nearBottom` in `chat-panel.tsx` exists for this). Sending your own message always scrolls to the bottom (done). Images that load late shift the bottom (Phase 8). The "scroll to bottom" button's new-message count is not built yet, because nothing can arrive while you scroll until Phase 4.
- Phase 4: live-channel authorization must exclude people who left (use `send`-style logic, not `view`).
- Phase 6: when adding someone to a group, set their `joined_at` at or before the "X joined" system message's `created_at`. Group names arrive as a `name` column; `Conversation::titleFor` then uses the name before member names.
- Phase 7: how to show a reply that quotes a message the viewer cannot see; how "delete for everyone" rows are listed (a soft-deleted last message currently makes the chat-list preview fall back to an earlier message); the hide flag for "delete chat" and the matching change to the policy's `view`.
- Phase 11: replace the " (You)" stripping in `ChatAvatar` with a server-sent `avatar_name`.
- Phase 13: test every conversation route as a stranger (expect 404); the send endpoint (201 new, 200 repeat with the same id, 409 uuid reused across chats, 422 for empty or over 5000 characters, 404 stranger, 403 leaver, and a stranger cannot tell 422 from 404); a guard test that message listing goes through `visibleMessages()`; unit tests for `lib/time.ts` with a fixed `now`. Also test the outbox rules where practical: a retry reuses the same `client_uuid`, a failed message holds later messages of its chat, a reply for a chat that is no longer open does not touch the open chat.
- Phase 14: indexing review (the conversation list was deliberately not indexed in Phase 2); the chat list costs 4 queries plus 2 per chat and `show` looks up the viewer's membership three times (move the window rule into a `Message` query scope).
- Phase 16: plain sequential ids are used in URLs (safe because every access is authorized and non-members get an identical 404). Revisit if random public ids are wanted.

Rules carried from Phase 2:

- All message-listing code goes through `Participant::visibleMessages()`, never `Message::query()` directly. This includes the chat list's last-message preview: a cleared or left chat must not preview a message the viewer can no longer see.
- Every conversation route calls `Gate::authorize` (`view` to read, `send` to post). Non-members get 404; a leaver denied posting gets 403 with a message. Hiding a button in the UI protects nothing.
- Server-set fields (`sender_id`, `conversation_id`, `type`) are never mass-assignable and never come from a request.
- PHP runs in UTC and the database connection is pinned to `+00:00`. Times are converted to the viewer's zone only in the browser.
- Rows whose times are compared (messages, participants) are written through their models (microsecond precision), never raw `DB::table()` inserts.

Rules adopted (Phase 3):

- Data a page needs on arrival (chat list, first page of messages) arrives as Inertia props, wrapped in closures so a partial reload computes only what it asks for. The policy call sits outside the closures, so it runs on every request, including each older-page request.
- `/chats` and `/chats/{conversation}` render the same page component (`chats/index`). A chat click is a partial reload: chat rows are `<a>` elements calling `router.visit(url, { only: ['activeChat','messages'], reset: ['messages'], preserveState: true })`. `reset` is a visit option, not a `Link` prop. Without `reset`, two chats' messages would merge. No `prefetch` on chat links (a cached chat would show stale messages).
- `messages` is its own top-level `Inertia::scroll()` prop, a cursor paginator (`visibleMessages()->latest('id')->cursorPaginate(50)`), newest first. The client reverses a copy for display (`messages` is typed `readonly`).
- `MessageResource` is the one place that defines a message's JSON shape; paging and sending both use it (`MessageResource::make($m)->resolve()`).
- Sending uses Inertia v3's `useHttp` (plain JSON, no page visit): `POST chats/{conversation}/messages`, route `chats.send`, `MessageController@store`, `StoreMessageRequest`. `authorize()` runs `Gate::authorize('send')` BEFORE validation, so a stranger cannot tell 422 from 404. Retry safety: the client makes `client_uuid` when a draft starts and keeps it across failed attempts; the server returns 201 for new, 200 with the existing message for a repeat, 409 if the uuid was used for another chat, and the `(sender_id, client_uuid)` unique index settles races. Only success makes a new uuid.
- A sent message is added with `router.prependToProp("messages.data", message)` (nested path verified), then `router.reload({ only: ["chats"] })` refreshes the list. A reply that arrives after the person switched chats is ignored (the message is saved and shows when they return).
- Optimistic sending is hand-built (docs: `useHttp().optimistic()` only edits the form's own data, and `router.optimistic()` is for router visits, while our endpoint returns JSON). The outbox state lives in `pages/chats/index.tsx` (`useOutbox`), so it survives closing the panel (phone back-arrow) and switching chats. Each pending message gets its own headless `OutgoingSender` (one `useHttp` per request, as the docs advise). Only the oldest unsent message of a chat may send, so messages reach the server in order; a failed one holds the rest of its chat back until Retry or Delete. `MessageResource` sends `client_uuid` for the viewer's own messages only (null otherwise), so a pending bubble hides itself the instant its saved copy is in the list.
- Every 404 answered to a JSON client has one body (`{"message": "Not Found"}`), set in `bootstrap/app.php` `withExceptions`, so "no such chat" and "not your chat" cannot be told apart.
- An open chat has the URL `/chats/{conversation}` (plain integer id). Refresh, Back, a new tab and phone Back all work from the URL alone.
- Chat routes live in `routes/chats.php` (required from `web.php`, like `settings.php`), inside the `auth` and `verified` group, named `chats.*`. Wayfinder names its generated file from the part of the route name before the dot, so a misnamed route breaks the typed import.
- React calls Wayfinder's generated route functions (`showChat.url(id)`, `sendMessage.url(id)`), never hand-typed URL strings.
- Times are converted only through `resources/js/lib/time.ts`. Message bodies are rendered as text (React escapes them); never use `dangerouslySetInnerHTML` for a body.
- One page of messages is `PAGE_SIZE = 50` (a constant in `ChatController`). The longest message is 5000 characters (`StoreMessageRequest::MAX_BODY_LENGTH`, mirrored in the composer).

- 3.1 Architecture: how data reaches the browser
    - 3.1.1 Props versus JSON `fetch` - DONE (props for page arrival; Inertia's scroll prop for older messages; `useHttp` for sending)
    - 3.1.2 URL shape for an open chat - DONE (`/chats/{conversation}`)
      **Status: DONE**

- 3.2 Chat list (backend and UI)
    - 3.2.0 Design - DONE. The list starts from the viewer's participant rows; each row is a small shape (id, type, title, preview, last_activity_at, has_left); preview and ordering are per viewer through `visibleMessages()` (no global `last_message_at` column, because it would leak); the per-chat N+1 query is accepted for now; titles come from one server function (`Conversation::titleFor`); dedicated `ChatLayout`, with the starter's `UserMenuContent` (not `NavUser`, which needs the sidebar).
    - 3.2.1 Route, controller and Inertia props for `/chats` - DONE
    - 3.2.2 TypeScript types for a chat-list item - DONE (`types/chat.ts`)
    - 3.2.3 Chat list UI and `ChatLayout` - DONE
    - 3.2.4 Verify in the browser with seeded data - DONE
      **Status: DONE**

- 3.3 Open a chat: newest messages and timestamps
    - 3.3.1 Route `/chats/{conversation}` with `Gate::authorize('view')` - DONE (superseded in 3.4: messages moved to their own prop)
    - 3.3.2 TypeScript `Message` type and the message list UI - DONE (`message-bubble.tsx`, `chat-panel.tsx`; read-only bar for leavers). Lesson: a route misnamed `chat.show` broke the typed import and the compiler caught it.
    - 3.3.3 Adaptive timestamps and date separators from UTC - DONE (`lib/time.ts`)
    - 3.3.4 Auto-scroll to the newest message - DONE (`useLayoutEffect` keyed on `chat.id`)
    - 3.3.5 Verify - DONE (member, stranger 404, made-up id 404, leaver read-only; the Network tab shows a chat click is a partial reload)
      **Status: DONE**

- 3.4 Load older messages
    - 3.4.1 Design - DONE (Option A: Inertia `<InfiniteScroll reverse>` + `Inertia::scroll()`, cursor pagination)
    - 3.4.2 Backend: older messages through `visibleMessages()` with a cursor - DONE
    - 3.4.3 Frontend: load older as you scroll up - DONE (known polish: new pages appear abruptly; known defect: see Open items)
    - 3.4.4 "Scroll to bottom" button - DONE (`nearBottom` flag, 100px threshold; the new-message count waits for Phase 4)
    - 3.4.5 Verify on the big chat - DONE (Test User sees 1950 messages in chat 5 = 39 full pages, `next_cursor: null` at the end, matches Tinker; David's `/chats/7` stops at group creation and shows nothing after `left_at`; headers confirmed: `x-inertia-partial-data: activeChat,messages` and `x-inertia-reset: messages`)
      **Status: DONE** (with the parked scroll defect)

- 3.5 Send a message
    - 3.5.1 Validation, endpoint, `Gate::authorize('send')` and retry safety with `client_uuid` - DONE (console checks: 201, 200 on repeat, 422 for empty and over-long, 404 for strangers); pending checks listed in Open items
    - 3.5.2 One shared message shape (`MessageResource`) - DONE
    - 3.5.3 Composer UI (`message-composer.tsx`, `useHttp`) - DONE (verified: send, offline error message with the text kept, retry after going back online)
    - 3.5.4 Add to the list, refresh the chat list, scroll to your own new message - DONE
      **Status: DONE**

- 3.6 Optimistic sending and retry
    - 3.6.1 Enter to send (Shift+Enter for a new line; ignored while an input method is composing) - DONE
    - 3.6.2 Outbox: pending bubble at once, confirmed by the server, one message at a time per chat in order, a failure holds the rest of its chat back - DONE (all nine checks passed: instant bubble, slow-network order 1-2-3, offline red bubble with Retry and Delete, waiting message sends after a retry, discard, switching chats and phone back-arrow do not lose or misplace a message)
    - 3.6.3 Failure state and retry (same `client_uuid`, so a retry cannot duplicate) - DONE
      **Status: DONE**

- 3.7 Search users and start a chat
    - 3.7.1 One shared place for the direct-chat rule (used by the seeder too) - NOT STARTED
    - 3.7.2 User search endpoint and UI - NOT STARTED
    - 3.7.3 Start or open the chat; a duplicate-key race returns the existing chat - NOT STARTED
      **Status: NOT STARTED**

- 3.8 Responsive layout, loading and error states, protection
    - 3.8.1 Two panes on desktop, list-then-chat on mobile (basic version exists; review it) - NOT STARTED
    - 3.8.2 Skeleton loaders, empty states, friendly error states - NOT STARTED
    - 3.8.3 Expired-session handling (401/419) in one place - NOT STARTED
    - 3.8.4 Rate limiting and spam protection on message sending - NOT STARTED
    - 3.8.5 Per-chat drafts (optional polish) - NOT STARTED
      **Status: NOT STARTED**

**NEXT STEP: 3.7 Search users and start a chat. Design first (shared direct-chat rule used by the seeder and the real feature, user search, start-or-open). Before any code, request the current `database/seeders/DatabaseSeeder.php`, `app/Models/User.php`, `app/Models/Participant.php`, `app/Enums/ConversationType.php`, `app/Policies/ConversationPolicy.php` and `resources/js/components/chat/chat-list.tsx`.**
