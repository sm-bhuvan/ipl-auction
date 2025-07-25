import React from 'react'
import {
  Trophy,
  Users,
  DollarSign,
  Crown,
  Star,
  Zap,
  Shield,
  Target,
  TrendingUp,
  Award,
} from "lucide-react"
const Header = ({ team, captain }) => {
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
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
        <Trophy className="w-6 h-6 text-white" />
      </div>
      <div className="text-left">
        <h1 className={`text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          IPL 2025 - {team}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <Crown className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-600">Captain: {captain}</span>
        </div>
      </div>
    </div>
  )
}

export default Header