import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const ENGINE_VERSION = "V34.0";

const CHARACTERS = {
  Noah:
    "14-year-old boy, slim build, short slightly messy brown hair, blue eyes, navy blue hoodie, dark jeans, white sneakers",

  Father:
    "middle-aged man, short dark hair with some gray, trimmed beard, brown work jacket and dark trousers",

  Villagers:
    "coastal town villagers wearing practical everyday clothing",

  RescueCrew:
    "professional coastal rescue crew wearing bright weatherproof rescue jackets and safety gear"
};

/*
========================================================
STORY EVENTS
Chronological. No random sampling.
========================================================
*/

function getStoryEvents() {
  return [
    {
      id: "N01",
      action: "Noah lives with his father in a small coastal town.",
      location: "coastal town",
      time: "morning",
      weather: "calm",
      characters: ["Noah", "Father"],
      objects: []
    },

    {
      id: "N02",
      action: "Noah enters his father's workshop.",
      location: "father workshop",
      time: "morning",
      weather: "calm",
      characters: ["Noah", "Father"],
      objects: ["workshop"]
    },

    {
      id: "N03",
      action: "Noah discovers an old lighthouse journal.",
      location: "father workshop",
      time: "morning",
      weather: "calm",
      characters: ["Noah"],
      objects: ["old lighthouse journal"]
    },

    {
      id: "N04",
      action: "Noah opens the journal and begins reading.",
      location: "father workshop",
      time: "morning",
      weather: "calm",
      characters: ["Noah"],
      objects: ["old lighthouse journal"]
    },

    {
      id: "N05",
      action: "The journal warns about a powerful storm approaching the town.",
      location: "father workshop",
      time: "morning",
      weather: "clouds gathering",
      characters: ["Noah"],
      objects: ["old lighthouse journal"]
    },

    {
      id: "N06",
      action: "Noah realizes the warning could threaten the coastal town.",
      location: "father workshop",
      time: "morning",
      weather: "darkening clouds",
      characters: ["Noah"],
      objects: ["old lighthouse journal"]
    },

    {
      id: "N07",
      action: "Noah leaves the workshop to warn the villagers.",
      location: "coastal street",
      time: "late morning",
      weather: "darkening clouds",
      characters: ["Noah"],
      objects: []
    },

    {
      id: "N08",
      action: "Noah warns the villagers about the approaching storm.",
      location: "town square",
      time: "late morning",
      weather: "dark clouds",
      characters: ["Noah", "Villagers"],
      objects: []
    },

    {
      id: "N09",
      action: "The villagers doubt Noah's warning.",
      location: "town square",
      time: "late morning",
      weather: "dark clouds",
      characters: ["Noah", "Villagers"],
      objects: []
    },

    {
      id: "N10",
      action: "Noah looks toward the darkening horizon.",
      location: "town square",
      time: "late morning",
      weather: "dark storm clouds",
      characters: ["Noah"],
      objects: []
    },

    {
      id: "N11",
      action: "The storm moves toward the town.",
      location: "coastal town",
      time: "afternoon",
      weather: "approaching storm",
      characters: ["Villagers"],
      objects: []
    },

    {
      id: "N12",
      action: "Heavy rain begins falling.",
      location: "coastal town",
      time: "afternoon",
      weather: "heavy rain",
      characters: ["Noah", "Villagers"],
      objects: []
    },

    {
      id: "N13",
      action: "The lighthouse signal suddenly stops working.",
      location: "lighthouse",
      time: "afternoon",
      weather: "heavy rain",
      characters: [],
      objects: ["lighthouse signal"]
    },

    {
      id: "N14",
      action: "Noah notices that boats approaching the harbor are in danger.",
      location: "harbor",
      time: "afternoon",
      weather: "heavy rain",
      characters: ["Noah"],
      objects: ["boats", "lighthouse signal"]
    },

    {
      id: "N15",
      action: "Noah decides to repair the lighthouse signal himself.",
      location: "harbor",
      time: "afternoon",
      weather: "heavy rain",
      characters: ["Noah"],
      objects: ["lighthouse signal"]
    },

    {
      id: "N16",
      action: "Noah runs through the storm toward the lighthouse.",
      location: "coastal road",
      time: "afternoon",
      weather: "heavy rain",
      characters: ["Noah"],
      objects: []
    },

    {
      id: "N17",
      action: "Noah reaches the lighthouse entrance.",
      location: "lighthouse entrance",
      time: "afternoon",
      weather: "heavy rain",
      characters: ["Noah"],
      objects: ["lighthouse"]
    },

    {
      id: "N18",
      action: "Noah climbs the lighthouse stairs toward the signal room.",
      location: "lighthouse stairs",
      time: "afternoon",
      weather: "storm outside",
      characters: ["Noah"],
      objects: ["lighthouse"]
    },

    {
      id: "N19",
      action: "Noah enters the signal room.",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: ["Noah"],
      objects: ["damaged lighthouse mechanism"]
    },

    {
      id: "N20",
      action: "Noah examines the damaged signal mechanism.",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: ["Noah"],
      objects: ["damaged lighthouse mechanism"]
    },

    {
      id: "N21",
      action: "Noah begins repairing the damaged mechanism.",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: ["Noah"],
      objects: ["damaged lighthouse mechanism"]
    },

    {
      id: "N22",
      action: "Noah reconnects the damaged components.",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: ["Noah"],
      objects: ["lighthouse mechanism"]
    },

    {
      id: "N23",
      action: "The lighthouse mechanism begins moving again.",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: ["Noah"],
      objects: ["lighthouse mechanism"]
    },

    {
      id: "N24",
      action: "The lighthouse signal turns back on.",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: ["Noah"],
      objects: ["lighthouse signal"]
    },

    {
      id: "N25",
      action: "Noah sees the restored beam sweeping across the sea.",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "rain weakening",
      characters: ["Noah"],
      objects: ["lighthouse signal"]
    },

    {
      id: "N26",
      action: "The rescue boat follows the restored lighthouse beam.",
      location: "sea",
      time: "afternoon",
      weather: "rain weakening",
      characters: ["RescueCrew"],
      objects: ["rescue boat", "lighthouse signal"]
    },

    {
      id: "N27",
      action: "The rescue boat reaches the harbor safely.",
      location: "harbor",
      time: "afternoon",
      weather: "rain weakening",
      characters: ["RescueCrew", "Villagers"],
      objects: ["rescue boat"]
    },

    {
      id: "N28",
      action: "By the next morning, the storm has completely passed.",
      location: "coastal town",
      time: "next morning",
      weather: "clear morning",
      characters: ["Noah", "Villagers"],
      objects: []
    },

    {
      id: "N29",
      action: "The villagers thank Noah for helping save the town.",
      location: "town square",
      time: "next morning",
      weather: "clear morning",
      characters: ["Noah", "Villagers"],
      objects: []
    },

    {
      id: "N30",
      action: "Noah looks toward the lighthouse as the town begins to recover.",
      location: "town square",
      time: "next morning",
      weather: "clear morning",
      characters: ["Noah"],
      objects: ["lighthouse"]
    }
  ];
}

