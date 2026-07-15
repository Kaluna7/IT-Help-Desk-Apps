import express from 'express';
import { requestLogger } from './middleware/index.js';
import { homeRoutes } from './modules/home/index.js';

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use('/', homeRoutes);

export default app;
