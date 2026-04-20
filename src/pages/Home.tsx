import { useState, useEffect, useRef } from 'react';
import { Pause, Play, ArrowRight, Code as Code2, Briefcase, GraduationCap, Users, ChevronRight } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const heroSlides = [
  {
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80',
    label: 'STUDENTEN',
    title: 'Bouw mee aan de software van morgen',
    description: 'Werk aan echte projecten voor lokale bedrijven en zet je vaardigheden om in tastbare resultaten.',
  },
  {
    image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80',
    label: 'JONGEREN',
    title: 'Jouw code, echte impact in de regio',
    description: 'Ontdek uitdagingen van bedrijven uit Flevoland en laat zien wat je waard bent als developer.',
  },
  {
    image: 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80',
    label: 'TALENT',
    title: 'Software Talent Hub — maakt werk van je talent',
    description: 'ROC van Flevoland verbindt talentvolle studenten met innovatieve bedrijven voor een sterke digitale toekomst.',
  },
];

const partnerLogos: { id: number; name: string }[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Partner ${i + 1}`,
}));

const stats = [
  { value: '200+', label: 'Actieve studenten' },
  { value: '40+', label: 'Partnerbedrijven' },
  { value: '120+', label: 'Projecten ingediend' },
  { value: '30+', label: 'Challenges geplaatst' },
];

export function Home() {
  const { navigate } = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useScrollAnimation();

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused]);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 'min(100svh, 700px)' }}>
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === activeSlide ? 1 : 0, zIndex: i === activeSlide ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)' }} />
          </div>
        ))}

        {/* Hero text — left bottom */}
        <div className="relative z-10 flex flex-col min-h-[inherit]" style={{ minHeight: 'min(100svh, 700px)' }}>
          <div className="mt-auto px-5 sm:px-10 md:px-16 pb-12 md:pb-16 max-w-2xl">
            <p className="text-xs font-bold tracking-[0.18em] text-roc-300 uppercase mb-3">
              {heroSlides[activeSlide].label}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              {heroSlides[activeSlide].title}
            </h1>
            <p className="text-base text-white/75 leading-relaxed mb-8 max-w-md">
              {heroSlides[activeSlide].description}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('projecten')}
                className="flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
              >
                Bekijk projecten <ArrowRight size={15} />
              </button>
              <button
                onClick={() => navigate('challenges')}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/40 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm backdrop-blur-sm"
              >
                Challenges
              </button>
            </div>
          </div>

          {/* Slide controls */}
          <div className="absolute bottom-5 right-5 sm:right-10 flex items-center gap-3 z-10">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === activeSlide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
            <button
              onClick={() => setPaused((p) => !p)}
              className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors ml-1"
            >
              {paused ? <Play size={12} fill="white" /> : <Pause size={12} fill="white" />}
            </button>
          </div>
        </div>
      </section>

      {/* ── WAT IS DE SOFTWARE TALENT HUB? ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div data-animate>
              <span className="inline-block text-xs font-bold tracking-widest text-roc-500 uppercase mb-4">
                Over het platform
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
                Software Talent Hub —<br />
                <span className="text-roc-500">maakt werk van je talent</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8 text-[15px]">
                De Software Talent Hub van ROC van Flevoland is het verbindende platform tussen studenten, bedrijven en onderwijs. Studenten laten hier zien wat ze kunnen door echte uitdagingen op te lossen voor lokale bedrijven.
              </p>
              <button
                onClick={() => navigate('contact')}
                className="inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
              >
                Neem contact op <ArrowRight size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4" data-animate data-animate-delay="200">
              {[
                { icon: Code2, title: 'Projecten', desc: 'Studenten publiceren hun softwareprojecten voor de wereld', color: 'bg-blue-50 text-blue-600' },
                { icon: Briefcase, title: 'Challenges', desc: 'Bedrijven plaatsen echte opdrachten voor studenten', color: 'bg-amber-50 text-amber-600' },
                { icon: GraduationCap, title: 'Leren', desc: 'Leer van praktijkervaring en echte klanten', color: 'bg-green-50 text-green-600' },
                { icon: Users, title: 'Netwerk', desc: 'Bouw je portfolio en professioneel netwerk op', color: 'bg-roc-50 text-roc-600' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="bg-gray-50 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DECISION PATH — ROC-style orange banner ── */}
      <section className="bg-roc-500 py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="mb-10" data-animate>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Wat wil jij doen?</h2>
            <p className="text-white/70 text-sm">Kies je pad op het Software Talent Hub platform</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Ik ben student',
                desc: 'Dien een project in en laat zien wat je kan',
                action: () => navigate('projecten'),
              },
              {
                title: 'Ik ben een bedrijf',
                desc: 'Plaats een challenge voor onze studenten',
                action: () => navigate('challenges'),
              },
              {
                title: 'Ik wil meer weten',
                desc: 'Neem contact op met het informatiecentrum',
                action: () => navigate('contact'),
              },
            ].map(({ title, desc, action }, i) => (
              <button
                key={title}
                onClick={action}
                className="group bg-white hover:bg-gray-50 rounded-2xl p-6 text-left transition-all flex items-start justify-between gap-4 shadow-sm hover:shadow-md"
                data-animate
                data-animate-delay={`${(i + 1) * 100}` as '100' | '200' | '300'}
              >
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-roc-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-roc-600 transition-colors">
                  <ChevronRight size={16} className="text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gray-900 py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }, i) => (
              <div
                key={label}
                className="text-center"
                data-animate
                data-animate-delay={`${i * 100}` as '100' | '200' | '300'}
              >
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{value}</p>
                <p className="text-gray-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS MARQUEE ── */}
      <section className="bg-white py-14 overflow-hidden border-b border-gray-100">
        <p className="text-center text-xs font-bold tracking-widest text-gray-400 uppercase mb-10">
          Samenwerkingspartners
        </p>
        <div
          className="relative flex"
          style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}
        >
          <div className="flex gap-6 shrink-0" style={{ animation: 'marquee 28s linear infinite' }}>
            {[...partnerLogos, ...partnerLogos].map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="shrink-0 w-36 h-14 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center"
              >
                <span className="text-xs font-semibold text-gray-300">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENTE PROJECTEN ── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4" data-animate>
            <div>
              <span className="inline-block text-xs font-bold tracking-widest text-roc-500 uppercase mb-3">
                Uitgelicht
              </span>
              <h2 className="text-3xl font-bold text-gray-900">Recente projecten</h2>
            </div>
            <button
              onClick={() => navigate('projecten')}
              className="inline-flex items-center gap-2 text-roc-500 hover:text-roc-700 font-semibold text-sm transition-colors shrink-0"
            >
              Alle projecten <ArrowRight size={15} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Planningsapp voor Flevoland Ziekenhuis',
                tags: ['React', 'TypeScript'],
                author: 'Jasper de Vries',
                image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=600',
              },
              {
                title: 'E-commerce dashboard met AI-aanbevelingen',
                tags: ['Next.js', 'Python'],
                author: 'Sanna Bakker',
                image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=600',
              },
              {
                title: 'Mobiele app voor lokale boeren',
                tags: ['Flutter', 'Node.js'],
                author: 'Milan Oosterom',
                image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600',
              },
            ].map((project, i) => (
              <div
                key={project.title}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 cursor-pointer group"
                onClick={() => navigate('projecten')}
                data-animate
                data-animate-delay={`${(i + 1) * 100}` as '100' | '200' | '300'}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-xs font-semibold bg-roc-50 text-roc-600 px-2.5 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5 leading-snug">{project.title}</h3>
                  <p className="text-xs text-gray-400">door {project.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PHOTO SECTION ── */}
      <section className="relative overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[400px]">
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Studenten aan het werk"
              className="w-full h-full object-cover min-h-64"
            />
          </div>
          <div className="bg-gray-900 flex items-center px-8 md:px-14 py-14 md:py-0">
            <div data-animate>
              <span className="inline-block text-xs font-bold tracking-widest text-roc-400 uppercase mb-4">
                Voor bedrijven
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
                Zoek je jong talent voor een echt project?
              </h2>
              <p className="text-gray-400 leading-relaxed mb-7 text-[15px]">
                Plaats een challenge op het Software Talent Hub platform en laat ROC-studenten aan de slag gaan met jouw vraagstuk. Gratis, snel en effectief.
              </p>
              <button
                onClick={() => navigate('challenges')}
                className="inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
              >
                Challenge plaatsen <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center" data-animate>
          <span className="inline-block text-xs font-bold tracking-widest text-roc-500 uppercase mb-4">
            Doe mee
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Klaar om mee te doen?
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed max-w-xl mx-auto">
            Of je nu student bent die zijn werk wil presenteren, of een bedrijf dat op zoek is naar talent — de Software Talent Hub is voor jou.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('projecten')}
              className="bg-roc-500 hover:bg-roc-600 text-white font-semibold px-7 py-3.5 rounded-full transition-colors text-sm"
            >
              Project indienen
            </button>
            <button
              onClick={() => navigate('challenges')}
              className="border-2 border-gray-200 text-gray-700 hover:border-roc-500 hover:text-roc-500 font-semibold px-7 py-3.5 rounded-full transition-all text-sm"
            >
              Challenges bekijken
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
