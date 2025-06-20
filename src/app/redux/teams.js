import { createSlice } from '@reduxjs/toolkit';

const teamsavl = [
    { name: "Mumbai Indians", code: "MI", color: "from-blue-600 to-blue-800" },
    { name: "Chennai Super Kings", code: "CSK", color: "from-yellow-500 to-yellow-600"},
    { name: "Royal Challengers Bangalore", code: "RCB", color: "from-red-600 to-red-800"},
    { name: "Kolkata Knight Riders", code: "KKR", color: "from-purple-600 to-purple-800" },
    { name: "Delhi Capitals", code: "DC", color: "from-blue-500 to-red-500" },
    { name: "Punjab Kings", code: "PBKS", color: "from-red-500 to-yellow-500"},
    { name: "Rajasthan Royals", code: "RR", color: "from-pink-500 to-blue-500"},
    { name: "Sunrisers Hyderabad", code: "SRH", color: "from-orange-500 to-red-600"},
];

// Helper function to ensure serializable data
const sanitizeTeam = (team) => ({
    name: String(team.name || ''),
    code: String(team.code || ''),
    color: String(team.color || '')
});

export const Teams = createSlice({
    name: 'teams',
    initialState: {
        value: [] // Ensure this is always an array
    },
    reducers: {
        addroom: (state, action) => {
            if (!state.value) {
                state.value = [];
            }
            
            const roomcode = String(action.payload || ''); 
            const existingRoom = state.value.find(room => room.code === roomcode);
            if (existingRoom) {
                console.log(`Room ${roomcode} already exists`);
                return;
            }
            
            const teamsCopy = teamsavl.map(sanitizeTeam); // Sanitize each team
            
            state.value.push({ 
                code: roomcode, 
                teams: teamsCopy 
            });
        },
        remove: (state, action) => {
            // Defensive check
            if (!state.value) {
                state.value = [];
                return;
            }
            
            const { roomCode, teamCode } = action.payload || {};
            
            if (!roomCode || !teamCode) {
                console.error('Missing roomCode or teamCode in remove action');
                return;
            }
            
            state.value = state.value.map((room) => {
                if (room.code === String(roomCode)) {
                    return {
                        ...room,
                        teams: (room.teams || []).filter((team) => team.code !== String(teamCode))
                    };
                }
                return room;
            });
        },
        addteam: (state, action) => {
            if (!state.value) {
                state.value = [];
                return;
            }
            
            const { roomCode, team } = action.payload || {};
            
            if (!roomCode || !team) {
                console.error('Missing roomCode or team in addteam action');
                return;
            }
            
            state.value = state.value.map((room) => {
                if (room.code === String(roomCode)) {
                    return {
                        ...room,
                        teams: [...(room.teams || []), sanitizeTeam(team)]
                    };
                }
                return room;
            });
        },
        resetTeams: (state) => {
            state.value = [];
        }
    }
});

export const { addroom, remove, addteam, resetTeams } = Teams.actions;

export default Teams.reducer;