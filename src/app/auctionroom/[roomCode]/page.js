"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useWebSocket } from "@/app/contexts/WebSocketContext";
import { useRouter } from "next/navigation";

const AuctionRoom = () => {
  const router = useRouter();
  const { roomCode } = useParams();

  if (!roomCode || typeof roomCode !== "string") {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Loading room info...</p>
      </div>
    );
  }

  const actualCode = roomCode.slice(0, 5);
  const teamName = decodeURIComponent(roomCode.slice(5));



  const [size, setSize] = useState(null);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(true);

  const { ws, connect, isConnected, joinRoom, leaveRoom, getReadyState } = useWebSocket();

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      switch (data.type) {
        case "joined":
          setSize(data.size);
          setIsJoining(false);
          setError(null);
          console.log(`Successfully joined room ${data.room} with ${data.size} members`);
          break;

        case "member_joined":
          setSize(data.size);
          console.log(`Member joined. Room now has ${data.size} members`);
          break;

        case "member_left":
          setSize(data.size);
          console.log(`Member left. Room now has ${data.size} members`);
          break;

        case "size":
          setSize(data.size);
          setIsJoining(false);
          break;

        case "error":
          console.error("Server error:", data.message);
          setError(data.message);
          setIsJoining(false);
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (err) {
      console.error("Error parsing WebSocket message:", err);
      setError("Failed to parse server response");
    }
  }, []);

  // Setup WebSocket connection and join room
  useEffect(() => {
    let mounted = true;

    const setupConnection = async () => {
      try {
        setIsJoining(true);
        setError(null);

        // Connect to WebSocket server
        await connect(actualCode);

        // Wait a moment for connection to stabilize, then join room
        setTimeout(() => {
          if (mounted && getReadyState() === WebSocket.OPEN) {
            joinRoom(actualCode);
          }
        }, 100);

      } catch (err) {
        console.error("Failed to setup WebSocket connection:", err);
        if (mounted) {
          setError("Failed to connect to the auction room");
          setIsJoining(false);
        }
      }
    };

    setupConnection();

    return () => {
      mounted = false;
    };
  }, [actualCode, connect, joinRoom, getReadyState]);

  // Listen for WebSocket messages
  useEffect(() => {
    if (!ws) return;

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, handleMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (getReadyState() === WebSocket.OPEN) {
        leaveRoom(actualCode);
      }
    };
  }, [actualCode, leaveRoom, getReadyState]);

  const handleProceed = () => {
    // Leave room before navigating away
    if (getReadyState() === WebSocket.OPEN) {
      leaveRoom(actualCode);
    }
    router.push(`/Teamdetails/${teamName}`);
  };

  const handleRetry = () => {
    setError(null);
    setIsJoining(true);
    setSize(null);

    // Reconnect and join room
    connect(actualCode)
      .then(() => {
        setTimeout(() => {
          if (getReadyState() === WebSocket.OPEN) {
            joinRoom(actualCode);
          }
        }, 1000);
      })
      .catch((err) => {
        console.error("Retry failed:", err);
        setError("Retry failed. Please refresh the page.");
        setIsJoining(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-8">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md w-full text-center border border-white/20">
        <h1 className="text-2xl font-bold mb-6 text-orange-400">
          Auction Room
        </h1>

        <div className="mb-4 text-sm text-gray-400">
          <p>Room Code: <span className="font-mono text-white">{actualCode}</span></p>
          <p>Team: <span className="text-blue-400">{teamName}</span></p>
        </div>

        {error ? (
          <div className="text-red-400 mb-4">
            <p className="text-lg mb-2">⚠️ Connection Error</p>
            <p className="text-sm mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors text-sm"
              >
                Refresh Page
              </button>
            </div>
          </div>
        ) : isJoining ? (
          <div className="text-blue-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-lg mb-2">Joining Room...</p>
            <p className="text-sm">Connecting to auction server...</p>
          </div>
        ) : size !== null ? (
          <div className="space-y-4">
            <div className="text-green-400">
              <p className="text-lg mb-2">✅ Connected!</p>
              <div className="bg-green-900/20 border border-green-500/30 rounded p-4 mb-4">
                <p className="text-2xl font-bold text-white">{size}</p>
                <p className="text-sm">Player{size !== 1 ? 's' : ''} in room</p>
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Proceed to Retentions →
            </button>

            <p className="text-xs text-gray-500">
              Room updates in real-time as players join or leave
            </p>
          </div>
        ) : (
          <div className="text-yellow-400">
            <p>Loading room information...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionRoom;