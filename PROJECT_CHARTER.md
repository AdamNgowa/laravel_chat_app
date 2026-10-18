# Chat Application Project Charter

> **Purpose:** This document serves as the project's engineering charter, mentoring agreement, architectural guide, learning roadmap, and continuity document. It defines not only _what_ we are building, but _how_ and _why_ we build it.

---

# Project Vision

This project is **not** intended to become the largest chat platform possible.

Its purpose is to build a **production-quality, feature-complete web chat application** (in the spirit of WhatsApp, Telegram and Messenger) with **Laravel** and **React with TypeScript**, while developing the knowledge and engineering habits expected of a professional software engineer.

The application should feel like a chat application people already use day to day, with nothing obvious missing.

The secondary goal is learning TypeScript properly, coming from React experience without it, and understanding real-time systems, authorization, security, data modelling and deployment well enough to explain every decision.

Success is measured by the ability to confidently explain architectural decisions during technical interviews, not by how quickly features are completed.

## TypeScript in Context

TypeScript is learned **inside the feature being built**, never through abstract exercises. This is the reference for how we show the difference.

**Plain JavaScript.** Laravel sends `created_at` (snake_case), and it is easy to write `createdAt` by habit. Both lines below are wrong and the editor says nothing:

```jsx
export default function MessageBubble({ message, isMine }) {
    return (
        <div className={isMine ? "bubble mine" : "bubble"}>
            <p>{message.body}</p>
            <span>{message.createdAt.slice(11, 16)}</span>
        </div>
    );
}

// somewhere else:
<MessageBubble msg={message} isMine />;
```

The app builds. The bug appears in the browser as `Cannot read properties of undefined`, only when a message actually renders, and the error does not point at the typo.

**TypeScript.** The shape is stated once:

```tsx
type Message = {
    id: number;
    body: string;
    created_at: string; // matches what Laravel sends
};

type Props = {
    message: Message;
    isMine: boolean;
};

export default function MessageBubble({ message, isMine }: Props) {
    return (
        <div className={isMine ? "bubble mine" : "bubble"}>
            <p>{message.body}</p>
            <span>{message.created_at.slice(11, 16)}</span>
        </div>
    );
}
```

The same mistakes now appear as red underlines while typing:

- `message.createdAt` gives _Property 'createdAt' does not exist on type 'Message'_, and autocomplete offers `created_at`.
- `<MessageBubble msg={message} isMine />` gives _Property 'message' is missing_, plus an error on the unknown `msg` prop.
- Leaving out `isMine` is also an error.

**What it costs.** The types are extra lines to write and to keep in sync with the PHP side. TypeScript also cannot verify what the server actually sends at runtime, so the data shape and the type must be kept matching deliberately.

---

## Project Constraints

- **Web application only.** Mobile use is through a responsive layout and an installable PWA (Android and iOS), not native apps.
- **Free to build and host.** No tool, service or hosting provider may require a credit card at any stage, including free tiers that ask for a card on signup. If a step asks for a card, we stop and choose a different option.
- **Free-tier claims must be verified at the time of use.** Free tiers change often, so no hosting or service decision is made from memory or from an old summary.
- **Voice and video calls and call logs are out of scope.**
- **Login:** email and password through the Laravel React Starter Kit's built-in authentication (powered by Laravel Fortify), and Google sign-in through Laravel Socialite, both built in Phase 1. Email and password remains the primary method for local development.
- **Security and usability hardening is built in as we go.** Rate limiting, security headers, upload hardening, session-expiry handling, disabled in-flight buttons, logging and similar items are introduced in the phase where they are first needed, not postponed to the end. Only items with no usability or security value until the app is deployed (backups, secret rotation, error tracking) wait for the Deployment phase.
- **Stack:** Laravel (React Starter Kit with Fortify and Wayfinder), React, TypeScript, Inertia.js, Tailwind CSS, shadcn/ui, Vite+, Pest, MySQL, Laravel Reverb and Laravel Echo. Any additions are introduced in the phase that needs them and explained first.

---

# Phases

Every phase follows the Feature Workflow below. Automated tests are written together in the Testing phase (Phase 13), after the features are built. Until then, each step is verified by running the app and checking it in the browser.

## Foundations (not a numbered phase)

The development environment (PHP, Composer, Node, MySQL, Git), the Laravel React Starter Kit scaffold, the repository and the first project tour are treated as groundwork. The project is created fresh at the start of Phase 1 (step 1.1). TypeScript is not taught separately: it is introduced in Phase 1 through the real files we read and write, starting with the login page.

## Phase 1 — Authentication (Email & Google)

**Status: PARTIALLY DONE. The remainder is deferred to the end of the project** (updated 2026-10-17)

### Done

