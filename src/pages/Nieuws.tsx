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
      <div className="relative w-full" style={{ height: '420px' }}>
        <img
          src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Nieuws"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-0 left-8 md:left-16 translate-y-1/2 z-10">
          <div className="bg-roc-500 rounded-2xl px-8 py-7 max-w-xs shadow-xl">
            <h1 className="text-3xl font-bold text-white mb-1">Nieuws</h1>
            <p className="text-white/80 text-sm">Laatste updates van het platform</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-10">
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
