import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Inbox } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import IdeaCard from './IdeaCard';
import type { Idea } from '@/types/database';

interface IdeasFeedProps {
  refreshTrigger: number;
}

const IdeasFeed = ({ refreshTrigger }: IdeasFeedProps) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Inbox className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          No hay ideas todavía
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          ¡Sé el primero en compartir una idea! La inteligencia artificial generará
          automáticamente diferentes perspectivas para debatir.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {ideas.map((idea, index) => (
        <IdeaCard key={idea.id} idea={idea} index={index} />
      ))}
    </div>
  );
};

export default IdeasFeed;
