const { WebSocketServer, WebSocket } = require("ws");
const wss = new WebSocketServer({ port: 8080 });
const rooms = {};
const roomData = {};

// Initial teams available for each room
const initialTeams = [
  { name: "Mumbai Indians", code: "MI", color: "from-blue-600 to-blue-800", logo: "🏏", initialBudget: 45 },
  { name: "Chennai Super Kings", code: "CSK", color: "from-yellow-500 to-yellow-600", logo: "🦁", initialBudget: 55 },
  { name: "Royal Challengers Bangalore", code: "RCB", color: "from-red-600 to-red-800", logo: "👑", initialBudget: 83 },
  { name: "Kolkata Knight Riders", code: "KKR", color: "from-purple-600 to-purple-800", logo: "⚔️", initialBudget: 83 },
  { name: "Delhi Capitals", code: "DC", color: "from-blue-500 to-red-500", logo: "🏛️", initialBudget: 55 },
  { name: "Punjab Kings", code: "PBKS", color: "from-red-500 to-yellow-500", logo: "👑", initialBudget: 55 },
  { name: "Rajasthan Royals", code: "RR", color: "from-pink-500 to-blue-500", logo: "👑", initialBudget: 83 },
  { name: "Sunrisers Hyderabad", code: "SRH", color: "from-orange-500 to-red-600", logo: "☀️", initialBudget: 83 },
  { name: "Gujarat Titans", code: "GT", color: "from-slate-800 to-yellow-400", logo: "⛰️", initialBudget: 55 },
  { name: "Lucknow Super Giants", code: "LSG", color: "from-blue-400 to-orange-300", logo: "🦅", initialBudget: 55 }
];

// Full set of players for auction
const players = [
  {
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
  },
  {
    name: "Shreyas Iyer",
    role: "Top-Order Batsman",
    country: "India",
    basePrice: 2.0,
    previousTeam: "KKR",
    stats: {
      matches: 101,
      runs: 2776,
      average: 31.9,
      strikeRate: 125.6
    }
  },
  {
    name: "Rishabh Pant",
    role: "Wicket-Keeper Batsman",
    country: "India",
    basePrice: 2.0,
    previousTeam: "DC",
    stats: {
      matches: 101,
      runs: 2871,
      average: 34.0,
      strikeRate: 148.4
    }
  },
  {
    name: "Kagiso Rabada",
    role: "Fast Bowler",
    country: "South Africa",
    basePrice: 2.0,
    previousTeam: "PBKS",
    stats: {
      matches: 69,
      wickets: 106,
      average: 21.1,
      economy: 8.47,
      strikeRate: 14.9
    }
  },
  {
    name: "Arshdeep Singh",
    role: "Left-arm Fast Bowler",
    country: "India",
    basePrice: 2.0,
    previousTeam: "PBKS",
    stats: {
      matches: 62,
      wickets: 71,
      average: 26.2,
      economy: 8.78,
      strikeRate: 17.9
    }
  },
  {
    name: "Mitchell Starc",
    role: "Left-arm Fast Bowler",
    country: "Australia",
    basePrice: 2.0,
    previousTeam: "KKR",
    stats: {
      matches: 39,
      wickets: 47,
      average: 24.0,
      economy: 9.36,
      strikeRate: 15.4
    }
  }
];

// Improved cleanup function
const cleanupRoom = (roomId) => {
  if (rooms[roomId] && rooms[roomId].length === 0) {
    delete rooms[roomId];
    delete roomData[roomId];
    console.log(`Room ${roomId} cleaned up`);
  }
};

