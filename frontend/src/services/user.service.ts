import axios from 'axios';
import { feedbackFormData } from '@/features/feedbacks/feedback.type';

axios.defaults.withCredentials = true;

export const getUsers = async () => {
    try {
        const response = await axios.get('http://localhost:8000/users');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUniqueTags = async () => {
    try {
        const response = await axios.get('http://localhost:8000/users/tags');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const saveUserFeedback = async (feedbackData: feedbackFormData) => {
    try {
        const response = await axios.post('http://localhost:8000/users/user/feedback', feedbackData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserFeedbacks = async () => {
    try {
        const response = await axios.get('http://localhost:8000/users/user/feedbacks');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllFeedbacks = async (filters: any = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.sortByScore) params.append('sortByScore', filters.sortByScore);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.tags) {
            const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
            tags.forEach((t: any) => params.append('tags', t));
        }
        if (filters.authors) {
            const authors = Array.isArray(filters.authors) ? filters.authors : [filters.authors];
            authors.forEach((a: any) => params.append('authors', a));
        }
        const response = await axios.get(`http://localhost:8000/users/feedbacks/all?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const voteFeedback = async (feedbackId: string, type: 'upvote' | 'downvote') => {
    try {
        const response = await axios.post(`http://localhost:8000/users/feedback/${feedbackId}/vote`, { type });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addComment = async (feedbackId: string, content: string, parentCommentId?: string) => {
    try {
        const response = await axios.post(`http://localhost:8000/users/feedback/${feedbackId}/comment`, { content, parentCommentId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getComments = async (feedbackId: string, showDeletedComments = false) => {
    try {
        const response = await axios.get(`http://localhost:8000/users/feedback/${feedbackId}/comments?showDeletedComments=${showDeletedComments}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteComment = async (commentId: string) => {
    try {
        const response = await axios.delete(`http://localhost:8000/users/comment/${commentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteFeedback = async (feedbackId: string) => {
    try {
        const response = await axios.delete(`http://localhost:8000/users/feedback/${feedbackId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateFeedbackStatus = async (feedbackId: string, status: 'public' | 'private') => {
    try {
        const response = await axios.patch(`http://localhost:8000/users/feedback/${feedbackId}/status`, { status });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAdminFeedbacks = async (filters: any = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.sortByScore) params.append('sortByScore', filters.sortByScore);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.showDeleted) params.append('showDeleted', filters.showDeleted.toString());
        if (filters.tags) {
            const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
            tags.forEach((t: any) => params.append('tags', t));
        }
        if (filters.authors) {
            const authors = Array.isArray(filters.authors) ? filters.authors : [filters.authors];
            authors.forEach((a: any) => params.append('authors', a));
        }
        const response = await axios.get(`http://localhost:8000/users/admin/feedbacks?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAdminUsers = async (page = 1, limit = 10) => {
    try {
        const response = await axios.get(`http://localhost:8000/users/admin/users?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const toggleUserActive = async (userId: string) => {
    try {
        const response = await axios.post(`http://localhost:8000/users/admin/toggle-login/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const toggleUserFeedbacksHidden = async (userId: string) => {
    try {
        const response = await axios.post(`http://localhost:8000/users/admin/toggle-feedbacks/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const toggleUserCommentsHidden = async (userId: string) => {
    try {
        const response = await axios.post(`http://localhost:8000/users/admin/toggle-comments/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};