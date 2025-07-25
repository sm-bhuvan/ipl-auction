"use client"
import PlayerCards from "../PlayerCards"
import Sidebar from "../Sidebar"
import Header from "../Header"
const GTRetentions2025 = () => {
  const selectedPlayers = [
    { name: "Shubman Gill", type: "capped", amount: 16.5, category: "Batsman", role: "Captain" },
    { name: "Rashid Khan", type: "overseas", amount: 18, category: "All-Rounder", role: "Vice-Captain" },
    { name: "Sai Sudharsan", type: "capped", amount: 8.5, category: "Batsman", role: "Top Order" },
    { name: "Rahul Tewatia", type: "uncapped", amount: 4, category: "All-Rounder", role: "Finisher" },
    { name: "Shahrukh Khan", type: "uncapped", amount: 4, category: "All-Rounder", role: "Middle Order" },
  ]

  const totalAmount = selectedPlayers.reduce((sum, player) => sum + player.amount, 0)
  const totalPlayers = selectedPlayers.length
  const cappedCount = selectedPlayers.filter((p) => p.type === "capped").length
  const uncappedCount = selectedPlayers.filter((p) => p.type === "uncapped").length
  const overseasCount = selectedPlayers.filter((p) => p.type === "overseas").length
  const remainingPurse = 120 - totalAmount


  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-slate-100 via-gray-50 to-yellow-100">
      <div className="max-w-7xl mx-auto">
        <Header team="Gujarat Titans" captain="Shubman Gill" />

        {/* Improved grid layout with responsive stacking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-4 order-2 lg:order-1">
            <Sidebar
              totalPlayers={totalPlayers}
              totalAmount={totalAmount}
              cappedCount={cappedCount}
              uncappedCount={uncappedCount}
              overseasCount={overseasCount}
              remainingPurse={remainingPurse}
              team={"Gujarat Titans"}
            />
          </div>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <PlayerCards selectedPlayers={selectedPlayers} team="Gujarat Titans" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GTRetentions2025