# CURRENT_STATUS

# Phase 2 — Data Model

**Status: DONE** (last updated 2026-10-23)

Target: the chat database schema designed, migrated, modelled and protected, understood end to end. Tests come in Phase 13, so each step is verified with `php artisan migrate:status`, Tinker and the database tables. Because the app is in development, the database can be wiped and rebuilt (`php artisan migrate:fresh --seed`) whenever the schema changes.

Open items:

- Database engine: MariaDB 10.4.32 through Laravel's `mysql` driver. Before Phase 15 (Docker) and Phase 16, check Laravel 13's supported versions, whether 10.4 is still maintained, and what engine the chosen free host runs.
- Phase 3: the seeder repeats the "start a direct chat" rule (ordered pair, participant rows). Replace that duplication with one shared place that both the seeder and the real feature use.
- Phase 3: every conversation route must call `Gate::authorize` (`view` to read, `send` to post). The frontend should show a leaver a read-only bar, not an error page.
- Phase 4: live-channel authorization must exclude people who left (use `send`-style logic, not `view`).
- Phase 6: when adding someone to a group, set their `joined_at` at or before the "X joined" system message's `created_at`. The strict visibility rule would otherwise hide that message from the person it is about.
- Phase 7: a reply can quote a message the viewer is not allowed to see (sent before they joined). Decide how the quote is shown. Also decide how "delete for everyone" rows are listed (soft-deleted rows are hidden by default, but a "message deleted" placeholder needs them).
- Phase 7: add the hide flag on the participant row ("delete chat"), and change the policy's `view` to "has a participant row and has not hidden the chat". Also add the separate "delete for me" table.
- Phase 14: indexing review. No extra index was added for the conversation list in Phase 2.
- Phase 16: plain sequential ids are used in URLs for now (safe because every access is authorized and non-members get an identical 404). Revisit if public or random ids are wanted.

Rules adopted (2.5.1):

- PHP runs in UTC (`config/app.php`).
- The database connection is pinned to `+00:00` (`config/database.php`, `mysql` and `mariadb` blocks).
- Our own tables never rely on database-generated times: no `useCurrent()`, no `DB::raw('now()')`, no `DEFAULT CURRENT_TIMESTAMP`. Laravel's `failed_jobs` table has one, which is harmless because the session is UTC.
- Times are converted to the viewer's zone only at the edge, in the browser (Phase 3).
- Pinning on day one matters: old TIMESTAMP rows written under a different session zone would read hours off after the pin.
- Rows whose times are compared (messages, participants) are written through their models, which store microseconds. Raw `DB::table()` inserts are not used for them.

Rules adopted (2.4.4 to 2.7):

- All message-listing code goes through `Participant::visibleMessages()`, never `Message::query()` directly. A Phase 13 test should guard this.
- Server-set fields (`sender_id`, `conversation_id`) are never mass-assignable and never come from a request.
- Non-members get a 404 on every conversation route (hides existence, prevents id enumeration). A member denied one specific action (a leaver posting) gets a 403 with a message.
- Hiding a button in the UI protects nothing: the policy must run on every route. A Phase 13 test should visit every conversation route as a stranger and expect 404.

- 2.1 Design Decisions: DONE (see earlier entries 2.1.1 to 2.1.5, unchanged)
  **Status: DONE**

- 2.2 Core Tables
    - 2.2.1 `conversations` migration - DONE
    - 2.2.2 Participants migration - DONE (`dateTime` for the window columns, because a MariaDB `timestamp` silently gets a default and an "on update" rule)
    - 2.2.3 `messages` migration - DONE (retry-safe client id, three foreign-key rules)
    - 2.2.4 Indexes - DONE (verified with `EXPLAIN`; messages are ordered by `id`)
    - 2.2.5 Run migrations and inspect the tables - DONE (`migrate:status` all Ran, `migrate:fresh --seed` rebuilds from scratch)
      **Status: DONE**

