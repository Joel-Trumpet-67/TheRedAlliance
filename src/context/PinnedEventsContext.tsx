import { createContext, useContext, useState, useCallback } from 'react';

interface PinnedCtxValue {
  isPinned: (key: string) => boolean;
  toggle:   (key: string) => void;
  pinned:   Set<string>;
}

const PinnedCtx = createContext<PinnedCtxValue>({
  isPinned: () => false,
  toggle:   () => {},
  pinned:   new Set(),
});

function load(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem('pinned_events') ?? '[]')); }
  catch { return new Set(); }
}

export function PinnedEventsProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState<Set<string>>(load);

  const toggle = useCallback((key: string) => {
    setPinned(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      localStorage.setItem('pinned_events', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isPinned = useCallback((key: string) => pinned.has(key), [pinned]);

  return (
    <PinnedCtx.Provider value={{ pinned, toggle, isPinned }}>
      {children}
    </PinnedCtx.Provider>
  );
}

export function usePinnedEvents() {
  return useContext(PinnedCtx);
}
