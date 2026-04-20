import { ExternalLink, GitBranch, User, Clock } from 'lucide-react';
import type { Project } from '../lib/database.types';
import Badge from './ui/Badge';

interface ProjectCardProps {
  project: Project;
  isNew?: boolean;
}

export default function ProjectCard({ project, isNew }: ProjectCardProps) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m geleden`;
    if (hours < 24) return `${hours}u geleden`;
    return `${days}d geleden`;
  };

  return (
    <div className={`bg-white rounded-xl border ${isNew ? 'border-roc-300 shadow-lg shadow-roc-100' : 'border-gray-200'} hover:border-roc-300 hover:shadow-md transition-all duration-300 overflow-hidden group`}>
      {project.image_url && (
        <div className="h-40 overflow-hidden">
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-roc-500 transition-colors">
            {project.title}
          </h3>
          {isNew && (
            <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-roc-500 text-white">
              Nieuw
            </span>
          )}
        </div>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
          {project.description}
        </p>

        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="orange">{tech}</Badge>
            ))}
            {project.tech_stack.length > 4 && (
              <Badge variant="gray">+{project.tech_stack.length - 4}</Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <User size={12} />
              {project.author_name}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {timeAgo(project.created_at)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-400 hover:text-roc-500 hover:bg-roc-50 transition-colors"
                title="GitHub"
              >
                <GitBranch size={15} />
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-400 hover:text-roc-500 hover:bg-roc-50 transition-colors"
                title="Demo"
              >
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
