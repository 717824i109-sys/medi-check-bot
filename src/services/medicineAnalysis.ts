import { ScanResult } from "@/pages/Scan";
import { supabase } from "@/integrations/supabase/client";

/**
 * Converts the backend response to the ScanResult format
 */
function parseModelResponse(modelOutput: any): ScanResult {
  const prediction = modelOutput.prediction || "suspicious";
  const confidence = modelOutput.confidence || 50;
  
  // Map prediction to status format
  let status: ScanResult["status"] = "suspicious";
  if (prediction === "genuine") {
    status = "genuine";
  } else if (prediction === "fake") {
    status = "fake";
  }
  
  return {
    status,
    confidence: Math.round(confidence),
    medicineName: modelOutput.medicine_name || "Unknown Medicine",
    batchNumber: modelOutput.batch_number || "N/A",
    expiryDate: modelOutput.expiry_date || "N/A",
    manufacturer: modelOutput.manufacturer || "Unknown",
    details: modelOutput.details || generateDetailsMessage(status, confidence),
  };
}

/**
 * Generates a detailed message based on the analysis result
 */
function generateDetailsMessage(status: ScanResult["status"], confidence: number): string {
  if (status === "genuine") {
    return `AI model detected this medicine as genuine with ${confidence}% confidence. All visual features match expected patterns.`;
  } else if (status === "fake") {
    return `AI model detected potential counterfeit with ${confidence}% confidence. Visual features do not match genuine medicine patterns.`;
  } else {
    return `AI model is uncertain about this medicine (${confidence}% confidence). Manual verification recommended.`;
  }
}

/**
 * Analyzes medicine image using AI backend
 */
export async function analyzeMedicineImage(imageData: string): Promise<ScanResult> {
  try {
    console.log("Sending image to backend for analysis...");
    
    const { data, error } = await supabase.functions.invoke("analyze-medicine", {
      body: { image: imageData },
    });

    if (error) {
      console.error("Backend error:", error);
      throw new Error(error.message || "Failed to connect to analysis service");
    }

    if (!data) {
      throw new Error("No response from analysis service");
    }

    // Check for backend error messages with hints
    if (data.error) {
      const errorMsg = data.hint || data.error;
      throw new Error(errorMsg);
    }

    console.log("Analysis complete:", data);
    return parseModelResponse(data);
    
  } catch (error) {
    console.error("Medicine analysis error:", error);
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      // Pass through custom error messages from backend
      if (error.message.includes("QR code") || error.message.includes("upload")) {
        throw error;
      }
      if (error.message.includes("Rate limit")) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      }
      if (error.message.includes("Payment required")) {
        throw new Error("Service temporarily unavailable. Please contact support.");
      }
      if (error.message.includes("Failed to connect")) {
        throw new Error("Unable to reach analysis service. Please check your connection.");
      }
      // Pass through other specific errors
      throw error;
    }
    
    throw new Error("Failed to analyze image. Please try again.");
  }
}