/*
========================================================
HELPERS
========================================================
*/

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function characterText(names) {
  return names
    .map((name) => `${name}: ${CHARACTERS[name]}`)
    .join("; ");
}

function objectText(objects) {
  return unique(objects).join(", ");
}

function dialogueFor(ids) {
  const set = new Set(ids);

  if (set.has("N08") || set.has("N09")) {
    return [
      {
        speaker: "Noah",
        text: "A powerful storm is coming. We need to prepare now."
      },
      {
        speaker: "Villager",
        text: "Noah, you're just imagining it."
      }
    ];
  }

  if (set.has("N15")) {
    return [
      {
        speaker: "Noah",
        text: "Then I'll fix the lighthouse myself."
      }
    ];
  }

  if (set.has("N21") || set.has("N22")) {
    return [
      {
        speaker: "Noah",
        text: "Come on... work."
      }
    ];
  }

  if (set.has("N29")) {
    return [
      {
        speaker: "Villagers",
        text: "Thank you, Noah. You saved our town."
      }
    ];
  }

  return [];
}

function voiceoverFor(ids) {
  const set = new Set(ids);

  if (set.has("N01") || set.has("N02") || set.has("N03") || set.has("N04")) {
    return "Noah discovers an old lighthouse journal containing a dangerous warning.";
  }

  if (set.has("N05") || set.has("N06") || set.has("N07") || set.has("N08") || set.has("N09") || set.has("N10")) {
    return "The warning is ignored, but Noah can see the storm approaching.";
  }

  if (set.has("N11") || set.has("N12") || set.has("N13") || set.has("N14") || set.has("N15")) {
    return "The storm arrives and the failed lighthouse puts boats in danger.";
  }

  if (set.has("N16") || set.has("N17") || set.has("N18") || set.has("N19") || set.has("N20")) {
    return "Noah races through the storm and reaches the damaged lighthouse mechanism.";
  }

  if (set.has("N21") || set.has("N22") || set.has("N23") || set.has("N24") || set.has("N25")) {
    return "Noah repairs the mechanism and restores the guiding lighthouse beam.";
  }

  if (set.has("N26") || set.has("N27")) {
    return "The rescue boat follows the restored beam and reaches safety.";
  }

  return "By morning, the storm has passed and the grateful town thanks Noah.";
}

