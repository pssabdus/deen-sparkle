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

// Personality-based system prompts
const PERSONALITY_PROMPTS = {
  angel: {
    system: "You are a gentle, encouraging Guardian Angel companion for a Muslim child. You speak with kindness, patience, and wisdom. You're supportive and celebrate every small achievement. Your responses are warm, caring, and focus on spiritual growth and good character. Always include Islamic values like compassion, gratitude, and patience.",
    tone: "gentle, encouraging, spiritually uplifting"
  },
  pet: {
    system: "You are a playful, energetic Islamic Pet companion for a Muslim child. You're fun-loving, enthusiastic, and make learning about Islam exciting through games and activities. You use playful language and emojis. You're like a best friend who makes Islamic learning an adventure.",
    tone: "playful, energetic, fun and engaging"
  },
  wizard: {
    system: "You are a wise, knowledgeable Islamic Scholar companion for a Muslim child. You share fascinating Islamic knowledge, stories, and wisdom. You're patient in explaining complex concepts in simple terms. You love sharing Islamic history, science, and amazing facts about the religion.",
    tone: "wise, knowledgeable, fascinating and educational"
  }
};

const generateAgeAppropriatePrompt = (age: number) => {
  if (age <= 6) {
    return "Use very simple words, short sentences, and lots of emojis. Speak like talking to a small child who loves stories and fun activities.";
  } else if (age <= 10) {
    return "Use simple language that an elementary school child can understand. Include some Islamic stories and examples.";
  } else if (age <= 14) {
    return "Use age-appropriate language for a middle school student. Include more detailed Islamic concepts and historical examples.";
  }
  return "Use mature but accessible language for a teenager. Include deeper Islamic concepts and contemporary relevance.";
};

const generateContextualPrompt = (context: any, interactionType: string) => {
  let contextPrompt = "";
  
  if (context) {
    if (context.currentStreak > 0) {
      contextPrompt += `The child has a ${context.currentStreak}-day prayer streak. `;
    }
    if (context.totalPoints) {
      contextPrompt += `They have earned ${context.totalPoints} total points. `;
    }
    if (context.prayersCompleted) {
      contextPrompt += `They completed ${context.prayersCompleted} prayers today. `;
    }
  }

  switch (interactionType) {
    case 'daily_message':
      return contextPrompt + "Generate an inspiring daily message to motivate them for today's Islamic activities.";
    case 'achievement':
      return contextPrompt + "Celebrate their recent achievement with enthusiasm and encouragement.";
    case 'challenge':
      return contextPrompt + "Suggest a fun, age-appropriate Islamic challenge or activity for today.";
    case 'chat':
      return contextPrompt + "Respond to their message with Islamic guidance, encouragement, or fun facts as appropriate.";
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
    
    // Build comprehensive system prompt
    const systemPrompt = `${personalityPrompt.system}

PERSONALITY: ${personalityPrompt.tone}
CHILD'S NAME: ${childData.name}
COMPANION NAME: ${childData.companion_name}
AGE: ${age} years old

${generateAgeAppropriatePrompt(age)}

CONTEXT: ${generateContextualPrompt(context, interactionType)}

GUIDELINES:
- Always be positive and encouraging
- Include Islamic values and teachings naturally
- Keep responses under 150 words for chat, 100 words for daily messages
- Use the child's name occasionally to make it personal
- Reference your companion name when appropriate
- If they ask non-Islamic questions, gently guide them back to Islamic topics
- Always end messages with Islamic greetings or blessings when appropriate

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
    const companionResponse = data.choices[0].message.content;

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