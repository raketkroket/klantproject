import { AuthProvider } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Projecten } from './pages/Projecten';
import { Challenges } from './pages/Challenges';
import { Nieuws } from './pages/Nieuws';
import { Contact } from './pages/Contact';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';

function PageRouter() {
  const { currentPage, transitionKey } = useNavigation();

  const isAdminPage = currentPage === 'admin-dashboard' || currentPage === 'admin-login';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Header />}
      <main className="flex-1">
        <div key={transitionKey} className="page-enter">
          {currentPage === 'home' && <Home />}
          {currentPage === 'projecten' && <Projecten />}
          {currentPage === 'challenges' && <Challenges />}
          {currentPage === 'nieuws' && <Nieuws />}
          {currentPage === 'contact' && <Contact />}
          {currentPage === 'admin-dashboard' && <AdminDashboard />}
          {currentPage === 'admin-login' && <AdminLogin />}
        </div>
      </main>
      {!isAdminPage && <Footer />}
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
