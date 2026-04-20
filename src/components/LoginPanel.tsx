import { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const REGISTRATION_CODE = 'ROCVA2026';

export function LoginPanel({ isOpen, onClose }: Props) {
  const { signIn, signUp } = useAuth();
  const { navigate } = useNavigation();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regCode, setRegCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRegCode('');
  }, [tab, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError('Onjuist e-mailadres of wachtwoord.');
    } else {
      onClose();
      navigate('admin-dashboard');
    }
  };

  const handleRegister = async () => {
    setError('');
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
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      setError('Registratie mislukt. Probeer het opnieuw.');
    } else {
      setSuccess('Account aangemaakt! Je kunt nu inloggen.');
      setTab('login');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (tab === 'login') handleLogin();
      else handleRegister();
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 focus:border-transparent placeholder:text-gray-400";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-roc-500 px-8 pt-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <img src="/image.png" alt="ROC van Flevoland" className="h-14 w-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">
            {tab === 'login' ? 'Inloggen' : 'Account aanmaken'}
          </h2>
          <p className="text-white/75 text-sm mt-1">Beheerdersomgeving Software Talent Hub</p>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === 'login' ? 'text-roc-500 border-b-2 border-roc-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Inloggen
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === 'register' ? 'text-roc-500 border-b-2 border-roc-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Registreren
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              {success}
            </div>
          )}

          {tab === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mailadres</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="naam@rocvanflevoland.nl"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-roc-500 hover:bg-roc-600 text-white font-semibold py-3 px-6 rounded-full transition-colors disabled:opacity-60 mt-2"
              >
                {loading ? 'Bezig…' : 'Inloggen →'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mailadres</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="naam@rocvanflevoland.nl"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Minimaal 8 tekens"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord herhalen</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Registratiecode</label>
                <input
                  type="text"
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Voer de code in"
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 mt-1">Alleen beschikbaar voor medewerkers van ROC van Flevoland</p>
              </div>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-roc-500 hover:bg-roc-600 text-white font-semibold py-3 px-6 rounded-full transition-colors disabled:opacity-60 mt-2"
              >
                {loading ? 'Bezig…' : 'Account aanmaken →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
