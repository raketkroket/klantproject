import { useState, useEffect } from 'react';
import { Trophy, Plus, Calendar, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Challenge } from '../types';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-red-50 text-red-700',
};

const DIFFICULTY_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Gevorderd',
  advanced: 'Expert',
};

export function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', company_name: '', contact_email: '',
    deadline: '', difficulty: 'beginner' as Challenge['difficulty'], prize: '',
  });
  useScrollAnimation();

  useEffect(() => {
    fetchChallenges();

    const channel = supabase
      .channel('challenges-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => {
        fetchChallenges();
      })
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
    setForm({ title: '', description: '', company_name: '', contact_email: '', deadline: '', difficulty: 'beginner', prize: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative w-full h-52 sm:h-64 md:h-72">
        <img
          src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Challenges"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-5 sm:left-10 md:left-14">
          <span className="text-xs font-bold tracking-widest text-roc-300 uppercase block mb-1">Voor studenten</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Challenges</h1>
          <p className="text-white/70 text-sm mt-1">Pak een uitdaging op van een bedrijf</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10">
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-5 py-3 rounded-full transition-colors"
          >
            <Plus size={16} />
            Challenge plaatsen
          </button>
        </div>

        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            Je challenge is ingediend en wacht op goedkeuring.
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {[1,2].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-52 animate-pulse" />)}
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Trophy size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">Geen challenges beschikbaar</p>
            <p className="text-sm mt-1">Bedrijven kunnen hier hun opdrachten plaatsen.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {challenges.map((c, i) => (
              <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all" data-animate data-animate-delay={`${Math.min(i * 100, 500)}` as '100'|'200'|'300'|'400'|'500'}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_COLORS[c.difficulty ?? 'beginner']}`}>
                    {DIFFICULTY_LABELS[c.difficulty ?? 'beginner']}
                  </span>
                  {c.prize && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Trophy size={11} /> {c.prize}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">{c.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
                  <span className="flex items-center gap-1.5"><Building2 size={12} />{c.company_name}</span>
                  {c.deadline && (
                    <span className="flex items-center gap-1.5"><Calendar size={12} />{new Date(c.deadline).toLocaleDateString('nl-NL')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-7" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Challenge plaatsen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" placeholder="Naam van de challenge" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" placeholder="Wat moet er gebouwd worden?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijf *</label>
                  <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" placeholder="Bedrijfsnaam" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact e-mail</label>
                  <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" placeholder="contact@bedrijf.nl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prijsomschrijving</label>
                  <input value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500" placeholder="€500 / stage / ..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Moeilijkheidsgraad</label>
                <div className="flex gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                    <button key={d} type="button" onClick={() => setForm({ ...form, difficulty: d })}
                      className={`flex-1 py-2 rounded-full text-xs font-semibold border transition-colors ${form.difficulty === d ? 'bg-roc-500 text-white border-roc-500' : 'bg-white text-gray-600 border-gray-200 hover:border-roc-300'}`}>
                      {DIFFICULTY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">Annuleren</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-roc-500 hover:bg-roc-600 text-white py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-60">
                {submitting ? 'Verzenden…' : 'Indienen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
