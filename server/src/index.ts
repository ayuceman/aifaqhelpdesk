import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { fileUploadRoutes } from './routes/fileUpload';
import { faqRoutes } from './routes/faq';
import { publicRoutes } from './routes/public';
import { widgetRoutes } from './routes/widget';
import { authRoutes } from './routes/auth';
import { projectRoutes } from './routes/projects';
import { contentSourcesRoutes } from './routes/contentSources';
import paymentRoutes from './routes/payment';
import aiProviderRouter from './routes/aiProvider';
import aiConfigRouter from './routes/aiConfig';

// Load environment variables
dotenv.config({ path: './.env' });
console.log('Environment variables loaded:');
console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID);
console.log('PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS Configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost and configured client URL
    const allowedOrigins = [
      CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Allow widget iframe embeds from any origin
      callback(null, true);
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const logMessage = `[${new Date().toISOString()}] ${method} ${url} ${statusCode} ${duration}ms - ${ip}`;
    
    if (statusCode >= 400) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  });
  
  next();
});

// Rate limiting for public chat endpoint (60 requests per 5 minutes)
const chatLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000'), // 5 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60'),
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', contentSourcesRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ai', aiProviderRouter);
app.use('/api/ai', aiConfigRouter);
app.use('/api/upload', fileUploadRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/public', publicRoutes);
app.use('/widget', widgetRoutes);

// Apply rate limiting to chat endpoint
app.use('/api/public/chat', chatLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
