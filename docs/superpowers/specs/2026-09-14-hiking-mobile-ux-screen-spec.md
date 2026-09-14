# Hiking Mobile MVP — UX and Screen Specification

- **Status:** Approved UX structure; interaction specification
- **Date:** 2026-09-14
- **Primary client:** Flutter mobile app (`apps/mobile`)
- **Product scope:** [Mobile MVP decision](../../hiking-app-product-docs/07-mvp.md)
- **Engineering scope:** [Formal MVP ticket specification](./2026-09-14-hiking-mobile-mvp-ticket-spec.md)
- **Out of scope:** Visual design system, wireframes, brand styling, and Next.js landing page

## 1. UX objective

Help a hiker move from intent to real-world participation with as little
friction as possible:

```text
Browse → Evaluate → Authenticate → Complete profile → Join or create
→ Coordinate → Hike → Track offline → Complete → Progress → Share
```

The product should make the next useful action obvious on every screen. A
screen must communicate what is available, what is blocked, why it is blocked,
and how to recover.

## 2. Navigation model

### Visitor navigation

Visitors have access to Discover only. They can:

- Browse upcoming public hikes.
- Apply filters.
- Open hike details.
- View the map pin, host, and participant profiles.

The following areas are hidden until authentication:

- My Hikes
- Create
- Activity
- Profile
- Notifications

The Join action remains visible on public hike details. Tapping it starts the
authentication flow and returns the visitor to the intended join action.

### Authenticated navigation

Authenticated users see five bottom-navigation destinations:

1. **Discover** — find upcoming public hikes.
2. **My Hikes** — manage upcoming and completed participation.
3. **Create** — publish a hike through the wizard.
4. **Activity** — track and review standalone or linked activities.
5. **Profile** — identity, progress, badges, and history.

Notifications are accessed from a global bell/action in the authenticated app
shell, not as a sixth bottom-navigation item.

### Navigation rules

- Preserve the selected tab across ordinary navigation.
- Preserve scroll position when returning from a detail screen.
- Deep links open the relevant hike, activity, post, or notification source.
- Back navigation returns to the previous screen and never silently discards
  unfinished wizard or activity state.
- Destructive actions require confirmation and explain their consequence.

## 3. Authentication and onboarding flow

```text
Public hike details
       ↓ Join
Sign in with Google or Apple
       ↓ success
Required + optional onboarding
       ↓ complete
Return to original action
```

After successful sign-in, incomplete users cannot enter the authenticated app
until onboarding is completed.

The onboarding form contains:

### Required section

- Name
- Location
- Experience level
- Preferred difficulty

### Optional analytics section

- How the user found the app
- Age or age range
- Other demographic questions with a documented analytical purpose

Optional fields appear in the same form but are visually marked as optional.
Analytics consent is explicit and separate from accepting the required profile.

The form must explain that optional responses help improve the product and are
not shown on the public profile.

## 4. Screen contracts

Each screen below defines the interaction contract. Visual styling is intentionally
left for a later design-system specification.

### UX-01 — Discover

**Purpose:** Let visitors and authenticated users find suitable upcoming hikes.

**Entry points:** App launch, Discover tab, back navigation from hike details.

**Content:**

- Screen title and notification action for authenticated users.
- Filter control.
- Optional List/Map toggle.
- Hike cards in chronological order by default.
- Each card shows destination, date/time, difficulty, host, participant count,
  and available app slots.

**Actions:**

- Open hike details.
- Open filters.
- Switch to map view.
- Pull to refresh.
- Sign in from the authenticated shell prompt if needed.

**States:**

- Loading: card skeletons.
- Empty: explain that no public hikes match and offer filter reset.
- Error: explain failure with Retry.
- Offline: show cached hikes if available and a stale-data label; otherwise show
  a retry state.
- Full hike: card shows Full and disables Join from card actions.

**Accessibility:** The card is one semantic target with a clear label. Map view
has a list alternative so destination and availability never depend on color or
map interaction alone.

### UX-02 — Discover filters

**Purpose:** Narrow public hikes by user intent.

**Filters:** Date, distance, location, difficulty, and available app slots.

**Actions:** Apply, Clear all, Cancel.

**Rules:**

- Show the active filter count.
- Preserve filters when returning from details.
- Validate ranges before applying.
- No-result state offers Clear filters.

**Tests:** See `HIKE-001` and `HIKE-002`.

### UX-03 — Hike details

**Purpose:** Give a visitor enough information to decide whether to join.

