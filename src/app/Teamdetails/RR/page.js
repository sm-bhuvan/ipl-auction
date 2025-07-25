"use client"
import PlayerCards from "../PlayerCards"
import Sidebar from "../Sidebar"
import Header from "../Header"
const RRRetentions2025 = () => {
  const selectedPlayers = [
    { name: "Sanju Samson", type: "capped", amount: 18, category: "Wicket-Keeper", role: "Captain" },
    { name: "Yashasvi Jaiswal", type: "capped", amount: 18, category: "Batsman", role: "Opener" },
    { name: "Riyan Parag", type: "capped", amount: 14, category: "All-Rounder", role: "Finisher" },
    { name: "Dhruv Jurel", type: "uncapped", amount: 14, category: "Wicket-Keeper", role: "Wicket-Keeper" },
    { name: "Shimron Hetmyer", type: "overseas", amount: 11, category: "Batsman", role: "Middle Order" },
    { name: "Sandeep Sharma", type: "uncapped", amount: 4, category: "Fast Bowler", role: "Death Bowler" }
  ];

  const totalAmount = selectedPlayers.reduce((sum, player) => sum + player.amount, 0)
  const totalPlayers = selectedPlayers.length
  const cappedCount = selectedPlayers.filter((p) => p.type === "capped").length
  const uncappedCount = selectedPlayers.filter((p) => p.type === "uncapped").length
  const overseasCount = selectedPlayers.filter((p) => p.type === "overseas").length
  const remainingPurse = 120 - totalAmount


  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-pink-100 via-rose-50 to-blue-100">
      <div className="max-w-7xl mx-auto">
        <Header team="Rajasthan Royals" captain="Sanju Samson" />

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
              team={"Rajasthan Royals"}
            />
          </div>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <PlayerCards selectedPlayers={selectedPlayers} team="Rajasthan Royals" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RRRetentions2025