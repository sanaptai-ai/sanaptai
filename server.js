import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "V26";
const DEMO_MODE = true;
const GEMINI_ENABLED = false;
const SCENE_DURATION = 10;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

// --------------------------------------------------
// CHARACTER LOCKS
// --------------------------------------------------

const CHARACTER_LOCKS = {
  Noah:
    "Noah, 14-year-old boy, slim build, short slightly messy brown hair, blue eyes, navy blue hoodie, dark jeans, white sneakers, consistent face and clothing in every scene.",

  Father:
    "Noah's father, middle-aged man, average build, short dark hair with some gray, trimmed beard, brown work jacket, dark trousers, consistent appearance.",

  Villagers:
    "Coastal town villagers in practical everyday clothing, consistent appearance.",

  RescueCrew:
    "Professional coastal rescue crew wearing bright weatherproof rescue jackets and safety gear, consistent appearance."
};

// --------------------------------------------------
// NOAH STORY — ATOMIC EVENTS
// --------------------------------------------------

const NOAH_EVENTS = [
  {
    id: "N01",
    type: "setup",
    location: "Coastal Town",
    characters: ["Noah", "Father"],
    objects: [],
    action: "Noah walks through the small coastal town beside his father."
  },
  {
    id: "N02",
    type: "movement",
    location: "Father's Workshop",
    characters: ["Noah", "Father"],
    objects: [],
    action: "Noah enters his father's workshop."
  },
  {
    id: "N03",
    type: "discovery",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah discovers an old lighthouse journal on the workbench."
  },
  {
    id: "N04",
    type: "discovery",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah opens the journal and begins reading it."
  },
  {
    id: "N05",
    type: "warning",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal", "Storm Warning"],
    action: "Noah reads a warning about a powerful storm approaching the town."
  },
  {
    id: "N06",
    type: "realization",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah realizes the approaching storm could endanger the town."
  },
  {
    id: "N07",
    type: "decision",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah decides that he must warn the villagers."
  },
  {
    id: "N08",
    type: "movement",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah leaves the workshop carrying the journal."
  },
  {
    id: "N09",
    type: "warning",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: ["Lighthouse Journal"],
    action: "Noah warns the villagers about the approaching storm."
  },
  {
    id: "N10",
    type: "conflict",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: ["Lighthouse Journal"],
    action: "The villagers doubt Noah's warning."
  },
  {
    id: "N11",
    type: "decision",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: ["Lighthouse Journal"],
    action: "Noah shows the villagers the warning written in the journal."
  },
  {
    id: "N12",
    type: "weather",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: [],
    action: "Dark storm clouds begin gathering over the coastal town."
  },
  {
    id: "N13",
    type: "weather",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: [],
    action: "Strong wind begins sweeping through the streets."
  },
  {
    id: "N14",
    type: "weather",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: [],
    action: "Heavy rain begins falling as the storm arrives."
  },
  {
    id: "N15",
    type: "realization",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah notices that the lighthouse signal has stopped working."
  },
  {
    id: "N16",
    type: "realization",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah realizes that boats may not be able to find the harbor."
  },
  {
    id: "N17",
    type: "decision",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah decides to repair the lighthouse signal himself."
  },
  {
    id: "N18",
    type: "movement",
    location: "Lighthouse",
    characters: ["Noah"],
    objects: [],
    action: "Noah runs toward the lighthouse through the storm."
  },
  {
    id: "N19",
    type: "movement",
    location: "Lighthouse Stairway",
    characters: ["Noah"],
    objects: [],
    action: "Noah climbs the lighthouse stairs."
  },
  {
    id: "N20",
    type: "movement",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah reaches the damaged lighthouse signal mechanism."
  },
  {
    id: "N21",
    type: "realization",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"],
    action: "Noah examines the damaged signal and identifies the problem."
  },
  {
    id: "N22",
    type: "action",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"],
    action: "Noah begins repairing the damaged signal."
  },
  {
    id: "N23",
    type: "action",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"],
    action: "Noah continues repairing the lighthouse mechanism."
  },
  {
    id: "N24",
    type: "climax",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "The lighthouse signal suddenly turns back on."
  },
  {
    id: "N25",
    type: "rescue",
    location: "Coastal Waters",
    characters: ["Noah", "RescueCrew"],
    objects: ["Lighthouse Signal", "Rescue Boat"],
    action: "A rescue boat sees the restored lighthouse signal."
  },
  {
    id: "N26",
    type: "rescue",
    location: "Coastal Waters",
    characters: ["RescueCrew"],
    objects: ["Rescue Boat", "Lighthouse Signal"],
    action: "The rescue crew follows the lighthouse signal toward the harbor."
  },
  {
    id: "N27",
    type: "rescue",
    location: "Harbor",
    characters: ["RescueCrew"],
    objects: ["Rescue Boat"],
    action: "The rescue boat safely navigates toward the harbor."
  },
  {
    id: "N28",
    type: "rescue",
    location: "Harbor",
    characters: ["RescueCrew", "Noah"],
    objects: ["Rescue Boat"],
    action: "The rescue boat reaches the harbor safely."
  },
  {
    id: "N29",
    type: "resolution",
    location: "Coastal Town",
    characters: ["Noah", "Father", "Villagers"],
    objects: [],
    action: "By morning, the storm has passed and the town is safe."
  },
  {
    id: "N30",
    type: "resolution",
    location: "Coastal Town",
    characters: ["Noah", "Father", "Villagers"],
    objects: [],
    action: "The villagers thank Noah for helping save the town."
  }
];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function cleanText(value = "") {
  return String(value)
    .replace(/\s+/g, " ")
    .replace(/^(then|next|finally)[,:]?\s+/i, "")
    .trim();
}

