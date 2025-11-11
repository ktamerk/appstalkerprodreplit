import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SESSION_SECRET || 'appstalker-secret-key-change-in-production';

const clients = new Map<string, Set<WebSocket>>();

export const setupWebSocket = (wss: WebSocketServer) => {
  wss.on('connection', (ws: WebSocket, req) => {
    let userId: string | null = null;
    let isAuthenticated = false;

    const authTimeout = setTimeout(() => {
      if (!isAuthenticated) {
        ws.send(JSON.stringify({ type: 'error', message: 'Authentication timeout' }));
        ws.close();
      }
    }, 30000);

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'auth' && data.token) {
          jwt.verify(data.token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) {
              ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
              ws.close();
              return;
            }

            userId = decoded.userId;
            isAuthenticated = true;
            clearTimeout(authTimeout);

            if (userId && !clients.has(userId)) {
              clients.set(userId, new Set());
            }
            if (userId) {
              clients.get(userId)!.add(ws);
            }

            ws.send(JSON.stringify({ type: 'authenticated', userId }));
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clearTimeout(authTimeout);
      if (userId && clients.has(userId)) {
        clients.get(userId)!.delete(ws);
        if (clients.get(userId)!.size === 0) {
          clients.delete(userId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server initialized');
};

export const broadcastToUser = (userId: string, message: any) => {
  if (clients.has(userId)) {
    const userClients = clients.get(userId)!;
    const messageStr = JSON.stringify(message);

    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
};
