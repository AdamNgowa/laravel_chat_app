# CURRENT_STATUS

# Phase 2 — Data Model

**Status: IN PROGRESS** (last updated 2026-10-20)

Target: the chat database schema designed, migrated, modelled and protected, understood end to end. Tests come in Phase 13, so each step is verified with `php artisan migrate:status`, Tinker and the database tables. Because the app is in development, the database can be wiped and rebuilt (`php artisan migrate:fresh --seed`) whenever the schema changes.

Open items:

- Database engine: MariaDB 10.4.32 through Laravel's `mysql` driver. Before Phase 16, check Laravel 13's supported versions, whether 10.4 is still maintained, and what engine the chosen free host runs.
- Time zone: the database server's own clock uses local time (UTC+3) while Laravel writes UTC. Decide the connection time zone in 2.5.1.
- Phase 7: a reply can quote a message the viewer is not allowed to see (sent before they joined). Decide how the quote is shown.

- 2.1 Design Decisions: DONE (see earlier entries 2.1.1 to 2.1.5, unchanged)
  **Status: DONE**

- 2.2 Core Tables
    - 2.2.1 `conversations` migration - DONE
    - 2.2.2 Participants migration - DONE (`dateTime` for the window columns, because a MariaDB `timestamp` silently gets a default and an "on update" rule)
    - 2.2.3 `messages` migration - DONE (retry-safe client id, three foreign-key rules)
    - 2.2.4 Indexes - DONE (verified with `EXPLAIN`; messages are ordered by `id`)
    - 2.2.5 Run migrations and inspect the tables - DONE (`migrate:status` all Ran, `migrate:fresh --seed` rebuilds from scratch)
      **Status: DONE**

- 2.3 Tables Created Later: DEFERRED BY DESIGN (unchanged)

- 2.4 Models and Relationships
    - 2.4.1 PHP enums `ConversationType` and `MessageType` - DONE (in `app/Enums/`; backed enums, cast on the models)
    - 2.4.2 `Conversation`, `Participant` and `Message` models, with casts - DONE (verified in Tinker: enum and date casts, relationships, mass-assignment guard on `sender_id` and `conversation_id`, soft delete, bad enum value rejected, cascade)
    - 2.4.3 Relationships on `User` - NOT STARTED
    - 2.4.4 Visibility-window query rule (depends on 2.5.1, so do 2.5.1 first) - NOT STARTED
    - 2.4.5 Verify relationships in Tinker - NOT STARTED
      **Status: NOT STARTED**

- 2.5 Time and Deletion Rules
    - 2.5.1 UTC timestamp storage - NOT STARTED
    - 2.5.2 Soft deletes - NOT STARTED
      **Status: NOT STARTED**

- 2.6 Factories and Seeders
    - 2.6.1 Factories for the new models - NOT STARTED
    - 2.6.2 Seed realistic conversations and messages - NOT STARTED (extend the existing `DatabaseSeeder`)
      **Status: NOT STARTED**

- 2.7 Authorization
    - 2.7.1 Policies for participant-only access - NOT STARTED
    - 2.7.2 Verify boundaries in Tinker - NOT STARTED
      **Status: NOT STARTED**

**NEXT STEP: 2.4.1 design (enums, models and where the visibility rule lives)**
