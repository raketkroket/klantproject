import { useEffect, useState } from 'react';
import { LayoutDashboard, FolderGit2, Zap, Newspaper, Mail, CircleCheck as CheckCircle, Circle as XCircle, Clock, Loader as Loader2, Plus, Trash2, CircleAlert as AlertCircle, LogOut, Eye, EyeOff, Hop as Home } from 'lucide-react';
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

    // Real-time subscriptions
    const projectsChannel = supabase
      .channel('admin-projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchProjects())
      .subscribe();

    const challengesChannel = supabase
      .channel('admin-challenges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => fetchChallenges())
      .subscribe();

    const newsChannel = supabase
      .channel('admin-news')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => fetchNews())
      .subscribe();

    const messagesChannel = supabase
      .channel('admin-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => fetchMessages())
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(challengesChannel);
      supabase.removeChannel(newsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  async function fetchProjects() {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
  }

  async function fetchChallenges() {
    const { data } = await supabase.from('challenges').select('*').order('created_at', { ascending: false });
    if (data) setChallenges(data);
  }

  async function fetchNews() {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (data) setNews(data);
  }

  async function fetchMessages() {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (data) setMessages(data);
  }

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchProjects(), fetchChallenges(), fetchNews(), fetchMessages()]);
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

  async function deleteProject(id: string) {
    await supabase.from('projects').delete().eq('id', id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function deleteChallenge(id: string) {
    await supabase.from('challenges').delete().eq('id', id);
    setChallenges((prev) => prev.filter((c) => c.id !== id));
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
      setNewsError('Er ging iets mis. Probeer het opnieuw.');
    } else {
      if (data) setNews((prev) => [data, ...prev]);
      setNewsForm(defaultNewsForm);
      setNewsModalOpen(false);
    }
  }

  const pendingProjects = projects.filter((p) => p.status === 'pending');
  const pendingChallenges = challenges.filter((c) => c.status === 'pending');
  const unreadMessages = messages.length;

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
    { id: 'messages', label: 'Berichten', icon: Mail, count: unreadMessages || undefined },
  ];

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-roc-500 focus:ring-1 focus:ring-roc-500 transition-colors";

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src="/image.png" alt="ROC van Flevoland" className="h-10 w-auto" />
              <span className="text-sm font-semibold text-gray-400 hidden sm:block">Beheerderspaneel</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('home')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <Home size={15} />
                <span className="hidden sm:inline">Naar site</span>
              </button>
              <button
                onClick={() => { signOut(); navigate('home'); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-roc-500 transition-colors px-3 py-2 rounded-lg hover:bg-roc-50"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Uitloggen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  tab === id
                    ? 'border-roc-500 text-roc-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
                }`}
              >
                <Icon size={15} />
                {label}
                {count !== undefined && count > 0 && (
                  <span className="ml-0.5 bg-roc-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none font-bold">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="text-roc-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Dashboard</h1>
                  <p className="text-gray-400 text-sm">Ingelogd als {user.email}</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Projecten te beoordelen', value: pendingProjects.length, icon: FolderGit2, color: 'text-amber-500', bg: 'bg-amber-50', tab: 'projects' as Tab },
                    { label: 'Challenges te beoordelen', value: pendingChallenges.length, icon: Zap, color: 'text-roc-500', bg: 'bg-roc-50', tab: 'challenges' as Tab },
                    { label: 'Nieuwsberichten', value: news.length, icon: Newspaper, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'news' as Tab },
                    { label: 'Contactberichten', value: messages.length, icon: Mail, color: 'text-sky-600', bg: 'bg-sky-50', tab: 'messages' as Tab },
                  ].map(({ label, value, icon: Icon, color, bg, tab: t }) => (
                    <button
                      key={label}
                      onClick={() => setTab(t)}
                      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-left hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon size={18} className={color} />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{value}</p>
                      <p className="text-gray-400 text-xs mt-1">{label}</p>
                    </button>
                  ))}
                </div>

                {/* Pending items quick view */}
                {(pendingProjects.length > 0 || pendingChallenges.length > 0) && (
                  <div className="space-y-6">
                    {pendingProjects.length > 0 && (
                      <div>
                        <h2 className="text-gray-900 font-semibold mb-3 flex items-center gap-2 text-sm">
                          <Clock size={15} className="text-amber-500" />
                          Projecten wachtend op goedkeuring
                        </h2>
                        <div className="space-y-2">
                          {pendingProjects.slice(0, 5).map((p) => (
                            <div key={p.id} className="bg-white rounded-xl border border-amber-100 p-4 flex items-center justify-between gap-4 shadow-sm">
                              <div className="min-w-0">
                                <p className="text-gray-900 text-sm font-semibold truncate">{p.title}</p>
                                <p className="text-gray-400 text-xs mt-0.5">door {p.author_name} · {new Date(p.created_at).toLocaleDateString('nl-NL')}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => updateProjectStatus(p.id, 'approved')} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-emerald-200">
                                  <CheckCircle size={12} /> Goedkeuren
                                </button>
                                <button onClick={() => updateProjectStatus(p.id, 'rejected')} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-red-200">
                                  <XCircle size={12} /> Afwijzen
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pendingChallenges.length > 0 && (
                      <div>
                        <h2 className="text-gray-900 font-semibold mb-3 flex items-center gap-2 text-sm">
                          <Clock size={15} className="text-roc-500" />
                          Challenges wachtend op goedkeuring
                        </h2>
                        <div className="space-y-2">
                          {pendingChallenges.slice(0, 5).map((c) => (
                            <div key={c.id} className="bg-white rounded-xl border border-roc-100 p-4 flex items-center justify-between gap-4 shadow-sm">
                              <div className="min-w-0">
                                <p className="text-gray-900 text-sm font-semibold truncate">{c.title}</p>
                                <p className="text-gray-400 text-xs mt-0.5">{c.company_name} · {new Date(c.created_at).toLocaleDateString('nl-NL')}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => updateChallengeStatus(c.id, 'approved')} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-emerald-200">
                                  <CheckCircle size={12} /> Goedkeuren
                                </button>
                                <button onClick={() => updateChallengeStatus(c.id, 'rejected')} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-red-200">
                                  <XCircle size={12} /> Afwijzen
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {pendingProjects.length === 0 && pendingChallenges.length === 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">Alles bijgewerkt</p>
                    <p className="text-sm text-gray-400 mt-1">Er zijn geen inzendingen die wachten op goedkeuring.</p>
                  </div>
                )}
              </div>
            )}

            {/* PROJECTS */}
            {tab === 'projects' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Projecten</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{projects.length} totaal · {pendingProjects.length} wachtend</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {projects.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <FolderGit2 size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Geen projecten gevonden.</p>
                    </div>
                  ) : (
                    projects.map((p) => (
                      <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-gray-900 font-semibold text-sm">{p.title}</span>
                              {statusBadge(p.status)}
                            </div>
                            <p className="text-gray-400 text-xs mb-2">
                              door <span className="font-medium text-gray-600">{p.author_name}</span>
                              {p.author_email ? ` (${p.author_email})` : ''} · {new Date(p.created_at).toLocaleDateString('nl-NL')}
                            </p>
                            <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{p.description}</p>
                            {p.tech_stack && p.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {p.tech_stack.slice(0, 6).map((t) => (
                                  <span key={t} className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 text-xs">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {p.status === 'pending' && (
                              <>
                                <button onClick={() => updateProjectStatus(p.id, 'approved')} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-emerald-200">
                                  <CheckCircle size={12} /> Goedkeuren
                                </button>
                                <button onClick={() => updateProjectStatus(p.id, 'rejected')} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-red-200">
                                  <XCircle size={12} /> Afwijzen
                                </button>
                              </>
                            )}
                            <button onClick={() => deleteProject(p.id)} className="flex items-center gap-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-gray-200 hover:border-red-200">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* CHALLENGES */}
            {tab === 'challenges' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Challenges</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{challenges.length} totaal · {pendingChallenges.length} wachtend</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {challenges.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <Zap size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Geen challenges gevonden.</p>
                    </div>
                  ) : (
                    challenges.map((c) => (
                      <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-gray-900 font-semibold text-sm">{c.title}</span>
                              {statusBadge(c.status)}
                            </div>
                            <p className="text-gray-400 text-xs mb-2">
                              <span className="font-medium text-gray-600">{c.company_name}</span>
                              {c.contact_email ? ` · ${c.contact_email}` : ''} · {new Date(c.created_at).toLocaleDateString('nl-NL')}
                            </p>
                            <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{c.description}</p>
                            {c.prize && (
                              <span className="inline-block mt-2 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{c.prize}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {c.status === 'pending' && (
                              <>
                                <button onClick={() => updateChallengeStatus(c.id, 'approved')} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-emerald-200">
                                  <CheckCircle size={12} /> Goedkeuren
                                </button>
                                <button onClick={() => updateChallengeStatus(c.id, 'rejected')} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-red-200">
                                  <XCircle size={12} /> Afwijzen
                                </button>
                              </>
                            )}
                            <button onClick={() => deleteChallenge(c.id)} className="flex items-center gap-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-gray-200 hover:border-red-200">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* NEWS */}
            {tab === 'news' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Nieuws</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{news.length} berichten</p>
                  </div>
                  <button
                    onClick={() => { setNewsModalOpen(true); setNewsError(null); }}
                    className="flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Plus size={15} />
                    Nieuwsbericht
                  </button>
                </div>
                <div className="space-y-3">
                  {news.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Nog geen nieuwsberichten.</p>
                      <p className="text-xs mt-1">Klik op "Nieuwsbericht" om te beginnen.</p>
                    </div>
                  ) : (
                    news.map((n) => (
                      <div key={n.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex gap-4">
                        {n.image_url && (
                          <img src={n.image_url} alt={n.title} className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-semibold text-sm mb-0.5">{n.title}</p>
                          {n.excerpt && <p className="text-gray-400 text-xs line-clamp-1 mb-1">{n.excerpt}</p>}
                          <p className="text-gray-300 text-xs">
                            {new Date(n.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNews(n.id)}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-red-200 flex-shrink-0 self-start"
                        >
                          <Trash2 size={12} /> Verwijderen
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {tab === 'messages' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Contactberichten</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{messages.length} berichten</p>
                </div>
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <Mail size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Geen contactberichten.</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-0.5 flex-wrap">
                              <span className="text-gray-900 font-semibold text-sm">{m.name}</span>
                              <a href={`mailto:${m.email}`} className="text-roc-500 text-xs hover:underline">{m.email}</a>
                            </div>
                            {m.subject && <p className="text-gray-700 text-sm font-medium mb-2">{m.subject}</p>}
                            {expandedMessage === m.id ? (
                              <p className="text-gray-500 text-sm leading-relaxed">{m.message}</p>
                            ) : (
                              <p className="text-gray-400 text-xs line-clamp-2">{m.message}</p>
                            )}
                          </div>
                          <button
                            onClick={() => setExpandedMessage(expandedMessage === m.id ? null : m.id)}
                            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-gray-200 flex-shrink-0"
                          >
                            {expandedMessage === m.id ? <EyeOff size={12} /> : <Eye size={12} />}
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

      {/* News modal */}
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
