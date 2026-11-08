# FOLDER_STRUCTURE.md

> Baseline taken from the previous scaffold. Regenerate after the new project is created, because the real scaffold is the source of truth.

```text
chat-app/
├── .codex/
│   └── config.toml                  # AI-assistant config (Laravel Boost helper)
├── .editorconfig                    # shared editor rules (line endings, indentation)
├── .env.example                     # template for .env (the real .env is not tracked)
├── .gitattributes
├── .github/
│   ├── dependabot.yml               # automatic dependency update pull requests
│   └── workflows/
│       └── tests.yml                # runs the tests on GitHub
├── .gitignore
├── .npmrc
├── CURRENT_STATUS.md
├── FOLDER_STRUCTURE.md
├── PROJECT_CHARTER.md
├── artisan                          # Laravel command-line entry point
├── components.json                  # shadcn/ui settings
├── composer.json / composer.lock    # PHP dependencies
├── package.json / package-lock.json # JavaScript dependencies and scripts
├── phpstan.neon                     # PHP static analysis settings
├── phpunit.xml                      # test configuration
├── pint.json                        # PHP formatter settings
├── pnpm-workspace.yaml              # leftover; npm is the package manager in use
├── tsconfig.json                    # TypeScript rules (strict on, `@/*` = resources/js/*)
├── vite.config.ts                   # Vite+ build, lint and format settings
│
├── app/
│   ├── Actions/
│   │   ├── Chat/
│   │   │   └── StartDirectChat.php     # the one recipe for a direct chat (ordered pair, members, race-safe)
│   │   └── Fortify/
│   │       ├── CreateNewUser.php           # registration logic and validation
│   │       └── ResetUserPassword.php       # password reset logic
│   ├── Concerns/
│   │   ├── PasswordValidationRules.php     # shared password rules
│   │   └── ProfileValidationRules.php      # shared profile rules
│   ├── Enums/
│   │   ├── ConversationType.php            # direct | group
│   │   └── MessageType.php                 # text | system
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── ChatController.php          # chat list, open chat (first page of messages), start a chat
│   │   │   ├── Controller.php
│   │   │   ├── MessageController.php       # saves a sent message (retry-safe); replies with JSON
│   │   │   ├── UserSearchController.php    # JSON: find people by name for "start a chat"
│   │   │   └── Settings/
│   │   │       ├── ProfileController.php   # profile edit, update, delete account
│   │   │       └── SecurityController.php  # security page, password update
│   │   ├── Middleware/
│   │   │   ├── HandleAppearance.php        # light/dark preference
│   │   │   └── HandleInertiaRequests.php   # shared props sent to every page
│   │   ├── Requests/
│   │   │   ├── StoreMessageRequest.php     # who may send (policy), and the rules for a message
│   │   │   └── Settings/
│   │   │       ├── PasswordUpdateRequest.php
│   │   │       ├── ProfileDeleteRequest.php
│   │   │       ├── ProfileUpdateRequest.php
│   │   │       └── TwoFactorAuthenticationRequest.php
│   │   └── Resources/
│   │       └── MessageResource.php         # the one JSON shape of a message, for paging and sending
│   ├── Models/
│   │   ├── Conversation.php                # a direct or group chat
│   │   ├── Message.php                     # one message; soft deletes
│   │   ├── Participant.php                 # a user's membership and visibility window
│   │   └── User.php                        # the users table as a class
│   ├── Policies/
│   │   └── ConversationPolicy.php          # who may view and post in a conversation
│   └── Providers/
│       ├── AppServiceProvider.php
│       └── FortifyServiceProvider.php      # connects Fortify to our actions, pages and limiters
│
├── bootstrap/
│   ├── app.php                      # assembles the application, registers middleware
│   ├── providers.php
│   └── cache/.gitignore
│
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── database.php
│   ├── filesystems.php
│   ├── fortify.php                  # authentication features and settings
│   ├── inertia.php
│   ├── logging.php
│   ├── mail.php
│   ├── queue.php
│   ├── services.php
│   └── session.php
│
├── database/
│   ├── .gitignore
│   ├── factories/
│   │   ├── ConversationFactory.php  # fake groups only; direct chats come from StartDirectChat
│   │   ├── MessageFactory.php       # fake messages; system, sentAt and replyingTo states
│   │   ├── ParticipantFactory.php   # fake memberships; joinedAt, leftAt and clearedAt states
│   │   └── UserFactory.php          # fake users for tests
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   ├── 0001_01_01_000002_create_jobs_table.php
│   │   ├── 2024_01_01_000000_create_passkeys_table.php
│   │   ├── 2025_08_14_170933_add_two_factor_columns_to_users_table.php
│   │   ├── 2026_10_18_234922_create_conversations_table.php
│   │   ├── 2026_10_19_174747_create_participants_table.php
│   │   └── 2026_10_20_065930_create_messages_table.php
│   └── seeders/
│       └── DatabaseSeeder.php
│
├── public/                          # the only folder served directly by the web server
│   ├── .htaccess
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── index.php                    # every request enters here
│   └── robots.txt
│
├── resources/
│   ├── css/
│   │   └── app.css                  # Tailwind 4 configuration lives in CSS
│   ├── views/
│   │   └── app.blade.php            # the single HTML shell React mounts into
│   └── js/
│       ├── app.tsx                  # entry point, picks layouts by page name
│       ├── actions/                 # GENERATED by Wayfinder (git-ignored): one TypeScript file per controller
│       ├── routes/                  # GENERATED by Wayfinder (git-ignored): named route helpers
│       ├── wayfinder/               # GENERATED by Wayfinder (git-ignored): shared helper types
│       ├── components/              # reusable app pieces
│       │   ├── alert-error.tsx
│       │   ├── app-content.tsx
│       │   ├── app-header.tsx
│       │   ├── app-logo-icon.tsx
│       │   ├── app-logo.tsx
│       │   ├── app-shell.tsx
│       │   ├── app-sidebar-header.tsx
│       │   ├── app-sidebar.tsx
│       │   ├── appearance-tabs.tsx
│       │   ├── breadcrumbs.tsx
│       │   ├── delete-user.tsx
│       │   ├── heading.tsx
│       │   ├── input-error.tsx
│       │   ├── manage-passkeys.tsx
│       │   ├── manage-two-factor.tsx
│       │   ├── nav-footer.tsx
│       │   ├── nav-main.tsx
│       │   ├── nav-user.tsx
│       │   ├── passkey-item.tsx
│       │   ├── passkey-register.tsx
│       │   ├── passkey-verify.tsx
│       │   ├── password-input.tsx
│       │   ├── text-link.tsx
│       │   ├── two-factor-recovery-codes.tsx
│       │   ├── two-factor-setup-modal.tsx
│       │   ├── user-info.tsx
│       │   ├── user-menu-content.tsx
│       │   ├── chat/                # pieces of the chat screen
│       │   │   ├── chat-avatar.tsx  # initials, or a people icon for groups
│       │   │   ├── chat-list.tsx    # left pane: header, user menu and chat rows
│       │   │   ├── chat-panel-skeleton.tsx  # grey placeholder shown while the next chat loads
│       │   │   ├── chat-panel.tsx   # the open chat: header, messages, composer or read-only bar
│       │   │   ├── message-bubble.tsx
│       │   │   ├── message-composer.tsx  # the text box and Send; hands text to the outbox
│       │   │   ├── new-chat-panel.tsx    # find someone by name (debounced search) and start a chat
│       │   │   ├── outgoing-bubble.tsx   # a pending or failed message (dimmed or red, Retry/Delete)
│       │   │   ├── outgoing-sender.tsx   # invisible; one per pending message; does the sending
│       │   │   └── session-expired-banner.tsx  # "log in again" strip; the login link opens a new tab
│       │   └── ui/                  # shadcn/ui building blocks (owned source files)
│       │       ├── alert.tsx, avatar.tsx, badge.tsx, breadcrumb.tsx, button.tsx
│       │       ├── card.tsx, checkbox.tsx, collapsible.tsx, dialog.tsx
│       │       ├── dropdown-menu.tsx, icon.tsx, input-otp.tsx, input.tsx, label.tsx
│       │       ├── navigation-menu.tsx, placeholder-pattern.tsx, select.tsx
│       │       ├── separator.tsx, sheet.tsx, sidebar.tsx, skeleton.tsx
│       │       └── sonner.tsx, spinner.tsx, toggle-group.tsx, toggle.tsx, tooltip.tsx
│       ├── hooks/
│       │   ├── use-appearance.tsx
│       │   ├── use-clipboard.ts
│       │   ├── use-current-url.ts
│       │   ├── use-debounced-value.ts  # a value that only updates after it stops changing
│       │   ├── use-delayed-flag.ts     # true only once a flag has stayed on for a moment (no skeleton flash)
│       │   ├── use-flash-toast.ts
│       │   ├── use-initials.tsx
│       │   ├── use-mobile-navigation.ts
│       │   ├── use-mobile.tsx
│       │   ├── use-outbox.ts         # the list of messages written but not yet confirmed
│       │   └── use-two-factor-auth.ts
│       ├── layouts/
│       │   ├── app-layout.tsx
│       │   ├── auth-layout.tsx
│       │   ├── chat-layout.tsx      # full-height shell for chat pages
│       │   ├── app/
│       │   │   ├── app-header-layout.tsx
│       │   │   └── app-sidebar-layout.tsx
│       │   ├── auth/
│       │   │   ├── auth-card-layout.tsx
│       │   │   ├── auth-simple-layout.tsx
│       │   │   └── auth-split-layout.tsx
│       │   └── settings/
│       │       └── layout.tsx
│       ├── lib/
│       │   ├── request-failure.ts   # an HTTP status turned into words and a "session expired" flag
│       │   ├── time.ts              # UTC to the viewer's local time, list and day labels
│       │   └── utils.ts
│       ├── pages/                   # one file per screen, named by Laravel routes and Fortify views
│       │   ├── dashboard.tsx
│       │   ├── error.tsx            # friendly 403/404/500/503 page (only when debug is off)
│       │   ├── welcome.tsx
│       │   ├── auth/
│       │   │   ├── confirm-password.tsx
│       │   │   ├── forgot-password.tsx
│       │   │   ├── login.tsx
│       │   │   ├── register.tsx
│       │   │   ├── reset-password.tsx
│       │   │   ├── two-factor-challenge.tsx
│       │   │   └── verify-email.tsx
│       │   ├── chats/
│       │   │   └── index.tsx        # chat list plus the open chat (one page for /chats and /chats/{id})
│       │   └── settings/
│       │       ├── appearance.tsx
│       │       ├── profile.tsx
│       │       └── security.tsx
│       └── types/
│           ├── auth.ts
│           ├── chat.ts
│           ├── global.d.ts
│           ├── index.ts
│           ├── navigation.ts
│           ├── ui.ts
│           └── vite-env.d.ts
│
├── routes/
│   ├── chats.php                    # chat routes: list, open, start a chat, send a message, user search
│   ├── console.php
│   ├── settings.php
│   └── web.php                      # page routes; Fortify adds login, register and the rest
│
├── storage/                         # only .gitignore placeholders are tracked
│   ├── app/                         # .gitignore, private/, public/
│   ├── framework/                   # cache/, cache/data/, sessions/, testing/, views/
│   └── logs/
│
└── tests/
    ├── Pest.php
    ├── TestCase.php
    ├── Feature/
    │   ├── DashboardTest.php
    │   ├── ExampleTest.php
    │   ├── Auth/
    │   │   ├── AuthenticationTest.php
    │   │   ├── EmailVerificationTest.php
    │   │   ├── PasswordConfirmationTest.php
    │   │   ├── PasswordResetTest.php
    │   │   ├── RegistrationTest.php
    │   │   ├── TwoFactorChallengeTest.php
    │   │   └── VerificationNotificationTest.php
    │   └── Settings/
    │       ├── ProfileUpdateTest.php
    │       └── SecurityTest.php
    └── Unit/
        └── ExampleTest.php
```
