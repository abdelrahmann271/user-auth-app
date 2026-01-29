import { Link } from 'react-router-dom';
import { useSignUpForm } from '../hooks';
import { Button, Input } from '../../../shared/components';

export default function SignUpPage() {
  const {
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
  } = useSignUpForm();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Sign up to get started</p>

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
            type="text"
            id="name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => validateField('name')}
            error={errors.name}
            placeholder="Enter your name"
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
            hint="Min 8 characters, at least one letter, number, and special character (@$!%*#?&)"
          />

          <Button type="submit" isLoading={isLoading} loadingText="Creating account...">
            Sign Up
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
