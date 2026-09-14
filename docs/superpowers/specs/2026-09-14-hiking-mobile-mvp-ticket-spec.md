# Hiking Mobile MVP — Formal Ticket Specification

- **Status:** Draft for implementation planning
- **Date:** 2026-09-14
- **Primary client:** Flutter mobile app (`apps/mobile`)
- **Backend:** Spring Boot API (`apps/backend`)
- **API contract:** `packages/api-types/openapi.json`
- **Excluded:** Next.js landing page and web product UI

## 1. Product outcome

Validate the loop:

```text
Discover a public hike → Join or create a hike → Communicate → Hike →
Track offline → Complete activity → Earn XP/badges → Optionally share → Repeat
```

Every signed-in user can join hikes and create hikes. Hikes are public in the
MVP. A visitor can browse before authentication; authentication is required at
the point of joining, creating, tracking a synced activity, or posting.

## 2. Locked product rules

1. Hike discovery opens as a list/card view. Map view is optional.
2. A hike has one map pin representing the destination and meeting location.
3. Hosts may use a database location or a custom pinned location.
4. All hikes are public in the MVP.
5. Joining is immediate while app-member capacity remains.
6. External guests are counted in capacity but have no account, profile, or chat access.
7. A full hike cannot accept more joins; there is no waitlist.
8. Hike chat is available only to joined app users and the host.
9. A host may edit a published hike; significant changes notify participants.
10. A hike with no joined participants can be deleted. A hike with joined
    participants is cancelled and retained in history.
11. Activity tracking is standalone and does not require joining a hike. A user
    may start tracking locally before authentication; authentication is required
    to sync, earn rewards, or share the activity.
12. GPS tracking must work without cellular data. Map tiles and synchronization
    may be unavailable offline.
13. Distance, duration, and elevation are required activity values. Photos and
    notes are optional.
14. Event-based and standalone activities can earn XP/badges and be optionally
    shared to the Activity feed.
15. Notifications include an in-app center and push notifications.

### Implementation assumptions

- The host does not consume an app-member slot. The capacity formula can be
  changed in `HIKE-005` if product rules later count the host.
- The Completed My Hikes tab derives completion from a past scheduled event or a
  linked completed activity; participants do not wait for a host completion action.
- Map and attachment vendors are selected during implementation, but both are
  accessed through mobile/backend adapters so vendor choice does not change the
  product contract.

## 3. Screen and flow contract

| Screen | Required content and actions |
|---|---|
| Discover | Upcoming public hike cards, filters, optional map toggle, loading/empty/error states |
| Hike details | Pin, date/time, difficulty, description, requirements, host profile, participant profiles, external guest count, available app slots, Join |
| Sign in | Google and Apple authentication; return to the interrupted action |
| Profile onboarding | Name, location, experience level, preferred difficulty; optional analytics fields and consent |
| My Hikes | Upcoming and Completed tabs |
| Create wizard | Location → date/time → capacity → details → review/publish |
| Joined hike | Event details, participant list, leave, chat, activity-link state |
| Chat | Messages for the host and joined app participants only |
| Activity | Start/stop standalone tracker, activity history, sync status |
| Activity report | Route map, distance, duration, elevation, optional photos/notes, link/share/save |
| Activity feed | Shared activity posts, likes, comments |
| Notifications | Read/unread notification list and navigation to source |
| Profile | User details, XP, level, badges, hike totals, activity history |

## 4. API boundary

### API conventions

- Business routes use `/api/v1/<resource>`.
- Controllers return DTO records, never JPA entities.
- Authenticated endpoints resolve the caller through `@CurrentUser`.
- User-owned queries include ownership in the repository/service boundary.
- Lists use the existing `PageResponse<T>` shape and Spring `Pageable`.
- UUIDs are used for server resources and client-generated idempotency keys.
- Errors use the existing `ApiError` and `GlobalExceptionHandler`.
- Mobile regenerates its Dart client from the committed OpenAPI document.

### Authentication

The mobile provider SDK obtains a Google or Apple token and sends it as a
bearer token. The backend validates the provider token through the existing
authentication boundary and provisions the internal user on first authenticated
request.

Required boundary work:

- `GET /api/v1/auth/me`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- Add Apple validation/provider support if it is not covered by the current
  provider authentication filter.

