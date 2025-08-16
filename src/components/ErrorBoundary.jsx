import React from 'react';
import { log } from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    try {
      log.error('React ErrorBoundary caught an error', error, {
        componentStack: errorInfo?.componentStack,
      });
    } catch (e) {
      // no-op: avoid secondary failures in error handler
      // eslint-disable-next-line no-console
      console.error('Failed to log error', e);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>We're sorry for the inconvenience. Please try again.</p>
          <button onClick={this.handleRetry} style={{ padding: '0.5rem 1rem' }}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
