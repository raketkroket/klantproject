import { useState, useEffect } from 'react';
import { Menu, X, Search, User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
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
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close mobile menu on page change
  useEffect(() => { setMobileOpen(false); }, [currentPage]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        {/* Gradient overlay behind header */}
        <div
          className="absolute inset-x-0 top-0 h-36 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 100%)' }}
        />

        {/* Logo — always top-left, aligned with page container */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <button
              onClick={() => navigate('home')}
              aria-label="Ga naar homepage"
              className="flex items-stretch bg-white shadow-sm pointer-events-auto"
            >
              <div className="flex items-center justify-center px-4 md:px-6 py-3">
                <img src="/image.png" alt="ROC van Flevoland" className="h-12 md:h-16 w-auto object-contain" />
              </div>
              <div className="bg-roc-500 flex items-center px-4 md:px-5 py-3">
                <span className="text-white text-[11px] md:text-sm font-bold leading-tight text-left">
                  maakt<br />werk van<br />je talent
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Desktop nav — hidden on mobile */}
        <div className="hidden md:flex justify-end pr-6 md:pr-10 pt-5 pointer-events-auto">
          <nav className="bg-white rounded-full shadow-lg px-2 py-2 flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  currentPage === item.page ? 'bg-roc-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
                <ChevronDown size={13} className="opacity-40" />
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
                  Dashboard
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

        {/* Mobile hamburger — only on small screens */}
        <div className="md:hidden absolute top-4 right-4 pointer-events-auto">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-gray-700"
            aria-label="Menu openen"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />

          {/* Slide-in panel */}
          <div className="relative ml-auto w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <button onClick={() => navigate('home')}>
                <img src="/image.png" alt="ROC van Flevoland" className="h-12 w-auto" />
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 px-4 py-5 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    currentPage === item.page ? 'bg-roc-500 text-white' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-1">
                {user ? (
                  <>
                    <button
                      onClick={() => navigate('admin-dashboard')}
                      className="w-full flex items-center gap-2 text-left px-4 py-3 rounded-xl text-base font-medium text-gray-800 hover:bg-gray-100"
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </button>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Uitloggen
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setLoginOpen(true)}
                    className="w-full bg-roc-500 text-white px-4 py-3 rounded-xl text-base font-semibold flex items-center gap-2"
                  >
                    <User size={17} />
                    Inloggen
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      <LoginPanel isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