### Hikes

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| GET | `/api/v1/hikes` | No | Public paginated discovery with date, location, distance, difficulty, and available-slot filters |
| GET | `/api/v1/hikes/{id}` | No | Public hike details with sanitized profiles and capacity summary |
| POST | `/api/v1/hikes` | Yes | Create and publish a hike from the wizard payload |
| PATCH | `/api/v1/hikes/{id}` | Host | Edit a published hike and trigger significant-change notifications |
| DELETE | `/api/v1/hikes/{id}` | Host | Permanently delete only when no app participant has joined |
| POST | `/api/v1/hikes/{id}/join` | Yes | Atomically join when capacity remains |
| POST | `/api/v1/hikes/{id}/leave` | Joined user | Leave a hike |
| GET | `/api/v1/hikes/{id}/participants` | No | Sanitized public participant profiles |
| DELETE | `/api/v1/hikes/{id}/participants/{userId}` | Host | Remove a participant |
| POST | `/api/v1/hikes/{id}/cancel` | Host | Cancel and retain a hike with joined participants |

Capacity is computed server-side:

```text
availableAppSlots = maxParticipants - externalGuestCount - joinedAppParticipantCount
```

The server must enforce this calculation transactionally to prevent two users
from consuming the final slot concurrently.

### Chat and notifications

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| GET | `/api/v1/hikes/{id}/messages` | Joined/host | Paginated hike chat history |
| POST | `/api/v1/hikes/{id}/messages` | Joined/host | Send a chat message |
| GET | `/api/v1/notifications` | Yes | Paginated in-app notification center |
| PATCH | `/api/v1/notifications/{id}/read` | Owner | Mark notification read |
| POST | `/api/v1/notifications/devices` | Yes | Register or refresh a push device token |
| DELETE | `/api/v1/notifications/devices/{token}` | Yes | Unregister a push device token |

Push delivery is an infrastructure adapter behind the notification service.
The API remains the source of truth; failed push delivery must not prevent the
in-app notification from being stored.

### Activities

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| GET | `/api/v1/activities` | Yes | User's paginated activity history |
| GET | `/api/v1/activities/{id}` | Owner or shared | Activity report and route summary |
| POST | `/api/v1/activities` | Yes | Idempotent upload of an offline activity |
| PATCH | `/api/v1/activities/{id}` | Owner | Correct required metrics, add notes/photos, or link a hike |
| POST | `/api/v1/activities/{id}/share` | Owner | Create an optional feed post |
| POST | `/api/v1/activities/{id}/attachments` | Owner | Create an attachment upload session |
| DELETE | `/api/v1/activities/{id}/attachments/{attachmentId}` | Owner | Remove an activity attachment |

`POST /activities` accepts a client-generated `clientActivityId`. Repeating the
same upload returns the existing activity instead of creating a duplicate.
The route payload uses a compressed, documented polyline representation; the
mobile client may retain raw points locally for recovery before upload.

### Social and profile

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| GET | `/api/v1/feed` | Yes | Paginated shared activity posts |
| POST | `/api/v1/feed/{postId}/likes` | Yes | Like a post |
| DELETE | `/api/v1/feed/{postId}/likes` | Yes | Remove like |
| GET/POST | `/api/v1/feed/{postId}/comments` | Read/write | Read or add comments |
| GET | `/api/v1/users/{id}` | No | Sanitized public profile |
| GET | `/api/v1/users/me/progress` | Yes | XP, level, badges, and hike totals |

## 5. Data model

All application tables use UUID primary keys, explicit foreign keys, audit
columns where appropriate, and Flyway migrations. Enumerations are persisted as
strings.

### User profile

Extend the existing user model or add a profile table containing:

- `user_id`
- `display_name`
- `location_text`
- `location_lat`, `location_lng` (optional)
- `experience_level`
- `preferred_difficulty`
- `age_range` (optional)
- `discovery_source` (optional)
- `analytics_consent_at` (optional)
- `onboarding_completed_at`

Analytics fields are optional, purpose-labeled, and excluded from public
profile responses.

### Hike

- `id`, `host_id`
- `title` or destination name
- `location_source` (`DATABASE`, `CUSTOM`)
- `location_reference_id` (optional)
- `location_name`
- `latitude`, `longitude`
- `scheduled_start_at`
- `difficulty`
- `max_participants`
- `external_guest_count`
- `description`, `requirements`
- `status` (`PUBLISHED`, `CANCELLED`)
- `created_at`, `updated_at`

The MVP may omit a separate draft status by keeping incomplete wizard state
locally until publish. A hike appears in Completed My Hikes when its scheduled
start is in the past or a linked activity exists; this does not require a
server-side completion transition.

