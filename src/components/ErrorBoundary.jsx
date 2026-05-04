import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-[#1c1c1e] border border-white/10 rounded-[16px] flex items-center justify-center mb-6">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-3">Something went wrong</h1>
          <p className="text-white/50 text-sm max-w-xs mb-6">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:scale-105 transition-transform"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
