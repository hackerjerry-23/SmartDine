# SmartDine AI — Fixes applied

This documents the 4 issues that were fixed, their root causes, and what changed.

## 1. Menu section showed no items

**Root cause:** `server/utils/seed.js` only ever seeded tables — it never inserted any
`MenuItem` documents, and there was **no admin page to add menu items** at all (only
backend routes existed: `POST/PUT/PATCH/DELETE /api/menu`). So a fresh database had
zero menu items and no way to add any through the UI.

**Fix:**
- `server/utils/seed.js` now also seeds 17 demo menu items (mains, appetizers,
  desserts, beverages) and inventory items. Run `npm run seed` in `server/` after
  connecting to your database.
- New **Admin → Menu** page (`client/src/pages/admin/Menu.jsx`) — full create/edit/
  delete/toggle-availability UI, wired into the sidebar and router.
- Customer `Menu.jsx` now shows loading, error (with retry), and empty states instead
  of silently rendering nothing on failure.

## 2. Reservation confirmation wasn't happening

**Root cause:** `createReservation` created a reservation stuck at `status: 'pending'`
forever. It never called the existing AI Smart Table Optimizer
(`server/utils/tableOptimizer.js` — fully built, just never used), never assigned a
table, never emailed the customer, and there was **no admin page to view or confirm
reservations at all**.

**Fix:**
- `reservationController.createReservation` now runs the table optimizer at booking
  time, auto-assigns the best-fit table, sets status to `confirmed`, emails the
  customer, and pushes a live socket update.
- `updateReservationStatus` now emails the customer on every status change and, when
  marked `seated`, updates the table's live status so the floor map stays accurate.
- New **Admin → Reservations** page — staff/admin can see every booking and
  confirm / seat / cancel it.
- Customer `Reservations.jsx` now shows the assigned table number and live status
  (via socket) instead of a static "pending" forever.

## 3. Chatbot didn't respond

**Root cause:** The code used `@google/generative-ai` (deprecated, end-of-life
Nov 30, 2025) calling model `gemini-1.5-flash`, which has been fully shut down by
Google — every request returned a 404 with no visible error in the UI.

**Fix:**
- Migrated to the current `@google/genai` SDK (`server/utils/gemini.js`), using the
  auto-updating `gemini-flash-latest` model alias so this won't break again on the
  next model deprecation.
- Added a keyword-based fallback answer for `/api/ai/assistant` so the assistant
  always replies with *something* useful even if the AI call fails (missing key,
  quota, network) — the "chatbot does not respond" UX gap is closed either way.
- Similar graceful fallbacks added to `/api/ai/recommend`, `/api/ai/predict`, and
  `/api/ai/inventory-predict`.
- Frontend now surfaces assistant errors instead of failing silently.
- You must set `GEMINI_API_KEY` in `server/.env` (get one from Google AI Studio) for
  live AI answers; without it, the fallback answers still work.

## 4. Only the creator's email/app password worked

**Root cause:** The SMTP sender was hardcoded to `EMAIL_USER`/`EMAIL_PASS` in the
server's `.env` file — only whoever controlled that file (the original developer)
could ever configure or change the sending account.

**Fix:**
- New `RestaurantSettings` DB model stores a sender email + AES-256-GCM-encrypted
  app password.
- New **Admin → Settings** page: any admin can enter their *own* email address and
  app password directly in the app. The credentials are verified (SMTP `.verify()`)
  before saving, then used for all outgoing mail (OTP, reservation confirmations,
  queue "table ready" notifications) — no `.env` editing needed.
- `server/utils/email.js` now resolves the sender in this order: (1) settings saved
  in the app, (2) `.env` `EMAIL_USER`/`EMAIL_PASS` as a fallback for local dev.
- Added `SETTINGS_ENCRYPTION_KEY` to `.env.example` — a server-level secret used only
  to encrypt the stored app password at rest (not tied to anyone's personal email).
- Also fixed a related bug in `queueController.js` where the "table ready" email
  silently never sent to logged-in customers because `entry.customer` was an
  unpopulated ObjectId (`entry.customer?.email` was always `undefined`).

## Setup after unzipping

```bash
# Backend
cd server
cp .env.example .env        # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY, SETTINGS_ENCRYPTION_KEY
npm install
npm run seed                # populates demo tables + menu + inventory
npm run dev

# Frontend
cd client
cp .env.example .env
npm install
npm run dev
```

Then log in as an admin and visit **Admin → Settings** to connect your own email
account for sending mail, and **Admin → Menu** to review/add dishes.
