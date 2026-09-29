import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "V27";
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
// NOAH ATOMIC STORY
// ==================================================

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
    type: "evidence",
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
    action: "Dark storm clouds gather over the coastal town."
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
    action: "Noah realizes boats may not be able to find the harbor."
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
    location: "Road to Lighthouse",
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

// ==================================================
// HELPERS
// ==================================================

function cleanText(value = "") {
  return String(value)
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function sceneTimes(sceneNumber) {
  const start = (sceneNumber - 1) * SCENE_DURATION;
  const end = sceneNumber * SCENE_DURATION;

  return {
    start_time: `${start}s`,
    end_time: `${end}s`
  };
}

function isNoahStory(prompt = "") {
  const p = prompt.toLowerCase();

  return (
    p.includes("noah") &&
    p.includes("lighthouse") &&
    p.includes("storm")
  );
}

// ==================================================
// V27 — CINEMATIC SHORT PLAN
// ==================================================
//
// Important principle:
//
// We do NOT try to literally squeeze every atomic
// event into a 10-second scene.
//
// Instead:
// - main beat = what the camera must clearly show
// - support beat = one closely related action
//
// Causal transitions are preserved.
// ==================================================

function createNoah60Plan() {
  return [
    {
      scene: 1,
      main: "N03",
      support: "N04",
      purpose:
        "Noah discovers the lighthouse journal and opens it."
    },

    {
      scene: 2,
      main: "N05",
      support: "N09",
      purpose:
        "Noah reads the storm warning, leaves the workshop and warns the villagers."
    },

    {
      scene: 3,
      main: "N10",
      support: "N15",
      purpose:
        "The villagers doubt Noah while the storm arrives and the lighthouse signal fails."
    },

    {
      scene: 4,
      main: "N18",
      support: "N21",
      purpose:
        "Noah reaches the lighthouse during the storm and examines the damaged signal."
    },

    {
      scene: 5,
      main: "N22",
      support: "N24",
      purpose:
        "Noah repairs the lighthouse signal and successfully restores it."
    },

    {
      scene: 6,
      main: "N28",
      support: "N30",
      purpose:
        "The rescue boat reaches the harbor and the villagers thank Noah the next morning."
    }
  ];
}

// ==================================================
// LONG-FORM PLAN
// ==================================================

function createNoahPlan(sceneCount) {
  if (sceneCount === 6) {
    return createNoah60Plan();
  }

  // 30 scenes = one meaningful event per scene.
  if (sceneCount === 30) {
    return NOAH_EVENTS.map((event, index) => ({
      scene: index + 1,
      main: event.id,
      support: null,
      purpose: event.action
    }));
  }

  // 60 scenes = two cinematic beats per atomic event.
  if (sceneCount === 60) {
    const plan = [];

    NOAH_EVENTS.forEach((event, index) => {
      plan.push({
        scene: index * 2 + 1,
        main: event.id,
        support: null,
        purpose: event.action
      });

      plan.push({
        scene: index * 2 + 2,
        main: event.id,
        support: null,
        purpose: `Continue the immediate consequence of ${event.action}`
      });
    });

    return plan;
  }

  // 120 scenes = four controlled cinematic beats.
  if (sceneCount === 120) {
    const plan = [];

    NOAH_EVENTS.forEach((event, index) => {
      for (let phase = 0; phase < 4; phase++) {
        plan.push({
          scene: index * 4 + phase + 1,
          main: event.id,
          support: null,
          purpose: event.action
        });
      }
    });

    return plan;
  }

  // Generic chronological fallback.
  const plan = [];
  const count = Math.min(sceneCount, NOAH_EVENTS.length);

  for (let i = 0; i < count; i++) {
    plan.push({
      scene: i + 1,
      main: NOAH_EVENTS[i].id,
      support: null,
      purpose: NOAH_EVENTS[i].action
    });
  }

  return plan;
}

// ==================================================
// CAMERA
// ==================================================

function cameraFor(main, support) {
  if (!main) {
    return "Natural cinematic medium shot.";
  }

  switch (main.type) {
    case "discovery":
      return "Slow push-in from a medium shot to a close-up of the important object.";

    case "warning":
      return "Medium shot on Noah speaking, with a brief over-the-shoulder view of the villagers.";

    case "conflict":
      return "Medium-wide reaction shot showing Noah facing the doubtful villagers.";

    case "evidence":
      return "Over-the-shoulder close-up of Noah showing the journal to the villagers.";

    case "weather":
      return "Wide environmental shot showing the changing weather around the characters.";

    case "realization":
      return "Close-up on Noah's reaction followed by the important object in frame.";

    case "decision":
      return "Medium close-up of Noah making a determined decision.";

    case "movement":
      return "Smooth tracking shot following Noah toward the destination.";

    case "action":
      return "Tight close-up focused on Noah's hands performing the repair.";

    case "climax":
      return "Close-up of the mechanism activating followed by a wider reveal of the restored signal.";

    case "rescue":
      return "Wide cinematic shot clearly showing the rescue boat moving toward its destination.";

    case "resolution":
      return "Warm medium-wide shot showing Noah with the people he helped.";

    default:
      return "Natural cinematic medium shot with subtle camera movement.";
  }
}

// ==================================================
// LIGHTING
// ==================================================

function lightingFor(main, support) {
  const text =
    `${main?.action || ""} ${support?.action || ""}`.toLowerCase();

  if (
    /storm|rain|wind|dark cloud|damaged signal|lighthouse signal/.test(
      text
    )
  ) {
    return "Dark overcast storm lighting with strong natural contrast and wet environmental reflections.";
  }

  if (/morning|sunrise|by morning|safe/.test(text)) {
    return "Soft golden morning light with a calm peaceful atmosphere.";
  }

  return "Natural daytime cinematic lighting.";
}

// ==================================================
// DIALOGUE
// ==================================================

function dialogueFor(main) {
  if (!main) return "";

  const dialogue = {
    N03: "What's this old journal doing here?",
    N05: "A powerful storm is coming.",
    N10: "Please, you have to believe me.",
    N15: "The lighthouse signal is out.",
    N18: "I have to get to the lighthouse.",
    N21: "I know what needs fixing.",
    N22: "Come on... work.",
    N24: "It is working!",
    N28: "They're safe.",
    N30: "You helped save our town, Noah."
  };

  return dialogue[main.id] || "";
}

// ==================================================
// VOICEOVER
// ==================================================

function voiceoverFor(main, support) {
  if (!main) return "";

  const voiceovers = {
    N03:
      "Noah discovers an old lighthouse journal hidden in his father's workshop.",

    N05:
      "The journal warns Noah that a powerful storm is approaching the town.",

    N10:
      "The villagers doubt Noah, but the weather begins to change.",

    N15:
      "Then Noah discovers that the lighthouse signal has stopped.",

    N18:
      "With the storm approaching, Noah races toward the lighthouse.",

    N21:
      "Inside, Noah finds the damaged signal mechanism.",

    N22:
      "Noah works quickly to repair the lighthouse signal.",

    N24:
      "The signal comes back on, guiding the rescue boat toward safety.",

    N28:
      "The rescue boat reaches the harbor safely.",

    N30:
      "By morning, the villagers realize Noah helped save their town."
  };

  return (
    voiceovers[main.id] ||
    cleanText(
      [main.action, support?.action]
        .filter(Boolean)
        .join(" ")
    )
  );
}

// ==================================================
// LOCATION
// ==================================================

function getSceneLocation(main, support) {
  if (!main) return "Story Location";

  return main.location;
}

// ==================================================
// OBJECTS
// ==================================================

function getSceneObjects(main, support) {
  return unique([
    ...(main?.objects || []),
    ...(support?.objects || [])
  ]);
}

// ==================================================
// VISUAL PROMPT
// ==================================================

function createVisualPrompt(
  main,
  support,
  characters,
  location,
  objects,
  camera,
  lighting
) {
  const locks = characters
    .map(
      (name) =>
        CHARACTER_LOCKS[name] ||
        `${name}, consistent appearance`
    )
    .join(" ");

  const objectText =
    objects.length > 0
      ? `Important visible objects: ${objects.join(", ")}.`
      : "No unnecessary props.";

  const mainAction = cleanText(main?.action || "");
  const supportAction = cleanText(support?.action || "");

  let visibleAction = mainAction;

  if (supportAction) {
    visibleAction += ` ${supportAction}`;
  }

  return cleanText(`
Cinematic live-action movie scene.
${locks}

Location: ${location}.
${objectText}

Visible action: ${visibleAction}

Camera: ${camera}
Lighting: ${lighting}

Realistic human movement, believable physics, natural facial expressions,
cinematic depth of field, detailed environment, consistent character identity,
consistent clothing, realistic weather and atmosphere.

Only show elements relevant to this scene.
No unrelated characters.
No unrelated props.
No text overlays.
No subtitles.
No logos.
No meta instructions.
`);
}

// ==================================================
// CREATE SCENE
// ==================================================

function createScene(planItem, sceneNumber, eventMap) {
  const main = eventMap.get(planItem.main);

  const support = planItem.support
    ? eventMap.get(planItem.support)
    : null;

  const characters = unique([
    ...(main?.characters || []),
    ...(support?.characters || [])
  ]);

  const objects = getSceneObjects(main, support);

  const location = getSceneLocation(main, support);

  const camera = cameraFor(main, support);

  const lighting = lightingFor(main, support);

  const dialogue = dialogueFor(main);

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
      "Keep the exact same character face, age, hairstyle, body proportions, clothing and important story objects consistent with previous scenes.",

    scene_purpose: planItem.purpose
  };
}

