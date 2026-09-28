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
   SMART DEMO MODE
   Works without Gemini
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
            "black shirt, dark jeans and black boots. Exact same face, age, hairstyle, " +
            "clothing, body proportions and accessories in every scene."
    };

    const storyBeats = [
        "The character enters the environment and notices the first unusual clue.",
        "The character carefully approaches the discovery and studies it.",
        "The character realizes that the discovery is connected to something much bigger.",
        "The character tests the mysterious object or situation and observes an unexpected reaction.",
        "The character faces a new obstacle that prevents an easy solution.",
        "The character finds an important clue and understands what must be done next.",
        "The character takes a risky but deliberate step toward solving the mystery.",
        "The character reaches a major turning point and discovers a hidden truth.",
        "The character confronts the immediate danger and acts quickly.",
        "The character overcomes the obstacle and sees the consequences of the decision.",
        "The character reaches the final discovery and understands its meaning.",
        "The character completes the immediate objective and looks toward what comes next."
    ];

    const dialogues = [
        "What is that?",
        "I've never seen anything like this.",
        "This can't be here by accident.",
        "Something is responding to me.",
        "Wait... what just happened?",
        "Now I understand.",
        "There's only one way to find out.",
        "This changes everything.",
        "I have to keep going.",
        "It's finally working.",
        "So this was the secret.",
        "Whatever comes next, I'm ready."
    ];

    const voiceovers = [
        "In a city filled with advanced technology, one discovery made no sense.",
        "The closer he got, the stranger the mystery became.",
        "What looked impossible was beginning to reveal a hidden purpose.",
        "Then the discovery suddenly reacted to his presence.",
        "For the first time, he realized he might be in danger.",
        "A single clue gave him a reason to continue.",
        "He knew the next step could change everything.",
        "The truth was far bigger than he had imagined.",
        "There was no turning back now.",
        "The mystery was finally beginning to make sense.",
        "At last, the hidden purpose became clear.",
        "And this was only the beginning."
    ];

    const scenes = [];

    for (let i = 1; i <= totalScenes; i++) {

        const index = (i - 1) % storyBeats.length;

        const beat = storyBeats[index];

        let dialogue = "";
        let voiceover = "";

        if (i === 1) {
            dialogue = dialogues[0];
            voiceover = voiceovers[0];
        } else if (i % 3 === 0) {
            dialogue = dialogues[index];
        } else if (i % 2 === 0) {
            voiceover = voiceovers[index];
        }

        scenes.push({

            scene: i,

            start: (i - 1) * 10,

            end: i * 10,

            duration: 10,

            visual_prompt:
                `${characterLock.description} ` +
                `Story concept: "${prompt}". ` +
                `Scene ${i}: ${beat} ` +
                `Show a detailed cinematic environment directly connected to the previous scene. ` +
                `Use realistic human movement, natural body proportions and believable physical interaction. ` +
                `Keep the same character identity, clothing, props, location and visual style. ` +
                `The scene must feel like one continuous movie rather than a separate clip.`,

            camera:
                i === 1
                    ? "Wide establishing shot, then a slow cinematic push-in toward the character."
                    : i % 3 === 0
                        ? "Medium close-up with a slow push-in to capture the character's reaction."
                        : "Smooth cinematic tracking shot following the character's movement.",

            lighting:
                "Consistent cinematic lighting matching the same location, time of day and emotional mood as the previous scene.",

            action:
                `${beat} The action must begin from the previous scene's ending state and be completed naturally within 10 seconds.`,

            dialogue: dialogue,

            voiceover: voiceover,

            continuity:
                i === 1
                    ? "Opening scene establishes the main character, environment and initial mystery."
                    : `Continue directly from Scene ${i - 1}. Preserve the exact same character appearance, clothing, location, props, lighting, time of day and emotional state.`
        });
    }

    res.json({

        status: "success",

        message: "Smart demo project created successfully",

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
