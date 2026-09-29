import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "V30";
const DEMO_MODE = true;
const GEMINI_ENABLED = false;

const SCENE_DURATION = 10;
const ALLOWED_DURATIONS = [10, 30, 60, 300, 600, 1200];

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   CHARACTER LOCKS
========================================================= */

const CHARACTER_LOCKS = {
  Noah:
    "Noah, 14-year-old boy, slim build, short slightly messy brown hair, blue eyes, navy blue hoodie, dark jeans, white sneakers",

  Father:
    "Noah's father, middle-aged man, short dark hair with some gray, trimmed beard, brown work jacket and dark trousers",

  Villagers:
    "coastal town villagers wearing practical everyday clothing, consistent appearances",

  RescueCrew:
    "professional coastal rescue crew wearing bright weatherproof rescue jackets and safety gear"
};

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

function sceneTimes(index) {
  const start = index * SCENE_DURATION;
  const end = start + SCENE_DURATION;

  return {
    start_time: `${start}s`,
    end_time: `${end}s`
  };
}

function isNoahStory(prompt) {
  const text = cleanText(prompt).toLowerCase();

  return (
    text.includes("noah") &&
    text.includes("lighthouse") &&
    text.includes("storm")
  );
}

/* =========================================================
   NOAH ATOMIC STORY EVENTS
   Every event has a dependency and chronological position.
========================================================= */

const NOAH_EVENTS = [
  {
    id: "N01",
    type: "setup",
    location: "Coastal Town",
    characters: ["Noah", "Father"],
    objects: [],
    action: "Noah lives with his father in a small coastal town.",
    phase: "setup"
  },
  {
    id: "N02",
    type: "movement",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: [],
    action: "Noah enters his father's workshop one morning.",
    phase: "setup"
  },
  {
    id: "N03",
    type: "discovery",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah discovers an old lighthouse journal on the workbench.",
    phase: "discovery"
  },
  {
    id: "N04",
    type: "discovery",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah opens the old lighthouse journal and begins reading.",
    phase: "discovery"
  },
  {
    id: "N05",
    type: "warning",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah reads the journal's warning about a powerful storm approaching the town.",
    phase: "warning"
  },
  {
    id: "N06",
    type: "realization",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah realizes the warning could put the coastal town in danger.",
    phase: "warning"
  },
  {
    id: "N07",
    type: "decision",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah decides to warn the villagers.",
    phase: "decision"
  },
  {
    id: "N08",
    type: "movement",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah leaves the workshop and heads into the coastal town.",
    phase: "decision"
  },
  {
    id: "N09",
    type: "warning",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: ["Lighthouse Journal"],
    action: "Noah warns the villagers about the approaching storm.",
    phase: "conflict"
  },
  {
    id: "N10",
    type: "conflict",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: ["Lighthouse Journal"],
    action: "The villagers doubt Noah's warning.",
    phase: "conflict"
  },
  {
    id: "N11",
    type: "weather",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: [],
    action: "Dark storm clouds begin gathering over the coastal town.",
    phase: "escalation"
  },
  {
    id: "N12",
    type: "weather",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: [],
    action: "Strong wind begins moving through the town as the storm approaches.",
    phase: "escalation"
  },
  {
    id: "N13",
    type: "weather",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: [],
    action: "Rain begins falling as the storm reaches the town.",
    phase: "escalation"
  },
  {
    id: "N14",
    type: "realization",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah notices that the lighthouse signal has stopped working.",
    phase: "escalation"
  },
  {
    id: "N15",
    type: "realization",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah realizes boats approaching the harbor may not see the lighthouse.",
    phase: "escalation"
  },
  {
    id: "N16",
    type: "decision",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah decides he must repair the lighthouse signal.",
    phase: "decision"
  },
  {
    id: "N17",
    type: "movement",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: [],
    action: "Noah runs through the worsening storm toward the lighthouse.",
    phase: "climax"
  },
  {
    id: "N18",
    type: "movement",
    location: "Lighthouse",
    characters: ["Noah"],
    objects: [],
    action: "Noah reaches the lighthouse and enters it during the storm.",
    phase: "climax"
  },
  {
    id: "N19",
    type: "movement",
    location: "Lighthouse Stairwell",
    characters: ["Noah"],
    objects: [],
    action: "Noah climbs the lighthouse stairs toward the signal room.",
    phase: "climax"
  },
  {
    id: "N20",
    type: "movement",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah reaches the signal room and approaches the damaged mechanism.",
    phase: "climax"
  },
  {
    id: "N21",
    type: "inspection",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"],
    action: "Noah examines the damaged lighthouse signal mechanism.",
    phase: "climax"
  },
  {
    id: "N22",
    type: "action",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"],
    action: "Noah prepares his repair tools.",
    phase: "climax"
  },
  {
    id: "N23",
    type: "action",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"],
    action: "Noah begins repairing the damaged mechanism.",
    phase: "climax"
  },
  {
    id: "N24",
    type: "action",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"],
    action: "Noah completes the critical repair to the signal mechanism.",
    phase: "climax"
  },
  {
    id: "N25",
    type: "climax",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "The lighthouse signal turns back on and sends its beam across the stormy sea.",
    phase: "climax"
  },
  {
    id: "N26",
    type: "movement",
    location: "Open Sea",
    characters: ["Rescue Crew"],
    objects: ["Rescue Boat", "Lighthouse Signal"],
    action: "A rescue boat follows the restored lighthouse signal toward the harbor.",
    phase: "resolution"
  },
  {
    id: "N27",
    type: "movement",
    location: "Harbor",
    characters: ["Rescue Crew"],
    objects: ["Rescue Boat", "Lighthouse Signal"],
    action: "The rescue boat approaches the harbor safely.",
    phase: "resolution"
  },
  {
    id: "N28",
    type: "rescue",
    location: "Harbor",
    characters: ["Rescue Crew"],
    objects: ["Rescue Boat"],
    action: "The rescue boat reaches the harbor safely.",
    phase: "resolution"
  },
  {
    id: "N29",
    type: "resolution",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: [],
    action: "By morning, the storm has passed and the coastal town is calm again.",
    phase: "resolution"
  },
  {
    id: "N30",
    type: "resolution",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: [],
    action: "The villagers thank Noah for helping save the town.",
    phase: "resolution"
  }
];