// ==================================================
// GENERIC STORY ENGINE
// ==================================================

function splitSentences(text) {
  return String(text)
    .split(/[.!?]+/)
    .map((x) => cleanText(x))
    .filter(Boolean);
}

function genericType(text) {
  const s = text.toLowerCase();

  if (/find|discover|notice|open|sees/.test(s)) {
    return "discovery";
  }

  if (/warn|warning|danger|threat/.test(s)) {
    return "warning";
  }

  if (/decide|chooses|plans|must/.test(s)) {
    return "decision";
  }

  if (/doubt|argue|refuse|disagree/.test(s)) {
    return "conflict";
  }

  if (/repair|fix|build|grab|push|pull|fight/.test(s)) {
    return "action";
  }

  if (/rescue|save|help/.test(s)) {
    return "rescue";
  }

  if (/safe|returns|thanks|morning|finally/.test(s)) {
    return "resolution";
  }

  if (/walk|run|enter|leave|climb|travel|go/.test(s)) {
    return "movement";
  }

  return "story";
}

function extractGenericEvents(prompt) {
  return splitSentences(prompt).map((sentence, index) => ({
    id: `G${String(index + 1).padStart(2, "0")}`,
    type: genericType(sentence),
    location: "Story Location",
    characters: ["Main Character"],
    objects: [],
    action: sentence
  }));
}

