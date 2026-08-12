"use client";

import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import styles from './dashboard.module.css'
import { useSelector } from 'react-redux'
import { Button, Typography } from '@mui/material';
import FormDialog from '@/components/form-dialog';
import { getUserFeedbacksThunk } from '@/features/feedbacks/feedback.action';
import { useAppDispatch } from '@/store';

const page = () => {
    const user = useSelector((state: any) => state.users?.user);
    const dispatch = useAppDispatch();
    const [feedbacks, setFeedbacks] = React.useState<any[]>([]);

    useEffect(() => {
        const res = dispatch(getUserFeedbacksThunk());
        res.then((feedbackData) => {
            setFeedbacks(feedbackData.payload);
        });
    }, []);

    return (

        <Box className={styles.dashboardContainer}>
            <Box className={styles.header}>
                <Typography variant="h6" component="h1" gutterBottom>
                    All Your Valueable Feedbacks
                </Typography>
                <FormDialog />
            </Box>

            <Box className={styles.feedbackList}>
                {feedbacks.length > 0 ? (
                    feedbacks.map((feedback) => (
                        <Box key={feedback.uuid} className={styles.feedbackItem}>
                            <Typography variant="h5">{feedback.title}</Typography>
                            <Typography variant="body1">{feedback.description}</Typography>
                            <Typography className={styles.status} variant="body2">{feedback.status}</Typography>
                            <Typography className={styles.tagContainer} variant="body2">{feedback.tags.map((tag: any) =>
                                <span className={styles.tag} key={tag.uuid}>
                                    {tag.content}
                                </span>
                            )}</Typography>
                        </Box>
                    ))
                ) : (
                    <Typography variant="body1">No feedbacks found.</Typography>
                )}
            </Box>
        </Box>

    )
}

export default page