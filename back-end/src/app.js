import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestLogger } from './middleware/index.js';
import { homeRoutes } from './modules/home/index.js';
import { locationRoutes } from './modules/location/index.js';
import { reportRoutes } from './modules/report/index.js';
import { authRoutes } from './modules/auth/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(requestLogger);
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/locations', locationRoutes);
app.use('/reports', reportRoutes);

export default app;