function createGenericPlan(events, sceneCount) {
  if (events.length === 0) return [];

  const plan = [];

  if (sceneCount >= events.length) {
    events.forEach((event, index) => {
      plan.push({
        scene: index + 1,
        main: event.id,
        support: null,
        purpose: event.action
      });
    });

    while (plan.length < sceneCount) {
      const last = events[events.length - 1];

      plan.push({
        scene: plan.length + 1,
        main: last.id,
        support: null,
        purpose: last.action
      });
    }

    return plan;
  }

  let pointer = 0;

  while (
    plan.length < sceneCount &&
    pointer < events.length
  ) {
    const remainingEvents = events.length - pointer;
    const remainingScenes = sceneCount - plan.length;

    let take = Math.ceil(
      remainingEvents / remainingScenes
    );

    if (take > 2) take = 2;

    const group = events.slice(
      pointer,
      pointer + take
    );

    const main =
      group.find((event) =>
        [
          "discovery",
          "warning",
          "action",
          "rescue",
          "resolution"
        ].includes(event.type)
      ) || group[group.length - 1];

    const support =
      group.find(
        (event) => event.id !== main.id
      ) || null;

    plan.push({
      scene: plan.length + 1,
      main: main.id,
      support: support?.id || null,
      purpose: group
        .map((event) => event.action)
        .join(" ")
    });

    pointer += take;
  }

  return plan;
}

