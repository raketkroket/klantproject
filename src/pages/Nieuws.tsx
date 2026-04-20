import { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { NewsItem } from '../types';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function Nieuws() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  useScrollAnimation();

  useEffect(() => {
    supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setNews(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-bold tracking-widest text-roc-400 uppercase mb-4">
            Actueel
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Nieuws</h1>
          <p className="text-gray-400 max-w-lg">
            Laatste updates van het Software Talent Hub platform.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Newspaper size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">Geen nieuwsberichten</p>
            <p className="text-sm mt-1">Beheerders kunnen hier berichten plaatsen.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, i) => (
              <article
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                data-animate
                data-animate-delay={`${Math.min(i * 100, 500)}` as '100'|'200'|'300'|'400'|'500'}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-44 object-cover" />
                ) : (
                  <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Newspaper size={32} className="text-gray-300" />
                  </div>
                )}
                <div className="p-5">
                  <time className="text-xs text-gray-400 mb-2 block">
                    {new Date(item.created_at).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                  <h3 className="font-bold text-gray-900 mb-2 leading-tight">{item.title}</h3>
                  {item.excerpt && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{item.excerpt}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
