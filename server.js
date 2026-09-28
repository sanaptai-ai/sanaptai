import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* =========================================================
   BASIC TEST
========================================================= */

app.get("/api/test", (req, res) => {
    res.json({
        status: "success",
        message: "SANAPTAI server is working"
    });
});


    /* =========================================================
   SMART DEMO MODE V2
   Story-specific 10-second scene planner
========================================================= */

app.post("/api/demo-project", (req, res) => {

    const { prompt, duration } = req.body;

    if (!prompt) {
        return res.status(400).json({
            error: "Video prompt is required"
        });
    }

    const totalSeconds = Number(duration) || 10;
    const totalScenes = Math.ceil(totalSeconds / 10);

    const characterLock = {
        name: "Main Character",
        description:
            "Young adult man, 25 years old, athletic build, medium skin tone, " +
            "short dark-brown hair, brown eyes, light stubble, wearing a dark jacket, " +
            "black shirt, dark jeans and black boots. " +
            "Exact same face, age, hairstyle, skin tone, body proportions, clothing " +
            "and accessories in every scene."
    };

    const storyBeats = [
        {
            visual:
                "The character walks through a futuristic city at night and suddenly notices a mysterious glowing door standing between two modern buildings.",
            action:
                "He stops walking, turns toward the glowing door and cautiously takes a few steps closer.",
            dialogue:
                "What is that door doing here?",
            voiceover:
                "Among the lights of the futuristic city, one impossible door caught his attention."
        },
        {
            visual:
                "The character reaches the mysterious glowing door and carefully examines its strange symbols and pulsing blue light.",
            action:
                "He slowly raises his hand toward the symbols while watching the glowing surface react to his movement.",
            dialogue:
                "It's reacting to me.",
            voiceover:
                "The closer he got, the brighter the mysterious symbols became."
        },
        {
            visual:
                "The glowing door suddenly activates and opens into a brilliant mysterious world filled with floating lights and unknown structures.",
            action:
                "The character steps back in shock as the door opens, then looks through the opening with determination.",
            dialogue:
                "This changes everything.",
            voiceover:
                "Behind the door was a world he had never imagined."
        },
        {
            visual:
                "The character stands at the entrance and sees a vast futuristic landscape beyond the doorway.",
            action:
                "He slowly steps through the doorway while keeping his eyes fixed on the mysterious landscape ahead.",
            dialogue:
                "I have to know what's inside.",
            voiceover:
                "Curiosity becomes stronger than fear as he crosses the impossible threshold."
        },
        {
            visual:
                "Inside the mysterious world, the character discovers a massive glowing structure surrounded by floating energy.",
            action:
                "He approaches the structure and notices that its lights begin responding to his presence.",
            dialogue:
                "It knows I'm here.",
            voiceover:
                "The strange world seemed to recognize him."
        },
        {
            visual:
                "A hidden symbol appears above the glowing structure, revealing a connection between the character and the mysterious world.",
            action:
                "He looks upward in disbelief as the symbol slowly forms above him.",
            dialogue:
                "Why is my symbol here?",
            voiceover:
                "Then he discovered the first clue about why he had been brought here."
        },
        {
            visual:
                "The mysterious environment suddenly becomes darker as distant mechanical sounds echo through the landscape.",
            action:
                "The character turns around quickly and prepares himself as an unknown presence approaches.",
            dialogue:
                "Someone else is here.",
            voiceover:
                "But the discovery came with a warning."
        },
        {
            visual:
                "A huge shadow moves across the futuristic landscape while the character searches for its source.",
            action:
                "He moves behind a glowing structure and carefully watches the approaching shadow.",
            dialogue:
                "I need to stay hidden.",
            voiceover:
                "Something powerful was moving toward him."
        },
        {
            visual:
                "The character discovers an ancient control panel glowing with the same symbol from the doorway.",
            action:
                "He reaches toward the control panel and activates it, causing the entire environment to illuminate.",
            dialogue:
                "This must be the answer.",
            voiceover:
                "The final clue was closer than he realized."
        },
        {
            visual:
                "The entire mysterious world begins transforming as the control system activates.",
            action:
                "The character stands firmly as waves of light move through the landscape around him.",
            dialogue:
                "What's happening?",
            voiceover:
                "The world was responding to his decision."
        },
        {
            visual:
                "The glowing doorway reappears in the distance, now surrounded by powerful energy.",
            action:
                "The character walks toward the doorway while looking back at the mysterious world one final time.",
            dialogue:
                "I know where I need to go.",
            voiceover:
                "The mystery had finally revealed its next destination."
        },
        {
            visual:
                "The character returns toward the glowing doorway and looks ahead with determination as the futuristic city becomes visible beyond it.",
            action:
                "He steps through the doorway and walks forward into the city as the mysterious portal closes behind him.",
            dialogue:
                "This is only the beginning.",
            voiceover:
                "He returned with answers, but a much bigger journey had just begun."
        }
    ];

    const scenes = [];

    for (let i = 1; i <= totalScenes; i++) {

        const index = (i - 1) % storyBeats.length;
        const beat = storyBeats[index];

        scenes.push({

            scene: i,

            start: (i - 1) * 10,

            end: i * 10,

            duration: 10,

            visual_prompt:
                `${characterLock.description} ` +
                `Story concept: "${prompt}". ` +
                `Scene ${i}: ${beat.visual} ` +
                `Cinematic realistic environment, detailed futuristic production design, ` +
                `natural human movement, realistic physics, believable facial expressions, ` +
                `high detail, cinematic movie quality. ` +
                `The visual content must directly match the user's story concept.`,

            camera:
                i === 1
                    ? "Wide cinematic establishing shot of the futuristic city, followed by a slow push-in toward the character and glowing door."
                    : i % 4 === 0
                        ? "Smooth tracking shot following the character through the environment."
                        : i % 3 === 0
                            ? "Medium close-up slowly pushing toward the character's emotional reaction."
                            : "Cinematic over-the-shoulder shot transitioning into a smooth forward camera movement.",

            lighting:
                "Maintain consistent cinematic lighting, color mood, time of day and environmental illumination across the entire story.",

            action:
                `${beat.action} Complete the action naturally within exactly 10 seconds.`,

            dialogue:
                beat.dialogue,

            voiceover:
                beat.voiceover,

            continuity:
                i === 1
                    ? "Opening scene establishes the exact character, futuristic city, glowing door and initial mystery."
                    : `Continue directly from Scene ${i - 1}. Keep the exact same face, age, hairstyle, skin tone, body proportions, clothing, accessories, location logic, props, lighting, time of day and emotional state. The new scene must begin from the previous scene's ending position.`
        });
    }

    res.json({

        status: "success",

        message: "Smart Demo V2 project created successfully",

        project: {

            duration: totalSeconds,

            sceneDuration: 10,

            totalScenes: totalScenes,

            characterLocks: [characterLock],

            scenes: scenes
        }
    });
});

