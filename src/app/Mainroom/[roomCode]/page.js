"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import initialTeams from "../initialTeams";
import Rulesandretention from "./rulesandretention";
import Playerinfo from "./playerinfo";
import TimerandStatus from "./timerandstatus";
import CurrentBid from "./currentbid";

export default function AuctionPage() {
  const params = useParams();
  const fullParam = params.roomCode || "00000RCB";
  const roomId = fullParam.slice(0, 5);
  const teamName = fullParam.slice(5);
  
  // State management
  const [Budget, setBudget] = useState(0);
  const [teamBudgets, setTeamBudgets] = useState({});
  const [currentBid, setCurrentBid] = useState(0);
  const [timer, setTimer] = useState(45);
  const [sold, setSold] = useState(false);
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [highestBidder, setHighestBidder] = useState(null);
  const [winningTeam, setWinningTeam] = useState(null);
  const [finalBid, setFinalBid] = useState(0);
  const roles = ["Batter", "Bowler", "All-Rounder", "Wicketkeeper-Batter"];
  const [currentSet, setCurrentSet] = useState(roles[0]);
  const [nextSet, setNextSet] = useState(roles[1]);
  const [playerInSetIndex, setPlayerInSetIndex] = useState(0);
  const [inBreak, setInBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState({
    "Player Name": "Loading...",
    "Role": "",
    "Nationality": "",
    "Base Price (Rs Lakh)": 0,
    "Previous Team (2024)": "",
    "Matches in IPL": 0,
    "Runs": 0,
    "Batting Avg": 0,
    "Strike Rate": 0
  });

  // WebSocket connection
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roomSize, setRoomSize] = useState(0);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;

  // Initialize budget
  useEffect(() => {
    const team = initialTeams.find(t => t.code === teamName);
    if (team) setBudget(team.initialBudget);
  }, [teamName]);

  // Helper to calculate next bid
  const calculateNextBid = () => {
    if (currentBid === 0) {
      return currentPlayer["Base Price (Rs Lakh)"] / 100;
    }
    return Math.round((currentBid + 0.5) * 10) / 10;
  };

  // WebSocket connection handler
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket("ws://localhost:8080");
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setConnectionAttempts(0);
        setIsReconnecting(false);
        setSocket(ws);

        ws.send(JSON.stringify({
          type: "join",
          room: roomId,
          teamName: teamName
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log("Received message:", msg.type, msg);

          switch (msg.type) {
            case "joined":
              setRoomSize(msg.size);
              setSelectedTeams(msg.selectedTeams || []);
              setCurrentPlayer(msg.currentPlayer || currentPlayer);
              setCurrentBid(msg.currentBid || 0);
              setBiddingHistory(msg.biddingHistory || []);
              setTimer(msg.timer || 45);
              setTeamBudgets(msg.teamBudgets || {});
              setBudget(msg.myBudget || Budget);
              setPlayerInSetIndex(msg.playerInSetIndex || 0);
              setInBreak(msg.inBreak || false);
              setBreakTime(msg.setBreakTimer || 0);
              
              // Set current and next set
              if (msg.currentSetIndex !== undefined) {
                setCurrentSet(roles[msg.currentSetIndex]);
                setNextSet(roles[(msg.currentSetIndex + 1) % roles.length]);
              }
              break;

            case "member_joined":
            case "member_left":
              setRoomSize(msg.size);
              if (msg.selectedTeams) setSelectedTeams(msg.selectedTeams);
              break;

            case "new_bid_broadcast":
              setCurrentBid(msg.amount);
              setTimer(msg.timer);
              setBiddingHistory(msg.biddingHistory);
              setHighestBidder(msg.highestBidder);
              setSold(false);
              break;

            case "timer_update":
              setTimer(msg.timer);
              break;

            case "player_sold":
              setSold(true);
              setTimer(0);
              setWinningTeam(msg.winningTeam);
              setFinalBid(msg.finalBid);
              if (msg.updatedBudgets) {
                setTeamBudgets(msg.updatedBudgets);
                if (msg.updatedBudgets[teamName]) {
                  setBudget(msg.updatedBudgets[teamName]);
                }
              }
              break;

            case "next_player":
              setInBreak(false); // Exit break mode
              setCurrentPlayer(msg.player);
              setCurrentBid(msg.currentBid);
              setTimer(msg.timer);
              setBiddingHistory(msg.biddingHistory);
              setSold(false);
              setHighestBidder(null);
              setWinningTeam(null);
              setFinalBid(0);
              setPlayerInSetIndex(msg.playerInSetIndex || 0);
              
              // Set current and next set
              if (msg.setInfo?.index !== undefined) {
                setCurrentSet(roles[msg.setInfo.index]);
                setNextSet(roles[(msg.setInfo.index + 1) % roles.length]);
              }
              break;

            case "set_break_start":
              setInBreak(true);
              setBreakTime(msg.breakTime);
              setCurrentSet(msg.completedSet);
              setNextSet(msg.nextSet);
              setPlayerInSetIndex(0);
              break;

            case "set_break_update":
              setBreakTime(msg.breakTime);
              break;

            case "error":
              console.error("WebSocket error:", msg.message);
              break;

            default:
              console.log("Unknown message type:", msg.type);
          }
        } catch (parseError) {
          console.error("Error parsing message:", parseError);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setConnected(false);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnected(false);
        setSocket(null);

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
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, [roomId, teamName]);

  // Handle placing a bid
  const handleBid = () => {
    if (sold || !socket || socket.readyState !== WebSocket.OPEN || !connected) {
      console.log("Cannot bid - conditions not met");
      return;
    }

    const nextBid = calculateNextBid();

    if (nextBid > Budget) {
      alert(`Insufficient budget! You have ₹${Budget.toFixed(1)} Cr remaining.`);
      return;
    }

    socket.send(JSON.stringify({
      type: "new_bid",
      team: teamName,
      amount: nextBid,
      room: roomId,
    }));
  };

  // Connection status UI
  const getConnectionStatus = () => {
    if (connected) return { text: `✅ Online (${roomSize} teams)`, color: 'text-green-400' };
    if (isReconnecting) return { text: '🔄 Reconnecting...', color: 'text-yellow-400' };
    return { text: '❌ Offline', color: 'text-red-400' };
  };

  const connectionStatus = getConnectionStatus();
  const [showRules, setShowRules] = useState(true);
  const [countdown, setCountdown] = useState(15);

  // Initial countdown timer for rules
  useEffect(() => {
    if (!showRules) return;
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowRules(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showRules]);

  // Calculate next bid for UI
  const nextBid = calculateNextBid();
  const basePrice = currentPlayer["Base Price (Rs Lakh)"] ? 
                   (currentPlayer["Base Price (Rs Lakh)"] / 100).toFixed(1) : 
                   "0.0";

  return (
    showRules ? (
      <div className="relative">
        <Rulesandretention />
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <span className="text-xs font-medium text-white/90">
              Auction Starts in:
            </span>
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full shadow-md">
              <span className="text-xs font-bold text-white">{countdown}</span>
            </div>
          </div>
        </div>
      </div>
    ) : inBreak ? (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-orange-500/50 p-8 max-w-2xl w-full text-center">
          <h1 className="text-5xl font-bold text-orange-400 mb-6">SET BREAK</h1>
          
          <div className="mb-8">
            <h2 className="text-2xl text-white mb-2">
              Completed: <span className="text-orange-400">{currentSet}</span>
            </h2>
            <h2 className="text-2xl text-white mb-2">
              Next Set: <span className="text-green-400">{nextSet}</span>
            </h2>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-4 border-orange-500 flex items-center justify-center">
                <span className="text-6xl font-bold text-white">{breakTime}</span>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 animate-spin"></div>
            </div>
          </div>
          
          <p className="text-gray-300 text-lg">Preparing next set of players...</p>
        </div>
      </div>
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              IPL MEGA AUCTION 2025
            </h1>
            <p className="text-gray-300 text-sm mt-1">Live Bidding Session</p>
            <p className="text-orange-400 text-sm mt-1">
              Current Set: {currentSet} • Player {playerInSetIndex + 1}/20
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
              <div className="text-orange-400 font-semibold text-lg">Your Team: {teamName}</div>
              <div className="text-white">Budget: ₹{Budget.toFixed(1)} Cr</div>
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

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
              <Playerinfo
                name={currentPlayer["Player Name"]}
                prev={currentPlayer["Previous Team (2024)"]}
                role={currentPlayer["Role"]}
                nationality={currentPlayer["Nationality"]}
              />

              <div className="p-4 md:p-6 bg-white/5 border-b border-white/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="text-center p-2 md:p-3 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {currentPlayer["Matches in IPL"] || '0'}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400">Matches</p>
                  </div>

                  {currentPlayer["Role"]?.includes("Bowler") ? (
                    <>
                      <div className="text-center p-2 md:p-3 bg-white/10 rounded-lg border border-white/20">
                        <p className="text-xl md:text-2xl font-bold text-white">
                          {currentPlayer["Wickets"] || 'N/A'}
                        </p>
                        <p className="text-xs md:text-sm text-gray-400">Wickets</p>
                      </div>
                      <div className="text-center p-2 md:p-3 bg-white/10 rounded-lg border border-white/20">
                        <p className="text-xl md:text-2xl font-bold text-white">
                          {currentPlayer["Bowling Avg"] || 'N/A'}
                        </p>
                        <p className="text-xs md:text-sm text-gray-400">Avg</p>
                      </div>
                    </>
                  ) : null}

                  {currentPlayer["Role"] === "All-Rounder" ? (
                    <>
                      <div className="text-center p-2 md:p-3 bg-white/10 rounded-lg border border-white/20">
                        <p className="text-xl md:text-2xl font-bold text-white">
                          {currentPlayer["Runs"] || 'N/A'}
                        </p>
                        <p className="text-xs md:text-sm text-gray-400">Runs</p>
                      </div>
                      <div className="text-center p-2 md:p-3 bg-white/10 rounded-lg border border-white/20">
                        <p className="text-xl md:text-2xl font-bold text-white">
                          {currentPlayer["Wickets"] || 'N/A'}
                        </p>
                        <p className="text-xs md:text-sm text-gray-400">Wickets</p>
                      </div>
                    </>
                  ) : null}

                  {currentPlayer["Role"]?.includes("Batter") || 
                   currentPlayer["Role"]?.includes("Wicketkeeper") ? (
                    <>
                      <div className="text-center p-2 md:p-3 bg-white/10 rounded-lg border border-white/20">
                        <p className="text-xl md:text-2xl font-bold text-white">
                          {currentPlayer["Runs"] || 'N/A'}
                        </p>
                        <p className="text-xs md:text-sm text-gray-400">Runs</p>
                      </div>
                      <div className="text-center p-2 md:p-3 bg-white/10 rounded-lg border border-white/20">
                        <p className="text-xl md:text-2xl font-bold text-white">
                          {currentPlayer["Batting Avg"] || 'N/A'}
                        </p>
                        <p className="text-xs md:text-sm text-gray-400">Avg</p>
                      </div>
                    </>
                  ) : null}

                  <div className="text-center p-2 md:p-3 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {currentPlayer["Strike Rate"] || 'N/A'}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400">SR</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="lg:col-span-2">
                    <CurrentBid
                      current={currentBid.toFixed(1)}
                      highestBidder={highestBidder}
                      base={basePrice}
                    />

                    <TimerandStatus timer={timer} />

                    {sold ? (
                      <div className="text-center mb-4 md:mb-6">
                        <div className="bg-gradient-to-r from-green-600 to-green-500 inline-block px-6 py-2 md:px-8 md:py-3 rounded-full text-white font-bold text-lg md:text-xl shadow-lg">
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
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-center mb-4 md:mb-6">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 inline-block px-6 py-2 md:px-8 md:py-3 rounded-full text-white font-bold text-lg md:text-xl shadow-lg animate-pulse">
                          🔥 BIDDING LIVE
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1">
                    {!sold && (
                      <div className="space-y-3 md:space-y-4 p-4 md:p-6 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-lg border-2 border-orange-500/50">
                        <div className="flex items-center space-x-2 mb-3 md:mb-4">
                          <span className="text-xl md:text-2xl">🔨</span>
                          <span className="text-white font-semibold md:text-lg">Place Your Bid</span>
                        </div>
                        <div className="text-center">
                          <div className="mb-3 md:mb-4">
                            <p className="text-gray-300 text-sm">Next bid amount:</p>
                            <p className="text-2xl md:text-3xl font-bold text-white">₹{nextBid.toFixed(1)} Cr</p>
                          </div>
                          <button
                            onClick={handleBid}
                            disabled={!connected || sold || nextBid > Budget || highestBidder === teamName}
                            className={`w-full py-2 md:py-3 px-4 md:px-6 rounded-lg font-bold text-base md:text-lg transition-all duration-200 ${
                              !connected || sold || nextBid > Budget || highestBidder === teamName
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:scale-105 shadow-lg'
                            }`}
                          >
                            {!connected ? '🔌 Connecting...' :
                              sold ? '🚫 Sold' :
                                highestBidder === teamName ? '🏆 Your Highest Bid' :
                                  nextBid > Budget ? '💸 Insufficient Budget' :
                                    currentBid === 0 ? `⚡ START BIDDING (₹${basePrice} Cr)` :
                                      '⚡ BID ₹' + nextBid.toFixed(1) + ' Cr'}
                          </button>
                          <p className="text-xs text-gray-400 mt-2">
                            Budget remaining: ₹{Budget.toFixed(1)} Cr
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[350px] space-y-4 md:space-y-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 md:p-6 shadow-xl">
              <div className="flex items-center space-x-2 mb-3 md:mb-4">
                <span className="text-green-400 text-lg md:text-xl">📈</span>
                <h3 className="text-white font-semibold md:text-lg">Live Bidding</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {biddingHistory.length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-4">
                    <p>No bids yet.</p>
                    <p className="text-xs mt-2">Bidding starts at ₹{basePrice} Cr</p>
                  </div>
                ) : (
                  biddingHistory.map((bid, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 md:p-3 rounded-lg border ${
                      index === 0 ? 'bg-green-600/20 border-green-400/50' : 'bg-white/5 border-white/10'
                    }`}>
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                          index === 0 ? 'bg-green-400' : 'bg-white/50'
                        }`}></div>
                        <span className={`text-sm md:text-base font-medium ${
                          bid.team === teamName ? 'text-orange-400' : 'text-white'
                        }`}>
                          {bid.team}
                        </span>
                        {bid.team === teamName && (
                          <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
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

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 md:p-6 shadow-xl">
              <div className="flex items-center space-x-2 mb-3 md:mb-4">
                <span className="text-blue-400 text-lg md:text-xl">👥</span>
                <h3 className="text-white font-semibold md:text-lg">Connected Teams ({roomSize})</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedTeams.map((team, index) => (
                  <div key={index} className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/10">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r ${team.color}`}></div>
                      <div>
                        <span className={`text-sm font-medium ${
                          team.code === teamName ? 'text-orange-400' : 'text-white'
                        }`}>
                          {team.code}
                        </span>
                        <p className="text-xs text-gray-400">{team.name}</p>
                      </div>
                      {team.code === teamName && (
                        <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">
                        ₹{(teamBudgets[team.code] || 0).toFixed(1)} Cr
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}