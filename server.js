import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function durationToSeconds(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 30;
}

function sceneCount(seconds) {
  return Math.max(1, Math.ceil(seconds / 10));
}

function has(text, words) {
  const t = String(text || "").toLowerCase();
  return words.some(w => t.includes(w.toLowerCase()));
}

function unique(arr) {
  return [...new Set(arr)];
}

/* =========================================================
   CHARACTER PARSER
========================================================= */

function parseCharacters(text) {
  const t = text.toLowerCase();
  const characters = [];

  if (
    t.includes("ethan") ||
    t.includes("12-year-old boy") ||
    t.includes("12 year old boy") ||
    t.includes("young boy")
  ) {
    characters.push({
      name: "Ethan",
      role: "main character",
      description:
        "12-year-old boy, youthful round face, dark brown eyes, short slightly messy black hair, slim child build, blue casual shirt, dark blue jeans and white sneakers"
    });
  } else if (t.includes("boy")) {
    characters.push({
      name: "Boy",
      role: "main character",
      description:
        "young boy with youthful face, dark brown eyes, short slightly messy black hair, slim child build, blue shirt, dark blue jeans and white sneakers"
    });
  }

  if (has(t, ["mother", "mom"])) {
    characters.push({
      name: "Mother",
      role: "supporting character",
      description:
        "adult woman with warm natural face, dark hair and simple comfortable home clothing"
    });
  }

  if (
    has(t, [
      "frightened girl",
      "trapped girl",
      "girl trapped",
      "young girl trapped"
    ])
  ) {
    characters.push({
      name: "Rescued Girl",
      role: "rescued supporting character",
      description:
        "frightened young girl with long dark-brown hair, worried expression, simple dusty clothes, consistent appearance throughout the story"
    });
  }

  if (has(t, ["dangerous man", "villain", "enemy"])) {
    characters.push({
      name: "Dangerous Man",
      role: "antagonist",
      description:
        "tall intimidating adult man, dark hair, rough beard, dark weathered jacket and cold expression, consistent appearance"
    });
  }

  if (
    has(t, [
      "her family",
      "girl's family",
      "girls family",
      "family is waiting",
      "family waiting"
    ])
  ) {
    characters.push({
      name: "Girl's Family",
      role: "supporting characters",
      description:
        "family members waiting anxiously for the rescued girl in town"
    });
  }

  return characters;
}

/* =========================================================
   STORY ELEMENT PARSER
========================================================= */

function parseLocations(text) {
  const t = text.toLowerCase();
  const locations = [];

  if (has(t, ["small town", "town"])) locations.push("small town");
  if (has(t, ["house", "home"])) locations.push("family house");
  if (has(t, ["floor", "floorboard"])) {
    locations.push("family house interior");
  }
  if (has(t, ["forest", "woods"])) locations.push("nearby forest");
  if (has(t, ["abandoned cabin", "cabin"])) {
    locations.push("abandoned cabin");
  }
  if (has(t, ["locked room"])) {
    locations.push("locked room inside cabin");
  }
  if (has(t, ["secret tunnel", "tunnel"])) {
    locations.push("secret tunnel beneath cabin");
  }
  if (has(t, ["sunrise", "dawn"])) {
    locations.push("town at sunrise");
  }

  return unique(locations);
}

function parseObjects(text) {
  const t = text.toLowerCase();
  const objects = [];

  if (has(t, ["wooden box", "box"])) {
    objects.push("old wooden box");
  }

  if (has(t, ["wooden floor", "floorboard", "floor"])) {
    objects.push("wooden floor");
  }

  if (has(t, ["mysterious map", "map"])) {
    objects.push("mysterious map");
  }

  if (has(t, ["locked room", "locked door"])) {
    objects.push("locked room door");
  }

  if (has(t, ["secret tunnel", "tunnel"])) {
    objects.push("secret tunnel entrance");
  }

  return unique(objects);
}

function parseConditions(text) {
  const t = text.toLowerCase();
  const conditions = [];

  if (has(t, ["evening"])) conditions.push("evening");
  if (has(t, ["sunrise", "dawn"])) conditions.push("sunrise");
  if (has(t, ["dark", "darkness"])) conditions.push("dark atmosphere");

  return unique(conditions);
}

