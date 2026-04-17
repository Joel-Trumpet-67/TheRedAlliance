import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, BottomNav } from './components/Navbar';
import { Home } from './pages/Home';
import { Teams } from './pages/Teams';
import { TeamDetail } from './pages/TeamDetail';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { TeamsProvider } from './context/TeamsContext';
import { EventsProvider } from './context/EventsContext';
import { PinnedEventsProvider } from './context/PinnedEventsContext';

export default function App() {
  return (
    <PinnedEventsProvider>
    <TeamsProvider>
    <EventsProvider>
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
    </EventsProvider>
    </TeamsProvider>
    </PinnedEventsProvider>
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
