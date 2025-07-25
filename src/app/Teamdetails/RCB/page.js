"use client"
import PlayerCards from "../PlayerCards"
import Sidebar from "../Sidebar"
import Header from "../Header"
const RCBRetentions2025 = () => {
  const selectedPlayers = [
    { name: "Virat Kohli", type: "capped", amount: 21, category: "Batsman", role: "Icon Player" },
    { name: "Rajat Patidar", type: "capped", amount: 11, category: "Batsman", role: "Emerging Player" },
    { name: "Yash Dayal", type: "uncapped", amount: 5, category: "Fast Bowler", role: "Support Bowler" }
  ];

  const totalAmount = selectedPlayers.reduce((sum, player) => sum + player.amount, 0)
  const totalPlayers = selectedPlayers.length
  const cappedCount = selectedPlayers.filter((p) => p.type === "capped").length
  const uncappedCount = selectedPlayers.filter((p) => p.type === "uncapped").length
  const overseasCount = selectedPlayers.filter((p) => p.type === "overseas").length
  const remainingPurse = 120 - totalAmount


  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-red-100 via-red-50 to-rose-100">
      <div className="max-w-7xl mx-auto">
        <Header team="Royal Challengers Bangalore" captain="Rajat Patidar" />

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
              team={"Royal Challengers Bangalore"}
            />
          </div>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <PlayerCards selectedPlayers={selectedPlayers} team="Royal Challengers Bangalore" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RCBRetentions2025