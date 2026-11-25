# Hike Creation and Organizing Design

- **Status:** Approved for planning
- **Date:** 2026-11-23
- **Frontend:** Next.js home feed
- **Backend:** Spring Boot hike module

## Intent

Let a signed-in hiker organize a public hike from the home feed, invite or add
people, choose how new joiners are admitted, and publish enough information for
other hikers to decide whether to join. This turns the current “Share a trail
moment” placeholder into a working organizer entry point.

## Current state and constraints

- The home feed composer is static. Its plus icon has no action.
- The backend currently has authentication and user modules, but no Trailmates
  relationships, hike tables, APIs, trail catalog, or media storage adapter.
- The README and formal hiking specs define location, date/time, difficulty,
  maximum participants, external guest count, description, requirements, public
  discovery, participant profiles, and capacity behavior.
- The product rules below supersede the older defaults that all joins are
  immediate and that the host does not consume a participant slot.

## Goals

- Open a create-hike modal from the home-feed plus button.
- Let hikers form and manage mutual Trailmates connections before organizers
  select people for a hike.
- Collect a meeting location, mountain or trail name, optional distance,
  date/time, difficulty, maximum group size, additional DAPYO members,
  outside-account guest count, description, requirements, and optional photos
  with captions.
- Let the organizer choose open joining or organizer approval.
- Publish hikes that other signed-in hikers can browse, inspect, join, or request
  to join, and show registered participants by profile.
- Persist hikes, participant states, guest counts, and image metadata through
  the Spring API and PostgreSQL.

## Product rules

- Hikes are public.
- The organizer counts toward `maxParticipants`. For example, a capacity of 10
  with the organizer and 3 added members leaves 6 places for others.
- DAPYO members added by the organizer appear as named public-profile
  participants and consume one place each. Only accepted Trailmates can be
  added, and they become joined immediately when the organizer adds them.
- Trailmates connections are mutual. A hiker sends a Trailmates request; the
  recipient must accept before either can add the other to a hike.
- Trailmates are created through those explicit requests, not automatically
  from shared hike attendance.
- People without accounts are represented by an outside-guest count such as
  “3 guests”; their names and profiles are not collected or displayed.
- In open mode, a join succeeds immediately if a place remains.
- In approval mode, a join creates a pending request. Pending requests do not
  consume capacity; accepting a request rechecks capacity transactionally.
- No waitlist is created when a hike is full.
- Photos and captions are hike-listing attachments. “Hike recap” and “Trail
  note” feed-post creation remains a separate future feature.
- A hike is published only after its required fields pass validation. Incomplete
  composer state stays in the browser until publish.

## Modal flow

Use a single post-style composer modal that follows the shared activity-card
structure:

1. **Organizer row:** show the organizer name and a settings control for
   open-to-all or approval-required joining.
2. **Post metadata row:** provide a meeting-location field with its pin icon, a
   local date/time picker, and a multi-select for Trailmates already joining.
   Keep required meeting-point coordinates visible in the location area.
3. **Caption and trail:** collect the hike description, then the mountain or
   trail name.
4. **Square photo attachments:** allow up to five JPG, PNG, or WebP images with
   individual captions.
5. **Hike stats:** collect optional distance, total capacity, and outside-account
   guests; show remaining places as capacity minus the organizer, selected
   Trailmates, and outside guests.
6. **Difficulty and requirements:** use foot icons for the difficulty choices
   and keep optional gear or route notes available in a disclosure.

The modal must scroll on short screens, keep publish actions available, show
field-level errors, and recover from an API error without clearing entered
data. The composer copy should clearly identify its plus action as organizing a
hike.

## Backend behavior and API surface

Use the existing module-first Spring structure and authenticated-principal
boundary. Create a Trailmates relationship feature and create a hike with its
initial member/guest records atomically.

- `GET /api/v1/users/search?query={name}` — bounded search of public profiles
  by display name, returning only profile id, display name, and avatar.
- `GET /api/v1/trailmates` — the caller’s accepted Trailmates list.
- `GET /api/v1/trailmates/requests` — incoming and outgoing requests.
- `POST /api/v1/trailmates/requests` — send a request to another DAPYO user.
- `POST /api/v1/trailmates/requests/{id}/accept` and `/decline` — recipient
  manages an incoming request.
- `DELETE /api/v1/trailmates/{userId}` — either member removes the connection.

- `POST /api/v1/hikes` — publish meeting location, mountain/trail name,
  optional distance, schedule, difficulty, capacity, initial DAPYO member IDs,
  outside-account guest count, admission mode, description, and requirements.
- `GET /api/v1/hikes` — public upcoming list with pagination and available-slot
  summary.
- `GET /api/v1/hikes/{id}` — public details with sanitized organizer and
  participant profiles, guest count, admission mode, and capacity summary.
- `POST /api/v1/hikes/{id}/join` — join immediately or create a pending request
  according to the hike’s admission mode.
- `GET /api/v1/hikes/{id}/join-requests` — organizer-only pending requests.
- `POST /api/v1/hikes/{id}/join-requests/{userId}/accept` and `/decline` —
  organizer-only request management; acceptance rechecks capacity in the same
  transaction.
- `POST /api/v1/hikes/{id}/members` — organizer adds an existing Trailmate
  directly as a joined member.
- `PATCH /api/v1/hikes/{id}/guests` — organizer changes the outside-guest
  count while preserving capacity.
- `POST /api/v1/hikes/{id}/images` — organizer-only image upload with a caption.
- `GET /api/v1/hikes/{id}/images/{imageId}` — public image retrieval for a
  published hike.
- `DELETE /api/v1/hikes/{id}/images/{imageId}` — organizer-only image removal.

The hike and participant response DTOs expose only public profile fields and
never expose email addresses. The current user’s status (host, joined, pending,
or not joined) is included when the caller is authenticated.

## Data and capacity

Add Flyway-managed `trailmate_relationships`, `hikes`, `hike_participants`, and
`hike_images` tables. Trailmates relationships store requester, recipient,
pending/accepted/declined state, and timestamps. Keep outside guests as a
nonnegative count on the hike; do not create guest user records. Store the
organizer separately from ordinary participant rows.

```text
availablePlaces = maxParticipants
                  - 1 organizer
                  - active joined DAPYO members
                  - outsideGuestCount
```

Pending requests do not count as active joined members. All transitions that
change capacity or participant status lock/recheck the hike row to prevent
overbooking. A hike cannot be published with a past start time, nonpositive
capacity, negative guest count, or a group size already above capacity.

## Image handling

Store image metadata and captions in PostgreSQL and image bytes behind a
feature-local storage interface. Use a configurable local filesystem adapter for
the current development setup because the repository has no object-storage
provider configured. Validate image MIME type and a bounded file size. The
storage interface should permit a future object-storage adapter without
changing the hike API contract.

If an image upload fails after the hike is published, keep the hike and its
other successful uploads; report the failed item so the organizer can retry.

## Frontend surfaces

- The plus button opens the create modal.
- Add a Trailmates screen or panel to search public profiles, send/accept
  requests, and manage existing connections.
- The organizer selects only accepted Trailmates for immediate addition to a
  hike.
- Add a public upcoming-hikes list and detail surface so hikers can see
  participants and join/request admission.
- The detail surface displays registered member profiles and an aggregate
  outside-guest count.
- The organizer view exposes pending requests, direct member additions,
  outside-guest count, and remaining capacity.

## Non-goals

- GPS recording, chat, push notifications, payments, waitlists, private hikes,
  social likes/comments, and activity recap/trail-note publishing.
- A full map vendor integration or populated mountain/trail catalog. The first
  create flow uses a custom location name and required meeting-point
  coordinates; database trail references remain a later extension.

## Approaches

1. **One long modal:** fastest to create, but crowded on mobile and difficult to
   review with the people/capacity breakdown.
2. **Multi-step modal (recommended):** follows the README flow, fits the
   explicit plus-to-modal request, and makes location, group size, and review
   distinct. It uses browser-local draft state and publishes through the API.
3. **Dedicated create page:** gives the map more room but breaks the requested
   modal entry point.

The multi-step modal is the recommended approach. Public listing, details, and
joining are included because admission rules and visible rosters need a usable
surface beyond the create form.

For adding existing members:

1. **Search all users inside each hike composer:** direct, but repeats discovery
   and exposes profile search in every organizer flow.
2. **Trailmates connections (recommended):** hikers create mutual connections
   once and reuse the accepted list when organizing. This matches the requested
   co-hiker concept.
3. **Email matching:** depends on account email availability and is less
   privacy-preserving than selecting a known public profile.

## Calls for review

- Creating Trailmates through request/accept, with only accepted connections
  eligible for immediate addition to a hike.
- Treating photos/captions as event-listing media, with recap and trail-note
  feed posts left separate.
- Using a custom location name and required coordinates until a trail catalog
  and map provider exist.
- Starting with local filesystem media storage behind a replaceable adapter.
- Awarding no repeat-hike badge in this implementation; the README records the
  future **Trail Crew** achievement idea.
