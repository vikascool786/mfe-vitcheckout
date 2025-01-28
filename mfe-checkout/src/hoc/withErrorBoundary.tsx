import React, { ComponentType, ReactNode } from "react";

// Props for the ErrorBoundary component
interface ErrorBoundaryProps {
  fallback?: ReactNode; // Fallback UI to render on error
}

// State for the ErrorBoundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ErrorBoundary class component
class ErrorBoundary extends React.Component<
  React.PropsWithChildren<ErrorBoundaryProps>,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      return fallback || <h1>No items in your cart</h1>;
    }

    return children;
  }
}

// Higher-Order Component
export const withErrorBoundary = <P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};
