const { WebSocketServer, WebSocket } = require("ws");
const { MongoClient } = require("mongodb");
const roles = ["Batter", "Bowler", "All-Rounder", "Wicketkeeper-Batter", "Wicketkeeper"];
const wss = new WebSocketServer({ port: 8080 });
const rooms = {};
const roomData = {};
let allPlayers = [];
let playersFetched = false;

const uri = "mongodb+srv://pragatheesh1729:123@ipl-auction.qtnwamb.mongodb.net/";
const client = new MongoClient(uri);

async function fetchPlayersFromMongo() {
  try {
    await client.connect();
    const database = client.db("test");
    const collection = database.collection("players");

    allPlayers = roles.map(() => []);

    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      const playersInRole = await collection.find({ Role: role })
        .sort({ 'Matches in IPL': -1 })
        .toArray();

      allPlayers[i] = playersInRole;
      console.log(`Fetched ${playersInRole.length} players for role: ${role}`);
    }

    playersFetched = true;
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

fetchPlayersFromMongo();

// Move squad inside a function to create separate instances
function createInitialSquad() {
  return {
    "MI": {
      "Batter": [
        { name: "Rohit Sharma", overseas: false },
        { name: "Suryakumar Yadav", overseas: false },
        { name: "Tilak Varma", overseas: false }
      ],
      "Bowler": [
        { name: "Jasprit Bumrah", overseas: false }
      ],
      "All-Rounder": [
        { name: "Hardik Pandya", overseas: false }
      ],
      "Wicketkeeper-Batter": [],
      "Wicketkeeper": []
    },
    "CSK": {
      "Batter": [
        { name: "Ruturaj Gaikwad", overseas: false }
      ],
      "Bowler": [
        { name: "Matheesha Pathirana", overseas: true }
      ],
      "All-Rounder": [
        { name: "Ravindra Jadeja", overseas: false },
        { name: "Shivam Dube", overseas: false }
      ],
      "Wicketkeeper-Batter": [],
      "Wicketkeeper": [
        { name: "MS Dhoni", overseas: false }
      ]
    },
    "RCB": {
      "Batter": [
        { name: "Virat Kohli", overseas: false },
        { name: "Rajat Patidar", overseas: false }
      ],
      "Bowler": [
        { name: "Yash Dayal", overseas: false }
      ],
      "All-Rounder": [],
      "Wicketkeeper-Batter": [],
      "Wicketkeeper": []
    },
    "KKR": {
      "Batter": [
        { name: "Rinku Singh", overseas: false },
        { name: "Sunil Narine", overseas: true }
      ],
      "Bowler": [
        { name: "Varun Chakaravarthy", overseas: false },
        { name: "Harshit Rana", overseas: false }
      ],
      "All-Rounder": [
        { name: "Andre Russell", overseas: true },
        { name: "Ramandeep Singh", overseas: false }
      ],
      "Wicketkeeper-Batter": [],
      "Wicketkeeper": []
    },
    "DC": {
      "Batter": [],
      "Bowler": [
        { name: "Kuldeep Yadav", overseas: false }
      ],
      "All-Rounder": [
        { name: "Axar Patel", overseas: false },
        { name: "Tristan Stubbs", overseas: true }
      ],
      "Wicketkeeper-Batter": [
        { name: "Abhishek Porel", overseas: false }
      ],
      "Wicketkeeper": []
    },
    "PBKS": {
      "Batter": [
        { name: "Shashank Singh", overseas: false }
      ],
      "Bowler": [],
      "All-Rounder": [],
      "Wicketkeeper-Batter": [
        { name: "Prabhsimran Singh", overseas: false }
      ],
      "Wicketkeeper": []
    },
    "RR": {
      "Batter": [
        { name: "Yashasvi Jaiswal", overseas: false },
        { name: "Shimron Hetmyer", overseas: true }
      ],
      "Bowler": [
        { name: "Sandeep Sharma", overseas: false }
      ],
      "All-Rounder": [
        { name: "Riyan Parag", overseas: false }
      ],
      "Wicketkeeper-Batter": [
        { name: "Sanju Samson", overseas: false },
        { name: "Dhruv Jurel", overseas: false }
      ],
      "Wicketkeeper": []
    },
    "SRH": {
      "Batter": [
        { name: "Travis Head", overseas: true },
        { name: "Nitish Kumar Reddy", overseas: false }
      ],
      "Bowler": [],
      "All-Rounder": [
        { name: "Abhishek Sharma", overseas: false },
        { name: "Pat Cummins", overseas: true }
      ],
      "Wicketkeeper-Batter": [
        { name: "Heinrich Klaasen", overseas: true }
      ],
      "Wicketkeeper": []
    },
    "GT": {
      "Batter": [
        { name: "Shubman Gill", overseas: false },
        { name: "Sai Sudharsan", overseas: false }
      ],
      "Bowler": [
        { name: "Rashid Khan", overseas: true }
      ],
      "All-Rounder": [
        { name: "Rahul Tewatia", overseas: false },
        { name: "Shahrukh Khan", overseas: false }
      ],
      "Wicketkeeper-Batter": [],
      "Wicketkeeper": []
    },
    "LSG": {
      "Batter": [
        { name: "Ayush Badoni", overseas: false }
      ],
      "Bowler": [
        { name: "Ravi Bishnoi", overseas: false },
        { name: "Mayank Yadav", overseas: false },
        { name: "Mohsin Khan", overseas: false }
      ],
      "All-Rounder": [],
      "Wicketkeeper-Batter": [
        { name: "Nicholas Pooran", overseas: true }
      ],
      "Wicketkeeper": []
    }
  };
}


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

const cleanupRoom = (roomId) => {
  if (rooms[roomId] && rooms[roomId].length === 0) {
    delete rooms[roomId];
    delete roomData[roomId];
    console.log(`Room ${roomId} cleaned up`);
  }
};

const removeClientFromRoom = (ws) => {
  if (!ws.roomId || !rooms[ws.roomId]) return null;

  try {
    const oldSize = rooms[ws.roomId].length;
    rooms[ws.roomId] = rooms[ws.roomId].filter(client => client !== ws);
    const newSize = rooms[ws.roomId].length;

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

const validateBid = (roomId, teamCode, amount) => {
  const room = roomData[roomId];
  if (!room) return { valid: false, reason: "Room not found" };

  if (room.sold) return { valid: false, reason: "Player already sold" };

  if (room.currentBid === 0 && amount < room.basePrice) {
    return { valid: false, reason: `First bid must be at least ₹${room.basePrice.toFixed(1)} Cr` };
  }

  if (room.currentBid > 0 && amount <= room.currentBid) {
    return { valid: false, reason: "Bid must be at least ₹0.5 Cr higher" };
  }

  if (room.teamBudgets && room.teamBudgets[teamCode] < amount) {
    return { valid: false, reason: "Insufficient budget" };
  }
  if (room.currentPlayer.Nationality !== "India") {
    const teamSquad = room.squads[teamCode];
    let overseasCount = 0;

    for (const role in teamSquad) {
      overseasCount += teamSquad[role].filter(p => p.overseas).length;
    }

    if (overseasCount >= 8) {
      return { valid: false, reason: "Maximum overseas players (8) reached" };
    }
  }

  return { valid: true };
};

const handlePlayerSold = (roomId) => {
  const room = roomData[roomId];
  if (!room || room.sold || !room.currentPlayer) return;

  const soldPlayer = room.currentPlayer;
  const winningTeam = room.highestBidder;
  const finalBid = room.currentBid;
  const role = room.currentPlayer.Role
  if (finalBid != 0) {
    const overseas = room.currentPlayer.Nationality !== "India";
    room.squads[winningTeam][role].push({
      name: soldPlayer["Player Name"],
      overseas: overseas
    });
    room.unsoldPlayerSet.delete(soldPlayer);
  }
  if (room.players[room.currentSetIndex].length > 0) {
    room.players[room.currentSetIndex].shift();
  }

  room.sold = true;
  room.isActive = false;
  room.setHistory.push({
    player: soldPlayer["Player Name"],
    team: winningTeam,
    amount: finalBid,
    role: soldPlayer.Role,
    timestamp: new Date().toISOString()
  });

  room.currentPlayerInSetIndex++;

  if (winningTeam && room.teamBudgets) {
    room.teamBudgets[winningTeam] = parseFloat((room.teamBudgets[winningTeam] - finalBid).toFixed(1));
  }

  const shouldRotateSet = room.currentPlayerInSetIndex >= 20;
  const currentSetEmpty = room.players[room.currentSetIndex].length === 0;

  if (shouldRotateSet || currentSetEmpty) {
    room.inBreak = true;
    room.setBreakTimer = 15;
    const completedSet = roles[room.currentSetIndex];
    const nextSetIndex = (room.currentSetIndex + 1) % roles.length;
    room.currentSetIndex = nextSetIndex;
    room.currentPlayerInSetIndex = 0;
    room.setHistory = [];

    broadcastToRoom(roomId, {
      type: "set_break_start",
      room: roomId,
      completedSet: completedSet,
      nextSet: roles[nextSetIndex],
      playersSold: room.currentPlayerInSetIndex,
      breakTime: 15,
      wasFullRotation: shouldRotateSet && !currentSetEmpty,
      playersRemaining: room.players[nextSetIndex].length
    });
    return;
  }

  broadcastToRoom(roomId, {
    type: "player_sold",
    room: roomId,
    player: soldPlayer,
    finalBid: finalBid,
    winningTeam: winningTeam,
    updatedBudgets: room.teamBudgets,
    squads: room.squads, // Send updated squads to clients
    setProgress: {
      current: room.currentPlayerInSetIndex,
      remainingInSet: 20 - room.currentPlayerInSetIndex,
      currentSet: roles[room.currentSetIndex]
    }
  });

  setTimeout(() => moveToNextPlayer(roomId), 3000);
};

const moveToNextPlayer = (roomId) => {
  const room = roomData[roomId];
  if (!room || room.inBreak) return;
  if (!room.players[room.currentSetIndex] || room.players[room.currentSetIndex].length === 0) {
    console.error("No players available in current set!");
    return;
  }
  console.log(room.currentPlayerInSetIndex)
  room.currentPlayer = room.players[room.currentSetIndex][0];
  room.currentBid = 0;
  room.basePrice = room.currentPlayer.basePrice / 100;
  room.highestBidder = null;
  room.biddingHistory = [];
  room.timer = 45;
  room.sold = false;
  room.isActive = true;
  broadcastToRoom(roomId, {
    type: "next_player",
    room: roomId,
    player: room.currentPlayer,
    currentBid: room.currentBid,
    basePrice: room.basePrice,
    timer: 45,
    biddingHistory: [],
    setInfo: {
      index: room.currentSetIndex,
      role: roles[room.currentSetIndex],
      playersSold: room.currentPlayerInSetIndex,
      totalInSet: 20
    },
    nextSet: roles[(room.currentSetIndex + 1) % roles.length],
    budgets: room.teamBudgets
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
          if (!playersFetched) {
            return ws.send(JSON.stringify({
              type: "error",
              message: "Server is initializing players. Please try again shortly."
            }));
          }
          if (!data.room || typeof data.room !== 'string') {
            return ws.send(JSON.stringify({
              type: "error",
              message: "Invalid room code"
            }));
          }

          removeClientFromRoom(ws);

          if (!rooms[data.room]) {
            const firstPlayer = allPlayers.length > 0 && allPlayers[0].length > 0 ? allPlayers[0][0] : null;
            rooms[data.room] = [];
            roomData[data.room] = {
              teams: [...initialTeams],
              selectedTeams: [],
              teamBudgets: {},
              players: allPlayers.map(set => [...set]),
              currentPlayerIndex: 0,
              currentPlayer: firstPlayer,
              currentBid: 0,
              highestBidder: null,
              biddingHistory: [],
              timer: 45,
              isActive: true,
              sold: false,
              unsoldPlayerSet: new Set(allPlayers.flat()),
              currentSetIndex: 0,
              currentPlayerInSetIndex: 0,
              inBreak: false,
              setBreakTimer: 0,
              setHistory: [],
              squads: createInitialSquad() // Create a separate squad instance for each room
            };

            initialTeams.forEach(team => {
              roomData[data.room].teamBudgets[team.code] = team.initialBudget;
            });

            console.log(`Created room ${data.room}`);
          }

          const existingConnection = rooms[data.room].find(client =>
            client.teamName === data.teamName && client.readyState === WebSocket.OPEN
          );

          if (existingConnection) {
            rooms[data.room] = rooms[data.room].filter(client => client !== existingConnection);
            roomData[data.room].selectedTeams = roomData[data.room].selectedTeams.filter(
              team => team.code !== data.teamName
            );
          }

          rooms[data.room].push(ws);
          ws.roomId = data.room;
          ws.teamName = data.teamName || null;

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
            myBudget: roomData[data.room].teamBudgets[data.teamName] || 0,
            currentSetIndex: roomData[data.room].currentSetIndex,
            playerInSetIndex: roomData[data.room].currentPlayerInSetIndex,
            setHistory: roomData[data.room].setHistory,
            inBreak: roomData[data.room].inBreak,
            setBreakTimer: roomData[data.room].setBreakTimer,
            squads: roomData[data.room].squads
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

          const validation = validateBid(ws.roomId, team, amount);
          if (!validation.valid) {
            return ws.send(JSON.stringify({
              type: "error",
              message: validation.reason
            }));
          }

          room.currentBid = amount;
          room.highestBidder = team;
          room.timer = 25;
          room.isActive = true;
          room.sold = false;

          const bidEntry = {
            team: team,
            amount: amount,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
          };

          room.biddingHistory.unshift(bidEntry);

          if (room.biddingHistory.length > 20) {
            room.biddingHistory = room.biddingHistory.slice(0, 20);
          }

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

  ws.send(JSON.stringify({
    type: "connected",
    message: "Connected to auction server",
    timestamp: new Date().toISOString()
  }));
});

setInterval(() => {
  Object.keys(roomData).forEach(roomId => {
    const room = roomData[roomId];

    if (room.inBreak) {
      room.setBreakTimer--;

      broadcastToRoom(roomId, {
        type: "set_break_update",
        breakTime: room.setBreakTimer,
        room: roomId
      });

      if (room.setBreakTimer <= 0) {
        room.inBreak = false;
        moveToNextPlayer(roomId);
      }
      return;
    }

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