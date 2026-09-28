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
                    `The ${characterType} kneels beside the same puppy and gently checks its collar while the
