import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "V28";
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
    "Noah, 14-year-old boy, slim build, short slightly messy brown hair, blue eyes, navy blue hoodie, dark jeans, white sneakers. Keep exactly the same face, age, hairstyle, body proportions and clothing in every scene.",

  Father:
    "Noah's father, middle-aged man, average build, short dark hair with some gray, trimmed beard, brown work jacket and dark trousers. Keep exactly the same appearance.",

  Villagers:
    "Coastal town villagers in practical everyday clothing. Keep their appearance consistent.",

  RescueCrew:
    "Professional coastal rescue crew wearing bright weatherproof rescue jackets and safety gear. Keep their appearance consistent."
};

// --------------------------------------------------
// NOAH ATOMIC STORY EVENTS
// --------------------------------------------------

const NOAH_EVENTS = [
  {
    id: "N01",
    type: "setup",
    location: "Coastal Town",
    action: "Noah lives with his father in a small coastal town.",
    characters: ["Noah", "Father"]
  },
  {
    id: "N02",
    type: "movement",
    location: "Father's Workshop",
    action: "Noah enters his father's workshop one morning.",
    characters: ["Noah"]
  },
  {
    id: "N03",
    type: "discovery",
    location: "Father's Workshop",
    action: "Noah discovers an old lighthouse journal on the workbench.",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"]
  },
  {
    id: "N04",
    type: "discovery",
    location: "Father's Workshop",
    action: "Noah opens the lighthouse journal and begins reading it.",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"]
  },
  {
    id: "N05",
    type: "warning",
    location: "Father's Workshop",
    action: "Noah reads a warning about a powerful storm approaching the town.",
    characters: ["Noah"],
    objects: ["Lighthouse Journal", "Storm Warning"]
  },
  {
    id: "N06",
    type: "decision",
    location: "Father's Workshop",
    action: "Noah realizes the warning could put the town in danger.",
    characters: ["Noah"]
  },
  {
    id: "N07",
    type: "movement",
    location: "Coastal Town",
    action: "Noah leaves the workshop to warn the villagers.",
    characters: ["Noah"]
  },
  {
    id: "N08",
    type: "warning",
    location: "Coastal Town",
    action: "Noah tells the villagers that a powerful storm is approaching.",
    characters: ["Noah", "Villagers"]
  },
  {
    id: "N09",
    type: "conflict",
    location: "Coastal Town",
    action: "The villagers doubt Noah's warning.",
    characters: ["Noah", "Villagers"]
  },
  {
    id: "N10",
    type: "realization",
    location: "Coastal Town",
    action: "Noah notices dark clouds gathering over the town.",
    characters: ["Noah", "Villagers"]
  },
  {
    id: "N11",
    type: "conflict",
    location: "Coastal Town",
    action: "Strong wind begins sweeping through the coastal town.",
    characters: ["Noah", "Villagers"]
  },
  {
    id: "N12",
    type: "movement",
    location: "Coastal Town",
    action: "Rain begins as the approaching storm reaches the town.",
    characters: ["Noah", "Villagers"]
  },
  {
    id: "N13",
    type: "realization",
    location: "Coastal Town",
    action: "Noah looks toward the lighthouse during the worsening storm.",
    characters: ["Noah"]
  },
  {
    id: "N14",
    type: "realization",
    location: "Coastal Town",
    action: "Noah notices that the lighthouse signal has stopped working.",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"]
  },
  {
    id: "N15",
    type: "decision",
    location: "Coastal Town",
    action: "Noah decides to repair the lighthouse signal before boats reach the harbor.",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"]
  },
  {
    id: "N16",
    type: "movement",
    location: "Road to Lighthouse",
    action: "Noah runs through the storm toward the lighthouse.",
    characters: ["Noah"]
  },
  {
    id: "N17",
    type: "movement",
    location: "Lighthouse Exterior",
    action: "Noah reaches the lighthouse and enters it.",
    characters: ["Noah"]
  },
  {
    id: "N18",
    type: "movement",
    location: "Lighthouse Stairway",
    action: "Noah climbs the lighthouse stairs toward the signal room.",
    characters: ["Noah"]
  },
  {
    id: "N19",
    type: "movement",
    location: "Lighthouse Signal Room",
    action: "Noah reaches the lighthouse signal room.",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"]
  },
  {
    id: "N20",
    type: "realization",
    location: "Lighthouse Signal Room",
    action: "Noah examines the damaged lighthouse signal mechanism.",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"]
  },
  {
    id: "N21",
    type: "decision",
    location: "Lighthouse Signal Room",
    action: "Noah prepares the repair tools and gets ready to fix the mechanism.",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"]
  },
  {
    id: "N22",
    type: "action",
    location: "Lighthouse Signal Room",
    action: "Noah begins repairing the damaged signal mechanism.",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"]
  },
  {
    id: "N23",
    type: "action",
    location: "Lighthouse Signal Room",
    action: "Noah continues working carefully on the damaged mechanism.",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"]
  },
  {
    id: "N24",
    type: "climax",
    location: "Lighthouse Signal Room",
    action: "The lighthouse signal turns back on.",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"]
  },
  {
    id: "N25",
    type: "realization",
    location: "Lighthouse Signal Room",
    action: "Noah sees the restored lighthouse beam cutting through the storm.",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"]
  },
  {
    id: "N26",
    type: "rescue",
    location: "Open Water",
    action: "A rescue boat sees the restored lighthouse signal.",
    characters: ["RescueCrew"],
    objects: ["Rescue Boat", "Lighthouse Signal"]
  },
  {
    id: "N27",
    type: "rescue",
    location: "Open Water",
    action: "The rescue boat follows the lighthouse signal toward the harbor.",
    characters: ["RescueCrew"],
    objects: ["Rescue Boat", "Lighthouse Signal"]
  },
  {
    id: "N28",
    type: "rescue",
    location: "Harbor",
    action: "The rescue boat reaches the harbor safely.",
    characters: ["RescueCrew", "Noah"],
    objects: ["Rescue Boat"]
  },
  {
    id: "N29",
    type: "resolution",
    location: "Coastal Town",
    action: "By morning, the storm has passed and the town is safe.",
    characters: ["Noah", "Father", "Villagers"]
  },
  {
    id: "N30",
    type: "resolution",
    location: "Coastal Town",
    action: "The villagers thank Noah for helping save the town.",
    characters: ["Noah", "Father", "Villagers"]
  }
];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function sceneTimes(sceneNumber) {
  const start = (sceneNumber - 1) * SCENE_DURATION;
  const end = start + SCENE_DURATION;

  return {
    start_time: `${start}s`,
    end_time: `${end}s`
  };
}

