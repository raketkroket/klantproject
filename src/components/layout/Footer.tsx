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
    <footer className="bg-gray-100 text-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          <div className="md:col-span-1">
            <img src="/image.png" alt="ROC van Flevoland" className="h-16 w-auto mb-4" />
            <p className="text-sm text-gray-500 leading-relaxed">
              Software Talent Hub verbindt studenten, bedrijven en onderwijs in de regio Flevoland.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((l) => (
                <li key={l.page}>
                  <button
                    onClick={() => navigate(l.page)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-roc-500 transition-colors group"
                  >
                    <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Contact</h4>
            <p className="text-sm font-semibold text-gray-700 mb-3">Informatiecentrum</p>
            <div className="space-y-2.5">
              <a href="tel:09000918" className="flex items-center gap-2.5 text-sm text-gray-500 hover:text-roc-500 transition-colors">
                <Phone size={14} className="shrink-0" />
                0900 - 0918
              </a>
              <a href="mailto:informatiecentrum@rocvf.nl" className="flex items-center gap-2.5 text-sm text-gray-500 hover:text-roc-500 transition-colors">
                <Mail size={14} className="shrink-0" />
                informatiecentrum@rocvf.nl
              </a>
              <a href="https://wa.me/31625038566" className="flex items-center gap-2.5 text-sm text-gray-500 hover:text-roc-500 transition-colors">
                <MessageSquare size={14} className="shrink-0" />
                06 - 250 385 66
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Blijf op de hoogte</h4>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Schrijf je in voor onze nieuwsbrief en blijf op de hoogte van het laatste nieuws.
            </p>
            <button
              onClick={() => navigate('nieuws')}
              className="inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              Nieuwsbrief <ArrowRight size={14} />
            </button>
            <div className="flex items-center gap-3 mt-6">
              {[
                { label: 'LinkedIn', href: 'https://www.linkedin.com/school/roc-van-flevoland', letter: 'in' },
                { label: 'Facebook', href: 'https://www.facebook.com/ROCvanFlevoland', letter: 'f' },
                { label: 'Instagram', href: 'https://www.instagram.com/rocvanflevoland', letter: 'ig' },
              ].map(({ label, href, letter }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-roc-500 hover:border-roc-200 transition-colors shadow-sm text-xs font-bold"
                  aria-label={label}
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-200/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} ROC van Flevoland. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-600 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-gray-600 cursor-pointer transition-colors">Disclaimer</span>
            <span className="hover:text-gray-600 cursor-pointer transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
