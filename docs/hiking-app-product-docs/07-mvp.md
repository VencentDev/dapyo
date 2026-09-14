# Mobile MVP Decision

- **Status:** Approved product scope
- **Date:** 2026-09-14
- **Primary product:** Flutter mobile app
- **Related specification:** [Formal mobile MVP ticket specification](../superpowers/specs/2026-09-14-hiking-mobile-mvp-ticket-spec.md)
- **Next.js:** Reserved for a future landing page; not part of this MVP

## MVP goal

The MVP should answer one question:

> **Will hikers use the app to discover, organize, join, complete, and repeat hikes with other people?**

The core loop is:

```text
DISCOVER → JOIN OR CREATE → COMMUNICATE → HIKE → TRACK OFFLINE
→ COMPLETE → EARN → SHARE → REPEAT
```

The primary value is scheduled social participation. GPS tracking supports the
experience but does not replace the event and community loop.

## Platform and access decisions

- The initial product is a Flutter mobile app for Android and iOS.
- Visitors can browse public upcoming hikes without an account.
- Authentication is required to join, create, sync, earn rewards, or share.
- Mobile authentication supports Google and Apple only.
- Every authenticated user can both join hikes and create hikes.
- All hikes are public in the MVP.
- Core features are free; no payments, subscriptions, or marketplace flows.

## Profile and onboarding

Required profile fields:

- Name
- Location
- Experience level
- Preferred difficulty

Optional analytics fields:

- How the user found the app
- Age or age range
- Other demographic information that has a documented analytical purpose

Analytics fields must be optional, clearly explained, consented to, excluded from
public profiles, and usable only for aggregate product analysis.

## Discover hikes

The Discover screen opens with a list/card view. An optional map view shows the
same public hikes as pins.

Hike cards and details include:

- Destination name
- One map pin representing the destination and meeting location
- Date and start time
- Difficulty
- Host profile
- Current app participant profiles
- External guest count
- Available app slots
- Description and requirements
- Join action

Users can filter by date, distance, location, difficulty, and available slots.

Hikes may use a location from the trail database or a custom map pin.

## Create and manage hikes

Every user can create a public hike through this wizard:

```text
Location → Date/time → Capacity → Details → Review/publish
```

Create fields:

- Location or custom map pin
- Date and time
- Difficulty
- Maximum participants
- External guest count
- Description
- Requirements

External guests are friends who will attend but do not have app accounts. They:

- Count toward the maximum capacity.
- Do not require profiles.
- Do not access chat.
- Appear as a count, not as named participants.

Capacity is calculated as:

```text
available app slots = maximum participants
                     - external guests
                     - joined app participants
```

The host does not consume an app-member slot in the current product decision.

Hosts can:

- View participant profiles.
- Remove participants.
- Edit published hike details.
- Delete a hike if nobody has joined.
- Cancel a hike if participants have joined.

Significant edits notify joined participants. A cancelled hike with participants
is retained in history and notifications are sent. A cancelled empty hike can be
deleted permanently.

There is no waitlist in the MVP. Full hikes reject additional joins.

## Joining and communication

- Joining is immediate while a slot is available.
- Users can leave a joined hike.
- The host is included in the hike group automatically.
- Joined app participants and the host can use the hike chat.
- Chat is completely unavailable to visitors, unjoined users, removed users,
  and external guests.

My Hikes contains two tabs:

- Upcoming
- Completed

Completed status is derived from a past scheduled hike or a linked completed
activity; the host does not need to close the event manually.

## Offline activity tracking

The Activity tab provides a standalone tracker. A user can start tracking even
when they have not joined an app hike.

The tracker must:

- Start, pause, resume, and stop.
- Record GPS points locally without cellular data.
- Survive temporary connectivity loss and app restart.
- Calculate distance, duration, elevation, and route locally.
- Store a completed report offline.
- Sync automatically when connectivity returns.
- Retry safely without creating duplicates.

GPS does not require cellular signal. Map tiles do, so the app should cache the
relevant map area before a hike when the user wants to view the route offline.

The activity report shows:

- Route line
- Distance — required
- Duration — required
- Elevation — required
- Photos — optional
- Notes — optional

If GPS data is incomplete or inaccurate, users can correct the required metrics
before saving. A standalone activity may later be linked to a joined hike, but
it remains valid without one.

## Progress and social sharing

Both event-based and standalone completed activities can:

- Award XP.
- Advance the user's level.
- Unlock basic badges.
- Be optionally shared to the Activity feed.

Shared posts can contain route summary, distance, duration, elevation, optional
photos, and optional notes. Other users can like and comment. Sharing is always
opt-in; unshared activity routes remain private.

## Notifications

The MVP includes an in-app notification center and push notifications for:

- Someone joined or left a hike.
- A hike was updated.
- A hike was cancelled.
- A hike reminder is due.
- A new chat message was sent.
- Someone liked or commented on a shared activity.

The in-app notification is the source of truth. Push delivery failure must not
remove the in-app notification.

## Parallel safety and administration workstream

Because the product connects strangers, the MVP launch work must also cover the
existing trust requirements:

- User reporting
- User blocking
- Event reporting
- Organizer profile and basic reputation
- Attendance history
- Admin moderation
- User, hike, mountain, report, organizer, review, and ban management

These items are retained as a parallel launch workstream. They are not included
in the current core feature-ticket sequence and must be ticketed before a broad
public launch.

## Explicitly out of core MVP scope

- Email/password authentication
- Friends-only or private hikes
- Waitlists
- GPS navigation or turn-by-turn directions
- Live location sharing
- Emergency dispatch, SOS, or guaranteed emergency response
- External guest accounts
- Payments, subscriptions, or marketplace features
- Wearable integrations
- AI hiking assistant
- Complex recommendation engine
- Advanced route analytics or leaderboards

The complete implementation breakdown, API boundaries, data models, and test
scenarios are maintained in the [formal ticket specification](../superpowers/specs/2026-09-14-hiking-mobile-mvp-ticket-spec.md).
