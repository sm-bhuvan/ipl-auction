"use client"
import PlayerCards from "../PlayerCards"
import Sidebar from "../Sidebar"
import Header from "../Header"
const SRHRetentions2025 = () => {
  const selectedPlayers = [
    { name: "Heinrich Klaasen", type: "overseas", amount: 12, category: "Wicket-Keeper", role: "Finisher" },
    { name: "Pat Cummins", type: "overseas", amount: 15, category: "All-Rounder", role: "Captain" },
    { name: "Travis Head", type: "overseas", amount: 10, category: "Batsman", role: "Opener" },
    { name: "Abhishek Sharma", type: "capped", amount: 8, category: "All-Rounder", role: "Top Order" },
    { name: "Nitish Kumar Reddy", type: "uncapped", amount: 4, category: "All-Rounder", role: "Emerging Player" }
  ];

  const totalAmount = selectedPlayers.reduce((sum, player) => sum + player.amount, 0)
  const totalPlayers = selectedPlayers.length
  const cappedCount = selectedPlayers.filter((p) => p.type === "capped").length
  const uncappedCount = selectedPlayers.filter((p) => p.type === "uncapped").length
  const overseasCount = selectedPlayers.filter((p) => p.type === "overseas").length
  const remainingPurse = 120 - totalAmount


  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-orange-100 via-orange-50 to-red-100">
      <div className="max-w-7xl mx-auto">
        <Header team="Sunrisers Hyderabad" captain="Pat Cummins" />

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
              team={"Sunrisers Hyderabad"}
            />
          </div>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <PlayerCards selectedPlayers={selectedPlayers} team="Sunrisers Hyderabad" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SRHRetentions2025