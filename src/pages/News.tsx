import { useEffect, useState } from 'react';
import { Newspaper, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { NewsPost } from '../lib/database.types';
import NewsCard from '../components/NewsCard';

export default function News() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data);
        setLoading(false);
      });
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Nieuws</h1>
          <p className="text-gray-500 mt-2">Blijf op de hoogte van het laatste nieuws rondom ROC van Flevoland.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="text-roc-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <Newspaper size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nog geen nieuwsberichten beschikbaar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featured && (
              <div className="lg:col-span-2">
                <NewsCard post={featured} featured />
              </div>
            )}
            {rest.length > 0 && (
              <div className="flex flex-col gap-4">
                {rest.slice(0, 4).map((post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>
            )}
            {rest.length > 4 && (
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
                {rest.slice(4).map((post) => (
                  <NewsCard key={post.id} post={post} featured />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
