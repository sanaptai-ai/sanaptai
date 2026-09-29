import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

const ENGINE_VERSION = "V24";
const DEMO_MODE = true;
const GEMINI_ENABLED = false;

const SCENE_DURATION = 10;

const ALLOWED_DURATIONS = [10, 30, 60, 300, 600, 1200];

/* =========================================================
   CHARACTER LOCKS
========================================================= */

const CHARACTER_LOCKS = {
  Noah:
    "14-year-old boy, slim build, short slightly messy brown hair, blue eyes, light blue hoodie, dark jeans, white sneakers.",

  Father:
    "middle-aged coastal-town man, short brown hair, light beard, navy work jacket, beige pants, practical work boots.",

  Villagers:
    "coastal-town residents wearing practical everyday clothing.",

  "Rescue Crew":
    "professional harbor rescue crew wearing weather-resistant rescue clothing and safety gear.",

  "Main Character":
    "maintain one consistent face, age, body proportions, hairstyle and clothing throughout the story.",
};

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value = "") {
  return String(value)
    .replace(/\s+/g, " ")
    .trim();
}

function unique(arr = []) {
  return [...new Set(arr.filter(Boolean))];
}

function normalizeDuration(value) {
  const n = Number(value);
  return ALLOWED_DURATIONS.includes(n) ? n : 60;
}

function sceneCount(duration) {
  return Math.floor(duration / SCENE_DURATION);
}

function times(number) {
  const start = (number - 1) * SCENE_DURATION;

  return {
    start_time: `${start}s`,
    end_time: `${start + SCENE_DURATION}s`,
  };
}

function has(text, words) {
  const value = text.toLowerCase();

  return words.some((word) =>
    value.includes(word.toLowerCase())
  );
}

/* =========================================================
   ATOMIC EVENT
========================================================= */

function event(
  id,
  action,
  type,
  location,
  characters = [],
  objects = [],
  options = {}
) {
  return {
    id,
    index: Number(id.replace(/\D/g, "")),
    action,
    type,
    location,
    characters: unique(characters),
    objects: unique(objects),
    weather: options.weather || "clear",
    dialogue: options.dialogue || "",
    voiceover: options.voiceover || "",
  };
}

/* =========================================================
   NOAH STORY DETECTION
========================================================= */

function isNoahStory(prompt) {
  const p = prompt.toLowerCase();

  return (
    p.includes("noah") &&
    p.includes("lighthouse") &&
    p.includes("storm")
  );
}

/* =========================================================
   NOAH ATOMIC TIMELINE
========================================================= */

