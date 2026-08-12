import { createAsyncThunk } from '@reduxjs/toolkit';
import { feedbackFormData } from './feedback.type';
import { saveUserFeedback } from '@/services/user.service';
import { getUserFeedbacks } from '@/services/user.service';

export const saveFeedbackThunk = createAsyncThunk(
    'feedback/saveFeedback',
    async (feedback: feedbackFormData, { rejectWithValue }) => {
        try {
            const res = await saveUserFeedback(feedback);
            return res;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error;
            return rejectWithValue(message);
        }
    }
);

export const getUserFeedbacksThunk = createAsyncThunk(
    'feedback/getUserFeedbacks',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getUserFeedbacks();
            return res;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error;
            return rejectWithValue(message);
        }
    }
);