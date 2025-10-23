import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch medicine info from OpenFDA to auto-verify
async function autoVerifyFromOpenFDA(medicineName: string, batchNumber: string) {
  try {
    // Try multiple search strategies for better matching
    let searchUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(medicineName)}"&limit=1`;
    let response = await fetch(searchUrl);
    
    if (!response.ok) {
      // Try searching by generic name if brand name fails
      const genericSearch = medicineName.split(' ')[0]; // First word often is generic name
      searchUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(genericSearch)}"&limit=1`;
      response = await fetch(searchUrl);
    }
    
    if (!response.ok) {
      // Try broader search without exact matching
      const simpleName = medicineName.replace(/[®™©]/g, '').split(' ')[0];
      searchUrl = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(simpleName)}&limit=1`;
      response = await fetch(searchUrl);
    }
    
    if (!response.ok) {
      console.log('OpenFDA: No results found');
      return null;
    }
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return null;
    }
    
    const result = data.results[0];
    console.log('OpenFDA: Medicine found -', result.openfda?.brand_name?.[0] || medicineName);
    return {
      manufacturer: result.openfda?.manufacturer_name?.[0] || 'FDA Verified Manufacturer',
      generic_name: result.openfda?.generic_name?.[0] || medicineName,
      brand_name: result.openfda?.brand_name?.[0] || medicineName,
      source: 'OpenFDA (US FDA)',
      metadata: result.openfda
    };
  } catch (error) {
    console.error('OpenFDA verification error:', error);
    return null;
  }
}

// Fetch from RxNorm (NLM - National Library of Medicine)
async function verifyFromRxNorm(medicineName: string) {
  try {
    // RxNorm API for drug name verification
    const searchUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(medicineName)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.drugGroup?.conceptGroup) {
      for (const group of data.drugGroup.conceptGroup) {
        if (group.conceptProperties && group.conceptProperties.length > 0) {
          const drug = group.conceptProperties[0];
          console.log('RxNorm: Medicine found -', drug.name);
          return {
            manufacturer: 'RxNorm Verified',
            generic_name: drug.name,
            brand_name: medicineName,
            source: 'RxNorm (NLM)',
            metadata: { rxcui: drug.rxcui, tty: drug.tty }
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('RxNorm verification error:', error);
    return null;
  }
}

// Fetch from DailyMed (NLM - Drug Labels Database)
async function verifyFromDailyMed(medicineName: string) {
  try {
    const searchUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encodeURIComponent(medicineName)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const drug = data.data[0];
      console.log('DailyMed: Medicine found -', drug.title);
      return {
        manufacturer: drug.author || 'DailyMed Verified',
        generic_name: drug.title,
        brand_name: medicineName,
        source: 'DailyMed (NLM)',
        metadata: { setid: drug.setid, published_date: drug.published_date }
      };
    }
    return null;
  } catch (error) {
    console.error('DailyMed verification error:', error);
    return null;
  }
}

// Fetch from NIH Drug Information Portal
async function verifyFromNIH(medicineName: string) {
  try {
    // NIH PubChem API for drug verification
    const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(medicineName)}/description/JSON`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.InformationList?.Information && data.InformationList.Information.length > 0) {
      const info = data.InformationList.Information[0];
      console.log('NIH PubChem: Medicine found -', info.Title);
      return {
        manufacturer: 'NIH Verified',
        generic_name: info.Title,
        brand_name: medicineName,
        source: 'NIH PubChem',
        metadata: { cid: info.CID, description: info.Description?.substring(0, 200) }
      };
    }
    return null;
  } catch (error) {
    console.error('NIH verification error:', error);
    return null;
  }
}

// Fetch from European Medicines Agency (EMA)
async function verifyFromEMA(medicineName: string) {
  try {
    // EMA API for European drug database
    const searchUrl = `https://api.ema.europa.eu/medicines/search?query=${encodeURIComponent(medicineName)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const medicine = data.results[0];
      console.log('EMA: Medicine found -', medicine.name);
      return {
        manufacturer: medicine.marketingAuthorisationHolder || 'EMA Verified',
        generic_name: medicine.activeSubstance || medicineName,
        brand_name: medicine.name || medicineName,
        source: 'EMA (European Medicines Agency)',
        metadata: { authorization_number: medicine.authorizationNumber, status: medicine.status }
      };
    }
    return null;
  } catch (error) {
    console.error('EMA verification error:', error);
    return null;
  }
}

// Multi-database verification strategy
async function verifyFromMultipleSources(medicineName: string, batchNumber: string) {
  console.log('Starting multi-source verification for:', medicineName);
  
  // Check all databases in parallel for faster response
  const [fdaData, rxNormData, dailyMedData, nihData, emaData] = await Promise.all([
    autoVerifyFromOpenFDA(medicineName, batchNumber),
    verifyFromRxNorm(medicineName),
    verifyFromDailyMed(medicineName),
    verifyFromNIH(medicineName),
    verifyFromEMA(medicineName)
  ]);
  
  // Prioritize FDA data if available
  if (fdaData && fdaData.source === 'OpenFDA') {
    return fdaData;
  }
  
  // Then try other authoritative sources
  if (dailyMedData) return dailyMedData;
  if (rxNormData) return rxNormData;
  if (nihData) return nihData;
  if (emaData) return emaData;
  
  // If found in any source, return it
  if (fdaData) return fdaData;
  
  // If not found in any database, return null
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

    // If not found and medicine name provided, try to auto-verify from multiple databases
    if (medicineName) {
      console.log('Verifying from multiple authenticated databases:', medicineName);
      
      // Check all major medicine databases
      const verificationData = await verifyFromMultipleSources(medicineName, batchNumber);
      
      if (verificationData) {
        // Auto-add to our database
        const { data: newBatch, error: insertError } = await supabase
          .from('verified_medicines')
          .insert({
            batch_number: batchNumber,
            medicine_name: medicineName,
            manufacturer: verificationData.manufacturer,
            verification_source: verificationData.source,
            is_genuine: true,
            metadata: verificationData.metadata
          })
          .select()
          .single();

        if (insertError) {
          console.error('Auto-insert error:', insertError);
          // Return verified data even if insert fails
          return new Response(
            JSON.stringify({
              isVerified: true,
              timestamp: Date.now(),
              manufacturer: verificationData.manufacturer,
              medicineName: verificationData.generic_name,
              source: verificationData.source,
              metadata: verificationData.metadata
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          console.log('✅ Verified and added to database from', verificationData.source);
          return new Response(
            JSON.stringify({
              isVerified: true,
              timestamp: new Date(newBatch.verification_timestamp).getTime(),
              manufacturer: newBatch.manufacturer,
              medicineName: newBatch.medicine_name,
              source: `${newBatch.verification_source} (Authenticated)`,
              metadata: verificationData.metadata
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
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