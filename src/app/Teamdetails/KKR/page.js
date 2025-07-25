"use client"
import PlayerCards from "../PlayerCards"
import Sidebar from "../Sidebar"
import Header from "../Header"
const KKRRetentions2025 = () => {
  const selectedPlayers = [
    { name: "Rinku Singh", type: "capped", amount: 13, category: "Batsman", role: "Finisher" },
    { name: "Varun Chakravarthy", type: "capped", amount: 12, category: "Spin Bowler", role: "Mystery Spinner" },
    { name: "Sunil Narine", type: "capped", amount: 12, category: "All‑Rounder", role: "Powerplay Specialist" },
    { name: "Andre Russell", type: "capped", amount: 12, category: "All‑Rounder", role: "Game Changer" },
    { name: "Harshit Rana", type: "uncapped", amount: 4, category: "Fast Bowler", role: "Emerging Paceman" },
    { name: "Ramandeep Singh", type: "uncapped", amount: 4, category: "All‑Rounder", role: "Bench Strength" },
  ];

  const totalAmount = selectedPlayers.reduce((sum, player) => sum + player.amount, 0)
  const totalPlayers = selectedPlayers.length
  const cappedCount = selectedPlayers.filter((p) => p.type === "capped").length
  const uncappedCount = selectedPlayers.filter((p) => p.type === "uncapped").length
  const overseasCount = selectedPlayers.filter((p) => p.type === "overseas").length
  const remainingPurse = 120 - totalAmount


  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto">
        <Header team="Kolkata Knight Riders" captain="To be announced" />

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
              team={"Kolkata Knight Riders"}
            />
          </div>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <PlayerCards selectedPlayers={selectedPlayers} team="Kolkata Knight Riders" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default KKRRetentions2025