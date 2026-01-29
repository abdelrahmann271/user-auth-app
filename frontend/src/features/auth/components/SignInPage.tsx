import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useSignInForm } from '../hooks';
import { Button, Input } from '../../../shared/components';

export default function SignInPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    serverError,
    isLoading,
    validateField,
    handleSubmit,
  } = useSignInForm();

  const { sessionExpired, clearSessionExpired } = useAuth();

  useEffect(() => {
    return () => clearSessionExpired();
  }, [clearSessionExpired]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {sessionExpired && (
          <div className="warning-banner">Your session has expired. Please sign in again.</div>
        )}

        {serverError && <div className="error-banner">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            type="email"
            id="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => validateField('email')}
            error={errors.email}
            placeholder="Enter your email"
          />

          <Input
            type="password"
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => validateField('password')}
            error={errors.password}
            placeholder="Enter your password"
          />

          <Button type="submit" isLoading={isLoading} loadingText="Signing in...">
            Sign In
          </Button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
