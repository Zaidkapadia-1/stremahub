# StreamHub: UX and Design-Principles Case Study

## Product problem

Friends sharing streaming subscriptions usually coordinate in chat, so they do not know whether a profile is free, who is using it, or when it will be available. StreamHub makes availability visible and gives the group a low-friction way to coordinate fairly.

## Primary users and tasks

| User | Need | Core task |
| --- | --- | --- |
| Group owner | Set up a shared space without technical effort | Create a group, invite members, add services |
| Group member | Start watching quickly and avoid conflicts | Check a service, claim a free slot, release it when finished |
| Waiting member | Ask for availability without confrontation | See that a service is full and send a time-limited reminder |

## Information architecture

`Home → Create group → Invite → Add accounts → Dashboard → Account detail`

The dashboard is the daily-use home. Secondary tasks—chat, members, and settings—live in persistent navigation so people do not need to remember URLs or retrace setup screens.

## Design principles applied

1. **Visibility of system status** — account cards communicate occupied versus total slots; real-time socket updates keep this state current.
2. **Match with the real world** — language uses familiar actions: *Watch now*, *Claim slot*, *Release*, and *Ping all*.
3. **User control and freedom** — a member can release only their own slot; clear back controls and non-destructive navigation are present throughout.
4. **Consistency and standards** — shared color tokens, pill buttons, input fields, card radii, and a repeating sidebar pattern reduce cognitive load.
5. **Error prevention** — server-side authorization validates each HTTP and socket action; Redis atomically prevents two members from receiving the same slot.
6. **Recognition over recall** — service names, occupancy counts, avatars, and status labels make the current state scannable.
7. **Accessibility** — visible keyboard focus, high-contrast text roles, responsive mobile navigation, and reduced-motion support are included in the design system.

## Interaction decisions

- A slot claim is temporary (two hours) so stale activity cannot lock an account forever.
- A reminder shortens the active slot to two minutes, giving the current viewer time to respond without forcing an immediate release.
- Chat history persists, avoiding the confusing “messages vanished after refresh” experience.
- Sessions are represented by a random server-issued token; client-submitted names and IDs are no longer trusted for protected actions.

## Usability test plan

Test with five students who share at least one streaming service. Ask each person to: create or join a group, find a free slot, claim/release it, and resolve a full-account situation. Measure task completion, time-to-claim, wrong turns, and a 1–5 confidence rating. Iterate on any task where fewer than four of five participants complete it unaided.

## Technical implementation notes

- MongoDB persists groups, members, accounts, and chat messages.
- Redis holds short-lived active slot claims.
- Express protects member/role routes through a session token header.
- Socket.IO authenticates connections once and derives identity from the authenticated member, preventing spoofed group, member, and sender fields.
