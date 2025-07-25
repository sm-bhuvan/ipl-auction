"use client"
import PlayerCards from "../PlayerCards"
import Sidebar from "../Sidebar"
import Header from "../Header"
const CSKRetentions2025 = () => {
  const selectedPlayers = [
    { name: "Ruturaj Gaikwad", type: "capped", amount: 18, category: "Batsman", role: "Captain" },
    { name: "Ravindra Jadeja", type: "capped", amount: 18, category: "All-Rounder", role: "Vice-Captain" },
    { name: "Matheesha Pathirana", type: "overseas", amount: 13, category: "Fast Bowler", role: "Strike Bowler" },
    { name: "Shivam Dube", type: "capped", amount: 12, category: "All-Rounder", role: "Finisher" },
    { name: "MS Dhoni", type: "uncapped", amount: 4, category: "Wicket-Keeper", role: "Mentor" },
  ]

  const totalAmount = selectedPlayers.reduce((sum, player) => sum + player.amount, 0)
  const totalPlayers = selectedPlayers.length
  const cappedCount = selectedPlayers.filter((p) => p.type === "capped").length
  const uncappedCount = selectedPlayers.filter((p) => p.type === "uncapped").length
  const overseasCount = selectedPlayers.filter((p) => p.type === "overseas").length
  const remainingPurse = 120 - totalAmount


  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-100">
      <div className="max-w-7xl mx-auto">
        <Header team="Chennai Super Kings" captain="Ruturaj Gaikwad" />

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
              team={"Chennai Super Kings"}
            />
          </div>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <PlayerCards selectedPlayers={selectedPlayers} team="Chennai Super Kings" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CSKRetentions2025