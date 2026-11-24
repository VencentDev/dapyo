# Trailmates Connections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let signed-in hikers find each other by display name, exchange mutual Trailmates requests, and manage accepted connections for hike organizing.

**Architecture:** Add a module-first Spring Boot relationship API and a bounded authenticated user-search endpoint. Add a Next.js Trailmates page backed by the existing API client and React Query; hike creation will consume the accepted-connection response from this plan.

**Tech Stack:** Java 21, Spring Boot 4, Spring Data JPA, PostgreSQL/Flyway, Next.js 15, React 19, TanStack Query, existing OpenAPI-generated TypeScript types.

**Spec:** `docs/superpowers/specs/2026-11-23-hike-creation-and-organizing-design.md`

## Global Constraints

- Trailmates connections are mutual and require an explicit request and acceptance.
- Only accepted Trailmates are eligible for an organizer to add directly to a hike.
- Search by public display name and return only profile id, display name, and nullable avatar URL; never expose email.
- Reject self-requests and prevent duplicate pending or accepted relationships in either direction.
- Declining a request leaves the pair able to send a new request later.
- Keep backend business logic in `modules/<module>/**`, use Flyway migrations, and keep frontend feature code under `src/features/**`.

## Review Focus

- Searching with blank, one-character, long, or non-matching terms returns a bounded and predictable result without exposing account email.
- Sending a request to oneself, an unknown profile, or an already-connected/pending profile returns a safe client error.
- Accepting or declining a request is restricted to its recipient; connection removal is limited to either member.
- Concurrent requests for the same pair cannot create duplicate pending or accepted relationships.
- A declined pair can later start a new request without making the old request visible as pending.

---

### Task 1: Add bounded profile search

**Files:**

- Modify: `apps/backend/src/main/java/com/vencentdev/backend/modules/user/repository/UserRepository.java`
- Modify: `apps/backend/src/main/java/com/vencentdev/backend/modules/user/service/UserService.java`
- Modify: `apps/backend/src/main/java/com/vencentdev/backend/modules/user/service/UserServiceImpl.java`
- Modify: `apps/backend/src/main/java/com/vencentdev/backend/modules/user/controller/UserController.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/user/dto/PublicUserSearchResponse.java`

**Interfaces:**

- Produce `GET /api/v1/users/search?query={displayName}` requiring authentication and returning at most 20 `PublicUserSearchResponse(id, displayName, avatarUrl)` records. `avatarUrl` is nullable because the current user model has no avatar field.
- Require at least two non-whitespace query characters, trim the query, exclude the caller, and search display names case-insensitively. Return an empty list for no matches.

- [x] Add the repository’s bounded case-insensitive display-name search and service/controller methods. Resolve the caller through `UserService.resolveInternalId`, map only public fields, and reject malformed or too-short search terms through the existing API error handling.
- [x] Keep search authenticated under the existing `anyRequest().authenticated()` rule; do not add an anonymous profile-search exception.

### Task 2: Persist and expose Trailmates request lifecycle

**Files:**

- Create: `apps/backend/src/main/resources/db/migration/V6__create_trailmate_relationships.sql`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/trailmates/entity/TrailmateRelationship.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/trailmates/enums/TrailmateRelationshipStatus.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/trailmates/repository/TrailmateRelationshipRepository.java`
- Create: request/response DTOs under `apps/backend/src/main/java/com/vencentdev/backend/modules/trailmates/dto/`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/trailmates/service/TrailmateService.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/trailmates/service/TrailmateServiceImpl.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/trailmates/controller/TrailmateController.java`

**Interfaces:**

- `GET /api/v1/trailmates` returns accepted connections with public profile fields.
- `GET /api/v1/trailmates/requests` returns separate incoming and outgoing pending request lists.
- `POST /api/v1/trailmates/requests` accepts `{ "userId": "<uuid>" }` and returns the pending request.
- `POST /api/v1/trailmates/requests/{id}/accept` and `/decline` are recipient-only transitions.
- `DELETE /api/v1/trailmates/{userId}` removes the accepted relationship for either member.
- Store one row per unordered user pair with a requester id and `PENDING`, `ACCEPTED`, or `DECLINED` status. Enforce pair uniqueness in the database; a declined row may be reset to a new pending request.

- [x] Create the Flyway table with UUID keys, foreign keys, timestamps, a stable unordered-pair uniqueness rule, and indexes for either member plus status.
- [x] Implement transactional request, accept, decline, list, and remove operations. Validate that users are distinct and exist; make accept/decline recipient-only and removal available only to a member of an accepted pair.
- [x] Add thin authenticated controller endpoints using `@CurrentUser`, explicit DTOs, existing domain exceptions, and no entity serialization.
- [x] Regenerate the OpenAPI snapshot and generated frontend API types after the API shape is final.

### Task 3: Build the Trailmates management surface

**Files:**

- Create: `apps/frontend/src/app/trailmates/page.tsx`
- Create: `apps/frontend/src/features/trailmates/api/trailmates.hooks.ts`
- Create: `apps/frontend/src/features/trailmates/components/trailmates-page-content.tsx`
- Create: `apps/frontend/src/features/trailmates/components/trailmates-search.tsx`
- Create: `apps/frontend/src/features/trailmates/components/trailmates-requests.tsx`
- Create: `apps/frontend/src/features/trailmates/components/trailmates-list.tsx`
- Modify: `apps/frontend/src/lib/queryKeys.ts`
- Modify: `apps/frontend/src/features/home/feed/components/home-feed-navigation.tsx`

**Interfaces:**

- React Query hooks use the existing `clientApi`, session access token, and generated `paths` types; mutation success invalidates the accepted list and request-list keys.
- The `/trailmates` route remains a thin page entry that renders one feature page-content component.

- [x] Add query keys and hooks for profile search, accepted Trailmates, pending requests, send, accept, decline, and remove operations.
- [x] Build the page with a debounced display-name search, request action, incoming accept/decline controls, outgoing pending state, and accepted Trailmates list with remove action. Use initials when `avatarUrl` is null and provide loading, empty, and API-error states.
- [x] Add a “Trailmates” navigation destination to the signed-in home navigation and link back to `/home` after connection management.

### Task 4: Update API documentation and handoff notes

**Files:**

- Modify: `packages/api-types/openapi.json`
- Regenerate: `packages/api-types/dist/index.d.ts` using the existing API-types generation script; do not commit generated files if the package ignores them.
- Modify: `README.md` only if the implemented request behavior changes the already-recorded Trailmates or deferred Trail Crew description.

- [x] Ensure OpenAPI documents the authenticated search and Trailmates endpoints, request/response schemas, and status/error behavior.
- [x] Keep the README’s future **Trail Crew** achievement as a deferred idea; do not implement achievements in this feature.
