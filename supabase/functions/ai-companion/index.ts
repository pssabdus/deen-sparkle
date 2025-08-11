import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompanionRequest {
  childId: string;
  message?: string;
  interactionType: 'chat' | 'daily_message' | 'achievement' | 'challenge';
  context?: {
    recentActivities?: any[];
    achievements?: any[];
    currentStreak?: number;
    totalPoints?: number;
    prayersCompleted?: number;
    age?: number;
  };
}

// Enhanced Islamic personality prompts with authentic teachings
const PERSONALITY_PROMPTS = {
  angel: {
    system: `You are Noor, a gentle angel companion helping a Muslim child learn about Islam. You MUST follow these Islamic authentication rules:
    - Always follow authentic Sunni Islamic teachings from Quran and Sunnah
    - Use age-appropriate language suitable for children
    - Begin with Islamic greetings when appropriate (Assalamu Alaikum, Barakallahu feeki)
    - Reference Quran verses and authentic Hadith when giving guidance
    - Never contradict established Islamic principles or scholarly consensus
    - Always encourage Islamic values: honesty, kindness, prayer, family respect
    - If unsure about Islamic ruling, suggest asking parents or local imam
    - Keep responses positive, encouraging, and developmentally appropriate`,
    tone: "gentle, encouraging, spiritually uplifting, islamically-grounded"
  },
  pet: {
    system: `You are Barakah, a friendly animal companion helping a Muslim child with their Islamic journey. You MUST follow these Islamic authentication rules:
    - Always follow authentic Sunni Islamic teachings from Quran and Sunnah
    - Use playful but respectful language appropriate for children
    - Include Islamic greetings and etiquette naturally
    - Share Islamic moral stories from authentic sources only
    - Never contradict Islamic values or scholarly consensus
    - Encourage Islamic character building through fun activities
    - Guide children toward authentic Islamic practices`,
    tone: "playful, energetic, fun and engaging, islamically-aware"
  },
  wizard: {
    system: `You are Hakim, a wise Islamic scholar companion who makes learning about Islam magical and fun for children. You MUST follow these Islamic authentication rules:
    - Always follow authentic Sunni Islamic teachings from Quran and Sunnah
    - Use storytelling to teach authentic Islamic history and values
    - Reference Quran verses and authentic Hadith with proper citations
    - Never create fictional Islamic stories or contradict established teachings
    - Include proper Arabic pronunciations and Islamic terminology
    - Encourage seeking knowledge as emphasized in Islam
    - Always validate content against authentic Islamic sources`,
    tone: "wise, knowledgeable, fascinating, educational, authentically-islamic"
  }
};

// Get Islamic knowledge from authenticated sources
async function getIslamicKnowledge(supabase: any, topic?: string) {
  try {
    // Note: Using string concatenation for now due to type limitations
    // This will be resolved when types are regenerated
    const query = `
      SELECT * FROM islamic_sources 
      WHERE is_authentic = true AND status = 'approved'
      ${topic ? `AND (category ILIKE '%${topic}%' OR '${topic}' = ANY(tags))` : ''}
      LIMIT 3
    `;
    
    const { data: sources } = await supabase.rpc('execute_sql', { query });
    
    const termQuery = `
      SELECT * FROM islamic_terminology 
      WHERE status = 'approved'
      LIMIT 5
    `;
    
    const { data: terminology } = await supabase.rpc('execute_sql', { query: termQuery });
    
    return { 
      sources: sources || [], 
      terminology: terminology || [] 
    };
  } catch (error) {
    console.error('Error fetching Islamic knowledge:', error);
    return { sources: [], terminology: [] };
  }
}

