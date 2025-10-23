import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { medicineName, latitude, longitude } = await req.json();

    // Mock pharmacy data - In production, integrate with real pharmacy APIs
    const pharmacies = [
      {
        name: "HealthPlus Pharmacy",
        distance: "0.5 km",
        price: "$12.99",
        available: true,
        rating: 4.5,
        address: "123 Main St",
        phone: "+1-555-0123"
      },
      {
        name: "MediCare Express",
        distance: "1.2 km",
        price: "$11.49",
        available: true,
        rating: 4.8,
        address: "456 Oak Ave",
        phone: "+1-555-0456"
      },
      {
        name: "QuickMed Pharmacy",
        distance: "2.3 km",
        price: "$13.99",
        available: false,
        rating: 4.2,
        address: "789 Pine Rd",
        phone: "+1-555-0789"
      }
    ];

    return new Response(
      JSON.stringify({ pharmacies }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