/* =========================================================
   AI SCENE PLANNER
   Uses Gemini when quota is available
========================================================= */

app.post("/api/plan-scenes", async (req, res) => {

    const { prompt, duration } = req.body;

    if (!prompt) {
        return res.status(400).json({
            error: "Video prompt is required"
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            error: "GEMINI_API_KEY is not configured"
        });
    }

    try {

        const totalSeconds = Number(duration) || 10;
        const totalScenes = Math.ceil(totalSeconds / 10);

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const systemPrompt = `
You are SANAPTAI, an advanced AI video story and scene planner.

Create a complete cinematic video plan from the user's story idea.

IMPORTANT RULES:

1. Every scene must be EXACTLY 10 seconds.
2. Total scenes must equal duration divided by 10.
3. Maintain perfect character consistency.
4. Create permanent character locks.
5. Same face, age, skin tone, hairstyle, eye color, body proportions,
   clothing and accessories in every scene.
6. Maintain location continuity.
7. Maintain time-of-day continuity.
8. Maintain weather continuity.
9. Maintain lighting continuity.
10. Maintain props and object continuity.
11. Maintain character position and emotional continuity.
12. Each scene must continue directly from the previous scene.
13. Do not repeat the same story beat.
14. Do not repeat dialogue unnecessarily.
15. Dialogue must be short enough to speak naturally within 10 seconds.
16. Voiceover must also fit naturally inside 10 seconds.
17. Visual prompts must be detailed and suitable for AI video generation.
18. Include camera movement.
19. Include lighting.
20. Include physical action.
21. Make the story cinematic, logical and engaging.

Return ONLY valid JSON.

Required JSON structure:

{
  "duration": number,
  "sceneDuration": 10,
  "totalScenes": number,
  "characterLocks": [
    {
      "name": "Character name",
      "description": "Permanent detailed character appearance lock"
    }
  ],
  "scenes": [
    {
      "scene": 1,
      "start": 0,
      "end": 10,
      "duration": 10,
      "visual_prompt": "Detailed visual prompt",
      "camera": "Camera movement",
      "lighting": "Lighting description",
      "action": "Action description",
      "dialogue": "Short spoken dialogue",
      "voiceover": "Short voiceover",
      "continuity": "Continuity instructions"
    }
  ]
}

The requested duration is ${totalSeconds} seconds.
Therefore create exactly ${totalScenes} scenes.

USER STORY:
${prompt}
`;

        const result = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: systemPrompt
        });

        let text = result.text || "";

        text = text.replace(/^```json\s*/i, "");
        text = text.replace(/^```\s*/i, "");
        text = text.replace(/\s*```$/i, "");

        let project;

        try {
            project = JSON.parse(text);
        } catch (parseError) {

            return res.status(500).json({
                error: "Gemini returned invalid JSON",
                raw: text
            });
        }

        res.json({
            status: "success",
            message: "AI scene plan created successfully",
            project: project
        });

    } catch (error) {

        console.error("Gemini Error:", error);

        if (
            error?.status === 429 ||
            error?.code === 429
        ) {

            return res.status(429).json({
                error: "Gemini quota exceeded",
                message:
                    "Gemini free-tier limit reached. Please wait and try again later."
            });
        }

        res.status(500).json({
            error: "AI scene planning failed",
            message: error?.message || "Unknown Gemini error"
        });
    }
});


/* =========================================================
   CREATE PROJECT
========================================================= */

app.post("/api/create-project", (req, res) => {

    const { prompt, duration } = req.body;

    if (!prompt) {
        return res.status(400).json({
            error: "Video prompt is required"
        });
    }

    const totalSeconds = Number(duration) || 10;
    const totalScenes = Math.ceil(totalSeconds / 10);

    res.json({
        status: "success",
        message: "Project created successfully",
        project: {
            prompt,
            duration: totalSeconds,
            sceneDuration: 10,
            totalScenes
        }
    });
});


/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {

    console.log(`SANAPTAI server running on port ${PORT}`);

});
