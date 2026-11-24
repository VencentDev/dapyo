# Hike Creation and Organizing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home-feed share placeholder with a persisted hike organizer flow and deliver public upcoming-hike discovery, details, and join/approval actions.

**Architecture:** Build a Spring Boot hike module whose transactional service owns capacity and admission rules, with PostgreSQL as the source of truth and a local-filesystem image adapter behind a storage interface. Add Next.js hike features that call the Spring API, use the existing accepted Trailmates API for immediate organizer additions, and keep incomplete wizard state in the browser until publish.

**Tech Stack:** Java 21, Spring Boot 4, Spring Data JPA, PostgreSQL/Flyway, Next.js 15, React 19, Tailwind 4, TanStack Query, existing OpenAPI-generated TypeScript types.

**Spec:** `docs/superpowers/specs/2026-11-23-hike-creation-and-organizing-design.md`

**Dependency:** Implement `docs/superpowers/plans/2026-11-23-trailmates-connections.md` first. This plan consumes its accepted-connections endpoint and relationship validation.

## Global Constraints

- Hikes are public; the authenticated organizer counts as one member in `maxParticipants`.
- Additional DAPYO members added at creation must be accepted Trailmates and join immediately.
- Outside-account hikers are stored and displayed only as a count and consume capacity.
- Open hikes admit immediately; approval hikes create pending requests that do not consume capacity until accepted.
- All capacity-changing transitions lock/recheck the hike and cannot overbook.
- Captions and photos belong only to the hike listing; recap and trail-note feed posts remain separate.
- Keep incomplete create-wizard state in the browser; only publish valid hikes to the API.
- Use a local-filesystem media adapter behind an interface; store opaque storage keys and image metadata in PostgreSQL.
- Limit each hike to five images of at most 10 MB each; accept JPEG, PNG, and WebP after validating file content.
- Keep Spring business logic in `modules/hike/**`, migrations in Flyway, route files thin, and feature code under `apps/frontend/src/features/**`.
- Do not implement GPS recording, chat, notifications, payments, waitlists, private hikes, or Trail Crew achievements.

## Review Focus

- The host, initial Trailmates, and outside guests together exceed capacity or capacity is zero/negative.
- A start time is in the past, or latitude/longitude falls outside valid geographic bounds.
- Two join or approval transitions race for the last available place.
- A caller attempts to read organizer-only requests or mutate a hike they do not organize.
- An upload has an unsupported, forged, oversized, or duplicate image, or local storage fails during write/delete.

---

### Task 1: Create the hike schema and domain model

**Files:**

- Create: `apps/backend/src/main/resources/db/migration/V7__create_hikes.sql` (includes `hikes`, `hike_participants`, and `hike_images`)
- Create entities under `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/entity/` for `Hike`, `HikeParticipant`, and `HikeImage`
- Create enums under `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/enums/` for `HikeStatus`, `HikeAdmissionMode`, and `HikeParticipantStatus`
- Create repositories under `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/repository/`
- Modify: `apps/backend/src/main/resources/application.yml`

**Interfaces:**

- `Hike` stores organizer, location name and coordinates, scheduled instant, difficulty, maximum participant count, external guest count, admission mode, description, requirements, and status.
- `HikeParticipant` stores only non-organizer DAPYO members with `PENDING`, `JOINED`, `DECLINED`, or `REMOVED` state. The organizer is stored on the hike and counted separately.
- `HikeImage` stores hike id, opaque storage key, MIME type, byte size, caption, display order, and creation time.
- Configure `app.hikes.media-dir` with a persistent development default outside public static serving and allow an environment override.

- [x] Add Flyway tables, foreign keys, uniqueness rules for one participant row per hike/user, and indexes for organizer, upcoming published hikes, and participant state.
- [x] Add JPA entities and repositories matching the migration, with explicit enum strings and a pessimistic-locking hike lookup for capacity mutations.
- [x] Configure the module media directory property and multipart limits to the five-image/10 MB policy without storing uploaded bytes in PostgreSQL.

### Task 2: Implement hike creation, discovery, membership, and approvals

**Files:**

