import Link from "next/link"

const NAVBAR = () => {
  return (
    <>
       <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-8 flex items-center h-16">
    {/* Logo */}
    <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
      IPL AUCTION
    </div>

    {/* Spacer */}
    <div className="flex-1"></div>

    {/* Buttons */}
    <div className="flex space-x-4">
      <button className="border border-orange-400 text-orange-400 px-4 py-2 rounded hover:bg-orange-400 hover:text-black">
        <Link href="/auth/login">Login</Link>
      </button>
      <button className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded hover:from-orange-600 hover:to-red-600">
        <Link href="auth/signup"> Register</Link>
      </button>
    </div>
  </div>
</nav>
    </>
  );
};

export default NAVBAR;
