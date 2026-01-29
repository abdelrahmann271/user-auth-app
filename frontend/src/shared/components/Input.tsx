import { InputHTMLAttributes, forwardRef, memo } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    return (
      <div className="form-group">
        <label htmlFor={id}>{label}</label>
        <input
          ref={ref}
          id={id}
          className={`${error ? 'error' : ''} ${className}`.trim()}
          {...props}
        />
        {error && <span className="error-text">{error}</span>}
        {hint && !error && <small className="hint">{hint}</small>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default memo(Input);