/* =========================================================
   V30 STORY COMPLETION SCENE PLAN
   IMPORTANT:
   Final resolution is protected.
   No random sampling.
========================================================= */

function createNoah60Plan() {
  return [
    {
      scene: 1,
      main: ["N03", "N04"],
      location: "Father's Workshop"
    },

    {
      scene: 2,
      main: ["N05", "N06", "N07", "N08", "N09", "N10"],
      location: "Coastal Town"
    },

    {
      scene: 3,
      main: ["N11", "N12", "N13", "N14", "N15"],
      location: "Coastal Town"
    },

    {
      scene: 4,
      main: ["N16", "N17", "N18", "N19", "N20", "N21"],
      location: "Lighthouse Signal Room"
    },

    {
      scene: 5,
      main: ["N22", "N23", "N24", "N25"],
      location: "Lighthouse Signal Room"
    },

    {
      scene: 6,
      main: ["N26", "N27", "N28", "N29", "N30"],
      location: "Harbor / Coastal Town"
    }
  ];
}

/* =========================================================
   SCENE ACTION ENGINE
========================================================= */

function buildNoahAction(sceneNumber, events) {
  switch (sceneNumber) {
    case 1:
      return (
        "Noah discovers the old lighthouse journal on the workbench, " +
        "opens it, and begins reading its contents."
      );

    case 2:
      return (
        "Noah reads the storm warning, realizes the danger, decides to act, " +
        "leaves the workshop, and warns the villagers, but they doubt him."
      );

    case 3:
      return (
        "Dark clouds gather, wind and rain intensify, and Noah notices the " +
        "lighthouse signal has stopped working."
      );

    case 4:
      return (
        "Noah decides to repair the signal, runs through the storm to the " +
        "lighthouse, climbs to the signal room, and examines the damaged mechanism."
      );

    case 5:
      return (
        "Noah prepares his tools, repairs the damaged mechanism, completes the repair, " +
        "and restores the lighthouse signal."
      );

    case 6:
      return (
        "The rescue boat follows the restored lighthouse signal into the harbor. " +
        "By morning the storm has passed, and the villagers thank Noah for helping save the town."
      );

    default:
      return events.map(e => e.action).join(" ");
  }
}

