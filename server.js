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
        message: "SANAPTAI V6 server is working"
    });
});


/* =========================================================
   V6 MASTER CHARACTER LOCK
   Rule-based demo engine
   Gemini is NOT used here
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
       CHARACTER TYPE
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


    /* =====================================================
       MASTER CHARACTER LOCK
    ===================================================== */

    let characterDescription;

    if (characterType === "young boy") {

        characterDescription =
            "12-year-old boy, warm natural skin tone, round youthful face, " +
            "dark brown eyes, short slightly messy black hair, slim child body, " +
            "wearing a clean sky-blue T-shirt, dark blue jeans and white sneakers";

    } else if (characterType === "young girl") {

        characterDescription =
            "12-year-old girl, natural skin tone, youthful round face, " +
            "dark brown eyes, shoulder-length dark brown hair, slim child body, " +
            "wearing a yellow hoodie, blue jeans and white sneakers";

    } else if (characterType === "boy") {

        characterDescription =
            "young boy with a youthful face, dark eyes, short dark hair, " +
            "slim child body, casual shirt, jeans and sneakers";

    } else if (characterType === "girl") {

        characterDescription =
            "young girl with a youthful face, dark eyes, dark hair, " +
            "slim child body, casual clothing and sneakers";

    } else if (characterType === "woman") {

        characterDescription =
            "adult woman with a natural realistic face, dark eyes, dark hair, " +
            "average athletic body proportions, casual modern clothing and sneakers";

    } else if (characterType === "man") {

        characterDescription =
            "adult man with a natural realistic face, dark eyes, short dark hair, " +
            "average athletic body proportions, casual modern clothing and sneakers";

    } else {

        characterDescription =
            "realistic young adult main character with natural facial features, " +
            "consistent hairstyle, clothing and body proportions";
    }


    const masterCharacterLock =
        `MASTER CHARACTER LOCK: ${characterDescription}. ` +
        `This is the permanent identity of the main character for the entire video. ` +
        `Keep exactly the same face, age, hairstyle, hair color, eye color, skin tone, ` +
        `body proportions, clothing, footwear and accessories in every scene. ` +
        `Do not redesign, replace, age, de-age or randomly change the character.`;


    /* =====================================================
       STORY ELEMENT LOCK
    ===================================================== */

    let importantElements = [];

    if (
        lowerStory.includes("puppy") ||
        lowerStory.includes("dog")
    ) {
        importantElements.push(
            "the same puppy/dog with consistent breed, fur color, size, face and collar"
        );
    }

    if (lowerStory.includes("cat")) {
        importantElements.push(
            "the same cat with consistent fur color, size, face and appearance"
        );
    }

    if (lowerStory.includes("car")) {
        importantElements.push(
            "the same car with consistent make, model, color and visible details"
        );
    }

    if (lowerStory.includes("house")) {
        importantElements.push(
            "the same house, entrance, surroundings and recognizable details"
        );
    }

    if (lowerStory.includes("city")) {
        importantElements.push(
            "the same city environment, street layout and recognizable landmarks"
        );
    }

    if (lowerStory.includes("forest")) {
        importantElements.push(
            "the same forest environment, trees, paths and recognizable landmarks"
        );
    }

    if (lowerStory.includes("school")) {
        importantElements.push(
            "the same school building, classroom and recognizable locations"
        );
    }

    if (lowerStory.includes("owner")) {
        importantElements.push(
            "the owner as a consistent supporting character whenever discovered"
        );
    }

    if (importantElements.length === 0) {

        importantElements.push(
            "all important characters, objects and locations explicitly mentioned in the user's story"
        );
    }


    const storyElementLock =
        `STORY ELEMENT LOCK: ${importantElements.join("; ")}. ` +
        `Keep every important story element visually consistent whenever it appears.`;


    /* =====================================================
       SPECIAL STORY: LOST PET
    ===================================================== */

    const isLostPetStory =
        (lowerStory.includes("puppy") ||
         lowerStory.includes("dog")) &&
        (
            lowerStory.includes("lost") ||
            lowerStory.includes("owner") ||
            lowerStory.includes("reunite")
        );


    let specialScenes = null;

    if (isLostPetStory) {

        specialScenes = [

            {
                visual:
                    `In a busy city street, the ${characterType} notices a small lost puppy standing alone near the sidewalk while crowds move around it. The puppy has consistent fur, size and a visible collar.`,

                action:
                    `The ${characterType} stops walking, notices the puppy and carefully approaches it without frightening it.`,

                dialogue:
                    "Hey little one, are you lost?",

                voiceover:
                    "In the middle of a busy city, he noticed a frightened puppy all alone."
            },

            {
                visual:
                    `The ${characterType} kneels beside the same puppy and gently checks its collar while the same busy city street continues around them.`,

                action:
                    `He calmly pets the puppy, checks the collar and searches for an identification tag or owner information.`,

                dialogue:
                    "Let's find your owner.",

                voiceover:
                    "The collar gave him hope that the puppy's owner could still be found."
            },

            {
                visual:
                    `The ${characterType} examines the same puppy's collar and realizes the owner information is incomplete or difficult to read.`,

                action:
                    `He looks around the crowded street, checks nearby people and signs while keeping the puppy safely beside him.`,

                dialogue:
                    "We need another clue.",

                voiceover:
                    "But the collar wasn't enough, so he had to find another way."
            },

            {
                visual:
                    `The ${characterType} walks carefully through the same city block with the same puppy, asking nearby pedestrians if they recognize the dog.`,

                action:
                    `He approaches several pedestrians while keeping the puppy close and continues searching for someone who knows the dog.`,

                dialogue:
                    "Have you seen this puppy before?",

                voiceover:
                    "He began asking everyone nearby for help."
            },

            {
                visual:
                    `The same puppy suddenly becomes alert and looks toward a familiar side street while the ${characterType} notices.`,

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
                    `At the end of the street, the same puppy reacts excitedly when it sees a worried person searching for a missing dog.`,

                action:
                    `The ${characterType} notices the worried person and safely brings the puppy closer.`,

                dialogue:
                    "Are you looking for this puppy?",

                voiceover:
                    "At last, he saw someone who might be the owner."
            },

            {
                visual:
                    `The worried owner recognizes the same puppy and rushes toward it as the ${characterType} safely brings the puppy forward.`,

                action:
                    `The puppy runs toward the owner while the ${characterType} steps aside and watches the reunion.`,

                dialogue:
                    "I think we found them.",

                voiceover:
                    "The lost puppy had finally found its way home."
            },

            {
                visual:
                    `The owner hugs the same puppy with relief while the ${characterType} stands nearby smiling in the same city location.`,

                action:
                    `The owner thanks the ${characterType} while holding the puppy safely.`,

                dialogue:
                    "I'm glad I could help.",

                voiceover:
                    "A small act of kindness turned a frightening day into a happy reunion."
            },

            {
                visual:
                    `The ${characterType} walks away through the same city street while the reunited owner and puppy remain safely together in the background.`,

                action:
                    `He looks back with a smile and continues walking as the city returns to its normal rhythm.`,

                dialogue:
                    "Sometimes kindness changes everything.",

                voiceover:
                    "Sometimes helping someone find their way home is all it takes to make a difference."
            }
        ];
    }


    /* =====================================================
       GENERIC STORY PHASES
    ===================================================== */

    const storyPhases = [

        "Opening: establish the exact beginning of the user's story and introduce the central situation.",

        "Discovery: show the main character discovering the important person, animal, object, place or event in the user's story.",

        "Goal: clearly show what the main character needs or wants to accomplish.",

        "Obstacle: introduce a story-relevant problem that prevents immediate success.",

        "Attempt: show a concrete action taken to solve the problem.",

        "Complication: introduce a new development connected directly to the existing story.",

        "Progress: show a clue, discovery or action that moves the story forward.",

        "Climax: show the decisive moment where the main character acts.",

        "Resolution: show the central problem being resolved.",

        "Ending: create a natural ending that follows from the resolution."
    ];


    /* =====================================================
       SCENE CREATION
    ===================================================== */

    const scenes = [];

    for (let i = 1; i <= totalScenes; i++) {

        let beat;

        if (specialScenes) {

            beat =
                specialScenes[
                    Math.min(i - 1, specialScenes.length - 1)
                ];

        } else {

            const phase =
                storyPhases[
                    Math.min(i - 1, storyPhases.length - 1)
                ];

            beat = {

                visual:
                    `${phase} ` +
                    `Use only characters, objects, locations and events that logically belong to this user's story.`,

                action:
                    `The ${characterType} performs a concrete action directly connected to the user's story.`,

                dialogue:
                    i === 1
                        ? "This is where it begins."
                        : i === 2
                            ? "I need to understand this."
                            : i === 3
                                ? "I know what I have to do."
                                : i === 4
                                    ? "This won't be easy."
                                    : i === 5
                                        ? "I'll find a way."
                                        : i === 6
                                            ? "Something changed."
                                            : i === 7
                                                ? "We're getting closer."
                                                : i === 8
                                                    ? "This is the moment."
                                                    : i === 9
                                                        ? "It's finally over."
                                                        : "I'll remember this.",

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
                                        ? "The character decided to take action."
                                        : i === 6
                                            ? "Then something unexpected changed the situation."
                                            : i === 7
                                                ? "A new clue moved the story forward."
                                                : i === 8
                                                    ? "Everything came down to one decisive moment."
                                                    : i === 9
                                                        ? "The central problem was finally resolved."
                                                        : "The experience became a memory that would last."
            };
        }


        scenes.push({

            scene: i,

            start: (i - 1) * 10,

            end: i * 10,

            duration: 10,

            visual_prompt:
                `${masterCharacterLock} ` +
                `${storyElementLock} ` +
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
                    ? "Wide cinematic establishing shot followed by a smooth move toward the main character and central story action."
                    : i % 4 === 0
                        ? "Smooth cinematic tracking shot following the main character and important story action."
                        : i % 3 === 0
                            ? "Medium close-up with a slow cinematic push toward the character's emotional reaction."
                            : "Cinematic over-the-shoulder shot transitioning into smooth natural camera movement.",

            lighting:
                "Maintain the same lighting, color mood, weather, shadows, environment and time of day across the connected story.",

            action:
                `${beat.action} Complete the entire action naturally within exactly 10 seconds.`,

            dialogue:
                beat.dialogue,

            voiceover:
                beat.voiceover,

            continuity:
                i === 1
                    ? "Opening scene establishes the permanent character identity, important story elements, location and starting situation."
                    : `Continue directly from Scene ${i - 1}. Maintain the MASTER CHARACTER LOCK exactly. ` +
                      `Keep the same face, age, hairstyle, skin tone, eyes, body proportions, clothing, footwear and accessories. ` +
                      `Keep the same supporting characters, animals, props, vehicles, locations, weather, lighting, ` +
                      `time of day, camera geography, emotional state and physical positions. ` +
                      `Begin from the previous scene's ending position.`
        });
    }


    /* =====================================================
       RESPONSE
    ===================================================== */

    res.json({

        status: "success",

        message: "SANAPTAI V6 Master Character Lock project created successfully",

        project: {

            prompt: story,

            duration: totalSeconds,

            sceneDuration: 10,

            totalScenes: totalScenes,

            aspectRatio: ratio,

            characterLocks: [
                {
                    name: "MASTER CHARACTER",
                    description: characterDescription
                }
            ],

            storyElements: [
                {
            description: storyElementLock
                }
            ],

            scenes: scenes
        }
    });
});


/* =========================================================
   AI SCENE PLANNER
   Future AI mode
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
        `SANAPTAI V6 server running on port ${PORT}`
    );

 });       
