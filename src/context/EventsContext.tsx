import { createContext, useContext, useEffect, useState } from 'react';
import { fetchEventsForYear, SBEvent } from '../api/statbotics';
import type { Event } from '../data/mockData';

// ─── Adapters ─────────────────────────────────────────────────────────────────

function adaptEventType(type: string): string {
  const map: Record<string, string> = {
    regional:     'Regional',
    district:     'District',
    district_cmp: 'District Championship',
    champs_div:   'Championship Division',
    einstein:     'Einstein Championship',
  };
  return map[type] ?? type;
}

export function adaptEvent(sb: SBEvent): Event {
  return {
    key:        sb.key,
    name:       sb.name,
    short_name: sb.name
      .replace(/ Regional$/, '')
      .replace(/ District$/, '')
      .replace(/ Championship.*/, '')
      .replace(/ Division$/, ''),
    city:       '',          // not provided by Statbotics
    state:      sb.state    ?? '',
    country:    sb.country  ?? '',
    start_date: sb.start_date,
    end_date:   sb.end_date,
    event_type: adaptEventType(sb.type),
    week:       sb.week,
    year:       sb.year,
    teams:      [],          // loaded on-demand in EventDetail
    num_teams:  sb.num_teams,
    status:     sb.status,
    video:      sb.video ?? undefined,
  };
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface EventsCtxValue {
  events:  Event[];
  loading: boolean;
  error:   string | null;
  year:    number;
  setYear: (y: number) => void;
}

const EventsCtx = createContext<EventsCtxValue>({
  events: [], loading: true, error: null, year: new Date().getFullYear(), setYear: () => {},
});

const CURRENT_YEAR = new Date().getFullYear();

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [year,    setYear]    = useState(CURRENT_YEAR);
  const [events,  setEvents]  = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setEvents([]);

    fetchEventsForYear(year)
      .then(data => {
        if (cancelled) return;
        setEvents(data.map(adaptEvent).sort((a, b) =>
          (a.week ?? 99) - (b.week ?? 99) || a.start_date.localeCompare(b.start_date)
        ));
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message ?? 'Failed to load events');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [year]);

  return (
    <EventsCtx.Provider value={{ events, loading, error, year, setYear }}>
      {children}
    </EventsCtx.Provider>
  );
}

export function useEvents() {
  return useContext(EventsCtx);
}