/* =========================================================
   CAMERA ENGINE
========================================================= */

function cameraForNoah(sceneNumber) {
  switch (sceneNumber) {
    case 1:
      return "Slow cinematic push-in from Noah to the old lighthouse journal, ending on a close-up of the opened pages.";

    case 2:
      return "Medium shot of Noah warning the villagers, followed by brief reaction shots showing their doubt.";

    case 3:
      return "Wide cinematic shot of the storm approaching the town, followed by a close-up of Noah looking toward the dark lighthouse.";

    case 4:
      return "Dynamic tracking shot following Noah through the storm into the lighthouse, followed by a stairway shot and a tight inspection close-up of the damaged signal mechanism.";

    case 5:
      return "Tight close-ups of Noah's hands repairing the mechanism, followed by a dramatic reveal as the lighthouse beam turns back on.";

    case 6:
      return "Wide cinematic harbor shot showing the rescue boat arriving beneath the restored lighthouse beam, followed by a brief peaceful morning shot of Noah with the grateful villagers.";

    default:
      return "Cinematic medium shot with natural movement and a story-appropriate perspective.";
  }
}

/* =========================================================
   LIGHTING ENGINE
========================================================= */

function lightingForNoah(sceneNumber) {
  switch (sceneNumber) {
    case 1:
      return "Natural calm morning daylight entering the workshop through the windows.";

    case 2:
      return "Overcast daytime lighting with the first visible signs of approaching storm clouds.";

    case 3:
      return "Darkening storm lighting with heavy clouds, strong wind, rain and wet environmental reflections.";

    case 4:
      return "Dark storm lighting inside the lighthouse with cool ambient light entering from the storm outside.";

    case 5:
      return "Dark storm lighting with strong contrast, rain visible outside, and the restored lighthouse beam creating a dramatic glow.";

    case 6:
      return "A brief transition from stormy harbor conditions to soft early morning light after the storm, with calm water and a peaceful atmosphere.";

    default:
      return "Natural cinematic lighting appropriate to the current story moment.";
  }
}

/* =========================================================
   DIALOGUE
========================================================= */

function dialogueForNoah(sceneNumber) {
  switch (sceneNumber) {
    case 1:
      return "What's this old journal doing here?";

    case 2:
      return "A powerful storm is coming. Please listen to me.";

    case 3:
      return "The storm is getting worse. Look at the lighthouse.";

    case 4:
      return "I have to fix the signal before the boats arrive.";

    case 5:
      return "Come on... work.";

    case 6:
      return "They're safe.";

    default:
      return "";
  }
}

/* =========================================================
   VOICEOVER
========================================================= */

function voiceoverForNoah(sceneNumber) {
  switch (sceneNumber) {
    case 1:
      return "Noah discovers an old lighthouse journal in his father's workshop.";

    case 2:
      return "The journal warns Noah about a powerful storm, but the villagers refuse to believe him.";

    case 3:
      return "As the storm intensifies, Noah realizes the lighthouse signal has failed.";

    case 4:
      return "Noah races through the storm, reaches the lighthouse, and finds the signal mechanism damaged.";

    case 5:
      return "Noah repairs the mechanism and restores the lighthouse beam just in time.";

    case 6:
      return "The rescue boat reaches the harbor safely. By morning, the grateful villagers thank Noah.";

    default:
      return "";
  }
}

