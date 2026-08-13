"use client";

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import styles from './page.module.css';
import { useAppDispatch, useAppSelector } from '@/store';
import { useRouter } from 'next/navigation';
import {
    TextField,
    Button,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Autocomplete,
    Pagination,
} from '@mui/material';
import ArrowDropUp from '@mui/icons-material/ArrowDropUp';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import {
    getAllFeedbacks,
    getUniqueTags,
    getUsers,
    voteFeedback,
    getComments,
    addComment,
    deleteComment,
} from '@/services/user.service';

interface CommentNodeProps {
    comment: any;
    currentUserId?: string;
    onAddReply: (content: string, parentCommentId: string) => void;
    onDeleteComment: (commentId: string) => void;
}

const CommentNode: React.FC<CommentNodeProps> = ({
    comment,
    currentUserId,
    onAddReply,
    onDeleteComment,
}) => {
    const [replying, setReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const isOwn = currentUserId && comment.userId === currentUserId;

    const handleReplySubmit = () => {
        if (!replyContent.trim()) return;
        onAddReply(replyContent, comment.uuid);
        setReplyContent('');
        setReplying(false);
    };

    return (

        <Box className={`${styles.commentNode} ${isOwn ? styles.ownComment : ''}`}>
            <Box className={styles.commentHeader}>
                <Typography className={styles.commentAuthor} variant="body2">
                    {comment.user?.username || '[deleted]'}
                </Typography>
                <Typography className={styles.commentTime} variant="caption">
                    {new Date(comment.createdAt).toLocaleDateString()}
                </Typography>
            </Box>
            <Typography className={styles.commentContent} variant="body2">
                {comment.content}
            </Typography>
            <Box className={styles.commentActions}>
                {currentUserId && comment.isActive && (
                    <Button
                        className={styles.commentActionBtn}
                        size="small"
                        onClick={() => setReplying(!replying)}
                    >
                        Reply
                    </Button>
                )}
                {isOwn && comment.isActive && (
                    <Button
                        className={styles.commentActionBtn}
                        size="small"
                        color="error"
                        onClick={() => onDeleteComment(comment.uuid)}
                    >
                        Delete
                    </Button>
                )}
            </Box>
            {replying && (
                <Box className={styles.replyForm}>
                    <TextField
                        size="small"
                        fullWidth
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                    />
                    <Button variant="contained" size="small" onClick={handleReplySubmit}>
                        Submit
                    </Button>
                </Box>
            )}
            {comment.replies && comment.replies.map((reply: any) => (
                <CommentNode
                    key={reply.uuid}
                    comment={reply}
                    currentUserId={currentUserId}
                    onAddReply={onAddReply}
                    onDeleteComment={onDeleteComment}
                />
            ))}
        </Box>
    );
};

export default function Home() {
    const router = useRouter();
    const user = useAppSelector((state: any) => state.users?.user);

    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const [search, setSearch] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
    const [sortByScore, setSortByScore] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(5);

    const [openCommentsFeedbackId, setOpenCommentsFeedbackId] = useState<string | null>(null);
    const [commentsList, setCommentsList] = useState<any[]>([]);
    const [newCommentContent, setNewCommentContent] = useState('');

    const fetchFeedbacks = async () => {
        try {
            const data = await getAllFeedbacks({
                search,
                tags: selectedTags,
                authors: selectedAuthors,
                sortByScore,
                page,
                limit,
            });
            setFeedbacks(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchFilters = async () => {
        try {
            const tagsData = await getUniqueTags();
            setAllTags(tagsData);
            const usersData = await getUsers();
            setAllUsers(usersData);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchFeedbacks();
    }, [search, selectedTags, selectedAuthors, sortByScore, page]);

    const handleVote = async (feedbackId: string, type: 'upvote' | 'downvote') => {
        if (!user) {
            router.push('/login');
            return;
        }
        try {
            const res = await voteFeedback(feedbackId, type);
            setFeedbacks(prev =>
                prev.map(f =>
                    f.uuid === feedbackId ? { ...f, score: res.score, userVote: res.userVote } : f
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleViewComments = async (feedbackId: string) => {
        if (openCommentsFeedbackId === feedbackId) {
            setOpenCommentsFeedbackId(null);
            setCommentsList([]);
            return;
        }
        setOpenCommentsFeedbackId(feedbackId);
        try {
            const data = await getComments(feedbackId);
            setCommentsList(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddCommentClick = (feedbackId: string) => {
        if (!user) {
            router.push('/login');
            return;
        }
        handleViewComments(feedbackId);
    };

    const handlePostComment = async (feedbackId: string) => {
        if (!newCommentContent.trim()) return;
        try {
            await addComment(feedbackId, newCommentContent);
            setNewCommentContent('');
            const data = await getComments(feedbackId);
            setCommentsList(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostReply = async (content: string, parentCommentId: string) => {
        if (!openCommentsFeedbackId) return;
        try {
            await addComment(openCommentsFeedbackId, content, parentCommentId);
            const data = await getComments(openCommentsFeedbackId);
            setCommentsList(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!openCommentsFeedbackId) return;
        try {
            await deleteComment(commentId);
            const data = await getComments(openCommentsFeedbackId);
            setCommentsList(data);
        } catch (error) {
            console.error(error);
        }
    };

    const buildCommentTree = (list: any[]) => {
        const map: any = {};
        const roots: any[] = [];
        list.forEach(c => {
            map[c.uuid] = { ...c, replies: [] };
        });
        list.forEach(c => {
            const mapped = map[c.uuid];
            if (c.parentCommentId && map[c.parentCommentId]) {
                map[c.parentCommentId].replies.push(mapped);
            } else {
                roots.push(mapped);
            }
        });
        return roots;
    };

    const commentTree = buildCommentTree(commentsList);

    return (
        <Box className={styles.container}>
            <Box className={styles.filterPanel}>
                <Typography variant="h6">Filters</Typography>
                <TextField
                    label="Search Title / Desc"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Autocomplete
                    multiple
                    size="small"
                    options={allTags}
                    value={selectedTags}
                    onChange={(_, val) => setSelectedTags(val)}
                    renderInput={(params) => <TextField {...params} label="Tags" />}
                />
                <Autocomplete
                    multiple
                    size="small"
                    options={allUsers.map((u) => u.username)}
                    value={selectedAuthors}
                    onChange={(_, val) => setSelectedAuthors(val)}
                    renderInput={(params) => <TextField {...params} label="Authors" />}
                />
                <FormControl size="small">
                    <InputLabel>Sort By Score</InputLabel>
                    <Select
                        value={sortByScore}
                        onChange={(e) => setSortByScore(e.target.value)}
                        label="Sort By Score"
                    >
                        <MenuItem value="">Default</MenuItem>
                        <MenuItem value="desc">High to Low</MenuItem>
                        <MenuItem value="asc">Low to High</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Box className={styles.feedSection}>
                {feedbacks.length > 0 ? (
                    feedbacks.map((feedback) => (
                        <Box key={feedback.uuid} className={styles.feedbackCard}>
                            <Box className={styles.voteSection}>
                                <ArrowDropUp
                                    className={`${styles.voteArrow} ${feedback.userVote === 'upvote' ? styles.voteArrowActive : ''}`}
                                    onClick={() => handleVote(feedback.uuid, 'upvote')}
                                />
                                <Typography className={styles.score}>{feedback.score}</Typography>
                                <ArrowDropDown
                                    className={`${styles.voteArrow} ${feedback.userVote === 'downvote' ? styles.voteArrowActive : ''}`}
                                    onClick={() => handleVote(feedback.uuid, 'downvote')}
                                />
                            </Box>
                            <Box className={styles.cardContent}>
                                <Box className={styles.cardHeader}>
                                    <Typography className={styles.author}>
                                        Posted by @{feedback.user?.username}
                                    </Typography>
                                </Box>
                                <Typography className={styles.title} variant="h5">
                                    {feedback.title}
                                </Typography>
                                <Typography className={styles.description}>
                                    {feedback.description}
                                </Typography>
                                <Box className={styles.tagContainer}>
                                    {feedback.tags?.map((tag: any) => (
                                        <span className={styles.tag} key={tag.uuid}>
                                            {tag.content}
                                        </span>
                                    ))}
                                </Box>
                                <Box className={styles.cardFooter}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleViewComments(feedback.uuid)}
                                    >
                                        View Comments
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleAddCommentClick(feedback.uuid)}
                                    >
                                        Add Comment
                                    </Button>
                                </Box>

                                {openCommentsFeedbackId === feedback.uuid && (
                                    <Box className={styles.commentsSection}>
                                        {user && (
                                            <Box className={styles.commentForm}>
                                                <TextField
                                                    className={styles.commentInput}
                                                    label="Write a comment..."
                                                    multiline
                                                    rows={2}
                                                    value={newCommentContent}
                                                    onChange={(e) => setNewCommentContent(e.target.value)}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handlePostComment(feedback.uuid)}
                                                    sx={{ alignSelf: 'flex-end' }}
                                                >
                                                    Post Comment
                                                </Button>
                                            </Box>
                                        )}
                                        <Box className={styles.commentTree}>
                                            {commentTree.length > 0 ? (
                                                commentTree.map((comment) => (
                                                    <CommentNode
                                                        key={comment.uuid}
                                                        comment={comment}
                                                        currentUserId={user?.uuid}
                                                        onAddReply={handlePostReply}
                                                        onDeleteComment={handleDeleteComment}
                                                    />
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">
                                                    No comments yet.
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ))
                ) : (
                    <Typography variant="body1">No feedbacks found.</Typography>
                )}

            </Box>
            <Box className={styles.paginationContainer}>
                <Pagination
                    count={10}
                    page={page}
                    onChange={(_, val) => setPage(val)}
                />
            </Box>
        </Box>
    );
}
