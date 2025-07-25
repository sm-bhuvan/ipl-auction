"use client"
import PlayerCards from "../PlayerCards"
import Sidebar from "../Sidebar"
import Header from "../Header"
const DCRetentions2025 = () => {
  const selectedPlayers = [
    { name: "Axar Patel", type: "capped", amount: 16.5, category: "All-Rounder", role: "Captain" },
    { name: "Kuldeep Yadav", type: "capped", amount: 13.25, category: "Spin Bowler", role: "Strike Bowler" },
    { name: "Tristan Stubbs", type: "overseas", amount: 10, category: "Batsman", role: "Finisher" },
    { name: "Abishek Porel", type: "uncapped", amount: 4, category: "Wicket-Keeper", role: "Keeper" }
  ];

  const totalAmount = selectedPlayers.reduce((sum, player) => sum + player.amount, 0)
  const totalPlayers = selectedPlayers.length
  const cappedCount = selectedPlayers.filter((p) => p.type === "capped").length
  const uncappedCount = selectedPlayers.filter((p) => p.type === "uncapped").length
  const overseasCount = selectedPlayers.filter((p) => p.type === "overseas").length
  const remainingPurse = 120 - totalAmount


  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-blue-50 via-indigo-100 to-red-100">
      <div className="max-w-7xl mx-auto">
        <Header team="Delhi Capitals" captain="Axar Patel" />

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
              team={"Delhi Capitals"}
            />
          </div>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <PlayerCards selectedPlayers={selectedPlayers} team="Delhi Capitals" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DCRetentions2025