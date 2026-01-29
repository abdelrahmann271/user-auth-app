import { memo } from 'react';

function LoadingFallback() {
  return (
    <div className="loading-fallback">
      <div className="spinner">
        <div className="spinner-circle" />
      </div>
      <p>Loading...</p>
    </div>
  );
}

export default memo(LoadingFallback);