**Content order:**

1. Destination name and date/time.
2. Shared map pin with text location fallback.
3. Difficulty and available app slots.
4. Description and requirements.
5. Host profile.
6. Current app participant profiles.
7. External guest count.
8. Join action.

**Join behavior:**

- Available slots: Join is enabled.
- Visitor: tapping Join opens Google/Apple sign-in, then onboarding if needed,
  then resumes the join action.
- Authenticated user: join immediately and replace Join with Joined.
- Full: show Full and explain that no waitlist exists.
- Host: show Manage instead of Join.
- Joined user: show Open chat and Leave.

**States:** Loading, not found, cancelled, full, offline/stale, and server
join-conflict. A join conflict refreshes capacity and explains that another
hiker took the slot.

### UX-04 — Sign in

**Purpose:** Authenticate at the moment a protected action is requested.

**Content:** Short value explanation, Continue with Google, Continue with Apple,
terms/privacy links, and a back/cancel action.

**States:** Provider loading, user cancellation, provider failure, invalid or
expired token, and backend unavailable.

**Rules:** Never lose the original action. On success, route to onboarding or
resume the original hike/activity action.

### UX-05 — Profile onboarding

**Purpose:** Collect the minimum identity and preferences required to use the
authenticated product.

**Content:** Required fields followed by optional analytics fields in the same
scrollable form. A progress indicator is optional; field labels and validation
must remain visible with dynamic text enabled.

**Actions:** Save and continue, with an explicit skip path for optional analytics
fields only.

**States:** Initial, field validation error, save failure with retry, saved, and
session expired.

**Rules:** Do not allow the user into the main app until required fields are
valid. Do not block completion when optional analytics fields are blank.

### UX-06 — My Hikes

**Purpose:** Give users one place to return to upcoming commitments and past
participation.

**Structure:** Two tabs: Upcoming and Completed.

**Upcoming content:** Joined hikes and hikes hosted by the user, ordered by
scheduled start. Each item shows status, destination, date/time, and chat access.

**Completed content:** Past scheduled hikes and activities linked to a hike.

**States:** Loading, empty Upcoming, empty Completed, cancelled item, and offline
cached list.

**Actions:** Open hike, open chat, open linked activity report, leave an upcoming
hike, and manage hosted hikes.

### UX-07 — Create location step

**Purpose:** Set the one destination/meeting pin for a new public hike.

**Content:** Search, database location results, map canvas, drop-pin action,
selected location name, and coordinate confirmation.

**Actions:** Select database location, place custom pin, continue, back.

**States:** Location permission denied, map unavailable, no search results,
offline cached map, invalid pin, and unsaved step state.

**Rules:** The user must provide one valid location name and coordinate pair.
The map is not the only way to understand the selected location.

### UX-08 — Create date/time, capacity, and details steps

**Purpose:** Collect the information needed to publish a useful hike.

**Date/time content:** Date and start time; past dates are invalid.

**Capacity content:** Maximum participants and external guest count. Show the
  resulting available app slots immediately.

**Details content:** Difficulty, description, requirements, and optional context
  that helps participants prepare.

**Rules:** External guests cannot exceed maximum capacity. The host does not
consume an app-member slot. Capacity changes must remain valid against current
participants during later edits.

### UX-09 — Create review and publish

**Purpose:** Let the host verify the public information before publishing.

**Content:** Complete hike summary, map pin, capacity breakdown, and a clear
  explanation of external guests versus app slots.

**Actions:** Edit any previous step, Publish hike, Cancel creation.

**States:** Invalid summary, publish loading, publish success, duplicate request,
and server failure with retry while preserving the local draft.

**Success:** Navigate to the hosted hike detail screen with a confirmation that
  the hike is public and ready for participants.

### UX-10 — Hike management

**Purpose:** Let a host operate a published hike responsibly.

**Content:** Hike summary, current capacity, participant list, external guest
count, chat entry, edit action, cancel/delete action.

**Edit behavior:** Show which changes notify participants. Significant changes
  require confirmation before saving.

**Cancel/delete behavior:**

- No joined participants: confirm permanent deletion.
- Joined participants: confirm cancellation and explain that the record remains
  in history and participants are notified.

**States:** Unauthorized, already cancelled, server conflict, and offline edit
  attempt. Offline edits remain local only and require explicit retry/sync.

### UX-11 — Joined hike and participants

**Purpose:** Provide the operational hub for a joined event.

