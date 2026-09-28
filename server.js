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
        message: "SANAPTAI V7 server is working"
    });
});


/* =========================================================
   V7 STORY UNDERSTANDING ENGINE
   Demo mode - Gemini NOT used
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
       STORY UNDERSTANDING
    ===================================================== */

    const characters = [];
    const locations = [];
    const objects = [];
    const goals = [];
    const conflicts = [];
    const events = [];


    /* ================= CHARACTER DETECTION ================= */

    let mainCharacter = "young adult main character";

    if (
        lowerStory.includes("young boy") ||
        lowerStory.includes("little boy")
    ) {
        mainCharacter = "12-year-old boy";
    } else if (
        lowerStory.includes("young girl") ||
        lowerStory.includes("little girl")
    ) {
        mainCharacter = "12-year-old girl";
    } else if (lowerStory.includes("boy")) {
        mainCharacter = "young boy";
    } else if (lowerStory.includes("girl")) {
        mainCharacter = "young girl";
    } else if (lowerStory.includes("woman")) {
        mainCharacter = "adult woman";
    } else if (lowerStory.includes("man")) {
        mainCharacter = "adult man";
    }

    characters.push(mainCharacter);


    /* ================= ANIMAL DETECTION ================= */

    if (lowerStory.includes("puppy")) {
        characters.push("lost puppy");
    } else if (lowerStory.includes("dog")) {
        characters.push("dog");
    }

    if (lowerStory.includes("cat")) {
        characters.push("cat");
    }

    if (lowerStory.includes("horse")) {
        characters.push("horse");
    }

    if (lowerStory.includes("bird")) {
        characters.push("bird");
    }


    /* ================= SUPPORTING CHARACTER ================= */

    if (lowerStory.includes("owner")) {
        characters.push("pet owner");
    }

    if (
        lowerStory.includes("friend") ||
        lowerStory.includes("best friend")
    ) {
        characters.push("friend");
    }

    if (
        lowerStory.includes("mother") ||
        lowerStory.includes("mom")
    ) {
        characters.push("mother");
    }

    if (
        lowerStory.includes("father") ||
        lowerStory.includes("dad")
    ) {
        characters.push("father");
    }

    if (
        lowerStory.includes("villain") ||
        lowerStory.includes("enemy")
    ) {
        characters.push("antagonist");
    }


    /* ================= LOCATION DETECTION ================= */

    if (lowerStory.includes("city")) {
        locations.push("busy city environment");
    }

    if (
        lowerStory.includes("street") ||
        lowerStory.includes("road")
    ) {
        locations.push("city street or road");
    }

    if (lowerStory.includes("forest")) {
        locations.push("forest environment");
    }

    if (lowerStory.includes("school")) {
        locations.push("school environment");
    }

    if (lowerStory.includes("park")) {
        locations.push("park environment");
    }

    if (lowerStory.includes("house") ||
        lowerStory.includes("home")) {
        locations.push("home environment");
    }

    if (lowerStory.includes("hospital")) {
        locations.push("hospital environment");
    }

    if (lowerStory.includes("office")) {
        locations.push("office environment");
    }

    if (lowerStory.includes("mountain")) {
        locations.push("mountain environment");
    }

    if (lowerStory.includes("village")) {
        locations.push("village environment");
    }


    if (locations.length === 0) {
        locations.push("location established naturally from the user's story");
    }


    /* ================= OBJECT DETECTION ================= */

    if (lowerStory.includes("car")) {
        objects.push("car");
    }

    if (lowerStory.includes("phone")) {
        objects.push("phone");
    }

    if (lowerStory.includes("letter")) {
        objects.push("letter");
    }

    if (lowerStory.includes("money")) {
        objects.push("money");
    }

    if (lowerStory.includes("key")) {
        objects.push("key");
    }

    if (lowerStory.includes("bag")) {
        objects.push("bag");
    }

    if (lowerStory.includes("collar")) {
        objects.push("pet collar");
    }

    if (lowerStory.includes("photo") ||
        lowerStory.includes("picture")) {
        objects.push("photograph");
    }


    /* =====================================================
       GOAL UNDERSTANDING
    ===================================================== */

    if (
        lowerStory.includes("reunite") ||
        lowerStory.includes("find the owner") ||
        lowerStory.includes("find his owner") ||
        lowerStory.includes("find her owner")
    ) {
        goals.push(
            "reunite the lost animal with its owner"
        );
    }

    if (
        lowerStory.includes("save") ||
        lowerStory.includes("rescue")
    ) {
        goals.push(
            "save or rescue the person or animal in danger"
        );
    }

    if (
        lowerStory.includes("find") ||
        lowerStory.includes("search")
    ) {
        goals.push(
            "find the important person, object or destination mentioned in the story"
        );
    }

    if (
        lowerStory.includes("escape") ||
        lowerStory.includes("run away")
    ) {
        goals.push(
            "escape from the dangerous situation"
        );
    }

    if (
        lowerStory.includes("win") ||
        lowerStory.includes("competition")
    ) {
        goals.push(
            "achieve victory in the central challenge"
        );
    }

    if (
        lowerStory.includes("build") ||
        lowerStory.includes("building")
    ) {
        goals.push(
            "complete the construction or building task"
        );
    }

    if (goals.length === 0) {
        goals.push(
            "resolve the central situation established by the user's story"
        );
    }


    /* =====================================================
       CONFLICT UNDERSTANDING
    ===================================================== */

    if (lowerStory.includes("lost")) {
        conflicts.push(
            "something important is lost and must be found"
        );
    }

    if (
        lowerStory.includes("danger") ||
        lowerStory.includes("dangerous")
    ) {
        conflicts.push(
            "the main character faces danger"
        );
    }

    if (
        lowerStory.includes("enemy") ||
        lowerStory.includes("villain")
    ) {
        conflicts.push(
            "an opposing character prevents the goal"
        );
    }

    if (
        lowerStory.includes("storm") ||
        lowerStory.includes("rain")
    ) {
        conflicts.push(
            "difficult weather conditions create an obstacle"
        );
    }

    if (
        lowerStory.includes("problem") ||
        lowerStory.includes("difficult") ||
        lowerStory.includes("obstacle")
    ) {
        conflicts.push(
            "a difficult obstacle prevents immediate success"
        );
    }

    if (conflicts.length === 0) {
        conflicts.push(
            "the central goal cannot be achieved immediately"
        );
    }


    /* =====================================================
       EVENT UNDERSTANDING
    ===================================================== */

    if (
        lowerStory.includes("finds") ||
        lowerStory.includes("find")
    ) {
        events.push(
            "the main character discovers something important"
        );
    }

    if (
        lowerStory.includes("tries") ||
        lowerStory.includes("attempts")
    ) {
        events.push(
            "the main character attempts to solve the situation"
        );
    }

    if (
        lowerStory.includes("meets") ||
        lowerStory.includes("meets a")
    ) {
        events.push(
            "the main character meets another important character"
        );
    }

    if (
        lowerStory.includes("discovers") ||
        lowerStory.includes("realizes")
    ) {
        events.push(
            "the main character discovers new information"
        );
    }

    if (
        lowerStory.includes("runs") ||
        lowerStory.includes("chases")
    ) {
        events.push(
            "a fast-moving action event changes the situation"
        );
    }

    if (
        lowerStory.includes("returns") ||
        lowerStory.includes("home")
    ) {
        events.push(
            "the story moves toward returning home"
        );
    }

    if (events.length === 0) {
        events.push(
            "the main character takes actions that logically advance the user's story"
        );
    }


    /* =====================================================
       MASTER CHARACTER LOCK
    ===================================================== */

    let characterDescription;

    if (mainCharacter === "12-year-old boy") {

        characterDescription =
            "12-year-old boy, warm natural skin tone, round youthful face, " +
            "dark brown eyes, short slightly messy black hair, slim child body, " +
            "sky-blue T-shirt, dark blue jeans and white sneakers";

    } else if (mainCharacter === "12-year-old girl") {

        characterDescription =
            "12-year-old girl, natural skin tone, youthful round face, " +
            "dark brown eyes, shoulder-length dark brown hair, slim child body, " +
            "yellow hoodie, blue jeans and white sneakers";

    } else if (mainCharacter === "young boy") {

        characterDescription =
            "young boy with youthful face, dark eyes, short dark hair, " +
            "slim child body, casual shirt, jeans and sneakers";

    } else if (mainCharacter === "young girl") {

        characterDescription =
            "young girl with youthful face, dark eyes, dark hair, " +
            "slim child body, casual clothing and sneakers";

    } else if (mainCharacter === "adult woman") {

        characterDescription =
            "adult woman with natural realistic facial features, dark eyes, " +
            "dark hair, consistent body proportions and modern casual clothing";

    } else if (mainCharacter === "adult man") {

        characterDescription =
            "adult man with natural realistic facial features, dark eyes, " +
            "short dark hair, consistent body proportions and modern casual clothing";

    } else {

        characterDescription =
            "realistic young adult main character with natural facial features, " +
            "consistent hairstyle, clothing and body proportions";
    }


    const masterCharacterLock =
        `MASTER CHARACTER LOCK: ${characterDescription}. ` +
        `This identity is permanent for the entire video. ` +
        `Never change the face, age, hairstyle, hair color, eye color, skin tone, ` +
        `body proportions, clothing, footwear or accessories. ` +
        `Never redesign, replace, age or de-age the character.`;


    /* =====================================================
       STORY ELEMENT LOCK
    ===================================================== */

    const storyElementDescriptions = [];

    characters.forEach((character) => {

        storyElementDescriptions.push(
            `Keep "${character}" visually consistent whenever present.`
        );

    });

    locations.forEach((location) => {

        storyElementDescriptions.push(
            `Maintain the same ${location}, geography and recognizable details.`
        );

    });

    objects.forEach((object) => {

        storyElementDescriptions.push(
            `Maintain the same ${object} appearance, size, color and physical details.`
        );

    });


    const storyElementLock =
        `STORY ELEMENT LOCK: ${storyElementDescriptions.join(" ")}`;


    /* =====================================================
       STORY SUMMARY
    ===================================================== */

    const storyUnderstanding = {

        originalStory: story,

        characters,

        locations,

        objects,

        goal: goals,

        conflict: conflicts,

        events,

        climax:
            "Create the decisive moment where the main character directly confronts the central problem and takes the key action needed to resolve it.",

        resolution:
            "Show the central goal being achieved or the story situation reaching a logical conclusion."
    };


    /* =====================================================
       SCENE BLUEPRINT
    ===================================================== */

    const sceneBlueprints = [

        {
            name: "OPENING",
            purpose:
                "Introduce the main character, location and exact starting situation from the user's story."
        },

        {
            name: "DISCOVERY",
            purpose:
                "Show the important person, animal, object, place or event discovered by the main character."
        },

        {
            name: "GOAL",
            purpose:
                "Clearly establish what the main character wants or needs to accomplish."
        },

        {
            name: "CONFLICT",
            purpose:
                "Introduce the story-specific obstacle preventing immediate success."
        },

        {
            name: "ATTEMPT",
            purpose:
                "Show the main character taking a concrete action toward the goal."
        },

        {
            name: "COMPLICATION",
            purpose:
                "Introduce a new development directly connected to the existing story."
        },

        {
            name: "PROGRESS",
            purpose:
                "Show a clue, discovery or action that moves the story closer to the goal."
        },

        {
            name: "CLIMAX",
            purpose:
                "Show the decisive action that changes the outcome."
        },

        {
            name: "RESOLUTION",
            purpose:
                "Show the main problem being resolved."
        },

        {
            name: "ENDING",
            purpose:
                "Show a natural final moment that follows directly from the resolution."
        }

    ];


    /* =====================================================
       SCENE CREATION
    ===================================================== */

    const scenes = [];

    for (let i = 1; i <= totalScenes; i++) {

        const blueprint =
            sceneBlueprints[
                Math.min(i - 1, sceneBlueprints.length - 1)
            ];


        let scenePurpose = blueprint.purpose;

        if (i > sceneBlueprints.length) {

            scenePurpose =
                "Continue the previous story event naturally while moving toward the final resolution.";

        }


        /* ================= SPECIAL STORY LOGIC ================= */

        let sceneAction;

        let sceneDialogue;

        let sceneVoiceover;


        if (
            lowerStory.includes("puppy") &&
            lowerStory.includes("lost") &&
            lowerStory.includes("owner")
        ) {

            const lostPetScenes = [

                {
                    action:
                        "The boy notices the lost puppy, stops and carefully approaches it.",

                    dialogue:
                        "Hey little one, are you lost?",

                    voiceover:
                        "In the busy city, he noticed a frightened puppy standing alone."
                },

                {
                    action:
                        "He kneels beside the puppy and carefully checks its collar.",

                    dialogue:
                        "Let's find your owner.",

                    voiceover:
                        "The collar gave him hope that the owner could be found."
                },

                {
                    action:
                        "He examines the collar, then looks around for another clue.",

                    dialogue:
                        "We need another clue.",

                    voiceover:
                        "But the information was not enough, so he kept searching."
                },

                {
                    action:
                        "He asks nearby pedestrians if they recognize the puppy.",

                    dialogue:
                        "Have you seen this puppy before?",

                    voiceover:
                        "He began asking everyone nearby for help."
                },

                {
                    action:
                        "The puppy suddenly looks toward a nearby side street and the boy follows.",

                    dialogue:
                        "You know this place, don't you?",

                    voiceover:
                        "Then the puppy suddenly seemed to recognize something."
                },

                {
                    action:
                        "The boy follows the puppy through the neighborhood while keeping it safe.",

                    dialogue:
                        "Keep going. I'll follow you.",

                    voiceover:
                        "Trusting the puppy's instincts, he followed its lead."
                },

                {
                    action:
                        "The puppy reacts excitedly when it sees its worried owner.",

                    dialogue:
                        "Are you looking for this puppy?",

                    voiceover:
                        "At last, he saw someone who might be the owner."
                },

                {
                    action:
                        "The puppy runs toward the owner as the boy steps aside.",

                    dialogue:
                        "I think we found them.",

                    voiceover:
                        "The lost puppy had finally found its way home."
                },

                {
                    action:
                        "The owner hugs the puppy and thanks the boy.",

                    dialogue:
                        "I'm glad I could help.",

                    voiceover:
                        "A small act of kindness created a happy reunion."
                },

                {
                    action:
                        "The boy walks away smiling while the owner and puppy remain together.",

                    dialogue:
                        "Sometimes kindness changes everything.",

                    voiceover:
                        "Sometimes helping someone find their way home is all it takes."
                }

            ];

            const petScene =
                lostPetScenes[
                    Math.min(i - 1, lostPetScenes.length - 1)
                ];

            sceneAction = petScene.action;
            sceneDialogue = petScene.dialogue;
            sceneVoiceover = petScene.voiceover;

        } else {

            /* ================= STORY-AWARE GENERIC MODE ================= */

            sceneAction =
                `The ${mainCharacter} performs a concrete action based directly on ` +
                `${scenePurpose.toLowerCase()} ` +
                `Use the story's actual characters, locations, objects and events.`;

            sceneDialogue =
                i === 1
                    ? "Something is happening."
                    : i === 2
                        ? "I need to understand this."
                        : i === 3
                            ? "I know what I have to do."
                            : i === 4
                                ? "This is not going to be easy."
                                : i === 5
                                    ? "I'll find a way."
                                    : i === 6
                                        ? "Something just changed."
                                        : i === 7
                                            ? "We're getting closer."
                                            : i === 8
                                                ? "This is the moment."
                                                : i === 9
                                                    ? "We made it."
                                                    : "I'll never forget this.";

            sceneVoiceover =
                i === 1
                    ? "This was the moment when the story began."
                    : i === 2
                        ? "The discovery changed everything."
                        : i === 3
                            ? "Now there was a clear goal."
                            : i === 4
                                ? "But an unexpected obstacle stood in the way."
                                : i === 5
                                    ? "The character decided to take action."
                                    : i === 6
                                        ? "Then something changed."
                                        : i === 7
                                            ? "A new clue moved the story forward."
                                            : i === 8
                                                ? "Everything came down to one decisive moment."
                                                : i === 9
                                                    ? "The central problem was finally resolved."
                                                    : "The experience became a lasting memory.";
        }


        /* =====================================================
           SCENE OBJECT
        ===================================================== */

        scenes.push({

            scene: i,

            sceneType: blueprint.name,

            start: (i - 1) * 10,

            end: i * 10,

            duration: 10,

            visual_prompt:
                `${masterCharacterLock} ` +
                `${storyElementLock} ` +
                `USER STORY: "${story}". ` +
                `SCENE ${i} — ${blueprint.name}. ` +
                `${scenePurpose} ` +
                `Characters available: ${characters.join(", ")}. ` +
                `Locations available: ${locations.join(", ")}. ` +
                `Important objects: ${objects.length ? objects.join(", ") : "none specifically detected"}. ` +
                `Goal: ${goals.join("; ")}. ` +
                `Conflict: ${conflicts.join("; ")}. ` +
                `Events: ${events.join("; ")}. ` +
                `Do not invent unrelated characters, objects or locations. ` +
                `Do not replace the central story with a different story. ` +
                `Create a realistic cinematic scene with natural movement, believable physics, ` +
                `detailed environments, realistic facial expressions and movie-quality production design. ` +
                `Aspect ratio: ${ratio}.`,

            camera:
                i === 1
                    ? "Wide cinematic establishing shot, slowly moving toward the main story action."
                    : i % 4 === 0
                        ? "Smooth cinematic tracking shot following the main character and story action."
                        : i % 3 === 0
                            ? "Medium close-up with a slow cinematic push toward the character's emotional reaction."
                            : "Cinematic over-the-shoulder shot transitioning into smooth natural camera movement.",

            lighting:
                "Maintain consistent lighting, weather, shadows, color mood and time of day across connected scenes.",

            action:
                `${sceneAction} Complete the entire action naturally within exactly 10 seconds.`,

            dialogue:
                sceneDialogue,

            voiceover:
                sceneVoiceover,

            continuity:
                i === 1
                    ? "Establish permanent character identity, story elements, location, time of day and starting position."
                    : `Continue directly from Scene ${i - 1}. Maintain the MASTER CHARACTER LOCK exactly. ` +
                      `Keep the same face, age, hairstyle, skin tone, eyes, body proportions, clothing, footwear and accessories. ` +
                      `Keep all supporting characters, animals, props and locations consistent. ` +
                      `Maintain the same weather, lighting, time of day, emotional state and camera geography. ` +
                      `Start from the physical position and situation created at the end of the previous scene.`

        });
    }


    /* =====================================================
       RESPONSE
    ===================================================== */

    res.json({

        status: "success",

        message:
            "SANAPTAI V7 Story Understanding Engine project created successfully",

        project: {

            prompt: story,

            duration: totalSeconds,

            sceneDuration: 10,

            totalScenes,

            aspectRatio: ratio,

            storyUnderstanding,

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

            scenes

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
You are SANAPTAI V7, an advanced AI video story understanding and scene planner.

Understand the user's actual story before creating scenes.

Extract:
- characters
- locations
- important objects
- goal
- conflict
- events
- climax
- resolution

Rules:

1. Every scene is exactly 10 seconds.
2. Total scenes must equal duration divided by 10.
3. Maintain permanent character identity.
4. Maintain animal, object and vehicle consistency.
5. Maintain location continuity.
6. Maintain weather and time-of-day continuity.
7. Every scene must logically continue from the previous scene.
8. Never replace the user's story with a generic story.
9. Dialogue must fit naturally within 10 seconds.
10. Voiceover must fit naturally within 10 seconds.
11. Return only valid JSON.

Required structure:

{
  "duration": number,
  "sceneDuration": 10,
  "totalScenes": number,
  "aspectRatio": "9:16 or 16:9 or 1:1",
  "storyUnderstanding": {
    "originalStory": "",
    "characters": [],
    "locations": [],
    "objects": [],
    "goal": [],
    "conflict": [],
    "events": [],
    "climax": "",
    "resolution": ""
  },
  "characterLocks": [],
  "storyElements": [],
  "scenes": []
}

Duration: ${totalSeconds}
Required scenes: ${totalScenes}
Aspect ratio: ${aspectRatio || "16:9"}

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

            message:
                "AI story understanding and scene plan created successfully",

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

            message:
                error?.message || "Unknown Gemini error"

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
        `SANAPTAI V7 server running on port ${PORT}`
    );

});
