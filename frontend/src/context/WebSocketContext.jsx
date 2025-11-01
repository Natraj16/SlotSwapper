import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

/**
 * WebSocket Context Provider
 * Manages real-time WebSocket connections for live notifications
 */
export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const reconnectTimeoutRef = useRef(null);

  const connect = () => {
    if (!isAuthenticated || !user) return;

    try {
      const websocket = new WebSocket('ws://localhost:3001');

      websocket.onopen = () => {
        console.log('🔌 WebSocket connected');
        setConnected(true);
        
        // Identify the user to the server
        websocket.send(JSON.stringify({
          type: 'IDENTIFY',
          userId: user.id,
        }));
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message:', data);

          // Add to notifications
          if (data.type !== 'IDENTIFIED') {
            setNotifications(prev => [data, ...prev]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('❌ WebSocket disconnected');
        setConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, 3000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setWs(websocket);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws) {
      ws.close();
      setWs(null);
      setConnected(false);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  const value = {
    ws,
    connected,
    notifications,
    clearNotifications,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Custom hook to use WebSocket context
 */
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};