**Content:** Destination pin, schedule, requirements, host, participant profiles,
external guest count, chat entry, leave action, and activity-link state.

**Actions:** Open chat, open participant profile, leave, open activity report,
and start no tracking action directly—the tracker starts from Activity.

**Rules:** Removed users lose access immediately. External guests are shown only
as a count. Participant profiles are public, sanitized profile views.

### UX-12 — Joined-hike chat

**Purpose:** Help the host and joined app participants coordinate meeting details.

**Content:** Hike title, participant context, message list, composer, send
action, and retry state for failed messages.

**Rules:** Only the host and active joined app participants can read or send.
Visitors, unjoined users, removed users, and external guests cannot access chat.

**States:** Initial loading, empty conversation, pagination, sending, send
failure, offline queued message, and revoked access.

**Accessibility:** New messages are announced without stealing focus. The
composer exposes a text label, send state, and failure action.

### UX-13 — Activity home and tracker

**Purpose:** Let authenticated users track any hike, whether or not they joined
an app event.

**Activity home content:** Start tracking action, recent activities, local-only
and pending-sync indicators, and completed report links.

**Tracker content:** Elapsed time, distance, elevation, GPS accuracy/status,
pause/resume, stop, and permission/help action.

**Rules:**

- Tracking is standalone and does not require a joined hike.
- Location samples and timestamps are saved locally.
- Internet is not required to record GPS data.
- If the app is killed or restarted, offer Resume or Discard recovery.
- Stop requires confirmation to prevent accidental loss.

**States:** Location permission prompt, permission denied, GPS unavailable,
low accuracy, no network, paused, active, stopping, local save failure, and
recovery after restart.

### UX-14 — Activity report

**Purpose:** Turn local GPS data into a useful post-hike summary.

**Content:** Route line, distance, duration, elevation, start/end time, sync
status, optional photos, optional notes, and actions to save, link, or share.

**Rules:** Distance, duration, and elevation are required before saving. Users
can correct these values when GPS data is incomplete. Photos and notes are
optional and must never block saving the required metrics.

**Offline behavior:** The report is viewable and saveable offline. Sync status
clearly distinguishes local-only, pending, synced, and failed.

**Link activity:** Suggest joined hikes using date/location, allow manual choice,
or let the activity remain standalone.

### UX-15 — Profile and progress

**Purpose:** Reinforce identity, progress, and repeat participation.

**Content:** Name, location, experience, preferred difficulty, hike totals,
distance total, XP, level, badges, recent activities, and shared posts.

**Actions:** Edit profile, manage optional analytics responses, open activity,
open badge details, and sign out.

**Rules:** Analytics responses are never displayed in public profile views.
Public profile content must be intentionally limited to approved fields.

### UX-16 — Activity feed

**Purpose:** Let users connect through completed hikes and progress.

**Content:** Shared activity posts with route summary, distance, duration,
elevation, optional photos/notes, author, likes, comments, and timestamps.

**Actions:** Like/unlike, open comments, add comment, open author profile, and
share an owned activity.

**States:** Loading, empty feed, pagination, offline cached feed, comment error,
and deleted/hidden source activity.

**Privacy rule:** An activity does not appear in the feed unless the owner
explicitly shares it.

### UX-17 — Notifications

**Purpose:** Make important changes actionable without forcing users to monitor
every hike.

**Content:** Read/unread notification list grouped by recency, source summary,
and navigation target.

**Notification types:** Join, leave, hike update, cancellation, hike reminder,
new chat message, like, and comment.

**Actions:** Open source, mark read, mark all read where supported.

**States:** Loading, empty, offline cached list, read/unread, source unavailable,
and push-permission denied.

## 5. Cross-screen state matrix

| Condition | User-visible behavior |
|---|---|
| Visitor opens app | Discover list only; other authenticated destinations hidden |
| Visitor taps Join | Sign in, then onboarding if incomplete, then resume Join |
| Signed-in user has incomplete profile | Onboarding gate; no authenticated app shell |
| Hike becomes full | Join disabled, Full state shown, no waitlist language omitted |
| Join race loses | Refresh details and explain slot was taken |
| Hike is cancelled with participants | Banner, notification, preserved history, and read-only archived chat |
| Empty hike is deleted | Return to Discover/My Hikes with success confirmation |
| User is removed | Remove chat and hike access immediately; explain access changed |
| No network during browsing | Use cached content with stale label or show retry |
| No network during GPS tracking | Continue local tracking; show offline indicator |
| No network after tracking | Save locally and show pending sync |
| GPS permission denied | Explain why tracking needs location and offer settings/retry |
| GPS accuracy is poor | Show accuracy warning; continue only with explicit user awareness |
| Activity upload repeats | Show one activity and one sync result; never duplicate |
| Push denied | Keep in-app notifications fully functional |
| Required metric missing | Prevent final activity save and identify the missing value |
| Optional analytics blank | Allow onboarding completion |
| Optional photos fail | Save activity metrics and report upload failure separately |

