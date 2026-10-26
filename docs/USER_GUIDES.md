# TitanFit — User Guides for Gym Admins, Receptionists, Trainers & Members (`USER_GUIDES.md`)

## 1. Gym Owner & Branch Manager Guide
- **Switching Language & Theme**: Use the top-right header controls to switch instantaneously between **English (LTR)** and **العربية (RTL)** and between **Dark** and **Light** modes.
- **Managing Subscriptions & Coupons**: Open **2. Members & Egypt Pay** (`MEMBERS_BILLING`) to create duration or session-pack plans, apply promotional coupons (`RAMADAN20`, `TITAN15`), freeze/unfreeze memberships (which automatically extends the member's expiry date), or issue audited refunds.
- **Financial & Attendance Reports**: Open **5. POS, Reports & Chat** or query `GET /api/v1/reports/executive-summary` to export itemized invoices to CSV/Excel.

## 2. Receptionist Guide
- **QR Gate & Turnstile Check-in**: Open **3. Classes & QR Gate** (`CLASSES_QR_ACCESS`). When a member scans their 30-second rotating QR code, the system verifies their active subscription, checks the 15-minute anti-passback window, and pulses the turnstile gate relay (`1500ms`).
- **Collecting Egypt Payments**: Select `PAYMOB_CARD`, `FAWRY`, `VODAFONE_CASH`, `INSTAPAY` (entering the transfer reference), or `CASH` to issue a bilingual tax invoice with an embedded verification QR code.
- **POS-Lite Checkout**: Open **5. POS, Reports & Chat** to sell protein shakes, water/electrolytes, or merchandise and deduct branch inventory automatically.

## 3. Member PWA Guide
- **Installing the App**: Open TitanFit in Safari (iOS) or Chrome (Android) and tap **"Add to Home Screen"** (`manifest.webmanifest`).
- **Offline Rotating QR Pass**: Your digital membership card refreshes its cryptographic signature every 30 seconds even without internet signal inside the gym.
- **Booking Classes & Waitlists**: Book any scheduled class in 1 tap. If a class is full, join the waitlist—if anyone cancels, you are automatically promoted to `BOOKED` and notified. Tap **Export ICS** to sync the class to your phone calendar.
- **Logging Workouts & Personal Records (PRs)**: Open **4. Member PWA & PRs** (`MEMBER_PWA`), enter your sets, reps, and weights, and TitanFit automatically calculates your Epley 1RM, highlights new Personal Records, and updates your streak points.