/* =========================================================
   LOCATION / OBJECTS
========================================================= */

function objectsForEvents(events) {
  return unique(events.flatMap(e => e.objects || []));
}

function charactersForEvents(events) {
  return unique(events.flatMap(e => e.characters || []));
}

/* =========================================================
   VISUAL PROMPT
========================================================= */

function createVisualPrompt({
  characters,
  location,
  objects,
  action,
  camera,
  lighting,
  continuity
}) {
  const characterText = characters
    .map(name => CHARACTER_LOCKS[name] || name)
    .join(". ");

  const objectText =
    objects.length > 0
      ? `Important visible objects: ${objects.join(", ")}.`
      : "Show only the necessary story elements.";

  return cleanText(`
Cinematic live-action movie scene.
Characters: ${characterText}.
Keep exactly the same face, age, hairstyle, body proportions, clothing and appearance throughout the entire video.
Location: ${location}.
${objectText}
Visible action: ${action}
Camera: ${camera}
Lighting: ${lighting}
${continuity}
Realistic human movement, believable physics, natural facial expressions,
cinematic depth of field, detailed environment, realistic weather and atmosphere.
Only show elements relevant to this scene.
No unrelated characters.
No unrelated props.
No text overlays.
No subtitles.
No logos.
No meta instructions.
`);
}

/* =========================================================
   NOAH SCENE BUILDER
========================================================= */

function buildNoahScenes(duration) {
  const requiredScenes = duration / SCENE_DURATION;
  const eventsById = new Map(NOAH_EVENTS.map(e => [e.id, e]));

  let plan;

  if (requiredScenes === 6) {
    plan = createNoah60Plan();
  } else if (requiredScenes === 3) {
    plan = [
      {
        scene: 1,
        main: ["N03", "N04", "N05", "N06", "N07", "N09", "N10"],
        location: "Father's Workshop / Coastal Town"
      },
      {
        scene: 2,
        main: ["N11", "N12", "N13", "N14", "N15", "N16", "N17", "N18", "N19", "N20", "N21", "N22", "N23", "N24", "N25"],
        location: "Coastal Town / Lighthouse"
      },
      {
        scene: 3,
        main: ["N26", "N27", "N28", "N29", "N30"],
        location: "Harbor / Coastal Town"
      }
    ];
  } else if (requiredScenes === 1) {
    plan = [
      {
        scene: 1,
        main: NOAH_EVENTS.map(e => e.id),
        location: "Coastal Town / Lighthouse / Harbor"
      }
    ];
  } else {
    /*
      Long-form mode:
      Preserve the full atomic chronology.
      One atomic event gets one scene first.
      Additional scenes repeat meaningful cinematic beats
      without changing story order.
    */

    const baseScenes = NOAH_EVENTS.map((event, index) => ({
      scene: index + 1,
      main: [event.id],
      location: event.location
    }));

    if (requiredScenes <= 30) {
      plan = baseScenes.slice(0, requiredScenes);
    } else {
      plan = [];

      for (let i = 0; i < requiredScenes; i++) {
        const sourceIndex = Math.floor(
          (i * NOAH_EVENTS.length) / requiredScenes
        );

        const event = NOAH_EVENTS[sourceIndex];

        plan.push({
          scene: i + 1,
          main: [event.id],
          location: event.location
        });
      }

      /*
        Resolution protection:
        Last scene must always contain final resolution.
      */
      plan[plan.length - 1] = {
        scene: requiredScenes,
        main: ["N30"],
        location: "Coastal Town"
      };
    }
  }

  return plan.map((item, index) => {
    const events = item.main
      .map(id => eventsById.get(id))
      .filter(Boolean);

    const times = sceneTimes(index);

    const characters = charactersForEvents(events);

    /*
      For the final Noah scene, include Noah and villagers
      even though the rescue crew was involved earlier.
    */
    if (index === plan.length - 1) {
      if (!characters.includes("Noah")) characters.push("Noah");
      if (!characters.includes("Villagers")) characters.push("Villagers");
    }

    const objects = objectsForEvents(events);

    const action = buildNoahAction(index + 1, events);
    const camera = cameraForNoah(index + 1);
    const lighting = lightingForNoah(index + 1);

    const location =
      index === 5 && requiredScenes === 6
        ? "Harbor / Coastal Town"
        : item.location;

    const continuity =
      "Maintain exact visual continuity for Noah, the lighthouse, the signal mechanism, weather progression, and all important story elements.";

    const visualPrompt = createVisualPrompt({
      characters,
      location,
      objects,
      action,
      camera,
      lighting,
      continuity
    });

    return {
      scene_number: index + 1,
      start_time: times.start_time,
      end_time: times.end_time,
      characters,
      location,
      objects,
      visual_prompt: visualPrompt,
      camera,
      lighting,
      action,
      dialogue: dialogueForNoah(
        requiredScenes === 6 ? index + 1 : 0
      ),
      voiceover: voiceoverForNoah(
        requiredScenes === 6 ? index + 1 : 0
      ),
      continuity
    };
  });
}

