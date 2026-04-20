import { useEffect, useState } from 'react';
import {
  LayoutDashboard, FolderGit2, Zap, Newspaper, Mail,
  CheckCircle, XCircle, Clock, Loader2, Plus, Trash2,
  AlertCircle, LogOut, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import type { Project, Challenge, NewsPost, ContactMessage, NewsInsert } from '../../lib/database.types';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

type Tab = 'overview' | 'projects' | 'challenges' | 'news' | 'messages';

const defaultNewsForm = { title: '', content: '', excerpt: '', image_url: '' };

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { navigate } = useNavigation();
  const [tab, setTab] = useState<Tab>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [newsForm, setNewsForm] = useState(defaultNewsForm);
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('admin-login');
      return;
    }
    fetchAll();
  }, [user]);

  async function fetchAll() {
    setLoading(true);
    const [p, c, n, m] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('challenges').select('*').order('created_at', { ascending: false }),
      supabase.from('news').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ]);
    if (p.data) setProjects(p.data);
    if (c.data) setChallenges(c.data);
    if (n.data) setNews(n.data);
    if (m.data) setMessages(m.data);
    setLoading(false);
  }

  async function updateProjectStatus(id: string, status: 'approved' | 'rejected') {
    await supabase.from('projects').update({ status }).eq('id', id);
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
  }

  async function updateChallengeStatus(id: string, status: 'approved' | 'rejected') {
    await supabase.from('challenges').update({ status }).eq('id', id);
    setChallenges((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  }

  async function deleteNews(id: string) {
    await supabase.from('news').delete().eq('id', id);
    setNews((prev) => prev.filter((n) => n.id !== id));
  }

  async function submitNews(e: React.FormEvent) {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.content.trim()) {
      setNewsError('Titel en inhoud zijn verplicht.');
      return;
    }
    setNewsSubmitting(true);
    setNewsError(null);

    const insert: NewsInsert = {
      title: newsForm.title.trim(),
      content: newsForm.content.trim(),
      excerpt: newsForm.excerpt.trim(),
      image_url: newsForm.image_url.trim(),
    };

    const { data, error } = await supabase
      .from('news')
      .insert({ ...insert, author_id: user!.id })
      .select()
      .single();

    setNewsSubmitting(false);
    if (error) {
      setNewsError('Er ging iets mis.');
    } else {
      if (data) setNews((prev) => [data, ...prev]);
      setNewsForm(defaultNewsForm);
      setNewsModalOpen(false);
    }
  }

  const pendingProjects = projects.filter((p) => p.status === 'pending');
  const pendingChallenges = challenges.filter((c) => c.status === 'pending');

  const statusBadge = (status: string) => {
    if (status === 'approved') return <Badge variant="green">Goedgekeurd</Badge>;
    if (status === 'rejected') return <Badge variant="red">Afgewezen</Badge>;
    return <Badge variant="amber">In behandeling</Badge>;
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'overview', label: 'Overzicht', icon: LayoutDashboard },
    { id: 'projects', label: 'Projecten', icon: FolderGit2, count: pendingProjects.length || undefined },
    { id: 'challenges', label: 'Challenges', icon: Zap, count: pendingChallenges.length || undefined },
    { id: 'news', label: 'Nieuws', icon: Newspaper },
    { id: 'messages', label: 'Berichten', icon: Mail, count: messages.length || undefined },
  ];

  const inputClass = "w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-roc-500 focus:ring-1 focus:ring-roc-500 transition-colors";

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    tab === id
                      ? 'bg-roc-50 text-roc-600 font-semibold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className="ml-1 bg-roc-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => { signOut(); navigate('home'); }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-roc-500 transition-colors ml-4"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Uitloggen</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="text-roc-500 animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
                  <p className="text-gray-500 text-sm">Welkom, {user.email}</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Projecten wachtend', value: pendingProjects.length, icon: FolderGit2, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Challenges wachtend', value: pendingChallenges.length, icon: Zap, color: 'text-roc-500', bg: 'bg-roc-50' },
                    { label: 'Nieuwsberichten', value: news.length, icon: Newspaper, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Contactberichten', value: messages.length, icon: Mail, color: 'text-sky-600', bg: 'bg-sky-50' },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                      <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                        <Icon size={18} className={color} />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{value}</p>
                      <p className="text-gray-500 text-xs mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                {pendingProjects.length > 0 && (
                  <div>
                    <h2 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                      <Clock size={16} className="text-amber-500" />
                      Projecten te beoordelen
                    </h2>
                    <div className="space-y-3">
                      {pendingProjects.slice(0, 3).map((p) => (
                        <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4 shadow-sm">
                          <div className="min-w-0">
                            <p className="text-gray-900 text-sm font-medium truncate">{p.title}</p>
                            <p className="text-gray-400 text-xs mt-0.5">door {p.author_name}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => updateProjectStatus(p.id, 'approved')} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-emerald-200">
                              <CheckCircle size={13} /> Goedkeuren
                            </button>
                            <button onClick={() => updateProjectStatus(p.id, 'rejected')} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-red-200">
                              <XCircle size={13} /> Afwijzen
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'projects' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Projecten Beheren</h2>
                <div className="space-y-3">
                  {projects.length === 0 ? (
                    <p className="text-gray-400 py-8 text-center">Geen projecten gevonden.</p>
                  ) : (
                    projects.map((p) => (
                      <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-gray-900 font-medium text-sm">{p.title}</span>
                              {statusBadge(p.status)}
                            </div>
                            <p className="text-gray-400 text-xs mb-1">door {p.author_name} {p.author_email ? `(${p.author_email})` : ''}</p>
                            <p className="text-gray-500 text-xs line-clamp-2">{p.description}</p>
                            {p.tech_stack && p.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {p.tech_stack.slice(0, 5).map((t) => (
                                  <span key={t} className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 text-xs">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          {p.status === 'pending' && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => updateProjectStatus(p.id, 'approved')} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-emerald-200">
                                <CheckCircle size={13} /> Goedkeuren
                              </button>
                              <button onClick={() => updateProjectStatus(p.id, 'rejected')} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-red-200">
                                <XCircle size={13} /> Afwijzen
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === 'challenges' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Challenges Beheren</h2>
                <div className="space-y-3">
                  {challenges.length === 0 ? (
                    <p className="text-gray-400 py-8 text-center">Geen challenges gevonden.</p>
                  ) : (
                    challenges.map((c) => (
                      <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-gray-900 font-medium text-sm">{c.title}</span>
                              {statusBadge(c.status)}
                            </div>
                            <p className="text-gray-400 text-xs mb-1">{c.company_name}{c.contact_email ? ` - ${c.contact_email}` : ''}</p>
                            <p className="text-gray-500 text-xs line-clamp-2">{c.description}</p>
                          </div>
                          {c.status === 'pending' && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => updateChallengeStatus(c.id, 'approved')} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-emerald-200">
                                <CheckCircle size={13} /> Goedkeuren
                              </button>
                              <button onClick={() => updateChallengeStatus(c.id, 'rejected')} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-red-200">
                                <XCircle size={13} /> Afwijzen
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === 'news' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Nieuws Beheren</h2>
                  <button
                    onClick={() => { setNewsModalOpen(true); setNewsError(null); }}
                    className="flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Plus size={16} />
                    Nieuwsbericht
                  </button>
                </div>
                <div className="space-y-3">
                  {news.length === 0 ? (
                    <p className="text-gray-400 py-8 text-center">Nog geen nieuwsberichten.</p>
                  ) : (
                    news.map((n) => (
                      <div key={n.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4 shadow-sm">
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-900 font-medium text-sm mb-1">{n.title}</p>
                          {n.excerpt && <p className="text-gray-400 text-xs line-clamp-1">{n.excerpt}</p>}
                          <p className="text-gray-300 text-xs mt-1">
                            {new Date(n.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNews(n.id)}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-red-200 flex-shrink-0"
                        >
                          <Trash2 size={13} /> Verwijderen
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === 'messages' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Contactberichten</h2>
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-gray-400 py-8 text-center">Geen contactberichten.</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <span className="text-gray-900 font-medium text-sm">{m.name}</span>
                              <span className="text-gray-400 text-xs">{m.email}</span>
                            </div>
                            <p className="text-gray-700 text-sm font-medium mb-1">{m.subject}</p>
                            {expandedMessage === m.id ? (
                              <p className="text-gray-500 text-sm leading-relaxed">{m.message}</p>
                            ) : (
                              <p className="text-gray-400 text-xs line-clamp-2">{m.message}</p>
                            )}
                          </div>
                          <button
                            onClick={() => setExpandedMessage(expandedMessage === m.id ? null : m.id)}
                            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-gray-200 flex-shrink-0"
                          >
                            {expandedMessage === m.id ? <EyeOff size={13} /> : <Eye size={13} />}
                            {expandedMessage === m.id ? 'Inklappen' : 'Lees meer'}
                          </button>
                        </div>
                        <p className="text-gray-300 text-xs mt-3">
                          {new Date(m.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={newsModalOpen}
        onClose={() => { setNewsModalOpen(false); setNewsError(null); setNewsForm(defaultNewsForm); }}
        title="Nieuwsbericht Plaatsen"
      >
        <form onSubmit={submitNews} className="space-y-5">
          {newsError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
              <AlertCircle size={16} />
              {newsError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titel <span className="text-red-500">*</span></label>
            <input type="text" required value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} placeholder="Titel van het nieuwsbericht" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Samenvatting</label>
            <input type="text" value={newsForm.excerpt} onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })} placeholder="Korte samenvatting (optioneel)" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Inhoud <span className="text-red-500">*</span></label>
            <textarea required rows={6} value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} placeholder="Schrijf hier de volledige inhoud..." className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Afbeelding URL</label>
            <input type="url" value={newsForm.image_url} onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })} placeholder="https://images.pexels.com/..." className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={newsSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-roc-500 hover:bg-roc-600 disabled:bg-roc-300 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            {newsSubmitting ? <><Loader2 size={18} className="animate-spin" />Plaatsen...</> : <><Newspaper size={18} />Nieuwsbericht Plaatsen</>}
          </button>
        </form>
      </Modal>
    </div>
  );
}
