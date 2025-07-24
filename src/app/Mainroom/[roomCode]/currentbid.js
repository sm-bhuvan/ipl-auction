// components/CurrentBid.jsx
import React from 'react'

const CurrentBid = ({ current, highestBidder, base }) => {
  // Helper function to format amounts

  return (
    <div className="text-center mb-4">
      <p className="text-gray-300 mb-2">Current Highest Bid</p>
      <p className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        {current}
      </p>
      <p className="text-gray-400 text-sm mt-2">
        Base Price: {base}
      </p>
      {highestBidder && (
        <p className="text-yellow-400 text-sm mt-1">
          Leading: {highestBidder}
        </p>
      )}
    </div>
  );
};

export default CurrentBid;