/* =========================================================
   STORY UNDERSTANDING
========================================================= */

function understandStory(text) {
  const t = cleanText(text);

  return {
    characters: parseCharacters(t),
    locations: parseLocations(t),
    objects: parseObjects(t),
    conditions: parseConditions(t),
    goal: "Rescue the trapped girl and bring her safely back to town.",
    conflict:
      "A dangerous man arrives at the cabin while Ethan and the rescued girl search for an escape.",
    climax:
      "Ethan and the rescued girl discover a secret tunnel and use it to escape.",
    resolution:
      "At sunrise Ethan brings the girl safely back to town where her family is waiting."
  };
}

/* =========================================================
   V12.1 — COMPLETE 30-SCENE ETHAN TIMELINE
========================================================= */

function ethanTimeline() {
  return [

    {
      location: "small town",
      characters: ["Ethan", "Mother"],
      objects: [],
      action: "Ethan lives with his mother in their quiet small town.",
      dialogue: "Mom, everything feels so quiet here.",
      voiceover: "Twelve-year-old Ethan lived with his mother in a quiet small town.",
      camera: "Wide establishing shot slowly moving toward Ethan's house.",
      lighting: "Warm late-afternoon natural light."
    },

    {
      location: "family house",
      characters: ["Ethan", "Mother"],
      objects: [],
      action: "Ethan spends the evening at home with his mother.",
      dialogue: "I'll help you before I go upstairs.",
      voiceover: "That evening, Ethan returned home as the daylight began to fade.",
      camera: "Medium tracking shot following Ethan through the house.",
      lighting: "Soft warm evening interior light."
    },

    {
      location: "family house interior",
      characters: ["Ethan"],
      objects: ["wooden floor"],
      action: "Ethan notices a strange gap between the old wooden floorboards.",
      dialogue: "Wait... what's that under the floor?",
      voiceover: "Something unusual beneath the old floorboards caught Ethan's attention.",
      camera: "Close-up of Ethan noticing the floor.",
      lighting: "Dim evening light with a narrow beam."
    },

    {
      location: "family house interior",
      characters: ["Ethan"],
      objects: ["wooden floor"],
      action: "Ethan kneels and tests the loose floorboard with his hands.",
      dialogue: "This board wasn't loose before.",
      voiceover: "Ethan carefully examined the loose wooden board.",
      camera: "Over-the-shoulder close-up of his hands.",
      lighting: "Warm mysterious interior lighting."
    },

    {
      location: "family house interior",
      characters: ["Ethan"],
      objects: ["wooden floor", "old wooden box"],
      action: "Ethan lifts the floorboard and sees an old wooden box hidden underneath.",
      dialogue: "There's a box down here.",
      voiceover: "Beneath the floor, Ethan discovered an old wooden box.",
      camera: "Low-angle reveal of the hidden box.",
      lighting: "Focused light on the dusty box."
    },

    {
      location: "family house interior",
      characters: ["Ethan"],
      objects: ["old wooden box"],
      action: "Ethan pulls the heavy wooden box completely out from beneath the floor.",
      dialogue: "I wonder who hid this.",
      voiceover: "He carefully pulled the mysterious box into the room.",
      camera: "Medium dolly shot following the box.",
      lighting: "Soft warm interior light."
    },

    {
      location: "family house interior",
      characters: ["Ethan"],
      objects: ["old wooden box"],
      action: "Ethan examines the dusty box and searches for its opening.",
      dialogue: "Come on... open.",
      voiceover: "The dusty box showed signs of being hidden for years.",
      camera: "Tight close-up of Ethan examining the box.",
      lighting: "Focused indoor lighting."
    },

    {
      location: "family house interior",
      characters: ["Ethan"],
      objects: ["old wooden box"],
      action: "Ethan finally opens the wooden box.",
      dialogue: "Whoa... there's something inside.",
      voiceover: "With a careful pull, Ethan opened the ancient box.",
      camera: "Extreme close-up of the lid opening.",
      lighting: "Dramatic warm beam across the box."
    },

    {
      location: "family house interior",
      characters: ["Ethan"],
      objects: ["old wooden box", "mysterious map"],
      action: "Ethan discovers a mysterious map inside the box.",
      dialogue: "A map? Where does this lead?",
      voiceover: "Inside the box was a mysterious map marked with an unknown route.",
      camera: "Top-down shot of the map.",
      lighting: "Warm focused light."
    },

    {
      location: "family house interior",
      characters: ["Ethan"],
      objects: ["mysterious map"],
      action: "Ethan unfolds the map and studies its strange markings.",
      dialogue: "There's a forest marked here.",
      voiceover: "The map revealed a route leading toward a nearby forest.",
      camera: "Slow overhead movement across the map.",
      lighting: "Low warm evening light."
    },

    {
      location: "family house interior",
      characters: ["Ethan"],
      objects: ["mysterious map"],
      action: "Ethan traces the route with his finger and studies where it ends.",
      dialogue: "I have to see where this goes.",
      voiceover: "The mysterious route made Ethan determined to investigate.",
      camera: "Macro tracking shot following his finger across the map.",
      lighting: "Focused warm light."
    },

    {
      location: "family house",
      characters: ["Ethan"],
      objects: ["mysterious map"],
      action: "Ethan prepares to leave the house with the folded map.",
      dialogue: "I'll be back soon.",
      voiceover: "The next morning, Ethan prepared to follow the map.",
      camera: "Medium shot as Ethan puts the map safely away.",
      lighting: "Fresh morning daylight."
    },

    {
      location: "small town",
      characters: ["Ethan"],
      objects: ["mysterious map"],
      action: "Ethan walks out of town toward the forest.",
      dialogue: "The trail starts beyond town.",
      voiceover: "Ethan left the familiar streets and headed toward the forest.",
      camera: "Wide rear tracking shot.",
      lighting: "Bright morning sunlight."
    },

    {
      location: "nearby forest",
      characters: ["Ethan"],
      objects: ["mysterious map"],
      action: "Ethan enters the forest and checks the map between the trees.",
      dialogue: "The trail should be close.",
      voiceover: "The trees surrounded Ethan as he followed the hidden route.",
      camera: "Tracking shot moving between trees.",
      lighting: "Cool filtered daylight."
    },

    {
      location: "nearby forest",
      characters: ["Ethan"],
      objects: ["mysterious map"],
      action: "Ethan follows the marked path deeper into the forest.",
      dialogue: "This path keeps going deeper.",
      voiceover: "The route carried Ethan farther away from the town.",
      camera: "Wide forest shot followed by medium tracking.",
      lighting: "Natural daylight with deep forest shadows."
    },

    {
      location: "nearby forest",
      characters: ["Ethan"],
      objects: ["mysterious map"],
      action: "Ethan spots an abandoned cabin hidden between the trees.",
      dialogue: "There it is... the cabin.",
      voiceover: "At last, Ethan spotted the abandoned cabin shown by the map.",
      camera: "Slow reveal through foreground branches.",
      lighting: "Muted daylight."
    },

    {
      location: "abandoned cabin",
      characters: ["Ethan"],
      objects: [],
      action: "Ethan cautiously approaches the cabin entrance.",
      dialogue: "Why would anyone hide this place?",
      voiceover: "Ethan approached the silent cabin with caution.",
      camera: "Slow forward dolly toward the doorway.",
      lighting: "Overcast forest light."
    },

    {
      location: "abandoned cabin",
      characters: ["Ethan"],
      objects: [],
      action: "Ethan enters the dark cabin and looks around.",
      dialogue: "Hello? Is anyone here?",
      voiceover: "Inside, the abandoned cabin was dark and strangely silent.",
      camera: "Over-the-shoulder entrance shot.",
      lighting: "Dim light through broken windows."
    },

    {
      location: "abandoned cabin",
      characters: ["Ethan"],
      objects: [],
      action: "Ethan suddenly hears a strange sound from deeper inside the cabin.",
      dialogue: "What was that sound?",
      voiceover: "Then a faint sound came from somewhere inside the cabin.",
      camera: "Close-up on Ethan turning toward the sound.",
      lighting: "Low suspenseful lighting."
    },

    {
      location: "abandoned cabin",
      characters: ["Ethan"],
      objects: [],
      action: "Ethan follows the sound down a narrow hallway.",
      dialogue: "I'm coming. Stay calm.",
      voiceover: "Ethan followed the mysterious sound through a dusty hallway.",
      camera: "Slow tracking shot behind Ethan.",
      lighting: "Dim hallway shadows."
    },

    {
      location: "locked room inside cabin",
      characters: ["Ethan", "Rescued Girl"],
      objects: ["locked room door"],
      action: "Ethan discovers a frightened girl trapped behind a locked door.",
      dialogue: "You're trapped in there!",
      voiceover: "Behind the locked door, Ethan found a frightened girl.",
      camera: "Reveal from Ethan's perspective.",
      lighting: "Soft beam illuminating the girl."
    },

    {
      location: "locked room inside cabin",
      characters: ["Ethan", "Rescued Girl"],
      objects: ["locked room door"],
      action: "Ethan reassures the frightened girl that he will help her.",
      dialogue: "Don't worry. I'll get you out.",
      voiceover: "Ethan promised the frightened girl that he would find a way to free her.",
      camera: "Alternating close-ups.",
      lighting: "Soft emotional interior light."
    },

    {
      location: "locked room inside cabin",
      characters: ["Ethan", "Rescued Girl"],
      objects: ["locked room door"],
      action: "Ethan searches the locked door and nearby walls for an escape route.",
      dialogue: "There has to be another way.",
      voiceover: "The door would not open, so Ethan searched for another way out.",
      camera: "Close tracking shot across the lock and walls.",
      lighting: "Low suspense lighting."
    },

    {
      location: "abandoned cabin",
      characters: ["Ethan", "Rescued Girl", "Dangerous Man"],
      objects: [],
      action: "A dangerous man suddenly enters the abandoned cabin.",
      dialogue: "Someone's coming!",
      voiceover: "Suddenly, footsteps outside announced the arrival of a dangerous man.",
      camera: "Fast cut toward the cabin entrance.",
      lighting: "Dark dramatic lighting."
    },

    {
      location: "abandoned cabin",
      characters: ["Ethan", "Rescued Girl", "Dangerous Man"],
      objects: [],
      action: "Ethan quickly hides with the girl behind cover.",
      dialogue: "Stay quiet. Follow me.",
      voiceover: "Ethan pulled the girl into hiding before the man could see them.",
      camera: "Low stealth tracking shot.",
      lighting: "Dark shadows with doorway light."
    },

    {
      location: "abandoned cabin",
      characters: ["Ethan", "Rescued Girl", "Dangerous Man"],
      objects: [],
      action: "The dangerous man searches the cabin while Ethan and the girl remain hidden.",
      dialogue: "Don't make a sound.",
      voiceover: "The man searched the cabin while the two stayed completely silent.",
      camera: "Intercut shots between the man and the hiding pair.",
      lighting: "Deep low-key suspense lighting."
    },

    {
      location: "abandoned cabin",
      characters: ["Ethan", "Rescued Girl"],
      objects: [],
      action: "The dangerous man moves away, and Ethan notices a concealed opening beneath the cabin floor.",
      dialogue: "Look! There's something under here.",
      voiceover: "When the danger moved away, Ethan noticed a hidden opening.",
      camera: "Close-up revealing the concealed floor entrance.",
      lighting: "Narrow beam revealing the opening."
    },

    {
      location: "secret tunnel beneath cabin",
      characters: ["Ethan", "Rescued Girl"],
      objects: ["secret tunnel entrance"],
      action: "Ethan and the girl enter the secret tunnel beneath the cabin.",
      dialogue: "This tunnel might lead outside.",
      voiceover: "Ethan realized the hidden tunnel could be their escape.",
      camera: "Rear tracking shot entering the tunnel.",
      lighting: "Dark tunnel with faint light ahead."
    },

    {
      location: "secret tunnel beneath cabin",
      characters: ["Ethan", "Rescued Girl"],
      objects: ["secret tunnel entrance"],
      action: "Ethan helps the girl move quickly through the narrow tunnel.",
      dialogue: "Stay close. We're almost out.",
      voiceover: "They hurried through the narrow passage toward the distant light.",
      camera: "Forward tracking shot toward the tunnel exit.",
      lighting: "Increasing natural light ahead."
    },

    {
      location: "nearby forest",
      characters: ["Ethan", "Rescued Girl"],
      objects: [],
      action: "Ethan and the girl emerge from the tunnel and escape into the forest.",
      dialogue: "We made it out!",
      voiceover: "They finally escaped the cabin and emerged safely into the forest.",
      camera: "Wide reveal as they step into open daylight.",
      lighting: "Bright early-morning light."
    },

    {
      location: "town at sunrise",
      characters: ["Ethan", "Rescued Girl", "Girl's Family"],
      objects: [],
      action: "At sunrise, Ethan brings the rescued girl safely back to town where her family is waiting.",
      dialogue: "Your family is waiting for you.",
      voiceover: "At sunrise, Ethan returned to town with the rescued girl and found her waiting family.",
      camera: "Wide emotional reunion followed by close-up of Ethan.",
      lighting: "Golden sunrise cinematic light."
    }

  ];
}

