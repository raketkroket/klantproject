import { useState } from 'react';
import { LogIn, UserPlus, CircleAlert as AlertCircle, Loader as Loader2, CircleCheck as CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';

const REGISTRATION_CODE = 'ROCVA2026';

export default function AdminLogin() {
  const { signIn, signUp, user } = useAuth();
  const { navigate } = useNavigation();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regCode, setRegCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (user) {
    navigate('admin-dashboard');
    return null;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError('Ongeldig e-mailadres of wachtwoord.');
    } else {
      navigate('admin-dashboard');
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (regCode !== REGISTRATION_CODE) {
      setError('Ongeldige registratiecode. Neem contact op met een beheerder.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }
    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens bevatten.');
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email, password);
    setLoading(false);
    if (err) {
      setError('Registratie mislukt. Probeer het opnieuw.');
    } else {
      setSuccess('Account aangemaakt! Je kunt nu inloggen.');
      setTab('login');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRegCode('');
    }
  }

  const inputClass = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-roc-500 focus:ring-1 focus:ring-roc-500 transition-colors";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/image.png" alt="ROC van Flevoland" className="h-20 w-auto mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Beheerdersomgeving Software Talent Hub</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => { setTab('login'); setError(null); setSuccess(null); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === 'login' ? 'text-roc-500 border-b-2 border-roc-500 bg-white' : 'text-gray-400 hover:text-gray-600 bg-gray-50'}`}
            >
              Inloggen
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); setSuccess(null); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === 'register' ? 'text-roc-500 border-b-2 border-roc-500 bg-white' : 'text-gray-400 hover:text-gray-600 bg-gray-50'}`}
            >
              Registreren
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm mb-5">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-green-600 text-sm mb-5">
                <CheckCircle size={16} className="flex-shrink-0" />
                {success}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="naam@rocvanflevoland.nl"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-roc-500 hover:bg-roc-600 disabled:bg-roc-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" />Inloggen...</>
                  ) : (
                    <><LogIn size={18} />Inloggen</>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="naam@rocvanflevoland.nl"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimaal 8 tekens"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord herhalen</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Registratiecode</label>
                  <input
                    type="text"
                    required
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    placeholder="Voer de registratiecode in"
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Alleen voor medewerkers van ROC van Flevoland</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-roc-500 hover:bg-roc-600 disabled:bg-roc-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" />Bezig...</>
                  ) : (
                    <><UserPlus size={18} />Account aanmaken</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