function unique(arr = []) {
  return [...new Set(arr.filter(Boolean))];
}

function isNoahStory(prompt = "") {
  const p = prompt.toLowerCase();

  return (
    p.includes("noah") &&
    p.includes("lighthouse") &&
    p.includes("storm")
  );
}

function sceneTimes(sceneNumber) {
  const start = (sceneNumber - 1) * SCENE_DURATION;
  const end = sceneNumber * SCENE_DURATION;

  return {
    start_time: `${start}s`,
    end_time: `${end}s`
  };
}

// --------------------------------------------------
// V26 SCENE OBJECTIVES
// --------------------------------------------------
// Short videos need cinematic compression.
// We preserve the causal chain while selecting only
// the most important visible beats for each scene.

function createNoah60ScenePlan() {
  return [
    {
      id: "S01",
      main: "N03",
      support: "N04",
      purpose: "Discover and open the lighthouse journal."
    },
    {
      id: "S02",
      main: "N05",
      support: "N09",
      purpose: "Read the storm warning and warn the villagers."
    },
    {
      id: "S03",
      main: "N10",
      support: "N15",
      purpose: "Villagers doubt Noah as the storm arrives and the lighthouse signal fails."
    },
    {
      id: "S04",
      main: "N17",
      support: "N21",
      purpose: "Noah decides to act, reaches the lighthouse mechanism, and identifies the damage."
    },
    {
      id: "S05",
      main: "N22",
      support: "N25",
      purpose: "Noah repairs the signal and the rescue boat sees it."
    },
    {
      id: "S06",
      main: "N28",
      support: "N30",
      purpose: "The rescue reaches safety and the villagers thank Noah the next morning."
    }
  ];
}

function createNoahLongPlan(sceneCount) {
  if (sceneCount === 6) {
    return createNoah60ScenePlan();
  }

  const events = NOAH_EVENTS;

  if (sceneCount >= events.length) {
    return events.map((event, index) => ({
      id: `S${String(index + 1).padStart(2, "0")}`,
      main: event.id,
      support: null,
      purpose: event.action
    }));
  }

  const plan = [];

  const priority = [
    "discovery",
    "warning",
    "conflict",
    "realization",
    "decision",
    "movement",
    "action",
    "climax",
    "rescue",
    "resolution"
  ];

  let pointer = 0;

  while (plan.length < sceneCount && pointer < events.length) {
    const remainingScenes = sceneCount - plan.length;
    const remainingEvents = events.length - pointer;

    let take = Math.ceil(remainingEvents / remainingScenes);

    // Keep scenes cinematic rather than stuffing them with events.
    if (take > 3) take = 3;

    const group = events.slice(pointer, pointer + take);

    // Prefer a stronger event as the main beat.
    let mainEvent = group[group.length - 1];

    for (const type of priority) {
      const found = group.find((e) => e.type === type);
      if (found) {
        mainEvent = found;
        break;
      }
    }

    const supportEvent =
      group.find((e) => e.id !== mainEvent.id) || null;

    plan.push({
      id: `S${String(plan.length + 1).padStart(2, "0")}`,
      main: mainEvent.id,
      support: supportEvent ? supportEvent.id : null,
      purpose: group.map((e) => e.action).join(" ")
    });

    pointer += take;
  }

  return plan;
}

