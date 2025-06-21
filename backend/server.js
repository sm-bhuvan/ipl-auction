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
    
    if (newSize > 0) {
      broadcastToRoom(ws.roomId, { 
        type: "member_left", 
        room: ws.roomId, 
        size: newSize 
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
              selectedTeams: []
            };
            console.log(`Created room ${data.room}`);
          }

          // Prevent duplicate joins
          if (rooms[data.room].includes(ws)) {
            return ws.send(JSON.stringify({ 
              type: "joined", 
              room: data.room, 
              size: rooms[data.room].length,
              teams: roomData[data.room].teams
            }));
          }

          // Add to room
          rooms[data.room].push(ws);
          ws.roomId = data.room;
          const roomSize = rooms[data.room].length;
          
          ws.send(JSON.stringify({ 
            type: "joined", 
            room: data.room, 
            size: roomSize,
            teams: roomData[data.room].teams
          }));
          
          broadcastToRoom(data.room, {
            type: "member_joined", 
            room: data.room, 
            size: roomSize 
          }, ws);
          
          console.log(`Client joined ${data.room} (size: ${roomSize})`);
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
            selectedAt: new Date().toISOString()
          });

          broadcastToRoom(ws.roomId, {
            type: "team_selected",
            room: ws.roomId,
            team: selectedTeam,
            availableTeams: roomData[ws.roomId].teams
          });

          ws.send(JSON.stringify({
            type: "team_selected_success",
            room: ws.roomId,
            team: selectedTeam
          }));
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
            teams: roomData[data.room]?.teams || []
          }));
          break;

        case "leave":
          const leftRoom = removeClientFromRoom(ws);
          if (leftRoom) {
            ws.send(JSON.stringify({ type: "left", room: leftRoom }));
            ws.roomId = null;
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