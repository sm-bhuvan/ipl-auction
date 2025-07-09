"use client";
import React from "react";
import {
  Trophy,
  Users,
  DollarSign,
  Crown,
  Star,
  Zap,
  Shield,
  Target
} from "lucide-react";

const MIRetentions2025 = () => {
  const selectedPlayers = [
    { name: "Jasprit Bumrah", type: "capped", amount: 18, category: "Fast Bowler", role: "Strike Bowler" },
    { name: "Suryakumar Yadav", type: "capped", amount: 16.35, category: "Batsman", role: "Vice-Captain" },
    { name: "Hardik Pandya", type: "capped", amount: 16.35, category: "All-Rounder", role: "Captain" },
    { name: "Rohit Sharma", type: "capped", amount: 16.3, category: "Batsman", role: "Mentor" },
    { name: "Tilak Varma", type: "capped", amount: 8, category: "Batsman", role: "Core Player" }
  ];

  const totalAmount = selectedPlayers.reduce((sum, player) => sum + player.amount, 0);
  const totalPlayers = selectedPlayers.length;
  const cappedCount = selectedPlayers.filter(p => p.type === "capped").length;
  const uncappedCount = selectedPlayers.filter(p => p.type === "uncapped").length;
  const overseasCount = selectedPlayers.filter(p => p.type === "overseas").length;
  const remainingPurse = 120 - totalAmount;

  const getCategoryIcon = (category) => {
    switch(category) {
      case "Batsman": return <Target className="w-3 h-3" />;
      case "All-Rounder": return <Star className="w-3 h-3" />;
      case "Fast Bowler": return <Zap className="w-3 h-3" />;
      case "Spin Bowler": return <Shield className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case "capped": return "bg-blue-100 text-blue-800 border-blue-200";
      case "uncapped": return "bg-green-100 text-green-800 border-green-200";
      case "overseas": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const rules = [
    {
      icon: <Zap className="w-4 h-4" />,
      title: "RTM Rules Updated",
      description: "Original auction winner gets final chance to outbid RTM team."
    },
    {
      icon: <Users className="w-4 h-4" />,
      title: "Squad Size",
      description: "Minimum 18 players, Maximum 25 players."
    },
    {
      icon: <Shield className="w-4 h-4" />,
      title: "Overseas Limit",
      description: "Maximum 8 overseas players allowed."
    }
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-700 bg-clip-text text-transparent">
                IPL 2025 - Mumbai Indians
              </h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Crown className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Captain: Hardik Pandya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Summary */}
          <div className="col-span-3 space-y-3">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Summary
              </h2>
              <div className="space-y-2">
                <SummaryRow label="Players Retained" value={`${totalPlayers}/6`} color="blue" />
                <SummaryRow label="Total Spent" value={`₹${totalAmount.toFixed(2)}cr`} color="green" />
                <SummaryRow label="Auction Purse" value={`₹${remainingPurse.toFixed(2)}cr`} color="orange" />
                <SummaryRow label="Capped Players" value={`${cappedCount}/5`} color="purple" />
                <SummaryRow label="Uncapped Players" value={`${uncappedCount}/2`} color="green" />
                <SummaryRow label="RTM Cards" value="1 Available" color="indigo" />
              </div>
            </div>

            {/* Rules */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-indigo-600" />
                Auction Rules
              </h2>
              <div className="space-y-2">
                {rules.map((rule, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        {rule.icon}
                      </div>
                      <h3 className="font-semibold text-xs text-gray-800">{rule.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600 ml-8">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Player Cards */}
          <div className="col-span-9">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Retained Squad</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3 h-full overflow-y-auto">
                {selectedPlayers.map((player, index) => (
                  <div key={player.name} className="group bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {index + 1}
                          </div>
                          {player.role === "Captain" && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                              <Crown className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                            {player.name}
                          </h3>
                          <p className="text-xs text-gray-600 mb-1">{player.role}</p>
                          <div className="flex gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(player.type)}`}>
                              {getCategoryIcon(player.category)}
                              {player.category}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200 capitalize">
                              {player.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-green-600">
                          ₹{player.amount}cr
                        </div>
                        <div className="text-xs text-gray-500">Retention</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, color }) => {
  const colorClasses = {
    yellow: "text-yellow-600",
    green: "text-green-600",
    orange: "text-orange-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    indigo: "text-indigo-600"
  };

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${colorClasses[color]}`}>{value}</span>
    </div>
  );
};

export default MIRetentions2025;
