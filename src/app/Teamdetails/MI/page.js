"use client"
import PlayerCards from "../PlayerCards"
import Sidebar from "../Sidebar"
import Header from "../Header"
const MIRetentions2025 = () => {
  const selectedPlayers = [
    { name: "Jasprit Bumrah", type: "capped", amount: 18, category: "Fast Bowler", role: "Strike Bowler" },
    { name: "Suryakumar Yadav", type: "capped", amount: 16.35, category: "Batsman", role: "Vice-Captain" },
    { name: "Hardik Pandya", type: "capped", amount: 16.35, category: "All-Rounder", role: "Captain" },
    { name: "Rohit Sharma", type: "capped", amount: 16.3, category: "Batsman", role: "Mentor" },
    { name: "Tilak Varma", type: "capped", amount: 8, category: "Batsman", role: "Core Player" }
  ];

  const totalAmount = selectedPlayers.reduce((sum, player) => sum + player.amount, 0)
  const totalPlayers = selectedPlayers.length
  const cappedCount = selectedPlayers.filter((p) => p.type === "capped").length
  const uncappedCount = selectedPlayers.filter((p) => p.type === "uncapped").length
  const overseasCount = selectedPlayers.filter((p) => p.type === "overseas").length
  const remainingPurse = 120 - totalAmount


  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-blue-100 via-blue-50 to-sky-100">
      <div className="max-w-7xl mx-auto">
        <Header team="Mumbai Indians" captain="Hardik Pandya" />

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
              team={"Mumbai Indians"}
            />
          </div>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <PlayerCards selectedPlayers={selectedPlayers} team="Mumbai Indians" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MIRetentions2025