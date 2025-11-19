import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

type SceneCut = {
    cutNumber: string;
    description: string;
    narration: string;
    backgroundMusic: string;
    soundEffects: string;
    dynamicElements: string;
};

type Character = {
    name: string;
    description: string;
};

type GeneratedResult = {
    fullPrompt: string;
    characters: Character[];
    sceneCuts: SceneCut[];
};


const getMetaPrompt = (verse: string, language: string, videoLength: string, cutLength: string, style: string, era: string, country: string, colorTone: string): string => {
    const timingInstructions = (videoLength.trim() || cutLength.trim()) ? `
*   **Timing and Pacing:**
    ${videoLength.trim() ? `*   **Total Duration:** The full video should be approximately ${videoLength} seconds.` : ''}
    ${cutLength.trim() ? `*   **Pacing/Cut Length:** Each scene in the breakdown should represent an average of ${cutLength} seconds.` : ''}
` : '';

    const countryInstruction = country.trim() ? `, Cultural Context: '${country}'` : '';
    const colorToneInstruction = colorTone.trim() ? `, Color Grading: '${colorTone}'` : '';
    
    const coreVisuals = `Visual Style='${style}', Historical Era='${era}'${countryInstruction}${colorToneInstruction}`;

    const sceneDescriptionInstruction = `A detailed visual and cinematic plan for this specific scene. CRITICAL: This description for EACH scene cut MUST explicitly incorporate and be consistent with the following user-defined parameters: ${coreVisuals}. Also describe the setting & action (photorealistic environment, time of day, weather), characters (appearances, historically accurate clothing, expressions), and core cinematography (camera shots, angles, movements, professional lighting).`;

    const dynamicElementsInstruction = `Describe specific, dynamic cinematic elements for this scene. Include advanced camera work (e.g., slow dolly-in, sweeping crane shot, intimate handheld follow), special cinematography details (e.g., rack focus, shallow depth of field, dramatic lens flares), and subtle visual effects (e.g., slow-motion, atmospheric particles like dust motes or light rays, speed ramping).`;

    return `
You are a world-class AI prompt engineer for text-to-video models like Sora and Veo. Your mission is to convert a Bible verse into a structured, cinematic video script.

**Input Verse:** "${verse}"

**Output Requirements:**
You must generate a JSON object with three main properties: "fullPrompt", "characters", and "sceneCuts".

1.  **fullPrompt:** Create a single, cohesive, and highly descriptive paragraph that summarizes the entire cinematic sequence. This prompt must incorporate these core creative choices: ${coreVisuals}. This is the master prompt for the video.

2.  **characters**: Create an array of character objects. Identify key figures from the verse. For EACH character, provide a 'name' and a detailed 'description' including their appearance, historically/culturally appropriate clothing, and overall demeanor.

3.  **sceneCuts:** Create an array of scene objects. For EACH object in this array, you must generate content for the following fields based on the "Comprehensive Creative Instructions" below:
    *   \`cutNumber\`: A scene identifier (e.g., "CUT #1", "CUT #2").
    *   \`description\`: ${sceneDescriptionInstruction}
    *   \`narration\`: The voice-over script for the scene.
    *   \`backgroundMusic\`: The music suggestion for the scene.
    *   \`soundEffects\`: The sound effects for the scene.
    *   \`dynamicElements\`: ${dynamicElementsInstruction}

---
**Comprehensive Creative Instructions (Apply to EACH scene):**

*   **For the "narration" field:**
    *   **Script:** Write a compelling voice-over script that enhances the scene's emotional impact.
    *   **Tone:** Use hashtags to specify the desired tone and emotion for the voice actor (e.g., #solemn, #powerful, #whispering).

*   **For the "backgroundMusic" and "soundEffects" fields:**
    *   **Music:** Suggest the style, mood, and instrumentation of the background score (e.g., "A gentle, minimalist piano melody").
    *   **Effects:** List specific, realistic sounds that would be present in the scene (e.g., "Wind rustling through dry grass, distant cry of a hawk").

---
**General Rules:**
*   **Language:** All generated text MUST be in ${language}.
${timingInstructions}
`;
};

export const generateVideoPrompt = async (verse: string, language: string, videoLength: string, cutLength: string, style: string, era: string, country: string, colorTone: string): Promise<GeneratedResult> => {
    try {
        const metaPrompt = getMetaPrompt(verse, language, videoLength, cutLength, style, era, country, colorTone);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: metaPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        fullPrompt: { type: Type.STRING },
                        characters: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                },
                                required: ["name", "description"]
                            }
                        },
                        sceneCuts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    cutNumber: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    narration: { type: Type.STRING },
                                    backgroundMusic: { type: Type.STRING },
                                    soundEffects: { type: Type.STRING },
                                    dynamicElements: { type: Type.STRING }
                                },
                                required: ["cutNumber", "description", "narration", "backgroundMusic", "soundEffects", "dynamicElements"]
                            }
                        }
                    },
                    required: ["fullPrompt", "characters", "sceneCuts"]
                }
            }
        });

        const text = response.text;
        if (!text) {
          throw new Error("No text returned from API");
        }
        
        const parsedResult = JSON.parse(text);

        // Basic validation
        if (!parsedResult.fullPrompt || !Array.isArray(parsedResult.characters) || !Array.isArray(parsedResult.sceneCuts)) {
             throw new Error("Invalid JSON structure received from API.");
        }
        
        if (parsedResult.sceneCuts.length > 0 && typeof parsedResult.sceneCuts[0].dynamicElements === 'undefined') {
             throw new Error("Invalid sceneCuts structure received from API: missing dynamicElements.");
        }

        return parsedResult;

    } catch (error) {
        console.error("Error generating prompt with Gemini:", error);
        throw new Error("Failed to generate video prompt.");
    }
};

export const generateColorToneRecommendation = async (verse: string): Promise<string> => {
    try {
        const prompt = `Based on the mood, themes, and content of the following Bible verse, suggest a single, creative, and highly descriptive color tone for a cinematic video. This suggestion should include both color palettes and artistic elements, potentially referencing famous painters, film directors, or specific art movements. Provide only the name of the color tone and artistic style, and nothing else.

Bible Verse: "${verse}"

Example outputs:
- "Deep chiaroscuro lighting with rich crimson and gold, reminiscent of a Caravaggio painting"
- "Desaturated, gritty blues and grays with a handheld feel, in the style of a modern war documentary"
- "Pastel, dreamlike palette with soft focus and lens flares, evoking the style of Terrence Malick"
- "Vibrant, hyper-realistic colors with stark, clean lines, inspired by Japanese anime"
- "Sepia-toned nostalgia with a grainy film texture, like an old photograph coming to life"
- "Monochromatic noir with deep shadows and selective shafts of brilliant white light"

Suggested Color Tone & Style:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text.trim();
        if (!text) {
          throw new Error("No color tone returned from API");
        }
        return text;

    } catch (error) {
        console.error("Error generating color tone recommendation:", error);
        throw new Error("Failed to generate color tone recommendation.");
    }
};