- Create request/response DTOs under `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/dto/`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/common/web/PageResponse.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/service/HikeService.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/service/HikeServiceImpl.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/controller/HikeController.java`
- Modify: `apps/backend/src/main/java/com/vencentdev/backend/config/SecurityConfig.java`

**Interfaces:**

- `POST /api/v1/hikes` accepts `locationName`, `latitude`, `longitude`, `scheduledStartAt`, `difficulty`, `maxParticipants`, `initialMemberIds`, `externalGuestCount`, `admissionMode`, `description`, and `requirements`; it creates the hike and organizer-added members atomically.
- Define `PageResponse<T>(content, page, size, totalElements, totalPages)` in `common/web`; `PageResponse.from(Page<T>)` copies the Spring page metadata and content because no shared page DTO exists yet.
- `GET /api/v1/hikes` returns `PageResponse<HikeSummaryResponse>`; `GET /api/v1/hikes/{id}` returns public details, roster, guest count, capacity, admission mode, ordered image metadata/captions, and an optional authenticated caller status. `@CurrentUser` may resolve to `null` for anonymous reads.
- `POST /api/v1/hikes/{id}/join` joins immediately or creates a pending request according to admission mode. Reject the request if the hike is already full; duplicate joined or pending requests return conflict.
- `GET /api/v1/hikes/{id}/join-requests` and `POST /api/v1/hikes/{id}/join-requests/{userId}/accept|decline` are organizer-only.
- `POST /api/v1/hikes/{id}/members` directly adds an accepted Trailmate; `PATCH /api/v1/hikes/{id}/guests` changes the outside-guest count.
- Available places equal `maxParticipants - 1 organizer - joined DAPYO members - external guests`; pending requests do not count.

- [x] Add request validation for nonblank location, latitude in [-90, 90], longitude in [-180, 180], future start instant, supported difficulty/admission values, positive capacity, nonnegative guest count, required description, and bounded optional requirements.
- [x] Implement transactional create and initial Trailmate additions. Verify every supplied member is an accepted Trailmate of the organizer; reject duplicates, the organizer id, missing members, and any initial group above capacity.
- [x] Implement public paginated upcoming list and detail reads using Spring `Pageable` mapped into `PageResponse.from(Page<T>)`. Map only public organizer/member profile fields, never email, and include a sanitized caller state when authenticated.
- [x] Implement join, organizer approval/decline, immediate Trailmate addition, and guest-count update in the service. Lock the hike row for each capacity transition; accepting a pending request rechecks capacity in the same transaction.
- [x] Add thin authenticated and public controller routes as appropriate, returning DTOs and using existing domain exceptions. Configure only the explicitly public upcoming/detail/image GET routes for anonymous access; keep all mutation and organizer request routes authenticated.
- [x] Update the OpenAPI document and regenerate the TypeScript API types for these DTOs and routes.

### Task 3: Add hike image storage and API

**Files:**

- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/storage/HikeImageStorage.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/storage/LocalHikeImageStorage.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/service/HikeImageService.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/service/HikeImageServiceImpl.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/service/HikeImageDownload.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/config/HikeMediaProperties.java`
- Create: `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/config/HikeMediaConfiguration.java`
- Modify: `apps/backend/src/main/java/com/vencentdev/backend/modules/hike/controller/HikeController.java`
- Modify: `apps/backend/src/main/java/com/vencentdev/backend/common/exception/GlobalExceptionHandler.java`

**Interfaces:**

- `POST /api/v1/hikes/{id}/images` accepts multipart `file` and `caption`, returns image metadata, and is organizer-only.
- `GET /api/v1/hikes/{id}/images/{imageId}` streams a published hike image with its validated content type and is publicly readable; image metadata returned by hike detail uses this endpoint as its URL.
- `DELETE /api/v1/hikes/{id}/images/{imageId}` is organizer-only and removes metadata and stored bytes.
- Store opaque UUID-based file keys; never derive filesystem paths from a submitted filename.

- [x] Implement the storage interface and local adapter with path normalization, collision-safe opaque keys, and cleanup when a write fails after partial file creation.
- [x] Lock the hike while enforcing the five-image limit; validate the 10 MB byte limit, JPEG/PNG/WebP content signature, and caption length before saving metadata. Enforce organizer ownership in the service and delete stored bytes if the metadata transaction fails.
- [x] Add public retrieval and organizer-only removal. Ensure a failed individual upload does not delete the published hike or its other successful photos.
- [x] Add module-level multipart configuration and include upload/retrieval error responses in OpenAPI.

