# 01 — Product Vision

## Product
**ParkEase — Smart Parking Reservation System**: a MERN-stack (MongoDB, Express.js, React, Node.js) platform for discovering, reserving, and paying for parking, and for operators to manage parking infrastructure.

## Problem statement
Drivers lose time and money circling for parking and cannot reliably know whether a space exists, what it costs, or whether it will still be free on arrival. Parking operators lack a single tool to publish real inventory, price it, and see occupancy and revenue. Existing small-scale systems typically fake availability with a single counter and trust the client, which produces double bookings, price tampering, and unauthorized access to other users' data.

## Vision
Let a driver find a parking space near a destination, see real availability and the authoritative price, reserve a specific space (or zone-level capacity), pay through a verified payment flow, and receive a confirmed booking — while giving operators and administrators accurate, auditable control. All business-critical truth (availability, price, ownership, payment state) lives on the server.

## Target users
| Persona | Needs |
|---|---|
| Driver (USER) | Find, compare, reserve, pay, cancel, review; manage vehicles and bookings |
| Parking operator (OPERATOR) | Publish facilities/zones/slots, set hours and pricing, monitor occupancy, bookings, revenue |
| Platform administrator (ADMIN) | Oversee users, operators, facilities, bookings, payments, reviews; inspect audit logs and analytics |

## Goals
1. Deliver a correct, double-booking-safe reservation flow backed by MongoDB.
2. Enforce authentication, authorization, and ownership entirely server-side.
3. Use a real, verified payment architecture (no client-asserted payment success).
4. Provide operator and admin tooling that is scoped, audited, and testable.
5. Add AI-assisted recommendations without touching transactional correctness.
6. Serve as a portfolio-grade demonstration of engineering process (stage gates, tests, audits, documentation).

## Non-goals (Stage 00 position)
- Not a CRUD demo; no demo-only security shortcuts.
- Not a distributed-systems showcase; no microservices unless Stage 01 justifies them.
- No on-street enforcement, hardware (barrier/sensor) integration, or fines — not required by this specification. Any such addition requires an owner decision.

## Success criteria
| ID | Criterion | Verification |
|---|---|---|
| SC-1 | Concurrent booking attempts on the same slot/time never produce two active bookings | Concurrency integration test against MongoDB |
| SC-2 | No endpoint returns or mutates another user's private data without authorization | Authorization test matrix |
| SC-3 | Booking confirmation is possible only after server-side verified payment | Payment/webhook tests |
| SC-4 | All old-project weaknesses (see 02-requirements §Regression checks) have automated tests | Test suite + audit |
| SC-5 | Every stage passes its gate (10-definition-of-done.md) before merge to `main` | Gate records |
| SC-6 | A new engineer or AI agent can understand scope and rules from `AGENTS.md` and `docs/` alone | Independent review |

## Relationship to the old repository
`atankit2005-lgtm/ParkEase` is a reference only (a Vite/React frontend with mock data plus an Express/Mongoose backend). This repository is a ground-up rebuild; the old architecture is not to be reproduced.
