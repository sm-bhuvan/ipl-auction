"use client";
import React from 'react';
import { Trophy, Users, DollarSign } from 'lucide-react';

const DCRetentions2025 = () => {
  // Actual Chennai Super Kings IPL 2025 retentions
  const selectedPlayers = [
  { name: "Axar Patel", type: "capped", amount: 16.5, category: "All-Rounder" },
  { name: "Kuldeep Yadav", type: "capped", amount: 13.25, category: "Spin Bowler" },
  { name: "Tristan Stubbs", type: "capped", amount: 10, category: "Batsman" },
  { name: "Abishek Porel", type: "uncapped", amount: 4, category: "Wicket-Keeper" }
];


  // Calculate totals
  const totalPlayers = selectedPlayers.length;
  const totalAmount = selectedPlayers.reduce((sum, player) => sum + player.amount, 0);
  const cappedCount = selectedPlayers.filter(p => p.type === 'capped').length;
  const uncappedCount = selectedPlayers.filter(p => p.type === 'uncapped').length;
  const overseasCount = selectedPlayers.filter(p => p.type === 'overseas').length;
  const remainingBudget = 120 - totalAmount; // Total IPL budget is 120 crore
  const remainingPurse = 55; // 120 - 65 = 55 crore for auction

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-blue-600 bg-clip-text text-transparent">
              IPL 2025 Retentions
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">Chennai Super Kings - Final List</p>
          <p className="text-sm text-gray-500 mt-2">Captain: Ruturaj Gaikwad</p>
        </div>

        {/* Selection Summary */}
        <div className="mb-8 bg-gradient-to-r from-gray-50 to-slate-100 border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
          <h3 className="flex items-center gap-2 text-xl font-bold mb-4 text-gray-800">
            <Users className="w-5 h-5" />
            Retention Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="font-medium text-gray-600 text-sm">Total Players</p>
              <p className="text-2xl font-bold text-yellow-600">{totalPlayers}</p>
              <p className="text-xs text-gray-500">/ 6 max</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="font-medium text-gray-600 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-green-600">₹{totalAmount} cr</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="font-medium text-gray-600 text-sm">Auction Purse</p>
              <p className="text-2xl font-bold text-orange-600">₹{remainingPurse} cr</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="font-medium text-gray-600 text-sm">Capped</p>
              <p className="text-xl font-bold text-purple-600">{cappedCount}</p>
              <p className="text-xs text-gray-500">/ 5 max</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="font-medium text-gray-600 text-sm">Uncapped</p>
              <p className="text-xl font-bold text-teal-600">{uncappedCount}</p>
              <p className="text-xs text-gray-500">/ 2 max</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="font-medium text-gray-600 text-sm">RTM Cards</p>
              <p className="text-xl font-bold text-indigo-600">1</p>
              <p className="text-xs text-gray-500">available</p>
            </div>
          </div>
        </div>

        {/* Selected Players List */}
        <div className="bg-gradient-to-r from-yellow-50 to-blue-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-6 h-6 text-yellow-600" />
            <h4 className="text-2xl font-bold text-yellow-800">Retained Players</h4>
          </div>
          
          <div className="grid gap-4">
            {selectedPlayers.map((player, index) => (
              <div key={player.name} className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h5 className="text-xl font-bold text-gray-800">{player.name}</h5>
                      <div className="flex gap-3 text-sm text-gray-600 mt-1">
                        <span className="px-2 py-1 bg-yellow-100 rounded-full font-medium">{player.category}</span>
                        <span className="px-2 py-1 bg-blue-100 rounded-full font-medium capitalize">{player.type}</span>
                        
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">₹{player.amount} cr</div>
                    <div className="text-sm text-gray-500">retention amount</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DCRetentions2025;