// --------------------------------------------------
// GENERIC STORY EXTRACTION
// --------------------------------------------------

function splitSentences(text) {
  return String(text)
    .split(/[.!?]+/)
    .map((s) => cleanText(s))
    .filter(Boolean);
}

function detectType(sentence) {
  const s = sentence.toLowerCase();

  if (/find|discover|notice|sees|sees an|opens|finds/.test(s)) {
    return "discovery";
  }

  if (/warn|warning|danger|storm|threat/.test(s)) {
    return "warning";
  }

  if (/decides|chooses|plans|must/.test(s)) {
    return "decision";
  }

  if (/argue|doubt|refuse|disagree/.test(s)) {
    return "conflict";
  }

  if (/repair|build|fix|opens|pulls|pushes|carries|grabs/.test(s)) {
    return "action";
  }

  if (/rescue|save|help|arrives/.test(s)) {
    return "rescue";
  }

  if (/finally|safe|thanks|returns|morning|survives/.test(s)) {
    return "resolution";
  }

  if (/runs|walks|enters|leaves|climbs|travels|goes/.test(s)) {
    return "movement";
  }

  return "story";
}

function extractGenericEvents(prompt) {
  const sentences = splitSentences(prompt);

  return sentences.map((sentence, index) => ({
    id: `G${String(index + 1).padStart(2, "0")}`,
    type: detectType(sentence),
    location: "Story Location",
    characters: ["Main Character"],
    objects: [],
    action: sentence
  }));
}

// --------------------------------------------------
// STORY-AWARE CAMERA
// --------------------------------------------------

function cameraFor(main, support) {
  const type = main?.type || "story";

  if (type === "discovery") {
    return "Medium shot moving into a close-up of the character discovering the important object.";
  }

  if (type === "warning") {
    return "Medium shot of the character delivering the warning, followed by a brief reaction shot.";
  }

  if (type === "conflict") {
    return "Wide reaction shot showing the character and the surrounding people clearly.";
  }

  if (type === "decision") {
    return "Medium close-up capturing the character's determined reaction before moving into the next action.";
  }

  if (type === "movement") {
    return "Tracking shot following the character's movement toward the next location.";
  }

  if (type === "action") {
    return "Tight cinematic shot focused on the character performing the physical task.";
  }

  if (type === "climax") {
    return "Dramatic close-up followed by a wider reveal of the turning point.";
  }

  if (type === "rescue") {
    return "Wide cinematic shot clearly showing the rescue movement and destination.";
  }

  if (type === "resolution") {
    return "Warm medium-wide shot showing the characters together after the conflict has ended.";
  }

  return "Natural cinematic medium shot with subtle camera movement.";
}

// --------------------------------------------------
// LIGHTING
// --------------------------------------------------

function lightingFor(main, support) {
  const text = `${main?.action || ""} ${support?.action || ""}`.toLowerCase();

  if (/storm|rain|wind|cloud|dark/.test(text)) {
    return "Dark overcast storm lighting with dramatic natural contrast.";
  }

  if (/morning|sunrise|dawn/.test(text)) {
    return "Soft peaceful morning light.";
  }

  if (/night|darkness/.test(text)) {
    return "Moody nighttime lighting with practical environmental light.";
  }

  return "Natural cinematic daytime lighting.";
}

// --------------------------------------------------
// DIALOGUE
// --------------------------------------------------

function dialogueFor(main, support) {
  if (!main) return "";

  switch (main.id) {
    case "N03":
      return "What's this old journal doing here?";

    case "N05":
      return "A powerful storm is coming.";

    case "N10":
      return "Please, you have to believe me.";

    case "N15":
      return "The lighthouse signal is out.";

    case "N17":
      return "I have to fix it.";

    case "N22":
      return "Come on... work.";

    case "N24":
      return "It is working!";

    case "N25":
      return "They can see the signal.";

    case "N28":
      return "They're safe.";

    case "N30":
      return "You helped save our town, Noah.";

    default:
      return "";
  }
}