- 2.3 Tables Created Later: DEFERRED BY DESIGN (unchanged: read state Phase 5, reactions/stars/hidden-messages Phase 7, attachments Phase 8, blocks Phase 9, settings Phase 11)

- 2.4 Models and Relationships
    - 2.4.1 PHP enums `ConversationType` and `MessageType` - DONE (in `app/Enums/`; backed enums, cast on the models)
    - 2.4.2 `Conversation`, `Participant` and `Message` models, with casts - DONE (verified in Tinker: enum and date casts, relationships, mass-assignment guard on `sender_id` and `conversation_id`, soft delete, bad enum value rejected, cascade)
    - 2.4.3 Relationships on `User` - DONE (`participants`, `sentMessages`; verified in Tinker, including cascade)
    - 2.4.4 Visibility-window query rule - DONE (`Participant::visibleMessages()`; window is the later of `joined_at` and `cleared_at` up to `left_at`; ties hidden; boundaries formatted with microseconds; verified to the microsecond in Tinker; bug fixed: `m` month used instead of `i` minutes)
    - 2.4.5 Verify relationships in Tinker - DONE (verified across 2.4.2 and 2.4.3)
      **Status: DONE**

- 2.5 Time and Deletion Rules
    - 2.5.1 UTC timestamp storage - DONE (demonstrated that a TIMESTAMP shifts with the session zone and a DATETIME does not; `'timezone' => '+00:00'` in both connection blocks; database rebuilt; verified `@@session.time_zone` is `+00:00` and no ON UPDATE rule exists)
    - 2.5.2 Soft deletes - DONE (messages only, verified in Tinker at 2.4.2; none on conversations or participants by design)
      **Status: DONE**

- 2.6 Factories and Seeders
    - 2.6.0 Design - DONE (factories build one valid row; the seeder builds a reachable world; states for direct, group, left, cleared, system, reply, deleted; messages created in chronological order; dev-only guard before Phase 16)
    - 2.6.1 Factories for the new models - DONE (`ConversationFactory::direct` builds the ordered pair and the membership rows, one for a self-chat; `ParticipantFactory` joinedAt/leftAt/clearedAt; `MessageFactory` system/sentAt/replyingTo; built-in `trashed()`; `for($user, 'sender')` works; verified in Tinker, including `visibleMessages()` on factory data)
    - 2.6.2 Seed realistic conversations and messages - DONE (verified: 8 conversations, 19 participants, 2,330 messages; all three invariants return 0; visibleMessages() works on seeded data; guard refuses to run in production)
      **Status: DONE**

- 2.7 Authorization
    - 2.7.0 Authorization design - DONE (theory). `view` = has participant row (Phase 7 adds "and chat not hidden"); `send` = `view` and `left_at` is null. Non-members get 404 on every conversation route (hides existence, prevents id enumeration); members denied a specific action (a leaver posting) get 403. Sequential ids kept, because every access is authorized. Phase 4: live-channel authorization must exclude leavers. Phase 13: test every conversation route as a stranger expecting 404.
    - 2.7.1 Write ConversationPolicy (view, send) - DONE (`app/Policies/ConversationPolicy.php`; both methods return a `Response`; view = has a participant row, else `denyAsNotFound()`; send = view and left_at null, else `deny()` with a message for leavers; unused generated stubs removed; auto-discovery confirmed via `Gate::getPolicyFor`)
    - 2.7.2 Verify authorization boundaries in Tinker - DONE (stranger 404 on view and send; member allowed; leaver can view but not send, with message)
    - Phase 3 TODO: call `Gate::authorize` on every conversation route; Phase 13 test every route as a stranger expecting 404
      **Status: DONE**

**NEXT STEP: Phase 3 — Core Messaging (Without Real-Time). Begin with Step 1 (architecture and theory, no code). Request the current `CURRENT_STATUS.md`, `PROJECT_CHARTER.md` and `FOLDER_STRUCTURE.md` first.**
