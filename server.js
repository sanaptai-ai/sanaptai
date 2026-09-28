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
   SMART DEMO MODE V3
   Dynamic story-based 10-second scene planner
   No Gemini API required
========================================================= */

app.post("/api/demo-project", (req, res) => {

    const { prompt, duration, aspectRatio } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({
            error: "Video prompt is required"
        });
    }

    const totalSeconds = Number(duration) || 10;
    const totalScenes = Math.ceil(totalSeconds / 10);

    const ratio = aspectRatio || "16:9";

    /*
      Basic character lock.
      This will remain identical throughout the project.
    */

    const characterLock = {
        name: "Main Character",
        description:
            "Young adult man, 25 years old, athletic build, medium skin tone, " +
            "short dark-brown hair, brown eyes, light stubble, wearing a dark jacket, " +
            "black shirt, dark jeans and black boots. " +
            "Exact same face, age, hairstyle, skin tone, body proportions, clothing, " +
            "accessories and physical appearance in every scene."
    };


    /*
      Convert the user's story into a simple story structure.
      The system creates different beats based on the user's prompt.
    */

    const storyBeats = [

        {
            purpose: "Opening",
            action:
                "The main character enters the situation described in the user's story and notices something important happening.",
            dialogue:
                "Something is not right.",
            voiceover:
                "Everything seemed normal until something unexpected changed the course of the story."
        },

        {
            purpose: "Discovery",
            action:
                "The main character carefully investigates the important person, object, place or event described in the story.",
            dialogue:
                "I need to find out what's happening.",
            voiceover:
                "Curiosity pushes him closer to the mystery."
        },

        {
            purpose: "Problem",
            action:
                "A major problem or obstacle connected to the user's story suddenly appears.",
            dialogue:
                "This is getting serious.",
            voiceover:
                "But the situation quickly becomes more dangerous than expected."
        },

        {
            purpose: "Decision",
            action:
                "The main character realizes that he must make an important decision and prepares to act.",
            dialogue:
                "I can't walk away now.",
            voiceover:
                "There was only one choice left: face the problem."
        },

        {
            purpose: "Action",
            action:
                "The main character actively responds to the problem and moves the story forward.",
            dialogue:
                "Let's do this.",
            voiceover:
                "With determination, he finally takes action."
        },

        {
            purpose: "Complication",
            action:
                "An unexpected complication changes the situation and creates a new challenge.",
            dialogue:
                "I didn't see that coming.",
            voiceover:
                "Just when everything seemed under control, another surprise appeared."
        },

        {
            purpose: "Climax",
            action:
                "The main character confronts the central challenge of the story with determination.",
            dialogue:
                "This ends now.",
            voiceover:
                "The moment of truth had finally arrived."
        },

        {
            purpose: "Resolution",
            action:
                "The main character overcomes or understands the central problem and looks toward the future.",
            dialogue:
                "It's finally over.",
            voiceover:
                "The danger passed, but the experience changed him forever."
        },

        {
            purpose: "Ending",
            action:
                "The main character looks toward the next stage of his journey as the story reaches a cinematic ending.",
            dialogue:
                "This is only the beginning.",
            voiceover:
                "And with that, a new chapter was about to begin."
        }
    ];


    const scenes = [];


    for (let i = 1; i <= totalScenes; i++) {

        const beatIndex =
            Math.min(i - 1, storyBeats.length - 1);

        const beat = storyBeats[beatIndex];


        /*
          For projects longer than 9 scenes,
          continue the final story phase without
          breaking the 10-second scene structure.
        */

        const scenePurpose =
            totalScenes > storyBeats.length && i > storyBeats.length
                ? "Continuation"
                : beat.purpose;


        scenes.push({

            scene: i,

            start: (i - 1) * 10,

            end: i * 10,

            duration: 10,


            visual_prompt:
                `${characterLock.description} ` +
                `USER STORY: "${prompt.trim()}". ` +
                `SCENE ${i} PURPOSE: ${scenePurpose}. ` +
                `Create a cinematic visual scene that directly represents the user's story. ` +
                `${beat.action} ` +
                `Do not introduce unrelated characters, locations or objects unless required by the user's story. ` +
                `Maintain realistic human movement, realistic physics, believable facial expressions, ` +
                `detailed environment, cinematic composition, high detail, realistic movie quality. ` +
                `Aspect ratio: ${ratio}. ` +
                `The scene must naturally continue from the previous scene.`,

            camera:
                i === 1
                    ? "Wide cinematic establishing shot followed by a smooth camera movement toward the main character."
                    : i % 4 === 0
                        ? "Smooth cinematic tracking shot following the character's movement."
                        : i % 3 === 0
                            ? "Medium close-up with a slow cinematic push toward the character's emotional reaction."
                            : "Cinematic over-the-shoulder shot followed by smooth forward camera movement.",

            lighting:
                "Maintain consistent cinematic lighting, color mood, environment, weather and time of day throughout the story.",

            action:
                `${beat.action} Complete the entire action naturally within exactly 10 seconds.`,

            dialogue:
                beat.dialogue,

            voiceover:
                beat.voiceover,

            continuity:
                i === 1
                    ? "Opening scene establishes the main character, location, story situation and important visual elements."
                    : `Continue directly from Scene ${i - 1}. Keep the exact same face, age, hairstyle, skin tone, body proportions, clothing, accessories, location, props, lighting, weather, time of day and emotional state. Begin from the previous scene's ending position and continue the story naturally.`
        });
    }


    res.json({

        status: "success",

        message: "Smart Demo V3 project created successfully",

        project: {

            prompt: prompt.trim(),

            duration: totalSeconds,

            sceneDuration: 10,

            totalScenes: totalScenes,

            aspectRatio: ratio,

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

    const { prompt, duration, aspectRatio } = req.body;

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
22. The visual story must be based on the USER STORY, not a fixed example.

Return ONLY valid JSON.

Required JSON structure:

{
  "duration": number,
  "sceneDuration": 10,
  "totalScenes": number,
  "aspectRatio": "9:16 or 16:9 or 1:1",
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

Requested duration: ${totalSeconds} seconds.
Required scenes: ${totalScenes}.
Aspect ratio: ${aspectRatio || "16:9"}.

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

    const { prompt, duration, aspectRatio } = req.body;

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

            totalScenes,

            aspectRatio: aspectRatio || "16:9"
        }
    });
});


/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {

    console.log(
        `SANAPTAI server running on port ${PORT}`
    );

});