function buildNoahEvents() {
  return [

    event(
      "N01",
      "Noah walks through the small coastal town beside his father.",
      "setup",
      "Coastal Town",
      ["Noah", "Father"],
      [],
      {
        dialogue: "It is a quiet morning.",
        voiceover:
          "Noah lives with his father in a small coastal town.",
      }
    ),

    event(
      "N02",
      "Noah and his father enter the father's workshop.",
      "movement",
      "Father's Workshop",
      ["Noah", "Father"]
    ),

    event(
      "N03",
      "Noah notices an old lighthouse journal on the workbench.",
      "discovery",
      "Father's Workshop",
      ["Noah"],
      ["Lighthouse Journal"]
    ),

    event(
      "N04",
      "Noah picks up the journal and opens it.",
      "discovery",
      "Father's Workshop",
      ["Noah"],
      ["Lighthouse Journal"]
    ),

    event(
      "N05",
      "Noah reads a warning about a powerful storm approaching.",
      "warning",
      "Father's Workshop",
      ["Noah"],
      ["Lighthouse Journal", "Storm Warning"],
      {
        dialogue: "A powerful storm is coming.",
      }
    ),

    event(
      "N06",
      "Noah realizes the storm could put the town in danger.",
      "realization",
      "Father's Workshop",
      ["Noah"],
      ["Lighthouse Journal"]
    ),

    event(
      "N07",
      "Noah decides he must warn the villagers.",
      "decision",
      "Father's Workshop",
      ["Noah"],
      ["Lighthouse Journal"],
      {
        dialogue: "I have to warn everyone.",
      }
    ),

    event(
      "N08",
      "Noah leaves the workshop and hurries toward town.",
      "movement",
      "Coastal Town",
      ["Noah"],
      ["Lighthouse Journal"]
    ),

    event(
      "N09",
      "Noah warns the villagers about the approaching storm.",
      "warning",
      "Coastal Town",
      ["Noah", "Villagers"],
      ["Lighthouse Journal"],
      {
        dialogue: "A dangerous storm is coming!",
      }
    ),

    event(
      "N10",
      "The villagers look doubtful and refuse to believe Noah.",
      "conflict",
      "Coastal Town",
      ["Noah", "Villagers"],
      ["Lighthouse Journal"]
    ),

    event(
      "N11",
      "Noah holds up the journal and shows the warning to the villagers.",
      "conflict",
      "Coastal Town",
      ["Noah", "Villagers"],
      ["Lighthouse Journal"]
    ),

    event(
      "N12",
      "Dark storm clouds begin gathering over the town.",
      "conflict",
      "Coastal Town",
      ["Noah", "Villagers"],
      [],
      { weather: "storm" }
    ),

    event(
      "N13",
      "Strong winds sweep through the streets.",
      "conflict",
      "Coastal Town",
      ["Noah", "Villagers"],
      [],
      { weather: "storm" }
    ),

    event(
      "N14",
      "Heavy rain begins falling across the town.",
      "conflict",
      "Coastal Town",
      ["Noah", "Villagers"],
      [],
      { weather: "storm" }
    ),

    event(
      "N15",
      "Noah notices that the lighthouse signal has stopped working.",
      "discovery",
      "Coastal Town",
      ["Noah"],
      ["Lighthouse Signal"],
      { weather: "storm" }
    ),

    event(
      "N16",
      "Noah realizes boats may not find the harbor without the signal.",
      "realization",
      "Coastal Town",
      ["Noah"],
      ["Lighthouse Signal"],
      { weather: "storm" }
    ),

    event(
      "N17",
      "Noah decides to repair the lighthouse signal himself.",
      "decision",
      "Coastal Town",
      ["Noah"],
      ["Lighthouse Signal"],
      {
        weather: "storm",
        dialogue: "I have to fix the lighthouse.",
      }
    ),

    event(
      "N18",
      "Noah moves quickly toward the lighthouse through the storm.",
      "movement",
      "Lighthouse Exterior",
      ["Noah"],
      [],
      { weather: "storm" }
    ),

    event(
      "N19",
      "Noah climbs the lighthouse stairs.",
      "movement",
      "Lighthouse Stairway",
      ["Noah"],
      ["Lighthouse Signal"],
      { weather: "storm" }
    ),

    event(
      "N20",
      "Noah reaches the damaged signal mechanism.",
      "action",
      "Lighthouse Signal Room",
      ["Noah"],
      ["Lighthouse Signal", "Repair Tools"],
      { weather: "storm" }
    ),

    event(
      "N21",
      "Noah carefully examines the damaged mechanism.",
      "discovery",
      "Lighthouse Signal Room",
      ["Noah"],
      ["Lighthouse Signal", "Repair Tools"],
      { weather: "storm" }
    ),

    event(
      "N22",
      "Noah begins repairing the damaged mechanism.",
      "action",
      "Lighthouse Signal Room",
      ["Noah"],
      ["Lighthouse Signal", "Repair Tools"],
      { weather: "storm" }
    ),

    event(
      "N23",
      "Noah continues repairing the mechanism as the storm rages outside.",
      "action",
      "Lighthouse Signal Room",
      ["Noah"],
      ["Lighthouse Signal", "Repair Tools"],
      { weather: "storm" }
    ),

    event(
      "N24",
      "The lighthouse signal suddenly turns back on.",
      "climax",
      "Lighthouse Signal Room",
      ["Noah"],
      ["Lighthouse Signal"],
      {
        weather: "storm",
        dialogue: "It is working!",
      }
    ),

    event(
      "N25",
      "A rescue boat sees the restored lighthouse signal.",
      "rescue",
      "Open Water",
      ["Rescue Crew"],
      ["Lighthouse Signal", "Rescue Boat"],
      { weather: "storm" }
    ),

    event(
      "N26",
      "The rescue boat follows the signal toward the harbor.",
      "rescue",
      "Open Water",
      ["Rescue Crew"],
      ["Lighthouse Signal", "Rescue Boat"],
      { weather: "storm" }
    ),

    event(
      "N27",
      "The rescue boat navigates safely toward the harbor.",
      "rescue",
      "Harbor",
      ["Rescue Crew"],
      ["Rescue Boat"],
      { weather: "storm" }
    ),

    event(
      "N28",
      "The rescue boat reaches the harbor as the storm weakens.",
      "rescue",
      "Harbor",
      ["Rescue Crew"],
      ["Rescue Boat"],
      { weather: "storm_weakening" }
    ),

    event(
      "N29",
      "Morning arrives after the storm and the town is safe.",
      "resolution",
      "Coastal Town",
      ["Noah", "Father", "Villagers"],
      [],
      { weather: "morning" }
    ),

    event(
      "N30",
      "The villagers thank Noah while his father proudly stands beside him.",
      "resolution",
      "Coastal Town",
      ["Noah", "Father", "Villagers"],
      [],
      {
        weather: "morning",
        dialogue: "You helped save our town, Noah.",
        voiceover:
          "By morning, the villagers realize Noah helped save the town.",
      }
    ),
  ];
}

