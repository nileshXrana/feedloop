"use client";

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import styles from './admin.module.css';
import { useAppSelector } from '@/store';
import { useRouter } from 'next/navigation';
import {
    Tabs,
    Tab,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Autocomplete,
    FormControlLabel,
    Checkbox,
    Pagination,
} from '@mui/material';
import {
    getAdminFeedbacks,
    getAdminUsers,
    toggleUserActive,
    toggleUserFeedbacksHidden,
    toggleUserCommentsHidden,
    getUniqueTags,
    getUsers,
    getComments,
    deleteComment,
} from '@/services/user.service';

interface CommentNodeProps {
    comment: any;
    onDeleteComment: (commentId: string) => void;
}

const CommentNode: React.FC<CommentNodeProps> = ({ comment, onDeleteComment }) => {
    return (
        <Box sx={{ pl: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {comment.user?.username || '[deleted]'}
                </Typography>
                {!comment.isActive && (
                    <span style={{ fontSize: '0.7rem', color: 'red', fontWeight: 'bold' }}>
                        DELETED
                    </span>
                )}
            </Box>
            <Typography variant="body2">{comment.content}</Typography>
            {comment.isActive && (
                <Button
                    size="small"
                    color="error"
                    sx={{ p: 0, textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto' }}
                    onClick={() => onDeleteComment(comment.uuid)}
                >
                    Delete
                </Button>
            )}
            {comment.replies && comment.replies.map((reply: any) => (
                <CommentNode key={reply.uuid} comment={reply} onDeleteComment={onDeleteComment} />
            ))}
        </Box>
    );
};

export default function AdminPage() {
    const router = useRouter();
    const user = useAppSelector((state: any) => state.users?.user);

    const [activeTab, setActiveTab] = useState(0);

    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const [search, setSearch] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
    const [sortByScore, setSortByScore] = useState('');
    const [showDeleted, setShowDeleted] = useState(false);
    const [showDeletedComments, setShowDeletedComments] = useState(false);
    const [feedbacksPage, setFeedbacksPage] = useState(1);
    const [feedbacksLimit] = useState(5);

    const [openCommentsFeedbackId, setOpenCommentsFeedbackId] = useState<string | null>(null);
    const [commentsList, setCommentsList] = useState<any[]>([]);

    const [usersList, setUsersList] = useState<any[]>([]);
    const [usersTotal, setUsersTotal] = useState(0);
    const [usersPage, setUsersPage] = useState(1);
    const [usersLimit] = useState(10);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (user.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [user]);

    const fetchFeedbacks = async () => {
        try {
            const data = await getAdminFeedbacks({
                search,
                tags: selectedTags,
                authors: selectedAuthors,
                sortByScore,
                showDeleted,
                page: feedbacksPage,
                limit: feedbacksLimit,
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

    const fetchUsers = async () => {
        try {
            const data = await getAdminUsers(usersPage, usersLimit);
            setUsersList(data.users || []);
            setUsersTotal(data.total || 0);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchFilters();
        }
    }, [user]);

    useEffect(() => {
        if (user && user.role === 'admin' && activeTab === 0) {
            fetchFeedbacks();
        }
    }, [user, activeTab, search, selectedTags, selectedAuthors, sortByScore, showDeleted, feedbacksPage]);

    useEffect(() => {
        if (user && user.role === 'admin' && activeTab === 1) {
            fetchUsers();
        }
    }, [user, activeTab, usersPage]);

    useEffect(() => {
        if (openCommentsFeedbackId) {
            handleViewComments(openCommentsFeedbackId, true);
        }
    }, [showDeletedComments]);

    const handleViewComments = async (feedbackId: string, forceRefresh = false) => {
        if (openCommentsFeedbackId === feedbackId && !forceRefresh) {
            setOpenCommentsFeedbackId(null);
            setCommentsList([]);
            return;
        }
        setOpenCommentsFeedbackId(feedbackId);
        try {
            const data = await getComments(feedbackId, showDeletedComments);
            setCommentsList(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!openCommentsFeedbackId) return;
        try {
            await deleteComment(commentId);
            const data = await getComments(openCommentsFeedbackId, showDeletedComments);
            setCommentsList(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleActive = async (userId: string) => {
        try {
            await toggleUserActive(userId);
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleFeedbacks = async (userId: string) => {
        try {
            await toggleUserFeedbacksHidden(userId);
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleComments = async (userId: string) => {
        try {
            await toggleUserCommentsHidden(userId);
            fetchUsers();
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

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <Box className={styles.container}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                Admin Panel
            </Typography>

            <Box className={styles.tabs}>
                <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                    <Tab label="Feedbacks" />
                    <Tab label="Users" />
                </Tabs>
            </Box>

            <Box className={styles.tabContent}>
                {activeTab === 0 && (
                    <Box className={styles.feedbackSection}>
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
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showDeleted}
                                        onChange={(e) => setShowDeleted(e.target.checked)}
                                    />
                                }
                                label="Show Deleted Feedbacks"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showDeletedComments}
                                        onChange={(e) => setShowDeletedComments(e.target.checked)}
                                    />
                                }
                                label="Show Deleted Comments"
                            />
                        </Box>

                        <Box className={styles.feedList}>
                            {feedbacks.length > 0 ? (
                                feedbacks.map((feedback) => (
                                    <Box key={feedback.uuid} className={styles.adminCard}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="caption" color="textSecondary">
                                                Posted by @{feedback.user?.username}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {feedback.isActive ? (
                                                    <span className={styles.activeBadge}>Active</span>
                                                ) : (
                                                    <span className={styles.deletedBadge}>Deleted</span>
                                                )}
                                                <span className={styles.activeBadge}>{feedback.status}</span>
                                            </Box>
                                        </Box>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                            {feedback.title}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mt: 1, mb: 1 }}>
                                            {feedback.description}
                                        </Typography>

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleViewComments(feedback.uuid)}
                                        >
                                            View Comments
                                        </Button>

                                        {openCommentsFeedbackId === feedback.uuid && (
                                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                                                {commentTree.length > 0 ? (
                                                    commentTree.map((comment) => (
                                                        <CommentNode
                                                            key={comment.uuid}
                                                            comment={comment}
                                                            onDeleteComment={handleDeleteComment}
                                                        />
                                                    ))
                                                ) : (
                                                    <Typography variant="body2" color="textSecondary">
                                                        No comments.
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body1">No feedbacks found.</Typography>
                            )}

                            <Box className={styles.paginationContainer}>
                                <Pagination
                                    count={10}
                                    page={feedbacksPage}
                                    onChange={(_, val) => setFeedbacksPage(val)}
                                />
                            </Box>
                        </Box>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box>
                        <Box className={styles.userTableContainer}>
                            <table className={styles.userTable}>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersList.map((usr) => (
                                        <tr key={usr.uuid} className={styles.userRow}>
                                            <td>{usr.username}</td>
                                            <td>{usr.email}</td>
                                            <td>{usr.role.toUpperCase()}</td>
                                            <td>
                                                {usr.isActive ? (
                                                    <span className={styles.activeBadge}>Active</span>
                                                ) : (
                                                    <span className={styles.deletedBadge}>Disabled</span>
                                                )}
                                            </td>
                                            <td className={styles.actionsCell}>
                                                <Button
                                                    variant="contained"
                                                    size="small"

                                                    onClick={() => handleToggleActive(usr.uuid)}
                                                >
                                                    {usr.isActive ? "Disable Login" : "Enable Login"}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleToggleFeedbacks(usr.uuid)}
                                                >
                                                    {usr.feedbacksHidden ? "Show Feedbacks" : "Hide Feedbacks"}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleToggleComments(usr.uuid)}
                                                >
                                                    {usr.commentsHidden ? "Show Comments" : "Hide Comments"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>

                        <Box className={styles.paginationContainer}>
                            <Pagination
                                count={Math.ceil(usersTotal / usersLimit)}
                                page={usersPage}
                                onChange={(_, val) => setUsersPage(val)}
                            />
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
