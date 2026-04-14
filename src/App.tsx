import { Component, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, BottomNav } from './components/Navbar';
import { Home } from './pages/Home';
import { Teams } from './pages/Teams';
import { TeamDetail } from './pages/TeamDetail';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: '#f5f5f5', fontFamily: 'monospace' }}>
          <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.5rem' }}>App error</div>
          <pre style={{ fontSize: '0.8rem', color: '#a3a3a3', whiteSpace: 'pre-wrap' }}>
            {(this.state.error as Error).message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:number" element={<TeamDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:key" element={<EventDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
    </ErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>404 — Page not found</div>
      <div style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
        <a href="/" style={{ color: 'var(--red-400)' }}>Go home →</a>
      </div>
    </div>
  );
}