### Hike participant

- `hike_id`, `user_id`
- `joined_at`
- `removed_at` (optional)
- unique active constraint on `(hike_id, user_id)`

The host is represented by `host_id`, not as an ordinary capacity-consuming
participant unless product rules later require that behavior.

### Chat message

- `id`, `hike_id`, `sender_id`
- `body`
- `created_at`, `updated_at`
- optional soft-delete metadata

Authorization is based on active participation or host ownership.

### Activity

- `id`, `owner_id`
- `client_activity_id` (unique per owner)
- `linked_hike_id` (optional)
- `started_at`, `ended_at`
- `distance_meters`
- `duration_seconds`
- `elevation_gain_meters`
- `route_polyline` (required for GPS-tracked activities, optional for manual activities)
- `notes` (optional)
- `created_at`, `updated_at`

The mobile client maintains a separate local activity record with
`sync_status` (`LOCAL_ONLY`, `PENDING_SYNC`, `SYNCED`, `FAILED`) and the raw
route samples needed for retry/recovery. These sync states are not server
domain values.

Photos use a separate attachment abstraction rather than binary data in the
activity row. The API returns an upload session or signed upload target and
stores only attachment metadata; the storage provider is not exposed to the
mobile client as a domain dependency.

### Progress and feed

- `user_progress`: `user_id`, `xp_total`, `level`
- `badge_definition`: stable badge key, name, description, criteria version
- `user_badge`: `user_id`, `badge_id`, `awarded_at`
- `activity_post`: `activity_id`, `author_id`, visibility, created timestamp
- `post_like`: unique `(post_id, user_id)`
- `post_comment`: `id`, `post_id`, `author_id`, `body`, timestamps

XP awarding must be idempotent per activity so an offline retry cannot award
duplicate rewards.

### Notification

- `id`, `user_id`
- `category`
- `title`, `body`
- `link_type`, `link_id`
- `read_at`
- `push_status`
- `created_at`

## 6. Formal tickets

Each ticket is intentionally bounded to one agent-sized behavior. A ticket is
complete only when its acceptance criteria and listed tests pass.

### Foundation and contract

#### MOB-001 — Mobile shell and navigation

**Story:** As a user, I want stable bottom navigation for the five product areas.

**Depends on:** None.

**Done when:** Flutter routes exist for Discover, My Hikes, Create, Activity,
and Profile, with auth-aware guards and standard loading/empty/error states.

**Tests:** Widget-test tab selection, unauthenticated Discover access, protected
route redirect, and restoration after sign-in.

#### API-001 — Hiking domain contract

**Story:** As a mobile client, I need typed contracts for hikes, participants,
activities, notifications, and progress.

**Depends on:** Existing OpenAPI generation and backend module conventions.

**Done when:** DTOs, enums, routes, error responses, and pagination are in the
OpenAPI document and the Dart client regenerates successfully.

**Tests:** OpenAPI validation, generated Dart compilation, and representative
request/response fixtures.

### Identity and discovery

#### AUTH-001 — Google and Apple sign-in

**Story:** As a visitor, I want to sign in with Google or Apple.

**Depends on:** Existing provider-token authentication; Apple provider support.

**Done when:** Both providers produce a secure stored session, sign-out clears
tokens, and an interrupted join/create action resumes after authentication.

**Tests:** Provider success, cancellation, invalid token, expired token, sign-out,
and backend first-request user provisioning.

#### USER-001 — Profile onboarding and analytics consent

**Story:** As a new user, I want to complete my hiking profile.

**Depends on:** AUTH-001; existing `/users/me` API.

**Done when:** Required profile fields block completion; analytics fields are
optional, purpose-labeled, consented, and absent from public profile responses.

**Tests:** Validation, skip analytics, consent persistence, PATCH absent-vs-null
semantics, and public-response redaction.

#### HIKE-001 — Public hike list and filters

**Story:** As a visitor, I want to browse and filter public upcoming hikes.

**Depends on:** API-001; Hike model and list endpoint.

**Done when:** Cards show destination, date/time, difficulty, host, participant
count, and computed available app slots; filters and pagination work.

**Tests:** Public access, each filter, pagination, empty state, malformed filter,
and server-side capacity calculation.

#### HIKE-002 — Public hike details

**Story:** As a visitor, I want enough detail to decide whether to join.

**Depends on:** HIKE-001; public profile response.

