"use client"
import React, { createContext, useContext, useRef, useState } from "react";

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState(null);

  const connect = (room) => {
  return new Promise((resolve, reject) => {
    if (ws.current) {
      return resolve();
    }

    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      ws.current.send(JSON.stringify({ type: "join", room }));
      setRoomCode(room);
      setIsConnected(true);
      resolve();
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      ws.current = null;
      setIsConnected(false);
      setRoomCode(null);
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
      reject(err); 
    };
  });
};


  const disconnect = () => {
    if (ws.current) {
      ws.current.close();
    }
  };

  const sendMessage = (msg) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    }
  };

  return (
    <WebSocketContext.Provider value={{ ws: ws.current, connect, disconnect, sendMessage, isConnected, roomCode }}>
      {children}
    </WebSocketContext.Provider>
  );
};