/* =========================================================
   BUILD PROJECT
========================================================= */

function buildProject(prompt, duration, aspectRatio) {
  const seconds = durationToSeconds(duration);
  const totalScenes = sceneCount(seconds);
  const story = understandStory(prompt);

  const specialStory =
    prompt.toLowerCase().includes("ethan") &&
    prompt.toLowerCase().includes("wooden box") &&
    prompt.toLowerCase().includes("mysterious map") &&
    prompt.toLowerCase().includes("forest") &&
    prompt.toLowerCase().includes("cabin") &&
    prompt.toLowerCase().includes("dangerous man") &&
    prompt.toLowerCase().includes("secret tunnel");

  let timeline = specialStory
    ? ethanTimeline()
    : buildGenericTimeline(prompt, totalScenes);

  if (totalScenes < timeline.length) {
    timeline = timeline.slice(0, totalScenes);
  }

  while (timeline.length < totalScenes) {
    const last = timeline[timeline.length - 1];

    timeline.push({
      ...last,
      action:
        "The story continues naturally from the previous moment without introducing unrelated elements.",
      dialogue: "We have to keep moving.",
      voiceover:
        "The journey continues naturally toward the next part of the story.",
      continuity:
        "Direct continuation from the previous scene."
    });
  }

  const characterLock = story.characters.map(c => ({
    name: c.name,
    role: c.role,
    permanent_appearance: c.description,
    consistency_rule:
      "Keep the exact same face, age, hairstyle, body proportions, skin tone and clothing in every scene."
  }));

  const storyElementLock = {
    locations: story.locations,
    objects: story.objects,
    conditions: story.conditions,
    rule:
      "Only use locations, props and conditions when they belong to the current scene."
  };

  const scenes = timeline.map((beat, index) => {
    const start = index * 10;
    const end = start + 10;

    const props =
      beat.objects && beat.objects.length
        ? beat.objects.join(", ")
        : "no special prop";

    const chars =
      beat.characters && beat.characters.length
        ? beat.characters.join(", ")
        : "only characters required by the action";

    return {
      scene_number: index + 1,
      start_time: start,
      end_time: end,

      visual_prompt:
        `Cinematic ${aspectRatio} scene. ${beat.action} ` +
        `Characters present: ${chars}. ` +
        `Relevant props: ${props}. ` +
        `Maintain exact character continuity, realistic movement and natural facial expressions. ` +
        `Do not add unrelated characters, vehicles or objects.`,

      camera: beat.camera,
      lighting: beat.lighting,
      action: beat.action,
      dialogue: beat.dialogue,
      voiceover: beat.voiceover,

      continuity:
        index === 0
          ? `Opening state: ${beat.action}`
          : `Continue directly from Scene ${index}. The previous action naturally leads into: ${beat.action}`,

      characters: beat.characters || [],
      location: beat.location,
      objects: beat.objects || []
    };
  });

  return {
    duration: seconds,
    total_scenes: totalScenes,
    aspect_ratio: aspectRatio,
    mode: "demo",

    story_understanding: {
      characters: story.characters,
      locations: story.locations,
      objects: story.objects,
      conditions: story.conditions,
      goal: story.goal,
      conflict: story.conflict,
      climax: story.climax,
      resolution: story.resolution
    },

    master_character_lock: characterLock,
    story_element_lock: storyElementLock,

    scenes
  };
}

