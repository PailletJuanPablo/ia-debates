import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateIdeaFormProps {
  onIdeaCreated: () => void;
}

const CreateIdeaForm = ({ onIdeaCreated }: CreateIdeaFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Por favor completa el título y el contenido');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: idea, error: insertError } = await supabase
        .from('ideas')
        .insert({
          title: title.trim(),
          content: content.trim(),
          author_name: authorName.trim() || 'Anónimo'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('¡Idea publicada! Generando respuestas de IA...');

      // Trigger AI debate generation
      const { error: fnError } = await supabase.functions.invoke('generate-debate', {
        body: {
          ideaId: idea.id,
          ideaTitle: idea.title,
          ideaContent: idea.content
        }
      });

      if (fnError) {
        console.error('Error generating debate:', fnError);
        toast.error('Error al generar debate. Las respuestas de IA pueden tardar.');
      } else {
        toast.success('¡Debate generado! La IA ha respondido.');
      }

      setTitle('');
      setContent('');
      setAuthorName('');
      setIsOpen(false);
      onIdeaCreated();

    } catch (error: any) {
      console.error('Error creating idea:', error);
      toast.error('Error al publicar la idea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-display font-semibold py-6 shadow-glow-primary transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Comparte tu idea
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="glass rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-semibold text-foreground">
                Nueva idea para debatir
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Input
              placeholder="Título de tu idea..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary border-border focus:ring-primary"
            />

            <Textarea
              placeholder="Describe tu idea en detalle. ¿Qué propones? ¿Por qué es importante?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="bg-secondary border-border focus:ring-primary resize-none"
            />

            <Input
              placeholder="Tu nombre (opcional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-secondary border-border focus:ring-primary"
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground"
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
                    Publicar idea
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              La IA generará automáticamente diferentes perspectivas sobre tu idea
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateIdeaForm;
