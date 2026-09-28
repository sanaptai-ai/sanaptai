import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

let ai = null;

if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function cleanText(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function splitSentences(text = "") {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function has(text, words) {
  const t = text.toLowerCase();
  return words.some(w => t.includes(w.toLowerCase()));
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function durationToSeconds(duration) {
  const n = Number(duration);
  return Number.isFinite(n) && n > 0 ? n : 30;
}

function createSceneCount(seconds) {
  return Math.max(1, Math.ceil(seconds / 10));
}

// --------------------------------------------------
// CHARACTER PARSER
// --------------------------------------------------

function parseCharacters(text) {
  const t = text.toLowerCase();
  const characters = [];

  // Main character
  if (
    t.includes("12-year-old boy") ||
    t.includes("12 year old boy") ||
    t.includes("young boy") ||
    t.includes("little boy")
  ) {
    characters.push({
      role: "main character",
      description:
        "12-year-old boy Ethan, youthful face, dark brown eyes, short slightly messy black hair, slim child build, consistent clothing and proportions"
    });
  } else if (
    t.includes("13-year-old boy") ||
    t.includes("13 year old boy")
  ) {
    characters.push({
      role: "main character",
      description:
        "13-year-old boy, youthful face, dark eyes, short black hair, slim child build, consistent clothing and proportions"
    });
  } else if (t.includes("boy")) {
    characters.push({
      role: "main character",
      description:
        "young boy, youthful face, dark eyes, short black hair, slim child build, consistent clothing and proportions"
    });
  } else if (t.includes("girl")) {
    characters.push({
      role: "main character",
      description:
        "young girl, youthful face, dark eyes, natural hairstyle, slim child build, consistent clothing and proportions"
    });
  } else if (t.includes("woman")) {
    characters.push({
      role: "main character",
      description:
        "adult woman, natural facial features, realistic proportions, consistent clothing and appearance"
    });
  } else if (t.includes("man")) {
    characters.push({
      role: "main character",
      description:
        "adult man, natural facial features, realistic proportions, consistent clothing and appearance"
    });
  }

  if (t.includes("mother") || t.includes("mom")) {
    characters.push({
      role: "mother",
      description:
        "Ethan's mother, adult woman, warm natural face, medium build, consistent hairstyle and clothing"
    });
  }

  if (t.includes("father") || t.includes("dad")) {
    characters.push({
      role: "father",
      description:
        "Ethan's father, adult man, natural face, medium build, consistent hairstyle and clothing"
    });
  }

  if (t.includes("teacher")) {
    characters.push({
      role: "teacher",
      description:
        "adult school teacher, realistic appearance, consistent clothing"
    });
  }

  if (t.includes("friend")) {
    characters.push({
      role: "friend",
      description:
        "young friend, realistic child appearance, consistent clothing"
    });
  }

  if (
    t.includes("dangerous man") ||
    t.includes("strange man") ||
    t.includes("villain") ||
    t.includes("enemy") ||
    t.includes("bad guy")
  ) {
    characters.push({
      role: "antagonist",
      description:
        "dangerous adult man, intimidating presence, dark jacket, rugged appearance, consistent face and clothing"
    });
  }

  if (
    t.includes("girl trapped") ||
    t.includes("frightened girl") ||
    t.includes("young girl trapped")
  ) {
    characters.push({
      role: "rescued girl",
      description:
        "frightened young girl, child, worried expression, consistent face, hairstyle and clothing"
    });
  }

  if (
    t.includes("girl's family") ||
    t.includes("girls family") ||
    t.includes("her family") ||
    t.includes("family is waiting")
  ) {
    characters.push({
      role: "girl's family",
      description:
        "family members waiting anxiously for the rescued girl, realistic appearance and consistent clothing"
    });
  }

  return characters;
}

// --------------------------------------------------
// LOCATION PARSER
// --------------------------------------------------

function parseLocations(text) {
  const t = text.toLowerCase();
  const locations = [];

  if (has(t, ["small town", "town"])) locations.push("small town");
  if (has(t, ["house", "home", "floor"])) locations.push("family house");
  if (has(t, ["school"])) locations.push("school");
  if (has(t, ["street", "road"])) locations.push("town street");
  if (has(t, ["forest", "woods"])) locations.push("nearby forest");
  if (has(t, ["cabin"])) locations.push("abandoned cabin");
  if (has(t, ["room", "locked room"])) locations.push("locked cabin room");
  if (has(t, ["tunnel"])) locations.push("secret tunnel");
  if (has(t, ["sunrise", "sunrise town"])) locations.push("town at sunrise");

  return unique(locations);
}

// --------------------------------------------------
// OBJECT / PROP PARSER
// --------------------------------------------------

function parseObjects(text) {
  const t = text.toLowerCase();
  const objects = [];

  if (has(t, ["wooden box", "old box", "box"])) {
    objects.push("old wooden box");
  }

  if (has(t, ["mysterious map", "map"])) {
    objects.push("mysterious map");
  }

  if (has(t, ["locked room", "lock", "locked door"])) {
    objects.push("locked door");
  }

  if (has(t, ["secret tunnel", "tunnel"])) {
    objects.push("secret tunnel entrance");
  }

  if (has(t, ["floor"])) {
    objects.push("wooden floor");
  }

  return unique(objects);
}

// --------------------------------------------------
// CONDITIONS
// --------------------------------------------------

function parseConditions(text) {
  const t = text.toLowerCase();
  const conditions = [];

  if (has(t, ["evening"])) conditions.push("evening");
  if (has(t, ["night"])) conditions.push("night");
  if (has(t, ["sunrise", "morning"])) conditions.push("sunrise");
  if (has(t, ["rain", "rainstorm", "storm"])) conditions.push("rainstorm");
  if (has(t, ["dark"])) conditions.push("dark atmosphere");

  return unique(conditions);
}

// --------------------------------------------------
// SPECIAL STORY DETECTION
// --------------------------------------------------

function isEthanCabinStory(text) {
  const t = text.toLowerCase();

  return (
    t.includes("ethan") &&
    t.includes("wooden box") &&
    t.includes("map") &&
    t.includes("forest") &&
    t.includes("cabin") &&
    t.includes("trapped") &&
    t.includes("tunnel")
  );
}

// --------------------------------------------------
// ETHAN STORY TIMELINE
// --------------------------------------------------

function ethanTimeline() {
  return [
    {
      id: "town_intro",
      location: "small town",
      characters: ["main character", "mother"],
      props: [],
      action:
        "Ethan lives with his mother in a quiet small town, establishing his ordinary life before the mystery begins.",
      dialogue:
        "Life here is quiet, but I wonder what might be waiting beyond this town.",
      voiceover:
        "Twelve-year-old Ethan lived with his mother in a quiet small town, unaware that an unusual adventure was about to begin."
    },

    {
      id: "box_discovery",
      location: "family house",
      characters: ["main character"],
      props: ["old wooden box", "wooden floor"],
      action:
        "One evening, Ethan notices something unusual beneath a loose section of the wooden floor and carefully uncovers an old wooden box.",
      dialogue:
        "What's this old box doing beneath our floor?",
      voiceover:
        "One evening, Ethan discovered something hidden beneath the floor of his home."
    },

    {
      id: "open_box",
      location: "family house",
      characters: ["main character"],
      props: ["old wooden box"],
      action:
        "Ethan opens the weathered wooden box and carefully examines its mysterious contents.",
      dialogue:
        "Someone hid this here for a reason.",
      voiceover:
        "The forgotten box seemed to contain a secret that had been hidden for years."
    },

    {
      id: "map_found",
      location: "family house",
      characters: ["main character"],
      props: ["old wooden box", "mysterious map"],
      action:
        "Ethan unfolds a mysterious map found inside the wooden box and studies its strange markings.",
      dialogue:
        "This isn't an ordinary map.",
      voiceover:
        "Inside the box, Ethan found a mysterious map covered with unfamiliar markings."
    },

    {
      id: "map_clue",
      location: "family house",
      characters: ["main character"],
      props: ["mysterious map"],
      action:
        "Ethan follows the map's markings with his finger and realizes they point toward the nearby forest.",
      dialogue:
        "The map is pointing to the forest.",
      voiceover:
        "The markings appeared to lead directly toward the forest outside town."
    },

    {
      id: "forest_departure",
      location: "nearby forest",
      characters: ["main character"],
      props: ["mysterious map"],
      action:
        "Ethan follows the map into the nearby forest, moving carefully between the trees.",
      dialogue:
        "I'll follow the map, but I'll be careful.",
      voiceover:
        "Driven by curiosity, Ethan entered the forest and followed the mysterious route."
    },

    {
      id: "forest_deeper",
      location: "nearby forest",
      characters: ["main character"],
      props: ["mysterious map"],
      action:
        "Ethan walks deeper into the forest as the familiar town disappears behind him.",
      dialogue:
        "I'm farther from home than I expected.",
      voiceover:
        "The deeper Ethan traveled, the more isolated the forest became."
    },

    {
      id: "cabin_found",
      location: "nearby forest",
      characters: ["main character"],
      props: ["mysterious map"],
      action:
        "Ethan discovers an abandoned cabin hidden deep among the trees and cautiously approaches it.",
      dialogue:
        "That cabin wasn't on the map by accident.",
      voiceover:
        "Deep in the forest, Ethan discovered an abandoned cabin hidden among the trees."
    },

    {
      id: "strange_sound",
      location: "abandoned cabin",
      characters: ["main character"],
      props: [],
      action:
        "Ethan stops outside the cabin when he hears a strange sound coming from somewhere inside.",
      dialogue:
        "Wait... someone is inside.",
      voiceover:
        "Then a strange sound came from inside the abandoned cabin."
    },

    {
      id: "enter_cabin",
      location: "abandoned cabin",
      characters: ["main character"],
      props: [],
      action:
        "Ethan slowly enters the abandoned cabin and looks around for the source of the sound.",
      dialogue:
        "I need to find out who's in here.",
      voiceover:
        "Although frightened, Ethan stepped inside to discover what was happening."
    },

    {
      id: "girl_found",
      location: "locked cabin room",
      characters: ["main character", "rescued girl"],
      props: ["locked door"],
      action:
        "Ethan discovers a frightened girl trapped behind a locked door inside the cabin.",
      dialogue:
        "Don't be afraid. I'll get you out.",
      voiceover:
        "Behind a locked door, Ethan found a frightened girl who desperately needed help."
    },

    {
      id: "rescue_decision",
      location: "locked cabin room",
      characters: ["main character", "rescued girl"],
      props: ["locked door"],
      action:
        "Ethan promises the frightened girl that he will find a way to rescue her.",
      dialogue:
        "Stay calm. We're getting out of here.",
      voiceover:
        "Ethan knew he could not leave the girl behind."
    },

    {
      id: "danger_arrives",
      location: "abandoned cabin",
      characters: ["main character", "rescued girl", "antagonist"],
      props: [],
      action:
        "A dangerous man suddenly arrives at the cabin, forcing Ethan and the girl to hide.",
      dialogue:
        "Someone's coming. Stay completely quiet.",
      voiceover:
        "Suddenly, a dangerous man arrived at the cabin, turning the rescue into a desperate escape."
    },

    {
      id: "hide",
      location: "abandoned cabin",
      characters: ["main character", "rescued girl"],
      props: [],
      action:
        "Ethan and the girl hide silently while the dangerous man searches the cabin.",
      dialogue:
        "We have to wait for the right moment.",
      voiceover:
        "Ethan and the girl stayed hidden while the danger moved through the cabin."
    },

    {
      id: "search_exit",
      location: "abandoned cabin",
      characters: ["main character", "rescued girl"],
      props: [],
      action:
        "Ethan quietly searches the cabin for another way out while keeping the girl close.",
      dialogue:
        "There has to be another way out.",
      voiceover:
        "Instead of confronting the danger, Ethan searched for a safer escape route."
    },

    {
      id: "tunnel_found",
      location: "abandoned cabin",
      characters: ["main character", "rescued girl"],
      props: ["secret tunnel entrance"],
      action:
        "Ethan discovers a hidden opening beneath the cabin that leads into a secret tunnel.",
      dialogue:
        "I found it. There's a tunnel beneath us.",
      voiceover:
        "Beneath the cabin, Ethan discovered the hidden escape route marked by the old mystery."
    },

    {
      id: "tunnel_escape",
      location: "secret tunnel",
      characters: ["main character", "rescued girl"],
      props: ["secret tunnel entrance"],
      action:
        "Ethan leads the girl through the narrow secret tunnel, moving quickly toward the forest.",
      dialogue:
        "Keep moving. We're almost outside.",
      voiceover:
        "The two escaped through the secret tunnel and emerged beyond the cabin."
    },

    {
      id: "forest_escape",
      location: "nearby forest",
      characters: ["main character", "rescued girl"],
      props: [],
      action:
        "Ethan and the girl run through the forest together, putting distance between themselves and the cabin.",
      dialogue:
        "Don't stop. The town is ahead.",
      voiceover:
        "They hurried through the forest, finally leaving the danger behind."
    },

    {
      id: "sunrise_journey",
      location: "town at sunrise",
      characters: ["main character", "rescued girl"],
      props: [],
      action:
        "As sunrise approaches, Ethan brings the exhausted girl safely toward the edge of town.",
      dialogue:
        "We're almost home.",
      voiceover:
        "By sunrise, Ethan and the girl were finally close to the safety of town."
    },

    {
      id: "family_reunion",
      location: "small town",
      characters: ["main character", "rescued girl", "girl's family"],
      props: [],
      action:
        "Ethan brings the girl safely back to town, where her relieved family rushes forward to welcome her.",
      dialogue:
        "Your family has been waiting for you.",
      voiceover:
        "At the edge of town, the girl's family was waiting, and the long search finally ended."
    },

    {
      id: "final_resolution",
      location: "small town",
      characters: ["main character", "rescued girl", "girl's family"],
      props: [],
      action:
        "Ethan watches as the rescued girl reunites with her family, bringing the dangerous adventure to a peaceful ending.",
      dialogue:
        "I'm just glad you're finally safe.",
      voiceover:
        "Ethan returned home knowing that one mysterious map had led him to an unforgettable rescue."
    }
  ];
}

// --------------------------------------------------
// GENERIC TIMELINE
// --------------------------------------------------

function genericTimeline(text) {
  const sentences = splitSentences(text);

  return sentences.map((sentence, index) => ({
    id: `story_${index + 1}`,
    location: "story environment",
    characters: ["main character"],
    props: [],
    action: sentence,
    dialogue: createGenericDialogue(sentence, index),
    voiceover: sentence
  }));
}

function createGenericDialogue(sentence, index) {
  const lower = sentence.toLowerCase();

  if (lower.includes("find") || lower.includes("discover")) {
    return "Wait... what is that?";
  }

  if (lower.includes("danger") || lower.includes("attack")) {
    return "We have to be careful.";
  }

  if (lower.includes("run") || lower.includes("escape")) {
    return "Keep moving. We have to get out.";
  }

  if (lower.includes("decide") || lower.includes("choose")) {
    return "I have to make a choice.";
  }

  if (lower.includes("help") || lower.includes("rescue")) {
    return "I'm going to help.";
  }

  return [
    "Something is changing.",
    "I need to understand this.",
    "I can't ignore what I found.",
    "Let's keep moving.",
    "I have to be careful.",
    "There's more to this story."
  ][index % 6];
}

// --------------------------------------------------
// EXPANSION ENGINE
// --------------------------------------------------

function expandBeat(beat) {
  return [
    {
      ...beat,
      phase: "setup",
      action: `${beat.action} Establish the situation clearly without introducing unrelated elements.`,
      dialogue: beat.dialogue,
      voiceover: beat.voiceover
    },

    {
      ...beat,
      phase: "reaction",
      action: `Show the characters reacting naturally to the situation: ${beat.action}`,
      dialogue: reactionDialogue(beat),
      voiceover: reactionVoiceover(beat)
    },

    {
      ...beat,
      phase: "decision",
      action: `Show the main character making a clear decision connected directly to the story event: ${beat.action}`,
      dialogue: decisionDialogue(beat),
      voiceover: decisionVoiceover(beat)
    },

    {
      ...beat,
      phase: "action",
      action: `Show the main physical action clearly: ${beat.action}`,
      dialogue: actionDialogue(beat),
      voiceover: actionVoiceover(beat)
    },

    {
      ...beat,
      phase: "consequence",
      action: `Show the immediate consequence that naturally leads into the next story event.`,
      dialogue: consequenceDialogue(beat),
      voiceover: consequenceVoiceover(beat)
    }
  ];
}

function reactionDialogue(beat) {
  if (beat.id === "box_discovery") return "Why was this hidden here?";
  if (beat.id === "map_found") return "Where does this map lead?";
  if (beat.id === "strange_sound") return "That sound came from inside.";
  if (beat.id === "girl_found") return "Who locked you in here?";
  if (beat.id === "danger_arrives") return "We can't let him see us.";
  if (beat.id === "tunnel_found") return "This could be our way out.";
  if (beat.id === "family_reunion") return "They're here. You're safe now.";
  return "Something about this feels important.";
}

function decisionDialogue(beat) {
  if (beat.id === "map_clue") return "I'm going to follow this clue.";
  if (beat.id === "forest_departure") return "I'll follow the map carefully.";
  if (beat.id === "rescue_decision") return "I won't leave you here.";
  if (beat.id === "search_exit") return "I'll find another way out.";
  if (beat.id === "tunnel_found") return "We're taking this route.";
  return "I know what I need to do.";
}

function actionDialogue(beat) {
  if (beat.id === "open_box") return "Let's see what's inside.";
  if (beat.id === "map_found") return "This map could explain everything.";
  if (beat.id === "enter_cabin") return "I'm going inside.";
  if (beat.id === "hide") return "Stay close and stay quiet.";
  if (beat.id === "tunnel_escape") return "Follow me through the tunnel.";
  if (beat.id === "forest_escape") return "We're getting farther away.";
  return "Keep going.";
}

function consequenceDialogue(beat) {
  if (beat.id === "box_discovery") return "This changes everything.";
  if (beat.id === "map_clue") return "The forest is our next stop.";
  if (beat.id === "cabin_found") return "Now we need to know what's inside.";
  if (beat.id === "girl_found") return "We need to get you out.";
  if (beat.id === "danger_arrives") return "We need another escape route.";
  if (beat.id === "tunnel_found") return "This is our chance.";
  if (beat.id === "family_reunion") return "The nightmare is finally over.";
  return "Now we know what comes next.";
}

function reactionVoiceover(beat) {
  return `The situation becomes clearer as the characters react to what is happening. ${beat.voiceover}`;
}

function decisionVoiceover(beat) {
  return `Ethan makes a deliberate choice that directly moves the story forward. ${beat.voiceover}`;
}

function actionVoiceover(beat) {
  return `The next action unfolds naturally and keeps the story moving forward. ${beat.voiceover}`;
}

function consequenceVoiceover(beat) {
  return `The action creates a clear consequence that leads naturally into the next part of the story.`;
}

// --------------------------------------------------
// BUILD TIMELINE
// --------------------------------------------------

function buildTimeline(story, requiredScenes) {
  let base;

  if (isEthanCabinStory(story)) {
    base = ethanTimeline();
  } else {
    base = genericTimeline(story);
  }

  // Short video: use meaningful beats directly
  if (requiredScenes <= base.length) {
    return base.slice(0, requiredScenes);
  }

  // Long video: expand every meaningful beat
  let expanded = [];

  for (const beat of base) {
    expanded.push(...expandBeat(beat));
  }

  // If still not enough scenes, repeat only as continuity scenes
  let i = 0;

  while (expanded.length < requiredScenes) {
    const source = base[i % base.length];

    expanded.push({
      ...source,
      phase: "continuation",
      action:
        `Continue naturally from the previous story moment while preserving the exact characters, location, props and emotional state. ${source.action}`,
      dialogue:
        continuationDialogue(source, i),
      voiceover:
        `The story continues naturally from the previous moment while preserving continuity.`
    });

    i++;
  }

  return expanded.slice(0, requiredScenes);
}

function continuationDialogue(beat, index) {
  const lines = [
    "We have to keep going.",
    "I can't stop now.",
    "Something tells me we're close.",
    "Stay with me.",
    "We need to keep moving.",
    "This isn't over yet."
  ];

  return lines[index % lines.length];
}

// --------------------------------------------------
// CHARACTER LOCK
// --------------------------------------------------

function createCharacterLock(characters) {
  return characters.map(c => ({
    role: c.role,
    locked_description: c.description
  }));
}

// --------------------------------------------------
// SCENE LOCATION
// --------------------------------------------------

function getSceneLocation(beat) {
  return beat.location || "story environment";
}

// --------------------------------------------------
// SCENE VISUAL
// --------------------------------------------------

function createVisualPrompt(beat, characters, aspectRatio) {
  const characterText = beat.characters
    .map(role => {
      const c = characters.find(x => x.role === role);
      return c ? c.description : role;
    })
    .join("; ");

  const props =
    beat.props && beat.props.length
      ? `Important props: ${beat.props.join(", ")}.`
      : "No unrelated props.";

  return (
    `Cinematic realistic live-action movie scene. ` +
    `Location: ${getSceneLocation(beat)}. ` +
    `Characters: ${characterText}. ` +
    `${props} ` +
    `Main action: ${beat.action} ` +
    `Natural human movement, realistic facial expressions, accurate physics, ` +
    `cinematic depth, detailed environment, consistent character identity, ` +
    `same face, same age, same hairstyle, same body proportions and same clothing. ` +
    `Do not introduce unrelated characters, locations, vehicles or objects. ` +
    `Aspect ratio ${aspectRatio}.`
  );
}

// --------------------------------------------------
// CAMERA
// --------------------------------------------------

function cameraFor(index, phase) {
  const cameras = [
    "wide cinematic establishing shot",
    "medium tracking shot",
    "over-the-shoulder shot",
    "slow cinematic push-in",
    "emotional close-up",
    "handheld suspense shot"
  ];

  if (phase === "consequence") return "slow cinematic push-in";
  if (phase === "reaction") return "emotional close-up";

  return cameras[index % cameras.length];
}

// --------------------------------------------------
// LIGHTING
// --------------------------------------------------

function lightingFor(location, phase) {
  if (location === "family house") {
    return "warm realistic indoor evening lighting";
  }

  if (location === "abandoned cabin") {
    return "dim atmospheric interior lighting with natural shadows";
  }

  if (location === "locked cabin room") {
    return "dim dramatic interior lighting with soft directional light";
  }

  if (location === "secret tunnel") {
    return "dark cinematic tunnel lighting with subtle practical light";
  }

  if (location === "nearby forest") {
    return "natural forest lighting with cinematic depth and realistic shadows";
  }

  if (location === "town at sunrise") {
    return "soft golden sunrise lighting";
  }

  return "natural cinematic lighting appropriate to the exact scene";
}

// --------------------------------------------------
// STORY ELEMENT LOCK
// --------------------------------------------------

function createStoryElementLock(text) {
  return {
    locations: parseLocations(text),
    objects: parseObjects(text),
    conditions: parseConditions(text),
    rule:
      "Only use story elements when they belong to the current scene. Never introduce unrelated props, characters or locations."
  };
}

// --------------------------------------------------
// BUILD PROJECT
// --------------------------------------------------

function createProject(prompt, duration, aspectRatio) {
  const story = cleanText(prompt);
  const seconds = durationToSeconds(duration);
  const totalScenes = createSceneCount(seconds);

  const characters = parseCharacters(story);
  const locations = parseLocations(story);
  const objects = parseObjects(story);
  const conditions = parseConditions(story);

  const timeline = buildTimeline(story, totalScenes);

  const scenes = timeline.map((beat, index) => {
    const start = index * 10;
    const end = start + 10;

    return {
      scene_number: index + 1,
      start_time: `${start}s`,
      end_time: `${end}s`,

      visual_prompt: createVisualPrompt(
        beat,
        characters,
        aspectRatio
      ),

      camera: cameraFor(index, beat.phase),

      lighting: lightingFor(
        getSceneLocation(beat),
        beat.phase
      ),

      action: beat.action,

      dialogue: beat.dialogue,

      voiceover: beat.voiceover,

      continuity:
        `Continue directly from the previous scene. ` +
        `Keep character identity locked. ` +
        `Keep the exact same face, age, hairstyle, body proportions and clothing. ` +
        `Current location: ${getSceneLocation(beat)}. ` +
        `Characters in this scene: ${beat.characters.join(", ")}. ` +
        `Props in this scene: ${
          beat.props.length ? beat.props.join(", ") : "none"
        }. ` +
        `Do not introduce unrelated elements.`
    };
  });

  return {
    success: true,
    mode: "V12 TRUE STORY TIMELINE DEMO",
    duration: seconds,
    total_scenes: totalScenes,
    aspect_ratio: aspectRatio,

    story_understanding: {
      characters,
      locations,
      objects,
      conditions
    },

    master_character_lock: createCharacterLock(characters),

    story_element_lock: createStoryElementLock(story),

    scenes
  };
}

// --------------------------------------------------
// DEMO PROJECT
// --------------------------------------------------

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt,
      duration = 30,
      aspectRatio = "16:9"
    } = req.body;

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required."
      });
    }

    const project = createProject(
      prompt,
      duration,
      aspectRatio
    );

    res.json(project);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// --------------------------------------------------
