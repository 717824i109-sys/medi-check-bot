import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
        const imageResponse = await fetch(image);
        if (!imageResponse.ok) {
          throw new Error("Failed to fetch image from URL");
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        imageData = `data:image/jpeg;base64,${base64}`;
        console.log("Image converted to base64");
      } catch (e) {
        console.error("Error fetching image:", e);
        throw new Error("Failed to fetch image from URL");
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

    // Map AI response to expected format
    const result = {
      prediction: parsedResponse.prediction || "suspicious",
      confidence: parsedResponse.confidence || 50,
      medicine_name: parsedResponse.medicine_name || "Unknown Medicine",
      batch_number: parsedResponse.batch_number || "N/A",
      expiry_date: parsedResponse.expiry_date || "N/A",
      manufacturer: parsedResponse.manufacturer || "Unknown",
      details: parsedResponse.details || "Analysis completed",
    };

    console.log("Returning analysis result:", result);

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
