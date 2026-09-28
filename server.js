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
   STORY BREAKDOWN ENGINE V5
   Rule-based demo engine
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
    const lowerStory = story.toLowerCase();

    const totalSeconds = Number(duration) || 10;
    const totalScenes = Math.ceil(totalSeconds / 10);
    const ratio = aspectRatio || "16:9";


    /* =====================================================
       STORY ELEMENT DETECTION
    ===================================================== */

    let characterType = "young adult main character";

    if (
        lowerStory.includes("young boy") ||
        lowerStory.includes("little boy")
    ) {
        characterType = "young boy";
    } else if (
        lowerStory.includes("young girl") ||
        lowerStory.includes("little girl")
    ) {
        characterType = "young girl";
    } else if (lowerStory.includes("boy")) {
        characterType = "boy";
    } else if (lowerStory.includes("girl")) {
        characterType = "girl";
    } else if (lowerStory.includes("woman")) {
        characterType = "woman";
    } else if (lowerStory.includes("man")) {
        characterType = "man";
    }


    let importantElements = [];

    if (lowerStory.includes("puppy") || lowerStory.includes("dog")) {
        importantElements.push(
            "the same puppy/dog with consistent breed, fur color, size and collar"
        );
    }

    if (lowerStory.includes("cat")) {
        importantElements.push(
            "the same cat with consistent fur color, size and appearance"
        );
    }

    if (lowerStory.includes("car")) {
        importantElements.push(
            "the same car with consistent make, color and visible details"
        );
    }

    if (lowerStory.includes("house")) {
        importantElements.push(
            "the same house and surrounding environment"
        );
    }

    if (lowerStory.includes("city")) {
        importantElements.push(
            "the same city environment and logical street geography"
        );
    }

    if (lowerStory.includes("forest")) {
        importantElements.push(
            "the same forest environment and recognizable landmarks"
        );
    }

    if (lowerStory.includes("school")) {
        importantElements.push(
            "the same school environment and recognizable locations"
        );
    }

    if (lowerStory.includes("owner")) {
        importantElements.push(
            "the owner as a consistent supporting character when discovered"
        );
    }

    if (importantElements.length === 0) {
        importantElements.push(
            "all important characters, objects and locations explicitly mentioned in the user's story"
        );
    }


    /* =====================================================
       CHARACTER LOCK
    ===================================================== */

    const characterLock = {
        name: "Main Character",
        description:
            `${characterType}. ` +
            `Create a realistic appearance appropriate to the user's story. ` +
            `Maintain the exact same face, age, hairstyle, skin tone, eye color, ` +
            `body proportions, clothing, footwear and accessories in every scene. ` +
            `Never randomly change the character's appearance.`
    };


    /* =====================================================
       STORY ELEMENT LOCK
    ===================================================== */

    const storyElementLock = {
        description:
            `Important story elements: ${importantElements.join("; ")}. ` +
            `Keep every important element visually consistent whenever it appears.`
    };


    /* =====================================================
       STORY PHASES
    ===================================================== */

    const storyPhases = [

        {
            name: "Opening",
            instruction:
                `Clearly establish the beginning of this exact story: "${story}". ` +
                `Show the main character in the correct setting and introduce the central situation.`
        },

        {
            name: "Discovery",
            instruction:
                `Show the main character discovering the central person, animal, object, ` +
                `place or event that drives the user's story.`
        },

        {
            name: "Goal",
            instruction:
                `Clearly show what the main character wants to accomplish based on the user's story.`
        },

        {
            name: "Obstacle",
            instruction:
                `Show a specific obstacle that naturally prevents the main character from immediately achieving the goal.`
        },

        {
            name: "Attempt",
            instruction:
                `Show the main character making a concrete attempt to solve the problem.`
        },

        {
            name: "Complication",
            instruction:
                `Introduce a new development directly connected to the existing story, increasing the challenge.`
        },

        {
            name: "Progress",
            instruction:
                `Show the main character discovering a clue, opportunity or action that moves the story closer to its goal.`
        },

        {
            name: "Climax",
            instruction:
                `Show the central decisive moment where the main character acts to solve the main problem.`
        },

        {
            name: "Resolution",
            instruction:
                `Show the central problem being resolved according to the user's story.`
        },

        {
            name: "Ending",
            instruction:
                `Create a natural emotional ending that follows directly from the resolution of the user's story.`
        }
    ];


    /* =====================================================
       SPECIAL STORY TEMPLATE: LOST PET / OWNER
       This makes the current puppy test substantially
       more story-specific without using Gemini.
    ===================================================== */

    let specialScenes = null;

    const isLostPetStory =
        (lowerStory.includes("puppy") || lowerStory.includes("dog")) &&
        (
            lowerStory.includes("lost") ||
            lowerStory.includes("owner") ||
            lowerStory.includes("reunite")
        );


    if (isLostPetStory) {

        specialScenes = [

            {
                visual:
                    `In a busy city street, the ${characterType} notices a small lost puppy standing alone near the sidewalk while crowds move around it. The puppy looks confused and has a visible collar.`,

                action:
                    `The ${characterType} stops walking, notices the puppy and carefully approaches it without frightening it.`,

                dialogue:
                    "Hey little one, are you lost?",

                voiceover:
                    "In the middle of a busy city, he noticed a frightened puppy all alone."
            },

            {
                visual:
                    `The ${characterType} kneels beside the same puppy and gently checks its collar while the busy city continues around them.`,

                action:
                    `He calmly pets the puppy, checks the collar and searches for an identification tag or owner information.`,

                dialogue:
                    "Let's find your owner.",

                voiceover:
                    "The collar gave him hope that the puppy's owner could still be found."
            },

            {
                visual:
                    `The ${characterType} examines the puppy's collar and realizes the owner information is incomplete or difficult to read.`,

                action:
                    `He looks around the crowded street, then checks nearby people and signs while keeping the puppy safely beside him.`,

                dialogue:
                    "We need another clue.",

                voiceover:
                    "But the collar wasn't enough, so he had to find another way."
            },

            {
                visual:
                    `The ${characterType} walks carefully through the same city block with the puppy, asking nearby pedestrians if they recognize the dog.`,

                action:
                    `He approaches several pedestrians while keeping the puppy close and continues searching for someone who knows the dog.`,

                dialogue:
                    "Have you seen this puppy before?",

                voiceover:
                    "He began asking everyone nearby for help."
            },

            {
                visual:
                    `The puppy suddenly becomes alert and looks toward a familiar side street, pulling gently in that direction while the ${characterType} notices.`,

                action:
                    `The ${characterType} follows the puppy toward the side street, realizing the animal may recognize the area.`,

                dialogue:
                    "You know this place, don't you?",

                voiceover:
                    "Then the puppy suddenly seemed to recognize something."
            },

            {
                visual:
                    `The ${characterType} follows the same puppy through a connected city street toward a small neighborhood entrance.`,

                action:
                    `He follows the puppy carefully and watches where it leads while maintaining control of the situation.`,

                dialogue:
                    "Keep going. I'll follow you.",

                voiceover:
                    "Trusting the puppy's instincts, he followed its lead."
            },

            {
                visual:
                    `At the end of the street, the puppy reacts excitedly when it sees a worried person searching the area for a missing dog.`,

                action:
                    `The ${characterType} notices the worried person, stops and compares the puppy's collar with the person's reaction.`,

                dialogue:
                    "Are you looking for this puppy?",

                voiceover:
                    "At last, he saw someone who might be the owner."
            },

            {
                visual:
                    `The worried owner recognizes the same puppy and rushes toward it as the ${characterType} safely brings the puppy forward.`,

                action:
                    `The puppy runs toward the owner, and the ${characterType} steps aside as the reunion happens.`,

                dialogue:
                    "I think we found them.",

                voiceover:
                    "The lost puppy had finally found its way home."
            },

            {
                visual:
                    `The owner hugs the same puppy with relief while the ${characterType} stands nearby smiling in the same city location.`,

                action:
                    `The owner thanks the ${characterType} while holding the puppy safely, creating an emotional reunion moment.`,

                dialogue:
                    "I'm glad I could help.",

                voiceover:
                    "A small act of kindness turned a frightening day into a happy reunion."
            },

            {
                visual:
                    `The ${characterType} walks away through the same city street as the reunited owner and puppy remain safely together in the background.`,

                action:
                    `He looks back with a smile, then continues walking as the city returns to its normal rhythm.`,

                dialogue:
                    "Sometimes kindness changes everything.",

                voiceover:
                    "And sometimes, helping someone find their way home is all it takes to make a difference."
            }
        ];
    }


    /* =====================================================
       GENERIC STORY SCENES
    ===================================================== */

    const scenes = [];

    for (let i = 1; i <= totalScenes; i++) {

        let beat;

        if (specialScenes) {

            const index =
                Math.min(i - 1, specialScenes.length - 1);

            beat = specialScenes[index];

        } else {

            const phaseIndex =
                Math.min(i - 1, storyPhases.length - 1);

            const phase = storyPhases[phaseIndex];

            beat = {

                visual:
                    `${phase.instruction} ` +
                    `Use only events, characters, objects and locations that make sense for the user's story.`,

                action:
                    `The ${characterType} performs a concrete action that directly advances this story phase.`,

                dialogue:
                    i === 1
                        ? "What should I do?"
                        : i === 2
                            ? "I need to understand this."
                            : i === 3
                                ? "There has to be a way."
                                : i === 4
                                    ? "I can't give up now."
                                    : i === 5
                                        ? "Let's keep going."
                                        : i === 6
                                            ? "Something changed."
                                            : i === 7
                                                ? "I'm getting closer."
                                                : i === 8
                                                    ? "This is the moment."
                                                    : i === 9
                                                        ? "We did it."
                                                        : "I'll never forget this.",

                voiceover:
                    i === 1
                        ? "This was the moment when the story truly began."
                        : i === 2
                            ? "The discovery gave the story a new direction."
                            : i === 3
                                ? "Now the character had a clear goal."
                                : i === 4
                                    ? "But reaching that goal would not be easy."
                                    : i === 5
                                        ? "He decided to take action."
                                        : i === 6
                                            ? "Then an unexpected complication appeared."
                                            : i === 7
                                                ? "A new clue finally moved the story forward."
                                                : i === 8
                                                    ? "Everything came down to one decisive moment."
                                                    : i === 9
                                                        ? "The central problem was finally resolved."
                                                        : "The experience became a memory he would always carry."
            };
        }


        scenes.push({

            scene: i,

            start: (i - 1) * 10,

            end: i * 10,

            duration: 10,

            visual_prompt:
                `${characterLock.description} ` +
                `${storyElementLock.description} ` +
                `USER STORY: "${story}". ` +
                `SCENE ${i}. ` +
                `${beat.visual} ` +
                `Do not change the user's central story. ` +
                `Do not replace important story elements with unrelated elements. ` +
                `Use realistic cinematic environments, natural human movement, believable physics, ` +
                `realistic facial expressions, detailed production design and cinematic movie quality. ` +
                `Aspect ratio: ${ratio}. ` +
                `Everything must visually support the user's story.`,

            camera:
                i === 1
                    ? "Wide cinematic establishing shot followed by a smooth move toward the main character and the central story action."
                    : i % 4 === 0
                        ? "Smooth cinematic tracking shot following the main character and the important story action."
                        : i % 3 === 0
                            ? "Medium close-up with a slow cinematic push toward the character's emotional reaction."
                            : "Cinematic over-the-shoulder shot transitioning into a smooth natural camera movement.",

            lighting:
                "Maintain consistent lighting, color mood, weather, shadows, environment and time of day across the entire connected story.",

            action:
                `${beat.action} Complete the entire action naturally within exactly 10 seconds.`,

            dialogue:
                beat.dialogue,

            voiceover:
                beat.voiceover,

            continuity:
                i === 1
                    ? "Opening scene establishes the exact main character, important story elements, location and starting situation."
                    : `Continue directly from Scene ${i - 1}. Keep the exact same character appearance, ` +
                      `supporting characters, animals, props, vehicles, locations, weather, lighting, ` +
                      `time of day, camera geography, emotional state and physical positions. ` +
                      `Begin from the previous scene's ending position.`
        });
    }


    /* =====================================================
       RESPONSE
    ===================================================== */

    res.json({

        status: "success",

        message: "Smart Demo V5 project created successfully",

        project: {

            prompt: story,

            duration: totalSeconds,

            sceneDuration: 10,

            totalScenes: totalScenes,

            aspectRatio: ratio,

            characterLocks: [characterLock],

            storyElements: [storyElementLock],

            scenes: scenes
        }
    });
});


/* =========================================================
   AI SCENE PLANNER
   Kept for future AI mode
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

Create a complete cinematic video plan from the user's story.

Rules:

1. Every scene must be exactly 10 seconds.
2. Total scenes must equal duration divided by 10.
3. Understand the user's actual story before creating scenes.
4. Extract characters, animals, objects, locations, goals, obstacles and resolution.
5. Maintain permanent character locks.
6. Maintain animal and object consistency.
7. Maintain location continuity.
8. Maintain time-of-day and weather continuity.
9. Each scene must logically continue from the previous scene.
10. Do not use generic unrelated story beats.
11. Dialogue must fit naturally within 10 seconds.
12. Voiceover must fit naturally within 10 seconds.
13. Include detailed visual prompts.
14. Include camera, lighting, action and continuity.
15. Return ONLY valid JSON.

Required structure:

{
  "duration": number,
  "sceneDuration": 10,
  "totalScenes": number,
  "aspectRatio": "9:16 or 16:9 or 1:1",
  "characterLocks": [],
  "storyElements": [],
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