**Done when:** Details show the shared pin, requirements, host profile, current
participant profiles, external guest count, remaining slots, and sign-in-gated Join.

**Tests:** Detail rendering, missing hike, profile redaction, full state, and
chat absence before joining.

### Creating and joining

#### HIKE-003 — Location selection and custom pin

**Story:** As a host, I want to select a database location or pin a custom location.

**Depends on:** API-001; map SDK adapter.

**Done when:** Search and map pin selection produce one validated name and
latitude/longitude pair usable by the review screen and public detail screen.

**Tests:** Database selection, custom pin, invalid coordinates, permission
denial, and offline cached-map behavior.

#### HIKE-004 — Create wizard and publish review

**Story:** As a hiker, I want a guided flow for publishing a hike.

**Depends on:** AUTH-001, USER-001, HIKE-003.

**Done when:** The wizard collects date/time, difficulty, capacity, external
guest count, description, and requirements; review prevents invalid publish.

**Tests:** Step navigation, draft persistence during the wizard, required-field
validation, past date, external guests above capacity, and successful publish.

#### HIKE-005 — Instant join and leave

**Story:** As an authenticated user, I want to join or leave a hike immediately.

**Depends on:** HIKE-002, HIKE-004.

**Done when:** Join is atomic, full hikes reject joins, duplicate joins are safe,
and leaving removes active access while preserving audit history.

**Tests:** Happy path, final-slot race, duplicate request, full hike, leave,
host leave restriction, and unauthorized access.

#### HIKE-006 — Host participant management

**Story:** As a host, I want to view and remove joined participants.

**Depends on:** HIKE-005.

**Done when:** Host sees public participant profiles, can remove a participant,
and removal revokes chat access and notifies the user.

**Tests:** Host authorization, non-host rejection, removal, repeated removal,
and revoked chat access.

#### HIKE-007 — Edit, cancel, and delete lifecycle

**Story:** As a host, I want to update or cancel my published hike safely.

**Depends on:** HIKE-005, HIKE-006, NOTIF-001.

**Done when:** Significant edits notify participants; empty hikes can be hard
deleted; hikes with participants become cancelled and remain queryable in history.

**Tests:** Ownership, capacity below current attendance, significant-change
notification, empty-hike delete, joined-hike cancel, and invalid transitions.

### Communication

#### CHAT-001 — Joined-hike chat

**Story:** As a joined participant, I want to coordinate with the host and group.

**Depends on:** HIKE-005, HIKE-006.

**Done when:** Joined app users and the host can paginate and send messages;
visitors, non-joined users, removed users, and external guests cannot access it.

**Tests:** Access matrix, send validation, pagination ordering, removed-user
access, and notification creation for new messages.

### Offline tracking

#### MAP-001 — Map adapter and offline cache

**Story:** As a hiker, I want to view the hike area when cellular data is absent.

**Depends on:** HIKE-003; selected map SDK.

**Done when:** The app can cache the relevant map area before tracking and show
a graceful no-tile state when no cache exists. Provider-specific code is isolated
behind a mobile map service.

**Tests:** Cache success, cache failure, offline rendering, permission denial,
and provider error handling.

#### ACT-001 — Standalone offline GPS tracker

**Story:** As any hiker, I want to track a hike without joining an event or using
cellular data.

**Depends on:** MOB-001, MAP-001; platform location permissions.

**Done when:** Activity can start, pause, resume, and stop; route samples and
timestamps are persisted locally; app restart does not lose an active session.

**Tests:** Permission flows, no network, pause/resume, app restart, low-accuracy
samples, battery-safe sampling, and explicit stop confirmation.

#### ACT-002 — Offline activity report

**Story:** As a hiker, I want a Strava-like route report after stopping.

**Depends on:** ACT-001.

**Done when:** The report shows route line, distance, duration, and elevation;
required values can be corrected manually; photos and notes are optional.

**Tests:** Metric calculation fixture, empty route, noisy elevation, manual
correction validation, optional fields, and report rendering without network.

#### ACT-003 — Activity sync and idempotency

**Story:** As a hiker, I want offline activities to upload automatically later.

**Depends on:** ACT-002, API-001.

**Done when:** Pending activities sync on connectivity restoration, expose sync
status, retry safely, and never duplicate due to repeated upload.

**Tests:** Offline queue, reconnect, server error retry, duplicate client ID,
partial failure, logout/login, and route payload size handling.

#### ACT-004 — Link activity to joined hike

