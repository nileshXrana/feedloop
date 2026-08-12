import axios from 'axios';
import { feedbackFormData } from '@/features/feedbacks/feedback.type';
axios.defaults.withCredentials = true;

// get users
export const getUsers = async () => {
    try {
        const response = await axios.get('http://localhost:8000/users');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// save user feedback
export const saveUserFeedback = async (feedbackData: feedbackFormData) => {
    try {
        const response = await axios.post('http://localhost:8000/users/user/feedback', feedbackData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// get user feedbacks
export const getUserFeedbacks = async () => {
    try {
        const response = await axios.get('http://localhost:8000/users/user/feedbacks');
        return response.data;
    } catch (error) {
        throw error;
    }
};