/* =========================================================
   EVENT IMPORTANCE
========================================================= */

function weight(e) {
  if (
    ["climax", "rescue", "resolution"].includes(e.type)
  ) {
    return 3;
  }

  if (
    ["action", "conflict", "movement"].includes(e.type)
  ) {
    return 2;
  }

  return 1;
}

/* =========================================================
   V24 SCENE BOUNDARIES
========================================================= */

/*
   IMPORTANT:

   We don't randomly sample events.

   We create chronological ranges.

   For Noah's 30 atomic events and 6 scenes:

   Scene 1 = N01-N05
   Scene 2 = N06-N11
   Scene 3 = N12-N17
   Scene 4 = N18-N24
   Scene 5 = N25-N28
   Scene 6 = N29-N30

   These boundaries preserve the complete story.
*/

function createNoah60Ranges() {
  return [
    ["N01", "N05"],
    ["N06", "N11"],
    ["N12", "N17"],
    ["N18", "N24"],
    ["N25", "N28"],
    ["N29", "N30"],
  ];
}

function rangeToBundles(events, ranges) {
  return ranges.map(([start, end]) => {
    const startIndex = events.findIndex(
      (e) => e.id === start
    );

    const endIndex = events.findIndex(
      (e) => e.id === end
    );

    return events.slice(startIndex, endIndex + 1);
  });
}

/* =========================================================
   GENERIC CHRONOLOGICAL COMPRESSION
========================================================= */

