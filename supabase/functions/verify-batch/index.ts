import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch medicine info from OpenFDA to auto-verify
async function autoVerifyFromOpenFDA(medicineName: string, batchNumber: string) {
  try {
    const searchUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(medicineName)}"&limit=1`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;
    
    const result = data.results[0];
    return {
      manufacturer: result.openfda?.manufacturer_name?.[0] || 'Unknown Manufacturer',
      generic_name: result.openfda?.generic_name?.[0],
      brand_name: result.openfda?.brand_name?.[0],
      source: 'OpenFDA',
      metadata: result.openfda
    };
  } catch (error) {
    console.error('OpenFDA auto-verify error:', error);
    return null;
  }
}

// Fetch from WHO database (simplified example)
async function autoVerifyFromWHO(medicineName: string) {
  // WHO doesn't have a public API for batch verification
  // This is a placeholder for future integration
  // You could integrate with other databases like:
  // - National drug registries
  // - CDSCO India
  // - EMA Europe
  // - etc.
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchNumber, medicineName } = await req.json();

    if (!batchNumber) {
      return new Response(
        JSON.stringify({ error: 'Batch number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, check if batch exists in our database
    const { data: existingBatch, error: fetchError } = await supabase
      .from('verified_medicines')
      .select('*')
      .eq('batch_number', batchNumber)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database fetch error:', fetchError);
    }

    // If batch found in database, return it
    if (existingBatch) {
      console.log('Batch found in database:', batchNumber);
      return new Response(
        JSON.stringify({
          isVerified: existingBatch.is_genuine,
          timestamp: new Date(existingBatch.verification_timestamp).getTime(),
          manufacturer: existingBatch.manufacturer,
          medicineName: existingBatch.medicine_name,
          source: existingBatch.verification_source,
          metadata: existingBatch.metadata
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If not found and medicine name provided, try to auto-verify from external sources
    if (medicineName) {
      console.log('Auto-verifying from external sources:', medicineName);
      
      // Try OpenFDA first
      const fdaData = await autoVerifyFromOpenFDA(medicineName, batchNumber);
      
      if (fdaData) {
        // Auto-add to our database
        const { data: newBatch, error: insertError } = await supabase
          .from('verified_medicines')
          .insert({
            batch_number: batchNumber,
            medicine_name: medicineName,
            manufacturer: fdaData.manufacturer,
            verification_source: 'OpenFDA',
            is_genuine: true,
            metadata: fdaData.metadata
          })
          .select()
          .single();

        if (insertError) {
          console.error('Auto-insert error:', insertError);
        } else {
          console.log('Auto-verified and added to database:', batchNumber);
          return new Response(
            JSON.stringify({
              isVerified: true,
              timestamp: new Date(newBatch.verification_timestamp).getTime(),
              manufacturer: newBatch.manufacturer,
              medicineName: newBatch.medicine_name,
              source: 'OpenFDA (Auto-verified)',
              metadata: fdaData.metadata
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Try WHO or other sources
      const whoData = await autoVerifyFromWHO(medicineName);
      if (whoData) {
        // Similar auto-add logic
      }
    }

    // If not found anywhere, return unverified
    console.log('Batch not found in any database:', batchNumber);
    return new Response(
      JSON.stringify({
        isVerified: false,
        message: 'Batch not found in verified medicine databases'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verify batch error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});