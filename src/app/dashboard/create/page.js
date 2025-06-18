"use client"
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { add } from "@/app/redux/rooms";
import Dropdown from "./dropdown";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/app/contexts/WebSocketContext";

function generateRoomCode(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const Create = () => {
  const { connect, isConnected } = useWebSocket();
  const router = useRouter();
  const rooms = useSelector((state) => state.rooms.value);
  const dispatch = useDispatch();

  const [roomNumber, setRoomNumber] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = () => {
    setIsLoading(true);
    let roomCode = generateRoomCode();

    while (rooms.includes(roomCode) || rooms[roomCode]) {
      roomCode = generateRoomCode();
    }

    dispatch(add(roomCode));
    setCurrentRoomCode(roomCode);
    connect(roomCode)
      .then(() => {
        setRoomNumber(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to connect:", err);
        setIsLoading(false);
      });
  };

  const navigateToRoom = () => {
    if (currentRoomCode) {
      router.push(`/auctionroom/${currentRoomCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
            IPL AUCTION
          </div>
          <p className="text-gray-300 text-lg">Choose your action</p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center">
              <Dropdown />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Button
              onClick={handleCreate}
              disabled={isLoading || roomNumber}
              className="w-full h-14 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
            >
              {isLoading ? "Creating Room..." : roomNumber ? "Room Created!" : "Confirm"}
            </Button>
            <div className="text-center text-gray-400 text-sm">
              <p>Choose your favorite IPL team to start building your squad!</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">Build your Favorite IPL team to glory!</p>
          {roomNumber && currentRoomCode && (
            <div className="mt-4 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <p className="text-green-400 text-lg font-semibold mb-2">
                Room Code: {currentRoomCode}
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
