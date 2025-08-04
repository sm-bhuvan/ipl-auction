import React, { useState } from 'react';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';

const IPLSquadsDisplay = ({ squads }) => {
  const [selectedTeam, setSelectedTeam] = useState(Object.keys(squads)[0]);

  const teamColors = {
    MI: 'from-blue-600 to-blue-800',
    CSK: 'from-yellow-500 to-yellow-700',
    RCB: 'from-red-600 to-red-800',
    KKR: 'from-purple-600 to-purple-800',
    DC: 'from-blue-500 to-blue-700',
    PBKS: 'from-red-500 to-red-700',
    RR: 'from-pink-500 to-pink-700',
    SRH: 'from-orange-500 to-orange-700',
    GT: 'from-teal-600 to-teal-800',
    LSG: 'from-cyan-500 to-cyan-700'
  };

  const teamFullNames = {
    MI: 'Mumbai Indians',
    CSK: 'Chennai Super Kings',
    RCB: 'Royal Challengers Bangalore',
    KKR: 'Kolkata Knight Riders',
    DC: 'Delhi Capitals',
    PBKS: 'Punjab Kings',
    RR: 'Rajasthan Royals',
    SRH: 'Sunrisers Hyderabad',
    GT: 'Gujarat Titans',
    LSG: 'Lucknow Super Giants'
  };

  const roleIcons = {
    'Batter': '🏏',
    'Bowler': '⚡',
    'All-Rounder': '🌟',
    'Wicketkeeper-Batter': '🧤',
    'Wicketkeeper': '🥅'
  };

  const teamKeys = Object.keys(squads);
  const currentIndex = teamKeys.indexOf(selectedTeam);

  const navigateTeam = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % teamKeys.length
      : (currentIndex - 1 + teamKeys.length) % teamKeys.length;
    setSelectedTeam(teamKeys[newIndex]);
  };

  const currentTeamData = squads[selectedTeam];
  const totalPlayers = Object.values(currentTeamData).reduce((sum, players) => sum + players.length, 0);
  const overseasCount = Object.values(currentTeamData).flat().filter(player => player.overseas).length;
  const indianCount = totalPlayers - overseasCount;

  const PlayerCard = ({ player, role }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all hover:scale-105 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{roleIcons[role]}</span>
          <div>
            <span className="font-semibold text-white text-lg">{player.name}</span>
            <div className="text-sm text-gray-300">{role}</div>
          </div>
        </div>
        <div className="flex items-center">
          {player.overseas && (
              <span className="text-lg">✈️</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Main Title */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
              IPL MEGA AUCTION 2025
            </h1>
            <p className="text-gray-300">Final Squad Results</p>
          </div>

          {/* Team Navigator */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateTeam('prev')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all backdrop-blur-md text-white"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex-1 mx-4">
              <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                {teamKeys.map((team) => (
                  <button
                    key={team}
                    onClick={() => setSelectedTeam(team)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap border ${
                      selectedTeam === team
                        ? `bg-gradient-to-r ${teamColors[team]} text-white shadow-lg transform scale-105 border-white/30`
                        : 'bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigateTeam('next')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all backdrop-blur-md text-white"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Team Info */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">{teamFullNames[selectedTeam]}</h2>
            <p className="text-gray-300 mt-1">Squad Composition</p>
          </div>
        </div>
      </div>

      {/* Team Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Team Stats */}
        <div className={`bg-gradient-to-r ${teamColors[selectedTeam]} text-white rounded-xl p-6 mb-8 shadow-2xl border border-white/20`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold">{totalPlayers}</div>
              <div className="text-sm opacity-90">Total Players</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold flex items-center justify-center gap-2">
                {indianCount}
              </div>
              <div className="text-sm opacity-90">Indian Players</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold flex items-center justify-center gap-2">
                {overseasCount} <span className="text-lg">✈️</span>
              </div>
              <div className="text-sm opacity-90">Overseas Players</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold">{25 - totalPlayers}</div>
              <div className="text-sm opacity-90">Slots Remaining</div>
            </div>
          </div>
        </div>

        {/* Players by Role */}
        <div className="space-y-8">
          {Object.entries(currentTeamData).map(([role, players]) => {
            if (players.length === 0) return null;
            
            return (
              <div key={role} className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/20">
                  <span className="text-3xl">{roleIcons[role]}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{role}</h3>
                    <p className="text-gray-300">{players.length} player{players.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {players.map((player, index) => (
                    <PlayerCard 
                      key={`${role}-${index}`} 
                      player={player} 
                      role={role} 
                    />
                  ))}
                </div>
              </div>
            );
          })}
          
          {totalPlayers === 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-12 text-center border border-white/20">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-300 mb-2">No Players Yet</h3>
              <p className="text-gray-400">This team has not bought any players in the auction</p>
            </div>
          )}
        </div>
        {/* Back to Auction Button */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg">
            🏆 Auction Complete!
          </div>
          <p className="text-gray-400 mt-2 text-sm">All squads have been finalized for IPL 2025</p>
        </div>
      </div>
    </div>
  );
};

export default IPLSquadsDisplay;