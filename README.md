# 🚀 Android AI Chat Application - Production Backend (Vercel Ready)

A complete, production-ready Node.js & Express REST API Backend tailored for Android mobile AI Chat applications. Powered by Google Gemini API, SQLite (WAL mode in `/tmp`), JWT Authentication, and a responsive Admin Dashboard built with React & Tailwind CSS. Perfectly optimized for **Vercel Serverless Deployment**.

---

## ✨ Features

- **📱 Android-Ready REST API**: `POST /api/chat` with conversation history support and structured JSON replies.
- **⚡ Vercel Serverless Optimized**: Includes `vercel.json` and `api/index.ts` handler. Automatically redirects SQLite to `/tmp` storage when running in serverless mode.
- **🛡️ Enterprise Security**: Helmet headers, Rate limiting (30 req/min), CORS configured for mobile clients, bcrypt password hashing, and JWT protected admin routes.
- **🤖 Dynamic Gemini Control**: Update API keys, switch models (`gemini-2.5-flash`, `gemini-2.5-pro`), adjust temperature, and customize system instructions directly from the UI without updating your Android APK!
- **📊 Comprehensive Logging**: Tracks response time, status codes, prompt inputs, and errors.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js & Express.js (TypeScript / ES Modules)
- **AI Engine**: `@google/genai` SDK
- **Database**: Embedded SQLite (`better-sqlite3`)
- **Admin Panel**: React 19, Tailwind CSS, Lucide Icons
- **Deployment**: Vercel Serverless (`vercel.json`)

---

## 📦 Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```
- **Backend API**: `http://localhost:3000/api/chat`
- **Admin Dashboard UI**: `http://localhost:3000`

---

## 🔑 Admin Login Credentials

When the server starts for the first time, it seeds a default admin account:

- **Username**: `admin`
- **Password**: `admin123`

> [!IMPORTANT]
> Please login to the Admin Dashboard immediately after deployment and navigate to **Security & Auth** to change your password!

---

## ▲ Vercel Deployment Guide

This project is 100% pre-configured for Vercel.

1. **Push your project to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```
2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/) and click **Add New -> Project**.
   - Import your GitHub repository.
   - Vercel will auto-detect Vite & `vercel.json`.
3. **Add Environment Variables in Vercel Project Settings**:
   - `GEMINI_API_KEY`: `AIzaSyYourKeyHere`
   - `JWT_SECRET`: `your-random-secret-string-2026`
4. Click **Deploy**!

*(Note: In Vercel Serverless Functions, SQLite data in `/tmp` resets when Vercel spins down dormant serverless instances. For permanent logs across server restarts, you can easily swap SQLite with Turso or Vercel Postgres later).*

---

## 📱 Android Studio Integration (Kotlin)

Use Retrofit in your Android mobile app to connect directly to Vercel:

```kotlin
data class ChatRequest(val message: String, val history: List<Any> = emptyList())
data class ChatResponse(val success: Boolean, val reply: String?, val message: String?)

interface AIChatApiService {
    @Headers("Content-Type: application/json")
    @POST("api/chat")
    suspend fun sendMessage(@Body request: ChatRequest): Response<ChatResponse>
}

// Instantiate Retrofit
val retrofit = Retrofit.Builder()
    .baseUrl("https://your-app.vercel.app/") // Your Vercel domain
    .addConverterFactory(GsonConverterFactory.create())
    .build()

val api = retrofit.create(AIChatApiService::class.java)
```

---

## 📄 License

Licensed under the Apache License, Version 2.0.
