import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error Boundary caught an error:', error);
    console.error('Error info:', errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  return (
    <div className="error-boundary">
      <div className="error-boundary-content">
        <div className="error-icon">!</div>
        <h1>Something went wrong</h1>
        <p>We're sorry, but something unexpected happened.</p>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="error-details">
            <summary>Error details</summary>
            <pre>{error.message}</pre>
          </details>
        )}
        <div className="error-actions">
          <button onClick={onReset} className="btn btn-secondary">
            Try again
          </button>
          <button onClick={() => window.location.href = '/'} className="btn btn-primary">
            Go to home
          </button>
        </div>
      </div>
    </div>
  );
}