// ==================================================
// BUILD TIMELINE
// ==================================================

function buildTimeline(prompt, duration) {
  const sceneCount =
    Number(duration) / SCENE_DURATION;

  if (isNoahStory(prompt)) {
    const plan = createNoahPlan(sceneCount);

    const eventMap = new Map(
      NOAH_EVENTS.map((event) => [
        event.id,
        event
      ])
    );

    return plan.map((item, index) =>
      createScene(
        item,
        index + 1,
        eventMap
      )
    );
  }

  const events =
    extractGenericEvents(prompt);

  const plan =
    createGenericPlan(
      events,
      sceneCount
    );

  const eventMap = new Map(
    events.map((event) => [
      event.id,
      event
    ])
  );

  return plan.map((item, index) =>
    createScene(
      item,
      index + 1,
      eventMap
    )
  );
}

// ==================================================
// VALIDATION
// ==================================================

function validateScenes(scenes, duration) {
  const expected =
    Number(duration) / SCENE_DURATION;

  const errors = [];

  if (scenes.length !== expected) {
    errors.push(
      `Expected ${expected} scenes, received ${scenes.length}.`
    );
  }

  scenes.forEach((scene, index) => {
    const expectedStart = `${index * 10}s`;
    const expectedEnd = `${(index + 1) * 10}s`;

    if (scene.start_time !== expectedStart) {
      errors.push(
        `Scene ${index + 1}: incorrect start time.`
      );
    }

    if (scene.end_time !== expectedEnd) {
      errors.push(
        `Scene ${index + 1}: incorrect end time.`
      );
    }

    if (!scene.visual_prompt) {
      errors.push(
        `Scene ${index + 1}: missing visual prompt.`
      );
    }

    if (
      /show the character|focus closely|then show|story continues|next scene/i.test(
        scene.visual_prompt
      )
    ) {
      errors.push(
        `Scene ${index + 1}: meta wording detected.`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

// ==================================================
// API
// ==================================================

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

    const allowedDurations = [
      10,
      30,
      60,
      300,
      600,
      1200
    ];

    const numericDuration =
      Number(duration);

    if (
      !allowedDurations.includes(
        numericDuration
      )
    ) {
      return res.status(400).json({
        error: "Invalid duration."
      });
    }

    const scenes = buildTimeline(
      prompt,
      numericDuration
    );

    const validation =
      validateScenes(
        scenes,
        numericDuration
      );

    res.json({
      success: true,

      engine: ENGINE_VERSION,

      demo_mode: DEMO_MODE,

      gemini_enabled:
        GEMINI_ENABLED,

      duration:
        numericDuration,

      total_scenes:
        scenes.length,

      aspect_ratio:
        aspectRatio,

      validation,

      scenes
    });
  } catch (error) {
    console.error(
      "SANAPTAI ERROR:",
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
});

// ==================================================
// OTHER ENDPOINTS
// ==================================================

app.post("/api/create-project", (req, res) => {
  res.json({
    success: false,
    engine: ENGINE_VERSION,
    message:
      "V27 is currently running in Demo Mode. Use /api/demo-project."
  });
});

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    success: false,
    engine: ENGINE_VERSION,
    gemini_enabled:
      GEMINI_ENABLED,
    message:
      "Gemini scene planning is disabled during V27 testing."
  });
});

// ==================================================
// EXPRESS 5 SAFE FALLBACK
// ==================================================

app.use((req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
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
