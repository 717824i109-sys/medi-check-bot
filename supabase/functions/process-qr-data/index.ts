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

  // Enhanced batch number patterns
  const batchPatterns = [
    /batch[:\s#]+([A-Z0-9\-\/]+)/i,
    /lot[:\s#]+([A-Z0-9\-\/]+)/i,
    /mfg[:\s#]+([A-Z0-9\-\/]+)/i,
    /batch\s*no[.:\s#]*([A-Z0-9\-\/]+)/i,
    /lot\s*no[.:\s#]*([A-Z0-9\-\/]+)/i,
    /\bLOT([A-Z0-9]+)/i,
    /\bBATCH([A-Z0-9]+)/i,
    /batch[_-]?id[=:]([A-Z0-9\-\/]+)/i,
    /lot[_-]?no[=:]([A-Z0-9\-\/]+)/i,
    /b[#]([A-Z0-9]+)/i,
  ];

  for (const pattern of batchPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.batchNumber = match[1].trim().toUpperCase();
      break;
    }
  }

  // Enhanced expiry date patterns (MM/YYYY and other formats)
  const expiryPatterns = [
    /exp[iry]*[:\s]*(\d{1,2}[\/\-]\d{2,4})/i,
    /valid\s*until[:\s]*(\d{1,2}[\/\-]\d{2,4})/i,
    /use\s*before[:\s]*(\d{1,2}[\/\-]\d{2,4})/i,
    /valid\s*till[:\s]*(\d{1,2}[\/\-]\d{2,4})/i,
    /exp[_-]?date[=:](\d{1,2}[\/\-]\d{2,4})/i,
    /expiry[_-]?date[=:](\d{1,2}[\/\-]\d{2,4})/i,
  ];

  for (const pattern of expiryPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.expiryDate = match[1];
      break;
    }
  }

  // Enhanced manufacturer patterns
  const mfgPatterns = [
    /mfg\s*by[:\s]+([A-Za-z\s&.,()]+?)(?:\||batch|exp|lot|$)/i,
    /manufactured\s*by[:\s]+([A-Za-z\s&.,()]+?)(?:\||batch|exp|lot|$)/i,
    /manufacturer[:\s]+([A-Za-z\s&.,()]+?)(?:\||batch|exp|lot|$)/i,
    /mfr[=:]([A-Za-z\s&.,()]+?)(?:&|batch|exp|lot|$)/i,
  ];

  for (const pattern of mfgPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.manufacturer = match[1].trim();
      break;
    }
  }

  // Enhanced medicine name patterns
  const namePatterns = [
    /medicine[:\s]+([A-Za-z\s®™©0-9]+?)(?:\||batch|exp|lot|$)/i,
    /product[:\s]+([A-Za-z\s®™©0-9]+?)(?:\||batch|exp|lot|$)/i,
    /drug[:\s]+([A-Za-z\s®™©0-9]+?)(?:\||batch|exp|lot|$)/i,
    /name[=:]([A-Za-z\s®™©0-9]+?)(?:&|batch|exp|lot|$)/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/, // Capitalized words at start
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      info.medicineName = match[1].trim();
      break;
    }
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
        // First, try to extract from URL itself (for shortened URLs with params)
        const urlExtracted = extractMedicineInfo(decodeURIComponent(qrData));
        
        // Fetch website content and try to extract medicine info
        const content = await fetchUrlContent(qrData);
        if (content) {
          const extracted = extractMedicineInfo(content);
          processedData.extracted = {
            ...urlExtracted, // Start with URL extraction
            ...extracted, // Override with website content if found
            foundInWebsite: !!content,
            websiteUrl: qrData
          };
        } else {
          // Use URL extraction even if fetch failed
          processedData.extracted = {
            ...urlExtracted,
            foundInWebsite: false,
            websiteUrl: qrData,
            note: 'Extracted from URL pattern (website not accessible)'
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