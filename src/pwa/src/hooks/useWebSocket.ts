import { useEffect, useRef, useCallback, useState } from 'react';

interface WSMessage {
  type: 'connected' | 'medication_updated' | 'medication_added' | 'medication_deleted' | 'user_updated' | 'pong';
  uid?: string;
  data?: any;
  timestamp?: string;
}

interface UseWebSocketOptions {
  onMessage?: (message: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

const WS_URL = import.meta.env.VITE_WS_URL ||
  ((window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host + '/ws');

export function useWebSocket(sessionToken: string | null, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const debugLog = (...args: any[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  };

  const connect = useCallback(() => {
    if (!sessionToken) {
      debugLog('No session token, skipping WebSocket connection');
      return;
    }

    // Prevent duplicate connection attempts
    if (isConnectingRef.current) {
      debugLog('Connection already in progress, skipping...');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      debugLog('WebSocket already connected/connecting');
      return;
    }

    try {
      isConnectingRef.current = true;
      setConnectionStatus('connecting');
      debugLog('🔌 Connecting to WebSocket...');

      const url = `${WS_URL}?token=${encodeURIComponent(sessionToken)}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        if (!isMountedRef.current) {
          // If unmounted while opening, close immediately
          ws.close();
          return;
        }
        debugLog('✅ WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          debugLog('📨 WebSocket message:', message);
          onMessage?.(message);
        } catch (error) {
          if (import.meta.env.DEV) console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (ev) => {
        debugLog('🔌 WebSocket disconnected', ev?.code, ev?.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        wsRef.current = null;
        isConnectingRef.current = false;
        onDisconnect?.();

        // Only attempt to reconnect if the component is still mounted and token still present
        if (!isMountedRef.current || !sessionToken) return;

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          debugLog(`Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          debugLog('Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        if (import.meta.env.DEV) console.error('WebSocket error:', error);
        isConnectingRef.current = false;
        onError?.(error as Event);
      };

      wsRef.current = ws;
    } catch (error) {
      isConnectingRef.current = false;
      if (import.meta.env.DEV) console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('disconnected');
    }
  }, [sessionToken, onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }

    isConnectingRef.current = false;
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (err) {
        if (import.meta.env.DEV) console.error('Failed to send WebSocket message:', err);
      }
    } else {
      debugLog('WebSocket is not connected. Message not sent.');
    }
  }, []);

  const sendPing = useCallback(() => {
    sendMessage({ type: 'ping' });
  }, [sendMessage]);

  useEffect(() => {
    isMountedRef.current = true;
    if (sessionToken) {
      connect();
    }

    return () => {
      isMountedRef.current = false;
      disconnect();
    };
    // Intentionally only restart when sessionToken changes.
    // connect is stable enough for this usage because it depends on sessionToken.
  }, [sessionToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendPing();
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isConnected, sendPing]);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    disconnect,
    reconnect: connect
  };
}