# CURRENT_STATUS

Last updated: 2026-10-17

# Phase 1 — Authentication

**Status: CLOSED for now** (partially done, remainder deferred; see PROJECT_CHARTER.md)

# Phase 2 — Data Model

**Status: NOT STARTED**

Target: the chat database schema designed, migrated, modelled and protected, understood end to end. Tests come in Phase 13, so each step is verified with `php artisan migrate:status`, Tinker and the MySQL tables. Because the app is in development, the database can be wiped and rebuilt (`php artisan migrate:fresh`) whenever the schema changes.

- 2.1 Design Decisions (theory only, no code)
    - 2.1.1 What a chat is - DONE (conversation, participants and messages; explicit `type`, never inferred from participant count)
    - 2.1.2 Direct-chat uniqueness - DONE (two-column pair key, lower id first, nullable for groups, unique index; application check plus database constraint; self-chat allowed as pair (3, 3) with ONE participant row)
    - 2.1.3 Leaving a group - DONE (keep the participant row; `joined_at` and `left_at` timestamps define a visibility window; rejoin resets `joined_at` and clears `left_at`; history of stays goes in the Phase 6 audit log)
    - 2.1.4 "Delete for me" and deletion strategy - DONE (soft delete on messages for "delete for everyone"; per-user hidden-messages table for "delete for me"; `cleared_at` and a hide flag on the participant row for clear chat and delete chat; no soft deletes on conversations; whether the body is erased is decided in Phase 7, `body` stays nullable; deleted bodies are never sent to the client)
    - 2.1.5 Which tables now, which later - DONE (approach B: three core tables now; separate tables arrive in the phase that needs them via new migrations; the main risk is a missed column on `messages`, reduced by planning the core columns carefully)
      **Status: NOT STARTED**

- 2.2 Core Tables
    - 2.2.1 `conversations` migration - NOT STARTED
    - 2.2.2 Participants migration - NOT STARTED (per-user state lives here: role, last read, archive, pin, mute)
    - 2.2.3 `messages` migration - NOT STARTED
    - 2.2.4 Indexes - NOT STARTED (messages by conversation, conversations by latest activity, participants by user)
    - 2.2.5 Run migrations and inspect the tables - NOT STARTED (`migrate:status`, `db:table`)
      **Status: NOT STARTED**

- 2.3 Supporting Tables
    - 2.3.1 Attachments - NOT STARTED
    - 2.3.2 Read state - NOT STARTED (decide whether it is columns on the participants table or a separate table)
    - 2.3.3 Reactions - NOT STARTED
    - 2.3.4 Blocks - NOT STARTED
    - 2.3.5 Stars - NOT STARTED
    - 2.3.6 Settings - NOT STARTED
      **Status: NOT STARTED**

- 2.4 Models and Relationships
    - 2.4.1 `Conversation`, participant and `Message` models - NOT STARTED
    - 2.4.2 Relationships on `User` - NOT STARTED
    - 2.4.3 Verify relationships in Tinker - NOT STARTED
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

**NEXT STEP: 2.1.1 What a chat is (theory and design, no code)**
