"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "./dropdown";
import { addteam, remove, addroom } from "@/app/redux/teams";

const Join = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Store Redux state in ref to avoid stale closures
  const allteamsRef = useRef([]);
  allteamsRef.current = useSelector((state) => state.teams.value);
  
  const [roomPres, setRoomPres] = useState(false);
  const [room, setRoom] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [prevSelectedTeam, setPrevSelectedTeam] = useState(null);
  const [ws, setWs] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const roomCode = e.target.elements[0].value.trim().toUpperCase();
    console.log("Room Code:", roomCode);

    if (roomCode) {
      const websocket = new WebSocket(`ws://localhost:8080`);

      websocket.onopen = () => {
        websocket.send(JSON.stringify({ type: "join", room: roomCode }));
        setRoom(roomCode);
        setWs(websocket);
        console.log("WebSocket connection established for room:", roomCode);
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received:", data);

        switch (data.type) {
          case "joined":
            // Server sends available teams when joining
            setRoomPres(true);
            setTeams(data.teams || []);
            
            // Add room to Redux with teams from server
            dispatch(addroom(roomCode));
            if (data.teams) {
              data.teams.forEach(team => {
                dispatch(addteam({ roomCode, team }));
              });
            }
            
            console.log(`Joined room ${data.room}. Available teams:`, data.teams);
            break;

          case "team_selected":
            // Another user selected a team - update available teams
            setTeams(data.availableTeams || []);
            console.log(`Team ${data.team.name} was selected by another user`);
            break;

          case "error":
            console.error("Server error:", data.message);
            alert(`Error: ${data.message}`);
            break;

          default:
            console.log("Unhandled message type:", data.type);
        }
      };

      websocket.onerror = (err) => {
        console.error("WebSocket error:", err);
        alert("Failed to connect to server");
      };

      websocket.onclose = () => {
        console.log("WebSocket connection closed");
        setRoomPres(false);
      };
    } else {
      console.error("Server code is required");
    }
  };

  const handleTeamSelect = (team) => {
    if (room && selectedTeam) {
      dispatch(addteam({ roomCode: room, team: selectedTeam }));
    }
    setPrevSelectedTeam(selectedTeam);
    setSelectedTeam(team);
  };

  const handleConfirmTeam = () => {
    if (room && selectedTeam && ws) {
      // Tell server about team selection
      ws.send(JSON.stringify({
        type: "select_team",
        room: room,
        teamCode: selectedTeam.code
      }));

      // Remove from Redux
      dispatch(remove({ roomCode: room, teamCode: selectedTeam.code }));
      
      // Navigate to auction room
      router.push(`/auctionroom/${room}${selectedTeam.code}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
            IPL AUCTION
            {room && ` - Room: ${room}`}
          </div>
          <p className="text-gray-300 text-lg">Choose your action</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-white text-2xl font-semibold">
              Enter the Server Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter Server Code"
                className="w-full h-14 bg-white/20 text-white placeholder-gray-400 border border-white/30 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 uppercase"
                disabled={roomPres}
              />
              <button
                type="submit"
                disabled={roomPres}
                className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 mt-4 disabled:opacity-50"
              >
                {roomPres ? "Connected!" : "Submit"}
              </button>
            </form>

            {roomPres && teams.length > 0 && (
              <>
                <div className="text-center text-green-400 mb-4">
                  <p>✅ Connected to room {room}</p>
                  <p className="text-sm text-gray-300">{teams.length} teams available</p>
                </div>
                <Dropdown onSelect={handleTeamSelect} teams={teams} />
                <button
                  onClick={handleConfirmTeam}
                  disabled={!selectedTeam}
                  className="w-full h-14 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-800 transition-all duration-300 mt-4 disabled:opacity-50"
                >
                  {selectedTeam ? `Confirm ${selectedTeam.name}` : "Select Team First"}
                </button>
              </>
            )}

            {roomPres && teams.length === 0 && (
              <div className="text-center text-yellow-400 p-4">
                <p>⚠️ No teams available in this room</p>
                <p className="text-sm text-gray-300">All teams may have been selected</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">Build your Favorite IPL team to glory!</p>
        </div>
      </div>
    </div>
  );
};

export default Join;