"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWebSocket } from "@/app/contexts/WebSocketContext";

const AuctionRoom = () => {
  const { roomCode } = useParams();
  const [size, setSize] = useState(null);
  const [error, setError] = useState(null);

  const { ws, connect, isConnected, sendMessage } = useWebSocket();

  useEffect(() => {
    const setupAndRequestSize = async () => {
      try {
        await connect(roomCode);
        setTimeout(() => {
          sendMessage({ type: "getsize", room: roomCode });
        }, 100);
      } catch (err) {
        setError("WebSocket connection failed.");
      }
    };

    setupAndRequestSize();
  }, [roomCode]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "size") {
        setSize(data.size);
      } else if (data.type === "error") {
        setError(data.message);
      }
    };
  }, [ws]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-2xl">
      {error ? (
        <p className="text-red-400">{error}</p>
      ) : size !== null ? (
        <p>Room Code: {roomCode} — Size: {size}</p>
      ) : (
        <p>Loading room size...</p>
      )}
    </div>
  );
};

export default AuctionRoom;
