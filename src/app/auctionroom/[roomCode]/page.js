"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useWebSocket } from "@/app/contexts/WebSocketContext";
import { useRouter } from "next/navigation";

const AuctionRoom = () => {
  const router = useRouter();
  const { roomCode } = useParams();
  
  // Validate room code first
  if (!roomCode || typeof roomCode !== "string" || roomCode.length < 5) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Invalid room code. Please check the URL.</p>
      </div>
    );
  }

  const actualCode = roomCode.slice(0, 5);
  const teamName = decodeURIComponent(roomCode.slice(5));

  const [size, setSize] = useState(null);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  const { ws, connect, isConnected, joinRoom, leaveRoom, getReadyState } = useWebSocket();
  useEffect(() => {
    if (size === 20) {
     {/* router.push("/Mainroom/");*/}
      router.push(`/Mainroom/${roomCode}`);

    }
  }, [size, router]);
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      switch (data.type) {
        case "joined":
          setSize(data.size);
          setIsJoining(false);
          setError(null);
          setConnectionStatus("Connected!");
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
          setConnectionStatus("Connected!");
          break;

        case "error":
          console.error("Server error:", data.message);
          setError(data.message);
          setIsJoining(false);
          setConnectionStatus(`Error: ${data.message}`);
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (err) {
      console.error("Error parsing WebSocket message:", err);
      setError("Failed to parse server response");
      setConnectionStatus("Message error");
    }
  }, []);

  // Setup WebSocket connection and join room
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimer;

    const setupConnection = async () => {
      if (!isMounted) return;
      
      try {
        setIsJoining(true);
        setError(null);
        setConnectionStatus("Connecting to server...");

        // Connect to WebSocket server
        await connect(actualCode);
        setConnectionStatus("Connected! Joining room...");

        // Retry mechanism for joining room
        const attemptJoinRoom = () => {
          if (!isMounted) return;
          
          const state = getReadyState();
          if (state === WebSocket.OPEN) {
            joinRoom(actualCode);
            setConnectionStatus("Waiting for room confirmation...");
          } else if (retryCount < maxRetries) {
            retryCount++;
            setConnectionStatus(`Retrying join... (${retryCount}/${maxRetries})`);
            retryTimer = setTimeout(attemptJoinRoom, 1000);
          } else {
            setError("Failed to join room after multiple attempts");
            setIsJoining(false);
            setConnectionStatus("Connection failed");
          }
        };

        attemptJoinRoom();

      } catch (err) {
        console.error("Connection setup failed:", err);
        if (isMounted) {
          setError("Failed to connect to the auction server");
          setIsJoining(false);
          setConnectionStatus("Connection failed");
        }
      }
    };

    setupConnection();

    return () => {
      isMounted = false;
      clearTimeout(retryTimer);
    };
  }, [actualCode, connect, joinRoom, getReadyState]);

  // Listen for WebSocket messages
  useEffect(() => {
    if (!ws) return;

    const messageHandler = (event) => handleMessage(event);
    ws.addEventListener("message", messageHandler);

    // Handle connection errors
    const errorHandler = () => {
      setError("WebSocket connection error");
      setConnectionStatus("Connection lost");
    };

    // Handle connection close
    const closeHandler = () => {
      if (getReadyState() === WebSocket.CLOSED) {
        setError("Connection closed unexpectedly");
        setConnectionStatus("Disconnected");
      }
    };

    ws.addEventListener("error", errorHandler);
    ws.addEventListener("close", closeHandler);

    return () => {
      ws.removeEventListener("message", messageHandler);
      ws.removeEventListener("error", errorHandler);
      ws.removeEventListener("close", closeHandler);
    };
  }, [ws, handleMessage, getReadyState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (getReadyState() === WebSocket.OPEN) {
        leaveRoom(actualCode);
      }
    };
  }, [actualCode, leaveRoom, getReadyState]);

  const handleProceed = () => {
    if (getReadyState() === WebSocket.OPEN) {
      leaveRoom(actualCode);
    }
    router.push(`/Teamdetails/${teamName}`);
  };

  const handleRetry = async () => {
    setError(null);
    setIsJoining(true);
    setConnectionStatus("Reconnecting...");
    
    try {
      await connect(actualCode);
      
      // Wait for connection to stabilize
      setTimeout(() => {
        if (getReadyState() === WebSocket.OPEN) {
          joinRoom(actualCode);
          setConnectionStatus("Rejoining room...");
        } else {
          setError("Reconnection failed");
          setConnectionStatus("Failed");
          setIsJoining(false);
        }
      }, 500);
    } catch (err) {
      setError("Reconnection failed");
      setConnectionStatus("Error");
      setIsJoining(false);
    }
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
          <p className="mt-2 text-xs text-yellow-300">{connectionStatus}</p>
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
                Reconnect Now
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
            <p className="text-lg mb-2">Joining Auction Room...</p>
            <p className="text-sm">{connectionStatus}</p>
          </div>
        ) : size !== null ? (
          <div className="space-y-4">
            <div className="text-green-400">
              <p className="text-lg mb-2">✅ Successfully Joined!</p>
              <div className="bg-green-900/20 border border-green-500/30 rounded p-4 mb-4">
                <p className="text-2xl font-bold text-white">{Math.floor(size/2)}</p>
                <p className="text-sm">Player{size !== 1 ? 's' : ''} in room</p>
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Proceed to Player Auction →
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Tip: Keep this window open until auction completion
            </p>
          </div>
        ) : (
          <div className="text-yellow-400">
            <div className="animate-pulse">⏳</div>
            <p>Finalizing room setup...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionRoom;