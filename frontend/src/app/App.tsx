import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute, PublicRoute } from './routes';
import LoadingFallback from '../shared/components/LoadingFallback';

const SignInPage = lazy(() => import('../features/auth/components/SignInPage'));
const SignUpPage = lazy(() => import('../features/auth/components/SignUpPage'));
const ProfilePage = lazy(() => import('../features/profile/components/ProfilePage'));

export default function App() {
  return (
    <div className="app">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignInPage />
              </PublicRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/signin" />} />
        </Routes>
      </Suspense>
    </div>
  );
}
