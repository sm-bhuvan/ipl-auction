const Footer = () => {
  return (
    <>
      <footer className="bg-black/40 border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-4">
            IPL AUCTION
          </div>
          <p className="text-gray-400 max-w-xl mx-auto">
            The ultimate cricket auction experience. Build your dream team and compete for glory.
          </p>
        </div>

        <div className="text-center border-t border-white/10 mt-8 pt-8 text-gray-400">
          © 2025 IPL Auction. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default Footer;
