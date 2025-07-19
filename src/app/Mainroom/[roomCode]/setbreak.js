import React, { useState, useEffect } from 'react';

const SetHistoryComponent = ({ history, nextCategory, onTimerComplete }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsActive(false);
            if (onTimerComplete) {
              onTimerComplete();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimerComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSetStatusIcon = (player) => {
    if (player.status === 'sold') return '✅';
    if (player.status === 'unsold') return '❌';
    return '⏳';
  };

  const getSetStatusColor = (player) => {
    if (player.status === 'sold') return 'text-green-400';
    if (player.status === 'unsold') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getTotalSold = () => {
    return history.filter(player => player.status === 'sold').length;
  };

  const getTotalUnsold = () => {
    return history.filter(player => player.status === 'unsold').length;
  };

  const getTotalValue = () => {
    return history
      .filter(player => player.status === 'sold')
      .reduce((sum, player) => sum + (player.finalPrice || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
            SET COMPLETED
          </h1>
          <p className="text-gray-300 text-lg">Review the auction results</p>
        </div>

        {/* Timer and Next Set Info */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Next Set: <span className="text-orange-400">{nextCategory}</span>
              </h2>
              <p className="text-gray-400">Preparing for the next category of players</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-24 h-24 flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-white">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <p className="text-gray-300 text-sm">Time remaining</p>
            </div>
          </div>
        </div>

        {/* Set Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white">{history.length}</div>
            <div className="text-gray-400 text-sm">Total Players</div>
          </div>
          <div className="bg-green-600/20 border border-green-400/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{getTotalSold()}</div>
            <div className="text-gray-400 text-sm">Sold</div>
          </div>
          <div className="bg-red-600/20 border border-red-400/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{getTotalUnsold()}</div>
            <div className="text-gray-400 text-sm">Unsold</div>
          </div>
          <div className="bg-blue-600/20 border border-blue-400/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">₹{getTotalValue().toFixed(1)} Cr</div>
            <div className="text-gray-400 text-sm">Total Value</div>
          </div>
        </div>

        {/* Player History */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl">
          <div className="p-6 border-b border-white/20">
            <h3 className="text-xl font-bold text-white">Set History</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No players in this set</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {history.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    
                    {/* Player Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {player.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{player.name}</h4>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-400">{player.role}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{player.nationality}</span>
                          {player.previousTeam && (
                            <>
                              <span className="text-gray-500">•</span>
                              <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                                {player.previousTeam}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status and Price */}
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xl">{getSetStatusIcon(player)}</span>
                        <span className={`font-semibold ${getSetStatusColor(player)}`}>
                          {player.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      
                      {player.status === 'sold' ? (
                        <div>
                          <div className="text-green-400 font-bold">₹{player.finalPrice?.toFixed(1)} Cr</div>
                          <div className="text-sm text-gray-400">to {player.buyingTeam}</div>
                        </div>
                      ) : player.status === 'unsold' ? (
                        <div className="text-red-400 text-sm">Base: ₹{player.basePrice?.toFixed(1)} Cr</div>
                      ) : (
                        <div className="text-gray-400 text-sm">Base: ₹{player.basePrice?.toFixed(1)} Cr</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetHistoryComponent;