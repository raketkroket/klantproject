import { useEffect, useState } from 'react';
import { Plus, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Project, ProjectInsert } from '../lib/database.types';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/ui/Modal';

const TECH_OPTIONS = [
  'React', 'Vue', 'Angular', 'Next.js', 'TypeScript', 'JavaScript',
  'Python', 'Node.js', 'Java', 'C#', 'PHP', 'Go', 'Rust',
  'Docker', 'Kubernetes', 'AWS', 'Firebase', 'Supabase', 'PostgreSQL', 'MongoDB',
];

const defaultForm = {
  title: '',
  description: '',
  author_name: '',
  author_email: '',
  tech_stack: [] as string[],
  github_url: '',
  demo_url: '',
  image_url: '',
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newProjectIds, setNewProjectIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects-page')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'projects',
        filter: 'status=eq.approved',
      }, (payload) => {
        const newProject = payload.new as Project;
        setProjects((prev) => {
          const exists = prev.find((p) => p.id === newProject.id);
          if (exists) return prev;
          setNewProjectIds((ids) => new Set([...ids, newProject.id]));
          setTimeout(() => {
            setNewProjectIds((ids) => {
              const next = new Set(ids);
              next.delete(newProject.id);
              return next;
            });
          }, 5000);
          return [newProject, ...prev];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  }

  function toggleTech(tech: string) {
    setForm((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.includes(tech)
        ? prev.tech_stack.filter((t) => t !== tech)
        : [...prev.tech_stack, tech],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.author_name.trim()) {
      setError('Vul alle verplichte velden in.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const insert: ProjectInsert = {
      title: form.title.trim(),
      description: form.description.trim(),
      author_name: form.author_name.trim(),
      author_email: form.author_email.trim(),
      tech_stack: form.tech_stack,
      github_url: form.github_url.trim(),
      demo_url: form.demo_url.trim(),
      image_url: form.image_url.trim(),
    };

    const { error: err } = await supabase.from('projects').insert(insert);
    setSubmitting(false);
    if (err) {
      setError('Er ging iets mis. Probeer opnieuw.');
    } else {
      setSubmitted(true);
      setForm(defaultForm);
      setTimeout(() => {
        setModalOpen(false);
        setSubmitted(false);
      }, 3000);
    }
  }

  const inputClass = "w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-roc-500 focus:ring-1 focus:ring-roc-500 transition-colors";

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-roc-500 rounded-full animate-pulse" />
              <span className="text-roc-500 text-sm font-semibold uppercase tracking-wide">Live Feed</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Projecten</h1>
            <p className="text-gray-500 mt-2">Ontdek innovatieve projecten van software talent.</p>
          </div>
          <button
            onClick={() => { setModalOpen(true); setSubmitted(false); setError(null); }}
            className="flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-roc-500/30 hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Plus size={18} />
            Project Toevoegen
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="text-roc-500 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24">
            <Upload size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Nog geen goedgekeurde projecten.</p>
            <p className="text-gray-400 text-sm">Wees de eerste die een project indient!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isNew={newProjectIds.has(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSubmitted(false); setError(null); }}
        title="Project Toevoegen"
      >
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Project Ingediend!</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Jouw project is ontvangen en wacht op goedkeuring van een admin. We kijken er naar uit!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Naam <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="Jouw naam" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                <input type="email" value={form.author_email} onChange={(e) => setForm({ ...form, author_email: e.target.value })} placeholder="jouw@email.nl" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Projecttitel <span className="text-red-500">*</span>
              </label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Naam van je project" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Beschrijving <span className="text-red-500">*</span>
              </label>
              <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Vertel wat je project doet, welk probleem het oplost..." className={`${inputClass} resize-none`} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Technologieën</label>
              <div className="flex flex-wrap gap-2">
                {TECH_OPTIONS.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      form.tech_stack.includes(tech)
                        ? 'bg-roc-500 text-white border-roc-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-roc-300 hover:text-roc-500'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">GitHub URL</label>
                <input type="url" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Demo URL</label>
                <input type="url" value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} placeholder="https://..." className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Afbeelding URL</label>
              <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://images.pexels.com/..." className={inputClass} />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-roc-500 hover:bg-roc-600 disabled:bg-roc-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                {submitting ? <><Loader2 size={18} className="animate-spin" />Indienen...</> : <><Upload size={18} />Project Indienen</>}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">Je project wordt eerst beoordeeld door een admin voor publicatie.</p>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