/* =========================================================
   GENERIC STORY ENGINE
========================================================= */

function splitSentences(text) {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(cleanText)
    .filter(Boolean);
}

function buildGenericScenes(prompt, duration, aspectRatio) {
  const requiredScenes = duration / SCENE_DURATION;

  const sentences = splitSentences(prompt);

  const scenes = [];

  for (let i = 0; i < requiredScenes; i++) {
    const sentence =
      sentences[Math.min(i, Math.max(0, sentences.length - 1))] ||
      "The story continues.";

    const times = sceneTimes(i);

    const action =
      i === requiredScenes - 1
        ? `${sentence} The story reaches its final resolution.`
        : sentence;

    const camera =
      i === 0
        ? "Cinematic establishing shot followed by a gentle push-in."
        : i === requiredScenes - 1
          ? "Wide cinematic closing shot emphasizing the final resolution."
          : "Cinematic medium shot following the main character's action.";

    const lighting =
      i === 0
        ? "Natural cinematic daylight appropriate to the story opening."
        : i === requiredScenes - 1
          ? "Cinematic lighting appropriate to the story's final resolution."
          : "Natural cinematic lighting appropriate to the current story moment.";

    const visualPrompt = createVisualPrompt({
      characters: ["Main Character"],
      location: "Story Location",
      objects: [],
      action,
      camera,
      lighting,
      continuity:
        "Maintain exact character identity, clothing, environment and story continuity across every scene."
    });

    scenes.push({
      scene_number: i + 1,
      start_time: times.start_time,
      end_time: times.end_time,
      characters: ["Main Character"],
      location: "Story Location",
      objects: [],
      visual_prompt: visualPrompt,
      camera,
      lighting,
      action,
      dialogue: "",
      voiceover: sentence,
      continuity:
        "Maintain exact character identity and chronological story continuity."
    });
  }

  return scenes;
}

/* =========================================================
   VALIDATION
========================================================= */

