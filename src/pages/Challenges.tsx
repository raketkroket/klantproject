import { useState, useEffect, useMemo } from 'react';
import {
  Trophy, Plus, Calendar, Building2, Clock, Tag, ArrowRight, X,
  Sparkles, Flame, Target, Search, Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Challenge } from '../types';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const DIFFICULTY_META = {
  beginner:     { label: 'Beginner',  dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Sparkles },
  intermediate: { label: 'Gevorderd', dot: 'bg-amber-500',   pill: 'bg-amber-50 text-amber-700 border-amber-100',       icon: Flame    },
  advanced:     { label: 'Expert',    dot: 'bg-rose-500',    pill: 'bg-rose-50 text-rose-700 border-rose-100',          icon: Target   },
} as const;

const CATEGORIES = ['Alle', 'Web', 'Mobile', 'AI & Data', 'Design', 'Game', 'Overig'] as const;

type CategoryFilter = typeof CATEGORIES[number];

export function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('Alle');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Challenge | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', company_name: '', contact_email: '',
    deadline: '', difficulty: 'beginner' as Challenge['difficulty'], prize: '',
    image_url: '', category: 'Web', duration: '',
  });
  useScrollAnimation();

  useEffect(() => {
    fetchChallenges();
    const channel = supabase
      .channel('challenges-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, fetchChallenges)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    setChallenges(data ?? []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.company_name) return;
    setSubmitting(true);
    await supabase.from('challenges').insert({ ...form, status: 'pending' });
    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
    setForm({
      title: '', description: '', company_name: '', contact_email: '',
      deadline: '', difficulty: 'beginner', prize: '',
      image_url: '', category: 'Web', duration: '',
    });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const filtered = useMemo(() => challenges.filter((c) => {
    const matchesCat = activeCategory === 'Alle' || (c.category || '').toLowerCase() === activeCategory.toLowerCase();
    const q = search.trim().toLowerCase();
    const matchesSearch = !q
      || c.title.toLowerCase().includes(q)
      || (c.company_name ?? '').toLowerCase().includes(q)
      || (c.description ?? '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  }), [challenges, activeCategory, search]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const daysUntil = (deadline?: string | null) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      {/* Hero with background pattern */}
      <div className="relative w-full overflow-hidden bg-gray-900">
        <img
          src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Challenges"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-transparent" />
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="flex items-center gap-2 text-roc-300 text-xs font-bold tracking-widest uppercase mb-3">
            <Trophy size={14} /> Voor studenten
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05] max-w-3xl">
            Los echte challenges op van <span className="text-roc-400">echte bedrijven</span>.
          </h1>
          <p className="text-white/70 text-base md:text-lg mt-5 max-w-2xl leading-relaxed">
            Zet je vaardigheden in praktijk, bouw aan je portfolio en maak kans op prijzen,
            stages en werkervaring bij bedrijven uit Flevoland.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <Plus size={16} /> Challenge plaatsen
            </button>
            <a
              href="#overzicht"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold px-6 py-3 rounded-full transition-colors border border-white/20"
            >
              Bekijk overzicht <ArrowRight size={16} />
            </a>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 max-w-xl">
            <Stat value={challenges.length} label="Open challenges" />
            <Stat value={new Set(challenges.map((c) => c.company_name)).size} label="Bedrijven" />
            <Stat value={challenges.filter((c) => c.prize).length} label="Met prijzen" />
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div id="overzicht" className="sticky top-[72px] z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeCategory === c
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek op titel of bedrijf…"
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10 pb-20">
        {submitted && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm flex items-center gap-2">
            <Sparkles size={16} /> Je challenge is ingediend en wacht op goedkeuring.
          </div>
        )}

        {loading ? (
          <LoadingGrid />
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => setShowForm(true)} />
        ) : (
          <>
            {featured && (
              <FeaturedCard challenge={featured} onOpen={() => setDetail(featured)} daysUntil={daysUntil(featured.deadline)} />
            )}

            {rest.length > 0 && (
              <>
                <div className="flex items-baseline justify-between mt-16 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Meer challenges</h2>
                  <span className="text-sm text-gray-400">{rest.length} {rest.length === 1 ? 'challenge' : 'challenges'}</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((c, i) => (
                    <ChallengeCard
                      key={c.id}
                      challenge={c}
                      onOpen={() => setDetail(c)}
                      daysUntil={daysUntil(c.deadline)}
                      index={i}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {detail && <DetailModal challenge={detail} onClose={() => setDetail(null)} daysUntil={daysUntil(detail.deadline)} />}
      {showForm && (
        <SubmitModal
          form={form}
          setForm={setForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-white">{value}</div>
      <div className="text-xs md:text-sm text-white/60 mt-1">{label}</div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="space-y-8">
      <div className="h-80 bg-gray-100 rounded-3xl animate-pulse" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map((i) => <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-24 border border-dashed border-gray-200 rounded-3xl bg-gray-50">
      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm mx-auto flex items-center justify-center mb-5">
        <Trophy size={28} className="text-gray-400" />
      </div>
      <h3 className="font-bold text-gray-900 text-lg">Geen challenges in deze categorie</h3>
      <p className="text-sm text-gray-500 mt-1">Wees de eerste en plaats zelf een challenge.</p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm"
      >
        <Plus size={15} /> Challenge plaatsen
      </button>
    </div>
  );
}

function DeadlineBadge({ days }: { days: number | null }) {
  if (days === null) return null;
  const urgent = days <= 7 && days >= 0;
  const expired = days < 0;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
      expired ? 'bg-gray-100 text-gray-500'
      : urgent ? 'bg-rose-50 text-rose-600 border border-rose-100'
      : 'bg-white/80 text-gray-700 border border-gray-200 backdrop-blur'
    }`}>
      <Clock size={11} />
      {expired ? 'Verlopen' : days === 0 ? 'Vandaag' : `${days} dagen`}
    </span>
  );
}

function FeaturedCard({ challenge, onOpen, daysUntil }: { challenge: Challenge; onOpen: () => void; daysUntil: number | null }) {
  const diff = DIFFICULTY_META[challenge.difficulty ?? 'beginner'];
  const DiffIcon = diff.icon;
  return (
    <article
      onClick={onOpen}
      className="group relative grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer"
      data-animate
    >
      <div className="relative h-64 md:h-auto min-h-[320px] bg-gray-100 overflow-hidden">
        {challenge.image_url ? (
          <img src={challenge.image_url} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-roc-500 to-roc-700 flex items-center justify-center">
            <Trophy size={64} className="text-white/30" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur text-gray-900 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
            <Sparkles size={12} className="text-roc-500" /> Uitgelicht
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <DeadlineBadge days={daysUntil} />
        </div>
      </div>

      <div className="p-7 md:p-10 flex flex-col">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {challenge.category && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              <Tag size={11} /> {challenge.category}
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${diff.pill}`}>
            <DiffIcon size={11} /> {diff.label}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 text-2xl md:text-3xl leading-tight mb-3">{challenge.title}</h3>
        <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6">{challenge.description}</p>

        <div className="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 text-sm">
          <MetaItem icon={Building2} label="Bedrijf" value={challenge.company_name} />
          {challenge.deadline && (
            <MetaItem icon={Calendar} label="Deadline" value={new Date(challenge.deadline).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })} />
          )}
          {challenge.duration && <MetaItem icon={Clock} label="Duur" value={challenge.duration} />}
          {challenge.prize && <MetaItem icon={Trophy} label="Prijs" value={challenge.prize} accent />}
        </div>

        <div className="mt-6 inline-flex items-center gap-2 text-roc-500 font-semibold text-sm group-hover:gap-3 transition-all">
          Bekijk challenge <ArrowRight size={16} />
        </div>
      </div>
    </article>
  );
}

function MetaItem({ icon: Icon, label, value, accent }: { icon: typeof Trophy; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'}`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-400 font-medium">{label}</div>
        <div className={`text-sm font-semibold truncate ${accent ? 'text-amber-700' : 'text-gray-900'}`}>{value}</div>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, onOpen, daysUntil, index }: { challenge: Challenge; onOpen: () => void; daysUntil: number | null; index: number }) {
  const diff = DIFFICULTY_META[challenge.difficulty ?? 'beginner'];
  return (
    <article
      onClick={onOpen}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-transparent hover:shadow-xl transition-all cursor-pointer flex flex-col"
      data-animate
      data-animate-delay={`${Math.min(index * 100, 500)}` as '100'|'200'|'300'|'400'|'500'}
    >
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {challenge.image_url ? (
          <img src={challenge.image_url} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <Trophy size={40} className="text-white/20" />
          </div>
        )}
        <div className="absolute inset-x-3 top-3 flex justify-between">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${diff.pill} border backdrop-blur`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {diff.label}
          </span>
          <DeadlineBadge days={daysUntil} />
        </div>
        {challenge.prize && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            <Trophy size={11} /> {challenge.prize}
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Building2 size={11} />
          <span className="truncate font-medium">{challenge.company_name}</span>
          {challenge.category && (
            <>
              <span>·</span>
              <span className="truncate">{challenge.category}</span>
            </>
          )}
        </div>
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-roc-600 transition-colors">{challenge.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{challenge.description}</p>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
          {challenge.deadline ? (
            <span className="flex items-center gap-1.5"><Calendar size={12} />{new Date(challenge.deadline).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</span>
          ) : <span />}
          <span className="inline-flex items-center gap-1 text-roc-500 font-semibold group-hover:gap-2 transition-all">
            Bekijk <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </article>
  );
}

function DetailModal({ challenge, onClose, daysUntil }: { challenge: Challenge; onClose: () => void; daysUntil: number | null }) {
  const diff = DIFFICULTY_META[challenge.difficulty ?? 'beginner'];
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 md:h-72 bg-gray-100 overflow-hidden rounded-t-3xl">
          {challenge.image_url ? (
            <img src={challenge.image_url} alt={challenge.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-roc-500 to-roc-700 flex items-center justify-center">
              <Trophy size={72} className="text-white/30" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center text-gray-700 transition-colors"
            aria-label="Sluiten"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-7 md:p-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${diff.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
              {diff.label}
            </span>
            {challenge.category && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                <Tag size={11} /> {challenge.category}
              </span>
            )}
            <DeadlineBadge days={daysUntil} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{challenge.title}</h2>
          <p className="text-gray-500 text-sm mb-6 flex items-center gap-1.5">
            <Building2 size={13} /> {challenge.company_name}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {challenge.deadline && (
              <InfoTile icon={Calendar} label="Deadline" value={new Date(challenge.deadline).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} />
            )}
            {challenge.duration && <InfoTile icon={Clock} label="Duur" value={challenge.duration} />}
            {challenge.prize && <InfoTile icon={Trophy} label="Prijs" value={challenge.prize} accent />}
            <InfoTile icon={diff.icon} label="Niveau" value={diff.label} />
          </div>

          <h3 className="font-bold text-gray-900 mb-2">Omschrijving</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{challenge.description}</p>

          {challenge.contact_email && (
            <a
              href={`mailto:${challenge.contact_email}?subject=${encodeURIComponent('Challenge: ' + challenge.title)}`}
              className="mt-8 inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Neem contact op <ArrowRight size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value, accent }: { icon: typeof Trophy; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-3 border ${accent ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1">
        <Icon size={12} /> {label}
      </div>
      <div className={`text-sm font-bold truncate ${accent ? 'text-amber-700' : 'text-gray-900'}`}>{value}</div>
    </div>
  );
}

type FormState = {
  title: string; description: string; company_name: string; contact_email: string;
  deadline: string; difficulty: Challenge['difficulty']; prize: string;
  image_url: string; category: string; duration: string;
};

function SubmitModal({
  form, setForm, onClose, onSubmit, submitting,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-7 py-5 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Challenge plaatsen</h2>
            <p className="text-xs text-gray-500 mt-0.5">Je challenge wordt eerst beoordeeld.</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-7 space-y-5">
          <Field label="Titel" required>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input" placeholder="Naam van de challenge" />
          </Field>

          <Field label="Cover afbeelding (URL)">
            <div className="relative">
              <ImageIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="form-input pl-10" placeholder="https://..." />
            </div>
            {form.image_url && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 h-32">
                <img src={form.image_url} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />
              </div>
            )}
          </Field>

          <Field label="Beschrijving" required>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4} className="form-input !rounded-2xl" placeholder="Wat moet er gebouwd worden? Wat is de context?" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Bedrijf" required>
              <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="form-input" placeholder="Bedrijfsnaam" />
            </Field>
            <Field label="Contact e-mail">
              <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="form-input" placeholder="contact@bedrijf.nl" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Categorie">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="form-input">
                {CATEGORIES.filter((c) => c !== 'Alle').map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Duur">
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="form-input" placeholder="Bijv. 2-4 weken" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Deadline">
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="form-input" />
            </Field>
            <Field label="Prijs">
              <input value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })}
                className="form-input" placeholder="€500 / stage / ..." />
            </Field>
          </div>

          <Field label="Moeilijkheidsgraad">
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((d) => {
                const meta = DIFFICULTY_META[d];
                const Icon = meta.icon;
                const active = form.difficulty === d;
                return (
                  <button key={d} type="button" onClick={() => setForm({ ...form, difficulty: d })}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold border transition-colors ${
                      active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}>
                    <Icon size={12} /> {meta.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-7 py-4 flex gap-3 rounded-b-3xl">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
            Annuleren
          </button>
          <button onClick={onSubmit} disabled={submitting}
            className="flex-1 bg-roc-500 hover:bg-roc-600 text-white py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-60">
            {submitting ? 'Verzenden…' : 'Indienen'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-roc-500">*</span>}
      </label>
      {children}
    </div>
  );
}
