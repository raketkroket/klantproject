import { useState, useEffect } from 'react';
import { CircleCheck as CheckCircle, Circle as XCircle, Clock, LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Project, Challenge } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

type Tab = 'projecten' | 'challenges';

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { navigate } = useNavigation();
  const [tab, setTab] = useState<Tab>('projecten');
  const [projects, setProjects] = useState<Project[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('home'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('challenges').select('*').order('created_at', { ascending: false }),
    ]);
    setProjects(p ?? []);
    setChallenges(c ?? []);
    setLoading(false);
  };

  const updateProject = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('projects').update({ status }).eq('id', id);
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
  };

  const updateChallenge = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('challenges').update({ status }).eq('id', id);
    setChallenges((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle size={11} />Goedgekeurd</span>;
    if (status === 'rejected') return <span className="text-xs font-semibold bg-red-50 text-red-700 px-2.5 py-1 rounded-full flex items-center gap-1"><XCircle size={11} />Afgewezen</span>;
    return <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full flex items-center gap-1"><Clock size={11} />In behandeling</span>;
  };

  if (!user) return null;

  const pending = {
    projecten: projects.filter((p) => p.status === 'pending').length,
    challenges: challenges.filter((c) => c.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-roc-500 flex items-center justify-center">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Admin Dashboard</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { signOut(); navigate('home'); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50"
          >
            <LogOut size={15} />
            Uitloggen
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Projecten', value: projects.length, pending: pending.projecten },
            { label: 'Challenges', value: challenges.length, pending: pending.challenges },
            { label: 'In behandeling', value: pending.projecten + pending.challenges, pending: 0 },
          ].map(({ label, value, pending: p }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {p > 0 && <p className="text-xs text-amber-600 font-medium mt-1">{p} wacht op beoordeling</p>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['projecten', 'challenges'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors capitalize relative ${
                  tab === t ? 'text-roc-500' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {pending[t] > 0 && (
                  <span className="ml-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                    {pending[t]}
                  </span>
                )}
                {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-roc-500" />}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(tab === 'projecten' ? projects : challenges).map((item) => (
                <div key={item.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      {statusBadge(item.status)}
                      <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400">
                      {tab === 'projecten'
                        ? `door ${'author_name' in item ? item.author_name : ''}`
                        : `door ${'company_name' in item ? item.company_name : ''}`
                      } · {new Date(item.created_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  {item.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => tab === 'projecten' ? updateProject(item.id, 'approved') : updateChallenge(item.id, 'approved')}
                        className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold px-3 py-2 rounded-full transition-colors"
                      >
                        <CheckCircle size={13} /> Goedkeuren
                      </button>
                      <button
                        onClick={() => tab === 'projecten' ? updateProject(item.id, 'rejected') : updateChallenge(item.id, 'rejected')}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-3 py-2 rounded-full transition-colors"
                      >
                        <XCircle size={13} /> Afwijzen
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {(tab === 'projecten' ? projects : challenges).length === 0 && (
                <div className="p-10 text-center text-gray-400 text-sm">Geen items gevonden</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