/*
========================================================
BEAT DEFINITIONS
IMPORTANT:
We deliberately create cinematic groups instead of blindly
packing every event into one scene.
========================================================
*/

const SCENE_GROUPS = [
  ["N01", "N02", "N03", "N04"],
  ["N05", "N06", "N07", "N08", "N09", "N10"],
  ["N11", "N12", "N13", "N14", "N15"],
  ["N16", "N17", "N18", "N19", "N20"],
  ["N21", "N22", "N23", "N24", "N25"],
  ["N26", "N27", "N28", "N29", "N30"]
];

/*
Each group is converted into exactly 3 cinematic beats.
The beats are intentionally semantic, not simple event-count
chunks.
*/

const BEAT_PLANS = [
  [
    ["N01", "N02"],
    ["N03"],
    ["N04"]
  ],

  [
    ["N05", "N06"],
    ["N07", "N08", "N09"],
    ["N10"]
  ],

  [
    ["N11", "N12"],
    ["N13", "N14"],
    ["N15"]
  ],

  [
    ["N16", "N17"],
    ["N18", "N19"],
    ["N20"]
  ],

  [
    ["N21", "N22"],
    ["N23", "N24"],
    ["N25"]
  ],

  [
    ["N26", "N27"],
    ["N28"],
    ["N29", "N30"]
  ]
];

function eventMap(events) {
  return new Map(events.map((e) => [e.id, e]));
}

function buildBeat(ids, map) {
  const events = ids.map((id) => map.get(id)).filter(Boolean);

  return {
    ids,
    events,
    action: events.map((e) => e.action).join(" "),
    location: events[events.length - 1]?.location || "",
    time: events[events.length - 1]?.time || "",
    weather: events[events.length - 1]?.weather || "",
    characters: unique(events.flatMap((e) => e.characters)),
    objects: unique(events.flatMap((e) => e.objects))
  };
}

/*
========================================================
TIMING ENGINE
========================================================
*/

function allocateBeatTimes(beats) {
  const total = 10;

  // Cinematic weights:
  // first beat = setup
  // middle beat = main action
  // final beat = story progression
  const weights = beats.map((_, i) => {
    if (i === 0) return 3;
    if (i === beats.length - 1) return 3;
    return 4;
  });

  const weightTotal = weights.reduce((a, b) => a + b, 0);

  let current = 0;

  return beats.map((beat, index) => {
    let duration;

    if (index === beats.length - 1) {
      duration = total - current;
    } else {
      duration = Math.max(
        2,
        Math.round((weights[index] / weightTotal) * total)
      );

      // Never allow remaining time to become impossible.
      const remainingBeats = beats.length - index - 1;
      const maxAllowed = total - current - remainingBeats * 2;

      duration = Math.min(duration, maxAllowed);
    }

    const start = current;
    const end = current + duration;

    current = end;

    return {
      ...beat,
      start_time: start,
      end_time: end,
      duration_seconds: duration
    };
  });
}

/*
========================================================
SCENE CREATION
========================================================
*/