function isNoahStory(prompt) {
  const text = String(prompt || "").toLowerCase();

  return (
    text.includes("noah") &&
    text.includes("lighthouse") &&
    text.includes("storm")
  );
}

// --------------------------------------------------
// V28 — EXACT 6-SCENE NOAH PLAN
// --------------------------------------------------

function createNoah60Plan() {
  return [
    {
      scene: 1,
      main: "N03",
      support: ["N04"]
    },
    {
      scene: 2,
      main: "N08",
      support: ["N05", "N09"]
    },
    {
      scene: 3,
      main: "N10",
      support: ["N11", "N12", "N14"]
    },
    {
      scene: 4,
      main: "N19",
      support: ["N20"]
    },
    {
      scene: 5,
      main: "N22",
      support: ["N23", "N24"]
    },
    {
      scene: 6,
      main: "N28",
      support: ["N29", "N30"]
    }
  ];
}

// --------------------------------------------------
// EVENT LOOKUP
// --------------------------------------------------

function getEvent(id) {
  return NOAH_EVENTS.find((event) => event.id === id);
}

// --------------------------------------------------
// SCENE LOCATION ENGINE
// --------------------------------------------------

function getSceneLocation(mainEvent, supportEvents) {
  const type = mainEvent.type;

  if (mainEvent.id === "N08" || mainEvent.id === "N09") {
    return "Coastal Town";
  }

  if (
    mainEvent.id === "N10" ||
    mainEvent.id === "N14" ||
    mainEvent.id === "N15"
  ) {
    return "Coastal Town";
  }

  if (
    mainEvent.id === "N19" ||
    mainEvent.id === "N20" ||
    mainEvent.id === "N21" ||
    mainEvent.id === "N22" ||
    mainEvent.id === "N23" ||
    mainEvent.id === "N24"
  ) {
    return "Lighthouse Signal Room";
  }

  if (mainEvent.id === "N28") {
    return "Harbor";
  }

  if (mainEvent.id === "N29" || mainEvent.id === "N30") {
    return "Coastal Town";
  }

  if (type === "movement") {
    return mainEvent.location;
  }

  return mainEvent.location;
}

