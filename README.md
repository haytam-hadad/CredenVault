# CredenVault - Secure Password Manager

A modern, secure password manager built with Node.js and React. CredenVault provides enterprise-grade encryption, two-factor authentication (2FA), and a beautiful user interface for managing your credentials safely.

## 🔐 Features

### Security
- **AES-256-GCM Encryption**: Military-grade encryption for all stored passwords
- **TOTP-Based 2FA**: Two-factor authentication using time-based one-time passwords
- **Password Strength Validation**: Real-time password strength analysis and recommendations
- **Audit Logging**: Complete security event logging and activity tracking
- **Input Validation & Sanitization**: Comprehensive validation to prevent security vulnerabilities
- **Rate Limiting**: Protected against brute force attacks
- **Secure Session Management**: JWT-based authentication with expiration

### User Experience
- **Dark & Light Mode**: Seamless theme switching with full CSS support
- **Real-Time Security Score**: Visual security indicators and recommendations
- **Beautiful Dashboard**: Intuitive interface showing account overview and recent activity
- **Advanced Search & Filtering**: Easily find and organize your credentials
- **Pagination**: Efficiently handle large account collections
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### Account Management
- **Categorized Accounts**: Organize credentials by category (email, social, finance, work, entertainment)
- **Favorites System**: Mark important accounts for quick access
- **Notes & URLs**: Store additional information and direct links
- **Real-Time Updates**: Changes reflected instantly across the app
- **Bulk Operations**: Manage multiple accounts efficiently

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MongoDB or compatible database

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/haytam-hadad/CredenVault.git
cd CredenVault
```

2. **Backend Setup**
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env

# Generate encryption key
openssl rand -hex 32

# Edit .env with your settings
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install

# Build for production
npm run build

# Or run development server
npm run dev
```

## 📋 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/credenvault

# Security - IMPORTANT: Generate with: openssl rand -hex 32
ENCRYPTION_KEY=your_64_character_hex_string_here

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRE=7d

# CORS - Frontend URLs
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=CredenVault
```

## 🏗️ Architecture

### Backend Structure (Node.js/Express)
```
backend/
├── src/
│   ├── config/              # Database & environment config
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── accountController.js
│   │   └── userController.js
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── Account.js
│   │   └── SecurityLog.js
│   ├── routes/              # API endpoints
│   │   ├── authRoutes.js
│   │   ├── accountRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/          # Express middlewares
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validateRequest.js
│   ├── validators/           # Zod validation schemas
│   │   ├── authValidator.js
│   │   └── accountValidator.js
│   ├── services/             # Business logic
│   │   ├── encryptionService.js
│   │   ├── emailService.js
│   │   └── passwordService.js
│   └── server.js            # Application entry point
└── package.json
```

### Frontend Structure (React)
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── SecurityBadge.jsx
│   │   ├── accounts/        # Account-related components
│   │   │   ├── AccountCard.jsx
│   │   │   └── AccountForm.jsx
│   │   └── layout/          # Layout components
│   │       ├── Navbar.jsx
│   │       └── Sidebar.jsx
│   ├── pages/               # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Accounts.jsx
│   │   └── Settings.jsx
│   ├── store/               # Zustand state management
│   │   ├── authStore.js
│   │   ├── accountStore.js
│   │   └── themeStore.js
│   ├── services/             # API calls
│   │   ├── authService.js
│   │   └── accountService.js
│   ├── utils/               # Helper functions
│   │   └── helpers.js
│   ├── index.css            # Global styles with dark/light mode
│   └── App.jsx              # Main component
└── package.json
```

## 🔄 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| POST | `/auth/logout` | Logout user | ✅ |
| POST | `/auth/setup-2fa` | Setup 2FA | ✅ |
| POST | `/auth/verify-2fa` | Verify 2FA code | ✅ |
| POST | `/auth/disable-2fa` | Disable 2FA | ✅ |

