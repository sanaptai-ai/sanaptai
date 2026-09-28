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
   SMART DEMO MODE V4
   Dynamic story-aware scene planner
   No Gemini required
========================================================= */

app.post("/api/demo-project", (req, res) => {

    const { prompt, duration, aspectRatio } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({
            error: "Video prompt is required"
        });
    }

    const story = prompt.trim();
    const totalSeconds = Number(duration) || 10;
    const totalScenes = Math.ceil(totalSeconds / 10);
    const ratio = aspectRatio || "16:9";

    /* =====================================================
       STORY UNDERSTANDING
    ===================================================== */

    const lowerStory = story.toLowerCase();

    let characterType = "main character";

    if (
        lowerStory.includes("young boy") ||
        lowerStory.includes("little boy") ||
        lowerStory.includes("boy")
    ) {
        characterType = "young boy";
    } else if (
        lowerStory.includes("young girl") ||
        lowerStory.includes("little girl") ||
        lowerStory.includes("girl")
    ) {
        characterType = "young girl";
    } else if (
        lowerStory.includes("woman") ||
        lowerStory.includes("girl")
    ) {
        characterType = "young woman";
    } else if (
        lowerStory.includes("man") ||
        lowerStory.includes("boy")
    ) {
        characterType = "young man";
    }


    /* =====================================================
       CHARACTER LOCK
    ===================================================== */

    const characterLock = {
        name: "Main Character",
        description:
            `${characterType}, with a natural realistic appearance appropriate to the story. ` +
            `Maintain the exact same face, age, hairstyle, skin tone, eye color, ` +
            `body proportions, clothing, footwear and accessories in every scene. ` +
            `Never randomly change the character's appearance between scenes.`
    };


    /* =====================================================
       STORY-SPECIFIC VISUAL ELEMENTS
    ===================================================== */

    let storyElements =
        "Use the important people, animals, objects, locations and events explicitly mentioned in the user's story.";

    if (
        lowerStory.includes("puppy") ||
        lowerStory.includes("dog")
    ) {
        storyElements +=
            " Include the same puppy throughout the story whenever the puppy is present. " +
            "Keep its breed, fur color, size, collar and appearance consistent.";
    }

    if (
        lowerStory.includes("city") ||
        lowerStory.includes("street")
    ) {
        storyElements +=
            " Maintain the same city environment and logical street geography between connected scenes.";
    }

    if (
        lowerStory.includes("owner") ||
        lowerStory.includes("mother") ||
        lowerStory.includes("father") ||
        lowerStory.includes("friend")
    ) {
        storyElements +=
            " Keep all important supporting characters visually consistent whenever they appear.";
    }


    /* =====================================================
       DYNAMIC STORY BEATS
    ===================================================== */

    const storyBeats = [

        {
            purpose: "Introduction",
            visual:
                `Show the beginning of the user's story: ${story}. Establish the main character, important location and the main situation.`,
            action:
                "The main character naturally enters or experiences the opening situation described by the user.",
            dialogue:
                "What's going on here?",
            voiceover:
                "It all began with an unexpected moment."
        },

        {
            purpose: "Discovery",
            visual:
                `Focus on the main character discovering the important person, animal, object or event described in: ${story}.`,
            action:
                "The main character notices, approaches or investigates the important story element.",
            dialogue:
                "I need to take a closer look.",
            voiceover:
                "Something about the situation made him stop and investigate."
        },

        {
            purpose: "First problem",
            visual:
                `Show the first real obstacle or problem naturally created by the events in: ${story}.`,
            action:
                "The main character reacts to the problem and tries to understand what to do next.",
            dialogue:
                "How am I going to fix this?",
            voiceover:
                "The simple situation suddenly became a real challenge."
        },

        {
            purpose: "Attempt",
            visual:
                `Show the main character making the first serious attempt to solve the problem in the user's story: ${story}.`,
            action:
                "The main character takes a practical action that directly advances the story.",
            dialogue:
                "There has to be a way.",
            voiceover:
                "Instead of giving up, he decided to do something about it."
        },

        {
            purpose: "Complication",
            visual:
                `Introduce a believable complication directly connected to the user's story: ${story}.`,
            action:
                "An unexpected development interrupts the character's plan.",
            dialogue:
                "That wasn't supposed to happen.",
            voiceover:
                "But the situation had one more surprise waiting."
        },

        {
            purpose: "Search",
            visual:
                `Show the main character actively searching, investigating or moving toward the solution described by the user's story.`,
            action:
                "The character follows clues, searches the environment or contacts the relevant person.",
            dialogue:
                "I'm getting closer.",
            voiceover:
                "Piece by piece, the answer began to come into view."
        },

        {
            purpose: "Climax",
            visual:
                `Show the most important confrontation, discovery or emotional moment naturally arising from: ${story}.`,
            action:
                "The main character takes decisive action during the central moment of the story.",
            dialogue:
                "This is it.",
            voiceover:
                "Everything came down to this one decisive moment."
        },

        {
            purpose: "Resolution",
            visual:
                `Show the main problem of the user's story being resolved in a believable and emotionally satisfying way.`,
            action:
                "The main character completes the action that resolves the central problem.",
            dialogue:
                "We finally made it.",
            voiceover:
                "After everything that happened, the problem was finally solved."
        },

        {
            purpose: "Ending",
            visual:
                `Create a cinematic ending that naturally follows the resolution of the user's story: ${story}.`,
            action:
                "The main character looks toward the future as the story reaches its conclusion.",
            dialogue:
                "I'll never forget this.",
            voiceover:
                "What started as an ordinary moment became a memory he would never forget."
        }
    ];


    /* =====================================================
       CREATE SCENES
    ===================================================== */

    const scenes = [];

    for (let i = 1; i <= totalScenes; i++) {

        const beatIndex =
            Math.min(i - 1, storyBeats.length - 1);

        const beat = storyBeats[beatIndex];

        const continuation =
            i === 1
                ? "Opening scene. Establish all important characters, objects and location."
                : `Continue directly from Scene ${i - 1}. ` +
                  `Preserve exact character appearance, supporting-character appearance, ` +
                  `animal appearance, props, location, weather, lighting, time of day, ` +
                  `camera geography, emotional state and physical positions. ` +
                  `The new scene must begin logically from the previous scene's ending.`;

        scenes.push({

            scene: i,

            start: (i - 1) * 10,

            end: i * 10,

            duration: 10,

            visual_prompt:
                `${characterLock.description} ` +
                `USER STORY: "${story}". ` +
                `SCENE PURPOSE: ${beat.purpose}. ` +
                `${beat.visual} ` +
                `${storyElements} ` +
                `Do not replace the user's characters with unrelated characters. ` +
                `Do not change the central story. ` +
                `Create realistic cinematic visuals, natural movement, believable physics, ` +
                `detailed environments, realistic facial expressions and movie-quality composition. ` +
                `Aspect ratio: ${ratio}. ` +
                `Every visual element must support the user's story.`,

            camera:
                i === 1
                    ? "Wide cinematic establishing shot that clearly introduces the story location, followed by a smooth move toward the main character."
                    : i % 4 === 0
                        ? "Smooth cinematic tracking shot following the character and important story action."
                        : i % 3 === 0
                            ? "Medium close-up with a slow cinematic push toward the character's emotional reaction."
                            : "Cinematic over-the-shoulder shot followed by a natural forward camera movement.",

            lighting:
                "Maintain consistent cinematic lighting, color mood, weather, shadows, environment and time of day across connected scenes.",

            action:
                `${beat.action} Complete the action naturally within exactly 10 seconds.`,

            dialogue:
                beat.dialogue,

            voiceover:
                beat.voiceover,

            continuity:
                continuation
        });
    }


    /* =====================================================
       RESPONSE
    ===================================================== */

    res.json({

        status: "success",

        message: "Smart Demo V4 project created successfully",

        project: {

            prompt: story,

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
   Gemini version kept for future use
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

Rules:

1. Every scene is exactly 10 seconds.
2. Total scenes must equal duration divided by 10.
3. Use the user's actual characters and story.
4. Do not replace the user's characters with generic characters.
5. Maintain permanent character locks.
6. Maintain location and prop continuity.
7. Do not repeat story beats unnecessarily.
8. Dialogue and voiceover must fit naturally inside 10 seconds.
9. Include detailed visual prompts.
10. Include camera, lighting, action and continuity.

Return ONLY valid JSON.

Required structure:

{
  "duration": number,
  "sceneDuration": 10,
  "totalScenes": number,
  "aspectRatio": "9:16 or 16:9 or 1:1",
  "characterLocks": [],
  "scenes": []
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
            project
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
