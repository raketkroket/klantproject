import { useState, useEffect } from 'react';
import { ChevronDown, Search, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { LoginPanel } from '../LoginPanel';
import type { Page } from '../../types';

const navItems: { label: string; page: Page }[] = [
  { label: 'Projecten', page: 'projecten' },
  { label: 'Challenges', page: 'challenges' },
  { label: 'Nieuws', page: 'nieuws' },
  { label: 'Contact', page: 'contact' },
];

export function Header() {
  const { currentPage, navigate } = useNavigation();
  const { user, signOut } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="relative">
          <div
            className="absolute inset-x-0 top-0 h-40 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)',
            }}
          />

          <div className="absolute top-0 left-0 pointer-events-auto">
            <button
              onClick={() => navigate('home')}
              className="block"
              aria-label="Ga naar homepage"
            >
              <img
                src="/image.png"
                alt="ROC van Flevoland"
                className="h-20 md:h-24 w-auto object-contain"
              />
            </button>
          </div>

          <div className="flex justify-end pr-5 md:pr-8 pt-5 pointer-events-auto">
            <nav className="bg-white rounded-full shadow-lg px-2 py-2 flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    currentPage === item.page
                      ? 'bg-roc-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                  <ChevronDown size={13} className="opacity-50" />
                </button>
              ))}

              <div className="w-px h-5 bg-gray-200 mx-1" />

              {searchOpen ? (
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                  <Search size={15} className="text-gray-400 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => { setSearchOpen(false); setSearchQuery(''); }}
                    placeholder="Zoeken…"
                    className="bg-transparent text-sm w-32 outline-none text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Zoeken"
                >
                  <Search size={16} />
                </button>
              )}

              {user ? (
                <>
                  <button
                    onClick={() => navigate('admin-dashboard')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LayoutDashboard size={15} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="p-2.5 rounded-full text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label="Uitloggen"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Inloggen"
                >
                  <User size={16} />
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <button onClick={() => navigate('home')} className="pointer-events-auto">
              <img src="/image.png" alt="ROC van Flevoland" className="h-16 w-auto" />
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col p-6 gap-2 flex-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => { navigate(item.page); setMobileOpen(false); }}
                className={`text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  currentPage === item.page
                    ? 'bg-roc-500 text-white'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-4 pt-4">
              {user ? (
                <>
                  <button
                    onClick={() => { navigate('admin-dashboard'); setMobileOpen(false); }}
                    className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-800 hover:bg-gray-100"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Uitloggen
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setLoginOpen(true); setMobileOpen(false); }}
                  className="w-full bg-roc-500 text-white px-4 py-3 rounded-xl text-base font-semibold"
                >
                  Inloggen
                </button>
              )}
            </div>
          </nav>
        </div>
      )}

      <LoginPanel isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
