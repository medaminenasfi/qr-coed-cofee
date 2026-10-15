# Sage & Stone — QR Café ordering MVP

A full-stack starter for QR-code table ordering with a responsive customer menu, staff order dashboard, admin menu/table management, and PostgreSQL persistence.

## Included
- Next.js App Router + TypeScript + responsive UI
- PostgreSQL + Prisma schema and seed data
- Per-table QR token validation
- Customer cart and order submission with server-side price calculation
- Staff login with HTTP-only signed session cookie and bcrypt password hashes
- Role-aware staff views (KITCHEN and BAR see matching station items; ADMIN/MANAGER can manage menu and tables)
- Order workflow: New → Confirmed → Preparing → Ready → Served
- Menu availability toggles, categories, table creation and copyable QR menu links
- Dashboard polling every five seconds (simple reliable MVP alternative to WebSockets)

## Requirements
- Node.js 20.9+
- Docker Desktop or Docker Engine with Compose
- npm

## Run locally (Ubuntu / Windows / macOS)
1. Extract the ZIP and open a terminal in `qr-cafe`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment file:
   ```bash
   cp .env.example .env
   ```
   Before production, set `JWT_SECRET` to a long random value.
4. Start PostgreSQL:
   ```bash
   docker compose up -d db
   ```
5. Generate Prisma client and create tables:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
6. Add demo categories, items, eight tables, and admin account:
   ```bash
   npm run db:seed
   ```
7. Start the app:
   ```bash
   npm run dev
   ```
8. Open http://localhost:3000

## Demo credentials
- Email: `admin@qrcafe.local`
- Password: `ChangeMe123!`

Change this password / seed account before any public deployment. This is demo data.

## Main URLs
- `/` — landing page
- `/menu?table=1` — demo customer menu
- `/menu?table=1&token=<table-token>` — token-protected table URL; copy the tokenized URL from Staff → Tables & QR
- `/staff/login` — staff login
- `/staff` — staff dashboard

## Notes and next steps
This is a runnable MVP starter, not a fully production-hardened restaurant POS. Dashboard updates use polling rather than WebSockets; the bill/waiter request buttons, receipt printing, online payment, staff account management, multi-language UI, image uploads, PDF QR export and formal end-to-end tests are not included yet. The admin screen lets you add categories, items and tables, and toggle item availability.

Before production: add CSRF/rate limiting, password reset and staff account management, audit logs, backup/restore, image storage, a real QR-code PDF generator, WebSocket events, bill settlement logic, and automated tests. Validate deployment security and restaurant tax/payment requirements before real customer use.
# qr-coed-cofee
# qr-coed-cofee
# qr-coed-cofee
