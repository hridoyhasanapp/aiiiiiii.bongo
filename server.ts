import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './src/database/database';
import { chatRouter } from './src/routes/chat';
import { adminRouter } from './src/routes/admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 3000;

// 1. Initialize SQLite Database
initDb();

// 2. Security & Utility Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to prevent blocking React Vite inline HMR/styles in preview
    crossOriginEmbedderPolicy: false
  })
);

app.use(cors({
  origin: '*', // Allow Android Studio mobile app and Vercel clients to connect
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// 3. Mount Backend REST API Routes
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint for Vercel & Android monitoring
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    platform: process.env.VERCEL ? 'Vercel Serverless' : 'Standalone Container',
    serverTime: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Handle 404 for unhandled /api/* routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} does not exist.`
  });
});

// Global Error Handler for API
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: status === 400 ? 'Bad Request' : status === 401 ? 'Unauthorized' : 'Internal Server Error',
    message: err.message || 'An unexpected internal error occurred on the backend server.'
  });
});

// 4. Vite Frontend Admin Panel Middleware (Only attaches locally during development)
async function setupLocalFrontend() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*all', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Only bind to socket if NOT running as Vercel Serverless Function
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Android AI Chat Backend running on port ${PORT}`);
      console.log(`📡 API Chat Endpoint: http://localhost:${PORT}/api/chat`);
      console.log(`🛡️ Admin Panel UI: http://localhost:${PORT}`);
    });
  }
}

// Only run local frontend setup when NOT on Vercel
if (!process.env.VERCEL) {
  setupLocalFrontend();
}
