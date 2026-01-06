import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ViewpointBadge from './ViewpointBadge';
import ReplyToResponseForm from './ReplyToResponseForm';
import type { Response, ViewpointType } from '@/types/database';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ResponseCardProps {
  response: Response;
  index: number;
  allResponses: Response[];
  onReplyAdded: () => void;
}

const viewpointStyles = {
  favor: 'border-l-favor shadow-glow-favor',
  contra: 'border-l-contra shadow-glow-contra',
  neutral: 'border-l-neutral shadow-glow-neutral',
};

const ResponseCard = ({ response, index, allResponses, onReplyAdded }: ResponseCardProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isGeneratingAIReply, setIsGeneratingAIReply] = useState(false);

  const replies = allResponses.filter(r => r.parent_response_id === response.id);

  const handleGenerateAIReply = async () => {
    if (!response.is_ai) return;
    
    setIsGeneratingAIReply(true);
    try {
      const { error } = await supabase.functions.invoke('generate-debate', {
        body: {
          ideaId: response.idea_id,
          parentResponseId: response.id,
          parentContent: response.content,
          parentViewpoint: response.viewpoint,
          isReply: true,
        },
      });

      if (error) throw error;
      toast.success('¡Respuesta de IA generada!');
      onReplyAdded();
    } catch (error: any) {
      console.error('Error generating AI reply:', error);
      toast.error('Error al generar respuesta');
    } finally {
      setIsGeneratingAIReply(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="space-y-2"
    >
      <div
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

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {response.author_name}
          </span>
          
          <div className="flex items-center gap-2">
            {response.is_ai && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateAIReply}
                disabled={isGeneratingAIReply}
                className="text-xs text-muted-foreground hover:text-ai h-7 px-2"
              >
                {isGeneratingAIReply ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Debatir con IA
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Responder
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isReplying && (
            <ReplyToResponseForm
              ideaId={response.idea_id}
              parentResponseId={response.id}
              onReplyAdded={() => {
                setIsReplying(false);
                onReplyAdded();
              }}
              onCancel={() => setIsReplying(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="ml-6 pl-4 border-l-2 border-border/50 space-y-2">
          {replies.map((reply, idx) => (
            <ResponseCard
              key={reply.id}
              response={reply}
              index={idx}
              allResponses={allResponses}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ResponseCard;
