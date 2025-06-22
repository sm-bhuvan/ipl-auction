"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import initialTeams from "../initialTeams";

export default function AuctionPage() {
  const params = useParams();
  const fullParam = params.roomCode || "00000RCB";

  const roomId = fullParam.slice(0, 5);
  const teamName = fullParam.slice(5);
  const [Budget, setBudget] = useState(0);

  // FIX: Move the team finding logic inside useEffect to avoid state updates during render
  useEffect(() => {
    const team = initialTeams.find(t => t.code === teamName);
    if (team) {
      setBudget(team.initalBudget);
    }
  }, [teamName]); // Run when teamName changes

  const [currentBid, setCurrentBid] = useState(2.0);
  const [timer, setTimer] = useState(45);
  const [sold, setSold] = useState(false);
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState({
    name: "Jos Buttler",
    role: "Wicket-Keeper Batsman",
    country: "England",
    basePrice: 2.0,
    previousTeam: "RR",
    stats: {
      matches: 65,
      runs: 2582,
      average: 41.64,
      strikeRate: 149.05
    }
  });
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roomSize, setRoomSize] = useState(0);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      console.log(`Attempting WebSocket connection (attempt ${connectionAttempts + 1})`);
      const ws = new WebSocket("ws://localhost:8080");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        setConnected(true);
        setConnectionAttempts(0);
        setIsReconnecting(false);
        setSocket(ws);
        
        // Join the room with team name
        ws.send(JSON.stringify({ 
          type: "join", 
          room: roomId,
          teamName: teamName
        }));
        
        // Get teams data
        ws.send(JSON.stringify({ 
          type: "get_teams", 
          room: roomId 
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log("📨 Received message:", msg.type, msg);
          
          switch (msg.type) {
            case "connected":
              console.log("Server connection confirmed");
              break;
              
            case "joined":
              setRoomSize(msg.size || 0);
              setSelectedTeams(msg.selectedTeams || []);
              if (msg.currentPlayer) setCurrentPlayer(msg.currentPlayer);
              if (typeof msg.currentBid === 'number') setCurrentBid(msg.currentBid);
              if (Array.isArray(msg.biddingHistory)) setBiddingHistory(msg.biddingHistory);
              if (typeof msg.timer === 'number') setTimer(msg.timer);
              break;
              
            case "teams_list":
              setSelectedTeams(msg.selectedTeams || []);
              if (msg.currentPlayer) setCurrentPlayer(msg.currentPlayer);
              if (typeof msg.currentBid === 'number') setCurrentBid(msg.currentBid);
              if (Array.isArray(msg.biddingHistory)) setBiddingHistory(msg.biddingHistory);
              if (typeof msg.timer === 'number') setTimer(msg.timer);
              break;
              
            case "team_selected":
              setSelectedTeams(msg.selectedTeams || []);
              break;
              
            case "new_bid_broadcast":
              if (typeof msg.amount === 'number') setCurrentBid(msg.amount);
              if (typeof msg.timer === 'number') setTimer(msg.timer);
              if (Array.isArray(msg.biddingHistory)) setBiddingHistory(msg.biddingHistory);
              setSold(false);
              break;
              
            case "timer_update":
              if (typeof msg.timer === 'number') setTimer(msg.timer);
              break;
              
            case "player_sold":
              setSold(true);
              setTimer(0);
              break;
              
            case "member_joined":
            case "member_left":
              if (typeof msg.size === 'number') setRoomSize(msg.size);
              break;
              
            case "error":
              console.error("❌ WebSocket error:", msg.message);
              break;
              
            default:
              console.log("Unknown message type:", msg.type);
          }
        } catch (parseError) {
          console.error("Error parsing message:", parseError);
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        setConnected(false);
      };
      
      ws.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        setConnected(false);
        setSocket(null);
        
        // Attempt reconnection if not intentional close
        if (event.code !== 1000 && connectionAttempts < maxReconnectAttempts) {
          setIsReconnecting(true);
          setConnectionAttempts(prev => prev + 1);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, Math.min(1000 * Math.pow(2, connectionAttempts), 10000)); // Exponential backoff
        }
      };

    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setConnected(false);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "leave" }));
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, [roomId, teamName]);

  const handleBid = () => {
    if (sold || !socket || socket.readyState !== WebSocket.OPEN || !connected) {
      console.log("❌ Cannot bid - conditions not met:", {
        sold,
        socketExists: !!socket,
        socketState: socket?.readyState,
        connected
      });
      return;
    }
    
    const nextBid = Math.round((currentBid + 0.5) * 10) / 10; // Round to 1 decimal
    console.log("💰 Placing bid:", { team: teamName, amount: nextBid, room: roomId });
    
    try {
      socket.send(JSON.stringify({
        type: "new_bid",
        team: teamName,
        amount: nextBid,
        room: roomId,
      }));
    } catch (error) {
      console.error("Error sending bid:", error);
    }
  };

  const getConnectionStatus = () => {
    if (connected) return { text: `✅ Online (${roomSize})`, color: 'text-green-400' };
    if (isReconnecting) return { text: '🔄 Reconnecting...', color: 'text-yellow-400' };
    return { text: '❌ Offline', color: 'text-red-400' };
  };

  const formatTime = (seconds) => {
    return Math.max(0, seconds).toString().padStart(2, '0');
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            IPL MEGA AUCTION 2025
          </h1>
          <p className="text-gray-300 text-sm mt-1">Live Bidding Session</p>
        </div>
        <div className="text-right">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
            <div className="text-orange-400 font-semibold text-lg">Your Team: {teamName}</div>
            <div className="text-white">Budget: ₹{Budget} Cr</div>
            <div className="text-gray-400 text-sm">
              Room ID: <span className="font-semibold text-white">#{roomId}</span>
            </div>
            <div className="text-gray-400 text-sm">
              Connected: <span className={`font-semibold ${connectionStatus.color}`}>
                {connectionStatus.text}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
                {currentPlayer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">{currentPlayer.name}</h2>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentPlayer.previousTeam}
                </span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                  {currentPlayer.role}
                </span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                  {currentPlayer.country}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-yellow-400">⭐</span>
                <p className="text-yellow-400 font-semibold">Explosive Opener</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-300 mb-2">Current Highest Bid</p>
              <p className="text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                ₹{currentBid.toFixed(1)} Cr
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Base Price: ₹{currentPlayer.basePrice.toFixed(1)} Cr
              </p>
            </div>

            <div className="text-center mb-6">
              <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full border-2 ${
                timer <= 10 ? 'border-red-500 bg-red-600/20' : 'border-orange-500 bg-orange-600/20'
              }`}>
                <span className="text-2xl">⏱</span>
                <span className={`text-3xl font-bold ${timer <= 10 ? 'text-red-400' : 'text-orange-400'}`}>
                  {formatTime(timer)}s
                </span>
              </div>
            </div>

            {sold && (
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-red-600 to-red-500 inline-block px-8 py-3 rounded-full text-white font-bold text-xl shadow-lg">
                  👑 SOLD!
                </div>
                {biddingHistory.length > 0 && (
                  <p className="text-gray-300 mt-2">
                    Won by <span className="font-bold text-white">{biddingHistory[0].team}</span>
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">{currentPlayer.stats.matches}</p>
                <p className="text-sm text-gray-400">Matches</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">{currentPlayer.stats.runs}</p>
                <p className="text-sm text-gray-400">Runs</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">{currentPlayer.stats.average}</p>
                <p className="text-sm text-gray-400">Average</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">{currentPlayer.stats.strikeRate}</p>
                <p className="text-sm text-gray-400">Strike Rate</p>
              </div>
            </div>

            {!sold && (
              <div className="space-y-4 p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">🔨</span>
                  <span className="text-white font-semibold text-lg">Place Your Bid</span>
                </div>
                <div className="text-center">
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm">Next bid amount:</p>
                    <p className="text-2xl font-bold text-white">₹{(currentBid + 0.5).toFixed(1)} Cr</p>
                  </div>
                  <button
                    onClick={handleBid}
                    disabled={!connected || sold}
                    className={`font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg text-lg ${
                      connected && !sold
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {!connected ? (isReconnecting ? '🔄 Reconnecting...' : '🔌 Connecting...') : sold ? '🚫 Sold' : '⚡ BID NOW'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-[350px] space-y-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-green-400 text-xl">📈</span>
              <h3 className="text-white font-semibold text-lg">Live Bidding</h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {biddingHistory.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-4">
                  <p>No bids yet.</p>
                  <p className="text-xs mt-2">Bidding starts at ₹{currentPlayer.basePrice.toFixed(1)} Cr</p>
                </div>
              ) : (
                biddingHistory.map((bid, index) => (
                  <div key={`${bid.timestamp || index}`} className={`flex items-center justify-between p-3 rounded-lg border ${
                    index === 0 ? 'bg-green-600/20 border-green-400/50' : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-green-400' : 'bg-white/50'
                      }`}></div>
                      <span className={`font-medium ${
                        bid.team === teamName ? 'text-orange-400' : 'text-white'
                      }`}>
                        {bid.team}
                      </span>
                      {bid.team === teamName && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        index === 0 ? 'text-green-400' : 'text-white'
                      }`}>
                        ₹{bid.amount.toFixed(1)} Cr
                      </div>
                      <div className="text-xs text-gray-400">{bid.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-blue-400 text-xl">👥</span>
              <h3 className="text-white font-semibold text-lg">Connected Teams ({roomSize})</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedTeams.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-2">
                  No teams connected yet.
                </div>
              ) : (
                selectedTeams.map((team, index) => (
                  <div key={`${team.code}-${team.selectedAt || index}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${team.color || 'from-gray-500 to-gray-700'}`}></div>
                      <div>
                        <span className={`text-sm font-medium ${team.code === teamName ? 'text-orange-400' : 'text-white'}`}>
                          {team.code}
                        </span>
                        <p className="text-xs text-gray-400">{team.name}</p>
                      </div>
                      {team.code === teamName && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-gray-300 text-xs">
                        {team.selectedAt ? new Date(team.selectedAt).toLocaleTimeString() : 'Connected'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}