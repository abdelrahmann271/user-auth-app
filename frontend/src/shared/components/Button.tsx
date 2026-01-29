import { ButtonHTMLAttributes, memo } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  loadingText?: string;
}

function Button({
  children,
  variant = 'primary',
  isLoading = false,
  loadingText,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = `btn-${variant}`;

  return (
    <button
      className={`${variantClass} ${className}`.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? loadingText || 'Loading...' : children}
    </button>
  );
}

export default memo(Button);
