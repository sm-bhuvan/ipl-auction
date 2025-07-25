import React from 'react'
import {
    Trophy,
    Users,
    DollarSign,
    Star,
    Shield,
    Target,
    TrendingUp,
    Award,
    Ban,
    XCircle
} from "lucide-react"

const Sidebar = ({ totalPlayers, totalAmount, remainingPurse, cappedCount, uncappedCount, overseasCount, team }) => {
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
    const rules = [
        {
            icon: <Ban className="w-4 h-4" />,
            title: "RTM Cannot Be Used",
            description: "Right to Match cards are not available in this auction.",
        },
        {
            icon: <XCircle className="w-4 h-4" />,
            title: "No Re-auction",
            description: "Unsold players will not be auctioned again.",
        },
        {
            icon: <Target className="w-4 h-4" />,
            title: "Squad Requirements",
            description: "18-25 players total • Max 8 overseas players",
        },
    ]
    const SummaryCard = ({ label, value, color, icon }) => {
        const colorClasses = {
            yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
            green: "text-green-600 bg-green-50 border-green-200",
            orange: "text-orange-600 bg-orange-50 border-orange-200",
            blue: "text-blue-600 bg-blue-50 border-blue-200",
            purple: "text-purple-600 bg-purple-50 border-purple-200",
            red: "text-red-600 bg-red-50 border-red-200",
            emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
        }

        return (
            <div className={`flex items-center justify-between p-3.5 rounded-xl border ${colorClasses[color]} transition-all`}>
                <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                        {icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <span className={`text-base font-bold ${colorClasses[color].split(" ")[0]}`}>
                    {value}
                </span>
            </div>
        )
    }
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                    <div className={`w-9 h-9 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center`}>
                        <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Summary</h2>
                </div>

                {/* Better spaced summary cards */}
                <div className="space-y-3">
                    <SummaryCard label="Players Retained" value={`${totalPlayers}/6`} color="yellow" icon={<Users className="w-3.5 h-3.5" />} />
                    <SummaryCard label="Total Spent" value={`₹${totalAmount}cr`} color="green" icon={<TrendingUp className="w-3.5 h-3.5" />} />
                    <SummaryCard label="Auction Purse" value={`₹${remainingPurse}cr`} color="orange" icon={<DollarSign className="w-3.5 h-3.5" />} />
                    <SummaryCard label="Capped Players" value={`${cappedCount}/5`} color="blue" icon={<Award className="w-3.5 h-3.5" />} />
                    <SummaryCard label="Uncapped Players" value={`${uncappedCount}/2`} color="emerald" icon={<Star className="w-3.5 h-3.5" />} />
                    <SummaryCard label="Overseas Players" value={`${overseasCount}/4`} color="purple" icon={<Shield className="w-3.5 h-3.5" />} />
                </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Auction Rules</h2>
                </div>

                {/* Better rule cards */}
                <div className="space-y-3">
                    {rules.map((rule, index) => (
                        <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100 transition-all">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                                    {rule.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-800 mb-1">{rule.title}</h3>
                                    <p className="text-xs text-gray-600 leading-relaxed">{rule.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Sidebar