// --------------------------------------------------
// CAMERA ENGINE
// --------------------------------------------------

function cameraFor(mainEvent, sceneNumber) {
  switch (mainEvent.type) {
    case "discovery":
      return "Slow cinematic push-in from a medium shot to a close-up of the important object.";

    case "warning":
      return "Medium shot on the main character speaking, followed by a brief reaction shot of the people listening.";

    case "conflict":
      return "Medium-wide reaction shot showing the main character facing the doubtful villagers.";

    case "realization":
      return "Focused cinematic close-up on the main character's reaction, followed by a view of the important story detail.";

    case "decision":
      return "Medium close-up showing the main character making a determined decision.";

    case "movement":
      return "Smooth cinematic tracking shot following the main character's movement.";

    case "action":
      return "Tight cinematic close-up focused on the character's hands performing the physical task.";

    case "climax":
      return "Dramatic close-up followed by a wider reveal showing the restored lighthouse signal.";

    case "rescue":
      return "Wide cinematic shot clearly showing the rescue boat moving safely toward the harbor.";

    case "resolution":
      return "Wide emotional cinematic shot showing the characters together after the danger has passed.";

    default:
      return "Natural cinematic medium shot with controlled camera movement.";
  }
}

// --------------------------------------------------
// LIGHTING ENGINE
// --------------------------------------------------

function lightingFor(mainEvent, supportEvents, sceneNumber) {
  const allText = [
    mainEvent.action,
    ...supportEvents.map((event) => event.action)
  ]
    .join(" ")
    .toLowerCase();

  if (mainEvent.id === "N03" || mainEvent.id === "N04") {
    return "Natural calm morning daylight entering the workshop through the windows.";
  }

  if (mainEvent.id === "N08") {
    return "Overcast daytime lighting with the first signs of approaching storm clouds.";
  }

  if (mainEvent.id === "N10") {
    return "Darkening overcast daylight as storm clouds gather over the coastal town.";
  }

  if (
    mainEvent.id === "N22" ||
    mainEvent.id === "N23" ||
    mainEvent.id === "N24"
  ) {
    return "Dark storm lighting with strong contrast, rain visible outside, and realistic wet reflections.";
  }

  if (mainEvent.id === "N28") {
    return "Soft early morning light after the storm, with calm water and a peaceful atmosphere.";
  }

  if (mainEvent.id === "N29" || mainEvent.id === "N30") {
    return "Warm golden morning light after the storm, creating a calm emotional atmosphere.";
  }

  if (
    allText.includes("storm") ||
    allText.includes("rain") ||
    allText.includes("wind")
  ) {
    return "Dark overcast storm lighting with realistic rain, strong natural contrast, and wet environmental reflections.";
  }

  return "Natural cinematic daytime lighting appropriate to the current story moment.";
}

// --------------------------------------------------
// DIALOGUE ENGINE
// --------------------------------------------------

function dialogueFor(sceneNumber) {
  const dialogue = {
    1: "What's this old journal doing here?",
    2: "A powerful storm is coming. Please listen to me.",
    3: "The storm is getting worse. Look at the lighthouse.",
    4: "I have to fix the signal before the boats arrive.",
    5: "Come on... work.",
    6: "They're safe."
  };

  return dialogue[sceneNumber] || "";
}

// --------------------------------------------------
// VOICEOVER ENGINE
// --------------------------------------------------

function voiceoverFor(sceneNumber) {
  const voiceover = {
    1: "Noah discovers an old lighthouse journal in his father's workshop.",
    2: "The journal warns Noah about a powerful storm, so he rushes to warn the villagers.",
    3: "The villagers doubt him as the storm grows stronger and the lighthouse signal fails.",
    4: "Noah reaches the lighthouse and examines the damaged signal mechanism.",
    5: "Working quickly through the storm, Noah repairs the signal and restores its light.",
    6: "The rescue boat reaches the harbor safely, and by morning the grateful villagers thank Noah."
  };

  return voiceover[sceneNumber] || "";
}

// --------------------------------------------------
// ACTION ENGINE
// --------------------------------------------------

