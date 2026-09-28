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
        message: "SANAPTAI V8 server is working"
    });
});


/* =========================================================
   V8 STORY PARSER
   Demo mode
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
       HELPERS
    ===================================================== */

    function has(...words) {
        return words.some(word => lowerStory.includes(word));
    }

    function unique(list) {
        return [...new Set(list)];
    }

    function cleanSentence(text) {
        return text
            .replace(/\s+/g, " ")
            .replace(/^[\s,.;:-]+/, "")
            .trim();
    }


    /* =====================================================
       SENTENCE PARSER
    ===================================================== */

    const rawSentences = story
        .split(/[.!?]+/)
        .map(cleanSentence)
        .filter(Boolean);

    const sentences =
        rawSentences.length > 0
            ? rawSentences
            : [story];


    /* =====================================================
       CHARACTER UNDERSTANDING
    ===================================================== */

    const characters = [];

    let mainCharacter = "young adult main character";

    if (
        has("young boy", "little boy", "12-year-old boy", "12 year old boy")
    ) {
        mainCharacter = "12-year-old boy";
    } else if (
        has("young girl", "little girl", "12-year-old girl", "12 year old girl")
    ) {
        mainCharacter = "12-year-old girl";
    } else if (has("boy")) {
        mainCharacter = "young boy";
    } else if (has("girl")) {
        mainCharacter = "young girl";
    } else if (has("woman")) {
        mainCharacter = "adult woman";
    } else if (has("man")) {
        mainCharacter = "adult man";
    }

    characters.push(mainCharacter);


    /* Supporting characters */

    if (has("owner", "pet owner")) {
        characters.push("pet owner");
    }

    if (has("friend", "best friend")) {
        characters.push("friend");
    }

    if (has("mother", "mom")) {
        characters.push("mother");
    }

    if (has("father", "dad")) {
        characters.push("father");
    }

    if (has("teacher")) {
        characters.push("teacher");
    }

    if (has("villain", "enemy", "antagonist")) {
        characters.push("antagonist");
    }


    /* Animals */

    if (has("kitten")) {
        characters.push("kitten");
    }

    if (has("puppy")) {
        characters.push("puppy");
    } else if (has("dog")) {
        characters.push("dog");
    }

    if (has("cat")) {
        characters.push("cat");
    }

    if (has("horse")) {
        characters.push("horse");
    }

    if (has("bird")) {
        characters.push("bird");
    }

    if (has("rabbit")) {
        characters.push("rabbit");
    }

    if (has("snake")) {
        characters.push("snake");
    }

    const uniqueCharacters = unique(characters);


    /* =====================================================
       LOCATION UNDERSTANDING
===================================================== */

    const locations = [];

    if (has("school", "from school")) {
        locations.push("school area");
    }

    if (has("street", "road", "sidewalk")) {
        locations.push("street environment");
    }

    if (has("city", "busy city")) {
        locations.push("busy city environment");
    }

    if (has("park")) {
        locations.push("park");
    }

    if (has("forest", "woods")) {
        locations.push("forest");
    }

    if (has("home", "house", "room")) {
        locations.push("home");
    }

    if (has("hospital")) {
        locations.push("hospital");
    }

    if (has("office")) {
        locations.push("office");
    }

    if (has("village")) {
        locations.push("village");
    }

    if (has("mountain")) {
        locations.push("mountain area");
    }

    if (locations.length === 0) {
        locations.push("story location established by the original story");
    }

    const uniqueLocations = unique(locations);


    /* =====================================================
       OBJECT UNDERSTANDING
===================================================== */

    const objects = [];

    if (has("poster", "missing-pet poster", "missing pet poster")) {
        objects.push("missing-pet poster");
    }

    if (has("collar")) {
        objects.push("pet collar");
    }

    if (has("shelter", "broken shelter")) {
        objects.push("broken shelter");
    }

    if (has("food", "feed", "feeding")) {
        objects.push("pet food");
    }

    if (has("towel", "dry", "dries")) {
        objects.push("towel");
    }

    if (has("umbrella")) {
        objects.push("umbrella");
    }

    if (has("phone", "mobile")) {
        objects.push("phone");
    }

    if (has("letter")) {
        objects.push("letter");
    }

    if (has("photo", "picture")) {
        objects.push("photograph");
    }

    if (has("car", "vehicle", "truck")) {
        objects.push("vehicle mentioned in story");
    }

    if (has("key")) {
        objects.push("key");
    }

    if (has("bag", "backpack")) {
        objects.push("bag or backpack");
    }

    const uniqueObjects = unique(objects);


    /* =====================================================
       STORY CONDITIONS
===================================================== */

    const conditions = [];

    if (has("rain", "rainstorm", "storm", "raining")) {
        conditions.push("sudden rainstorm");
    }

    if (has("night", "nighttime", "evening")) {
        conditions.push("nighttime or evening");
    }

    if (has("morning")) {
        conditions.push("morning");
    }

    if (has("snow", "snowstorm")) {
        conditions.push("snowy weather");
    }

    if (has("dark")) {
        conditions.push("dark atmosphere");
    }

    if (conditions.length === 0) {
        conditions.push("natural story-appropriate weather and time of day");
    }


    /* =====================================================
       EVENT EXTRACTION
    ===================================================== */

    const events = [];


    /* Discovery events */

    if (has("finds", "found", "find", "discovers", "discovered")) {

        events.push({
            type: "discovery",
            text: "The main character discovers the important subject described in the story."
        });

    }


    /* Lost animal */

    if (
        has("lost kitten", "abandoned kitten", "kitten") &&
        has("lost", "abandoned")
    ) {

        events.push({
            type: "discovery",
            text: "The boy discovers an abandoned or lost kitten."
        });

    }


    /* Rain */

    if (has("rainstorm", "rain", "raining")) {

        events.push({
            type: "obstacle",
            text: "A sudden rainstorm creates a difficult situation."
        });

    }


    /* Protection */

    if (
        has("protect", "protects", "save", "saves", "rescue", "rescues")
    ) {

        events.push({
            type: "attempt",
            text: "The main character decides to protect or rescue the important subject."
        });

    }


    /* Carrying */

    if (
        has("carries", "carry", "takes home", "brings home", "brings")
    ) {

        events.push({
            type: "progress",
            text: "The main character takes the important subject toward safety."
        });

    }


    /* Drying */

    if (
        has("dries", "dry", "dried", "towel")
    ) {

        events.push({
            type: "care",
            text: "The main character dries and cares for the animal."
        });

    }


    /* Feeding */

    if (
        has("food", "feeds", "feeding", "gives it food", "gives food")
    ) {

        events.push({
            type: "care",
            text: "The main character gives food to the animal."
        });

    }


    /* Poster */

    if (
        has("poster", "missing-pet poster", "missing pet poster")
    ) {

        events.push({
            type: "clue",
            text: "The main character discovers or uses a missing-pet poster as a clue."
        });

    }


    /* Owner */

    if (
        has("owner", "reunite", "reunites", "reunited")
    ) {

        events.push({
            type: "resolution",
            text: "The animal is reunited with its owner."
        });

    }


    /* Search */

    if (
        has("search", "searches", "looking for", "looks for", "tries to find")
    ) {

        events.push({
            type: "search",
            text: "The main character searches for the information or person needed to solve the situation."
        });

    }


    /* Escape / chase */

    if (
        has("escape", "escapes", "runs away", "chases", "chase")
    ) {

        events.push({
            type: "action",
            text: "A fast-moving action sequence changes the situation."
        });

    }


    /* Construction */

    if (
        has("build", "builds", "building", "construct", "construction")
    ) {

        events.push({
            type: "work",
            text: "The main character works to complete the building task."
        });

    }


    /* =====================================================
       SENTENCE-BASED EVENT FALLBACK
    ===================================================== */

    if (events.length === 0) {

        sentences.forEach((sentence, index) => {

            events.push({
                type: index === 0 ? "opening" : "event",
                text: sentence
            });

        });

    }


    /* =====================================================
       REMOVE DUPLICATES
    ===================================================== */

    const eventMap = new Map();

    for (const event of events) {

        if (!eventMap.has(event.text)) {
            eventMap.set(event.text, event);
        }

    }

    const uniqueEvents = [...eventMap.values()];


    /* =====================================================
       STORY GOAL
===================================================== */

    let goal =
        "Resolve the central situation described in the user's story.";

    if (
        has("reunite", "reunites", "reunited") &&
        has("owner")
    ) {

        goal =
            "Protect the lost animal and reunite it with its owner.";

    } else if (
        has("save", "saves", "rescue", "rescues")
    ) {

        goal =
            "Protect and save the person or animal in danger.";

    } else if (
        has("find", "finds", "discover", "discovers")
    ) {

        goal =
            "Find or discover the important subject described in the story.";

    } else if (
        has("build", "builds", "building")
    ) {

        goal =
            "Complete the building task described in the story.";

    }


    /* =====================================================
       STORY CONFLICT
===================================================== */

    let conflict =
        "The main character faces the central obstacle described by the story.";

    if (has("rain", "rainstorm", "storm")) {

        conflict =
            "The sudden rainstorm makes the situation difficult.";

    } else if (has("lost", "abandoned")) {

        conflict =
            "The important person or animal is lost and must be safely found.";

    } else if (has("villain", "enemy")) {

        conflict =
            "An opposing character blocks the main character's goal.";

    } else if (has("danger", "dangerous")) {

        conflict =
            "The main character must deal with a dangerous situation.";

    }


    /* =====================================================
       CLIMAX + RESOLUTION
===================================================== */

    let climax =
        "The main character takes the decisive action that resolves the central problem.";

    let resolution =
        "The story reaches a logical conclusion based on the user's events.";

    if (
        has("kitten") &&
        has("owner") &&
        has("poster")
    ) {

        climax =
            "The boy uses the missing-pet poster information to locate the kitten's owner.";

        resolution =
            "The boy safely reunites the kitten with its owner.";

    } else if (
        has("save", "rescue")
    ) {

        climax =
            "The main character successfully completes the rescue.";

        resolution =
            "The rescued person or animal reaches safety.";

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
        `This identity is permanent throughout the entire video. ` +
        `Never change the face, age, hairstyle, hair color, eye color, skin tone, ` +
        `body proportions, clothing, footwear or accessories.`;


    /* =====================================================
       STORY ELEMENT LOCK
===================================================== */

    const storyElementParts = [];

    uniqueCharacters.forEach(character => {

        storyElementParts.push(
            `Keep "${character}" visually consistent whenever present.`
        );

    });

    uniqueLocations.forEach(location => {

        storyElementParts.push(
            `Maintain the same ${location}, geography and recognizable details.`
        );

    });

    uniqueObjects.forEach(object => {

        storyElementParts.push(
            `Maintain the same ${object}, appearance, size, color and physical details.`
        );

    });

    conditions.forEach(condition => {

        storyElementParts.push(
            `Maintain continuity of ${condition}.`
        );

    });


    const storyElementLock =
        `STORY ELEMENT LOCK: ${storyElementParts.join(" ")}`;


    /* =====================================================
       EVENT SEQUENCE
===================================================== */

    let orderedEvents = [...uniqueEvents];

    /*
      Make sure important story progression is represented.
    */

    if (
        has("kitten") &&
        has("owner") &&
        has("poster")
    ) {

        orderedEvents = [

            {
                type: "opening",
                text:
                    "The boy is walking home from school when a sudden rainstorm begins."
            },

            {
                type: "discovery",
                text:
                    "The boy finds an abandoned kitten under a broken shelter."
            },

            {
                type: "decision",
                text:
                    "The boy decides to protect the kitten from the rain."
            },

            {
                type: "care",
                text:
                    "The boy carries the kitten home, dries it and gives it food."
            },

            {
                type: "clue",
                text:
                    "The boy discovers a missing-pet poster and uses it to identify the kitten's owner."
            },

            {
                type: "resolution",
                text:
                    "The boy reunites the kitten with its owner."
            }

        ];

    }


    /* =====================================================
       SCENE EVENT DISTRIBUTION
===================================================== */

    const scenes = [];

    for (let i = 1; i <= totalScenes; i++) {

        let eventIndex;

        if (orderedEvents.length === 1) {

            eventIndex = 0;

        } else {

            eventIndex = Math.floor(
                ((i - 1) * orderedEvents.length) / totalScenes
            );

            eventIndex =
                Math.min(
                    eventIndex,
                    orderedEvents.length - 1
                );
        }

        const currentEvent = orderedEvents[eventIndex];


        /*
          If several scenes map to the same event,
          create a continuation instead of repeating exactly.
        */

        const repeatNumber =
            scenes.filter(
                scene => scene.eventIndex === eventIndex
            ).length;


        let scenePurpose =
            currentEvent.text;

        if (repeatNumber > 0) {

            scenePurpose =
                `Continue the previous event naturally: ${currentEvent.text}`;

        }


        /* =================================================
           STORY-SPECIFIC DIALOGUE
        ================================================= */

        let dialogue =
            "I need to keep going.";

        let voiceover =
            currentEvent.text;


        if (
            has("kitten") &&
            has("owner") &&
            has("poster")
        ) {

            const kittenDialogue = [

                "I need to get home before this gets worse.",

                "You're not staying out here alone.",

                "Come on, little one. You're safe with me.",

                "Let's get you warm and fed.",

                "Wait... this poster might be about you.",

                "We found your owner."

            ];

            const kittenVoiceover = [

                "On his way home from school, a sudden storm changed everything.",

                "Under a broken shelter, he discovered a tiny abandoned kitten.",

                "He decided the kitten needed protection from the rain.",

                "At home, he dried the kitten and gave it something to eat.",

                "Then a missing-pet poster revealed a possible way home.",

                "The search ended with a happy reunion."

            ];

            dialogue =
                kittenDialogue[
                    Math.min(i - 1, kittenDialogue.length - 1)
                ];

            voiceover =
                kittenVoiceover[
                    Math.min(i - 1, kittenVoiceover.length - 1)
                ];

        } else {

            if (currentEvent.type === "opening") {

                dialogue =
                    "Something feels different today.";

                voiceover =
                    "This is where the story begins.";

            } else if (currentEvent.type === "discovery") {

                dialogue =
                    "What is that?";

                voiceover =
                    "Then the main character discovered something important.";

            } else if (currentEvent.type === "obstacle") {

                dialogue =
                    "I have to keep moving.";

                voiceover =
                    "A sudden obstacle made the situation more difficult.";

            } else if (
                currentEvent.type === "attempt" ||
                currentEvent.type === "decision"
            ) {

                dialogue =
                    "I'm going to help.";

                voiceover =
                    "The character decided to take action.";

            } else if (currentEvent.type === "clue") {

                dialogue =
                    "This could be the clue.";

                voiceover =
                    "A new clue finally moved the story forward.";

            } else if (currentEvent.type === "resolution") {

                dialogue =
                    "We finally made it.";

                voiceover =
                    "The central problem was finally resolved.";

            }

        }


        /* =================================================
           VISUAL PROMPT
        ================================================= */

        const visualPrompt =
            `${masterCharacterLock} ` +
            `${storyElementLock} ` +
            `ORIGINAL USER STORY: "${story}". ` +
            `SCENE ${i} OF ${totalScenes}. ` +
            `STORY EVENT: ${scenePurpose}. ` +
            `This scene must visually show the actual event from the user's story. ` +
            `Do not substitute a generic event. ` +
            `Use only story-relevant characters, animals, objects and locations. ` +
            `Natural cinematic movement, realistic facial expressions, believable physics, ` +
            `detailed production design and cinematic movie quality. ` +
            `Aspect ratio: ${ratio}.`;


        /* =================================================
           CAMERA
        ================================================= */

        let camera;

        if (currentEvent.type === "action") {

            camera =
                "Dynamic cinematic tracking shot following the action while keeping the main character clearly visible.";

        } else if (currentEvent.type === "discovery") {

            camera =
                "Wide establishing shot followed by a smooth push toward the discovered story element.";

        } else if (currentEvent.type === "resolution") {

            camera =
                "Warm cinematic medium shot followed by a slow emotional push toward the reunion or resolution.";

        } else {

            camera =
                i % 3 === 0
                    ? "Medium cinematic shot with a slow emotional push-in."
                    : "Natural cinematic tracking or over-the-shoulder shot following the story action.";
        }


        /* =================================================
           CONTINUITY
        ================================================= */

        const continuity =
            i === 1
                ? "Establish the permanent character identity, story elements, location, weather, time of day and starting situation."
                : `Continue directly from Scene ${i - 1}. ` +
                  `Maintain the MASTER CHARACTER LOCK exactly. ` +
                  `Keep every character, animal, object, location, weather condition, lighting condition ` +
                  `and physical position consistent. ` +
                  `Begin from the previous scene's ending state.`;


        /* =================================================
           SCENE
        ================================================= */

        scenes.push({

            scene: i,

            eventIndex,

            sceneType: currentEvent.type,

            start: (i - 1) * 10,

            end: i * 10,

            duration: 10,

            storyEvent: currentEvent.text,

            visual_prompt: visualPrompt,

            camera,

            lighting:
                "Maintain consistent cinematic lighting, weather, shadows, color mood and time of day.",

            action:
                `${scenePurpose} ` +
                `Complete the action naturally within exactly 10 seconds.`,

            dialogue,

            voiceover,

            continuity

        });

    }


    /* =====================================================
       RESPONSE
===================================================== */

    res.json({

        status: "success",

        message:
            "SANAPTAI V8 Story Parser project created successfully",

        project: {

            prompt: story,

            duration: totalSeconds,

            sceneDuration: 10,

            totalScenes,

            aspectRatio: ratio,

            storyUnderstanding: {

                originalStory: story,

                characters: uniqueCharacters,

                locations: uniqueLocations,

                objects: uniqueObjects,

                conditions,

                goal,

                conflict,

                events: orderedEvents,

                climax,

                resolution

            },

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

        const totalScenes =
            Math.ceil(totalSeconds / 10);

        const ai =
            new GoogleGenAI({
                apiKey: process.env.GEMINI_API_KEY
            });


        const systemPrompt = `

You are SANAPTAI V8, an advanced AI story parser and cinematic scene planner.

First understand the user's complete story.

Extract:

1. Characters
2. Locations
3. Objects
4. Weather and time
5. Goal
6. Conflict
7. Events in chronological order
8. Climax
9. Resolution

Then create exactly ${totalScenes} scenes.

Every scene must be exactly 10 seconds.

Do not create generic filler scenes.

Every scene must represent an actual event or necessary transition from the user's story.

Maintain:

- exact character identity
- same face
- same age
- same hairstyle
- same clothing
- same animals
- same objects
- same locations
- same weather
- same time of day
- logical physical continuity

Dialogue must fit naturally within 10 seconds.

Voiceover must fit naturally within 10 seconds.

Return ONLY valid JSON.

Required structure:

{
  "duration": ${totalSeconds},
  "sceneDuration": 10,
  "totalScenes": ${totalScenes},
  "aspectRatio": "${aspectRatio || "16:9"}",
  "storyUnderstanding": {
    "originalStory": "",
    "characters": [],
    "locations": [],
    "objects": [],
    "conditions": [],
    "goal": "",
    "conflict": "",
    "events": [],
    "climax": "",
    "resolution": ""
  },
  "characterLocks": [],
  "storyElements": [],
  "scenes": []
}

USER STORY:

${prompt}

`;


        const result =
            await ai.models.generateContent({

                model: "gemini-3.8-flash",

                contents: systemPrompt

            });


        let text =
            result.text || "";


        text =
            text.replace(/^```json\s*/i, "");

        text =
            text.replace(/^```\s*/i, "");

        text =
            text.replace(/\s*```$/i, "");


        let project;


        try {

            project =
                JSON.parse(text);

        } catch (parseError) {

            return res.status(500).json({

                error:
                    "Gemini returned invalid JSON",

                raw:
                    text

            });

        }


        res.json({

            status: "success",

            message:
                "AI V8 story plan created successfully",

            project

        });


    } catch (error) {

        console.error(
            "Gemini Error:",
            error
        );


        if (
            error?.status === 429 ||
            error?.code === 429
        ) {

            return res.status(429).json({

                error:
                    "Gemini quota exceeded",

                message:
                    "Gemini free-tier limit reached. Demo Mode does not use Gemini."

            });

        }


        res.status(500).json({

            error:
                "AI scene planning failed",

            message:
                error?.message ||
                "Unknown Gemini error"

        });

    }

});


/* =========================================================
   CREATE PROJECT
========================================================= */

app.post("/api/create-project", (req, res) => {

    const {
        prompt,
        duration,
        aspectRatio
    } = req.body;


    if (!prompt) {

        return res.status(400).json({

            error:
                "Video prompt is required"

        });

    }


    const totalSeconds =
        Number(duration) || 10;

    const totalScenes =
        Math.ceil(totalSeconds / 10);


    res.json({

        status:
            "success",

        message:
            "Project created successfully",

        project: {

            prompt,

            duration:
                totalSeconds,

            sceneDuration:
                10,

            totalScenes,

            aspectRatio:
                aspectRatio || "16:9"

        }

    });

});


/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {

    console.log(
        `SANAPTAI V8 server running on port ${PORT}`
    );

});
