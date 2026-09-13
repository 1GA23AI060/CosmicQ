import { useState, useEffect } from 'react';
import StarField from './components/StarField';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Chat from './pages/Chat';
import AstronomyToday, { AstronomyUpdate } from './pages/AstronomyToday';

export type Page = 'landing' | 'login' | 'chat' | 'astronomy-today';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined);
  const [activeContextItem, setActiveContextItem] = useState<AstronomyUpdate | null>(null);

  // Sync authentication state from localStorage if available
  useEffect(() => {
    const authStatus = localStorage.getItem('cosmiq_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleNavigate = (targetPage: Page, prompt?: string, contextItem?: AstronomyUpdate) => {
    if (prompt) {
      setInitialPrompt(prompt);
    } else if (targetPage !== 'chat') {
      setInitialPrompt(undefined);
    }

    if (contextItem !== undefined) {
      setActiveContextItem(contextItem);
    } else if (targetPage !== 'chat') {
      setActiveContextItem(null);
    }

    // Protected route check: Astronomy Today requires authentication
    if (targetPage === 'astronomy-today' && !isAuthenticated) {
      setPage('login');
      return;
    }

    // When logging in / opening chat from Login page
    if (targetPage === 'chat') {
      setIsAuthenticated(true);
      localStorage.setItem('cosmiq_auth', 'true');
    }

    setPage(targetPage);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#04060f' }}>
      <StarField />
      <div className="relative" style={{ zIndex: 1 }}>
        {page === 'landing' && <Landing onNavigate={handleNavigate} />}
        {page === 'login' && <Login onNavigate={handleNavigate} />}
        {page === 'chat' && (
          <Chat
            onNavigate={handleNavigate}
            initialPrompt={initialPrompt}
            initialContextItem={activeContextItem}
          />
        )}
        {page === 'astronomy-today' && (
          isAuthenticated ? (
            <AstronomyToday onNavigate={handleNavigate} />
          ) : (
            <Login onNavigate={handleNavigate} />
          )
        )}
      </div>
    </div>
  );
}
