import { AuthProvider } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Projecten } from './pages/Projecten';
import { Challenges } from './pages/Challenges';
import { Nieuws } from './pages/Nieuws';
import { Contact } from './pages/Contact';
import { AdminDashboard } from './pages/AdminDashboard';

function PageRouter() {
  const { currentPage, transitionKey } = useNavigation();

  const isAdmin = currentPage === 'admin-dashboard';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && <Header />}
      <main className="flex-1">
        <div key={transitionKey} className="page-enter">
          {currentPage === 'home' && <Home />}
          {currentPage === 'projecten' && <Projecten />}
          {currentPage === 'challenges' && <Challenges />}
          {currentPage === 'nieuws' && <Nieuws />}
          {currentPage === 'contact' && <Contact />}
          {currentPage === 'admin-dashboard' && <AdminDashboard />}
        </div>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <PageRouter />
      </NavigationProvider>
    </AuthProvider>
  );
}
