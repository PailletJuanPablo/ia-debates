import { ThumbsUp, ThumbsDown, Scale, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewpointType } from '@/types/database';

interface ViewpointBadgeProps {
  viewpoint: ViewpointType;
  isAI?: boolean;
  className?: string;
}

const viewpointConfig = {
  favor: {
    label: 'A favor',
    icon: ThumbsUp,
    bgClass: 'bg-favor-muted',
    textClass: 'text-favor',
    borderClass: 'border-favor/30',
  },
  contra: {
    label: 'En contra',
    icon: ThumbsDown,
    bgClass: 'bg-contra-muted',
    textClass: 'text-contra',
    borderClass: 'border-contra/30',
  },
  neutral: {
    label: 'Neutral',
    icon: Scale,
    bgClass: 'bg-neutral-muted',
    textClass: 'text-neutral',
    borderClass: 'border-neutral/30',
  },
};

const ViewpointBadge = ({ viewpoint, isAI, className }: ViewpointBadgeProps) => {
  const config = viewpointConfig[viewpoint];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
          config.bgClass,
          config.textClass,
          config.borderClass
        )}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
      {isAI !== undefined && (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            isAI
              ? 'bg-ai/10 text-ai border border-ai/30'
              : 'bg-secondary text-secondary-foreground border border-border'
          )}
        >
          {isAI ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
          {isAI ? 'IA' : 'Humano'}
        </span>
      )}
    </div>
  );
};

export default ViewpointBadge;
