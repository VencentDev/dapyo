# Profile Onboarding Design

## Intent

Add a short onboarding flow between account creation and the first visit to Home. It collects the hiking preferences needed to personalize trail discovery and gives new users a clear, consent-based choice about optional demographic analytics. Name and location are already handled elsewhere and must not be asked again.

## Goals

- New email/password and first-time OAuth users complete hiking preferences before Home renders.
- The required portion is a two-step wizard: hiking experience and preferred difficulty first; optional analytics questions second.
- Optional age range, hobbies/interests, and referral source are collected only after explicit analytics consent.
- Users can decline analytics questions and still finish onboarding.
- Optional answers and consent are private to the user and are not included in public profile responses.
- The backend remains the source of truth for onboarding completion and owns profile data APIs.

## Non-goals

- Asking for first, middle, or last name, or location.
- Adding profile pictures, bios, contact details, trail notifications, or account settings screens.
- Building analytics dashboards or using individual optional answers for recommendations.
- Changing the visual design of the rest of Home.

## Constraints and current behavior

- `docs/hiking-app-product-docs/08-user-flow.md` places profile completion and hiking preferences between account creation and hike discovery.
- `docs/hiking-app-product-docs/07-mvp.md` requires experience and preferred difficulty, and says optional analytics must be clearly explained, consented to, excluded from public profiles, and used only for aggregate product analysis.
- Signup already asks for first and last name. OAuth display names are also already available from the identity provider.
- The frontend uses Auth.js JWT sessions and calls Spring APIs through typed client helpers. Frontend business API routes are prohibited by `apps/frontend/AGENTS.md`.
- OAuth sessions have an identity-provider bearer token. Credentials sessions currently do not have an API bearer token, while protected Spring endpoints require one. The existing backend filter recognizes Google/GitHub access tokens; credentials login currently returns only a user response.
- Existing accounts already use Home. They should not be unexpectedly interrupted by this new flow.

## Approaches considered

1. **Two-step wizard (selected):** collect required hiking preferences on step one, then show a separate optional analytics step with consent before its fields. This follows the selected interaction and makes the optional nature of demographic questions explicit.
2. **Single long form:** put all questions on one screen. This is simpler to navigate but makes optional analytics feel like part of required signup and gives less separation to consent.
3. **Progressive questions in Home:** let users enter Home and ask for preferences later. This avoids an onboarding stop but contradicts the requested sequence before Home and leaves trail discovery without the required preferences.

The user selected the two-step wizard and agreed that experience and preferred difficulty are required, while age range, hobbies/interests, referral source, and analytics consent are optional. Name and location are excluded.

## User flow

1. A new user signs up with email/password or signs in with an OAuth provider for the first time.
2. The authenticated user requests `/home`. The Home server page checks the authenticated user's onboarding state through the backend. If incomplete, it redirects to `/onboarding?callbackUrl=%2Fhome` before rendering Home content.
3. `/onboarding` presents a branded, responsive two-step wizard using existing DAPYO theme tokens and current form components.
4. **Step 1 — Your hiking style:** required experience level and preferred trail difficulty. Continue is disabled until both are valid. Back/forward navigation preserves entered values.
5. **Step 2 — Optional insights:** explain that age range, interests, and referral source help DAPYO understand its community in aggregate, are not shown on the public profile, and are optional. Present an explicit opt-in consent control before showing or enabling these questions. If the user declines, hide/disable the questions and allow completion. If the user opts in, show age range, multi-select interests, and referral source; each answer remains individually optional.
6. The final action saves required preferences and the consent choice. The user is sent to the safe local callback destination, defaulting to `/home`. If consent is declined, no optional answers are persisted. If consent is later withdrawn through a future setting, the stored analytics answers must be deleted; adding that settings UI is outside this change.
7. Incomplete onboarding can be resumed after sign-in. A successful completion changes backend state, and Home is then allowed to render.

Unauthenticated visits to `/onboarding` go through the existing login flow, retaining `/onboarding` as the post-auth destination. Completed users visiting `/onboarding` are redirected to the callback destination or `/home`.

## Questions and consent

### Required personalization

- **Hiking experience:** one choice from a small, plain-language set such as “New to hiking,” “Some experience,” and “Hike regularly.” Exact labels and stable values are a builder call.
- **Preferred difficulty:** one choice from the supported trail difficulty levels. Exact options should align with the existing trail catalog when available; otherwise the builder may define the small MVP set.

These are required onboarding preferences, not demographic analytics answers.

### Optional analytics

