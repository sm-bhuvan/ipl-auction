const { WebSocketServer, WebSocket } = require("ws");
const wss = new WebSocketServer({ port: 8080 });
const rooms = {};

// Initial teams available for each room
const initialTeams = [
  { name: "Mumbai Indians", code: "MI", color: "from-blue-600 to-blue-800" },
  { name: "Chennai Super Kings", code: "CSK", color: "from-yellow-500 to-yellow-600"},
  { name: "Royal Challengers Bangalore", code: "RCB", color: "from-red-600 to-red-800"},
  { name: "Kolkata Knight Riders", code: "KKR", color: "from-purple-600 to-purple-800" },
  { name: "Delhi Capitals", code: "DC", color: "from-blue-500 to-red-500" },
  { name: "Punjab Kings", code: "PBKS", color: "from-red-500 to-yellow-500"},
  { name: "Rajasthan Royals", code: "RR", color: "from-pink-500 to-blue-500"},
  { name: "Sunrisers Hyderabad", code: "SRH", color: "from-orange-500 to-red-600"},
];

// Room data structure: { clients: [], teams: [], selectedTeams: [] }
const roomData = {};

const cleanupRoom = (roomId) => {
  if (rooms[roomId] && rooms[roomId].length === 0) {
    delete rooms[roomId];
    delete roomData[roomId]; // Also cleanup room data
    console.log(`Room ${roomId} deleted (empty)`);
  }
};

// Helper function to remove client from room
const removeClientFromRoom = (ws) => {
  if (ws.roomId && rooms[ws.roomId]) {
    const oldSize = rooms[ws.roomId].length;
    rooms[ws.roomId] = rooms[ws.roomId].filter(client => client !== ws);
    const newSize = rooms[ws.roomId].length;
    
    if (newSize > 0) {
      // Notify remaining clients about member leaving
      rooms[ws.roomId].forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ 
            type: "member_left", 
            room: ws.roomId, 
            size: newSize 
          }));
        }
      });
      console.log(`Client left room ${ws.roomId}. Room size: ${oldSize} → ${newSize}`);
    }
    
    cleanupRoom(ws.roomId);
    return ws.roomId;
  }
  return null;
};

