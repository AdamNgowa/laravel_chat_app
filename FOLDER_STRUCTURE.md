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
│   │   │   ├── Controller.php
│   │   │   └── Settings/
│   │   │       ├── ProfileController.php   # profile edit, update, delete account
│   │   │       └── SecurityController.php  # security page, password update
│   │   ├── Middleware/
│   │   │   ├── HandleAppearance.php        # light/dark preference
│   │   │   └── HandleInertiaRequests.php   # shared props sent to every page
│   │   └── Requests/
│   │       └── Settings/
│   │           ├── PasswordUpdateRequest.php
│   │           ├── ProfileDeleteRequest.php
│   │           ├── ProfileUpdateRequest.php
│   │           └── TwoFactorAuthenticationRequest.php
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
│   │   ├── ConversationFactory.php  # fake chats; direct() builds the ordered pair and members
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
│       │   ├── use-flash-toast.ts
│       │   ├── use-initials.tsx
│       │   ├── use-mobile-navigation.ts
│       │   ├── use-mobile.tsx
│       │   └── use-two-factor-auth.ts
│       ├── layouts/
│       │   ├── app-layout.tsx
│       │   ├── auth-layout.tsx
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
│       │   └── utils.ts
│       ├── pages/                   # one file per screen, named by Laravel routes and Fortify views
│       │   ├── dashboard.tsx
│       │   ├── welcome.tsx
│       │   ├── auth/
│       │   │   ├── confirm-password.tsx
│       │   │   ├── forgot-password.tsx
│       │   │   ├── login.tsx
│       │   │   ├── register.tsx
│       │   │   ├── reset-password.tsx
│       │   │   ├── two-factor-challenge.tsx
│       │   │   └── verify-email.tsx
│       │   └── settings/
│       │       ├── appearance.tsx
│       │       ├── profile.tsx
│       │       └── security.tsx
│       └── types/
│           ├── auth.ts
│           ├── global.d.ts
│           ├── index.ts
│           ├── navigation.ts
│           ├── ui.ts
│           └── vite-env.d.ts
│
├── routes/
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
