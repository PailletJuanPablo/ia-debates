import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReplyToResponseFormProps {
  ideaId: string;
  parentResponseId: string;
  onReplyAdded: () => void;
  onCancel: () => void;
}

const ReplyToResponseForm = ({ ideaId, parentResponseId, onReplyAdded, onCancel }: ReplyToResponseFormProps) => {
  const [content, setContent] = useState('');
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
        viewpoint: 'neutral',
        is_ai: false,
        author_name: 'Usuario',
        parent_response_id: parentResponseId,
      });

      if (error) throw error;

      toast.success('¡Respuesta enviada!');
      setContent('');
      onReplyAdded();
    } catch (error: any) {
      console.error('Error adding reply:', error);
      toast.error('Error al enviar la respuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="mt-3 bg-background/50 rounded-lg p-3 space-y-3 border border-border/50"
    >
      <Textarea
        placeholder="Continúa el debate..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        className="bg-background border-border resize-none text-sm"
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          className="bg-gradient-primary hover:opacity-90 text-primary-foreground text-xs"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <Send className="w-3 h-3 mr-1" />
              Responder
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default ReplyToResponseForm;
