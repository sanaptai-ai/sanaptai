import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "V29";
const DEMO_MODE = true;
const GEMINI_ENABLED = false;
const SCENE_DURATION = 10;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ==================================================
// CHARACTER LOCKS
// ==================================================

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

// ==================================================
// ATOMIC NOAH EVENTS
// ==================================================

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
    type: "realization",
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

function getEvent(id) {
  return NOAH_EVENTS.find((event) => event.id === id);
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function sceneTimes(sceneNumber) {
  return {
    start_time: `${(sceneNumber - 1) * 10}s`,
    end_time: `${sceneNumber * 10}s`
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

// ==================================================
// V29 — 10 SECOND SCENE BUDGET
// ==================================================

function createNoah60Plan() {
  return [
    {
      scene: 1,
      events: ["N03", "N04"],
      location: "Father's Workshop"
    },

    {
      scene: 2,
      events: ["N08", "N09"],
      location: "Coastal Town"
    },

    {
      scene: 3,
      events: ["N10", "N11", "N12", "N14"],
      location: "Coastal Town"
    },

    {
      scene: 4,
      events: ["N16", "N17", "N18", "N19", "N20"],
      location: "Lighthouse Signal Room"
    },

    {
      scene: 5,
      events: ["N21", "N22", "N23", "N24", "N25"],
      location: "Lighthouse Signal Room"
    },

    {
      scene: 6,
      events: ["N26", "N27", "N28"],
      location: "Harbor"
    }
  ];
}

// ==================================================
// ACTION BUDGET
// ==================================================

function createSceneAction(sceneNumber) {
  const actions = {
    1:
      "Noah discovers an old lighthouse journal on the workbench and opens it to read.",

    2:
      "Noah warns the villagers about the powerful storm, but they doubt his warning.",

    3:
      "Dark clouds gather, strong wind and rain reach the town, and Noah notices the lighthouse signal has stopped working.",

    4:
      "Noah reaches the lighthouse signal room and examines the damaged mechanism.",

    5:
      "Noah prepares his tools, repairs the damaged mechanism, and restores the lighthouse signal.",

    6:
      "The rescue boat follows the restored signal and reaches the harbor safely."
  };

  return actions[sceneNumber];
}

// ==================================================
// CAMERA ENGINE
// ==================================================

function cameraFor(sceneNumber) {
  const cameras = {
    1:
      "Slow cinematic push-in from a medium shot to a close-up of the lighthouse journal.",

    2:
      "Medium shot of Noah warning the villagers, followed by brief reaction shots showing their doubt.",

    3:
      "Wide establishing shot of the storm approaching, followed by a close-up of Noah looking toward the dark lighthouse.",

    4:
      "Smooth tracking shot as Noah reaches the signal room, followed by a tight inspection close-up of the damaged mechanism.",

    5:
      "Tight close-up of Noah's hands repairing the mechanism, followed by a dramatic reveal of the lighthouse beam turning back on.",

    6:
      "Wide cinematic harbor shot showing the rescue boat arriving safely beneath the restored lighthouse beam."
  };

  return cameras[sceneNumber];
}

// ==================================================
// LIGHTING ENGINE
// ==================================================

function lightingFor(sceneNumber) {
  const lighting = {
    1:
      "Natural calm morning daylight entering the workshop through the windows.",

    2:
      "Overcast daytime lighting with the first visible signs of approaching storm clouds.",

    3:
      "Darkening overcast daylight with strong wind, rain and realistic wet environmental reflections.",

    4:
      "Dark storm lighting inside the lighthouse with cool ambient light entering from the storm outside.",

    5:
      "Dark storm lighting with strong contrast, rain visible outside and the restored lighthouse beam creating a dramatic glow.",

    6:
      "Soft early morning light after the storm, calm water and a peaceful atmosphere."
  };

  return lighting[sceneNumber];
}

// ==================================================
// DIALOGUE
// ==================================================

function dialogueFor(sceneNumber) {
  const dialogue = {
    1: "What's this old journal doing here?",
    2: "A powerful storm is coming. Please listen to me.",
    3: "The storm is getting worse. Look at the lighthouse.",
    4: "I have to fix the signal before the boats arrive.",
    5: "Come on... work.",
    6: "They're safe."
  };

  return dialogue[sceneNumber];
}

// ==================================================
// VOICEOVER
// ==================================================

function voiceoverFor(sceneNumber) {
  const voiceover = {
    1:
      "Noah discovers an old lighthouse journal in his father's workshop.",

    2:
      "The warning sends Noah to the villagers, but they refuse to believe him.",

    3:
      "The storm intensifies, and Noah realizes the lighthouse signal has failed.",

    4:
      "Noah reaches the lighthouse and finds the signal mechanism damaged.",

    5:
      "Noah works quickly to repair the signal and restore its guiding light.",

    6:
      "The rescue boat safely reaches the harbor beneath the restored lighthouse beam."
  };

  return voiceover[sceneNumber];
}

// ==================================================
// VISUAL PROMPT
// ==================================================

function createVisualPrompt({
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
    : "Show only necessary story elements.";

  return [
    "Cinematic live-action movie scene.",
    characterText,
    `Location: ${location}.`,
    objectText,
    `Visible action: ${action}`,
    `Camera: ${camera}`,
    `Lighting: ${lighting}`,
    "Realistic human movement, believable physics, natural facial expressions, cinematic depth of field, detailed environment, realistic weather and atmosphere.",
    "Maintain exact visual continuity with previous scenes.",
    "Only show elements relevant to this scene.",
    "No unrelated characters.",
    "No unrelated props.",
    "No text overlays.",
    "No subtitles.",
    "No logos.",
    "No meta instructions."
  ].join(" ");
}

// ==================================================
// BUILD NOAH SCENES
// ==================================================

function buildNoahScenes() {
  const plan = createNoah60Plan();

  return plan.map((scenePlan) => {
    const sceneNumber = scenePlan.scene;

    const events = scenePlan.events
      .map(getEvent)
      .filter(Boolean);

    const mainEvent = events[0];

    const characters = unique(
      events.flatMap((event) => event.characters || [])
    );

    const objects = unique(
      events.flatMap((event) => event.objects || [])
    );

    const action = createSceneAction(sceneNumber);
    const camera = cameraFor(sceneNumber);
    const lighting = lightingFor(sceneNumber);

    const visualPrompt = createVisualPrompt({
      location: scenePlan.location,
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
        "Keep the exact same character face, age, hairstyle, body proportions, clothing and important story objects consistent throughout the entire video."
    };
  });
}

// ==================================================
// GENERIC STORY ENGINE
// ==================================================

function buildGenericScenes(prompt, requiredScenes) {
  const sentences = String(prompt || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  if (!sentences.length) {
    return [];
  }

  const scenes = [];

  for (let i = 0; i < requiredScenes; i++) {
    const index = Math.min(
      Math.floor((i * sentences.length) / requiredScenes),
      sentences.length - 1
    );

    const action = sentences[index];

    const times = sceneTimes(i + 1);

    const camera =
      "Natural cinematic camera movement appropriate to the current action.";

    const lighting =
      "Natural cinematic lighting appropriate to the current story moment.";

    const visualPrompt = createVisualPrompt({
      location: "Story Environment",
      characters: ["Main Character"],
      objects: [],
      action,
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
      action,
      dialogue: "",
      voiceover: action,
      continuity:
        "Maintain consistent character identity, appearance, clothing, environment and story objects throughout the video."
    });
  }

  return scenes;
}

// ==================================================
// VALIDATION ENGINE
// ==================================================

function validateScenes(scenes, duration) {
  const expectedScenes = duration / SCENE_DURATION;

  if (scenes.length !== expectedScenes) {
    throw new Error(
      `Expected ${expectedScenes} scenes but received ${scenes.length}.`
    );
  }

  for (let i = 0; i < scenes.length; i++) {
    const expectedStart = `${i * 10}s`;
    const expectedEnd = `${(i + 1) * 10}s`;

    if (
      scenes[i].start_time !== expectedStart ||
      scenes[i].end_time !== expectedEnd
    ) {
      throw new Error(`Invalid timing in Scene ${i + 1}.`);
    }

    if (!scenes[i].visual_prompt) {
      throw new Error(`Missing visual prompt in Scene ${i + 1}.`);
    }

    if (!scenes[i].action) {
      throw new Error(`Missing action in Scene ${i + 1}.`);
    }
  }

  return true;
}

// ==================================================
// PROJECT CREATOR
// ==================================================

function createProject({ prompt, duration, aspectRatio }) {
  const durationNumber = Number(duration);

  const allowedDurations = [
    10,
    30,
    60,
    300,
    600,
    1200
  ];

  if (!allowedDurations.includes(durationNumber)) {
    throw new Error("Unsupported duration.");
  }

  const totalScenes = durationNumber / SCENE_DURATION;

  let scenes;

  if (isNoahStory(prompt) && durationNumber === 60) {
    scenes = buildNoahScenes();
  } else if (isNoahStory(prompt) && durationNumber === 30) {
    scenes = buildNoahScenes().slice(0, 3);
  } else if (isNoahStory(prompt) && durationNumber === 10) {
    scenes = buildNoahScenes().slice(0, 1);
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

// ==================================================
// API
// ==================================================

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

// Gemini अभी intentionally disabled है.
app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    success: false,
    message:
      "Gemini scene planning is temporarily disabled. SANAPTAI V29 is running in Demo Mode.",
    engine_version: ENGINE_VERSION,
    gemini_enabled: GEMINI_ENABLED
  });
});

// ==================================================
// EXPRESS 5 SAFE FALLBACK
// ==================================================

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

// ==================================================
// START
// ==================================================

app.listen(PORT, () => {
  console.log(
    `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
  );
});