// Helper function to broadcast to room
const broadcastToRoom = (roomId, message, excludeWs = null) => {
  if (rooms[roomId]) {
    rooms[roomId].forEach((client) => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
};

wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.isAlive = true;
  
  // Heartbeat to detect broken connections
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data);

      switch (data.type) {
        case "join":
          const previousRoom = removeClientFromRoom(ws);
          if (!data.room || typeof data.room !== 'string') {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Invalid room code" 
            }));
            break;
          }

          // Create room if it doesn't exist
          if (!rooms[data.room]) {
            rooms[data.room] = [];
            roomData[data.room] = {
              teams: [...initialTeams], // Copy of all available teams
              selectedTeams: [] // Teams that have been selected by users
            };
            console.log(`Created new room: ${data.room} with ${initialTeams.length} teams`);
          }

          // Check if client is already in this room (prevent duplicates)
          const alreadyInRoom = rooms[data.room].some(client => client === ws);
          if (alreadyInRoom) {
            console.log(`Client already in room ${data.room}`);
            ws.send(JSON.stringify({ 
              type: "joined", 
              room: data.room, 
              size: rooms[data.room].length,
              teams: roomData[data.room].teams
            }));
            break;
          }

          // Add client to room
          rooms[data.room].push(ws);
          ws.roomId = data.room;
          
          // Send join confirmation with room size and available teams
          const roomSize = rooms[data.room].length;
          ws.send(JSON.stringify({ 
            type: "joined", 
            room: data.room, 
            size: roomSize,
            teams: roomData[data.room].teams
          }));
          
          // Notify other clients in the room about new member
          broadcastToRoom(data.room, {
            type: "member_joined", 
            room: data.room, 
            size: roomSize 
          }, ws);
          
          console.log(`Client joined room ${data.room}. Room size: ${roomSize}, Available teams: ${roomData[data.room].teams.length}`);
          if (previousRoom) {
            console.log(`Client moved from room ${previousRoom} to ${data.room}`);
          }
          
          // Log current room status
          console.log("Current rooms:", Object.keys(rooms).map(roomId => ({
            room: roomId,
            size: rooms[roomId].length,
            availableTeams: roomData[roomId]?.teams.length || 0
          })));
          break;

        case "select_team":
          // Handle team selection
          if (!ws.roomId) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "You must join a room first" 
            }));
            break;
          }

          const { teamCode } = data;
          if (!teamCode) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Team code is required" 
            }));
            break;
          }

          if (!roomData[ws.roomId]) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Room data not found" 
            }));
            break;
          }

          // Find and remove team from available teams
          const teamIndex = roomData[ws.roomId].teams.findIndex(team => team.code === teamCode);
          if (teamIndex === -1) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Team not available" 
            }));
            break;
          }

          // Remove team from available teams
          const selectedTeam = roomData[ws.roomId].teams.splice(teamIndex, 1)[0];
          roomData[ws.roomId].selectedTeams.push({
            ...selectedTeam,
            selectedBy: ws.id || 'unknown',
            selectedAt: new Date().toISOString()
          });

          // Store the selected team on the websocket connection
          ws.selectedTeam = selectedTeam;

          // Notify all clients in the room about team selection
          broadcastToRoom(ws.roomId, {
            type: "team_selected",
            room: ws.roomId,
            team: selectedTeam,
            availableTeams: roomData[ws.roomId].teams
          });

          // Confirm to the selecting client
          ws.send(JSON.stringify({
            type: "team_selected_success",
            room: ws.roomId,
            team: selectedTeam,
            availableTeams: roomData[ws.roomId].teams
          }));

          console.log(`Team ${teamCode} selected in room ${ws.roomId}. Remaining teams: ${roomData[ws.roomId].teams.length}`);
          break;

        case "get_teams":
          // Get current available teams for a room
          if (!data.room) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Room code required" 
            }));
            break;
          }
          
          if (roomData[data.room]) {
            ws.send(JSON.stringify({ 
              type: "teams_list", 
              room: data.room, 
              teams: roomData[data.room].teams,
              selectedTeams: roomData[data.room].selectedTeams
            }));
            console.log(`Teams list sent for room ${data.room}: ${roomData[data.room].teams.length} available`);
          } else {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Room not found" 
            }));
          }
          break;

        case "message":
          // Broadcast message to all clients in the same room
          if (!ws.roomId) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "You must join a room first" 
            }));
            break;
          }
          
          if (rooms[ws.roomId]) {
            const messageData = {
              type: "message",
              message: data.message,
              room: ws.roomId,
              timestamp: new Date().toISOString()
            };
            
            broadcastToRoom(ws.roomId, messageData, ws);
            
            console.log(`Message broadcasted in room ${ws.roomId}: ${data.message}`);
          }
          break;

        case "getsize":
          // Get current room size
          if (!data.room) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Room code required" 
            }));
            break;
          }
          
          if (rooms[data.room]) {
            const size = rooms[data.room].length;
            ws.send(JSON.stringify({ 
              type: "size", 
              room: data.room, 
              size,
              teams: roomData[data.room]?.teams || []
            }));
            console.log(`Room size requested for ${data.room}: ${size}`);
          } else {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Room not found" 
            }));
          }
          break;

        case "leave":
          // Leave current room
          const leftRoom = removeClientFromRoom(ws);
          if (leftRoom) {
            ws.send(JSON.stringify({ 
              type: "left", 
              room: leftRoom 
            }));
            ws.roomId = null;
            ws.selectedTeam = null;
            console.log(`Client manually left room ${leftRoom}`);
          } else {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "You are not in any room" 
            }));
          }
          break;

        case "ping":
          // Health check - respond with pong
          ws.send(JSON.stringify({ 
            type: "pong", 
            timestamp: new Date().toISOString() 
          }));
          break;

        default:
          console.warn(`Unknown message type: ${data.type}`);
          ws.send(JSON.stringify({ 
            type: "error", 
            message: `Unknown message type: ${data.type}` 
          }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(JSON.stringify({ 
        type: "error", 
        message: "Invalid message format" 
      }));
    }
  });

  ws.on("close", (code, reason) => {
    console.log(`Client disconnected. Code: ${code}, Reason: ${reason}`);
    const leftRoom = removeClientFromRoom(ws);
    if (leftRoom) {
      console.log(`Client auto-removed from room ${leftRoom} on disconnect`);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    removeClientFromRoom(ws);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: "connected",
    message: "Connected to auction server",
    timestamp: new Date().toISOString()
  }));
});

// Heartbeat interval to detect broken connections
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log("Terminating inactive connection");
      removeClientFromRoom(ws);
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, 30000); // Check every 30 seconds

// Cleanup interval
wss.on('close', () => {
  clearInterval(heartbeat);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  clearInterval(heartbeat);
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  clearInterval(heartbeat);
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

console.log("WebSocket server is running on ws://localhost:8080");