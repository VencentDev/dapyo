# MVP

## MVP Goal

The MVP should answer one critical question:

> **Will hikers use the application to discover and join hikes with other people?**

Do not attempt to build the complete hiking ecosystem in version 1.

---

# MVP Features

The MVP and its core social features are totally free. Do not add pricing,
subscriptions, premium tiers, or payment flows.

## 1. Authentication

- Email authentication.
- Google / Apple authentication.
- Profile creation.

### Profile

```text
Name
Profile photo
Bio
Location
Experience level
Preferred difficulty
```

---

## 2. Mountain / Trail Database

Basic structured information:

```text
Mountain
- Name
- Location
- Elevation
- Difficulty
- Description
- Basic trail information
```

Do not build advanced navigation initially.

---

## 3. Create Hiking Event

Organizer can create:

```text
Mountain
Date
Start time
Meeting point
Difficulty
Maximum participants
Description
Requirements
```

Example:

```text
Mt. Daraitan

September 20
5:00 AM

Difficulty:
Moderate

Participants:
8 / 10

Meeting point:
Tanay

Requirements:
- Hiking experience preferred
- Bring sufficient water
```

---

## 4. Discover Hikes

Home / Discover screen:

```text
Upcoming Hikes

Mt. Daraitan
Sept 20
8 / 10 participants
Moderate

[JOIN]

----------------

Mt. Ulap
Sept 21
5 / 15 participants
Hard

[JOIN]
```

### Filters

- Date.
- Distance.
- Location.
- Difficulty.
- Available slots.

---

## 5. Join / Leave Hike

Users can:

- Join.
- Leave.
- See available slots.
- See participant list.

Organizer can:

- View participants.
- Remove participants.
- Cancel event.

---

## 6. Hiking Event Chat

Each event gets a basic discussion area.

Example:

```text
Mt. Daraitan — Sept 20

Juan:
Meet at 4:30 AM.

Maria:
I'll bring extra water.

Pedro:
Can someone pick me up?
```

Keep this simple in MVP.

---

## 7. Activity Completion

After the hike, users can record:

```text
Distance
Duration
Elevation
Photos
```

Manual activity entry is acceptable for MVP.

GPS tracking can come later.

---

## 8. User Profile

Example:

```text
Juan

🥾 12 Hikes
🏔️ 8 Mountains
📍 67 km

Achievements

🏔️ First Summit
🥾 10 Hikes
🌅 Sunrise Hunter

Recent Hikes

Mt. Daraitan
Mt. Ulap
Mt. Batulao
```

---

## 9. Basic Gamification

MVP should include only:

- XP.
- Levels.
- Basic badges.

Example:

```text
Level 7
Mountain Explorer

XP
1,240 / 1,500
```

---

## 10. Basic Social Feed

Completed hikes can create posts:

> Juan completed Mt. Daraitan 🏔️

> 8.4 km • 4h 32m

Other users can:

- Like.
- Comment.

---

## 11. Notifications

Essential notifications:

- Someone joined your hike.
- Someone left your hike.
- Hike is tomorrow.
- Organizer updated hike.
- Someone commented.
- Hike was cancelled.

---

## 12. Admin Panel

Required from the beginning.

Admin should manage:

- Users.
- Hikes.
- Mountains.
- Reports.
- Organizers.
- Reviews.
- Banned users.
- Moderation.

---

# Explicitly Out of MVP

Do NOT initially build:

- Live GPS tracking.
- Offline maps.
- Advanced navigation.
- Commercial transactions.
- Marketplace.
- Emergency dispatch.
- Wearable integrations.
- AI hiking assistant.
- Complex recommendation engine.
- Hundreds of achievements.
- Advanced route analytics.

These should be validated after the core loop works.