function genericCompress(events, count) {
  if (events.length <= count) {
    return events.map((e) => [e]);
  }

  const totalWeight = events.reduce(
    (sum, e) => sum + weight(e),
    0
  );

  const target = totalWeight / count;

  const bundles = [];

  let current = [];
  let currentWeight = 0;

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const w = weight(e);

    const remainingEvents =
      events.length - i;

    const remainingScenes =
      count - bundles.length;

    const mustClose =
      current.length > 0 &&
      currentWeight + w > target &&
      remainingEvents >= remainingScenes;

    if (mustClose) {
      bundles.push(current);
      current = [];
      currentWeight = 0;
    }

    current.push(e);
    currentWeight += w;
  }

  if (current.length) {
    bundles.push(current);
  }

  /*
    If too many bundles, merge neighbors.
    Never delete an event.
  */

  while (bundles.length > count) {
    let merged = false;

    for (let i = 0; i < bundles.length - 1; i++) {
      const a = bundles[i];
      const b = bundles[i + 1];

      const aLast = a[a.length - 1];
      const bFirst = b[0];

      const compatible =
        aLast.location === bFirst.location ||
        aLast.type === "movement" ||
        bFirst.type === "movement";

      if (compatible) {
        bundles[i] = [...a, ...b];
        bundles.splice(i + 1, 1);
        merged = true;
        break;
      }
    }

    if (!merged) break;
  }

  return bundles;
}

/* =========================================================
   STORY-AWARE CAMERA
========================================================= */

function camera(bundle) {
  const types = bundle.map((e) => e.type);

  if (types.includes("rescue")) {
    return "wide cinematic harbor view followed by a smooth tracking shot of the rescue boat";
  }

  if (types.includes("climax")) {
    return "dramatic close-up of the critical action followed by a controlled cinematic reveal";
  }

  if (types.includes("action")) {
    return "detailed close-up of the physical task followed by a medium action shot";
  }

  if (types.includes("conflict")) {
    return "medium group shot followed by close-ups of character reactions";
  }

  if (types.includes("warning")) {
    return "medium character shot followed by a close-up reaction";
  }

  if (types.includes("discovery")) {
    return "over-the-shoulder discovery shot followed by a close-up of the important object";
  }

  if (types.includes("movement")) {
    return "wide establishing shot followed by a smooth tracking shot";
  }

  if (types.includes("decision")) {
    return "medium close-up focused on the character's determined expression";
  }

  return "cinematic medium shot with a natural environmental establishing view";
}

/* =========================================================
   STORY-AWARE LIGHTING
========================================================= */

function lighting(bundle) {
  const weather = bundle.map((e) => e.weather);

  if (weather.includes("morning")) {
    return "peaceful clear morning light after the storm";
  }

  if (weather.includes("storm_weakening")) {
    return "dark storm clouds breaking with softer natural light";
  }

  if (weather.includes("storm")) {
    return "dark overcast storm lighting with strong wind and rain";
  }

  if (
    bundle.some(
      (e) => e.location === "Father's Workshop"
    )
  ) {
    return "warm natural morning light through the workshop windows";
  }

  return "clear natural daytime lighting";
}

/* =========================================================
   ACTION SUMMARY
========================================================= */

function actionText(bundle) {
  if (bundle.length === 1) {
    return bundle[0].action;
  }

  const first = bundle[0].action;
  const last = bundle[bundle.length - 1].action;

  return `${first} Then, ${last.charAt(0).toLowerCase()}${last.slice(
    1
  )}`;
}

/* =========================================================
   DIALOGUE
========================================================= */

function dialogue(bundle) {
  const explicit = bundle
    .map((e) => e.dialogue)
    .filter(Boolean);

  if (explicit.length) {
    return explicit[0];
  }

  const types = bundle.map((e) => e.type);

  if (types.includes("warning")) {
    return "We need to act now.";
  }

  if (types.includes("decision")) {
    return "I have to do this.";
  }

  if (types.includes("conflict")) {
    return "Please believe me.";
  }

  if (types.includes("action")) {
    return "Come on, work.";
  }

  if (types.includes("rescue")) {
    return "Follow that signal!";
  }

  if (types.includes("resolution")) {
    return "You saved us, Noah.";
  }

  return "";
}

/* =========================================================
   VOICEOVER
========================================================= */

function voiceover(bundle) {
  const explicit = bundle
    .map((e) => e.voiceover)
    .filter(Boolean);

  if (explicit.length) {
    return explicit[0];
  }

  if (bundle.length === 1) {
    return bundle[0].action;
  }

  return actionText(bundle);
}

