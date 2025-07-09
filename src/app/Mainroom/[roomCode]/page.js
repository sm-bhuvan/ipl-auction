"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import initialTeams from "../initialTeams";
import Rulesandretention from "./rulesandretention";

export default function AuctionPage() {
  const params = useParams();
  const fullParam = params.roomCode || "00000RCB";

  const roomId = fullParam.slice(0, 5);
  const teamName = fullParam.slice(5);
  const [Budget, setBudget] = useState(0);
  const [teamBudgets, setTeamBudgets] = useState({});

  useEffect(() => {
    const team = initialTeams.find(t => t.code === teamName);
    if (team) {
      setBudget(team.initalBudget);
    }
  }, [teamName]);

  const [currentBid, setCurrentBid] = useState(2.0);
  const [timer, setTimer] = useState(45);
  const [sold, setSold] = useState(false);
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [highestBidder, setHighestBidder] = useState(null);
  const [winningTeam, setWinningTeam] = useState(null);
  const [finalBid, setFinalBid] = useState(0);

  // Default player (will be updated from server)
  const [currentPlayer, setCurrentPlayer] = useState({
    name: "Jos Buttler",
    role: "Wicket-Keeper Batsman",
    country: "England",
    basePrice: 2.0,
    previousTeam: "RR",
    stats: {
      matches: 97,
      runs: 3223,
      average: 37.5,
      strikeRate: 147.3
    }
  });

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roomSize, setRoomSize] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
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
              setTotalParticipants(msg.totalParticipants || 0);
              setSelectedTeams(msg.selectedTeams || []);
              if (msg.currentPlayer) setCurrentPlayer(msg.currentPlayer);
              if (typeof msg.currentBid === 'number') setCurrentBid(msg.currentBid);
              if (Array.isArray(msg.biddingHistory)) setBiddingHistory(msg.biddingHistory);
              if (typeof msg.timer === 'number') setTimer(msg.timer);
              if (msg.teamBudgets) setTeamBudgets(msg.teamBudgets);
              if (typeof msg.myBudget === 'number') setBudget(msg.myBudget);
              break;

            case "member_joined":
            case "member_left":
              if (typeof msg.size === 'number') setRoomSize(msg.size);
              if (typeof msg.totalParticipants === 'number') setTotalParticipants(msg.totalParticipants);
              if (msg.selectedTeams) setSelectedTeams(msg.selectedTeams);
              break;

            case "new_bid_broadcast":
              if (typeof msg.amount === 'number') setCurrentBid(msg.amount);
              if (typeof msg.timer === 'number') setTimer(msg.timer);
              if (Array.isArray(msg.biddingHistory)) setBiddingHistory(msg.biddingHistory);
              if (msg.highestBidder) setHighestBidder(msg.highestBidder);
              setSold(false);
              setWinningTeam(null);
              setFinalBid(0);
              break;

            case "timer_update":
              if (typeof msg.timer === 'number') setTimer(msg.timer);
              break;

            case "player_sold":
              setSold(true);
              setTimer(0);
              setWinningTeam(msg.winningTeam);
              setFinalBid(msg.finalBid);
              if (msg.updatedBudgets) {
                setTeamBudgets(msg.updatedBudgets);
                // Update current team's budget
                if (msg.updatedBudgets[teamName]) {
                  setBudget(msg.updatedBudgets[teamName]);
                }
              }
              break;

            case "next_player":
              if (msg.player) setCurrentPlayer(msg.player);
              if (typeof msg.currentBid === 'number') setCurrentBid(msg.currentBid);
              if (typeof msg.timer === 'number') setTimer(msg.timer);
              if (Array.isArray(msg.biddingHistory)) setBiddingHistory(msg.biddingHistory);
              setSold(false);
              setHighestBidder(null);
              setWinningTeam(null);
              setFinalBid(0);
              break;

            case "room_status":
              if (msg.currentPlayer) setCurrentPlayer(msg.currentPlayer);
              if (typeof msg.currentBid === 'number') setCurrentBid(msg.currentBid);
              if (Array.isArray(msg.biddingHistory)) setBiddingHistory(msg.biddingHistory);
              if (typeof msg.timer === 'number') setTimer(msg.timer);
              if (msg.teamBudgets) setTeamBudgets(msg.teamBudgets);
              if (msg.selectedTeams) setSelectedTeams(msg.selectedTeams);
              if (typeof msg.sold === 'boolean') setSold(msg.sold);
              break;

            case "error":
              console.error("❌ WebSocket error:", msg.message);
              // Show error to user (you can add a toast notification here)
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
          }, Math.min(1000 * Math.pow(2, connectionAttempts), 10000));
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

    const nextBid = Math.round((currentBid + 0.5) * 10) / 10;

    // Client-side budget validation
    if (nextBid > Budget) {
      console.log("❌ Insufficient budget");
      alert(`Insufficient budget! You have ₹${Budget} Cr remaining.`);
      return;
    }

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
    if (connected) return { text: `✅ Online (${totalParticipants} teams)`, color: 'text-green-400' };
    if (isReconnecting) return { text: '🔄 Reconnecting...', color: 'text-yellow-400' };
    return { text: '❌ Offline', color: 'text-red-400' };
  };

  const formatTime = (seconds) => {
    return Math.max(0, seconds).toString().padStart(2, '0');
  };

  const connectionStatus = getConnectionStatus();
  const [main, setmain] = useState(false);
  const [countdown, setcountdown] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setcountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setmain(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Remove the auto-progression logic since server handles it
  // The useEffect that was moving to next player has been removed

  return (
    (!main) ?
      <div className="relative">
        <Rulesandretention />
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <span className="text-xs font-medium text-white/90">
              Auction Starts in:
            </span>
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full shadow-md">
              <span className="text-xs font-bold text-white">
                {countdown}
              </span>
            </div>
          </div>
        </div>
      </div> :
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
          {/* Main Auction Area */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">

              {/* Player Info Section */}
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0">
                    {currentPlayer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">{currentPlayer.name}</h2>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentPlayer.previousTeam}
                      </span>
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                        {currentPlayer.role}
                      </span>
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                        {currentPlayer.country}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-yellow-400 font-semibold text-sm">Star Player</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="p-6 bg-white/5 border-b border-white/20">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="text-blue-400">📊</span>
                  Career Statistics
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-2xl font-bold text-white">{currentPlayer.stats.matches}</p>
                    <p className="text-sm text-gray-400">Matches</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-2xl font-bold text-white">
                      {currentPlayer.stats.runs || currentPlayer.stats.wickets || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentPlayer.stats.runs ? 'Runs' : 'Wickets'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-2xl font-bold text-white">{currentPlayer.stats.average}</p>
                    <p className="text-sm text-gray-400">Average</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-2xl font-bold text-white">
                      {currentPlayer.stats.strikeRate || currentPlayer.stats.economy || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentPlayer.stats.strikeRate ? 'Strike Rate' : 'Economy'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bidding Section */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Current Bid Display */}
                  <div className="lg:col-span-2">
                    <div className="text-center mb-4">
                      <p className="text-gray-300 mb-2">Current Highest Bid</p>
                      <p className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        ₹{currentBid.toFixed(1)} Cr
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Base Price: ₹{currentPlayer.basePrice.toFixed(1)} Cr
                      </p>
                      {highestBidder && (
                        <p className="text-yellow-400 text-sm mt-1">
                          Leading: {highestBidder}
                        </p>
                      )}
                    </div>

                    {/* Timer and Status */}
                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full border-2 ${timer <= 10 ? 'border-red-500 bg-red-600/20' : 'border-orange-500 bg-orange-600/20'
                        }`}>
                        <span className="text-2xl">⏱</span>
                        <span className={`text-3xl font-bold ${timer <= 10 ? 'text-red-400' : 'text-orange-400'}`}>
                          {formatTime(timer)}s
                        </span>
                      </div>
                    </div>

                    {/* Sold/Unsold Status */}
                    {sold ? (
                      <div className="text-center mb-6">
                        <div className="bg-gradient-to-r from-green-600 to-green-500 inline-block px-8 py-3 rounded-full text-white font-bold text-xl shadow-lg">
                          👑 SOLD!
                        </div>
                        {winningTeam ? (
                          <div className="mt-2">
                            <p className="text-gray-300">
                              Won by <span className="font-bold text-white">{winningTeam}</span>
                            </p>
                            <p className="text-green-400 font-semibold">
                              Final Price: ₹{finalBid.toFixed(1)} Cr
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-300 mt-2">Unsold</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center mb-6">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 inline-block px-8 py-3 rounded-full text-white font-bold text-xl shadow-lg animate-pulse">
                          🔥 BIDDING LIVE
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bidding Controls */}
                  <div className="lg:col-span-1">
                    {!sold && (
                      <div className="space-y-4 p-6 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-lg border-2 border-orange-500/50">
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-2xl">🔨</span>
                          <span className="text-white font-semibold text-lg">Place Your Bid</span>
                        </div>
                        <div className="text-center">
                          <div className="mb-4">
                            <p className="text-gray-300 text-sm">Next bid amount:</p>
                            <p className="text-3xl font-bold text-white">₹{(currentBid + 0.5).toFixed(1)} Cr</p>
                          </div>
                          <button
                            onClick={handleBid}
                            disabled={!connected || sold || (currentBid + 0.5) > Budget || highestBidder === teamName}
                            className={`w-full font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg text-lg ${connected && !sold && (currentBid + 0.5) <= Budget && highestBidder !== teamName
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white hover:shadow-xl'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            {!connected ? '🔌 Connecting...' :
                              sold ? '🚫 Sold' :
                                highestBidder === teamName ? '🏆 Your Highest Bid' :
                                  (currentBid + 0.5) > Budget ? '💸 Insufficient Budget' :
                                    '⚡ BID NOW'}
                          </button>
                          <p className="text-xs text-gray-400 mt-2">
                            Budget remaining: ₹{Budget} Cr
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
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
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${index === 0 ? 'bg-green-600/20 border-green-400/50' : 'bg-white/5 border-white/10'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-400' : 'bg-white/50'
                          }`}></div>
                        <span className={`font-medium ${bid.team === teamName ? 'text-orange-400' : 'text-white'
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
                        <div className={`font-bold ${index === 0 ? 'text-green-400' : 'text-white'
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
                <h3 className="text-white font-semibold text-lg">Connected Teams ({totalParticipants})</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedTeams.map((team, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${team.color}`}></div>
                      <div>
                        <span className={`text-sm font-medium ${team.code === teamName ? 'text-orange-400' : 'text-white'
                          }`}>
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
                      <div className="text-xs text-gray-400">
                        ₹{teamBudgets[team.code] || 0} Cr
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}