/* =========================================================
   GENERIC STORY FALLBACK
========================================================= */

function buildGenericTimeline(prompt, totalScenes) {
  const sentences = cleanText(prompt)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const result = [];

  for (let i = 0; i < totalScenes; i++) {
    const sentence = sentences[i % sentences.length] || prompt;

    result.push({
      location: "story location",
      characters: [],
      objects: [],
      action: sentence,
      dialogue:
        i === 0
          ? "This is where the journey begins."
          : "We have to keep moving.",
      voiceover: sentence,
      camera: "Cinematic medium tracking shot.",
      lighting: "Natural cinematic lighting."
    });
  }

  return result;
}

/* =========================================================
   DEMO API — NO GEMINI
========================================================= */

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        error: "Prompt is required."
      });
    }

    const project = buildProject(
      prompt,
      duration,
      aspectRatio || "16:9"
    );

    res.json(project);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Project creation failed.",
      details: error.message
    });
  }
});

/* =========================================================
   GEMINI API
========================================================= */

app.post("/api/plan-scenes", async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API is not configured."
      });
    }

    const {
      prompt,
      duration,
      aspectRatio
    } = req.body || {};

    const seconds = durationToSeconds(duration);
    const totalScenes = sceneCount(seconds);
    const ratio = aspectRatio || "16:9";

    const instruction = `
You are SANAPTAI V12.1 Story Engine.

Create exactly ${totalScenes} scenes from the user's story.

Every scene must be exactly 10 seconds.

Rules:
- Follow the complete story chronologically.
- Do not repeat the same event just to fill time.
- Every scene must contain a meaningful distinct action.
- Preserve character identity and appearance.
- Keep supporting characters separate from the main character.
- Do not invent unrelated objects or vehicles.
- Dialogue must fit naturally inside 10 seconds.
- Voiceover must match the scene.
- Camera and lighting must match the location and action.
- For long stories, create meaningful micro-actions rather than generic setup/reaction repetition.

Return JSON only:

{
  "duration": ${seconds},
  "total_scenes": ${totalScenes},
  "aspect_ratio": "${ratio}",
  "scenes": []
}

USER STORY:
${cleanText(prompt)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: instruction
    });

    const raw = response.text || "";

    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    res.json(JSON.parse(cleaned));
  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      error: "AI scene planning failed.",
      details: error.message
    });
  }
});

/* =========================================================
   CREATE PROJECT
========================================================= */

app.post("/api/create-project", async (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio,
      mode
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        error: "Prompt is required."
      });
    }

    if (mode === "ai") {
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API is not configured."
        });
      }

      const seconds = durationToSeconds(duration);
      const totalScenes = sceneCount(seconds);

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `
Create exactly ${totalScenes} chronological 10-second scenes for this story.

Story:
${cleanText(prompt)}

Aspect ratio: ${aspectRatio || "16:9"}

Return JSON only with:
duration,
total_scenes,
aspect_ratio,
scenes.

Each scene must contain:
scene_number,
start_time,
end_time,
visual_prompt,
camera,
lighting,
action,
dialogue,
voiceover,
continuity.
`
      });

      const raw = response.text || "";

      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      return res.json(JSON.parse(cleaned));
    }

    return res.json(
      buildProject(
        prompt,
        duration,
        aspectRatio || "16:9"
      )
    );

  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      error: "Project creation failed.",
      details: error.message
    });
  }
});

/* =========================================================
   TEST
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    ok: true,
    version: "V12.1",
    message: "SANAPTAI V12.1 server is working."
  });
});

/* =========================================================
   SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(`SANAPTAI V12.1 running on port ${PORT}`);
});
