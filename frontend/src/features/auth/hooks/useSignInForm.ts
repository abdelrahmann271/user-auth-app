import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { FormErrors } from '../../../shared/types';
import type { AxiosError } from 'axios';

interface ApiError {
  message: string | string[];
}

export function useSignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = useCallback((value: string): string | undefined => {
    if (!value) return 'Email is required';
    return undefined;
  }, []);

  const validatePassword = useCallback((value: string): string | undefined => {
    if (!value) return 'Password is required';
    return undefined;
  }, []);

  const validateField = useCallback(
    (field: 'email' | 'password') => {
      const validator = field === 'email' ? validateEmail : validatePassword;
      const value = field === 'email' ? email : password;
      setErrors((prev) => ({ ...prev, [field]: validator(value) }));
    },
    [email, password, validateEmail, validatePassword]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }, [email, password, validateEmail, validatePassword]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setServerError('');

      if (!validateForm()) return;

      setIsLoading(true);
      try {
        await login(email, password);
        navigate('/profile');
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>;
        const message = axiosError.response?.data?.message || 'Invalid credentials';
        setServerError(Array.isArray(message) ? message[0] : message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, login, navigate, validateForm]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    serverError,
    isLoading,
    validateField,
    handleSubmit,
  };
}
