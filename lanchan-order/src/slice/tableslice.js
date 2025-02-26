import { createSlice } from '@reduxjs/toolkit';

const tableSlice = createSlice({
  name: 'table',
  initialState: {
    selectedTable: null,  // Only keep track of the selected table
  },
  reducers: {
    setSelectedTable: (state, action) => {
      state.selectedTable = action.payload;  // Update the selected table
    },
  },
});

export const { setSelectedTable } = tableSlice.actions;
export default tableSlice.reducer;
