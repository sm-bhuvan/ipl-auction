import { createSlice } from '@reduxjs/toolkit';

export const Rooms = createSlice({
    name: 'rooms',
    initialState: {
        value: []
    },
    reducers: {
        add: (state, action) => {
            state.value.push(action.payload);
        },
        remove: (state, action) => {
            state.value = state.value.filter((room) => room.code !== action.payload);
        },
        removeall: (state) => {
            state.value = [];
        }
    }
});

export const { add, remove, removeall } = Rooms.actions;

export default Rooms.reducer;