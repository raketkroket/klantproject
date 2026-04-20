import { useState, useEffect, useRef } from 'react';
import { Pause, Play, ArrowRight, Code as Code2, Briefcase, GraduationCap, Rocket } from 'lucide-react';
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

const partnerLogos: { id: number; name: string; logo: string | null }[] = [
  { id: 1,  name: 'Partner 1',  logo: null },
  { id: 2,  name: 'Partner 2',  logo: null },
  { id: 3,  name: 'Partner 3',  logo: null },
  { id: 4,  name: 'Partner 4',  logo: null },
  { id: 5,  name: 'Partner 5',  logo: null },
  { id: 6,  name: 'Partner 6',  logo: null },
  { id: 7,  name: 'Partner 7',  logo: null },
  { id: 8,  name: 'Partner 8',  logo: null },
  { id: 9,  name: 'Partner 9',  logo: null },
  { id: 10, name: 'Partner 10', logo: null },
  { id: 11, name: 'Partner 11', logo: null },
  { id: 12, name: 'Partner 12', logo: null },
];

export function Home() {
  const { navigate } = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useScrollAnimation();

  const goTo = (index: number) => {
    setActiveSlide(index);
  };

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  return (
    <div>
      <section className="relative w-full overflow-hidden" style={{ minHeight: 'min(100svh, 85.2rem)' }}>
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
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)' }} />
          </div>
        ))}

        <div className="relative z-10 flex flex-col min-h-[inherit]" style={{ minHeight: 'min(100svh, 85.2rem)' }}>
          <div className="mt-auto max-w-6xl mx-auto w-full px-6 pb-10">
            <div
              className="bg-roc-500 text-white rounded-2xl overflow-hidden"
              style={{ width: 'clamp(280px, 42rem, 100%)' }}
            >
              <div className="px-6 pt-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {heroSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`transition-all duration-300 rounded-full ${
                          i === activeSlide
                            ? 'w-6 h-2 bg-white'
                            : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setPaused((p) => !p)}
                    className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                    aria-label={paused ? 'Afspelen' : 'Pauzeren'}
                  >
                    {paused ? <Play size={13} fill="white" /> : <Pause size={13} fill="white" />}
                  </button>
                </div>

                <div className="min-h-[7rem]">
                  <p className="text-xs font-bold tracking-[0.15em] text-white/70 uppercase mb-2">
                    {heroSlides[activeSlide].label}
                  </p>
                  <h1 className="text-2xl md:text-[2rem] font-bold leading-tight mb-3">
                    {heroSlides[activeSlide].title}
                  </h1>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {heroSlides[activeSlide].description}
                  </p>
                </div>
              </div>

              <div className="bg-roc-700 px-6 py-4">
                <button
                  onClick={() => navigate('projecten')}
                  className="flex items-center gap-2 bg-white text-roc-700 hover:bg-roc-50 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
                >
                  Bekijk projecten
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div data-animate>
              <span className="inline-block text-xs font-bold tracking-widest text-roc-500 uppercase mb-4">
                Over het platform
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
                Software Talent Hub —<br />
                <span className="text-roc-500">maakt werk van je talent</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                De Software Talent Hub van ROC van Flevoland is het verbindende platform tussen studenten, bedrijven en onderwijs. Studenten laten hier zien wat ze kunnen door echte uitdagingen op te lossen.
              </p>
              <button
                onClick={() => navigate('contact')}
                className="inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Neem contact op
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4" data-animate data-animate-delay="200">
              {[
                { icon: Code2, title: 'Projecten', desc: 'Studenten publiceren softwareprojecten', color: 'bg-blue-50 text-blue-600' },
                { icon: Briefcase, title: 'Challenges', desc: 'Bedrijven plaatsen echte opdrachten', color: 'bg-amber-50 text-amber-600' },
                { icon: GraduationCap, title: 'Leren', desc: 'Leer van echte praktijkervaring', color: 'bg-green-50 text-green-600' },
                { icon: Rocket, title: 'Groeien', desc: 'Bouw je portfolio en netwerk op', color: 'bg-roc-50 text-roc-600' },
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

      <section className="bg-gray-50 py-14 overflow-hidden">
        <p className="text-center text-xs font-bold tracking-widest text-gray-400 uppercase mb-10">
          Samenwerkingspartners
        </p>
        <div className="relative flex" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
          <div
            className="flex gap-8 shrink-0"
            style={{ animation: 'marquee 28s linear infinite' }}
          >
            {[...partnerLogos, ...partnerLogos].map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="shrink-0 w-36 h-16 bg-white rounded-xl border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className="max-h-10 max-w-28 object-contain" />
                ) : (
                  <span className="text-xs font-semibold text-gray-300">{p.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12" data-animate>
            <span className="inline-block text-xs font-bold tracking-widest text-roc-500 uppercase mb-3">
              Uitgelicht
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Recente projecten</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                data-animate
                data-animate-delay={`${i * 100}` as '100' | '200' | '300'}
              >
                <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Code2 size={32} className="text-gray-300" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold bg-roc-50 text-roc-600 px-2.5 py-1 rounded-full">React</span>
                    <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">TypeScript</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Voorbeeldproject #{i}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Een voorbeeld van wat studenten bouwen op het Software Talent Hub platform.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10" data-animate data-animate-delay="300">
            <button
              onClick={() => navigate('projecten')}
              className="inline-flex items-center gap-2 border-2 border-roc-500 text-roc-500 hover:bg-roc-500 hover:text-white font-semibold px-6 py-3 rounded-full transition-all"
            >
              Alle projecten bekijken
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-roc-500 py-16" data-animate>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Klaar om mee te doen?</h2>
          <p className="text-white/80 mb-8 leading-relaxed">
            Of je nu student bent die zijn werk wil presenteren, of een bedrijf dat op zoek is naar talent — de Software Talent Hub is voor jou.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('projecten')}
              className="bg-white text-roc-600 hover:bg-roc-50 font-semibold px-7 py-3 rounded-full transition-colors"
            >
              Project indienen
            </button>
            <button
              onClick={() => navigate('challenges')}
              className="border-2 border-white text-white hover:bg-white/10 font-semibold px-7 py-3 rounded-full transition-colors"
            >
              Challenge bekijken
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