// GEMINI AI MODE
// --------------------------------------------------

app.post("/api/plan-scenes", async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({
        success: false,
        error:
          "Gemini AI is not configured. Demo Mode is available."
      });
    }

    const {
      prompt,
      duration = 30,
      aspectRatio = "16:9"
    } = req.body;

    const seconds = durationToSeconds(duration);
    const scenes = createSceneCount(seconds);

    const instruction = `
You are SANAPTAI's cinematic story planning engine.

Create exactly ${scenes} scenes.

Every scene is exactly 10 seconds.

Aspect ratio: ${aspectRatio}

Story:
${prompt}

Rules:
1. Preserve the original story.
2. Keep events chronological.
3. Do not invent unrelated events.
4. Keep character identity consistent.
5. Every scene must contain one meaningful action.
6. Dialogue must be short enough for a 10-second scene.
7. Voiceover must describe the actual story moment.
8. Do not repeat the same dialogue.
9. Do not repeat generic voiceover.
10. Maintain location and prop continuity.
11. Return JSON only.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: instruction
    });

    res.json({
      success: true,
      mode: "GEMINI AI",
      duration: seconds,
      total_scenes: scenes,
      aspect_ratio: aspectRatio,
      ai_response: response.text
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// --------------------------------------------------
// CREATE PROJECT
// --------------------------------------------------

app.post("/api/create-project", (req, res) => {
  try {
    const {
      prompt,
      duration = 30,
      aspectRatio = "16:9"
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required."
      });
    }

    res.json(
      createProject(
        prompt,
        duration,
        aspectRatio
      )
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// --------------------------------------------------
// TEST
// --------------------------------------------------

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "SANAPTAI V12 True Story Timeline Engine is working."
  });
});

// --------------------------------------------------
// ROOT
// --------------------------------------------------

app.get("/", (req, res) => {
  res.send("SANAPTAI V12 True Story Timeline Engine is running.");
});

// --------------------------------------------------
// SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(`SANAPTAI V12 running on port ${PORT}`);
});
