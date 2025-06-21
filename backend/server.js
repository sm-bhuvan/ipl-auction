const { WebSocketServer, WebSocket } = require("ws");
const wss = new WebSocketServer({ port: 8080 });
const rooms = {};
const roomData = {};

// Initial teams available for each room
const initialTeams = [
  { name: "Mumbai Indians", code: "MI", color: "from-blue-600 to-blue-800", logo: "🏏" },
  { name: "Chennai Super Kings", code: "CSK", color: "from-yellow-500 to-yellow-600", logo: "🦁" },
  { name: "Royal Challengers Bangalore", code: "RCB", color: "from-red-600 to-red-800", logo: "👑" },
  { name: "Kolkata Knight Riders", code: "KKR", color: "from-purple-600 to-purple-800", logo: "⚔️" },
  { name: "Delhi Capitals", code: "DC", color: "from-blue-500 to-red-500", logo: "🏛️" },
  { name: "Punjab Kings", code: "PBKS", color: "from-red-500 to-yellow-500", logo: "👑" },
  { name: "Rajasthan Royals", code: "RR", color: "from-pink-500 to-blue-500", logo: "👑" },
  { name: "Sunrisers Hyderabad", code: "SRH", color: "from-orange-500 to-red-600", logo: "☀️" },
  { name: "Gujarat Titans", code: "GT", color: "from-slate-800 to-yellow-400", logo: "⛰️" },
  { name: "Lucknow Super Giants", code: "LSG", color: "from-blue-400 to-orange-300", logo: "🦅" }
];

// Sample players for auction
const players = [
  {
    id: "jos-buttler",
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

// Broadcast with error protection
const broadcastToRoom = (roomId, message, excludeWs = null) => {
  if (!rooms[roomId]) return;
  
  rooms[roomId].forEach((client) => {
    try {
      if (client !== excludeWs && 
          client.readyState === WebSocket.OPEN && 
          client.roomId === roomId) {
        client.send(JSON.stringify(message));
      }
    } catch (err) {
      console.error("Broadcast error:", err);
    }
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
              currentPlayer: players[0], // Default player
              currentBid: players[0].basePrice,
              biddingHistory: [],
              timer: 45,
              isActive: true, // FIX: Set to true by default to start timer
              sold: false
            };
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
              // Find team info from initial teams or create a basic one
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
            timer: roomData[data.room].timer
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
          
          // Check if auction is still active
          if (room.sold) {
            return ws.send(JSON.stringify({ 
              type: "error", 
              message: "Player already sold" 
            }));
          }
          
          // Validate bid amount
          if (amount <= room.currentBid) {
            return ws.send(JSON.stringify({ 
              type: "error", 
              message: "Bid must be higher than current bid" 
            }));
          }

          // Update room data
          room.currentBid = amount;
          room.timer = 45; // Reset timer
          room.isActive = true; // Ensure auction is active
          room.sold = false; // Ensure not sold
          
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

// FIX: Timer countdown for each room - removed the isActive condition that was preventing countdown
setInterval(() => {
  Object.keys(roomData).forEach(roomId => {
    const room = roomData[roomId];
    
    // Timer should countdown if there are active rooms and timer > 0 and not sold
    if (room.timer > 0 && !room.sold && rooms[roomId] && rooms[roomId].length > 0) {
      room.timer--;
      
      // Broadcast timer update
      broadcastToRoom(roomId, {
        type: "timer_update",
        timer: room.timer,
        room: roomId
      });
      
      // If timer reaches 0, mark as sold
      if (room.timer === 0) {
        room.sold = true;
        room.isActive = false;
        broadcastToRoom(roomId, {
          type: "player_sold",
          room: roomId,
          player: room.currentPlayer,
          finalBid: room.currentBid,
          winningTeam: room.biddingHistory.length > 0 ? room.biddingHistory[0].team : null
        });
        console.log(`Player sold in room ${roomId} for ₹${room.currentBid} Cr to ${room.biddingHistory.length > 0 ? room.biddingHistory[0].team : 'No bidder'}`);
      }
    }
  });
}, 1000);

// Heartbeat for dead connection detection
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