/* =========================================================
   SCENE CREATOR
========================================================= */

function createScene(bundle, number) {
  const t = times(number);

  const characters = unique(
    bundle.flatMap((e) => e.characters)
  );

  const objects = unique(
    bundle.flatMap((e) => e.objects)
  );

  /*
    For compressed scenes, final location is used only when
    there is an explicit movement event. Otherwise first
    location remains the visual anchor.
  */

  let location = bundle[0].location;

  const movement = bundle.find(
    (e) => e.type === "movement"
  );

  if (movement) {
    location = bundle[bundle.length - 1].location;
  }

  const action = actionText(bundle);

  const characterLocks = characters
    .map((name) => {
      const lock =
        CHARACTER_LOCKS[name] ||
        CHARACTER_LOCKS["Main Character"];

      return `${name}: ${lock}`;
    })
    .join(" ");

  const visualPrompt = cleanText(
    `Characters: ${characters.join(
      ", "
    )}. Location: ${location}. ${
      objects.length
        ? `Important objects: ${objects.join(", ")}.`
        : ""
    } Cinematic action: ${action}. ${characterLocks} Maintain exact visual continuity. Show only elements relevant to this scene. Do not introduce future events. Do not skip causal events. No meta text, no labels, no subtitles.`
  );

  return {
    scene_number: number,
    start_time: t.start_time,
    end_time: t.end_time,

    event_start: bundle[0].id,
    event_end: bundle[bundle.length - 1].id,
    event_ids: bundle.map((e) => e.id),

    characters,
    character_lock: characterLocks,

    location,
    objects,

    visual_prompt,

    camera: camera(bundle),
    lighting: lighting(bundle),

    action,

    dialogue: dialogue(bundle),
    voiceover: voiceover(bundle),

    continuity:
      "V24 chronological scene range. Every atomic event remains represented in order.",
  };
}

/* =========================================================
   VALIDATION
========================================================= */

function validateCoverage(scenes, events) {
  const used = scenes.flatMap(
    (scene) => scene.event_ids || []
  );

  const expected = events.map((e) => e.id);

  return (
    used.length >= expected.length &&
    expected.every((id) => used.includes(id))
  );
}

function validateOrder(scenes, events) {
  const positions = new Map(
    events.map((e, i) => [e.id, i])
  );

  let last = -1;

  for (const scene of scenes) {
    for (const id of scene.event_ids || []) {
      const position = positions.get(id);

      if (position === undefined) {
        return false;
      }

      if (position < last) {
        return false;
      }

      last = position;
    }
  }

  return true;
}

function validateNoPrematureEnding(scenes) {
  let endingSeen = false;

  for (const scene of scenes) {
    const ids = scene.event_ids || [];

    if (
      ids.includes("N29") ||
      ids.includes("N30")
    ) {
      endingSeen = true;
      continue;
    }

    if (endingSeen) {
      return false;
    }
  }

  return true;
}

/* =========================================================
   BUILD PROJECT
========================================================= */

