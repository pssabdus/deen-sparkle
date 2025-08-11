import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StoryGenerationRequest {
  childId: string;
  familyId: string;
  theme: string;
  ageGroup: string;
  islamicFocus?: string[];
  customRequirements?: string;
  requestedBy: string;
}

interface IslamicStoryPrompt {
  id: string;
  title: string;
  prompt_text: string;
  islamic_source?: string;
  main_characters: string[];
  moral_lessons: string[];
  target_age_group: string;
  difficulty_level: string;
  islamic_concepts: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { childId, familyId, theme, ageGroup, islamicFocus, customRequirements, requestedBy }: StoryGenerationRequest = await req.json();

    console.log('Generating Islamic story for:', { childId, theme, ageGroup, islamicFocus });

    // Create story generation request record
    const { data: requestRecord, error: requestError } = await supabase
      .from('story_generation_requests')
      .insert({
        requested_by: requestedBy,
        family_id: familyId,
        child_id: childId,
        story_theme: theme,
        age_range: ageGroup,
        specific_requests: customRequirements,
        islamic_focus: islamicFocus || [],
        request_status: 'generating'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating request record:', requestError);
      throw new Error('Failed to create story request');
    }

    // Get appropriate Islamic story prompt
    const { data: prompts, error: promptError } = await supabase
      .from('islamic_story_prompts')
      .select('*')
      .eq('target_age_group', ageGroup)
      .eq('status', 'active')
      .limit(1);

    if (promptError || !prompts || prompts.length === 0) {
      console.error('Error fetching prompts:', promptError);
      throw new Error('No appropriate Islamic story prompts found');
    }

    const selectedPrompt: IslamicStoryPrompt = prompts[0];

    // Build comprehensive Islamic story generation prompt
    const systemPrompt = `You are an Islamic educator and storyteller specializing in creating authentic, age-appropriate Islamic stories for children. Your stories must:

1. ISLAMIC AUTHENTICITY:
   - Be based only on authentic Islamic sources (Quran, Hadith, Seerah, and verified Islamic history)
   - Present accurate Islamic teachings and values
   - Use proper Islamic terminology with explanations
   - Respect Islamic guidelines for storytelling

2. AGE APPROPRIATENESS:
   - Match the complexity to age group: ${ageGroup}
   - Use language suitable for the target age
   - Present concepts in developmentally appropriate ways
   - Include relatable modern applications

3. EDUCATIONAL VALUE:
   - Teach clear Islamic moral lessons
   - Include practical guidance for daily life
   - Encourage Islamic character development
   - Foster positive Islamic identity

4. CULTURAL SENSITIVITY:
   - Represent diverse Muslim backgrounds respectfully
   - Avoid cultural stereotypes
   - Include universal Islamic values

5. CONTENT REQUIREMENTS:
   - No frightening or inappropriate content
   - No contradictions to Islamic teachings
   - No fictional Islamic elements or characters
   - Proper respect for Prophets and righteous figures

The story should be between 300-800 words depending on age group. Include:
- A clear moral lesson from Islamic teachings
- Authentic characters from Islamic history or contemporary Muslim role models
- Practical applications for modern Muslim children
- Proper Islamic greetings and etiquette where appropriate`;

    const userPrompt = `Create an Islamic story with these specifications:

Theme: ${theme}
Age Group: ${ageGroup}
Islamic Focus Areas: ${islamicFocus?.join(', ') || 'General Islamic values'}
Additional Requirements: ${customRequirements || 'None'}

Based on this prompt template: ${selectedPrompt.prompt_text}

The story should incorporate these Islamic concepts: ${selectedPrompt.islamic_concepts.join(', ')}
And teach these moral lessons: ${selectedPrompt.moral_lessons.join(', ')}

Please provide:
1. Story title
2. Main story content (appropriate length for age group)
3. Clear moral lesson summary
4. Islamic terminology used with explanations
5. Recommended follow-up discussion questions for parents

Ensure the story is engaging, educational, and firmly rooted in authentic Islamic teachings.`;

    // Generate story using OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiResult = await openaiResponse.json();
    const generatedContent = openaiResult.choices[0].message.content;

    // Parse the generated content (assuming structured format)
    const contentLines = generatedContent.split('\n');
    let title = theme; // Default fallback
    let content = generatedContent;
    let moral = 'A valuable Islamic lesson';
    let terminology = {};

    // Simple parsing - in production, you'd want more robust parsing
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i].trim();
      if (line.toLowerCase().includes('title:') || line.startsWith('**Title:**')) {
        title = line.replace(/.*title:?\*?\*?\s*/i, '').replace(/\*+/g, '').trim();
      }
      if (line.toLowerCase().includes('moral lesson:') || line.includes('Moral:')) {
        moral = line.replace(/.*moral.*?:?\*?\*?\s*/i, '').replace(/\*+/g, '').trim();
      }
    }

    // Create story record
    const { data: storyData, error: storyError } = await supabase
      .from('stories')
      .insert({
        title: title,
        content: content,
        moral: moral,
        category: 'islamic_generated',
        age_group: ageGroup,
        reading_time: Math.ceil(content.length / 200), // Rough estimate
        status: 'draft', // Will need review before publishing
        islamic_source: selectedPrompt.islamic_source || 'AI Generated from Islamic Sources',
        characters: selectedPrompt.main_characters,
        islamic_lessons: selectedPrompt.moral_lessons,
        target_age_min: ageGroup === '3-6' ? 3 : ageGroup === '7-10' ? 7 : 11,
        target_age_max: ageGroup === '3-6' ? 6 : ageGroup === '7-10' ? 10 : 15,
        difficulty_level: selectedPrompt.difficulty_level,
        islamic_terminology: terminology,
        scholar_notes: 'Generated story - requires Islamic scholar review before publication',
        illustration_guidelines: 'Follow Islamic guidelines for illustrations - no human figures of Prophets or companions'
      })
      .select()
      .single();

    if (storyError) {
      console.error('Error creating story:', storyError);
      throw new Error('Failed to create story record');
    }

    // Update request status
    await supabase
      .from('story_generation_requests')
      .update({ 
        request_status: 'review',
        generated_story_id: storyData.id 
      })
      .eq('id', requestRecord.id);

    // Automatically create a family approval entry for parent review
    await supabase
      .from('family_story_approvals')
      .insert({
        story_id: storyData.id,
        family_id: familyId,
        approved_by: requestedBy,
        approval_status: 'pending'
      });

    console.log('Successfully generated Islamic story:', storyData.id);

    return new Response(
      JSON.stringify({
        success: true,
        story: storyData,
        message: 'Islamic story generated successfully and submitted for review'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in AI Islamic story generator:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate Islamic story'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});