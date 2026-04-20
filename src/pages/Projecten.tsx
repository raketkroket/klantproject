import { useState, useEffect } from 'react';
import { Code as Code2, Plus, ExternalLink, GitBranch, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Project } from '../types';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const TECH_OPTIONS = ['React', 'TypeScript', 'Node.js', 'Python', 'Vue', 'Next.js', 'Laravel', 'Flutter'];

export function Projecten() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', author_name: '', author_email: '',
    github_url: '', demo_url: '', image_url: '', tech_stack: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  useScrollAnimation();

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  };

  const toggleTech = (tech: string) => {
    setForm((f) => ({
      ...f,
      tech_stack: f.tech_stack.includes(tech)
        ? f.tech_stack.filter((t) => t !== tech)
        : [...f.tech_stack, tech],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.author_name) return;
    setSubmitting(true);
    await supabase.from('projects').insert({ ...form, status: 'pending' });
    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
    setForm({ title: '', description: '', author_name: '', author_email: '', github_url: '', demo_url: '', image_url: '', tech_stack: [] });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author_name.toLowerCase().includes(search.toLowerCase()) ||
    p.tech_stack?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="relative w-full" style={{ height: '420px' }}>
        <img
          src="https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Projecten"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-0 left-8 md:left-16 translate-y-1/2 z-10">
          <div className="bg-roc-500 rounded-2xl px-8 py-7 max-w-xs shadow-xl">
            <h1 className="text-3xl font-bold text-white mb-1">Projecten</h1>
            <p className="text-white/80 text-sm">Ontdek studentprojecten van ROC van Flevoland</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek op titel, auteur of technologie…"
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-roc-500"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-5 py-3 rounded-full transition-colors shrink-0"
          >
            <Plus size={16} />
            Project indienen
          </button>
        </div>

        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            Je project is ingediend en wacht op goedkeuring.
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Code2 size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">Nog geen projecten</p>
            <p className="text-sm mt-1">Wees de eerste om een project in te dienen!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, i) => (
              <div
                key={project.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                data-animate
                data-animate-delay={`${Math.min(i * 100, 500)}` as '100' | '200' | '300' | '400' | '500'}
              >
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="w-full h-44 object-cover" />
                ) : (
                  <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Code2 size={32} className="text-gray-300" />
                  </div>
                )}
                <div className="p-5">
                  {project.tech_stack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.tech_stack.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs font-semibold bg-roc-50 text-roc-600 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 mb-1">{project.title}</h3>
                  <p className="text-xs text-gray-400 mb-2">door {project.author_name}</p>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{project.description}</p>
                  {(project.github_url || project.demo_url) && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                          <GitBranch size={13} /> Code
                        </a>
                      )}
                      {project.demo_url && (
                        <a href={project.demo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-roc-500 hover:text-roc-700 transition-colors">
                          <ExternalLink size={13} /> Demo
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-5">Project indienen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projectnaam *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" placeholder="Mijn project" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" placeholder="Wat heb je gebouwd?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
                  <input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" placeholder="Jouw naam" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input type="email" value={form.author_email} onChange={(e) => setForm({ ...form, author_email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" placeholder="naam@email.nl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                  <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" placeholder="github.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Demo URL</label>
                  <input value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" placeholder="mijnproject.nl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technologieën</label>
                <div className="flex flex-wrap gap-2">
                  {TECH_OPTIONS.map((t) => (
                    <button key={t} type="button" onClick={() => toggleTech(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        form.tech_stack.includes(t) ? 'bg-roc-500 text-white border-roc-500' : 'bg-white text-gray-600 border-gray-200 hover:border-roc-300'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                Annuleren
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-roc-500 hover:bg-roc-600 text-white py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-60">
                {submitting ? 'Verzenden…' : 'Indienen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
