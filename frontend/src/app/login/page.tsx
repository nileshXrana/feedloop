'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Typography,
  OutlinedInput,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import styles from './login.module.css';

import { useAppDispatch } from '@/store';
import { loginThunk } from '@/features/users/user.action';

// types
import { loginFormData } from '@/features/users/user.type';

const loginSchema = z.object({
  emailOrUsername: z.string().min(3, 'Email or Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});


export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<loginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    }
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: loginFormData) => {
    setApiError('');
    try {
      const loggedInUser = await dispatch(loginThunk(data)).unwrap();
      if (loggedInUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setApiError(err);
    }
  };

  return (
    <Box className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Feedloop
        </Link>
      </header>

      <main className={styles.main}>
        <Box className={styles.card}>
          <Typography component="h1" className={styles.title}>
            Sign in
          </Typography>
          <Typography className={styles.subtitle}>
            New to App?{' '}
            <Link href="/register" className={styles.link}>
              Register now
            </Link>
          </Typography>



          <Box className={styles.divider}>or</Box>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {apiError && (
              <Typography className={styles.errorMessage} style={{ marginBottom: '16px', fontWeight: 600 }}>
                {apiError}
              </Typography>
            )}

            <Box className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email or username
              </label>
              <OutlinedInput
                id="email"
                type="text"
                {...register('emailOrUsername')}
                error={!!errors.emailOrUsername}
                className={styles.input}
              />
              {errors.emailOrUsername && (
                <Typography className={styles.errorMessage}>
                  {errors.emailOrUsername.message}
                </Typography>
              )}
            </Box>

            <Box className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <OutlinedInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                className={styles.input}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.password && (
                <Typography className={styles.errorMessage}>
                  {errors.password.message}
                </Typography>
              )}
            </Box>


            <Button type="submit" variant="contained" className={styles.submitButton}>
              Sign in
            </Button>
          </form>
        </Box>
      </main>


    </Box>
  );
}
