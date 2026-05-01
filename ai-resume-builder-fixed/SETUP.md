# AI Resume Builder — Setup Guide

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key
- Google OAuth credentials (for Google Sign-In)

---

## 1. Server Setup

```bash
cd server

# Install dependencies
npm install

# Create your env file
cp .env.example .env
# Then open .env and fill in all values (see comments in the file)

# Start the server (development)
npm run dev

# Or production
npm start
```

The server runs on **http://localhost:5000**

---

## 2. Client Setup

```bash
cd client

# Install dependencies
npm install

# Create your env file
cp .env.example .env
# Fill in VITE_GOOGLE_CLIENT_ID (same as server's GOOGLE_CLIENT_ID)

# Start dev server
npm run dev
```

The client runs on **http://localhost:5173**

---

## Required Environment Variables

### Server (`server/.env`)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs (make it long and random) |
| `GEMINI_API_KEY` | From https://aistudio.google.com/app/apikey |
| `GOOGLE_CLIENT_ID` | From https://console.cloud.google.com/apis/credentials |

### Client (`client/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Same Google Client ID as server |

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `MONGODB_URI is not defined` | Missing `.env` | Copy `.env.example` → `.env` and fill in values |
| `Gemini API error` | Missing or invalid `GEMINI_API_KEY` | Add key to `server/.env` |
| `Invalid Google token` | Wrong `GOOGLE_CLIENT_ID` | Ensure client and server have the same ID |
| `401 Unauthorized` on all requests | Missing `JWT_SECRET` | Add a secret string to `server/.env` |
| Auto-save fails silently | Mongoose cast error on `_id` in subdocuments | Fixed in this version (resume.service.js) |
| ATS panel crashes on page refresh | `atsScore` stored as number but read as object | Fixed in this version (AtsScorePanel) |
