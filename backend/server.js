const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ port: 8080 });
const rooms = {};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "join":
        if (!rooms[data.room]) {
          rooms[data.room] = [];
        }
        rooms[data.room].push(ws);
        ws.roomId = data.room;
        ws.send(JSON.stringify({ type: "joined", room: data.room }));
        console.log(rooms);
        break;

      case "message":
        if (rooms[data.room]) {
          rooms[data.room].forEach((client) => {
            if (client !== ws && client.readyState === client.OPEN) {
              client.send(JSON.stringify({ type: "message", message: data.message }));
            }
          });
        }
        break;
    
      case "getsize":
        if (rooms[data.room]) {
          const size = rooms[data.room].length;
          ws.send(JSON.stringify({ type: "size", room: data.room, size }));
        } else {
          ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
        }
        break;
      case "leave":
        if (rooms[data.room]) {
          rooms[data.room] = rooms[data.room].filter(client => client !== ws);
          ws.send(JSON.stringify({ type: "left", room: data.room }));
        }
        break;
    }
  });

  ws.on("close", () => {
    const roomId = ws.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(client => client !== ws);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
});
console.log("WebSocket server is running on ws://localhost:8080");
