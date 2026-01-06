import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ideaId, ideaTitle, ideaContent } = await req.json();
    
    if (!ideaId || !ideaTitle || !ideaContent) {
      throw new Error("Missing required fields: ideaId, ideaTitle, ideaContent");
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating debate responses for idea: ${ideaId}`);

    const viewpoints = [
      { 
        type: 'favor', 
        prompt: `Eres un debatedor que está A FAVOR de la siguiente idea. Debes argumentar de manera convincente por qué esta idea es buena, beneficiosa o correcta. Sé apasionado pero respetuoso. Responde en español, máximo 150 palabras.`,
        name: 'IA Defensor'
      },
      { 
        type: 'contra', 
        prompt: `Eres un debatedor que está EN CONTRA de la siguiente idea. Debes argumentar de manera convincente por qué esta idea es mala, perjudicial o incorrecta. Sé crítico pero respetuoso. Responde en español, máximo 150 palabras.`,
        name: 'IA Crítico'
      },
      { 
        type: 'neutral', 
        prompt: `Eres un analista NEUTRAL que examina la siguiente idea desde múltiples ángulos. Presenta tanto pros como contras de manera equilibrada. Sé objetivo y analítico. Responde en español, máximo 150 palabras.`,
        name: 'IA Analista'
      }
    ];

    const responses = [];

    for (const viewpoint of viewpoints) {
      console.log(`Generating ${viewpoint.type} response...`);
      
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: viewpoint.prompt },
            { role: 'user', content: `Idea: "${ideaTitle}"\n\nDescripción: ${ideaContent}` }
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error(`AI gateway error for ${viewpoint.type}:`, aiResponse.status, errorText);
        
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        continue;
      }

      const data = await aiResponse.json();
      const generatedContent = data.choices?.[0]?.message?.content;

      if (generatedContent) {
        const { error: insertError } = await supabase
          .from('responses')
          .insert({
            idea_id: ideaId,
            content: generatedContent,
            viewpoint: viewpoint.type,
            is_ai: true,
            author_name: viewpoint.name
          });

        if (insertError) {
          console.error(`Error inserting ${viewpoint.type} response:`, insertError);
        } else {
          responses.push({ viewpoint: viewpoint.type, success: true });
          console.log(`Successfully generated ${viewpoint.type} response`);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, responses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in generate-debate function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