### Task 4: Build the organizer create flow

**Files:**

- Create API hooks and feature components under `apps/frontend/src/features/hikes/api/` and `apps/frontend/src/features/hikes/create/components/`
- Create: `apps/frontend/src/features/hikes/create/lib/hike-draft.ts`
- Modify: `apps/frontend/src/features/home/feed/components/home-feed-content.tsx`
- Modify: `apps/frontend/src/lib/queryKeys.ts`
- Create or modify: `apps/frontend/src/features/trailmates/**` only to link to connection management; connection behavior is delivered by `docs/superpowers/plans/2026-11-23-trailmates-connections.md`.

**Interfaces:**

- `HikeCreateModal` receives `open` and `onOpenChange`; the feed plus action opens it and its copy identifies organizing a hike.
- Wizard draft fields match `POST /api/v1/hikes`; selected image/caption pairs remain browser-local until publish.
- The frontend sends local date/time as an ISO instant and sends initial accepted Trailmate ids plus outside-guest count.

- [x] Replace the inert plus icon with an accessible button and mount the create modal from the home feed.
- [x] Implement the five steps from the approved spec: location/pin, date/time, group and admission, details/photos, review and publish. Preserve values across back/next and API errors.
- [x] Load accepted Trailmates for selection; show the manage-Trailmates link when there are no connections. Validate organizer-inclusive capacity against selected Trailmates and outside guests before publish.
- [x] On successful hike creation, upload queued photos one at a time with captions. Keep successful images and report each failed image with a retry action without resubmitting the hike.
- [x] Add accessible loading, field errors, upload progress, publish pending, and success navigation to the new hike detail page.

### Task 5: Add public hike discovery and details

**Files:**

- Create: `apps/frontend/src/app/discover/page.tsx`
- Create: `apps/frontend/src/app/hikes/[id]/page.tsx`
- Create list, detail, cards, and organizer controls under `apps/frontend/src/features/hikes/discover/components/` and `apps/frontend/src/features/hikes/detail/components/`
- Create list/join/approval hooks under `apps/frontend/src/features/hikes/api/`
- Modify: `apps/frontend/src/features/home/feed/components/home-feed-navigation.tsx`

**Interfaces:**

- `/discover` is a thin route rendering the upcoming list page-content; `/hikes/[id]` forwards `params` to one detail page-content component.
- The list calls `GET /api/v1/hikes` and links each result to `/hikes/{id}`.
- The detail surface displays location, schedule, difficulty, organizer, joined member profiles, outside-guest aggregate, capacity, requirements, photos/captions, and the appropriate Join/Request action.

- [x] Add paginated upcoming cards with available places, admission mode, schedule, difficulty, organizer, and participant summary; link Discover from signed-in navigation.
- [x] Add public hike details and join/request actions. Refresh detail and upcoming queries after join, and communicate pending, joined, full, and API-error states.
- [x] For organizers, show pending requests with accept/decline, add accepted Trailmates immediately, adjust outside guests, and display updated remaining capacity. Keep these controls hidden from non-organizers.
- [x] Handle anonymous public browsing while gating join and organizer mutations behind sign-in, preserving the intended callback path.

### Task 6: Finish documentation and integration notes

**Files:**

- Modify: `packages/api-types/openapi.json`
- Regenerate: `packages/api-types/dist/index.d.ts` using the existing API-types generation script; do not commit generated files if ignored.
- Modify: `README.md` only if implemented user-facing behavior differs from its existing hike requirements or the deferred Trail Crew idea.

- [x] Ensure OpenAPI covers hike creation, pagination, detail, joining, organizer request management, member/guest updates, and image multipart/retrieval/removal contracts.
- [x] Keep hike listing images/captions on the hike entity surface; do not create “Hike recap” or “Trail note” feed posts as a side effect.
- [x] Preserve the deferred Trail Crew achievement note in README without adding achievement implementation.