**Story:** As a participant, I want to associate a standalone activity with a
joined hike when appropriate.

**Depends on:** ACT-003, HIKE-005.

**Done when:** The app suggests matches by date/location, permits manual choice,
and allows the activity to remain standalone.

**Tests:** Matching, no match, multiple matches, manual selection, unauthorized
linking, and unlink validation.

#### MEDIA-001 — Optional activity photos

**Story:** As a hiker, I want to attach optional photos to a completed activity.

**Depends on:** ACT-002; attachment storage adapter.

**Done when:** The owner can upload, view, and remove photos through the
attachment boundary; failed uploads do not block saving the activity metrics.

**Tests:** Upload success, invalid file type/size, offline retry, removal,
ownership, and activity report rendering when no photos exist.

### Progress, feed, and notifications

#### SOCIAL-001 — XP, levels, and badges

**Story:** As a hiker, I want completed activities to advance my progress.

**Depends on:** ACT-003.

**Done when:** Event-based and standalone activities award idempotent XP, basic
badges can be awarded, and progress appears in Profile and Activity.

**Tests:** First award, repeat sync, badge threshold, level transition, and
invalid/incomplete activity.

#### SOCIAL-002 — Optional activity sharing

**Story:** As a hiker, I want to choose whether to share a completed activity.

**Depends on:** ACT-003, MEDIA-001, SOCIAL-001.

**Done when:** User can create a feed post containing summary metrics and
optional photos/notes; sharing is opt-in and private activities are not exposed.

**Tests:** Share, skip, edit/delete own post, feed pagination, like uniqueness,
comment validation, and activity privacy.

#### NOTIF-001 — Notification center

**Story:** As a user, I want to see and clear important updates in one place.

**Depends on:** API-001; notification model.

**Done when:** Notifications are persisted, paginated, marked read, and link to
their source hike, chat, activity, or post.

**Tests:** Read/unread state, pagination, source navigation, ownership, and
notification creation for join/leave/update/cancel/comment/like events.

#### NOTIF-002 — Push notification delivery

**Story:** As a user, I want timely push alerts for important events.

**Depends on:** NOTIF-001; platform push credentials and permission flow.

**Done when:** Push permission is requested contextually, device tokens are
registered securely, and push failure does not remove the in-app notification.

**Tests:** Permission granted/denied, token refresh, disabled notifications,
duplicate suppression, deep links, and provider failure.

## 7. Cross-cutting test scenarios

The implementation must cover these end-to-end scenarios in addition to ticket
unit/widget tests:

1. Visitor browses public hikes, opens details, signs in, completes onboarding,
   and joins the final available app slot.
2. Host creates a hike with capacity 10 and five external guests; only five app
   slots are available, and the sixth join is rejected.
3. Two users attempt the last slot concurrently; exactly one succeeds.
4. A joined user enters chat; an unjoined visitor cannot read or send messages.
5. Host edits the meeting details; joined users receive in-app and push alerts.
6. Host deletes an empty hike; a joined hike is cancelled and remains in history.
7. Hiker starts tracking with airplane mode enabled, stops, sees a report, and
   syncs after connectivity returns.
8. A retried offline upload awards one activity and one set of XP rewards.
9. User shares an activity; another user can like/comment; unshared activity
   remains private.
10. User skips demographic analytics fields and can still use all core features.

## 8. Dependency and delivery order

Implement in this order so each slice has a usable contract:

1. API-001 and shared error/pagination conventions
2. AUTH-001 and USER-001
3. HIKE-003, HIKE-004, HIKE-001, and HIKE-002
4. HIKE-005, HIKE-006, and HIKE-007
5. CHAT-001 and NOTIF-001
6. MOB-001 and MAP-001
7. ACT-001, ACT-002, ACT-003, and ACT-004
8. MEDIA-001 and SOCIAL-001
9. SOCIAL-002
10. NOTIF-002

Each backend ticket should add its Flyway migration, DTOs, service/controller
implementation, OpenAPI output, and MockMvc/integration coverage. Each mobile
ticket should add Riverpod state, generated-client usage, screen states, and
Flutter widget/unit tests without editing generated API files manually.

## 9. Explicit non-goals for this MVP

- Next.js landing page
- Friends-only or private hikes
- Waitlists
- GPS navigation or turn-by-turn directions
- Live location sharing
- External guest accounts
- Organizer verification/KYC workflow
- Payments, subscriptions, guides, tours, or marketplace features
- Advanced route analytics or leaderboards
