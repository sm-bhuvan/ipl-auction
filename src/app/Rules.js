const rules = [
  { title: "Max Squad Size", value: "25 Players", icon: "👥" },
  { title: "Overseas Players", value: "8 Maximum", icon: "🏆" },
  { title: "Minimum Spend", value: "₹50 Crores", icon: "💰" },
  { title: "Maximum Spend", value: "₹90 Crores", icon: "💸" },
]

const Rules = () => {
    return (
        <>
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Auction Rules</h2>
          <div className="grid grid-cols-4 gap-6 mb-10">
            {rules.map((rule, index) => (
              <div key={index} className="bg-white/10 p-6 rounded-lg text-center border border-white/20 hover:scale-105 transition-all">
                <div className="text-4xl mb-3">{rule.icon}</div>
                <div className="font-bold text-lg mb-1">{rule.title}</div>
                <div className="text-orange-300 font-semibold text-xl">{rule.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/10 border border-white/20 p-6 text-center rounded-lg">
            <p className="text-lg">
              <span className="text-orange-400 font-semibold">Special Rule:</span> Each team must pick at least 1 uncapped player
            </p>
          </div>
        </div>
      </section>
        
        </>
    );
};

export default Rules;