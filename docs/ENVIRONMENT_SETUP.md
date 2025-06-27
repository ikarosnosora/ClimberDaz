# 🔧 Environment Setup Guide

## Required Environment Files

### Frontend Environment Variables

Create `.env.development` in the root directory:
```bash
# ClimberDaz Frontend - Development Environment Variables
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=ClimberDaz
VITE_APP_DESCRIPTION=攀岩找搭子微信小程序
VITE_NODE_ENV=development
VITE_DEBUG=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_SENTRY_DSN=
VITE_ANALYTICS_ID=
VITE_WECHAT_APP_ID=
```

Create `.env.production` in the root directory:
```bash
# ClimberDaz Frontend - Production Environment Variables
VITE_API_BASE_URL=https://api.climberdaz.com/api
VITE_WS_URL=wss://api.climberdaz.com
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=ClimberDaz
VITE_APP_DESCRIPTION=攀岩找搭子微信小程序
VITE_NODE_ENV=production
VITE_DEBUG=false
VITE_ENABLE_PERFORMANCE_MONITORING=false
VITE_SENTRY_DSN=YOUR_SENTRY_DSN_HERE
VITE_ANALYTICS_ID=YOUR_ANALYTICS_ID_HERE
VITE_WECHAT_APP_ID=YOUR_WECHAT_APP_ID_HERE
```

### Backend Environment Variables

Create `backend/.env.development`:
```bash
# ClimberDaz Backend - Development Environment Variables
NODE_ENV=development
PORT=3001

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=climberdaz_dev

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-development-jwt-secret-key-make-it-long-and-secure
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# WeChat Configuration (Development)
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret

# External Services (Development)
SENTRY_DSN=
REDIS_URL=redis://localhost:6379

# File Upload Configuration
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880

# Logging Configuration
LOG_LEVEL=debug
LOG_DIR=logs/
```

Create `backend/.env.production`:
```bash
# ClimberDaz Backend - Production Environment Variables
NODE_ENV=production
PORT=3001

# Database Configuration (MySQL) - Production Optimized
DB_HOST=your-production-db-host
DB_PORT=3306
DB_USERNAME=your-db-username
DB_PASSWORD=your-secure-db-password
DB_DATABASE=climberdaz_prod
DB_CONNECTION_LIMIT=10
DB_POOL_SIZE=10
DB_MAX_QUERY_TIME=5000
DB_SSL=true
DB_LOGGING=false

# Redis Configuration - Production
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# JWT Configuration - CRITICAL: Must be at least 32 characters
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-different-refresh-secret-minimum-32-characters-long
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-minimum-32-characters
SESSION_MAX_AGE=86400000

# CORS Configuration
CORS_ORIGINS=https://climberdaz.com,https://www.climberdaz.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# WeChat Configuration (Production)
WECHAT_APP_ID=your-production-wechat-app-id
WECHAT_APP_SECRET=your-production-wechat-app-secret

# External Services (Production)
SENTRY_DSN=your-production-sentry-dsn
REDIS_URL=redis://your-redis-host:6379

# File Upload Configuration
UPLOAD_PATH=/var/uploads/
MAX_FILE_SIZE=5242880

# Logging Configuration
LOG_LEVEL=error
LOG_DIR=/var/log/climberdaz/

# SSL Configuration
SSL_CERT_PATH=/etc/ssl/certs/climberdaz.crt
SSL_KEY_PATH=/etc/ssl/private/climberdaz.key
```

## Quick Setup Commands

```bash
# Create frontend environment files
cp .env.example .env.development
cp .env.example .env.production

# Create backend environment files
cd backend
cp .env.example .env.development
cp .env.example .env.production

# Edit the files with your actual values
```

## Environment Variables Reference

### Frontend Variables (VITE_*)
- `VITE_API_BASE_URL`: Backend API endpoint
- `VITE_WS_URL`: WebSocket endpoint
- `VITE_APP_*`: Application metadata
- `VITE_DEBUG`: Enable debug mode
- `VITE_SENTRY_DSN`: Error tracking service
- `VITE_WECHAT_APP_ID`: WeChat integration

### Backend Variables
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port
- `DB_*`: Database connection settings
- `REDIS_*`: Redis cache settings
- `JWT_SECRET`: Token signing secret
- `CORS_ORIGINS`: Allowed frontend origins

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit .env files to git**
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Set secure database passwords**
4. **Configure proper CORS origins for production**
5. **Use environment-specific secrets**

## Deployment Checklist

- [ ] Frontend .env.production configured
- [ ] Backend .env.production configured
- [ ] Database credentials updated
- [ ] JWT secret changed to production value
- [ ] CORS origins set to production domains
- [ ] SSL certificates configured
- [ ] External service credentials updated 