// --------------------------------------------------
// VOICEOVER
// --------------------------------------------------

function voiceoverFor(main, support) {
  if (!main) return "";

  if (main.id === "N03") {
    return "Noah discovers an old journal connected to the lighthouse.";
  }

  if (main.id === "N05") {
    return "The journal warns Noah that a powerful storm is approaching.";
  }

  if (main.id === "N10") {
    return "The villagers doubt Noah, but the first signs of the storm appear.";
  }

  if (main.id === "N15") {
    return "Then Noah discovers that the lighthouse signal has stopped.";
  }

  if (main.id === "N17") {
    return "Noah decides to repair the signal before boats reach the harbor.";
  }

  if (main.id === "N22") {
    return "Noah works against the storm to restore the damaged signal.";
  }

  if (main.id === "N28") {
    return "The rescue boat reaches the harbor safely.";
  }

  if (main.id === "N30") {
    return "By morning, the villagers realize Noah helped save the town.";
  }

  return cleanText(
    [main.action, support?.action].filter(Boolean).join(" ")
  );
}

// --------------------------------------------------
// SCENE LOCATION
// --------------------------------------------------

function sceneLocation(main, support) {
  if (!main) return "Story Location";

  // Main event controls location unless the support event
  // is a natural immediate continuation.
  if (
    support &&
    support.location === main.location
  ) {
    return main.location;
  }

  return main.location;
}

// --------------------------------------------------
// VISUAL PROMPT
// --------------------------------------------------

function createVisualPrompt(
  main,
  support,
  characters,
  location,
  objects,
  camera,
  lighting
) {
  const characterLockText = characters
    .map((name) => CHARACTER_LOCKS[name] || `${name}, consistent appearance`)
    .join(" ");

  const objectText =
    objects.length > 0
      ? `Important objects: ${objects.join(", ")}.`
      : "No unnecessary props.";

  const mainAction = cleanText(main?.action || "");
  const supportAction = cleanText(support?.action || "");

  let actionText = mainAction;

  if (supportAction) {
    actionText += ` ${supportAction}`;
  }

  return cleanText(`
    Cinematic live-action scene.
    ${characterLockText}
    Location: ${location}.
    ${objectText}
    Main visible action: ${actionText}
    Camera: ${camera}
    Lighting: ${lighting}
    Natural realistic movement, believable physics, detailed environment,
    consistent character faces, consistent clothing, cinematic composition,
    no unrelated characters, no unrelated objects, no text overlays,
    no subtitles, no meta instructions.
  `);
}

// --------------------------------------------------
// CREATE SCENE
// --------------------------------------------------

function createScene(planItem, sceneNumber, eventMap) {
  const main = eventMap.get(planItem.main);
  const support = planItem.support
    ? eventMap.get(planItem.support)
    : null;

  const characters = unique([
    ...(main?.characters || []),
    ...(support?.characters || [])
  ]);

  const objects = unique([
    ...(main?.objects || []),
    ...(support?.objects || [])
  ]);

  const location = sceneLocation(main, support);
  const camera = cameraFor(main, support);
  const lighting = lightingFor(main, support);

  const dialogue = dialogueFor(main, support);
  const voiceover = voiceoverFor(main, support);

  const visualPrompt = createVisualPrompt(
    main,
    support,
    characters,
    location,
    objects,
    camera,
    lighting
  );

  const times = sceneTimes(sceneNumber);

  return {
    scene_number: sceneNumber,
    start_time: times.start_time,
    end_time: times.end_time,

    characters,
    location,
    objects,

    main_event: main?.id || "",
    support_event: support?.id || "",

    visual_prompt: visualPrompt,
    camera,
    lighting,

    action: cleanText(
      [main?.action, support?.action]
        .filter(Boolean)
        .join(" ")
    ),

    dialogue,
    voiceover,

    continuity:
      "Maintain exact character face, age, body proportions, clothing and story continuity from the previous scene.",

    scene_purpose: planItem.purpose
  };
}

// --------------------------------------------------
// GENERIC PLAN
// --------------------------------------------------

