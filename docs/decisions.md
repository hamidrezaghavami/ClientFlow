# Current decisions — November 11, 2026

The user approved moving design iteration to localhost after Figma quota and file-type blockers. The initial Figma-before-code gate is superseded for this landing-page prototype. Review the landing page before expanding to the dashboard.

Journey: Landing → Clerk sign-in/sign-up → Dashboard.

Visual concept: neutral paper background, deep teal, sage green, expressive typography and editable HTML/SVG 2D cards moving from scattered to organized. Hero supports a manual toggle and scroll-triggered transition, with reduced-motion handling.

MVP after design review: dashboard, client CRUD, project CRUD linked to clients, task CRUD and accessible Kanban status controls. No billing, payments, messaging, uploads, notifications or complex teams.

Authentication decision supersedes the original Express-owned password/session proposal: Clerk handles identity. Separate Express API verifies Clerk credentials and owns business logic and authorization. PostgreSQL holds owner-scoped client, project and task data. Cross-owner and parent relationship checks are mandatory. No Next.js API routes or server actions for business logic.

Next milestones: landing feedback; full frontend and Clerk setup; separate Express API and PostgreSQL integration; access-control and end-to-end tests; verified free-tier hosting selection. No paid resources without consent.
