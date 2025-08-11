import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childId, familyId, userRole } = await req.json();

    if (!childId || !familyId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get child's current progress and interests
    const { data: childData, error: childError } = await supabase
      .from('children')
      .select(`
        name,
        age,
        islamic_level,
        companion_type,
        total_points,
        current_streak,
        learning_preferences
      `)
      .eq('id', childId)
      .single();

    if (childError) {
      console.error('Error fetching child data:', childError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch child data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get recent achievements and progress
    const { data: achievements, error: achievementsError } = await supabase
      .from('child_islamic_milestones')
      .select(`
        progress_percentage,
        earned_at,
        islamic_achievements(
          name_english,
          category_id,
          islamic_achievement_categories(name_english)
        )
      `)
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
    }

    // Get current Islamic date and upcoming occasions
    const islamicDate = new Date();
    const currentMonth = islamicDate.getMonth() + 1;
    let seasonalContext = '';
    
    if (currentMonth === 9) {
      seasonalContext = 'during the blessed month of Ramadan';
    } else if (currentMonth === 12) {
      seasonalContext = 'during the season of Hajj and Dhul Hijjah';
    } else if (currentMonth === 3) {
      seasonalContext = 'during the blessed month of Rabi al-Awwal';
    }

    const systemPrompt = `You are an Islamic education AI creating personalized challenges for Muslim children. 

Child Profile:
- Name: ${childData.name}
- Age: ${childData.age}
- Islamic Level: ${childData.islamic_level}
- Current Points: ${childData.total_points}
- Prayer Streak: ${childData.current_streak} days
- Learning Style: ${childData.learning_preferences}

Recent Progress:
${achievements?.map(a => `- ${a.islamic_achievements.name_english}: ${a.progress_percentage}% complete`).join('\n')}

Context: ${seasonalContext}

Create a personalized family Islamic challenge that:
1. Uses authentic Islamic terminology with Arabic, transliteration, and English
2. Is age-appropriate and builds on current progress
3. Encourages family bonding through Islamic practices
4. Includes specific, measurable goals
5. Has educational components explaining Islamic significance
6. Takes into account seasonal Islamic occasions

Response format (JSON):
{
  "challenge": {
    "name_arabic": "Arabic name",
    "name_english": "English name", 
    "description": "Detailed description",
    "challenge_type": "family_bonding|prayer|quran|charity|islamic_knowledge",
    "duration_days": 7,
    "goals": [
      {
        "description": "Specific goal",
        "points_reward": 50,
        "islamic_significance": "Why this is important in Islam"
      }
    ],
    "educational_content": {
      "verse_reference": "Quran reference if applicable",
      "hadith_reference": "Hadith reference if applicable", 
      "explanation": "Islamic significance and benefits"
    },
    "success_celebration": {
      "dua": "Arabic dua for completion",
      "translation": "English translation",
      "family_activity": "Suggested celebration"
    }
  }
}`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a personalized Islamic challenge for ${childData.name}'s family focusing on their current level and interests.` }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    let challengeData;
    try {
      challengeData = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid AI response format');
    }

    // Save the challenge to database
    const challengeToSave = {
      family_id: familyId,
      name_arabic: challengeData.challenge.name_arabic,
      name_english: challengeData.challenge.name_english,
      description: challengeData.challenge.description,
      challenge_type: challengeData.challenge.challenge_type,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + (challengeData.challenge.duration_days * 24 * 60 * 60 * 1000)).toISOString(),
      goals: challengeData.challenge.goals,
      educational_content: challengeData.challenge.educational_content,
      success_celebration: challengeData.challenge.success_celebration,
      is_active: true,
      created_by_ai: true
    };

    const { data: savedChallenge, error: saveError } = await supabase
      .from('family_islamic_challenges')
      .insert(challengeToSave)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving challenge:', saveError);
      return new Response(
        JSON.stringify({ error: 'Failed to save challenge' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('AI Islamic challenge created successfully for family:', familyId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        challenge: savedChallenge,
        message: 'Personalized Islamic challenge created successfully!'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in AI Islamic achievement suggestions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});