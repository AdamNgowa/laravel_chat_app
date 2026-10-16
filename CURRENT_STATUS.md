# CURRENT_STATUS

# Phase 1 — Authentication (Email & Google)

**Status: NOT STARTED** (last updated 2026-10-16)

Target: working email and Google sign-in on a fresh Laravel + React + TypeScript project, understood end to end. TypeScript is learned inside the real files we read and write, starting with the login page. Tests come in Phase 13.

> Restarted on 2026-10-16: the first scaffold was discarded, the old Phase 1 (setup and TypeScript exercises) was removed from the charter, and phases were renumbered.

- 1.1 Fresh Project Setup
    - 1.1.1 Create the project from the Laravel React Starter Kit - NOT STARTED (Fortify, not WorkOS)
    - 1.1.2 Development database - NOT STARTED (`chat_app`, `utf8mb4_unicode_ci`, set in `.env`, run `php artisan migrate`, confirm `migrate:status` shows the passkeys and two-factor migrations as Ran)
    - 1.1.3 Run the app - NOT STARTED (`composer run dev`)
    - 1.1.4 Baseline type-check - NOT STARTED (run `npm run types:check` before changing anything and record the result; the previous scaffold reported a Wayfinder `"query"` method error in a generated file)
    - 1.1.5 Version control - NOT STARTED (init, confirm `.env` is not tracked, add the three project documents, first commit)
      **Status: NOT STARTED**

- 1.2 How Login Works
    - 1.2.1 Sessions versus tokens, CSRF, password hashing - NOT STARTED
    - 1.2.2 Hand-built minimal login on a throwaway branch - NOT STARTED
    - 1.2.3 Trace the starter kit flow from form to session - NOT STARTED (`login.tsx`, Wayfinder form helpers, Fortify; first TypeScript concepts introduced here)
    - 1.2.4 Typed authentication state - NOT STARTED (`types/auth.ts`, shared props, `string | null`)
      **Status: NOT STARTED**

- 1.3 Account Flows
    - 1.3.1 Registration, logout, remember me - NOT STARTED
    - 1.3.2 Email verification - NOT STARTED
    - 1.3.3 Password reset - NOT STARTED
    - 1.3.4 Protected and guest-only routes - NOT STARTED
      **Status: NOT STARTED**

- 1.4 Stronger Sign-in
    - 1.4.1 Login rate limiting - NOT STARTED
    - 1.4.2 Two-factor authentication (trace the flow) - NOT STARTED
    - 1.4.3 Passkeys (trace the flow) - NOT STARTED
      **Status: NOT STARTED**

- 1.5 Google Sign-in
    - 1.5.1 OAuth explained from first principles - NOT STARTED
    - 1.5.2 Google OAuth credentials (verify card-free first) - NOT STARTED
    - 1.5.3 Laravel Socialite integration - NOT STARTED
    - 1.5.4 Linking Google to an existing email account, handling accounts created both ways - NOT STARTED
    - 1.5.5 Test Google sign-in locally - NOT STARTED
      **Status: NOT STARTED**

- 1.6 Hardening
    - 1.6.1 Expired sessions: redirect to login on 401 / 419 - NOT STARTED
    - 1.6.2 Disabled submit buttons while a request is in flight - NOT STARTED
    - 1.6.3 Security headers - NOT STARTED
    - 1.6.4 Structured logging, and logging of authentication events (never tokens or passwords) - NOT STARTED
      **Status: NOT STARTED**

**NEXT STEP: 1.1.1 Create the project from the Laravel React Starter Kit, then 1.1.4 baseline type-check**
