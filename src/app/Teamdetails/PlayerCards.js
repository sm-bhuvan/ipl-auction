import React from 'react'
import {
    Users,
    Crown,
    Star
} from "lucide-react"

import getCategoryIcon from './getCategoryIcon'
import getTypeColor from './getTypeColor'

const PlayerCards = ({ selectedPlayers = [], team }) => {
    const Teams = [
        { name: "Mumbai Indians", color: "from-blue-600 to-blue-800" },
        { name: "Chennai Super Kings", color: "from-yellow-500 to-yellow-600" },
        { name: "Royal Challengers Bangalore", color: "from-red-600 to-red-800" },
        { name: "Kolkata Knight Riders", color: "from-purple-600 to-purple-800" },
        { name: "Delhi Capitals", color: "from-blue-500 to-red-500" },
        { name: "Punjab Kings", color: "from-red-500 to-yellow-500" },
        { name: "Rajasthan Royals", color: "from-pink-500 to-blue-500" },
        { name: "Sunrisers Hyderabad", color: "from-orange-500 to-red-600" },
        { name: "Gujarat Titans", color: "from-slate-800 to-yellow-400" },
        { name: "Lucknow Super Giants", color: "from-blue-400 to-orange-300" }
    ]

    const gradient = Teams.find((t) => t.name === team)?.color || "from-gray-500 to-gray-700"

    return (
        <div className="col-span-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center`}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Retained Squad</h2>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  {selectedPlayers.length} Players
                </div>
              </div>

              <div className="space-y-4">
                {selectedPlayers.map((player, index) => (
                  <div
                    key={player.name}
                    className="group bg-gradient-to-r from-gray-50 to--50 rounded-2xl p-6 border border-gray-200  hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {index + 1}
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 transition-colors mb-1">
                            {player.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{player.role}</p>

                          <div className="flex flex-wrap gap-2 mb-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(player.type)}`}
                            >
                              {getCategoryIcon(player.category)}
                              {player.category}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200 capitalize">
                              {player.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-green-600 mb-1">₹{player.amount}cr</div>
                        <div className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-full">Retention</div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
            </div>
        </div>
    )
}

export default PlayerCards