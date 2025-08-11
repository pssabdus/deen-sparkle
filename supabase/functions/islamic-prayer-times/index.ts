import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PrayerRequest {
  latitude: number;
  longitude: number;
  calculationMethod?: number;
  date?: string;
  timezone?: string;
}

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  timezone: string;
  qibla: number;
}

// Islamic prayer calculation methods
const CALCULATION_METHODS = {
  1: { name: "Umm al-Qura University", fajrAngle: 18.5, ishaMinutes: 90 },
  2: { name: "Islamic Society of North America", fajrAngle: 15, ishaAngle: 15 },
  3: { name: "Muslim World League", fajrAngle: 18, ishaAngle: 17 },
  4: { name: "Egyptian General Authority", fajrAngle: 19.5, ishaAngle: 17.5 },
  5: { name: "University of Islamic Sciences, Karachi", fajrAngle: 18, ishaAngle: 18 },
  7: { name: "Institute of Geophysics, University of Tehran", fajrAngle: 17.7, ishaAngle: 14 },
  8: { name: "Gulf Region", fajrAngle: 19.5, ishaMinutes: 90 },
  9: { name: "Kuwait", fajrAngle: 18, ishaAngle: 17.5 },
  10: { name: "Qatar", fajrAngle: 18, ishaMinutes: 90 },
  11: { name: "Majlis Ugama Islam Singapura", fajrAngle: 20, ishaAngle: 18 },
  12: { name: "Union Organization islamic de France", fajrAngle: 12, ishaAngle: 12 },
  13: { name: "Diyanet İşleri Başkanlığı, Turkey", fajrAngle: 18, ishaAngle: 17 },
  14: { name: "Spiritual Administration of Muslims of Russia", fajrAngle: 16, ishaAngle: 15 }
};

// Calculate prayer times using astronomical calculations
function calculatePrayerTimes(lat: number, lng: number, date: Date, method: number = 1): PrayerTimes {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;
  
  // Julian day calculation
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  
  let a = Math.floor((14 - month) / 12);
  let yearAdj = year - a;
  let m = month + 12 * a - 3;
  
  const julianDay = day + Math.floor((153 * m + 2) / 5) + 365 * yearAdj + Math.floor(yearAdj / 4) - Math.floor(yearAdj / 100) + Math.floor(yearAdj / 400) + 1721119;
  
  // Calculate sun's position
  const n = julianDay - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * rad;
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad;
  
  // Sun's declination
  const delta = Math.asin(Math.sin(lambda) * Math.sin(23.439 * rad));
  
  // Equation of time
  const E = 4 * (L - 0.0057183 - Math.atan2(Math.tan(lambda), Math.cos(23.439 * rad)) * deg);
  
  // Calculate prayer times
  const calcMethod = CALCULATION_METHODS[method as keyof typeof CALCULATION_METHODS] || CALCULATION_METHODS[1];
  
  const fajrAngle = calcMethod.fajrAngle * rad;
  const ishaAngle = calcMethod.ishaAngle ? calcMethod.ishaAngle * rad : null;
  const ishaMinutes = calcMethod.ishaMinutes || null;
  
  // Fajr time
  const fajrHA = Math.acos((-Math.sin(fajrAngle) - Math.sin(lat * rad) * Math.sin(delta)) / (Math.cos(lat * rad) * Math.cos(delta))) * deg;
  const fajrTime = 12 - fajrHA / 15 - E / 60;
  
  // Sunrise time
  const sunriseHA = Math.acos((-Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(delta)) / (Math.cos(lat * rad) * Math.cos(delta))) * deg;
  const sunriseTime = 12 - sunriseHA / 15 - E / 60;
  
  // Dhuhr time (solar noon)
  const dhuhrTime = 12 - E / 60;
  
  // Asr time (Shafi method: shadow = object + shadow at noon)
  const asrAngle = Math.atan(1 + Math.tan(Math.abs(lat * rad - delta)));
  const asrHA = Math.acos((Math.sin(asrAngle) - Math.sin(lat * rad) * Math.sin(delta)) / (Math.cos(lat * rad) * Math.cos(delta))) * deg;
  const asrTime = 12 + asrHA / 15 - E / 60;
  
  // Maghrib time (sunset)
  const maghribTime = 12 + sunriseHA / 15 - E / 60;
  
  // Isha time
  let ishaTime: number;
  if (ishaAngle) {
    const ishaHA = Math.acos((-Math.sin(ishaAngle) - Math.sin(lat * rad) * Math.sin(delta)) / (Math.cos(lat * rad) * Math.cos(delta))) * deg;
    ishaTime = 12 + ishaHA / 15 - E / 60;
  } else if (ishaMinutes) {
    ishaTime = maghribTime + ishaMinutes / 60;
  } else {
    ishaTime = maghribTime + 1.5; // Default 1.5 hours after maghrib
  }
  
  // Calculate Qibla direction
  const qiblaLat = 21.4225 * rad; // Kaaba latitude
  const qiblaLng = 39.8262 * rad; // Kaaba longitude
  const latRad = lat * rad;
  const lngRad = lng * rad;
  
  const dLng = qiblaLng - lngRad;
  const y = Math.sin(dLng) * Math.cos(qiblaLat);
  const x = Math.cos(latRad) * Math.sin(qiblaLat) - Math.sin(latRad) * Math.cos(qiblaLat) * Math.cos(dLng);
  const qibla = (Math.atan2(y, x) * deg + 360) % 360;
  
  // Format times as HH:MM
  const formatTime = (time: number): string => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  return {
    fajr: formatTime(fajrTime),
    sunrise: formatTime(sunriseTime),
    dhuhr: formatTime(dhuhrTime),
    asr: formatTime(asrTime),
    maghrib: formatTime(maghribTime),
    isha: formatTime(ishaTime),
    date: date.toISOString().split('T')[0],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    qibla: Math.round(qibla * 100) / 100
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { latitude, longitude, calculationMethod = 1, date, timezone }: PrayerRequest = await req.json();

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error('Invalid coordinates');
    }

    const requestDate = date ? new Date(date) : new Date();
    const prayerTimes = calculatePrayerTimes(latitude, longitude, requestDate, calculationMethod);
    
    // Get Islamic date information
    const hijriResponse = await fetch(`http://api.aladhan.com/v1/gToH/${requestDate.getDate()}-${requestDate.getMonth() + 1}-${requestDate.getFullYear()}`);
    const hijriData = await hijriResponse.json();
    
    const islamicDate = hijriData.data ? {
      day: hijriData.data.hijri.day,
      month: hijriData.data.hijri.month.en,
      year: hijriData.data.hijri.year,
      formatted: `${hijriData.data.hijri.day} ${hijriData.data.hijri.month.en} ${hijriData.data.hijri.year} AH`
    } : null;

    // Get method information
    const methodInfo = CALCULATION_METHODS[calculationMethod as keyof typeof CALCULATION_METHODS] || CALCULATION_METHODS[1];

    console.log(`Prayer times calculated for coordinates: ${latitude}, ${longitude} using method: ${methodInfo.name}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        prayerTimes,
        islamicDate,
        location: { latitude, longitude },
        calculationMethod: {
          id: calculationMethod,
          name: methodInfo.name
        },
        qiblaDirection: prayerTimes.qibla
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Prayer times calculation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to calculate prayer times'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});