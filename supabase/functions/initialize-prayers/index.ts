import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InitializePrayersRequest {
  childId: string;
  date?: string;
  prayerTimes: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
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

    const { childId, date, prayerTimes }: InitializePrayersRequest = await req.json();

    const targetDate = date || new Date().toISOString().split('T')[0];

    console.log('Initializing prayers for child:', childId, 'date:', targetDate);

    // Check if prayers already exist for this date
    const { data: existingPrayers, error: checkError } = await supabase
      .from('prayer_times')
      .select('prayer_name')
      .eq('child_id', childId)
      .eq('prayer_date', targetDate);

    if (checkError) {
      throw new Error(`Error checking existing prayers: ${checkError.message}`);
    }

    // Get existing prayer names
    const existingPrayerNames = existingPrayers?.map(p => p.prayer_name.toLowerCase()) || [];

    // Prayer data to insert
    const prayersToInsert = [
      { name: 'Fajr', time: prayerTimes.fajr, points: 20 },
      { name: 'Dhuhr', time: prayerTimes.dhuhr, points: 15 },
      { name: 'Asr', time: prayerTimes.asr, points: 15 },
      { name: 'Maghrib', time: prayerTimes.maghrib, points: 15 },
      { name: 'Isha', time: prayerTimes.isha, points: 20 }
    ].filter(prayer => !existingPrayerNames.includes(prayer.name.toLowerCase()));

    if (prayersToInsert.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Prayer times already initialized for this date',
          existingPrayers: existingPrayers?.length || 0
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Insert prayer records
    const prayerRecords = prayersToInsert.map(prayer => ({
      child_id: childId,
      prayer_name: prayer.name,
      prayer_date: targetDate,
      scheduled_time: prayer.time,
      points_earned: 0, // Will be set when prayer is completed
      completed_at: null,
      on_time: false
    }));

    const { data: insertedPrayers, error: insertError } = await supabase
      .from('prayer_times')
      .insert(prayerRecords)
      .select();

    if (insertError) {
      throw new Error(`Error inserting prayers: ${insertError.message}`);
    }

    console.log(`Successfully initialized ${prayerRecords.length} prayers for child ${childId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Initialized ${prayerRecords.length} prayer times`,
        insertedPrayers: insertedPrayers?.length || 0,
        prayerTimes: prayersToInsert.map(p => ({ name: p.name, time: p.time }))
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in initialize-prayers function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to initialize prayer times'
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