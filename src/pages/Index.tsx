import { useState } from 'react';
import Header from '@/components/Header';
import CreateIdeaForm from '@/components/CreateIdeaForm';
import IdeasFeed from '@/components/IdeasFeed';

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleIdeaCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient-primary mb-3">
            Comparte. Debate. Evoluciona.
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Publica tus ideas y observa cómo la inteligencia artificial y otros usuarios
            aportan diferentes perspectivas al debate.
          </p>
        </div>

        <CreateIdeaForm onIdeaCreated={handleIdeaCreated} />
        
        <IdeasFeed refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
};

export default Index;
