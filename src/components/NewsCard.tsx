import { Calendar, ArrowRight } from 'lucide-react';
import type { NewsPost } from '../lib/database.types';

interface NewsCardProps {
  post: NewsPost;
  featured?: boolean;
}

export default function NewsCard({ post, featured }: NewsCardProps) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  if (featured) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 hover:border-roc-300 hover:shadow-md transition-all duration-300 overflow-hidden group">
        {post.image_url && (
          <div className="h-56 overflow-hidden">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Calendar size={12} />
            {formatDate(post.created_at)}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-roc-500 transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{post.excerpt}</p>
          )}
          <span className="inline-flex items-center gap-2 text-sm text-roc-500 font-medium group-hover:gap-3 transition-all">
            Lees meer <ArrowRight size={14} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-roc-300 hover:shadow-sm transition-all duration-300 p-5 flex gap-4 group">
      {post.image_url && (
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
          <Calendar size={11} />
          {formatDate(post.created_at)}
        </div>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-roc-500 transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mt-1">{post.excerpt}</p>
        )}
      </div>
    </div>
  );
}
