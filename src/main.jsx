import { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000 },
  },
});

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', width: '100vw', background: '#080503', color: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ffb450' }}>मेलडी (Melody)</h2>
          <p style={{ opacity: 0.8, marginBottom: '1.5rem', maxWidth: '400px' }}>
            Something went wrong while loading the player.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px', borderRadius: '99px', background: '#fff', color: '#000',
              border: 'none', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            Reload Player
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
);
