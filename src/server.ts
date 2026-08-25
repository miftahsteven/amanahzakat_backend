import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/environment';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';

import path from 'path';
import fs from 'fs';

const app = express();

const uploadsRoot = path.join(process.cwd(), 'uploads');
for (const sub of ['slider', 'campaigns', 'cms']) {
  const dir = path.join(uploadsRoot, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Security & Utility Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads — served at /uploads and /api/v1/uploads
// (/api/v1/uploads works behind reverse proxies that only forward /api)
app.use('/uploads', express.static(uploadsRoot));
app.use('/api/v1/uploads', express.static(uploadsRoot));

// Mount Main API Routes
app.use('/api/v1', apiRouter);


// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan di server Amanah Zakat ERP API.`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Start HTTP Server
app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`  🚀 Amanah Zakat ERP Backend API Server Running    `);
  console.log(`  ------------------------------------------------  `);
  console.log(`  Environment : ${config.nodeEnv}                  `);
  console.log(`  URL         : http://localhost:${config.port}/api/v1`);
  console.log(`  Health Check: http://localhost:${config.port}/api/v1/health`);
  console.log(`====================================================`);
});

export default app;
