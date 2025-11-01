import { WebSocketServer } from 'ws';

let wss;
const clients = new Map(); // Map of userId -> WebSocket connection

/**
 * Initialize WebSocket Server
 * Provides real-time notifications for swap requests
 */
export const initWebSocketServer = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('📡 New WebSocket connection');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        // Handle client identification
        if (data.type === 'IDENTIFY' && data.userId) {
          clients.set(data.userId, ws);
          console.log(`✅ Client identified: ${data.userId}`);
          ws.send(JSON.stringify({ type: 'IDENTIFIED', userId: data.userId }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remove client from map when disconnected
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          console.log(`❌ Client disconnected: ${userId}`);
          break;
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('🔌 WebSocket server initialized');
};

/**
 * Send notification to a specific user
 * @param {string} userId - The user ID to send notification to
 * @param {object} data - The notification data
 */
export const notifyUser = (userId, data) => {
  const client = clients.get(userId);
  if (client && client.readyState === 1) { // 1 = OPEN
    client.send(JSON.stringify(data));
    console.log(`📨 Notification sent to user: ${userId}`);
  }
};

/**
 * Broadcast message to all connected clients
 * @param {object} data - The data to broadcast
 */
export const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(JSON.stringify(data));
    }
  });
};
