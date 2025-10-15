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
            content: `You are a medicine authenticity verification AI. Analyze medicine images and determine if they are genuine, fake, or suspicious. 
            
Return a JSON response with:
- prediction: "genuine", "fake", or "suspicious"
- confidence: number between 0-100
- medicine_name: name of the medicine if identifiable
- batch_number: batch number if visible
- expiry_date: expiry date if visible
- manufacturer: manufacturer name if visible
- details: explanation of your analysis

Focus on packaging quality, printing clarity, batch numbers, holograms, and any signs of counterfeit.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this medicine packaging and determine if it's genuine or fake. Look for signs of authenticity like clear printing, proper batch numbers, holograms, and packaging quality."
              },
              {
                type: "image_url",
                image_url: {
                  url: image
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
