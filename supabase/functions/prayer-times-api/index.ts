import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PrayerTimesRequest {
  latitude: number;
  longitude: number;
  method?: number; // Calculation method (1=University of Islamic Sciences, Karachi, 2=Islamic Society of North America, etc.)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, method = 1 } = await req.json() as PrayerTimesRequest;

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    // Get current date
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Call Aladhan Prayer Times API
    const prayerTimesUrl = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
    
    const response = await fetch(prayerTimesUrl);
    
    if (!response.ok) {
      throw new Error(`Prayer times API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error('Failed to fetch prayer times');
    }

    // Extract prayer times and format them
    const timings = data.data.timings;
    const prayerTimes = {
      fajr: timings.Fajr,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      sunrise: timings.Sunrise,
      sunset: timings.Sunset,
      location: {
        city: data.data.meta.timezone,
        latitude,
        longitude
      },
      date: data.data.date.readable,
      method: data.data.meta.method.name
    };

    console.log('Prayer times fetched successfully:', prayerTimes);

    return new Response(JSON.stringify({ 
      success: true,
      prayerTimes,
      message: 'Prayer times fetched successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in prayer-times-api function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});