function validateScenes(scenes, duration) {
  const errors = [];

  const expectedScenes = duration / SCENE_DURATION;

  if (scenes.length !== expectedScenes) {
    errors.push(
      `Expected ${expectedScenes} scenes but received ${scenes.length}.`
    );
  }

  scenes.forEach((scene, index) => {
    const expectedStart = `${index * 10}s`;
    const expectedEnd = `${(index + 1) * 10}s`;

    if (
      scene.start_time !== expectedStart ||
      scene.end_time !== expectedEnd
    ) {
      errors.push(
        `Scene ${index + 1} has incorrect timing.`
      );
    }

    if (!scene.visual_prompt) {
      errors.push(`Scene ${index + 1} has no visual prompt.`);
    }

    if (!scene.action) {
      errors.push(`Scene ${index + 1} has no action.`);
    }
  });

  /*
    Noah completion validation.
  */
  if (isNoahStoryFromScenes(scenes)) {
    const combined = scenes
      .map(s => `${s.action} ${s.voiceover}`)
      .join(" ")
      .toLowerCase();

    if (!combined.includes("journal")) {
      errors.push("Noah story is missing journal coverage.");
    }

    if (!combined.includes("storm")) {
      errors.push("Noah story is missing storm coverage.");
    }

    if (!combined.includes("lighthouse")) {
      errors.push("Noah story is missing lighthouse coverage.");
    }

    if (!combined.includes("repair")) {
      errors.push("Noah story is missing repair coverage.");
    }

    if (!combined.includes("rescue")) {
      errors.push("Noah story is missing rescue coverage.");
    }

    if (!combined.includes("thank")) {
      errors.push("Noah story is missing final gratitude/resolution.");
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function isNoahStoryFromScenes(scenes) {
  const text = scenes
    .map(s => `${s.visual_prompt} ${s.action} ${s.voiceover}`)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("noah") &&
    text.includes("lighthouse") &&
    text.includes("storm")
  );
}

/* =========================================================
   API
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message: "SANAPTAI backend is working.",
    engine: ENGINE_VERSION,
    demo_mode: DEMO_MODE,
    gemini_enabled: GEMINI_ENABLED
  });
});

/* =========================================================
   DEMO PROJECT
========================================================= */

app.post("/api/demo-project", (req, res) => {
  try {
    const prompt = cleanText(req.body?.prompt);
    const duration = Number(req.body?.duration || 60);
    const aspectRatio = cleanText(req.body?.aspectRatio || "16:9");

    if (!prompt) {
      return res.status(400).json({
        status: "error",
        message: "Video prompt is required."
      });
    }

    if (!ALLOWED_DURATIONS.includes(duration)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid duration."
      });
    }

    let scenes;

    if (isNoahStory(prompt)) {
      scenes = buildNoahScenes(duration);
    } else {
      scenes = buildGenericScenes(
        prompt,
        duration,
        aspectRatio
      );
    }

    const validation = validateScenes(
      scenes,
      duration
    );

    res.json({
      status: "success",
      message: "PROJECT CREATED!",
      engine: ENGINE_VERSION,
      demo_mode: DEMO_MODE,
      gemini_enabled: GEMINI_ENABLED,

      duration,
      total_scenes: scenes.length,
      aspect_ratio: aspectRatio,

      validation,

      scenes
    });
  } catch (error) {
    console.error("Project creation error:", error);

    res.status(500).json({
      status: "error",
      message: `Project creation failed. ${error.message}`
    });
  }
});

/* =========================================================
   COMPATIBILITY ENDPOINT
========================================================= */

app.post("/api/create-project", (req, res) => {
  req.url = "/api/demo-project";

  const prompt = cleanText(req.body?.prompt);
  const duration = Number(req.body?.duration || 60);
  const aspectRatio = cleanText(req.body?.aspectRatio || "16:9");

  try {
    let scenes;

    if (isNoahStory(prompt)) {
      scenes = buildNoahScenes(duration);
    } else {
      scenes = buildGenericScenes(
        prompt,
        duration,
        aspectRatio
      );
    }

    const validation = validateScenes(
      scenes,
      duration
    );

    res.json({
      status: "success",
      message: "PROJECT CREATED!",
      engine: ENGINE_VERSION,
      duration,
      total_scenes: scenes.length,
      aspect_ratio: aspectRatio,
      validation,
      scenes
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: `Project creation failed. ${error.message}`
    });
  }
});

/* =========================================================
   GEMINI RESERVED
========================================================= */

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    status: "disabled",
    message:
      "Gemini scene planning is temporarily disabled. SANAPTAI V30 is running in Demo Mode.",
    engine: ENGINE_VERSION,
    gemini_enabled: false
  });
});

/* =========================================================
   FRONTEND FALLBACK
   Express 5 safe
========================================================= */

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

/* =========================================================
   SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
  );

  console.log(
    `Demo Mode: ${DEMO_MODE}`
  );

  console.log(
    `Gemini Enabled: ${GEMINI_ENABLED}`
  );
});
