"use client"
import React, { useState, useEffect } from "react";

const teams = [
  { name: "MI", color: "#2D9CDB", budget: 32 },
  { name: "CSK", color: "#F2C94C", budget: 21 },
  { name: "RCB", color: "#EB5757", budget: 41 },
  { name: "RR", color: "#BB6BD9", budget: 34 },
  { name: "KKR", color: "#9B51E0", budget: 30 },
  { name: "SRH", color: "#F2994A", budget: 47 },
  { name: "DC", color: "#56CCF2", budget: 61 },
  { name: "PBKS", color: "#D0021B", budget: 62 },
  { name: "GT", color: "#6FCF97", budget: 52 },
  { name: "LSG", color: "#00BCD4", budget: 42 },
];

export default function AuctionPage() {
  const [currentBid, setCurrentBid] = useState(12.0);
  const [timer, setTimer] = useState(45);
  const [biddingHistory, setBiddingHistory] = useState([
    { team: "MI", amount: 12.0, time: "Just now" },
    { team: "RCB", amount: 11.5, time: "1 min ago" },
    { team: "CSK", amount: 11.0, time: "2 min ago" },
    { team: "MI", amount: 10.5, time: "3 min ago" },
  ]);
  const [sold, setSold] = useState(false);

  useEffect(() => {
    if (timer > 0 && !sold) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    } else if (timer === 0) {
      setSold(true);
    }
  }, [timer, sold]);

  const handleBid = () => {
    if (sold) return;
    const nextBid = currentBid + 0.5;
    setCurrentBid(nextBid);
    setTimer(45);
    setBiddingHistory([
      { team: "RCB", amount: nextBid, time: "Just now" },
      ...biddingHistory,
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            IPL MEGA AUCTION 2025
          </h1>
          <p className="text-gray-300 text-sm mt-1">Live Bidding Session</p>
        </div>
        <div className="text-right">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
            <div className="text-orange-400 font-semibold text-lg">Your Team: RCB</div>
            <div className="text-white">Budget: ₹45.5 Cr</div>
            <div className="text-gray-400 text-sm">Room ID: <span className="font-semibold text-white">#12783</span></div>
          </div>
        </div>
      </header>

      <div className="flex gap-6">
        {/* Player Card */}
        <div className="flex-1">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl">
            {/* Player Header */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
                JB
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">Jos Buttler</h2>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">RR</span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">Wicket-Keeper Batsman</span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">England</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-yellow-400">⭐</span>
                <p className="text-yellow-400 font-semibold">Explosive Opener</p>
              </div>
            </div>

            {/* Current Bid */}
            <div className="text-center mb-6">
              <p className="text-gray-300 mb-2">Current Highest Bid</p>
              <p className="text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                ₹{currentBid.toFixed(1)} Cr
              </p>
              <p className="text-gray-400 text-sm mt-2">Base Price: ₹2.0 Cr</p>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full border-2 ${
                timer <= 10 ? 'border-red-500 bg-red-600/20' : 'border-orange-500 bg-orange-600/20'
              }`}>
                <span className="text-2xl">⏱</span>
                <span className={`text-3xl font-bold ${timer <= 10 ? 'text-red-400' : 'text-orange-400'}`}>
                  {timer}s
                </span>
              </div>
            </div>

            {/* Sold Banner */}
            {sold && (
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-red-600 to-red-500 inline-block px-8 py-3 rounded-full text-white font-bold text-xl shadow-lg">
                  👑 SOLD!
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">65</p>
                <p className="text-sm text-gray-400">Matches</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">2582</p>
                <p className="text-sm text-gray-400">Runs</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">41.64</p>
                <p className="text-sm text-gray-400">Average</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">149.05</p>
                <p className="text-sm text-gray-400">Strike Rate</p>
              </div>
            </div>

            {/* Bidding Interface */}
            {!sold && (
              <div className="space-y-4 p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">🔨</span>
                  <span className="text-white font-semibold text-lg">Place Your Bid</span>
                </div>
                
                <div className="text-center">
                  <button 
                    onClick={handleBid} 
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
                  >
                    ⚡ BID NOW
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[350px] space-y-6">
          {/* Live Bidding */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-green-400 text-xl">📈</span>
              <h3 className="text-white font-semibold text-lg">Live Bidding</h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {biddingHistory.map((bid, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: teams.find(t => t.name === bid.team)?.color || '#888' }}
                    ></div>
                    <span className="text-white font-medium">{bid.team}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">₹{bid.amount.toFixed(1)} Cr</div>
                    <div className="text-xs text-gray-400">{bid.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teams */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-blue-400 text-xl">👥</span>
              <h3 className="text-white font-semibold text-lg">Teams</h3>
            </div>
            <div className="space-y-2">
              {teams.map((team) => (
                <div key={team.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <span className={`text-sm font-medium ${team.name === 'RCB' ? 'text-orange-400' : 'text-white'}`}>
                      {team.name}
                    </span>
                  </div>
                  <span className="text-gray-300 text-sm">₹{team.budget}Cr</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}