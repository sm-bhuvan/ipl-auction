"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "./dropdown";
import { addroom, remove, addteam } from "@/app/redux/teams";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Join = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [room, setRoom] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [ws, setWs] = useState(null);

  // Clean up WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
        console.log("WebSocket connection cleaned up");
      }
    };
  }, [ws]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const roomCode = formData.get("roomCode")?.toString().trim().toUpperCase() || "";
    
    if (!roomCode) {
      setError("Room code is required");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      // Check if room exists using the endpoint
      const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode }),
      });
      
      const data = await res.json();
      
      // Handle API response based on endpoint behavior
      if (res.status === 404) {
        setError("Room doesn't exist");
        setIsJoining(false);
        return;
      }

      if (!res.ok) {
        setError("Server error. Please try again.");
        setIsJoining(false);
        return;
      }

      // Connect to WebSocket server
      const websocket = new WebSocket(`ws://localhost:8080`);
      setWs(websocket);

      websocket.onopen = () => {
        websocket.send(JSON.stringify({ 
          type: "join", 
          room: roomCode 
        }));
        setRoom(roomCode);
        console.log("WebSocket connection established");
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received:", data);

        switch (data.type) {
          case "joined":
            setTeams(data.teams || []);
            dispatch(addroom(roomCode));
            // Add available teams to Redux
            if (data.teams) {
              data.teams.forEach(team => {
                dispatch(addteam({ roomCode, team }));
              });
            }
            break;

          case "team_selected":
            // Update available teams when another user selects a team
            setTeams(data.availableTeams || []);
            // Update Redux state
            dispatch(addroom(roomCode));
            if (data.availableTeams) {
              data.availableTeams.forEach(team => {
                dispatch(addteam({ roomCode, team }));
              });
            }
            break;

          case "error":
            setError(data.message || "Server error");
            setIsJoining(false);
            break;

          default:
            console.log("Unhandled message type:", data.type);
        }
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Failed to connect to server");
        setIsJoining(false);
      };

      websocket.onclose = () => {
        console.log("WebSocket connection closed");
        setIsJoining(false);
      };
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Please try again.");
      setIsJoining(false);
    }
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
  };

  const handleConfirmTeam = () => {
    if (!room || !selectedTeam || !ws) return;

    setIsConfirming(true);
    
    // Notify server about team selection
    ws.send(JSON.stringify({
      type: "select_team",
      room,
      teamCode: selectedTeam.code
    }));

    // Update local state and navigate
    dispatch(remove({ roomCode: room, teamCode: selectedTeam.code }));
    router.push(`/auctionroom/${room}${selectedTeam.code}`);
  };

  const isRoomActive = room && teams.length > 0;

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
              {isRoomActive ? "Select Your Team" : "Enter Room Code"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 p-6">
            {!isRoomActive ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="roomCode"
                  type="text"
                  placeholder="Enter Room Code"
                  className="w-full h-14 bg-white/20 text-white placeholder-gray-400 border border-white/30 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 uppercase"
                  disabled={isJoining}
                />
                
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                
                <Button
                  type="submit"
                  disabled={isJoining}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : "Join Room"}
                </Button>
              </form>
            ) : (
              <>
                <div className="text-center text-green-400 mb-4">
                  <p>✅ Connected to room {room}</p>
                  <p className="text-sm text-gray-300">
                    {teams.length} team{teams.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                
                <Dropdown 
                  onSelect={handleTeamSelect} 
                  teams={teams} 
                  disabled={isConfirming}
                />
                
                <Button
                  onClick={handleConfirmTeam}
                  disabled={!selectedTeam || isConfirming}
                  className="w-full h-14 bg-green-600 hover:bg-green-700"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : selectedTeam 
                    ? `Confirm ${selectedTeam.name}` 
                    : "Select Team First"}
                </Button>
              </>
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