import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ViewpointType } from '@/types/database';
import { cn } from '@/lib/utils';

interface AddResponseFormProps {
  ideaId: string;
  onResponseAdded: () => void;
}

const viewpointOptions: { value: ViewpointType; label: string; color: string }[] = [
  { value: 'favor', label: 'A favor', color: 'bg-favor text-favor-foreground' },
  { value: 'contra', label: 'En contra', color: 'bg-contra text-contra-foreground' },
  { value: 'neutral', label: 'Neutral', color: 'bg-neutral text-neutral-foreground' },
];

const AddResponseForm = ({ ideaId, onResponseAdded }: AddResponseFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [viewpoint, setViewpoint] = useState<ViewpointType>('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Por favor escribe tu respuesta');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('responses').insert({
        idea_id: ideaId,
        content: content.trim(),
        viewpoint,
        is_ai: false,
        author_name: authorName.trim() || 'Usuario',
      });

      if (error) throw error;

      toast.success('¡Respuesta publicada!');
      setContent('');
      setAuthorName('');
      setViewpoint('neutral');
      setIsOpen(false);
      onResponseAdded();
    } catch (error: any) {
      console.error('Error adding response:', error);
      toast.error('Error al publicar la respuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              variant="outline"
              className="w-full border-dashed border-border hover:border-primary hover:bg-primary/5"
            >
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              Agregar mi perspectiva
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-secondary/50 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Tu perspectiva</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex gap-2">
              {viewpointOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setViewpoint(option.value)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200',
                    viewpoint === option.value
                      ? option.color
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <Textarea
              placeholder="Comparte tu punto de vista..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="bg-background border-border resize-none text-sm"
            />

            <Input
              placeholder="Tu nombre (opcional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-background border-border text-sm"
            />

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publicar respuesta
                </>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddResponseForm;