### Accounts Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts` | Get all user accounts (paginated) |
| POST | `/accounts` | Create new account |
| GET | `/accounts/:id` | Get account details |
| PUT | `/accounts/:id` | Update account |
| DELETE | `/accounts/:id` | Delete account |
| POST | `/accounts/:id/toggle-favorite` | Toggle favorite status |

### User Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PUT | `/users/profile` | Update profile |
| POST | `/users/change-password` | Change password |

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String,           // bcryptjs hashed
  firstName: String,
  lastName: String,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,    // Only if 2FA enabled
  createdAt: Date,
  updatedAt: Date
}
```

### Account Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  serviceName: String,
  username: String,
  password: String,           // AES-256-GCM encrypted
  url: String,
  category: Enum,             // email|social|finance|work|entertainment|other
  notes: String,
  isFavorite: Boolean,
  passwordStrength: {
    score: Number,            // 0-4
    label: String             // weak|fair|good|strong|very strong
  },
  createdAt: Date,
  updatedAt: Date
}
```

### SecurityLog Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  action: String,             // login|logout|create_account|update_account|delete_account
  ipAddress: String,
  userAgent: String,
  status: String,             // success|failure
  details: Object,
  createdAt: Date
}
```

## 🔒 Security Implementation

### Password Storage
- Passwords are hashed using **bcryptjs** with **12 rounds** before storage
- Never stored in plain text
- Account passwords are encrypted separately using AES-256-GCM

### Encryption Details
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes / 64 hex characters)
- **IV**: Randomly generated for each encryption
- **Auth Tag**: Ensures data integrity
- **Generate Key**: `openssl rand -hex 32`

### Two-Factor Authentication (2FA)
- **Method**: TOTP (Time-based One-Time Password)
- **Standard**: RFC 6238
- **Code Length**: 6 digits
- **Time Window**: 30 seconds
- **Compatible Apps**: 
  - Google Authenticator
  - Authy
  - Microsoft Authenticator
  - FreeOTP

### Rate Limiting
```
Authentication: 20 requests per 15 minutes
Account Operations: 30 requests per minute
```

### Input Validation
- All inputs validated with Zod schemas
- Email format validation
- Password requirements: minimum 8 characters
- OTP code: exactly 6 digits
- Field length limits to prevent DoS attacks

### Session Security
- JWT-based authentication
- Token expiration: 7 days
- Secure HTTP-only cookies
- CORS protection

## 🎨 Themes & Styling

### Color Palette

| Purpose | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary | Brand Blue | #0EA5E9 | Main actions, focus states |
| Secondary | Indigo | #6366F1 | Accents, secondary elements |
| Success | Emerald | #10B981 | Success messages, strong passwords |
| Warning | Amber | #F59E0B | Warnings, fair passwords |
| Danger | Red | #EF4444 | Errors, weak passwords |
| Background | Slate | #0F172A | Main background (dark) |
| Surface | Slate | #1E293B | Cards, containers (dark) |

### Dark Mode (Default)
```css
--slate-50: 248 250 252;
--slate-100: 241 245 249;
...
--slate-950: 2 6 23;
```

### Light Mode
```css
.light {
  --slate-50: 2 6 23;
  --slate-100: 15 23 42;
  ...
  --slate-950: 248 250 252;
}
```

## 📱 Responsive Design

| Breakpoint | Width | Use Case |
|------------|-------|----------|
| Mobile | < 640px | Phones |
| Tablet | 640px - 1024px | Tablets, large phones |
| Desktop | 1024px+ | Desktops, large screens |

### Mobile-First Approach
- All components designed for mobile first
- Progressive enhancement for larger screens
- Touch-friendly interface elements

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Heroku Deployment
```bash
# Install Heroku CLI
npm i -g heroku

# Login to Heroku
heroku login

# Create app
heroku create credenvault

# Configure buildpacks
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set DATABASE_URL=your_mongodb_url
heroku config:set ENCRYPTION_KEY=your_hex_key
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### Vercel Deployment (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Configure environment variables in Vercel dashboard
```

### Docker Deployment
```dockerfile
# Backend
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 Recent Improvements

