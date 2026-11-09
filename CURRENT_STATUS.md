# CURRENT_STATUS

# Phase 4 — Real-Time

**Status: NOT STARTED** · last updated 2026-11-09

This file covers the **current phase only**. What stays true across phases, what is done, and what comes later all live in `PROJECT_CHARTER.md` (the constant). Step-by-step history of Phase 3: `CURRENT_STATUS_PHASE_3.md`. File layout: `FOLDER_STRUCTURE.md`.

**Goal:** other people's messages, chat-list changes, typing, delivery ticks and presence appear live, without a reload. Details and the requirements carried in from earlier phases: Phase 4 in the charter.

**Working notes**

- Tests are written together in Phase 13 (charter rule). Until then each step is checked in the browser, in Tinker, with console calls and with `npm run types:check` (baseline: 0 errors).
- After `php artisan migrate:fresh --seed` (wipes dev data), log in as `test@example.com` / `password`.
- Stack: Laravel 13, Inertia v3 (`@inertiajs/react ^3.0.0`, `inertiajs/inertia-laravel ^3.0`), React + TypeScript, MariaDB 10.4.32 through the `mysql` driver.
- Before editing any file, ask for its current version.

## Next

1. Phase 4 design discussion before any code: polling, long polling and WebSockets compared; what Reverb and Echo are; why a channel needs authorization; what changes in the architecture.
2. Then the steps below.

---

## Starting point: what already exists

- A message is added to the open chat on the client with `router.prependToProp("messages.data", message)`; the chat list is refreshed with `router.reload({ only: ["chats"] })`. Live delivery will probably replace the reload with event-driven updates.
- A pending bubble hides itself when a saved message with the same `client_uuid` is in the list.
- `MessageResource` is the one JSON shape of a message.
- `ChatPanel` tracks `nearBottom` (within 100 px of the end) and scrolls to the bottom only for your own sends.
- Routes are in `routes/chats.php`; every conversation route calls `Gate::authorize`. Rate limiters live in `AppServiceProvider`.
- `ChatsIndex` (`pages/chats/index.tsx`) owns the outbox, the drafts, the session-expired banner and the opening skeleton.

---

## Known limits (accepted for now)

- **Scroll defect (revisit in Phase 14):** after the first older-page load in a long chat, later loads at `scrollTop` 0 chain into each other. Detection was proven (a correction of about 3000 px fires each time); whether the view holds afterwards was not. A snapshot-correction effect is in `chat-panel.tsx`. Hypothesis: no native scroll anchoring at `scrollTop` 0.
- Unsent messages and drafts live in memory only; a page reload loses them. Saving them in browser storage is optional later.
- Enter sends on every device. On phones it should probably add a new line.
- Retry after logging in as a _different_ user in another tab would send as that new user (the page was not reloaded). Policies still protect every chat. Reloading avoids it.
- The 419 handler flashes a toast and redirects back. Whether the toast shows was not observed. Remove the flash lines if it never appears.
- `OutgoingSender` and `NewChatPanel` end their request with an empty `.catch()`. It stops a duplicate "Uncaught (in promise)" log but would also hide an unexpected error inside a callback.
- `Retry-After` seconds are not read (unconfirmed that the callback exposes headers).
- A non-validation failure of `router.post` (403, 500) shows Inertia's default error overlay.
- Search shows names only. Blocking does not exist: any verified user can start a chat with any other.
- Time labels are computed at render, so a page open past midnight shows a stale "Today". SSR (Phase 16) would render in the server's zone: keep it off or guard it.
- `crypto.randomUUID()` needs HTTPS or `localhost`. Production must be HTTPS.
- Cosmetic: the `x-inertia-partial-data` header lists `messages` twice. Harmless.
- Rate limits cover only three write endpoints. Reading (opening chats, paging) is not throttled. Counters use the cache, so `CACHE_STORE` must not be `array`; several servers need a shared store such as Redis.
- Account abuse (many accounts) is not handled. Chat routes already require `verified`. Phase 1 leftovers: check whether Fortify throttles registration; consider a CAPTCHA and disposable-email checks.

---

## Rules carried from Phase 2

- Messages are listed only through `Participant::visibleMessages()`, including the chat-list preview.
- Every conversation route calls `Gate::authorize` (`view` to read, `send` to post). Non-members get 404; a leaver denied posting gets 403. Hiding a button protects nothing.
- `sender_id`, `conversation_id` and `type` are never mass-assignable and never come from a request.
- The server runs in UTC (database connection pinned to `+00:00`). Times convert to the viewer's zone only in the browser.
- Rows whose times are compared are written through their models (microsecond precision), never through raw `DB::table()` inserts.

## Rules adopted in Phase 3

**Getting data to the page**

