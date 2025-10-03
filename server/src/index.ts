import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileUploadRoutes } from './routes/fileUpload';
import { faqRoutes } from './routes/faq';
import { publicRoutes } from './routes/public';
import { widgetRoutes } from './routes/widget';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/upload', fileUploadRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/public', publicRoutes);
app.use('/widget', widgetRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