function createVisualPrompt(sceneBeats) {
  const characters = unique(sceneBeats.flatMap((b) => b.characters));
  const objects = unique(sceneBeats.flatMap((b) => b.objects));

  const timedAction = sceneBeats
    .map(
      (b) =>
        `${b.start_time}-${b.end_time}s: ${b.action}`
    )
    .join(" ");

  return (
    "Cinematic AI video scene. " +
    "Maintain exact character identity, face, age, hairstyle, clothing and body proportions. " +
    `Characters: ${characterText(characters)}. ` +
    (objects.length
      ? `Important objects: ${objectText(objects)}. `
      : "") +
    `Exact timed action: ${timedAction} ` +
    "Natural physically believable movement. " +
    "No sudden character redesign. " +
    "No unexplained object changes. " +
    "Cinematic composition and realistic environmental continuity."
  );
}

function cameraFor(sceneNumber) {
  const cameras = [
    "Slow establishing push-in followed by close-up detail shots.",
    "Controlled tracking movement followed by reaction close-ups.",
    "Wide storm establishing shot followed by dramatic close-ups.",
    "Dynamic tracking shot followed by controlled interior movement.",
    "Tight mechanical close-ups followed by an emotional reveal.",
    "Emotional medium shots followed by a gentle wide establishing shot."
  ];

  return cameras[sceneNumber - 1] || cameras[0];
}

function lightingFor(sceneNumber) {
  if (sceneNumber <= 2) {
    return "Natural cinematic lighting gradually shifting toward darker storm conditions.";
  }

  if (sceneNumber <= 5) {
    return "Dark dramatic storm lighting with cool tones, wet highlights and realistic volumetric light.";
  }

  return "Soft natural morning light with realistic cinematic highlights.";
}

function continuityFor(sceneNumber) {
  if (sceneNumber === 1) {
    return "Establish the locked character identities and begin the story naturally.";
  }

  if (sceneNumber === 6) {
    return (
      "Scene begins during the storm rescue. " +
      "At 5 seconds use a clearly visible cinematic transition to the next morning. " +
      "Do not show storm and morning simultaneously."
    );
  }

  return "Maintain exact character identity and continue directly from the previous scene.";
}

function makeScene(sceneNumber, beatPlan, map) {
  const rawBeats = beatPlan.map((ids) => buildBeat(ids, map));
  const beats = allocateBeatTimes(rawBeats);

  const allIds = beats.flatMap((b) => b.ids);

  const dialogue = dialogueFor(allIds);

  return {
    scene_number: sceneNumber,
    start_time: (sceneNumber - 1) * 10,
    end_time: sceneNumber * 10,

    visual_prompt: createVisualPrompt(beats),

    camera: cameraFor(sceneNumber),

    lighting: lightingFor(sceneNumber),

    action: beats.map((b) => b.action).join(" "),

    dialogue,

    voiceover: voiceoverFor(allIds),

    continuity: continuityFor(sceneNumber),

    beats: beats.map((b) => ({
      event_ids: b.ids,
      start_time: b.start_time,
      end_time: b.end_time,
      duration_seconds: b.duration_seconds,
      action: b.action,
      location: b.location,
      time: b.time,
      weather: b.weather
    }))
  };
}

/*
========================================================
SPECIAL FINAL SCENE
========================================================
*/

function makeFinalScene(map) {
  const rescue = buildBeat(["N26", "N27"], map);

  const transition = {
    ids: ["N28"],
    events: [map.get("N28")],
    action: "Cinematic transition to the next morning after the storm.",
    location: "coastal town",
    time: "next morning",
    weather: "clear morning",
    characters: ["Noah", "Villagers"],
    objects: []
  };

  const ending = buildBeat(["N29", "N30"], map);

  const beats = [
    {
      ...rescue,
      start_time: 0,
      end_time: 5,
      duration_seconds: 5
    },
    {
      ...transition,
      start_time: 5,
      end_time: 6,
      duration_seconds: 1
    },
    {
      ...ending,
      start_time: 6,
      end_time: 10,
      duration_seconds: 4
    }
  ];

  const allIds = beats.flatMap((b) => b.ids);

  return {
    scene_number: 6,
    start_time: 50,
    end_time: 60,

    visual_prompt: createVisualPrompt(beats),

    camera:
      "Emotional medium shot of the rescue followed by a clear cinematic transition and a gentle wide morning establishing shot.",

    lighting:
      "Storm lighting during the rescue, followed by soft natural morning light after the transition.",

    action: beats.map((b) => b.action).join(" "),

    dialogue: dialogueFor(allIds),

    voiceover:
      "The rescue boat reaches safety, and by morning the grateful town thanks Noah.",

    continuity: continuityFor(6),

    beats: beats.map((b) => ({
      event_ids: b.ids,
      start_time: b.start_time,
      end_time: b.end_time,
      duration_seconds: b.duration_seconds,
      action: b.action,
      location: b.location,
      time: b.time,
      weather: b.weather
    }))
  };
}

