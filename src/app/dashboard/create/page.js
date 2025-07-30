"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { add } from "@/app/redux/rooms";
import { addroom, remove, addteam,resetTeams } from "@/app/redux/teams";
import Dropdown from "./dropdown";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/app/contexts/WebSocketContext";
import store from "@/app/redux/store";

function generateRoomCode(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const Create = () => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [prevSelectedTeam, setPrevSelectedTeam] = useState(null);
  const { connect } = useWebSocket();
  const router = useRouter();
  const rooms = useSelector((state) => state.rooms.value);
  const teamsavailable = useSelector((state) => state.teams.value);
  const dispatch = useDispatch();
  const [roomNumber, setRoomNumber] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTeamSelect = (team) => {
    if (currentRoomCode && selectedTeam) {
      dispatch(addteam({ roomCode: currentRoomCode, team: selectedTeam }));
    }
    setPrevSelectedTeam(selectedTeam);
    setSelectedTeam(team);
  };


const handleCreate = async () => {
  if (!selectedTeam) {
    alert("Please select a team first!");
    return;
  }

  setIsLoading(true);
  let roomCode;

  // Try generating a unique room code by checking the DB
  while (true) {
    roomCode = generateRoomCode();

    const res = await fetch("/api/room/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomCode }),
    });

    const data = await res.json();

    if (data.success) break; // Success, move ahead

    if (res.status === 409) {
      console.warn("Room code exists. Retrying...");
    } else {
      alert("Server error while creating room.");
      setIsLoading(false);
      return;
    }
  }

  dispatch(add(roomCode));
  setCurrentRoomCode(roomCode);

  const websocket = new WebSocket(`ws://localhost:8080`);

  websocket.onopen = () => {
    websocket.send(JSON.stringify({ type: "join", room: roomCode }));
  };

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Create - Received:", data);

    switch (data.type) {
      case "joined":
        dispatch(addroom(roomCode));

        websocket.send(
          JSON.stringify({
            type: "select_team",
            room: roomCode,
            teamCode: selectedTeam.code,
          })
        );
        break;

      case "team_selected_success":
        dispatch(remove({ roomCode, teamCode: selectedTeam.code }));
        setRoomNumber(true);
        setIsLoading(false);
        console.log("Room created and team selected successfully:", roomCode);
        break;

      case "error":
        console.error("Server error:", data.message);
        setIsLoading(false);
        alert(`Error: ${data.message}`);
        break;
    }
  };

  websocket.onerror = (err) => {
    console.error("❌ Failed to connect:", err);
    setIsLoading(false);
    alert("Failed to connect to server");
  };
};


  const navigateToRoom = () => {
    if (currentRoomCode && selectedTeam) {
      let s = currentRoomCode + selectedTeam.code;
      router.push(`/auctionroom/${s}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
            IPL AUCTION
            {selectedTeam && ` - ${selectedTeam.name}`}
          </div>
          <p className="text-gray-300 text-lg">Choose your action</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center">
              <Dropdown onSelect={handleTeamSelect} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Button
              onClick={handleCreate}
              disabled={isLoading || roomNumber || !selectedTeam}
              className="w-full h-14 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 cursor-pointer"
            >
              {isLoading
                ? "Creating Room..."
                : roomNumber
                ? "Room Created!"
                : !selectedTeam
                ? "Select Team First"
                : "Confirm"}
            </Button>
            <div className="text-center text-gray-400 text-sm">
              <p>Choose your favorite IPL team to start building your squad!</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Build your Favorite IPL team to glory!
          </p>
          {roomNumber && currentRoomCode && selectedTeam && (
            <div className="mt-4 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <p className="text-green-400 text-lg font-semibold mb-2">
                Room Code: {currentRoomCode}
              </p>
              <p className="text-blue-400 text-md mb-3">
                Team: {selectedTeam.name}
              </p>
              <Button
                onClick={navigateToRoom}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 cursor-pointer"
              >
                Continue to Auction Room
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Create;
