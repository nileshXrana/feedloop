import { createAsyncThunk } from '@reduxjs/toolkit';
import { login, register, logout } from '@/services/auth.service';
import { loginFormData, signupFormData } from './user.type';

export const loginThunk = createAsyncThunk(
    'auth/login',
    async (user: loginFormData, { rejectWithValue }) => {
        try {
            const res = await login(user);
            if (res?.error) {
                return rejectWithValue(res.error);
            }
            return res;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error;
            return rejectWithValue(message);
        }
    }
);

export const registerThunk = createAsyncThunk(
    'auth/register',
    async (user: signupFormData, { rejectWithValue }) => {
        try {
            const res = await register(user);
            if (res?.error) {
                return rejectWithValue(res.error);
            }
            return res;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error;
            return rejectWithValue(message);
        }
    }
);

export const logoutThunk = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const res = await logout();
            if (res?.error) {
                return rejectWithValue(res.error);
            }
            return res;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error;
            return rejectWithValue(message);
        }
    }
);