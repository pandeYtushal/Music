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

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      // Compact mode: inline error card for route-level boundaries
      if (this.props.compact) {
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
              <div className="w-12 h-12 mx-auto mb-5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-xl font-bold">!</span>
              </div>
              <h2 className="text-white text-lg font-bold mb-2">Something went wrong</h2>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                {this.state.error?.message || 'This section encountered an error.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={this.handleReset}
                  className="px-5 py-2.5 rounded-full bg-white text-black text-[13px] font-bold hover:bg-white/90 active:scale-95 transition-all shadow-md"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    this.handleReset();
                    window.location.hash = '';
                    window.location.pathname = '/';
                  }}
                  className="px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 text-[13px] font-bold hover:bg-white/[0.1] hover:text-white active:scale-95 transition-all"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Full-screen mode: app-level fallback (original behavior)
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
