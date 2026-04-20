import { useNavigation } from '../../context/NavigationContext';
import type { Page } from '../../types';

const links: { label: string; page: Page }[] = [
  { label: 'Projecten', page: 'projecten' },
  { label: 'Challenges', page: 'challenges' },
  { label: 'Nieuws', page: 'nieuws' },
  { label: 'Contact', page: 'contact' },
];

export function Footer() {
  const { navigate } = useNavigation();
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <img src="/image.png" alt="ROC van Flevoland" className="h-10 w-auto mb-3 brightness-0 invert" />
            <p className="text-sm text-gray-400">Software Talent Hub</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((l) => (
              <button key={l.page} onClick={() => navigate(l.page)} className="text-sm text-gray-400 hover:text-white transition-colors">
                {l.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ROC van Flevoland. Alle rechten voorbehouden.</p>
          <p>Software Talent Hub — maakt werk van je talent</p>
        </div>
      </div>
    </footer>
  );
}