## 6. Accessibility and content rules

- All controls must have semantic labels and visible focus/pressed states.
- Interactive targets should be at least 48 dp where platform conventions permit.
- Do not use color alone for difficulty, availability, unread state, or sync state.
- Every map interaction has a text/list alternative.
- Support dynamic text sizes without clipping required actions or metrics.
- Use plain-language errors that state the problem and the next action.
- Confirm destructive actions with consequences, not generic “Are you sure?” text.
- Announce important state changes such as join success, sync completion, and
  permission failures to assistive technologies.
- Do not expose exact private activity routes or analytics fields in public
  profiles, feed posts, or notifications unless explicitly intended by sharing.

## 7. UX ticket map

These tickets describe UX acceptance work and map to the implementation tickets
in the formal MVP specification.

| UX ticket | Scope | Depends on | Engineering link |
|---|---|---|---|
| UX-001 | Visitor/authenticated navigation shell | None | MOB-001, AUTH-001 |
| UX-002 | Sign-in interruption and action resume | UX-001 | AUTH-001 |
| UX-003 | Onboarding form and analytics consent | UX-002 | USER-001 |
| UX-004 | Discover list, filters, and states | UX-001 | HIKE-001 |
| UX-005 | Hike details, capacity, and join states | UX-004 | HIKE-002, HIKE-005 |
| UX-006 | Create wizard and draft recovery | UX-003 | HIKE-003, HIKE-004 |
| UX-007 | Review, publish, edit, cancel, and delete | UX-006 | HIKE-007 |
| UX-008 | My Hikes and joined-hike hub | UX-005 | MOB-001, HIKE-005 |
| UX-009 | Participant management and access revocation | UX-008 | HIKE-006 |
| UX-010 | Joined-hike chat | UX-008 | CHAT-001 |
| UX-011 | Activity home and offline tracker | UX-003 | ACT-001, MAP-001 |
| UX-012 | Activity report, corrections, and link flow | UX-011 | ACT-002, ACT-004 |
| UX-013 | Activity sync and recovery states | UX-012 | ACT-003 |
| UX-014 | Progress, badges, and optional sharing | UX-012 | SOCIAL-001, SOCIAL-002 |
| UX-015 | Notification center and push permission | UX-001 | NOTIF-001, NOTIF-002 |
| UX-016 | Accessibility and offline QA pass | UX-001 through UX-015 | All mobile tickets |

## 8. UX validation scenarios

Before implementation is considered UX-complete, validate these scenarios on
small Android and iOS screens with dynamic text enabled:

1. Visitor browses a hike, opens details, signs in, completes onboarding, and
   returns to the same hike to join.
2. Visitor signs in but skips optional analytics fields and reaches the app.
3. Authenticated user sees only five destinations; visitor sees Discover only.
4. Host publishes a hike with ten capacity and five external guests; the UI
   consistently shows five available app slots.
5. A full hike cannot be joined and does not suggest a nonexistent waitlist.
6. Host cancels an empty hike versus a joined hike and sees the correct outcome.
7. Removed participant attempts to open chat and receives a clear access state.
8. Hiker starts GPS tracking in airplane mode, pauses, resumes, stops, and sees
   the complete report offline.
9. App restarts during tracking and offers recovery without data loss.
10. Activity sync retries after reconnection without a duplicate report or XP.
11. User saves an activity with metrics but no photo or note.
12. User shares one activity while another remains private.
13. Location permission is denied and the user can understand how to recover.
14. Push notifications are denied while the in-app notification center remains usable.

## 9. Deferred UX decisions

The following require a later design-system or post-MVP specification:

- Colors, typography, iconography, component styling, and motion.
- Exact map provider and map visual treatment.
- Realtime chat transport versus polling presentation.
- Route privacy controls beyond private-by-default behavior.
- Report/block/admin moderation screens and workflows.
- Organizer reputation and review screens.
- Advanced recommendations, challenges, leaderboards, and safety flows.
