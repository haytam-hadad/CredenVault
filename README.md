# CredenVault — Secure Password Manager

A modern, secure password manager built with **Node.js/Express** and **React (Vite)**.
CredenVault stores your credentials with AES-256-GCM encryption, supports TOTP two-factor
authentication, analyses password strength, generates actionable security reminders, and
gates sensitive actions behind a re-authentication layer.

> The user interface is in **French**; this document is in English.

## 🔐 Features

### Security
- **AES-256-GCM encryption** for every stored account password (unique IV per secret).
- **Account passwords are never returned in list responses** — they are decrypted only on the single-account endpoint.
- **bcryptjs** password hashing (12 rounds) for user login credentials.
- **TOTP-based 2FA** (RFC 6238) with QR-code enrolment.
- **Re-authentication layer** — revealing/copying a password, removing a favorite, viewing the account email, and editing the profile require re-entering the master password (with a short "sudo mode" grace window).
- **Password strength analysis** with actionable feedback.
- **Audit logging** of security-relevant events (login, 2FA, account/profile changes, import/export…).
- **Actionable notifications** — weak-password alerts and password-renewal reminders, distinct from the audit log.
- **Zod input validation**, **helmet** headers, **rate limiting**, and CORS protection.
- **JWT authentication** (Bearer token) with configurable expiry.

### User Experience
- Dashboard with a computed security score and recent activity.
- Notification bell in the navbar with an unread badge and dropdown (30s polling).
- Password generator with configurable character sets.
- Import / export of the vault (Data Management page).
- Search, category filtering, favorites, and pagination.
- Responsive, dark-themed UI built with Tailwind CSS.

## 🧱 Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 18, Vite 6, React Router 7, Zustand, Axios, react-hot-toast, lucide-react, Tailwind CSS |
| Backend | Node.js, Express 4, Mongoose 8 (MongoDB), Zod, bcryptjs, jsonwebtoken, speakeasy, qrcode, nodemailer, helmet, express-rate-limit |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- MongoDB (local or hosted)

### 1. Clone
```bash
git clone https://github.com/haytam-hadad/CredenVault.git
cd CredenVault
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env        # then edit values (see below)

# generate a 32-byte hex ENCRYPTION_KEY:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# or: openssl rand -hex 32

npm run dev                 # nodemon (development)
# npm start                 # production
```
The API starts on `http://localhost:5000` (prefix `/api`).

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env        # sets VITE_API_URL

npm run dev                 # Vite dev server on http://localhost:5173
# npm run build && npm run preview   # production build
```

## 📋 Environment Variables

### Backend (`backend/.env`)
`MONGODB_URI`, `JWT_SECRET`, and `ENCRYPTION_KEY` are **required** (the server refuses to
start without them, and `ENCRYPTION_KEY` must be exactly 64 hex characters).

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/credenvault

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 32-byte hex key for AES-256 (generate with the command above)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

CORS_ORIGIN=http://localhost:5173

# Email (Nodemailer) — optional, only needed for email renewal reminders
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=CredenVault <noreply@credenvault.com>
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🏗️ Project Structure

### Backend (`backend/src/`)
```
config/         db.js, env.js
controllers/    authController.js, accountController.js,
                userController.js, securityController.js
models/         User.js, Account.js, Notification.js,
                SecurityLog.js, SecuritySettings.js
routes/         index.js, authRoutes.js, accountRoutes.js,
                userRoutes.js, securityRoutes.js
middlewares/    authMiddleware.js, errorHandler.js, validate.js
validators/     authValidator.js, accountValidator.js,
                userValidator.js, securityValidator.js
services/       encryptionService.js, passwordService.js,
                emailService.js, notificationService.js,
                securityLogService.js
utils/          AppError.js
server.js       Application entry point
```

### Frontend (`frontend/src/`)
```
components/
  ui/           Button, Card, Input, Modal, SecurityBadge, index
  accounts/     AccountCard, AccountForm, PasswordStrength
  auth/         ProtectedRoute, ReAuthContext, ReAuthModal
  layout/       Layout, AuthLayout, Navbar, Sidebar
pages/          Login, Register, Dashboard, Accounts, Favorites,
                PasswordGenerator, ActivityLog, DataManagement,
                Notifications, Settings
store/          authStore, notificationStore, themeStore   (Zustand)
services/       api.js (Axios instance), index.js (service methods)
utils/          helpers.js
main.jsx, App.jsx, index.css
```

## 🔄 API Endpoints

All protected routes require an `Authorization: Bearer <token>` header. Base path: `/api`.

### Auth (`/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register a new user | ❌ |
| POST | `/auth/login` | Log in (returns JWT) | ❌ |
| POST | `/auth/logout` | Log out | ✅ |
| GET | `/auth/me` | Current user | ✅ |
| POST | `/auth/2fa/setup` | Start 2FA enrolment (QR + secret) | ✅ |
| POST | `/auth/2fa/verify` | Verify & enable 2FA | ✅ |
| POST | `/auth/2fa/disable` | Disable 2FA (password + OTP) | ✅ |
| POST | `/auth/verify-password` | Re-authenticate (validate master password) | ✅ |

### Users (`/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get profile |
| PUT | `/users/profile` | Update profile |
| PUT | `/users/password` | Change password |
| GET | `/users/security-settings` | Get security settings |
| PUT | `/users/security-settings` | Update security settings |
| DELETE | `/users/account` | Deactivate account |

