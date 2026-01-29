import { memo } from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div className={`spinner spinner-${size} ${className}`.trim()}>
      <div className="spinner-circle" />
    </div>
  );
}

export default memo(Spinner);