// Enhanced client removal with error handling
const removeClientFromRoom = (ws) => {
  if (!ws.roomId || !rooms[ws.roomId]) return null;

  try {
    const oldSize = rooms[ws.roomId].length;
    rooms[ws.roomId] = rooms[ws.roomId].filter(client => client !== ws);
    const newSize = rooms[ws.roomId].length;
    
    // Only remove from selectedTeams if no other client with same team name exists
    if (roomData[ws.roomId] && ws.teamName) {
      const hasOtherClientWithSameTeam = rooms[ws.roomId].some(client => 
        client.teamName === ws.teamName && client.readyState === WebSocket.OPEN
      );
      
      if (!hasOtherClientWithSameTeam) {
        roomData[ws.roomId].selectedTeams = roomData[ws.roomId].selectedTeams.filter(
          team => team.code !== ws.teamName
        );
      }
    }
    
    if (newSize > 0) {
      broadcastToRoom(ws.roomId, { 
        type: "member_left", 
        room: ws.roomId, 
        size: newSize,
        selectedTeams: roomData[ws.roomId]?.selectedTeams || []
      });
    }
    
    cleanupRoom(ws.roomId);
    return ws.roomId;
  } catch (err) {
    console.error("Error removing client:", err);
    return null;
  }
};

// Enhanced broadcast with better error handling
const broadcastToRoom = (roomId, message, excludeWs = null) => {
  if (!rooms[roomId]) return;
  
  const activeClients = rooms[roomId].filter(client => 
    client.readyState === WebSocket.OPEN
  );
  
  activeClients.forEach((client) => {
    try {
      if (client !== excludeWs && client.roomId === roomId) {
        client.send(JSON.stringify(message));
      }
    } catch (err) {
      console.error("Broadcast error:", err);
    }
  });
};

// Validate bid amount
const validateBid = (roomId, teamCode, amount) => {
  const room = roomData[roomId];
  if (!room) return { valid: false, reason: "Room not found" };
  
  if (room.sold) return { valid: false, reason: "Player already sold" };
  
  if (amount <= room.currentBid) {
    return { valid: false, reason: "Bid must be higher than current bid" };
  }
  
  if (room.teamBudgets && room.teamBudgets[teamCode] < amount) {
    return { valid: false, reason: "Insufficient budget" };
  }
  
  return { valid: true };
};

// Handle player sold logic
const handlePlayerSold = (roomId) => {
  const room = roomData[roomId];
  if (!room || room.sold) return;
  
  room.sold = true;
  room.isActive = false;
  
  const winningTeam = room.highestBidder;
  const finalBid = room.currentBid;
  
  // Deduct budget if there's a winner
  if (winningTeam && room.teamBudgets) {
    room.teamBudgets[winningTeam] -= finalBid;
  }
  
  // Add to sold players
  if (!room.soldPlayers) room.soldPlayers = [];
  room.soldPlayers.push({
    player: room.currentPlayer,
    team: winningTeam,
    amount: finalBid,
    soldAt: new Date().toISOString()
  });
  
  broadcastToRoom(roomId, {
    type: "player_sold",
    room: roomId,
    player: room.currentPlayer,
    finalBid: finalBid,
    winningTeam: winningTeam,
    updatedBudgets: room.teamBudgets || {}
  });
  
  // Move to next player after delay
  setTimeout(() => {
    moveToNextPlayer(roomId);
  }, 3000);
};

// Move to next player
const moveToNextPlayer = (roomId) => {
  const room = roomData[roomId];
  if (!room) return;
  
  room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
  room.currentPlayer = room.players[room.currentPlayerIndex];
  room.currentBid = room.currentPlayer.basePrice;
  room.highestBidder = null;
  room.biddingHistory = [];
  room.timer = 45;
  room.sold = false;
  room.isActive = true;
  
  broadcastToRoom(roomId, {
    type: "next_player",
    room: roomId,
    player: room.currentPlayer,
    currentBid: room.currentPlayer.basePrice,
    timer: 45,
    biddingHistory: []
  });
};

wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.isAlive = true;
  
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received:", data.type);

      switch (data.type) {
        case "join":
          if (!data.room || typeof data.room !== 'string') {
            return ws.send(JSON.stringify({ 
              type: "error", 
              message: "Invalid room code" 
            }));
          }

          // Remove from previous room
          removeClientFromRoom(ws);

          // Initialize new room
          if (!rooms[data.room]) {
            rooms[data.room] = [];
            roomData[data.room] = {
              teams: [...initialTeams],
              selectedTeams: [],
              teamBudgets: {}, // Track individual team budgets
              soldPlayers: [], // Track sold players
              players: [...players],
              currentPlayerIndex: 0,
              currentPlayer: players[0],
              currentBid: players[0].basePrice,
              highestBidder: null,
              biddingHistory: [],
              timer: 45,
              isActive: true,
              sold: false
            };
            
            // Initialize team budgets
            initialTeams.forEach(team => {
              roomData[data.room].teamBudgets[team.code] = team.initialBudget;
            });
            
            console.log(`Created room ${data.room}`);
          }

          // Check if this WebSocket is already in the room
          const existingConnection = rooms[data.room].find(client => 
            client.teamName === data.teamName && client.readyState === WebSocket.OPEN
          );
          
          if (existingConnection) {
            // Remove the old connection
            rooms[data.room] = rooms[data.room].filter(client => client !== existingConnection);
            // Remove from selectedTeams
            roomData[data.room].selectedTeams = roomData[data.room].selectedTeams.filter(
              team => team.code !== data.teamName
            );
          }

          // Add to room
          rooms[data.room].push(ws);
          ws.roomId = data.room;
          ws.teamName = data.teamName || null;
          
          // Add team to selectedTeams when joining (only once per team)
          if (data.teamName) {
            const existingTeam = roomData[data.room].selectedTeams.find(t => t.code === data.teamName);
            if (!existingTeam) {
              const teamInfo = initialTeams.find(t => t.code === data.teamName) || {
                name: data.teamName,
                code: data.teamName,
                color: "from-gray-500 to-gray-700",
                logo: "🏏"
              };
              
              roomData[data.room].selectedTeams.push({
                ...teamInfo,
                selectedAt: new Date().toISOString(),
                selectedBy: data.teamName
              });
            }
          }
          
          const roomSize = rooms[data.room].length;
          
          ws.send(JSON.stringify({ 
            type: "joined", 
            room: data.room, 
            size: roomSize,
            teams: roomData[data.room].teams,
            selectedTeams: roomData[data.room].selectedTeams,
            currentPlayer: roomData[data.room].currentPlayer,
            currentBid: roomData[data.room].currentBid,
            biddingHistory: roomData[data.room].biddingHistory,
            timer: roomData[data.room].timer,
            teamBudgets: roomData[data.room].teamBudgets,
            myBudget: roomData[data.room].teamBudgets[data.teamName] || 0
          }));
          
          broadcastToRoom(data.room, {
            type: "member_joined", 
            room: data.room, 
            size: roomSize,
            selectedTeams: roomData[data.room].selectedTeams
          }, ws);
          
          console.log(`Client joined ${data.room} as ${data.teamName} (size: ${roomSize})`);
          break;

        case "select_team":
          if (!ws.roomId || !roomData[ws.roomId]) {
            return ws.send(JSON.stringify({ 
              type: "error", 
              message: "Join a room first" 
            }));
          }

          const { teamCode } = data;
          const teamIndex = roomData[ws.roomId].teams.findIndex(t => t.code === teamCode);
          if (teamIndex === -1) {
            return ws.send(JSON.stringify({ 
              type: "error", 
              message: "Team unavailable" 
            }));
          }

          const selectedTeam = roomData[ws.roomId].teams.splice(teamIndex, 1)[0];
          roomData[ws.roomId].selectedTeams.push({
            ...selectedTeam,
            selectedAt: new Date().toISOString(),
            selectedBy: ws.teamName || "Unknown"
          });

          broadcastToRoom(ws.roomId, {
            type: "team_selected",
            room: ws.roomId,
            team: selectedTeam,
            availableTeams: roomData[ws.roomId].teams,
            selectedTeams: roomData[ws.roomId].selectedTeams
          });

          ws.send(JSON.stringify({
            type: "team_selected_success",
            room: ws.roomId,
            team: selectedTeam
          }));
          break;

        case "get_teams":
          if (!data.room || !roomData[data.room]) {
            return ws.send(JSON.stringify({ 
              type: "error", 
              message: "Invalid room" 
            }));
          }
          
          ws.send(JSON.stringify({ 
            type: "teams_list", 
            room: data.room, 
            selectedTeams: roomData[data.room].selectedTeams,
            availableTeams: roomData[data.room].teams,
            currentPlayer: roomData[data.room].currentPlayer,
            currentBid: roomData[data.room].currentBid,
            biddingHistory: roomData[data.room].biddingHistory,
            timer: roomData[data.room].timer
          }));
          break;

        case "new_bid":
          if (!ws.roomId || !roomData[ws.roomId]) {
            return ws.send(JSON.stringify({ 
              type: "error", 
              message: "Join a room first" 
            }));
          }

          const { team, amount } = data;
          const room = roomData[ws.roomId];
          
          // Validate bid
          const validation = validateBid(ws.roomId, team, amount);
          if (!validation.valid) {
            return ws.send(JSON.stringify({ 
              type: "error", 
              message: validation.reason 
            }));
          }

          // Update room data
          room.currentBid = amount;
          room.highestBidder = team;
          room.timer = 25; // Reset timer
          room.isActive = true;
          room.sold = false;
          
          // Add to bidding history
          const bidEntry = {
            team: team,
            amount: amount,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
          };
          
          room.biddingHistory.unshift(bidEntry);
          
          // Keep only last 20 bids
          if (room.biddingHistory.length > 20) {
            room.biddingHistory = room.biddingHistory.slice(0, 20);
          }

          // Broadcast to all clients in room
          broadcastToRoom(ws.roomId, {
            type: "new_bid_broadcast",
            room: ws.roomId,
            team: team,
            amount: amount,
            currentBid: room.currentBid,
            highestBidder: room.highestBidder,
            biddingHistory: room.biddingHistory,
            timer: room.timer
          });

          console.log(`New bid in room ${ws.roomId}: ${team} - ₹${amount} Cr`);
          break;

        case "getsize":
          if (!data.room || !rooms[data.room]) {
            return ws.send(JSON.stringify({ 
              type: "error", 
              message: "Invalid room" 
            }));
          }
          
          ws.send(JSON.stringify({ 
            type: "size", 
            room: data.room, 
            size: rooms[data.room].length,
            teams: roomData[data.room]?.teams || [],
            selectedTeams: roomData[data.room]?.selectedTeams || []
          }));
          break;

        case "leave":
          const leftRoom = removeClientFromRoom(ws);
          if (leftRoom) {
            ws.send(JSON.stringify({ type: "left", room: leftRoom }));
            ws.roomId = null;
            ws.teamName = null;
          }
          break;

        case "ping":
          ws.send(JSON.stringify({ type: "pong" }));
          break;

        default:
          ws.send(JSON.stringify({ 
            type: "error", 
            message: `Unsupported action: ${data.type}` 
          }));
      }
    } catch (err) {
      console.error("Message processing error:", err);
      ws.send(JSON.stringify({ 
        type: "error", 
        message: "Invalid message format" 
      }));
    }
  });

  ws.on("close", () => {
    removeClientFromRoom(ws);
    console.log("Client disconnected");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
    removeClientFromRoom(ws);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: "connected",
    message: "Connected to auction server",
    timestamp: new Date().toISOString()
  }));
});

// Enhanced timer system
setInterval(() => {
  Object.keys(roomData).forEach(roomId => {
    const room = roomData[roomId];
    
    if (room.timer > 0 && !room.sold && rooms[roomId] && rooms[roomId].length > 0) {
      room.timer--;
      
      broadcastToRoom(roomId, {
        type: "timer_update",
        timer: room.timer,
        room: roomId
      });
    } else if (room.timer === 0 && !room.sold) {
      handlePlayerSold(roomId);
    }
  });
}, 1000);

// Enhanced heartbeat system
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log("Terminating dead connection");
      removeClientFromRoom(ws);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeat);
  console.log("Server shutting down");
});

console.log("WebSocket server running on ws://localhost:8080");