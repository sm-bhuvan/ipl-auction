import Link from "next/link"

const NAVBAR = () => {
  return (
    <>
       <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-8 flex items-center h-16">
    {/* Logo */}
    <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
      IPL AUCTION 2025
    </div>

    {/* Spacer */}
    <div className="flex-1"></div>
  </div>
</nav>
    </>
  );
};

export default NAVBAR;
