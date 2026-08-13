import { createSlice } from '@reduxjs/toolkit';
import { loginThunk, registerThunk, logoutThunk, getUserThunk } from './user.action';
import { userState } from './user.type';

export const userSlice = createSlice({
  name: 'users',
  initialState: {
    user: null,
    loading: false,
    error: null,
  } as userState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
      })
  }
});

export default userSlice.reducer;