import app from './src/app.js';
import { PORT } from './src/config/index.js';
import { connectDB } from './src/database/index.js';

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