### Backend
- ✅ Fixed OTP validation to handle empty/missing tokens
- ✅ Added field length validation (prevent DoS attacks)
- ✅ Implemented pagination for accounts endpoint
- ✅ Added database indexes for better performance
- ✅ Rate limiting on all sensitive endpoints

### Frontend
- ✅ Comprehensive dark/light mode support
- ✅ Redesigned login page with security indicators
- ✅ Enhanced CSS with theme utilities
- ✅ Improved form validation feedback
- ✅ Added security feature badges

## 🐛 Troubleshooting

### Issue: "String must contain exactly 6 character(s)"
**Cause**: OTP token validation failing on empty input
**Solution**: 
- Enter exactly 6 digits from your authenticator app
- Ensure no spaces or special characters
- If you lost your authenticator, disable 2FA in settings

### Issue: Light mode text not visible
**Cause**: CSS theme variables not properly applied
**Solution**:
- Clear browser cache (Cmd+Shift+Delete)
- Hard reload page (Cmd+Shift+R)
- Check `.light` class on `<html>` element

### Issue: Cannot login after creating account
**Cause**: Session or database issue
**Solution**:
- Clear browser cookies and localStorage
- Try logging in from incognito/private window
- Check backend logs for errors

### Issue: "Encryption key must be valid hexadecimal"
**Cause**: Invalid ENCRYPTION_KEY format
**Solution**:
```bash
# Generate valid key
openssl rand -hex 32

# Update .env file
ENCRYPTION_KEY=your_new_key_here

# Restart backend
npm start
```

### Issue: Database connection failed
**Cause**: MongoDB not running or incorrect connection string
**Solution**:
```bash
# Check MongoDB status
mongod --version

# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Test connection string
mongodb://localhost:27017/credenvault
```

## 📚 Additional Documentation

- [**BACKEND_REVIEW.md**](./BACKEND_REVIEW.md) - Detailed backend analysis, security audit, and improvements
- [**FRONTEND_IMPROVEMENTS.md**](./FRONTEND_IMPROVEMENTS.md) - UI/UX enhancements and design decisions
- [**SECURITY_FEATURES_GUIDE.md**](./SECURITY_FEATURES_GUIDE.md) - Security implementation details and best practices
- [**IMPLEMENTATION_SUMMARY.md**](./IMPLEMENTATION_SUMMARY.md) - Complete project overview and deployment guide
- [**CODE_CHANGES.md**](./CODE_CHANGES.md) - Before/after code comparisons
- [**FIXES_APPLIED.md**](./FIXES_APPLIED.md) - All fixes and improvements applied

## 🎯 Development Roadmap

### Phase 2
- [ ] Password generator tool
- [ ] Bulk account import/export
- [ ] Breach detection alerts
- [ ] Account activity history
- [ ] Custom password rules

### Phase 3
- [ ] Team collaboration features
- [ ] Shared vaults
- [ ] Admin dashboard
- [ ] Advanced reporting
- [ ] API for third-party apps

### Phase 4
- [ ] Browser extensions (Chrome, Firefox, Safari)
- [ ] Mobile apps (iOS, Android)
- [ ] Biometric authentication
- [ ] Hardware key support
- [ ] Offline mode

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

## 📞 Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/haytam-hadad/CredenVault/issues)
- **Documentation**: Check the docs folder for detailed guides
- **Security**: Please email security issues to security@credenvault.com

## ⭐ Acknowledgments

- Built with [React](https://react.dev)
- Backend powered by [Express.js](https://expressjs.com)
- Encryption with [crypto](https://nodejs.org/api/crypto.html)
- Validation using [Zod](https://zod.dev)
- UI components styled with [Tailwind CSS](https://tailwindcss.com)

---

**Project Status**: ✅ Production Ready
**Latest Version**: 1.0.0
**Last Updated**: January 2024

🔐 **Protect your passwords with CredenVault** 🔐