function createSceneAction(mainEvent, supportEvents, sceneNumber) {
  if (sceneNumber === 1) {
    return "Noah discovers an old lighthouse journal on the workbench and opens it to read.";
  }

  if (sceneNumber === 2) {
    return "Noah warns the villagers about the powerful storm, but they doubt his warning.";
  }

  if (sceneNumber === 3) {
    return "Dark clouds gather, strong wind and rain reach the town, and Noah notices the lighthouse signal has stopped working.";
  }

  if (sceneNumber === 4) {
    return "Noah reaches the lighthouse signal room and carefully examines the damaged mechanism.";
  }

  if (sceneNumber === 5) {
    return "Noah repairs the damaged signal mechanism, and the lighthouse beam turns back on through the storm.";
  }

  if (sceneNumber === 6) {
    return "The rescue boat reaches the harbor safely, and by morning the villagers thank Noah for helping save the town.";
  }

  return cleanText(
    [mainEvent.action, ...supportEvents.map((event) => event.action)].join(" ")
  );
}

// --------------------------------------------------
// VISUAL PROMPT
// --------------------------------------------------

function createVisualPrompt({
  sceneNumber,
  location,
  characters,
  objects,
  action,
  camera,
  lighting
}) {
  const characterText = characters
    .map((character) => CHARACTER_LOCKS[character] || character)
    .join(" ");

  const objectText = objects.length
    ? `Important visible objects: ${objects.join(", ")}.`
    : "No unnecessary props.";

  return [
    "Cinematic live-action movie scene.",
    characterText,
    `Location: ${location}.`,
    objectText,
    `Visible action: ${action}`,
    `Camera: ${camera}`,
    `Lighting: ${lighting}`,
    "Realistic human movement, believable physics, natural facial expressions, cinematic depth of field, detailed environment, realistic weather and atmosphere.",
    "Keep the story visually continuous with the previous scene.",
    "Only show elements relevant to this scene.",
    "No unrelated characters.",
    "No unrelated props.",
    "No text overlays.",
    "No subtitles.",
    "No logos.",
    "No meta instructions."
  ].join(" ");
}

// --------------------------------------------------
// BUILD NOAH SCENES
// --------------------------------------------------

function buildNoahScenes() {
  const plan = createNoah60Plan();

  return plan.map((item) => {
    const mainEvent = getEvent(item.main);
    const supportEvents = item.support.map(getEvent).filter(Boolean);

    const sceneNumber = item.scene;
    const location = getSceneLocation(mainEvent, supportEvents);

    const characters = unique([
      ...mainEvent.characters,
      ...supportEvents.flatMap((event) => event.characters || [])
    ]);

    const objects = unique([
      ...(mainEvent.objects || []),
      ...supportEvents.flatMap((event) => event.objects || [])
    ]);

    const action = createSceneAction(
      mainEvent,
      supportEvents,
      sceneNumber
    );

    const camera = cameraFor(mainEvent, sceneNumber);
    const lighting = lightingFor(
      mainEvent,
      supportEvents,
      sceneNumber
    );

    const visualPrompt = createVisualPrompt({
      sceneNumber,
      location,
      characters,
      objects,
      action,
      camera,
      lighting
    });

    const times = sceneTimes(sceneNumber);

    return {
      scene_number: sceneNumber,
      start_time: times.start_time,
      end_time: times.end_time,
      visual_prompt: visualPrompt,
      camera,
      lighting,
      action,
      dialogue: dialogueFor(sceneNumber),
      voiceover: voiceoverFor(sceneNumber),
      continuity:
        "Keep the exact same character face, age, hairstyle, body proportions, clothing and important story objects consistent with previous scenes."
    };
  });
}

// --------------------------------------------------
// GENERIC STORY ENGINE
// --------------------------------------------------

function extractGenericEvents(prompt) {
  const sentences = cleanText(prompt)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  return sentences.map((sentence, index) => ({
    id: `G${String(index + 1).padStart(2, "0")}`,
    type:
      index === 0
        ? "setup"
        : index === sentences.length - 1
        ? "resolution"
        : "action",
    location: "Story Environment",
    action: sentence,
    characters: ["Main Character"],
    objects: []
  }));
}

