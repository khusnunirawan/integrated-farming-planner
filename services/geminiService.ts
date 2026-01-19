
import { GoogleGenAI } from "@google/genai";
import { ProjectState, Position } from "../types";
import { ELEMENT_LABELS } from "../constants";

// Pemetaan posisi UI ke sistem koordinat grid 0-100
// 0,0 adalah ujung belakang (background), 100,100 adalah ujung depan (foreground)
const getCoordinates = (pos: Position): { x: number; y: number } | null => {
  const map: Record<string, { x: number; y: number }> = {
    'Kiri Atas': { x: 15, y: 15 },
    'Tengah Atas': { x: 50, y: 15 },
    'Kanan Atas': { x: 85, y: 15 },
    'Tengah Kiri': { x: 15, y: 50 },
    'Tengah': { x: 50, y: 50 },
    'Tengah Kanan': { x: 85, y: 50 },
    'Kiri Bawah': { x: 15, y: 85 },
    'Tengah Bawah': { x: 50, y: 85 },
    'Kanan Bawah': { x: 85, y: 85 },
  };
  return map[pos] || null;
};

export const generateGardenPreview = async (project: ProjectState): Promise<string> => {
  // Always create a new instance of GoogleGenAI before generating content to use the latest API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isPro = project.modelMode === 'pro';
  // Selalu gunakan Gemini 2.5 Flash Image untuk kecepatan, kecuali user pilih Pro eksplisit
  const modelName = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const contentsParts: any[] = [
    {
      inlineData: {
        data: project.landPhotoDataUrl.split(',')[1],
        mimeType: 'image/jpeg',
      },
    }
  ];

  // Deskripsi elemen dengan kalkulasi skala relatif terhadap luas lahan
  const elementDescriptions = Object.entries(project.selectedElements)
    .filter(([key, selected]) => selected && key !== 'raisedBed')
    .map(([key]) => {
      const detail = project.elementsDetail[key];
      const coords = getCoordinates(detail.position);
      
      // Hitung skala objek terhadap dimensi lahan asli
      const widthPercent = (detail.widthM / project.landWidthM) * 100;
      const depthPercent = (detail.lengthM / project.landLengthM) * 100;

      const posInstruction = coords 
        ? `STRICT PLACEMENT: Place at coordinates X:${coords.x}, Y:${coords.y} on the ground plane.`
        : "PLACEMENT: Position this naturally at the most logical spot for permaculture.";
      
      let styleText = detail.notes || 'Professional organic farm style.';
      
      if (key === 'chickenCoop') {
        styleText += " Material: Natural cedar wood, sturdy wire mesh, rustic green roof.";
      }

      if (detail.refImageDataUrl) {
        contentsParts.push({
          inlineData: {
            data: detail.refImageDataUrl.split(',')[1],
            mimeType: 'image/jpeg',
          },
        });
      }

      return `- ${ELEMENT_LABELS[key]}:
        * Sizing: Occupy ${widthPercent.toFixed(0)}% of land width and ${depthPercent.toFixed(0)}% of land depth.
        * Location: ${posInstruction}
        * Visual Details: ${styleText}`;
    })
    .join("\n");

  // Deskripsi bedengan (Raised Beds)
  const raisedBedDescriptions = project.selectedElements.raisedBed
    ? project.raisedBeds.map((bed, idx) => {
        const coords = getCoordinates(bed.position);
        const wPct = (bed.widthM / project.landWidthM) * 100;
        const dPct = (bed.lengthM / project.landLengthM) * 100;

        const posText = coords 
          ? `at X:${coords.x}, Y:${coords.y}` 
          : "arranged in an organized grid cluster.";
        
        return `- Raised Bed #${idx + 1}: Scale ${wPct.toFixed(0)}%x${dPct.toFixed(0)}%, Material: ${bed.material}, ${bed.hasTrellis ? 'with climbing trellis' : 'open top'}, located ${posText}. Growing: ${bed.plantsText || 'fresh vegetables'}.`;
      }).join("\n")
    : "";

  const removePeople = project.removePeople 
    ? "CRITICAL: The original photo might have people; you MUST remove them completely and fill the space with natural ground textures."
    : "";

  const prompt = `
    TASK: Photorealistic 3D Landscape Transformation.
    
    LAND SPECS:
    Current land dimensions are ${project.landLengthM} meters deep by ${project.landWidthM} meters wide.
    Ground Surface: Entire empty ground area must be covered with ${project.groundBase}.
    
    SPATIAL GRID LOGIC:
    Imagine a 100x100 coordinate system on the ground of the original photo (0,0 is far back, 100,100 is near front).
    Render these elements into the photo with perfect perspective and lighting:
    
    ${elementDescriptions}
    ${raisedBedDescriptions}

    ${removePeople}

    QUALITY RULES:
    - 3D perspective must match the original camera angle exactly.
    - Shadows must be cast logically based on the environment's light source.
    - Textures must be high-resolution (wood, soil, plants).
    - ABSOLUTELY NO TEXT, NO LABELS, NO WATERMARKS in the image.
  `.trim();

  contentsParts.push({ text: prompt });

  try {
    // Generate content for image models. Note that thinkingConfig is not standard for image-generation tasks.
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: contentsParts },
      config: {
        imageConfig: {
          aspectRatio: "16:9" // Matches the visual container in the UI
        }
      }
    });

    if (!response.candidates?.[0]) throw new Error("Gagal mendapatkan respon dari AI.");

    for (const part of response.candidates[0].content.parts) {
      // Find and return the image part if present in the model's response.
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Data gambar tidak ditemukan dalam respon.");
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};
