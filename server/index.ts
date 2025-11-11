import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import appsRoutes from './routes/apps';
import socialRoutes from './routes/social';
import notificationRoutes from './routes/notifications';
import { setupWebSocket } from './websocket';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Appstalker API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      apps: '/api/apps',
      social: '/api/social',
      notifications: '/api/notifications'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/apps', appsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/notifications', notificationRoutes);

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

setupWebSocket(wss);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Appstalker API Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔌 WebSocket server available at ws://0.0.0.0:${PORT}/ws`);
});
