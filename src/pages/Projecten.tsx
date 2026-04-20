import { useState, useEffect, useRef, useCallback } from 'react';
import { Code as Code2, Plus, ExternalLink, GitBranch, Search, Upload, X, Image, Film, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Project } from '../types';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const TECH_OPTIONS = ['React', 'TypeScript', 'Node.js', 'Python', 'Vue', 'Next.js', 'Laravel', 'Flutter'];
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime';
const MAX_MB = 50;

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export function Projecten() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', author_name: '', author_email: '',
    github_url: '', demo_url: '', image_url: '', media_type: 'image' as 'image' | 'video',
    tech_stack: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useScrollAnimation();

  useEffect(() => {
    fetchProjects();
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
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

  const toggleTech = (tech: string) =>
    setForm((f) => ({
      ...f,
      tech_stack: f.tech_stack.includes(tech)
        ? f.tech_stack.filter((t) => t !== tech)
        : [...f.tech_stack, tech],
    }));

  const handleFile = useCallback(async (file: File) => {
    setUploadError('');
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      setUploadError("Alleen afbeeldingen (JPG, PNG, WebP, GIF) en video's (MP4, WebM) zijn toegestaan.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`Bestand is te groot. Maximum is ${MAX_MB} MB.`);
      return;
    }

    setUploadState('uploading');
    setUploadProgress(10);

    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const interval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 15, 85));
    }, 300);

    const { data, error } = await supabase.storage
      .from('project-media')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    clearInterval(interval);

    if (error || !data) {
      setUploadState('error');
      setUploadError('Upload mislukt. Probeer opnieuw.');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('project-media')
      .getPublicUrl(data.path);

    setUploadProgress(100);
    setUploadState('done');
    setPreviewUrl(publicUrl);
    setForm((f) => ({ ...f, image_url: publicUrl, media_type: isVideo ? 'video' : 'image' }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearMedia = () => {
    setPreviewUrl('');
    setUploadState('idle');
    setUploadProgress(0);
    setUploadError('');
    setForm((f) => ({ ...f, image_url: '', media_type: 'image' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.author_name) return;
    setSubmitting(true);
    await supabase.from('projects').insert({ ...form, status: 'pending' });
    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
    clearMedia();
    setForm({ title: '', description: '', author_name: '', author_email: '', github_url: '', demo_url: '', image_url: '', media_type: 'image', tech_stack: [] });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author_name.toLowerCase().includes(search.toLowerCase()) ||
    p.tech_stack?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="relative w-full h-52 sm:h-64 md:h-72">
        <img
          src="https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Projecten"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-6">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <span className="text-xs font-bold tracking-widest text-roc-300 uppercase block mb-1">Software Talent Hub</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Projecten</h1>
            <p className="text-white/70 text-sm mt-1">Ontdek studentprojecten van ROC van Flevoland</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-8 pb-10">
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
            <Plus size={16} /> Project indienen
          </button>
        </div>

        {submitted && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle2 size={16} /> Je project is ingediend en wacht op goedkeuring.
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
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
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-7 py-5 flex items-center justify-between rounded-t-3xl z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Project indienen</h2>
                <p className="text-xs text-gray-500 mt-0.5">Wacht op goedkeuring voordat het zichtbaar is.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
                <X size={18} />
              </button>
            </div>

            <div className="p-7 space-y-5">
              {/* Media upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Afbeelding of video
                  <span className="ml-1.5 text-xs font-normal text-gray-400">max {MAX_MB} MB — JPG, PNG, WebP, GIF, MP4, WebM</span>
                </label>

                {uploadState !== 'done' ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => uploadState !== 'uploading' && fileInputRef.current?.click()}
                    className={`relative w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                      dragOver
                        ? 'border-roc-500 bg-roc-50 cursor-copy'
                        : uploadState === 'uploading'
                        ? 'border-gray-200 bg-gray-50 cursor-default'
                        : 'border-gray-200 bg-gray-50 hover:border-roc-400 hover:bg-roc-50 cursor-pointer'
                    }`}
                  >
                    {uploadState === 'uploading' ? (
                      <div className="flex flex-col items-center gap-3 w-48">
                        <Upload size={22} className="text-roc-500 animate-bounce" />
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-roc-500 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">Uploaden… {uploadProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                            <Image size={18} className="text-gray-400" />
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                            <Film size={18} className="text-gray-400" />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 text-center">
                          Sleep een bestand hierheen<br />
                          <span className="text-roc-500 font-semibold">of klik om te bladeren</span>
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED}
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    />
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 group">
                    {form.media_type === 'video' ? (
                      <video src={previewUrl} controls className="w-full max-h-52 object-cover" />
                    ) : (
                      <img src={previewUrl} alt="preview" className="w-full max-h-52 object-cover" />
                    )}
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-600 shadow-sm">
                        <CheckCircle2 size={12} />
                        {form.media_type === 'video' ? 'Video' : 'Afbeelding'} geupload
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); clearMedia(); }}
                        className="w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center text-gray-600 backdrop-blur"
                        aria-label="Verwijder"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
                    <AlertCircle size={13} /> {uploadError}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Projectnaam <span className="text-roc-500">*</span></label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="form-input" placeholder="Mijn project" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Beschrijving <span className="text-roc-500">*</span></label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} className="form-input !rounded-2xl" placeholder="Wat heb je gebouwd?" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Naam <span className="text-roc-500">*</span></label>
                  <input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    className="form-input" placeholder="Jouw naam" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail</label>
                  <input type="email" value={form.author_email} onChange={(e) => setForm({ ...form, author_email: e.target.value })}
                    className="form-input" placeholder="naam@email.nl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">GitHub URL</label>
                  <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    className="form-input" placeholder="github.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Demo URL</label>
                  <input value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                    className="form-input" placeholder="mijnproject.nl" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Technologieën</label>
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

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-7 py-4 flex gap-3 rounded-b-3xl">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
                Annuleren
              </button>
              <button onClick={handleSubmit} disabled={submitting || uploadState === 'uploading'}
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

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const isVideo = project.media_type === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(project.image_url ?? '');
  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
      data-animate
      data-animate-delay={`${Math.min(index * 100, 500)}` as '100' | '200' | '300' | '400' | '500'}
    >
      {project.image_url ? (
        isVideo ? (
          <video src={project.image_url} className="w-full h-44 object-cover" autoPlay muted loop playsInline />
        ) : (
          <img src={project.image_url} alt={project.title} className="w-full h-44 object-cover" />
        )
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
  );
}
