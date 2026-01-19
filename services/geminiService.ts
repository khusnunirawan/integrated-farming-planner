
import { GoogleGenAI } from "@google/genai";
import { ProjectState } from "../types";
import { ELEMENT_LABELS } from "../constants";

// Updated to use process.env.API_KEY exclusively as required by guidelines.
// For Pro models, the key selection is handled via window.aistudio in the UI layer.
export const generateGardenPreview = async (project: ProjectState): Promise<string> => {
  // Always create a new instance right before the call to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const isPro = project.modelMode === 'pro';
  const modelName = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const contentsParts: any[] = [
    {
      inlineData: {
        data: project.landPhotoDataUrl.split(',')[1],
        mimeType: 'image/jpeg',
      },
    }
  ];

  const elementDescriptions = Object.entries(project.selectedElements)
    .filter(([key, selected]) => selected && key !== 'raisedBed')
    .map(([key]) => {
      const detail = project.elementsDetail[key];
      const posText = detail.position === 'Otomatis' 
        ? "at the most logical position determined by AI" 
        : `at the ${detail.position} position`;
      
      let specificStyle = detail.notes || 'standard style';
      
      if (key === 'chickenCoop') {
        specificStyle = `Architectural Design Reference: Elevated wooden coop with reddish-brown varnished natural wood finish. The main structure has a red corrugated gabled roof. The entire unit sits on a single-layer grey concrete block (batako) foundation. The run area is enclosed in wire mesh and has its own inclined transparent/translucent corrugated roof section. Professional permaculture integrated aesthetic.`;
      }

      if (detail.refImageDataUrl) {
        contentsParts.push({
          inlineData: {
            data: detail.refImageDataUrl.split(',')[1],
            mimeType: 'image/jpeg',
          },
        });
      }

      return `- ${ELEMENT_LABELS[key]}: size ${detail.lengthM}m x ${detail.widthM}m, positioned ${posText}. Style: ${specificStyle}. ${detail.refImageDataUrl ? 'Follow the architectural patterns from the attached reference image.' : ''}`;
    })
    .join("\n");

  const raisedBedDescriptions = project.selectedElements.raisedBed
    ? project.raisedBeds.map((bed, idx) => {
        const posText = bed.position === 'Otomatis' 
          ? "at the best spot for sunlight" 
          : `at the ${bed.position} position`;
        
        if (bed.refImageDataUrl) {
           contentsParts.push({
            inlineData: {
              data: bed.refImageDataUrl.split(',')[1],
              mimeType: 'image/jpeg',
            },
          });
        }

        return `- Raised Bed #${idx + 1}: size ${bed.lengthM}m x ${bed.widthM}m, material: ${bed.material}, ${bed.hasTrellis ? 'include trellis (Tiang Rambatan/Ajir)' : 'no trellis'}, positioned ${posText}. Plants: ${bed.plantsText || 'various vegetables'}. ${bed.refImageDataUrl ? 'Use attached reference image for bed design.' : ''}`;
      }).join("\n")
    : "";

  const removePeopleInstruction = project.removePeople 
    ? "MANDATORY: Remove all humans/people present in the original photo. Seamlessly replace the area they occupied with background textures like grass, soil, or paving to match the surroundings."
    : "NO humans/people should be added to the design.";

  const prompt = `
    TASK: Transform the source land plot photo into a professional integrated garden design.
    ${isPro ? "QUALITY: Use Ultra High Definition render with master-level landscape details." : ""}
    
    ${removePeopleInstruction}

    CRITICAL COMPONENTS TO ADD:
    ${elementDescriptions}
    ${raisedBedDescriptions}

    ABSOLUTE NEGATIVE CONSTRAINTS:
    - NO logos, NO text, NO UI elements.
    - NO vehicles.
    - DO NOT change the sky or distant background.
    - ONLY modify the foreground midground area of the land plot.

    STYLE:
    - High-quality 3D photorealistic rendering.
    - Professional permaculture architecture.
  `.trim();

  contentsParts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: contentsParts },
      config: isPro ? {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      } : undefined
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("AI did not return any candidates.");
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new Error("AI candidate did not contain any content or parts.");
    }

    const parts = candidate.content.parts;
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("AI did not return an image part.");
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    // Propagate original error for handleProcess to catch specific messages like "Requested entity was not found"
    throw error;
  }
};
