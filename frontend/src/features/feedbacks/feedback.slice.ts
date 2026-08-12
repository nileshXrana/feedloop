import { createSlice } from '@reduxjs/toolkit';


export const userSlice = createSlice({
    name: 'feedbacks',
    initialState: {
        feedbacks: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder

    }
});

export default userSlice.reducer;