"use client"
import PlayerCards from "../PlayerCards"
import Sidebar from "../Sidebar"
import Header from "../Header"
const LSGRetentions2025 = () => {
  const selectedPlayers = [
    { name: "Nicholas Pooran", type: "capped", amount: 21, category: "Batsman", role: "Vice-Captain" },
    { name: "Ravi Bishnoi", type: "capped", amount: 11, category: "Spin Bowler", role: "Lead Spinner" },
    { name: "Mayank Yadav", type: "capped", amount: 11, category: "Fast Bowler", role: "Strike Bowler" },
    { name: "Mohsin Khan", type: "uncapped", amount: 4, category: "Fast Bowler", role: "Support Bowler" },
    { name: "Ayush Badoni", type: "uncapped", amount: 4, category: "All‑Rounder", role: "Finisher" }
  ];

  const totalAmount = selectedPlayers.reduce((sum, player) => sum + player.amount, 0)
  const totalPlayers = selectedPlayers.length
  const cappedCount = selectedPlayers.filter((p) => p.type === "capped").length
  const uncappedCount = selectedPlayers.filter((p) => p.type === "uncapped").length
  const overseasCount = selectedPlayers.filter((p) => p.type === "overseas").length
  const remainingPurse = 120 - totalAmount


  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-blue-100 via-sky-50 to-orange-100">
      <div className="max-w-7xl mx-auto">
        <Header team="Lucknow Super Giants" captain="TBA" />

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
              team={"Lucknow Super Giants"}
            />
          </div>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <PlayerCards selectedPlayers={selectedPlayers} team="Lucknow Super Giants" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LSGRetentions2025