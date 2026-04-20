import { Phone, Mail, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import type { Page } from '../../types';

const platformLinks: { label: string; page: Page }[] = [
  { label: 'Projecten', page: 'projecten' },
  { label: 'Challenges', page: 'challenges' },
  { label: 'Nieuws', page: 'nieuws' },
  { label: 'Contact', page: 'contact' },
];

export function Footer() {
  const { navigate } = useNavigation();

  return (
    <footer className="bg-gray-950 text-white">
      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <img src="/image.png" alt="ROC van Flevoland" className="h-14 w-auto mb-4 brightness-0 invert opacity-90" />
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Software Talent Hub verbindt studenten, bedrijven en onderwijs in de regio Flevoland.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://www.linkedin.com/school/roc-van-flevoland"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-roc-500 flex items-center justify-center transition-colors text-xs font-bold"
                aria-label="LinkedIn"
              >
                in
              </a>
              <a
                href="https://www.facebook.com/ROCvanFlevoland"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-roc-500 flex items-center justify-center transition-colors text-xs font-bold"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="https://www.instagram.com/rocvanflevoland"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-roc-500 flex items-center justify-center transition-colors text-xs font-bold"
                aria-label="Instagram"
              >
                ig
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((l) => (
                <li key={l.page}>
                  <button
                    onClick={() => navigate(l.page)}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Contact</h4>
            <p className="text-sm font-semibold text-white mb-4">Informatiecentrum</p>
            <div className="space-y-3">
              <a href="tel:09000918" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-full bg-white/8 group-hover:bg-roc-500/20 flex items-center justify-center transition-colors shrink-0">
                  <Phone size={13} />
                </div>
                0900 - 0918
              </a>
              <a href="mailto:informatiecentrum@rocvf.nl" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-full bg-white/8 group-hover:bg-roc-500/20 flex items-center justify-center transition-colors shrink-0">
                  <Mail size={13} />
                </div>
                informatiecentrum@rocvf.nl
              </a>
              <a href="https://wa.me/31625038566" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-full bg-white/8 group-hover:bg-roc-500/20 flex items-center justify-center transition-colors shrink-0">
                  <MessageSquare size={13} />
                </div>
                06 - 250 385 66
              </a>
            </div>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Blijf op de hoogte</h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Volg het laatste nieuws van het Software Talent Hub platform.
            </p>
            <button
              onClick={() => navigate('nieuws')}
              className="inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              Laatste nieuws <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Orange accent bar */}
      <div className="h-1 bg-roc-500" />

      {/* Bottom bar */}
      <div className="bg-black/40">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ROC van Flevoland. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-5">
            <span className="hover:text-gray-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-gray-300 cursor-pointer transition-colors">Disclaimer</span>
            <span className="hover:text-gray-300 cursor-pointer transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
