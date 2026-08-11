# apps/

Intentionally empty in this Phase 0 drop. Two applications land here starting
with the Dashboard module (Phase 1):

- **`apps/web`** — Next.js 16 (App Router) frontend. Presentation layer only:
  it renders `@trading-os/design-system` components, calls application-layer
  use cases through a thin API client, and holds no business logic of its own.
- **`apps/api`** — Node backend exposing the application layer over tRPC
  (type-safe, single-product internal API) with a REST/webhook surface added
  later for broker integrations. Wires `@trading-os/application` use cases to
  the real `@trading-os/persistence-postgres` repositories.

Everything both apps depend on — domain rules, validation schemas, analytics
math, design tokens and components, persistence — already exists in
`packages/`, built and usable in isolation. That ordering (foundation before
frontend) is deliberate: it's what keeps every future screen consistent
instead of each one reinventing P&L math or restyling a button.
