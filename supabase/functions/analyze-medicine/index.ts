import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// OpenFDA API integration for verified medicine information
async function fetchMedicineInfo(medicineName: string) {
  try {
    const searchTerm = encodeURIComponent(medicineName.toLowerCase());
    const response = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${searchTerm}"&limit=1`
    );
    
    if (!response.ok) {
      console.log('OpenFDA API returned non-OK status:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        genericName: result.openfda?.generic_name?.[0] || 'N/A',
        brandName: result.openfda?.brand_name?.[0] || medicineName,
        manufacturer: result.openfda?.manufacturer_name?.[0] || 'N/A',
        purpose: result.purpose?.[0] || result.indications_and_usage?.[0] || 'N/A',
        dosageForm: result.openfda?.dosage_form?.[0] || 'N/A',
        composition: result.active_ingredient?.[0] || 'N/A',
        sideEffects: result.adverse_reactions?.[0] || 'See package insert for complete information',
        contraindications: result.contraindications?.[0] || 'Consult healthcare provider',
      };
    }
    
    return null;
  } catch (error) {
    console.error('OpenFDA API error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Analyzing medicine image with AI...");

    // Convert URL to base64 if needed
    let imageData = image;
    if (image.startsWith("http://") || image.startsWith("https://")) {
      console.log("Fetching image from URL:", image);
      try {
        const imageResponse = await fetch(image, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!imageResponse.ok) {
          console.error("Failed to fetch image, status:", imageResponse.status);
          return new Response(
            JSON.stringify({ 
              error: "Unable to access the QR code image. Please try uploading the medicine package photo directly.",
              hint: "This QR link may not be a direct image. Try taking a photo of the medicine package instead."
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        imageData = `data:image/jpeg;base64,${base64}`;
        console.log("Image converted to base64 successfully");
      } catch (e) {
        console.error("Error fetching image:", e);
        return new Response(
          JSON.stringify({ 
            error: "Could not load the image from this QR code.",
            hint: "Please upload a photo of the medicine package directly instead of scanning a URL-based QR code."
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Call Lovable AI Gateway with image analysis
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a medicine authenticity verification AI with OCR capabilities. Analyze medicine packaging images and determine if they are genuine, fake, or suspicious.

CRITICAL: Perform thorough OCR text extraction from the entire package. Read ALL visible text including:
- Medicine name (brand and generic)
- Batch/Lot number
- Manufacturing date and Expiry date (MFG/EXP)
- Manufacturer name and address
- Any serial numbers or codes
- Dosage and composition details

Return a JSON response with:
- prediction: "genuine", "fake", or "suspicious"
- confidence: number between 0-100
- medicine_name: exact medicine name from package
- batch_number: batch/lot number if visible (extract carefully)
- expiry_date: expiry date if visible (format: DD/MM/YYYY or as shown)
- manufacturer: manufacturer name if visible
- details: detailed explanation including OCR findings, packaging quality analysis, and authenticity indicators

Verification criteria:
- Clear, professional printing (not blurry or smudged)
- Correct spelling and grammar
- Proper batch numbers and dates
- Security features (holograms, QR codes, seals)
- Packaging quality and material
- Any signs of tampering or counterfeiting`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Perform OCR to extract ALL text from this medicine package. Read the medicine name, batch number, expiry date, manufacturer, and any other visible details. Then analyze the packaging quality, printing clarity, security features, and determine if it's genuine or fake. Provide detailed findings."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    console.log("AI response received:", data);

    const aiResponse = data.choices?.[0]?.message?.content;
    let parsedResponse;
    
    try {
      parsedResponse = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;
    } catch (e) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Invalid AI response format");
    }

    // Fetch additional verified medicine info from OpenFDA
    const medicineName = parsedResponse.medicine_name || "Unknown Medicine";
    const medicineInfo = await fetchMedicineInfo(medicineName);

    // Map AI response to expected format with FDA data
    const result = {
      prediction: parsedResponse.prediction || "suspicious",
      confidence: parsedResponse.confidence || 50,
      medicine_name: medicineName,
      batch_number: parsedResponse.batch_number || "N/A",
      expiry_date: parsedResponse.expiry_date || "N/A",
      manufacturer: parsedResponse.manufacturer || medicineInfo?.manufacturer || "Unknown",
      details: parsedResponse.details || "Analysis completed",
      // Additional FDA-verified information
      fdaInfo: medicineInfo ? {
        genericName: medicineInfo.genericName,
        brandName: medicineInfo.brandName,
        purpose: medicineInfo.purpose,
        dosageForm: medicineInfo.dosageForm,
        composition: medicineInfo.composition,
        sideEffects: medicineInfo.sideEffects,
        contraindications: medicineInfo.contraindications,
      } : undefined
    };

    console.log("Returning analysis result with FDA data:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-medicine function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: "Failed to analyze medicine image"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
