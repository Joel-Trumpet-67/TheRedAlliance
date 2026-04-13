import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, BottomNav } from './components/Navbar';
import { Home } from './pages/Home';
import { Teams } from './pages/Teams';
import { TeamDetail } from './pages/TeamDetail';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';

export default function App() {
  return (
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
