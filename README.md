# 🛡️ EmailGuard - Enterprise Email Threat Detection Platform

**EmailGuard** is a modern, high-performance web application designed for analyzing and detecting whether emails are **SAFE**, **SPAM**, **PHISHING**, or **SUSPICIOUS**. Built with modern React, TypeScript, and a bespoke Vanilla CSS Cybersecurity Design System.

---

## ✨ Key Features

1. **Enterprise Authentication Flow**
   - Clean `/login` portal with EmailGuard branding.
   - Show / hide password toggle.
   - "Remember me" session persistence.
   - "Forgot password?" interactive token request modal.
   - Passwords secured via **Web Crypto API salted SHA-256** (never stored in plaintext).
   - Instant 1-click **"Auto Fill Demo Credentials"** button.

2. **Executive Security Dashboard (`/dashboard`)**
   - Header with active heuristic engine status indicator (`AI & Rule Engine Active`).
   - Logged-in user badge, role designation, and profile avatar menu.
   - Four real-time metric cards: **Emails Analyzed**, **Safe Emails**, **Spam Detected**, **Phishing Detected**.
   - Interactive Email Threat Inspector with two input formats:
     - **Raw Email Paste** (automatically extracts RFC822 headers: `From:`, `Subject:`, `Body:`)
     - **Detailed Fields** (individual inputs for Sender, Subject, Body)
   - One-click **Quick Test Samples** for instant testing:
     - *PayPal Urgent Account Suspension (Phishing)*
     - *Microsoft 365 Password Expiration (Phishing)*
     - *Mega Millions Winner Notification (Spam)*
     - *Urgent Wire Invoice Update (Suspicious)*
     - *GitHub Security Advisory / Pull Request (Safe)*
     - *Stripe Monthly Invoice Receipt (Safe)*

3. **Transparent Heuristic Detection Engine**
   - Modular security scanner in [src/services/detectionService.ts](file:///c:/Users/sushm/Desktop/Email_detection/src/services/detectionService.ts).
   - Detects:
     - **Direct IP Hostnames** (e.g. `http://45.33.32.156/login`)
     - **Lookalike Brand Spoofing / Typosquatting** (`paypa1-security-verification.xyz`, `micros0ft-corporation-auth.xyz`)
     - **Deceptive Link Mismatches** (anchor text displays one domain but points secretly elsewhere)
     - **High-Risk Top-Level Domains** (`.xyz`, `.top`, `.tk`, `.work`, etc.)
     - **Obfuscated Link Shorteners** (`bit.ly`, `tinyurl.com`)
     - **Urgent / Coercive Language** ("action required within 24 hours", "account locked")
     - **Credential Harvesting** (passwords, PINs, SSNs, credit card CVVs, 2FA/OTPs, seed phrases)
     - **Financial Business Email Compromise (BEC)** (unauthorized wire transfer or revised banking coordinates)
     - **Promotional Spam** (lottery claims, free prizes, all-caps subjects, excessive exclamation marks)
   - Returns structured verdicts:
     - `SAFE` (Vibrant Emerald Green)
     - `SPAM` (Deep Orange)
     - `PHISHING` (High-Risk Crimson Red)
     - `SUSPICIOUS` (Caution Amber Yellow)
   - Clearly labeled **Confidence Estimate %** with legal disclaimer.
   - Defanged URL inspection list (`hxxp://...`) preventing accidental clicks.
   - Actionable security recommendation checklists.
   - Export analysis to JSON format.

4. **Detection Audit Log & History (`/history`)**
   - Comprehensive table of historical scans with timestamps, senders, subjects, classifications, confidence %, and indicator counts.
   - Filter by classification tab (`ALL`, `PHISHING`, `SUSPICIOUS`, `SPAM`, `SAFE`).
   - Search filter by sender, subject, or explanation.
   - Modal inspection view for deep examination.
   - Export history to **CSV**.
   - Confirmation dialog before clearing history.

5. **Security & Account Settings (`/settings`)**
   - User profile info (Name, Email, Role assignment).
   - Change password UI with strength validation and current password verification.
   - Heuristic sensitivity levels: *Conservative*, *Balanced*, *Aggressive*.
   - Notification preferences (High-Risk Phishing alerts, Weekly digest, Auto-record history).
   - Live **Theme Switcher**:
     - **Cyber Dark** (Default high-contrast cybersecurity dark mode)
     - **Enterprise Blue** (Deep cobalt SOC console)
     - **Light Slate** (Crisp corporate light mode)

6. **Secure Session Management & Logout**
   - Protected route guards redirecting unauthenticated users to `/login`.
   - Accessible confirmation modal when clicking **"Sign Out"**.
   - Clears session tokens upon sign-out.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18+ recommended, v22+ supported)
