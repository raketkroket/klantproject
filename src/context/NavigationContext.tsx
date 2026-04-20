import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Page } from '../types';

interface NavigationContextType {
  currentPage: Page;
  transitionKey: number;
  navigate: (page: Page) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

function getPageFromHash(): Page {
  const hash = window.location.hash.replace('#', '') as Page;
  const valid: Page[] = ['home', 'projecten', 'challenges', 'nieuws', 'contact', 'admin-dashboard'];
  return valid.includes(hash) ? hash : 'home';
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash);
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    const handler = () => {
      setCurrentPage(getPageFromHash());
      setTransitionKey((k) => k + 1);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((page: Page) => {
    window.location.hash = page;
    setCurrentPage(page);
    setTransitionKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <NavigationContext.Provider value={{ currentPage, transitionKey, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
