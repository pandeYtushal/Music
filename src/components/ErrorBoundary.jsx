import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here (like Sentry)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full border-2 border-accent text-accent flex items-center justify-center mb-8 bg-accent/10">
            <FiAlertTriangle size={40} />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-4 uppercase tracking-tight">
            Signal Lost
          </h1>
          <p className="text-secondary text-sm md:text-base font-bold tracking-[0.2em] uppercase mb-12 max-w-md">
            Something went wrong while loading this page. Our systems have logged the error.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-primary text-background font-bold text-sm tracking-[0.2em] uppercase hover:bg-accent transition-colors flex items-center gap-3 active:scale-95"
          >
            <FiRefreshCw size={18} />
            RESTORE CONNECTION
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
