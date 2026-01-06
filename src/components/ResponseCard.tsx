import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ViewpointBadge from './ViewpointBadge';
import type { Response } from '@/types/database';
import { cn } from '@/lib/utils';

interface ResponseCardProps {
  response: Response;
  index: number;
}

const viewpointStyles = {
  favor: 'border-l-favor shadow-glow-favor',
  contra: 'border-l-contra shadow-glow-contra',
  neutral: 'border-l-neutral shadow-glow-neutral',
};

const ResponseCard = ({ response, index }: ResponseCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={cn(
        'glass rounded-lg p-4 border-l-4 transition-all duration-300 hover:scale-[1.01]',
        viewpointStyles[response.viewpoint]
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <ViewpointBadge viewpoint={response.viewpoint} isAI={response.is_ai} />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(response.created_at), {
            addSuffix: true,
            locale: es,
          })}
        </span>
      </div>

      <p className="text-foreground/90 text-sm leading-relaxed mb-3">
        {response.content}
      </p>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">{response.author_name}</span>
      </div>
    </motion.div>
  );
};

export default ResponseCard;