- **Age range:** categorical range only; never collect date of birth.
- **Hobbies/interests:** multi-select from a curated list; no free-text field in this change.
- **How they found DAPYO:** single-select referral source; no free-text field in this change.
- **Consent:** an explicit opt-in choice, initially off. Consent should be versioned or timestamped in the backend so the collected answers can be tied to the explanation the user saw.

The consent copy must state the aggregate product-analysis purpose and that answers are private and optional. Do not send optional values when consent is off. If consent is off, clear any previously saved optional answers when the user updates onboarding.

## Backend and data design

- Add a private onboarding profile record associated one-to-one with the internal `users.id`, preferably in a dedicated table rather than expanding `UserResponse`. This keeps analytics fields out of public/general user DTOs.
- Store required experience, preferred difficulty, and nullable `completed_at`.
- Store optional age range, selected interests, referral source, and consent timestamp/version only when consent is granted.
- Add authenticated Spring endpoints under `/api/v1/users/me/onboarding` to read status/details and save a draft or complete onboarding. The read operation must provision a first-time OAuth user when needed and create their incomplete onboarding record. All records must be scoped to the authenticated internal user; reject invalid enum values and malformed input.
- A draft save must not mark onboarding complete. Completion requires both required preferences and an explicit analytics consent choice (accept or decline); optional answers are not required.
- New credentials accounts start incomplete at registration. First-time OAuth users start incomplete when provisioned. A Flyway migration marks all accounts that exist at deployment as complete with no inferred onboarding answers, preserving existing users' current Home access.
- Keep onboarding fields out of `UserResponse` and any public profile API. The onboarding read endpoint is self-only.

### Credentials API authentication

Credentials users need to call the same protected backend onboarding API as OAuth users. Extend backend credentials login to issue a short-lived, backend-signed API access token for the authenticated internal user; return it in a login-specific response DTO, store it in the Auth.js JWT/session, and validate it in Spring Security. Keep OAuth bearer validation working. The signing key must come from server configuration/secrets, never source control, and tokens must have an issuer, subject, expiry, and appropriate audience. Do not trust a frontend-supplied completion flag. Registration can continue to create the user and then use the existing credential sign-in step to obtain the API token.

## Frontend route and session behavior

- Add a thin `/onboarding` route entry and colocate its page content, form steps, schemas, and API hooks under `features/auth/onboarding/**` (or another feature-local structure consistent with the repo).
- Add an authenticated onboarding state query and save mutation that use the existing `clientApi` helper.
- Gate `/home` server-side using backend onboarding state. The check must be per authenticated user and must not rely on client state or a client-provided completion claim.
- Preserve callback destinations only when they are same-origin/local paths; default to `/home` to prevent open redirects.
- After successful completion, refresh/revalidate any onboarding query/session state before navigating to the callback destination.
- Keep sign-in and signup forms unchanged apart from routing behavior necessary to enter the gate. Do not ask for names or location again.
- Use the existing DAPYO light/dark theme, spacing, and input styles. Keep the flow keyboard accessible, with visible step progress, labels, validation messages, and focus moved to the new step heading.

## Acceptance criteria

- A newly registered credentials user cannot render Home until the required preferences are saved.
- A first-time Google/GitHub user is also asked to complete onboarding before Home.
- An incomplete user can leave, sign in again, and resume onboarding with saved required values.
- A completed user is not asked to repeat onboarding on later visits.
- Users can opt out of analytics and still complete onboarding.
- With consent off, no age range, interest, or referral answer is persisted; with consent on, those answers are self-only and absent from public/general profile responses.
- Existing users retain access to Home without being prompted by this rollout.
- Login/signup callback destinations cannot bypass the Home onboarding gate or redirect off-site.
- Credentials and OAuth sessions can both authenticate the onboarding API without exposing signing secrets to the browser.

## Builder calls

- Select exact experience, difficulty, age-range, interest, and referral-source options, aligned to any existing backend enums/catalog.
- Choose the repository's existing validation and component primitives for wizard state, focus management, and messages.
- Decide whether incomplete optional-step progress is persisted locally or saved as a backend draft; required experience/difficulty should be saved as a resumable draft when the user leaves step two.
- Choose the concrete Spring/Nimbus token implementation and expiry duration while honoring the token claims and secret-handling constraints above.
- Add consent withdrawal controls when a future settings flow is designed; until then this change records opt-in at collection and supports clearing answers if onboarding is resubmitted with consent off.

## Builder check

A fresh software-engineer review found no blocking questions needed before planning.
