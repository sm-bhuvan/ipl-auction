import Link from "next/link";
const Welcome = () => {
    return (
        <>
      <section className="relative min-h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-red-600/20 to-blue-600/20" />
        <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
          <div className="mb-6 inline-block bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 text-lg rounded text-white font-medium">MEGA AUCTION 2025</div>
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Welcome to the{" "}
            <span className="block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              IPL Mega Auction
            </span>
          </h1>
          <p className="text-2xl text-gray-300 mb-8 font-medium">Bid. Build. Battle.</p>
          <Link href={"/dashboard"}>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            Start Bidding
          </button>
          </Link>
        </div>
      </section>
        
        </>

    );
};
 
export default Welcome;