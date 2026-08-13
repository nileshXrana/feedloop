"use client";

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAppDispatch, useAppSelector } from '@/store';
import { getUserThunk, logoutThunk } from '@/features/users/user.action';
import { useRouter } from 'next/navigation';

export default function PrimarySearchAppBar() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const user = useAppSelector((state: any) => state.users?.user);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    React.useEffect(() => {
        dispatch(getUserThunk());
    }, [dispatch]);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavigate = (path: string) => {
        router.push(path);
        handleMenuClose();
    };

    const handleLogout = async () => {
        await dispatch(logoutThunk());
        handleMenuClose();
        router.push('/login');
    };

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={() => handleNavigate('/')}>Home</MenuItem>
            {user && user.role === 'admin' ? (
                <MenuItem onClick={() => handleNavigate('/admin')}>Admin Panel</MenuItem>
            ) : (
                <MenuItem onClick={() => handleNavigate('/dashboard')}>Dashboard</MenuItem>
            )}
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ cursor: 'pointer', flexGrow: 1 }}
                        onClick={() => router.push('/')}
                    >
                        Feedloop
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user ? (
                            <>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                    {user.username}
                                </Typography>
                                <IconButton
                                    size="large"
                                    edge="end"
                                    aria-label="account of current user"
                                    aria-controls={menuId}
                                    aria-haspopup="true"
                                    onClick={handleProfileMenuOpen}
                                    color="inherit"
                                >
                                    <AccountCircle />
                                </IconButton>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button color="inherit" onClick={() => router.push('/login')}>Login</Button>
                                <Button color="inherit" onClick={() => router.push('/register')}>Register</Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMenu}
        </Box>
    );
}
