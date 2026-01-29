import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth';
import { Spinner } from '../../shared/components';

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="route-loading">
        <Spinner size="lg" />
        <p>Loading...</p>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/profile" />;
}
