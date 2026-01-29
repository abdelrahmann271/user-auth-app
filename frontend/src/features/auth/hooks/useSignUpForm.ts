import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { validateEmail, validateName, validatePassword } from '../../../shared/utils/validation';
import type { FormErrors } from '../../../shared/types';
import type { AxiosError } from 'axios';

interface ApiError {
  message: string | string[];
}

export function useSignUpForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateField = useCallback(
    (field: 'email' | 'name' | 'password') => {
      const validators = { email: validateEmail, name: validateName, password: validatePassword };
      const values = { email, name, password };
      setErrors((prev) => ({ ...prev, [field]: validators[field](values[field]) }));
    },
    [email, name, password]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {
      email: validateEmail(email),
      name: validateName(name),
      password: validatePassword(password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }, [email, name, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setServerError('');

      if (!validateForm()) return;

      setIsLoading(true);
      try {
        await signup(email, name, password);
        navigate('/profile');
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>;
        const message = axiosError.response?.data?.message || 'An error occurred during signup';
        setServerError(Array.isArray(message) ? message[0] : message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, name, password, signup, navigate, validateForm]
  );

  return {
    email,
    setEmail,
    name,
    setName,
    password,
    setPassword,
    errors,
    serverError,
    isLoading,
    validateField,
    handleSubmit,
  };
}