- Page data arrives as Inertia props inside closures, so a partial reload computes only what it asks for. The policy call sits outside the closures and runs every time, including each older-page request.
- `/chats` and `/chats/{conversation}` share one page component, `chats/index`. The URL is the plain integer id, so refresh, Back and new tabs all work.
- Opening a chat is a partial visit: `router.visit(url, { only: ['activeChat','messages'], reset: ['messages'], preserveState: true })`. `reset` is a visit option, not a `Link` prop; without it two chats' messages merge. No `prefetch` on chat links.
- `messages` is its own `Inertia::scroll()` prop: `visibleMessages()->latest('id')->cursorPaginate(50)`, newest first. The client shows a reversed copy. Page size is `ChatController::PAGE_SIZE`.
- `MessageResource` is the one JSON shape of a message, for paging and sending.
- A visit that must not reset page state passes `preserveState: true`; otherwise Inertia remounts the page and the outbox is lost.

**Sending**

- Sending uses `useHttp` (plain JSON): `POST chats/{conversation}/messages`, route `chats.send`, `MessageController@store`, `StoreMessageRequest`. `authorize()` runs `Gate::authorize('send')` before validation, so a stranger cannot tell 422 from 404. Longest message: 5000 characters (`StoreMessageRequest::MAX_BODY_LENGTH`, mirrored in the composer).
- Retry safety: `client_uuid` is made when a draft starts and kept across failed attempts. The server answers 201 new, 200 repeat (same message), 409 uuid used in another chat; the unique `(sender_id, client_uuid)` index settles races.
- Optimistic sending is hand-built, because Inertia's `optimistic()` does not touch page props and our endpoint returns JSON. The outbox (`useOutbox`) lives in `ChatsIndex`, so it survives switching chats and the phone back arrow. Each pending message has one invisible `OutgoingSender`. The oldest unsent message of a chat sends first; a failed one holds the rest until Retry or Delete.
- On success: `router.prependToProp("messages.data", message)`, then `router.reload({ only: ["chats"] })`. A reply for a chat that is no longer open is ignored (the message is saved and shows on return). `MessageResource` returns `client_uuid` for your own messages only, so a pending bubble hides when its saved copy arrives.
- Each chat keeps its own half-written message (`useDrafts` in `ChatsIndex`).
- Starting a chat: `router.post` to `POST chats` (`chats.store`, `ChatController@store`), answered with a redirect to `chats.show`. `user_id` must exist and not be yours (same 422 text for both). The direct-chat rule lives only in `App\Actions\Chat\StartDirectChat`; the seeder and the controller both call it, and `ConversationFactory` builds groups only.
- User search: `GET users/search?q=` (`UserSearchController`): 2 to 50 characters, escaped `LIKE`, `id` and `name` only, never the searcher, at most 10. The client waits 300 ms after typing (`useDebouncedValue`), uses `useHttp().get` with the word in the URL, and calls `cancel()` before each new search.

**Errors and limits**

- Failures become words in two places only: `describeFailure(status)` (`lib/request-failure.ts`; 401 and 419 both mean "session ended") and `pages/error.tsx`.
- When the session ends, a banner offers a login link that opens in a new tab, so unsent messages survive. A successful send clears it.
- Every JSON 404 has one body (`{"message":"Not found"}`), set in `bootstrap/app.php`, so "no such chat" and "not your chat" look identical.
- The friendly error page is only for page visits with `APP_DEBUG=false`. 403 and 404 use the same wording. A 419 on a page visit redirects back with a toast.
- Rate limits are counted per signed-in user (named limiters in `AppServiceProvider`): `messages` 30 a minute, `user-search` 60, `start-chat` 20. A 429 is an ordinary failed send: red bubble, and Retry reuses the same `client_uuid`.
- A loading state that could flash on a fast connection is delayed (`useDelayedFlag`, 150 ms).

**Conventions**

- Chat routes live in `routes/chats.php`, in the `auth` + `verified` group, named `chats.*`. Wayfinder names its generated file from the part of the route name before the dot, so a misnamed route breaks the typed import.
- React calls Wayfinder's functions (`showChat.url(id)`, `sendMessage.url(id)`), never hand-typed URLs.
- Times convert only through `lib/time.ts`. Message bodies render as text; never use `dangerouslySetInnerHTML`.

---

## Steps

### 4.1 Compare polling, long polling and WebSockets: NOT STARTED

- Concepts and trade-offs; why we choose WebSockets.

### 4.2 Reverb and Echo setup: NOT STARTED

- Install and configure the server and the client; confirm a first event arrives.

### 4.3 Private channels and authorization: NOT STARTED

- One channel per conversation, authorized with the membership rule (a leaver is excluded).

### 4.4 Live message delivery: NOT STARTED

- Broadcast a saved message; add it on the client without duplicating your own; follow-the-bottom rule and the scroll button's count.

### 4.5 Live chat-list updates and reordering: NOT STARTED

- Preview, order and unread-style changes without a reload.

### 4.6 Message status ticks: NOT STARTED

- Sending, sent, delivered, read.

### 4.7 Typing indicators: NOT STARTED

- One name in a direct chat, several in a group.

### 4.8 Online status and last seen: NOT STARTED

- Presence channels.

### 4.9 Reconnect banner and automatic reconnection: NOT STARTED

- Show the connection state; recover and catch up on missed messages.