### Accounts (`/accounts`, protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts` | List accounts (`category`, `search`, `isFavorite`, `page`, `limit`) |
| POST | `/accounts` | Create account |
| GET | `/accounts/stats` | Account statistics |
| GET | `/accounts/export/all` | Export all accounts (decrypted) |
| POST | `/accounts/import/bulk` | Bulk import |
| GET | `/accounts/:id` | Get one account (includes decrypted password) |
| PUT | `/accounts/:id` | Update account |
| DELETE | `/accounts/:id` | Delete account |

### Security (`/security`, protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/security/password/check-strength` | Evaluate password strength |
| POST | `/security/password/generate` | Generate a secure password |
| GET | `/security/dashboard` | Dashboard stats + recent activity |
| GET | `/security/notifications` | List notifications (`status` filter) |
| GET | `/security/notifications/unread-count` | Unread count |
| PATCH | `/security/notifications/read-all` | Mark all as read |
| POST | `/security/notifications/generate` | Generate weak/outdated reminders (no email) |
| PATCH | `/security/notifications/:id/read` | Mark one as read |
| GET | `/security/logs` | Recent security logs |
| POST | `/security/password-renewals/check` | Email renewal reminders (requires SMTP) |

Health check: `GET /api/health`.

## 📊 Data Models

### User
```javascript
{
  email: String,            // unique, lowercase
  password: String,         // bcrypt hash, select:false
  firstName: String,
  lastName: String,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,  // select:false
  isActive: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### Account
```javascript
{
  userId: ObjectId,             // ref User
  serviceName: String,
  username: String,             // account identifier / login
  encryptedPassword: String,    // AES-256-GCM ciphertext (never exposed in JSON)
  iv: String,                   // per-secret IV (never exposed in JSON)
  url: String,
  category: 'email'|'social'|'finance'|'work'|'entertainment'|'other',
  passwordStrength: { score: 0-4, label: 'very-weak'|'weak'|'fair'|'strong'|'very-strong' },
  lastPasswordChange: Date,
  notes: String,
  isFavorite: Boolean,
  timestamps: true
}
```

### Notification
```javascript
{
  userId: ObjectId,
  message: String,
  type: 'password-renewal'|'security-alert'|'account-update'|'system',
  status: 'unread'|'read'|'archived',
  relatedAccountId: ObjectId,   // ref Account
  metadata: Mixed,              // e.g. { serviceName, username, daysSinceChange }
  timestamps: true
}
```

### SecurityLog
```javascript
{
  userId: ObjectId,
  action: 'login'|'login-failed'|'logout'|'password-change'|
          'account-created'|'account-updated'|'account-deleted'|
          '2fa-enabled'|'2fa-disabled'|'2fa-verified'|
          'profile-updated'|'data-exported'|'data-imported',
  ipAddress: String,
  userAgent: String,
  success: Boolean,
  details: String,
  timestamps: true
}
```

### SecuritySettings
```javascript
{
  userId: ObjectId,                          // unique
  emailNotificationsEnabled: Boolean,        // default true
  passwordRenewalReminderDays: Number,       // 30–365, default 90
  loginAlertsEnabled: Boolean,               // default true
  sessionTimeoutMinutes: Number,             // 15–1440, default 60
  requireTwoFactorForSensitiveActions: Boolean,
  timestamps: true
}
```

## 🔒 Security Implementation

- **User passwords**: bcryptjs, 12 salt rounds, hashed in a Mongoose `pre('save')` hook; `password` field is `select:false`.
- **Account passwords**: AES-256-GCM with a per-secret random IV; the 32-byte key comes from `ENCRYPTION_KEY`. Ciphertext and IV are stripped from JSON output.
- **Re-authentication**: `POST /auth/verify-password` re-checks the bcrypt hash; the frontend `ReAuthProvider`/`useReauth()` gates sensitive actions and keeps a wrong password inside the modal (it is exempt from the Axios 401 auto-logout).
- **2FA**: speakeasy TOTP (6 digits, 30s window) with a `qrcode` enrolment image.
- **Rate limiting**:
  - Global: 100 requests / 15 min on `/api`
  - Auth (`/api/auth/login`, `/api/auth/register`): 20 / 15 min
  - Accounts (`/api/accounts`): 30 / min
- **Other**: helmet headers, JSON body limit (10kb), CORS restricted to `CORS_ORIGIN`, Zod validation on all mutating routes.

## 🔑 Password Strength

`evaluatePasswordStrength` returns a `score` (0–4) and a `label`
(`very-weak`, `weak`, `fair`, `strong`, `very-strong`) plus feedback. A password is
considered weak when `score <= 1`. The generator (`generateSecurePassword`) produces
8–128 character passwords from the selected character sets using Node's `crypto` RNG.

## 🧪 Verification

There is no automated test suite configured. To sanity-check changes:

```bash
# Backend — syntax check controllers/routes you touched
cd backend && node -c src/server.js

# Frontend — production build must succeed
cd frontend && npm run build
```

## 🗺️ Roadmap Ideas
- Breach-detection alerts
- Browser extensions
- Shared vaults / team features
- Biometric / hardware-key authentication
- Offline mode

## 📄 License

MIT (see `package.json`). No standalone `LICENSE` file is included yet.

---

🔐 **Protect your passwords with CredenVault**