# Technical MVP Architecture

## Recommended Stack

For a cross-platform mobile startup:

### Mobile

**Flutter**

Reason:

- iOS + Android from one codebase.
- Strong performance.
- Good ecosystem.
- Suitable for GPS and map functionality later.

### Backend

Either:

- NestJS + TypeScript
- Spring Boot + Java

Choose based on the team's existing expertise.

### Database

**PostgreSQL**

Core relational data makes PostgreSQL a strong fit.

---

# Suggested Architecture

```text
Flutter Mobile App
        │
        │ HTTPS
        ↓
REST API
        │
        ├── Authentication
        ├── Users
        ├── Mountains
        ├── Hikes
        ├── Participants
        ├── Activities
        ├── Gamification
        ├── Social
        └── Notifications
        │
        ↓
PostgreSQL
```

---

# Core Modules

```text
auth
users
mountains
hikes
participants
activities
gamification
social
notifications
reports
admin
```

Use a module-per-feature structure rather than organizing the entire backend only by technical type.

---

# Core Entities

```text
User
Mountain
Hike
HikeParticipant
Activity
Achievement
UserAchievement
Comment
Like
Notification
Report
```

---

# Hike Lifecycle

Suggested statuses:

```text
DRAFT
PUBLISHED
FULL
IN_PROGRESS
COMPLETED
CANCELLED
```

---

# Participant Lifecycle

```text
JOINED
CONFIRMED
ATTENDED
COMPLETED
CANCELLED
NO_SHOW
REMOVED
```

This makes future attendance and reputation features much easier.

---

# API Design

Potential endpoints:

```text
POST   /auth/register
POST   /auth/login

GET    /users/me
PATCH  /users/me

GET    /mountains
GET    /mountains/:id

POST   /hikes
GET    /hikes
GET    /hikes/:id
PATCH  /hikes/:id
DELETE /hikes/:id

POST   /hikes/:id/join
DELETE /hikes/:id/leave

GET    /hikes/:id/participants

POST   /hikes/:id/activity
POST   /hikes/:id/complete

GET    /users/:id/achievements
GET    /leaderboards

POST   /hikes/:id/comments
POST   /reports
```

Exact API design should be finalized during technical planning.

---

# MVP Engineering Principles

Prioritize:

- Simple architecture.
- Strong validation.
- Authorization.
- Database constraints.
- Auditability.
- Automated tests for critical flows.
- API documentation.
- Error handling.
- Logging.
- Monitoring.
- Backup strategy.
- CI/CD.

Do not prematurely build microservices.

A modular monolith is likely sufficient for the MVP.