function buildGenericScenes(prompt, requiredScenes) {
  const events = extractGenericEvents(prompt);

  if (!events.length) {
    return [];
  }

  const scenes = [];

  for (let i = 0; i < requiredScenes; i++) {
    const eventIndex = Math.min(
      Math.floor((i * events.length) / requiredScenes),
      events.length - 1
    );

    const event = events[eventIndex];

    const times = sceneTimes(i + 1);

    const camera = cameraFor(event, i + 1);
    const lighting = lightingFor(event, [], i + 1);

    const visualPrompt = createVisualPrompt({
      sceneNumber: i + 1,
      location: event.location,
      characters: event.characters,
      objects: event.objects,
      action: event.action,
      camera,
      lighting
    });

    scenes.push({
      scene_number: i + 1,
      start_time: times.start_time,
      end_time: times.end_time,
      visual_prompt: visualPrompt,
      camera,
      lighting,
      action: event.action,
      dialogue: "",
      voiceover: event.action,
      continuity:
        "Maintain consistent character identity, appearance, clothing, environment and story objects throughout the video."
    });
  }

  return scenes;
}

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

function validateScenes(scenes, duration) {
  const expectedScenes = Math.floor(duration / SCENE_DURATION);

  if (scenes.length !== expectedScenes) {
    throw new Error(
      `Scene count mismatch. Expected ${expectedScenes}, received ${scenes.length}.`
    );
  }

  for (let i = 0; i < scenes.length; i++) {
    const expectedStart = `${i * SCENE_DURATION}s`;
    const expectedEnd = `${(i + 1) * SCENE_DURATION}s`;

    if (
      scenes[i].start_time !== expectedStart ||
      scenes[i].end_time !== expectedEnd
    ) {
      throw new Error(`Invalid timing in scene ${i + 1}.`);
    }
  }

  return true;
}

// --------------------------------------------------
// PROJECT CREATOR
// --------------------------------------------------

function createProject({ prompt, duration, aspectRatio }) {
  const durationNumber = Number(duration);

  if (![10, 30, 60, 300, 600, 1200].includes(durationNumber)) {
    throw new Error("Unsupported duration.");
  }

  const totalScenes = durationNumber / SCENE_DURATION;

  let scenes;

  if (isNoahStory(prompt) && durationNumber === 60) {
    scenes = buildNoahScenes();
  } else if (isNoahStory(prompt) && durationNumber === 30) {
    const full = buildNoahScenes();
    scenes = full.slice(0, 3);
  } else if (isNoahStory(prompt) && durationNumber === 10) {
    const full = buildNoahScenes();
    scenes = full.slice(0, 1);
  } else {
    scenes = buildGenericScenes(prompt, totalScenes);
  }

  validateScenes(scenes, durationNumber);

  return {
    success: true,
    engine_version: ENGINE_VERSION,
    demo_mode: DEMO_MODE,
    gemini_enabled: GEMINI_ENABLED,
    duration: durationNumber,
    total_scenes: totalScenes,
    aspect_ratio: aspectRatio,
    scenes
  };
}

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message: "SANAPTAI backend is working.",
    engine_version: ENGINE_VERSION,
    demo_mode: DEMO_MODE,
    gemini_enabled: GEMINI_ENABLED,
    timestamp: new Date().toISOString()
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt,
      duration = 60,
      aspectRatio = "16:9"
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        success: false,
        error: "Video prompt is required."
      });
    }

    const project = createProject({
      prompt: String(prompt).trim(),
      duration,
      aspectRatio
    });

    res.json(project);
  } catch (error) {
    console.error("Project creation error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/create-project", (req, res) => {
  try {
    const {
      prompt,
      duration = 60,
      aspectRatio = "16:9"
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        success: false,
        error: "Video prompt is required."
      });
    }

    const project = createProject({
      prompt: String(prompt).trim(),
      duration,
      aspectRatio
    });

    res.json(project);
  } catch (error) {
    console.error("Project creation error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Gemini deliberately disabled during testing.
app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    success: false,
    message:
      "Gemini scene planning is temporarily disabled. SANAPTAI V28 is running in Demo Mode.",
    engine_version: ENGINE_VERSION,
    gemini_enabled: GEMINI_ENABLED
  });
});

// --------------------------------------------------
// EXPRESS 5 SAFE FALLBACK
// --------------------------------------------------

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
  );
});
