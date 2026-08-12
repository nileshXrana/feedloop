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
  Checkbox,
  Typography,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import styles from './signup.module.css';

import { useAppDispatch } from '@/store';
import { registerThunk } from '@/features/users/user.action';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// types 
import { signupFormData } from '@/features/users/user.type';

const signupSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});


export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<signupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
    }
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (user: signupFormData) => {
    setApiError('');
    try {
      await dispatch(registerThunk(user)).unwrap();
      router.push('/login');
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
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {apiError && (
              <Typography className={styles.errorMessage} style={{ marginBottom: '16px', fontWeight: 600 }}>
                {apiError}
              </Typography>
            )}


            <Box>
              <Box className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <OutlinedInput
                  id="email"
                  type="text"
                  {...register('email')}
                  error={!!errors.email}
                  className={styles.input}
                />
                {errors.email && (
                  <Typography className={styles.errorMessage}>
                    {errors.email.message}
                  </Typography>
                )}
              </Box>

              <Box className={styles.inputGroup}>
                <label htmlFor="username" className={styles.label}>
                  Username
                </label>
                <OutlinedInput
                  id="username"
                  type="text"
                  {...register('username')}
                  error={!!errors.username}
                  className={styles.input}
                />
                {errors.username && (
                  <Typography className={styles.errorMessage}>
                    {errors.username.message}
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
                      <Button onClick={handleTogglePassword} className={styles.showHideBtn}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </Button>
                    </InputAdornment>
                  }
                />
                {errors.password && (
                  <Typography className={styles.errorMessage}>
                    {errors.password.message}
                  </Typography>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                className={styles.submitButton}
              >
                Agree & Join
              </Button>

              <Box className={styles.divider}>or</Box>


              <Typography className={styles.signinText}>
                Already A User?{' '}
                <Link href="/login" className={styles.link}>
                  Log In
                </Link>
              </Typography>
            </Box>

          </form>
        </Box>

      </main>


    </Box>
  );
}
