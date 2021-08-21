import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export const SidePaneSlice = createSlice({
  name: 'sidebar',
  initialState: {
    value: 'directory',
  },
  reducers: {
    changeSidePane: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { changeSidePane } = SidePaneSlice.actions;

export default SidePaneSlice.reducer;

export const SidePane = (state: RootState) => state.sidebar.value;
