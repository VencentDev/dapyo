# Profile Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route newly registered and first-time OAuth users through a two-step profile onboarding flow before Home, while keeping existing accounts on their current path.

**Architecture:** Spring owns onboarding records and authenticated endpoints. Backend-issued HS256 access tokens let credentials users use the same protected APIs as OAuth users; the Auth.js session carries the token. Home checks onboarding state server-side, and the onboarding feature saves required preferences as a draft before collecting consent and optional analytics.

**Tech Stack:** Next.js 15, Auth.js v5, React Hook Form, TanStack Query, Spring Boot 4, Spring Security JWT/Nimbus, JPA, Flyway, PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-11-22-profile-onboarding-design.md`

## Global Constraints

- Do not ask for name fields or location again.
- Hiking experience and preferred difficulty are required; age range, interests, referral source, and analytics consent are optional.
- Optional demographic answers are private, require affirmative consent, and are used only for aggregate product analysis.
- Keep business APIs in Spring Boot; do not add Next.js domain API handlers.
- Use the backend as the source of truth for onboarding completion.
- Existing accounts are marked complete by migration and are not prompted.
- Keep OAuth bearer authentication working while adding DAPYO-signed credentials API tokens.
- Keep signing secrets in runtime configuration, never in source control.

## Review Focus

- An expired or invalid DAPYO token must not be accepted as a credentials session.
- Provider OAuth tokens must continue resolving through the existing provider user-info flow.
- A first-time OAuth identity must be provisioned with incomplete onboarding on the first onboarding-state read.
- Declining analytics consent must not persist any age range, interest, or referral value.
- Existing users and callback paths must remain safe: existing users keep Home access, and callbacks stay local.

---

## File Structure

### Backend auth token

- Create `apps/backend/src/main/java/com/vencentdev/backend/modules/auth/config/ApiTokenProperties.java` for issuer, audience, signing secret, and token lifetime.
- Create `apps/backend/src/main/java/com/vencentdev/backend/modules/auth/service/ApiTokenService.java` for signing credentials API access tokens.
- Create `apps/backend/src/main/java/com/vencentdev/backend/modules/auth/dto/LoginResponse.java` for the user plus access token response.
- Modify `apps/backend/src/main/resources/application.yml` and `apps/backend/.env.example` for required runtime JWT settings.
- Modify `apps/backend/src/main/java/com/vencentdev/backend/modules/auth/controller/AuthController.java`, `apps/backend/src/main/java/com/vencentdev/backend/modules/auth/oauth/OAuthProviderAuthenticationFilter.java`, and `apps/backend/src/main/java/com/vencentdev/backend/config/JwtAuthConverter.java` to issue and validate DAPYO JWTs while retaining OAuth provider resolution.
- Modify `apps/frontend/src/lib/auth.ts` and `apps/frontend/src/types/next-auth.d.ts` to preserve a credentials-issued API token in the Auth.js JWT/session.

### Onboarding domain/API

- Create enums in `apps/backend/src/main/java/com/vencentdev/backend/modules/user/onboarding/` for experience, preferred difficulty, age range, interest, and referral source.
- Create `UserOnboardingProfile`, its repository, request/response DTOs, service, and controller under `apps/backend/src/main/java/com/vencentdev/backend/modules/user/onboarding/`.
- Add `apps/backend/src/main/resources/db/migration/V5__add_user_onboarding_profile.sql` to add profile storage, an interests collection table, and completed rows for pre-existing users.
- Modify `apps/backend/src/main/java/com/vencentdev/backend/modules/auth/controller/AuthController.java` so successful registration initializes an incomplete onboarding row.
- The onboarding GET endpoint provisions a first-time OAuth user via `UserService.findOrProvision`, initializes their profile when absent, and returns only their own data.

### Frontend onboarding and gate

- Create the thin route `apps/frontend/src/app/onboarding/page.tsx`.
- Create onboarding page content, wizard form, two step components, options, types, and API hooks under `apps/frontend/src/features/auth/onboarding/`.
- Modify `apps/frontend/src/features/auth/signup/components/signup-page-form.tsx` and `apps/frontend/src/features/auth/shared/components/oauth-buttons.tsx` to send newly created accounts to onboarding while preserving a safe local callback.
- Modify `apps/frontend/src/features/home/feed/components/home-feed-page-content.tsx` to fetch backend onboarding state and redirect incomplete accounts to `/onboarding?callbackUrl=%2Fhome` before rendering Home.
- Modify `apps/frontend/src/lib/auth-routes.ts` to validate callback paths as local paths and to build onboarding URLs.

## Interfaces

- `LoginResponse`: `{ user: UserResponse, accessToken: string, tokenType: "Bearer", expiresIn: number }`.
- `GET /api/v1/users/me/onboarding`: returns `OnboardingProfileResponse` and provisions the first-time OAuth user/profile if absent.
- `PUT /api/v1/users/me/onboarding`: saves required preferences as a draft when analytics consent is absent; completes onboarding when consent is explicitly `true` or `false`. If consent is false, optional analytics values are cleared and omitted.
- `OnboardingProfileResponse`: `{ completed: boolean, experienceLevel: ExperienceLevel | null, preferredDifficulty: TrailDifficulty | null, analyticsConsent: boolean | null, ageRange: AgeRange | null, interests: Interest[], referralSource: ReferralSource | null }`.
- `OnboardingProfileRequest`: `{ experienceLevel: ExperienceLevel, preferredDifficulty: TrailDifficulty, analyticsConsent?: boolean, ageRange?: AgeRange, interests?: Interest[], referralSource?: ReferralSource }`.
- `ApiTokenService.issue(UserResponse user)`: returns a signed token whose subject resolves to the same credentials external ID (`credentials:<normalized-email>`); claims include issuer, audience, expiry, email, display name, and user role.
- `getSafeInternalRedirect(value, fallback)`: returns an app-local path only, rejecting absolute external URLs and protocol-relative paths.

## Tasks

### Task 1: Add DAPYO API tokens for credentials sessions

**Files:**

- Create the auth token property, service, and login response files listed above.
- Modify `AuthController.java`, `OAuthProviderAuthenticationFilter.java`, `JwtAuthConverter.java`, `application.yml`, `.env.example`, `auth.ts`, and `next-auth.d.ts`.

**Interfaces:**

- Produces `POST /api/v1/auth/login` response `LoginResponse`.
- Produces `ApiTokenService.issue(UserResponse): String` and the typed Auth.js credentials user `accessToken`.

- [x] Configure Nimbus HS256 encoder/decoder using a required base64 runtime secret, issuer `dapyo-api`, audience `dapyo-web`, and a 12-hour expiry; do not add a source-controlled secret.
- [x] Make the OAuth provider filter try DAPYO JWT validation first, then keep the existing Google/GitHub user-info resolution for provider tokens; reject tokens that pass neither path.
- [x] Issue tokens for authenticated credentials users with subject `credentials:<normalized-email>` and role `USER`.
- [x] Return the token in `LoginResponse`; update the Auth.js credentials provider to parse it and the JWT/session callbacks to retain it, while OAuth sessions keep their provider token.
- [x] Add only placeholder/generation instructions for the required secret to `.env.example`; do not alter `.env`.

### Task 2: Add onboarding persistence and self-service endpoints

**Files:**

- Create the onboarding enums, entity, repository, DTOs, service, and controller.
- Create `V5__add_user_onboarding_profile.sql`.
- Modify `AuthController.java` to initialize onboarding for newly registered credentials users.

**Interfaces:**

- Consumes DAPYO or provider-authenticated `AuthenticatedUser` from Task 1.
- Produces the GET/PUT onboarding endpoints and `OnboardingProfileResponse` defined above.

- [ ] Create `user_onboarding_profiles` with required preference columns, consent state/version/time, optional age/referral fields, and nullable `completed_at`; create a child interest table.
- [ ] In the migration, create a completed profile row with no inferred preference or analytics answers for every user that already exists.
- [ ] Define stable values: experience `NEW_TO_HIKING`, `SOME_EXPERIENCE`, `HIKE_REGULARLY`; difficulty `EASY`, `MODERATE`, `CHALLENGING`; age buckets `13_17`, `18_24`, `25_34`, `35_44`, `45_54`, `55_PLUS`; interests `NATURE`, `PHOTOGRAPHY`, `CAMPING`, `BIRDWATCHING`, `FITNESS`, `COMMUNITY`, `OTHER`; referral `FRIEND`, `SOCIAL_MEDIA`, `SEARCH`, `EVENT`, `OTHER`.
- [ ] Initialize new credentials registrations as incomplete; have the onboarding GET endpoint provision first-time OAuth identities and initialize their incomplete profile.
- [ ] Scope all reads/writes to the authenticated user; only return optional analytics values to that same user.
- [ ] Make PUT without `analyticsConsent` save a draft only; PUT with explicit `true` stores consent version/time and optional values; PUT with `false` completes without optional values and clears any previously stored optional answers.
- [ ] Keep onboarding fields out of `UserResponse` and all public profile output.

### Task 3: Build the two-step onboarding UI

**Files:**

- Create route and feature files under `apps/frontend/src/app/onboarding/` and `apps/frontend/src/features/auth/onboarding/`.

**Interfaces:**

- Consumes the GET/PUT onboarding API from Task 2 and `session.accessToken` from Task 1.
- Produces a server-rendered onboarding entry that redirects unauthenticated users through login and renders a client wizard for authenticated incomplete users.

- [ ] Implement Step 1 with required experience and preferred difficulty choices; continue is unavailable until both have values, then persist them as an incomplete draft.
- [ ] Implement Step 2 with an initially unselected consent choice: “Share optional insights” or “Skip optional questions.” Only show age range, interests, and referral source after consent is selected; keep each answer optional.
- [ ] Use consent copy that says values are private, optional, and used only for aggregate product analysis; store consent version `onboarding-2026-11-v1` when accepted.
- [ ] On finish, submit the explicit consent choice; omit optional answers on decline; on success route to the safe callback, default `/home`.
- [ ] Restore required preferences from the server draft when an incomplete user returns; preserve entered values when navigating between steps.
- [ ] Follow existing DAPYO light/dark form styling and provide keyboard labels, visible step progress, inline errors, and focus movement to each step heading.

### Task 4: Route signup through onboarding and gate Home

**Files:**

- Modify `signup-page-form.tsx`, `oauth-buttons.tsx`, `auth-routes.ts`, and `home-feed-page-content.tsx`.
- Modify `login-page-content.tsx` and `signup-page-content.tsx` only if required to preserve callback behavior for already authenticated sessions.

**Interfaces:**

- Consumes `serverApi<OnboardingProfileResponse>` from Task 2 and local callback helpers.
- Produces signup and Home redirects that enforce incomplete onboarding before Home renders.

- [ ] After credentials signup/sign-in succeeds, navigate to `/onboarding` and carry the original local callback as `callbackUrl` (default `/home`).
- [ ] Make OAuth buttons on signup carry the same onboarding destination; the onboarding page will immediately forward already-complete OAuth users to their callback.
- [ ] In the Home server page, redirect unauthenticated users to login as today; for authenticated users, fetch onboarding state and redirect incomplete profiles to `/onboarding?callbackUrl=%2Fhome` before rendering feed content.
- [ ] Use a shared same-origin/local-path validator for signup, login, onboarding, and completion redirects; reject external and protocol-relative callback values.
- [ ] If an onboarding API call returns 401, send the user through login with the intended local callback; allow other API errors to surface rather than silently bypassing the gate.

## Execution notes

- Follow the approved design in `docs/superpowers/specs/2026-11-22-profile-onboarding-design.md`.
- Do not add or run tests unless the user asks to test or verify implementation.
- Keep frontend route files thin and do not add Next.js business API routes.
- Do not commit changes until implementation and review are complete; then commit the work in focused commits as previously requested.
