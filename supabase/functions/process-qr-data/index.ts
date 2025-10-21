import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract medicine info from any text format
function extractMedicineInfo(text: string) {
  const info: any = {
    batchNumber: null,
    medicineName: null,
    manufacturer: null,
    expiryDate: null,
  };

  // Common patterns for batch numbers
  const batchPatterns = [
    /batch[:\s]*([A-Z0-9\-]+)/i,
    /lot[:\s]*([A-Z0-9\-]+)/i,
    /mfg[:\s]*([A-Z0-9\-]+)/i,
    /batch\s*no[.:\s]*([A-Z0-9\-]+)/i,
    /lot\s*no[.:\s]*([A-Z0-9\-]+)/i,
  ];

  for (const pattern of batchPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.batchNumber = match[1].toUpperCase();
      break;
    }
  }

  // Expiry date patterns
  const expiryPatterns = [
    /exp[iry]*[:\s]*(\d{2}[-/]\d{2}[-/]\d{2,4})/i,
    /valid\s*until[:\s]*(\d{2}[-/]\d{2}[-/]\d{2,4})/i,
    /use\s*before[:\s]*(\d{2}[-/]\d{2}[-/]\d{2,4})/i,
  ];

  for (const pattern of expiryPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.expiryDate = match[1];
      break;
    }
  }

  // Try to extract medicine name (usually first capitalized words)
  const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (nameMatch) {
    info.medicineName = nameMatch[1];
  }

  return info;
}

// Fetch content from URL
async function fetchUrlContent(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MedGuard-AI-Bot/1.0'
      }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Simple HTML parsing to extract text
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return textContent;
  } catch (error) {
    console.error('URL fetch error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { qrData } = await req.json();

    if (!qrData || typeof qrData !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid QR data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing QR data:', qrData);

    let processedData: any = {
      type: 'unknown',
      data: qrData,
      extracted: {}
    };

    // Case 1: URL
    if (qrData.startsWith('http://') || qrData.startsWith('https://')) {
      processedData.type = 'url';
      
      // Check if it's an image URL
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(qrData)) {
        processedData.type = 'image_url';
        processedData.imageUrl = qrData;
        processedData.extracted.shouldAnalyzeImage = true;
      } else {
        // Fetch website content and try to extract medicine info
        const content = await fetchUrlContent(qrData);
        if (content) {
          const extracted = extractMedicineInfo(content);
          processedData.extracted = {
            ...extracted,
            foundInWebsite: true,
            websiteUrl: qrData
          };
        }
      }
    }
    // Case 2: JSON data
    else if (qrData.trim().startsWith('{') || qrData.trim().startsWith('[')) {
      try {
        const jsonData = JSON.parse(qrData);
        processedData.type = 'json';
        processedData.extracted = {
          batchNumber: jsonData.batch || jsonData.batchNumber || jsonData.lot,
          medicineName: jsonData.name || jsonData.medicine || jsonData.product,
          manufacturer: jsonData.manufacturer || jsonData.mfg,
          expiryDate: jsonData.expiry || jsonData.exp || jsonData.expiryDate,
          rawJson: jsonData
        };
      } catch (e) {
        console.error('JSON parse error:', e);
      }
    }
    // Case 3: Plain text - extract medicine info
    else {
      processedData.type = 'text';
      processedData.extracted = extractMedicineInfo(qrData);
    }

    console.log('Processed QR data:', processedData);

    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('QR processing error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});