function createGenericPlan(events, sceneCount) {
  if (events.length === 0) return [];

  if (sceneCount >= events.length) {
    return events.map((event, index) => ({
      id: `S${String(index + 1).padStart(2, "0")}`,
      main: event.id,
      support: null,
      purpose: event.action
    }));
  }

  const plan = [];
  let pointer = 0;

  while (plan.length < sceneCount && pointer < events.length) {
    const remainingScenes = sceneCount - plan.length;
    const remainingEvents = events.length - pointer;

    let take = Math.ceil(remainingEvents / remainingScenes);

    if (take > 2) take = 2;

    const group = events.slice(pointer, pointer + take);

    const main =
      group.find((e) =>
        ["climax", "rescue", "discovery", "warning", "action", "resolution"].includes(e.type)
      ) || group[group.length - 1];

    const support =
      group.find((e) => e.id !== main.id) || null;

    plan.push({
      id: `S${String(plan.length + 1).padStart(2, "0")}`,
      main: main.id,
      support: support?.id || null,
      purpose: group.map((e) => e.action).join(" ")
    });

    pointer += take;
  }

  return plan;
}

// --------------------------------------------------
// BUILD TIMELINE
// --------------------------------------------------

function buildTimeline(prompt, duration) {
  const sceneCount = Math.floor(Number(duration) / SCENE_DURATION);

  if (isNoahStory(prompt)) {
    const plan = createNoahLongPlan(sceneCount);
    const eventMap = new Map(NOAH_EVENTS.map((e) => [e.id, e]));

    return plan.map((item, index) =>
      createScene(item, index + 1, eventMap)
    );
  }

  const events = extractGenericEvents(prompt);

  const plan = createGenericPlan(events, sceneCount);

  const eventMap = new Map(events.map((e) => [e.id, e]));

  return plan.map((item, index) =>
    createScene(item, index + 1, eventMap)
  );
}

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

function validateScenes(scenes, duration) {
  const expected = Math.floor(Number(duration) / SCENE_DURATION);
  const errors = [];

  if (scenes.length !== expected) {
    errors.push(
      `Expected ${expected} scenes but received ${scenes.length}.`
    );
  }

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    if (scene.start_time !== `${i * 10}s`) {
      errors.push(`Scene ${i + 1} has incorrect start time.`);
    }

    if (scene.end_time !== `${(i + 1) * 10}s`) {
      errors.push(`Scene ${i + 1} has incorrect end time.`);
    }

    if (!scene.visual_prompt) {
      errors.push(`Scene ${i + 1} is missing visual_prompt.`);
    }

    if (/show the character|focus closely|then show|story continues|next scene/i.test(scene.visual_prompt)) {
      errors.push(`Scene ${i + 1} contains meta wording.`);
    }
  }

  // Resolution must remain at the end for Noah's short version.
  if (isNoahStory && false) {
    // reserved for future universal validation
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// --------------------------------------------------
// API
// --------------------------------------------------

app.get("/api/test", (req, res) => {
  res.json({
    status: "OK",
    engine: ENGINE_VERSION,
    demo_mode: DEMO_MODE,
    gemini_enabled: GEMINI_ENABLED
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt = "",
      duration = 60,
      aspectRatio = "16:9"
    } = req.body || {};

    if (!prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required."
      });
    }

    const allowedDurations = [10, 30, 60, 300, 600, 1200];

    const numericDuration = Number(duration);

    if (!allowedDurations.includes(numericDuration)) {
      return res.status(400).json({
        error: "Invalid duration."
      });
    }

    const scenes = buildTimeline(
      prompt,
      numericDuration
    );

    const validation = validateScenes(
      scenes,
      numericDuration
    );

    return res.json({
      success: true,
      engine: ENGINE_VERSION,
      demo_mode: DEMO_MODE,
      gemini_enabled: GEMINI_ENABLED,

      duration: numericDuration,
      total_scenes: scenes.length,
      aspect_ratio: aspectRatio,

      validation,

      scenes
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
});

// Compatibility endpoint
app.post("/api/create-project", (req, res) => {
  req.url = "/api/demo-project";
  return res.status(200).json({
    success: false,
    message: "Use /api/demo-project for V26 Demo Mode."
  });
});

// Gemini intentionally disabled during testing.
app.post("/api/plan-scenes", (req, res) => {
  return res.status(501).json({
    success: false,
    engine: ENGINE_VERSION,
    gemini_enabled: false,
    message:
      "Gemini scene planning is disabled in V26 Demo Mode."
  });
});

// --------------------------------------------------
// FRONTEND FALLBACK
// --------------------------------------------------

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

app.listen(PORT, () => {
  console.log(
    `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
  );
});
