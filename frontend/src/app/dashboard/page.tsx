"use client";

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import styles from './dashboard.module.css';
import { useSelector } from 'react-redux';
import { Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import FormDialog from '@/components/form-dialog';
import { getUserFeedbacksThunk } from '@/features/feedbacks/feedback.action';
import { useAppDispatch } from '@/store';
import { updateFeedbackStatus, deleteFeedback } from '@/services/user.service';
import DeleteIcon from '@mui/icons-material/Delete';

const page = () => {
    const dispatch = useAppDispatch();
    const [feedbacks, setFeedbacks] = useState<any[]>([]);

    const fetchFeedbacks = () => {
        const res = dispatch(getUserFeedbacksThunk());
        res.then((feedbackData) => {
            setFeedbacks(feedbackData.payload || []);
        });
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleStatusChange = async (feedbackId: string, status: 'public' | 'private') => {
        try {
            await updateFeedbackStatus(feedbackId, status);
            fetchFeedbacks();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDelete = async (feedbackId: string) => {
        try {
            await deleteFeedback(feedbackId);
            fetchFeedbacks();
        } catch (error) {
            console.error('Failed to delete feedback', error);
        }
    };

    return (
        <Box className={styles.dashboardContainer}>
            <Box className={styles.header}>
                <Typography variant="h6" component="h1" gutterBottom>
                    All Your Valuable Feedbacks
                </Typography>
                <FormDialog />
            </Box>

            <Box className={styles.feedbackList}>
                {feedbacks.length > 0 ? (
                    feedbacks.map((feedback) => (
                        <Box key={feedback.uuid} className={styles.feedbackItem} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography sx={{ display: 'flex', justifyContent: 'space-between' }} variant="h5">
                                    {feedback.title}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <Select
                                                value={feedback.status}
                                                onChange={(e) => handleStatusChange(feedback.uuid, e.target.value as any)}
                                            >
                                                <MenuItem value="public">PUBLIC</MenuItem>
                                                <MenuItem value="private">PRIVATE</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDelete(feedback.uuid)}
                                        >
                                            Delete
                                        </Button>
                                    </Box>

                                </Typography>
                                <Typography className={styles.description}>
                                    {feedback.description}
                                </Typography>
                                <Typography className={styles.tagContainer} variant="body2">
                                    {feedback.tags.map((tag: any) => (
                                        <span className={styles.tag} key={tag.uuid}>
                                            {tag.content}
                                        </span>
                                    ))}
                                </Typography>
                            </Box>
                        </Box>
                    ))
                ) : (
                    <Typography variant="body1">No feedbacks found.</Typography>
                )}
            </Box>
        </Box>
    );
};

export default page;