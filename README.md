# TradeOS

Institutional-grade personal trading journal & performance analytics
platform — architected as a domain-driven, offline-first monorepo built to
run any prop firm's rule set without a code change.

## Status

**All 10 phases of the original roadmap: complete.** Read [`ARCHITECTURE.md`](./ARCHITECTURE.md)
first — it's the system design and the full build history, including the
deliberate scope decisions (auth UI, billing UI, a running backend) made
along the way and why.

## A note on how this was built

This scaffold was authored in a network-isolated sandbox: no `pnpm install`
or build was possible here. Every package was still validated —
`analytics-engine` (zero external dependencies) type-checks cleanly under
`strict` + `noUncheckedIndexedAccess`, and every other package was
type-checked with workspace imports path-mapped to source. One real bug
was caught and fixed this way (an invalid `as const` on a conditional
expression); the remaining diagnostics were confirmed to trace only to
`zod`/`react`/`dexie`/`clsx`/`class-variance-authority`/`@radix-ui` not
being installed offline, not to logic errors.

## Getting started

```bash
corepack enable
pnpm install
pnpm up --latest        # optional: pull the newest compatible versions —
                         # the ones pinned here were current as of authoring
pnpm db:generate         # once DATABASE_URL is set in packages/infrastructure/persistence-postgres
pnpm dev
```

npm or yarn workspaces would also work with minor script changes if you
prefer; pnpm is recommended for its stricter, more disk-efficient
workspace semantics.

## Package map

| Package | Purpose |
|---|---|
| `@trading-os/shared-types` | Zod schemas + inferred TypeScript types for every entity |
| `@trading-os/domain` | Entities, value objects, domain services, repository ports — framework-free business logic |
| `@trading-os/analytics-engine` | Pure performance/statistical calculations, zero dependencies (verified every phase) |
| `@trading-os/application` | Use cases wiring domain + analytics + repositories together |
| `@trading-os/design-system` | Design tokens, Tailwind v4 theme, UI primitives (Button, Card, Select, Tabs, Drawer, Slider, ...) |
| `@trading-os/ai-services` | `AIInsightService` port with two implementations: Claude-backed and statistical fallback |
| `@trading-os/persistence-postgres` | Prisma schema — server-side source of truth (schema only; not wired to a running database) |
| `@trading-os/persistence-indexeddb` | Dexie-backed offline cache + sync outbox |
| `@trading-os/persistence-memory` | In-memory repositories — backs the demo app and is the natural fixture for use-case unit tests |

## apps/web feature map

| Route | Feature | Built in |
|---|---|---|
| `/dashboard` | Widget engine, KPI grid, equity curve, calendar heatmap | Phase 1 |
| `/journal` | Trade entry form, table, CSV import/export | Phase 2 |
| `/accounts` | Multi-account management, compliance dashboard, payouts | Phase 3 |
| `/playbook` | Strategy library, checklists, statistical setup scoring | Phase 4 |
| `/psychology` | Daily check-ins, mood calendar, discipline/performance correlation | Phase 5 |
| `/risk` | Loss-limit monitoring, position/lot/margin calculators, alerts | Phase 6 |
| `/analytics` | Dimension drill-downs, Monte Carlo projection, correlation matrix | Phase 7 |
| `/reports` | PDF/Excel/JSON report generation | Phase 8 |
| `/insights` | AI trade review, mistake patterns, setup grading, journal summaries | Phase 9 |
| `/settings` | Custom fields, appearance, account/security scope notes | Phase 10 |

## Contributing to this codebase (for future sessions/collaborators)

- New business logic goes in `domain` or `analytics-engine`, never in a
  React component or an API route handler.
- New entity fields go in `shared-types` first; everything downstream
  (Prisma schema, Dexie schema, forms) derives from that one schema.
- A new prop firm is a `PropFirmRuleSetRecord`, not a code change.
- Every color, font, and spacing value a component uses should trace back
  to a token in `design-system` — no ad-hoc hex codes in component code.

## License

Proprietary — internal project scaffold.
