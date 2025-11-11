import { API_CONFIG } from '../config/api';

let ws: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let authToken: string = '';

export const initWebSocket = (token: string) => {
  authToken = token;
  connectWebSocket();
};

const connectWebSocket = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return;
  }

  ws = new WebSocket(API_CONFIG.WS_URL);

  ws.onopen = () => {
    console.log('WebSocket connected');
    if (authToken) {
      ws?.send(JSON.stringify({ type: 'auth', token: authToken }));
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    } catch (error) {
      console.error('WebSocket message parse error:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    reconnectTimer = setTimeout(() => {
      connectWebSocket();
    }, 5000);
  };
};

const handleWebSocketMessage = (data: any) => {
  console.log('WebSocket message:', data);
  
  if (data.type === 'authenticated') {
    console.log('WebSocket authenticated');
  } else if (data.type === 'notification') {
    console.log('New notification:', data.data);
  }
};

export const disconnectWebSocket = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
  authToken = '';
};

export const sendWebSocketMessage = (message: any) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
};