- Fresh project from the Laravel React Starter Kit (Fortify authentication, not WorkOS), Installer 5.31.1
- Development database `chat_app` created, migrations ran
- App runs with `composer run dev`
- Baseline type check: `npm run types:check` reports 0 errors
- Git initialised, `.env` untracked, continuity documents committed
- Registration, email verification (log mailer), login and changing the name on the profile page work
- Two-factor authentication and passkeys were selected at install (login page shows "Sign in with a passkey")

### Deferred (to be done once the chat itself works)

- Sessions versus tokens (theory covered; cookie and sessions-table inspection not done), CSRF, password hashing
- Hand-built minimal login on a throwaway branch, then tracing the Fortify flow from form to session
- Typed authentication state on the frontend (`types/auth.ts`, props, shared props, `string | null`)
- Logout and remember me (not yet checked)
- Password reset (not yet checked)
- Protected and guest-only routes (not yet checked)
- Login rate limiting (review the starter kit's limiter)
- Two-factor authentication: trace the flow
- Passkeys: trace the flow
- Google sign-in: OAuth from first principles, credentials (verified card-free first), Laravel Socialite, linking to an existing email account, accounts created both ways, local test
- Frontend handling of expired sessions (401 / 419). Phase 3's central API layer needs a basic version of this
- Disabled submit buttons while a request is in flight
- Security headers
- Structured logging, and logging of authentication events (never tokens or passwords)

Note: the database may be wiped and rebuilt if deferred work (for example Google sign-in) changes the `users` schema.

## Phase 2 — Data Model

Planned:

- Schema: users, conversations, participants, messages, attachments, read state, reactions, blocks, stars, settings
- Migrations, indexes, relationships
- Factories and seeders
- Soft deletes
- UTC timestamp storage
- Policies for participant-only access

## Phase 3 — Core Messaging (Without Real-Time)

Planned:

- Send and fetch messages
- Conversation list sorted by latest activity, with last-message preview
- Adaptive timestamps ("10:42", "Yesterday", "Mon", "12/10/26") and date separators
- Auto-scroll to newest message
- "Scroll to bottom" button with new-message count
- Infinite scroll / load older messages
- Optimistic sending with retry on failure
- Enter to send, Shift+Enter for a new line
- Search users and start a chat
- Skeleton loaders, empty states, friendly error states
- Responsive layout: two panes on desktop, list-then-chat on mobile
- Central API layer handling expired sessions and errors
- Rate limiting and spam protection on message sending
- Disabled controls while requests are in flight

## Phase 4 — Real-Time

Planned:

- Polling, long polling and WebSockets compared
- Laravel Reverb and Laravel Echo
- Private channels and channel authorization
- Live message delivery
- Live chat-list updates and reordering
- Message status ticks: sending, sent, delivered, read
- Typing indicators (multiple names in groups)
- Online status and last seen (presence channels)
- Reconnect banner and automatic reconnection

## Phase 5 — Read / Unread & Receipts

Planned:

- Per-user last-read tracking per conversation
- Unread badges
- Mark as unread
- "Seen by" lists in groups
- Privacy toggles for read receipts and last seen

## Phase 6 — Groups

Planned:

- Create a group with name, photo and description
- Add and remove members
- Admin and member roles
- Leave a group
- Transfer admin before the last admin leaves
- System messages ("Sam added Mary", "Dad changed the group name")
- Member list with online status
- Admin-only messaging option
- Group invite links
- Audit logging of admin actions (member changes, role changes, group settings)

## Phase 7 — Message Interactions

Planned:

- Reply to a message (quoted preview, jump to original)
- Emoji reactions
- Emoji picker
- Edit a message, with an "edited" label
- Delete for me
- Delete for everyone, with a "This message was deleted" placeholder
- Copy text
- Forward a message to another chat
- Star / save messages
- Link previews
- Clickable links
- Basic formatting (bold, italic)
- Mentions (@name) with highlighting
- Context menu (right-click and long-press)
- Pinned messages inside a chat
- Polls in groups

## Phase 8 — Media & Files

Planned:

- Image and video sending with thumbnails
- Captions on media
- Multiple images in one message, shown as a grid
- Drag and drop upload
- Paste an image from the clipboard
- Upload progress bar with cancel
- Client-side image compression
- Server-side thumbnail generation
- Full-screen image and video viewer with next and previous
- Document sending (PDF, Word and so on) with file icon and size
- Voice notes with waveform and playback speed
- "Media, links and files" gallery per chat
- File size and type validation
- Upload hardening: content-based type checking, safe filenames, safe serving of uploaded files, upload rate limiting
- Auto-cleanup of orphaned and old media
- Storage abstraction: local disk first, external storage later

## Phase 9 — Chat Management & Search

Planned:

- Delete chat
- Clear chat
- Archive chat
- Pin chats to the top
- Mute chats
- Search chats by name
- Search inside a conversation, with highlighted matches
- Global message search
- Block and unblock a user
- Report a user
- Disappearing messages, with scheduled cleanup of expired messages
- Scheduled messages

## Phase 10 — Notifications & PWA

Planned:

- Browser notifications when the tab is not focused
- Unread count in the tab title and favicon
- Notification sound, with a setting to turn it off
- Per-chat and global notification settings
- Web Push notifications with the tab closed (Android and desktop browsers directly; iOS once the app is added to the Home Screen)
- Installable PWA on Android and iOS, with icon and splash screen
- Offline banner

## Phase 11 — Profile, Settings & People

Planned:

- Adapt the starter kit's existing settings pages (profile, security, appearance) instead of building them from scratch
- Avatar upload and cropping
- Display name and "About" status
- Change email (with re-verification)
- Change password
- Theme: light, dark and system
- Privacy settings
- Notification preferences
- Log out and log out of other devices
- Delete account, with audit logging
- Invite people by link or email, with rate limiting
- Optional admin-approved signup, so strangers cannot register

## Phase 12 — Polish & Accessibility

Planned:

- Animations: message pop-in, panel transitions, typing dots
- Keyboard shortcuts (Esc closes a panel, Ctrl+K searches)
- Consistent empty, loading and error states
- Accessible contrast, focus states and screen-reader labels
- Responsive review on real phones

## Phase 13 — Testing & Quality

Planned:

- Create the `chat_app_test` database (`utf8mb4_unicode_ci`), point `phpunit.xml` at it, and repair or replace the starter kit's existing tests (and its GitHub Actions test workflow)
- Authentication tests (registration, login, email verification, password reset, rate limiting, two-factor, passkeys, Google sign-in)
- Pest feature and unit tests, run against MySQL
- Policy and authorization boundary tests
- Broadcasting and channel authorization tests
- Exception handler tests
- Review of tests that lock in wrong behavior
- Vitest and React Testing Library for the frontend
- End-to-end browser tests with Playwright
- Coverage and regression review
- Tests for every flow that deletes, cascades or depends on flush order

## Phase 14 — Performance & Data Access

Planned:

- N+1 query detection and eager loading, with lazy-loading prevention switched on
- Indexing review
- Caching
- Cursor pagination review
- Transaction policy review
- Queues for notifications and media processing
- Connection tuning for a hosted MySQL database

## Phase 15 — Docker & Developer Tooling

Planned:

- Multi-stage Dockerfile
- Docker Compose: app, Reverb, queue worker, scheduler, MySQL
- Environment validation
- Formatting, linting and static analysis enforcement (Vite+ `check`, Laravel Pint, PHPStan)
- Git hooks
- Secret scanning
- Dependency auditing

## Phase 16 — Deployment

Planned:

- Host chosen from options verified as card-free
- Production configuration and secrets management
- HTTPS, CORS and trusted proxies
- Database migration strategy
- External file storage
- Email through an HTTP API provider (free hosts commonly block SMTP)
- Reverb on the host, or a hosted WebSocket service if the host cannot run it
- CI/CD with GitHub Actions
- Health checks and logging
- Backup strategy
- Secret rotation procedure
- Error tracking
- Passkey domain binding and a dedicated `user_handle_secret` (passkeys are tied to the site domain)
- Decide whether to keep Inertia SSR (it needs a Node process on the host)
- Disable development-only routes in production (Inertia devtools, Boost browser logs)
- Free-tier realities: sleeping, wake-up delay, ephemeral disks

## Deferred or Excluded

- Voice and video calls and call logs (out of scope; could return later through an embedded service)
- End-to-end encryption
- Phone-contact syncing
- Native mobile apps

---

# Mentoring Agreement

Throughout this project, the assistant should act as a **senior software engineer and mentor**, not as someone who simply writes code.

The objective is to develop engineering judgment.

Whenever possible:

- Explain concepts from first principles.
- Explain **why** before **how**.
- Build intuition before implementation.
- Introduce one major concept at a time.
- Keep lessons small enough that every change is understandable.
- Frequently connect new concepts to previously implemented features.
- Encourage reasoning rather than memorization.
- Discuss trade-offs rather than presenting one "correct" solution.
- Preserve the existing architecture unless new requirements justify a change.
- Preserve the project's commenting style.
- Prefer constructor injection.
- Avoid unnecessary abstraction until there is a clear reason.
- **Teach TypeScript through the feature being built.** No abstract exercises and no scratch files. When a TypeScript concept first appears in real feature code, show the plain-JavaScript version beside the TypeScript version, name the bug the type prevents, and state what it costs. Types are introduced in the file we are actually writing. Explain compiler errors rather than silencing them.

---

# Working Relationship

Over the AutoTrader project we established a rhythm that should continue throughout this project.

We:

- Stop and question architectural decisions rather than accepting them automatically.
- Explain why earlier implementations were appropriate instead of calling them mistakes.
- Revisit concepts when they become relevant in a new context.
- Treat the project as if it were being built by a small professional software team.
- Optimize for understanding that would hold up during a technical interview.
- **Verify documentation against actual source files rather than trusting prior status summaries**, since status documents can drift from the real codebase.

---

# Core Engineering Philosophy

> Understand the mechanism, then use the tool that automates it, and know what life was like before it existed.

We do not wait to introduce established tools. Where a mature, widely used tool exists, we use it. But we never use a tool as a black box.

Examples include:

- WebSockets understood (against polling) before using Laravel Reverb and Echo.
- Sessions and CSRF understood before relying on the starter kit's (Fortify) authentication.
- OAuth understood before using Laravel Socialite.
- Form validation understood before using Laravel form requests.
- Server state understood before using TanStack Query.
- Types understood in real code before using TypeScript generics.
- File storage understood before using Laravel's filesystem abstraction.
- Push notifications understood before using a Web Push package.

For every tool introduced:

1. Explain the problem it solves.
2. Explain how developers solved that problem before the tool existed.
3. Explain how the tool solves it, and what life would look like without it.
4. Implement with the tool.
5. Discuss its trade-offs and when it would be the wrong choice.

Where a concept is small enough to understand by building it by hand once (for example, a plain polling loop), we may do so for learning, but we do not leave hand-built versions in the product once a better tool is adopted.

---

# Feature Workflow

Every significant feature should follow the same process.

## Step 1 — Architecture & Theory

Before implementation:

### Current Project Recap

Explain:

- where we currently are,
- what has already been implemented,
- how the new feature fits into the overall architecture.

### Theory

Explain:

- why the feature exists,
- the problem it solves,
- how developers solved the problem before it existed,
- where it belongs architecturally,
- production considerations,
- alternatives,
- trade-offs,
- the existing tool chosen for the job, what it solves, and what life looked like without it.

### Design

Discuss:

- ownership of responsibility,
- layer placement,
- alternatives,
- why the chosen design is appropriate.

No code should be written during this step.

### Required Files

Never assume the codebase matches a previous conversation.

Before modifying an existing class:

- ask for the current version,
- never rewrite from memory,
- modify only the code that is provided.

The latest `FOLDER_STRUCTURE.md` should also be requested when beginning a continuation chat.

---

## Step 2 — Incremental Implementation

Implementation should occur in small logical steps.

For each change:

- identify the file,
- specify its location,
- indicate whether it is new or existing,
- provide complete updated methods or classes,
- explain important lines.

After each step:

- compile,
- run,
- verify in the browser,
- then continue.

---

# Reflection Template

Every completed implementation should conclude with:

## Files Changed

Explain which files changed.

## Why They Changed

Explain why each modification was necessary.

## Concepts Learned

Summarize the engineering concepts introduced.

## Production Considerations

Discuss how the implementation might evolve in larger systems.

## Interview Notes

Include at least one interview-style discussion question.

## Suggested Git Commit Message

Provide a meaningful commit message.

---

# Real-World Engineering Perspective

Whenever introducing a concept, explain not only how it works in this project but also how it is commonly approached in professional software teams.

Where appropriate discuss:

- How startups might implement it.
- How larger companies might implement it.
- How the design evolves as systems grow.
- Trade-offs between simplicity and scalability.
- Common production pitfalls.
- How the feature changes in a microservices architecture.
- Which parts of our implementation are educational.
- Which parts would likely remain unchanged in production.

This context should supplement—not replace—the implementation we build.

---

# Repository Structure

The repository is a single Laravel application with a React and TypeScript frontend served through Inertia.js:

```text
chat-app/
├── app/
├── database/
├── resources/
│   └── js/
├── routes/
├── tests/
├── CURRENT_STATUS.md
├── FOLDER_STRUCTURE.md
└── PROJECT_CHARTER.md
```

The exact file structure must always be taken from the latest `FOLDER_STRUCTURE.md` rather than assumed from this document.

---

# Final Principle

The objective of this project is not simply to finish an application.

The objective is to build an application whose architecture, implementation, trade-offs, and evolution can be confidently explained in a professional software engineering interview.

Whenever requirements evolve, we should treat the codebase as a real product:

- revisit earlier decisions respectfully,
- explain why previous solutions were appropriate,
- justify new changes based on new requirements,
- continuously improve both the software and the engineering process.
