const teams = [
  { name: "Mumbai Indians", code: "MI", color: "from-blue-600 to-blue-800", logo: "🏏" },
  { name: "Chennai Super Kings", code: "CSK", color: "from-yellow-500 to-yellow-600", logo: "🦁" },
  { name: "Royal Challengers Bangalore", code: "RCB", color: "from-red-600 to-red-800", logo: "👑" },
  { name: "Kolkata Knight Riders", code: "KKR", color: "from-purple-600 to-purple-800", logo: "⚔️" },
  { name: "Delhi Capitals", code: "DC", color: "from-blue-500 to-red-500", logo: "🏛️" },
  { name: "Punjab Kings", code: "PBKS", color: "from-red-500 to-yellow-500", logo: "👑" },
  { name: "Rajasthan Royals", code: "RR", color: "from-pink-500 to-blue-500", logo: "👑" },
  { name: "Sunrisers Hyderabad", code: "SRH", color: "from-orange-500 to-red-600", logo: "☀️" },
]

const Teams = () => {
    return (
        <>
        <section className="py-20 px-8 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Featured Teams</h2>
          <div className="grid grid-cols-4 gap-6">
            {teams.map((team, i) => (
              <div key={i} className="bg-white/10 p-6 text-center rounded-lg hover:scale-105 transition-all border border-white/20">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${team.color} flex items-center justify-center text-2xl mx-auto mb-4`}>
                  {team.logo}
                </div>
                <h3 className="font-bold text-lg mb-1">{team.code}</h3>
                <p className="text-gray-300 text-sm">{team.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
        
        </>

    );
};

export default Teams;