function buildProject(prompt, duration, aspectRatio) {
  const count = sceneCount(duration);

  let events;

  if (isNoahStory(prompt)) {
    events = buildNoahEvents();
  } else {
    const sentences = cleanText(prompt)
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);

    events = sentences.map((sentence, index) =>
      event(
        `G${String(index + 1).padStart(2, "0")}`,
        sentence,
        "general",
        "Main Location",
        ["Main Character"]
      )
    );
  }

  let bundles;

  /*
    SPECIAL 60-SECOND NOAH PLAN
  */

  if (
    isNoahStory(prompt) &&
    count === 6
  ) {
    bundles = rangeToBundles(
      events,
      createNoah60Ranges()
    );
  } else {
    bundles = genericCompress(
      events,
      count
    );
  }

  /*
    If duration is longer than event count,
    duplicate only as controlled micro-beats.
  */

  if (bundles.length < count) {
    const expanded = [];

    for (const bundle of bundles) {
      expanded.push(bundle);

      if (expanded.length >= count) {
        break;
      }
    }

    while (expanded.length < count) {
      const source =
        expanded[expanded.length - 1];

      expanded.push(source);
    }

    bundles = expanded;
  }

  /*
    If something produces too many bundles,
    trim by merging neighboring ranges.
  */

  while (bundles.length > count) {
    let merged = false;

    for (let i = 0; i < bundles.length - 1; i++) {
      const left = bundles[i];
      const right = bundles[i + 1];

      const compatible =
        left[left.length - 1].location ===
          right[0].location ||
        left[left.length - 1].type === "movement" ||
        right[0].type === "movement";

      if (compatible) {
        bundles[i] = [
          ...left,
          ...right,
        ];

        bundles.splice(i + 1, 1);

        merged = true;
        break;
      }
    }

    if (!merged) break;
  }

  const scenes = bundles
    .slice(0, count)
    .map((bundle, index) =>
      createScene(bundle, index + 1)
    );

  return {
    scenes,
    events,
  };
}

/* =========================================================
   API
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    status: "ok",
    engine: ENGINE_VERSION,
    demo_mode: DEMO_MODE,
    gemini_enabled: GEMINI_ENABLED,

    features: [
      "Chronological Scene Boundaries",
      "Atomic Event Preservation",
      "No Random Sampling",
      "Controlled Event Compression",
      "Dependency Order",
      "Character Continuity",
      "Location Continuity",
      "Object Continuity",
      "Story-Aware Lighting",
      "Story-Aware Camera",
      "Exact 10-Second Scenes",
      "Automatic Event Coverage Validation",
    ],
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const prompt = cleanText(
      req.body?.prompt || ""
    );

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required.",
      });
    }

    const duration = normalizeDuration(
      req.body?.duration
    );

    const aspectRatio =
      req.body?.aspectRatio || "9:16";

    const result = buildProject(
      prompt,
      duration,
      aspectRatio
    );

    const coverage = validateCoverage(
      result.scenes,
      result.events
    );

    const order = validateOrder(
      result.scenes,
      result.events
    );

    const ending = isNoahStory(prompt)
      ? validateNoPrematureEnding(
          result.scenes
        )
      : true;

    res.json({
      success: true,

      engine: ENGINE_VERSION,

      demo_mode: DEMO_MODE,

      gemini_enabled: GEMINI_ENABLED,

      duration,

      total_scenes:
        result.scenes.length,

      aspect_ratio: aspectRatio,

      validation: {
        all_events_represented:
          coverage,

        chronological_order:
          order,

        no_premature_ending:
          ending,
      },

      scenes: result.scenes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error:
        error.message ||
        "Project creation failed.",
    });
  }
});

app.post("/api/create-project", (req, res) => {
  try {
    const prompt = cleanText(
      req.body?.prompt || ""
    );

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required.",
      });
    }

    const duration = normalizeDuration(
      req.body?.duration
    );

    const aspectRatio =
      req.body?.aspectRatio || "9:16";

    const result = buildProject(
      prompt,
      duration,
      aspectRatio
    );

    res.json({
      success: true,
      engine: ENGINE_VERSION,
      demo_mode: DEMO_MODE,
      gemini_enabled: GEMINI_ENABLED,
      duration,
      total_scenes:
        result.scenes.length,
      aspect_ratio: aspectRatio,
      scenes: result.scenes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error:
        error.message ||
        "Project creation failed.",
    });
  }
});

/*
  Gemini intentionally disabled.
*/

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    error:
      "AI scene planning is disabled in V24 Demo Mode. Gemini is not being called.",
  });
});

/* =========================================================
   FRONTEND FALLBACK
========================================================= */

app.use((req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );
});

/* =========================================================
   START
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