// Validate content against Islamic guidelines
async function validateContent(supabase: any, content: string, childAge: number): Promise<boolean> {
  try {
    const query = `
      SELECT * FROM content_filters 
      WHERE is_active = true
    `;
    
    const { data: filters } = await supabase.rpc('execute_sql', { query });
    
    if (!filters) return true;
    
    // Check for forbidden content
    for (const filter of filters) {
      if (filter.filter_type === 'forbidden_content') {
        for (const keyword of filter.keywords || []) {
          if (content.toLowerCase().includes(keyword.toLowerCase())) {
            console.log(`Content filtered for keyword: ${keyword}`);
            return false;
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error validating content:', error);
    return true; // Allow content if validation fails
  }
}

const generateAgeAppropriatePrompt = (age: number) => {
  if (age <= 6) {
    return "Use very simple words, short sentences, and appropriate emojis. Focus on basic Islamic concepts like being kind, saying prayers (salah), and loving Allah. Use simple examples they can understand. Always include proper Islamic greetings.";
  } else if (age <= 10) {
    return "Use clear, understandable language. Explain Islamic concepts with relatable examples. Include stories of prophets and good Muslim behavior. Reference authentic Hadith and Quran verses when appropriate.";
  } else if (age <= 14) {
    return "Use age-appropriate language for a middle school student. Include more detailed Islamic concepts and historical examples from authentic sources. Always cite references properly.";
  }
  return "Use mature but accessible language for a teenager. Include deeper Islamic concepts and contemporary relevance. Always encourage further learning from authentic sources.";
};

const generateContextualPrompt = (context: any, interactionType: string, islamicKnowledge: any) => {
  let contextPrompt = "";
  
  // Add Islamic knowledge context
  if (islamicKnowledge.sources.length > 0) {
    contextPrompt += `Use these authentic Islamic sources for guidance: `;
    islamicKnowledge.sources.forEach((source: any) => {
      contextPrompt += `${source.source_type}: "${source.arabic_text}" (${source.translation}) - ${source.reference}. `;
    });
  }
  
  // Add terminology context
  if (islamicKnowledge.terminology.length > 0) {
    contextPrompt += `Use proper Islamic terminology: `;
    islamicKnowledge.terminology.forEach((term: any) => {
      contextPrompt += `${term.arabic_term} (${term.pronunciation}) means ${term.definition}. `;
    });
  }
  
  if (context) {
    if (context.currentStreak > 0) {
      contextPrompt += `The child has a ${context.currentStreak}-day prayer streak. Encourage them and remind them of the importance of consistency in worship according to authentic Islamic teachings. `;
    }
    if (context.totalPoints) {
      contextPrompt += `They have earned ${context.totalPoints} total points. Praise them using Islamic expressions and encourage continued good character building. `;
    }
    if (context.prayersCompleted) {
      contextPrompt += `They completed ${context.prayersCompleted} prayers today. Acknowledge their devotion and reference relevant Islamic teachings about prayer. `;
    }
  }

  switch (interactionType) {
    case 'daily_message':
      return contextPrompt + "Generate an inspiring daily message based on authentic Islamic sources. Include a relevant Quran verse or authentic Hadith with proper citation and age-appropriate explanation.";
    case 'achievement':
      return contextPrompt + "Celebrate their recent achievement using authentic Islamic expressions of joy (MaashaAllah, Barakallahu feeki). Reference relevant Quran verses or Hadith about good deeds.";
    case 'challenge':
      return contextPrompt + "Suggest a fun, Islamic-themed challenge that teaches authentic Islamic values or practices. Base it on Quran and Sunnah teachings.";
    case 'chat':
      return contextPrompt + "Respond with authentic Islamic guidance, encouragement, or educational content. Always validate against established Islamic teachings.";
    default:
      return contextPrompt;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { childId, message, interactionType, context }: CompanionRequest = await req.json();

    // Get child information to determine personality and age
    const { data: childData, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single();

    if (childError || !childData) {
      throw new Error('Child not found');
    }

    // Get Islamic knowledge for authentic guidance
    const islamicKnowledge = await getIslamicKnowledge(supabase, interactionType);

    // Get recent conversation history for context
    const { data: conversationHistory } = await supabase
      .from('companion_conversations')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate child's age
    const age = new Date().getFullYear() - new Date(childData.date_of_birth).getFullYear();
    
    // Get personality-based prompt
    const personality = childData.companion_type || 'angel';
    const personalityPrompt = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.angel;
    
    // Build comprehensive Islamic-authenticated system prompt
    const systemPrompt = `${personalityPrompt.system}

CRITICAL ISLAMIC AUTHENTICATION RULES:
- Always follow authentic Sunni Islamic teachings from Quran and Sunnah
- Use age-appropriate language suitable for children aged 5-15
- Begin conversations with Islamic greetings when appropriate (Assalamu Alaikum, Barakallahu feeki)
- Reference Quran verses and authentic Hadith when giving Islamic guidance
- Never contradict established Islamic principles or scholarly consensus
- Always encourage Islamic values: honesty, kindness, prayer, family respect
- If unsure about Islamic ruling, suggest asking parents or local imam
- Keep responses positive, encouraging, and developmentally appropriate

PERSONALITY: ${personalityPrompt.tone}
CHILD'S NAME: ${childData.name}
COMPANION NAME: ${childData.companion_name}
AGE: ${age} years old

${generateAgeAppropriatePrompt(age)}

CONTEXT: ${generateContextualPrompt(context, interactionType, islamicKnowledge)}

GUIDELINES:
- Always validate content against authentic Islamic sources
- Include Islamic values and teachings naturally from authentic sources
- Keep responses under 150 words for chat, 100 words for daily messages
- Use the child's name occasionally to make it personal
- Reference your companion name when appropriate
- If they ask non-Islamic questions, gently guide them back to Islamic topics with authentic references
- Always end messages with Islamic greetings or blessings when appropriate
- Never create fictional Islamic content - only use authentic sources

CONVERSATION HISTORY: ${conversationHistory ? conversationHistory
  .slice(0, 5)
  .map(conv => `${conv.message_type}: ${conv.message_content}`)
  .join('\n') : 'No previous conversations'}`;

    // Prepare user message based on interaction type
    let userMessage = "";
    switch (interactionType) {
      case 'daily_message':
        userMessage = `Generate a warm daily greeting and motivation message for ${childData.name}.`;
        break;
      case 'achievement':
        userMessage = `Celebrate ${childData.name}'s recent achievement with enthusiasm!`;
        break;
      case 'challenge':
        userMessage = `Suggest a fun Islamic challenge or activity for ${childData.name} today.`;
        break;
      case 'chat':
        userMessage = message || "Hello!";
        break;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let companionResponse = data.choices[0].message.content;

    // Validate content against Islamic guidelines
    const isContentValid = await validateContent(supabase, companionResponse, age);
    
    if (!isContentValid) {
      // Provide a safe fallback response
      companionResponse = `Assalamu Alaikum! I want to make sure I give you the best Islamic guidance. Let me think of a better way to help you. Could you ask your question again, or would you like me to share a beautiful Quran verse instead?`;
    }

    // Log content for scholar review
    try {
      const logQuery = `
        INSERT INTO ai_content_validation (content, child_id, interaction_type, companion_type, is_validated, needs_scholar_review)
        VALUES ('${companionResponse.replace(/'/g, "''")}', '${childId}', '${interactionType}', '${personality}', ${isContentValid}, ${!isContentValid || companionResponse.includes('Quran') || companionResponse.includes('Hadith')})
      `;
      await supabase.rpc('execute_sql', { query: logQuery });
    } catch (error) {
      console.error('Error logging content for review:', error);
    }

    // Store conversation in database if it's a chat interaction
    if (interactionType === 'chat' && message) {
      // Store child's message
      await supabase
        .from('companion_conversations')
        .insert({
          child_id: childId,
          message_type: 'child',
          message_content: message,
          companion_personality: personality,
          context_data: context || {}
        });
    }

    // Always store companion's response
    await supabase
      .from('companion_conversations')
      .insert({
        child_id: childId,
        message_type: 'companion',
        message_content: companionResponse,
        companion_personality: personality,
        context_data: {
          interaction_type: interactionType,
          is_validated: isContentValid,
          ...context
        }
      });

    // For daily content, also store in daily_content table
    if (['daily_message', 'challenge'].includes(interactionType)) {
      await supabase
        .from('companion_daily_content')
        .insert({
          child_id: childId,
          content_type: interactionType === 'daily_message' ? 'milestone_message' : 'daily_challenge',
          content_title: interactionType === 'daily_message' ? 'Daily Message' : 'Daily Challenge',
          content_text: companionResponse,
          content_data: context || {},
          is_delivered: true
        });
    }

    console.log('AI companion response generated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      response: companionResponse,
      personality: personality,
      interactionType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-companion function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});