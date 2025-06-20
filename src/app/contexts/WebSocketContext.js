"use client"
import React, { createContext, useContext, useRef, useState, useCallback } from "react";

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  const connect = useCallback((room) => {
    return new Promise((resolve, reject) => {
      // If already connected to the same room, resolve immediately
      if (ws.current && ws.current.readyState === WebSocket.OPEN && roomCode === room) {
        console.log(`Already connected to room ${room}`);
        return resolve();
      }

      // If connected to a different room, close current connection
      if (ws.current && roomCode && roomCode !== room) {
        console.log(`Switching from room ${roomCode} to ${room}`);
        ws.current.close();
        ws.current = null;
      }

      // Create new connection if none exists or previous was closed
      if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
        console.log(`Connecting to WebSocket server for room ${room}`);
        ws.current = new WebSocket("ws://localhost:8080");

        ws.current.onopen = () => {
          console.log("WebSocket connected successfully");
          setRoomCode(room);
          setIsConnected(true);
          reconnectAttempts.current = 0;
          resolve();
        };

        ws.current.onclose = (event) => {
          console.log("WebSocket disconnected", event.code, event.reason);
          const wasConnected = isConnected;
          ws.current = null;
          setIsConnected(false);
          setRoomCode(null);

          // Only attempt reconnection if it was an unexpected closure
          if (wasConnected && event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            console.log(`Attempting reconnection ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            setTimeout(() => {
              connect(room).catch(console.error);
            }, 2000 * reconnectAttempts.current); // Exponential backoff
          }
        };

        ws.current.onerror = (err) => {
          console.error("WebSocket error:", err);
          reject(new Error("WebSocket connection failed"));
        };

        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
            ws.current.close();
            reject(new Error("WebSocket connection timeout"));
          }
        }, 10000); // 10 second timeout

        // Clear timeout when connection opens
        const originalOnOpen = ws.current.onopen;
        ws.current.onopen = (event) => {
          clearTimeout(connectionTimeout);
          if (originalOnOpen) originalOnOpen(event);
        };
      }
    });
  }, [isConnected, roomCode]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      console.log("Manually disconnecting WebSocket");
      // Send leave message before closing if connected to a room
      if (roomCode && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "leave", room: roomCode }));
      }
      ws.current.close(1000, "Manual disconnect"); // Normal closure
      ws.current = null;
      setIsConnected(false);
      setRoomCode(null);
    }
  }, [roomCode]);

  const sendMessage = useCallback((msg) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("Sending message:", msg);
      ws.current.send(JSON.stringify(msg));
      return true;
    } else {
      console.warn("Cannot send message: WebSocket not connected", {
        wsExists: !!ws.current,
        readyState: ws.current?.readyState,
        isConnected
      });
      return false;
    }
  }, [isConnected]);

  const joinRoom = useCallback((room) => {
    return sendMessage({ type: "join", room });
  }, [sendMessage]);

  const leaveRoom = useCallback((room) => {
    return sendMessage({ type: "leave", room });
  }, [sendMessage]);

  const getReadyState = useCallback(() => {
    if (!ws.current) return WebSocket.CLOSED;
    return ws.current.readyState;
  }, []);

  const value = {
    ws: ws.current,
    connect,
    disconnect,
    sendMessage,
    joinRoom,
    leaveRoom,
    isConnected,
    roomCode,
    getReadyState
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};