/*
========================================================
VALIDATION
========================================================
*/

function validateScenes(scenes) {
  const errors = [];

  if (scenes.length !== 6) {
    errors.push(`Expected 6 scenes, got ${scenes.length}`);
  }

  scenes.forEach((scene, index) => {
    if (scene.start_time !== index * 10) {
      errors.push(`Scene ${scene.scene_number}: wrong start time`);
    }

    if (scene.end_time !== (index + 1) * 10) {
      errors.push(`Scene ${scene.scene_number}: wrong end time`);
    }

    if (!Array.isArray(scene.beats) || scene.beats.length !== 3) {
      errors.push(
        `Scene ${scene.scene_number}: must contain exactly 3 beats`
      );
      return;
    }

    let previousEnd = 0;

    scene.beats.forEach((beat, beatIndex) => {
      if (beat.start_time !== previousEnd) {
        errors.push(
          `Scene ${scene.scene_number} Beat ${beatIndex + 1}: timing gap`
        );
      }

      if (beat.end_time <= beat.start_time) {
        errors.push(
          `Scene ${scene.scene_number} Beat ${beatIndex + 1}: invalid duration`
        );
      }

      previousEnd = beat.end_time;
    });

    if (previousEnd !== 10) {
      errors.push(
        `Scene ${scene.scene_number}: beats do not end at 10 seconds`
      );
    }

    if (!Array.isArray(scene.dialogue)) {
      errors.push(
        `Scene ${scene.scene_number}: dialogue must be an array`
      );
    }

    const dialogueWords = scene.dialogue
      .map((d) => d.text || "")
      .join(" ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (dialogueWords > 35) {
      errors.push(
        `Scene ${scene.scene_number}: dialogue exceeds 35 words`
      );
    }
  });

  // Make sure the entire story was used exactly once.
  const used = scenes.flatMap((scene) =>
    scene.beats.flatMap((beat) => beat.event_ids)
  );

  const expected = getStoryEvents().map((e) => e.id);

  if (used.join("|") !== expected.join("|")) {
    errors.push("Story chronology/event coverage is invalid.");
  }

  return errors;
}

/*
========================================================
BUILD 60 SECOND PROJECT
========================================================
*/

function build60SecondProject() {
  const events = getStoryEvents();
  const map = eventMap(events);

  const scenes = BEAT_PLANS.map((plan, index) => {
    if (index === 5) {
      return makeFinalScene(map);
    }

    return makeScene(index + 1, plan, map);
  });

  const errors = validateScenes(scenes);

  if (errors.length) {
    throw new Error(
      "V34 validation failed: " + errors.join(" | ")
    );
  }

  return scenes;
}

/*
========================================================
API
========================================================
*/

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message: "SANAPTAI V34 engine is running.",
    engine: ENGINE_VERSION
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const prompt = req.body?.prompt || "";

    const duration = Number(req.body?.duration || 60);

    const aspectRatio =
      req.body?.aspectRatio || "16:9";

    // Current engine test is deliberately 60 seconds.
    // No Gemini call. No fake long-form output.
    if (duration !== 60) {
      return res.status(400).json({
        status: "error",
        code: "duration_not_ready",
        message:
          "V34 currently validates the 60-second engine only. Long-form expansion will be enabled after the 60-second planner passes validation.",
        requested_duration: duration
      });
    }

    const scenes = build60SecondProject();

    return res.json({
      status: "success",
      engine: ENGINE_VERSION,
      mode: "DEMO",
      prompt,
      duration: 60,
      total_scenes: 6,
      aspect_ratio: aspectRatio,
      scenes
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      code: "engine_validation_failed",
      message: error.message
    });
  }
});

/*
========================================================
FRONTEND FALLBACK
========================================================
*/

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(
    `SANAPTAI V34 running on port ${PORT}`
  );
});
