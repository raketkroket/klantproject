import { Calendar, Building2, Trophy, ChevronRight } from 'lucide-react';
import type { Challenge } from '../lib/database.types';
import Badge from './ui/Badge';

interface ChallengeCardProps {
  challenge: Challenge;
}

const difficultyConfig = {
  beginner: { label: 'Beginner', variant: 'green' as const },
  intermediate: { label: 'Gevorderd', variant: 'amber' as const },
  advanced: { label: 'Expert', variant: 'red' as const },
};

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const config = difficultyConfig[challenge.difficulty] ?? difficultyConfig.beginner;

  const formatDeadline = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-roc-300 hover:shadow-md transition-all duration-300 p-6 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-roc-500 transition-colors">
          {challenge.title}
        </h3>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
        {challenge.description}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 size={14} className="text-gray-400 flex-shrink-0" />
          <span>{challenge.company_name}</span>
        </div>
        {challenge.deadline && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} className="text-gray-400 flex-shrink-0" />
            <span>Deadline: {formatDeadline(challenge.deadline)}</span>
          </div>
        )}
        {challenge.prize && (
          <div className="flex items-center gap-2 text-sm">
            <Trophy size={14} className="text-amber-500 flex-shrink-0" />
            <span className="text-amber-600 font-medium">{challenge.prize}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end">
        <span className="flex items-center gap-1 text-xs text-roc-500 font-medium group-hover:gap-2 transition-all">
          Meer info
          <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
}
