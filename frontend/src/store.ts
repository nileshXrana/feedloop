import { configureStore } from '@reduxjs/toolkit'
import userReducer from '@/features/users/user.slice'
import { useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
    reducer: {
        users: userReducer,
    }
})

// 2. Extract the Dispatch and RootState types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 3. Create pre-typed hooks for your components
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();