- npm (v9+)

### 2. Installation
Clone or navigate to the project directory:
```bash
cd Email_detection
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Demo Login Credentials
| Email | Password | Role |
| :--- | :--- | :--- |
| `admin@emailguard.io` | `Password123!` | Security Analyst |

*(Or simply click the **"Auto Fill"** button on the `/login` screen)*

### 5. Running the Automated Heuristic Test Suite
To verify the accuracy of the detection engine against phishing, spam, suspicious, and safe samples:
```bash
npm test
```

### 6. Building for Production
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

---

## 📂 Project Architecture

```
Email_detection/
├── src/
│   ├── types/
│   │   └── index.ts               # Core TypeScript data contracts (AnalysisResult, User, etc.)
│   ├── services/
│   │   ├── detectionService.ts    # Transparent heuristic email threat detection engine
│   │   ├── authService.ts         # Salted SHA-256 authentication & session persistence
│   │   └── storageService.ts      # Local persistence for history, statistics & settings
│   ├── data/
│   │   └── sampleEmails.ts        # Pre-crafted realistic test emails for 1-click evaluation
│   ├── context/
│   │   └── AuthContext.tsx        # React context managing user authentication state
│   ├── components/
│   │   ├── Navbar.tsx             # Header with profile menu and live engine status
│   │   ├── Sidebar.tsx            # Navigation drawer with route links & sign-out trigger
│   │   ├── StatCard.tsx           # Dashboard metric cards (Total, Safe, Spam, Phishing)
│   │   ├── EmailForm.tsx          # Dual-mode input form with quick test samples
│   │   ├── AnalysisCard.tsx       # Result presentation banner, estimate %, indicators & defanged URLs
│   │   ├── HistoryModal.tsx       # Inspection modal for historical records
│   │   ├── ConfirmModal.tsx       # Accessible action confirmation dialog
│   │   └── Toast.tsx              # Toast feedback notification container
│   ├── pages/
│   │   ├── LoginPage.tsx          # Full login screen with password toggle & validation
│   │   ├── DashboardPage.tsx      # Main dashboard with scanner & radar animation
│   │   ├── HistoryPage.tsx        # Audit log table with CSV export & search filters
│   │   └── SettingsPage.tsx       # User profile, password changer & theme preferences
│   ├── App.tsx                    # Root routing, layout shell & route protection guards
│   ├── index.css                  # Custom CSS design system (Cyber Dark / Enterprise Blue / Light Slate)
│   └── main.tsx                   # React DOM entry point
├── test-engine.mjs                # Automated heuristic test suite
├── .env.example                   # Environment configuration template
└── package.json
```

---

## 🔒 Security Best Practices Implemented

1. **Untrusted Input Containment**: Analyzed email content is treated strictly as untrusted data. Embedded URLs are defanged (`hxxp://`) and displayed as non-executable text.
2. **Zero Plaintext Password Storage**: Passwords are hashed using standard `crypto.subtle.digest('SHA-256')` with unique cryptographic salts.
3. **Route Protection**: All administrative endpoints (`/dashboard`, `/history`, `/settings`) enforce authentication checks before rendering.
4. **Separation of Concerns**: The detection engine is a standalone service (`detectionService.ts`), completely decoupling heuristic logic from the UI. This enables seamless replacement with a machine learning model, API endpoint, or LLM backend.

---

## 🔌 Connecting External Backends (Supabase / ML Model)

Refer to [.env.example](file:///c:/Users/sushm/Desktop/Email_detection/.env.example) for environment configuration parameters:
- To connect a real backend (e.g. Supabase, Firebase, or PostgreSQL), simply swap the persistence adapter in `src/services/storageService.ts` and `src/services/authService.ts`.
- To route through an external ML phishing detector, update `analyzeEmail()` in `src/services/detectionService.ts` to query your REST endpoint.
