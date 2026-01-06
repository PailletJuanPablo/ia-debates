import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageCircle, ChevronDown, ChevronUp, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ResponseCard from './ResponseCard';
import AddResponseForm from './AddResponseForm';
import type { Idea, Response, ViewpointType } from '@/types/database';
import { toast } from 'sonner';

interface IdeaCardProps {
  idea: Idea;
  index: number;
}

const IdeaCard = ({ idea, index }: IdeaCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const fetchResponses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('idea_id', idea.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const typedResponses: Response[] = (data || []).map(r => ({
        ...r,
        viewpoint: r.viewpoint as ViewpointType
      }));
      
      setResponses(typedResponses);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && responses.length === 0) {
      fetchResponses();
    }
  }, [isExpanded]);

  useEffect(() => {
    const channel = supabase
      .channel(`responses-${idea.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'responses',
          filter: `idea_id=eq.${idea.id}`,
        },
        (payload) => {
          const newResponse = {
            ...payload.new,
            viewpoint: payload.new.viewpoint as ViewpointType
          } as Response;
          setResponses((prev) => [...prev, newResponse]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [idea.id]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-debate', {
        body: {
          ideaId: idea.id,
          ideaTitle: idea.title,
          ideaContent: idea.content,
        },
      });

      if (error) throw error;
      toast.success('¡Nuevas perspectivas de IA generadas!');
      fetchResponses();
    } catch (error: any) {
      console.error('Error regenerating:', error);
      toast.error('Error al regenerar respuestas');
    } finally {
      setIsRegenerating(false);
    }
  };

  const favorCount = responses.filter((r) => r.viewpoint === 'favor').length;
  const contraCount = responses.filter((r) => r.viewpoint === 'contra').length;
  const neutralCount = responses.filter((r) => r.viewpoint === 'neutral').length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="glass rounded-xl overflow-hidden transition-all duration-300 hover:shadow-glow-primary"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold text-foreground mb-2 leading-tight">
              {idea.title}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {idea.content}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{idea.author_name}</span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(idea.created_at), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {responses.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-favor">{favorCount}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-contra">{contraCount}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-neutral">{neutralCount}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {responses.length}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border bg-background/50"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-medium text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ai" />
                Perspectivas del debate
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="text-xs text-muted-foreground hover:text-ai"
              >
                {isRegenerating ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                Regenerar IA
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : responses.length > 0 ? (
              <div className="space-y-3">
                {responses.map((response, idx) => (
                  <ResponseCard key={response.id} response={response} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay respuestas aún. ¡Sé el primero en opinar!
              </div>
            )}

            <AddResponseForm ideaId={idea.id} onResponseAdded={fetchResponses} />
          </div>
        </motion.div>
      )}
    </motion.article>
  );
};

export default IdeaCard;
