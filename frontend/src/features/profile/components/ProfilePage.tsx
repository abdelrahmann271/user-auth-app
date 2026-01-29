import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { useProfile } from '../hooks';
import { Button } from '../../../shared/components';

export default function ProfilePage() {
  const { user, logout, sessionExpired, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading, error, refetch } = useProfile();
  const [hasViewedProfile, setHasViewedProfile] = useState(false);

  useEffect(() => {
    if (sessionExpired || !isAuthenticated) {
      navigate('/signin');
    }
  }, [sessionExpired, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const errorMessage =
    error instanceof Error ? error.message : 'Failed to fetch profile';

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>My Profile</h1>
          <Button variant="danger" onClick={handleLogout} className="btn-logout">
            Logout
          </Button>
        </div>

        <div className="user-info">
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

        {!hasViewedProfile && (
          <div className="profile-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setHasViewedProfile(true);
                refetch();
              }}
              isLoading={isLoading}
              loadingText="Loading..."
            >
              View Profile
            </Button>
          </div>
        )}

        {error && hasViewedProfile && <div className="error-banner">{errorMessage}</div>}

        {profile && hasViewedProfile && (
          <div className="profile-details">
            <h3>Profile</h3>
            <div className="profile-field">
              <span className="label">Email:</span>
              <span className="value">{profile.email}</span>
            </div>
            <div className="profile-field">
              <span className="label">Name:</span>
              <span className="value">{profile.name}</span>
            </div>
            <div className="profile-field">
              <span className="label">Member since:</span>
              <span className="value">{formatDate(profile.createdAt)}</span>
            </div>
          </div>
        )}

        <div className="welcome-message">
          <p>You have successfully logged in to your account.</p>
        </div>
      </div>
    </div>
  );
}
