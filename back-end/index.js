import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { PORT } from './src/config/index.js';
import { connectDB } from './src/database/index.js';
import { seedLocations } from './src/modules/location/index.js';
import { initUploadFolders } from './src/modules/report/report.upload.js';
import { setupSocket } from './src/socket/index.js';

async function start() {
  await connectDB();
  await seedLocations();
  initUploadFolders();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  app.set('io', io);
  setupSocket(io);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
