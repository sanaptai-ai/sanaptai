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

const ENGINE_VERSION = "V25";
const DEMO_MODE = true;
const GEMINI_ENABLED = false;

const SCENE_DURATION = 10;

const ALLOWED_DURATIONS = [
  10,
  30,
  60,
  300,
  600,
  1200,
];

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
   NOAH STORY
========================================================= */

function isNoahStory(prompt) {
  const p = prompt.toLowerCase();

  return (
    p.includes("noah") &&
    p.includes("lighthouse") &&
    p.includes("storm")
  );
}

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
   V25 MICRO-BEAT SYSTEM
========================================================= */

function microBeat(e) {
  switch (e.type) {
    case "setup":
      return `Establish the environment naturally as ${e.action.toLowerCase()}`;

    case "movement":
      return `Show the movement clearly as ${e.action.toLowerCase()}`;

    case "discovery":
      return `Show the character noticing the important detail, then ${e.action.toLowerCase()}`;

    case "warning":
      return `Focus on the warning and the character's reaction as ${e.action.toLowerCase()}`;

    case "realization":
      return `Use a focused reaction shot as ${e.action.toLowerCase()}`;

    case "decision":
      return `Show the character making the decision as ${e.action.toLowerCase()}`;

    case "conflict":
      return `Show the disagreement and character reactions as ${e.action.toLowerCase()}`;

    case "action":
      return `Focus closely on the physical task as ${e.action.toLowerCase()}`;

    case "climax":
      return `Build tension and clearly show the turning point as ${e.action.toLowerCase()}`;

    case "rescue":
      return `Clearly show the rescue progress as ${e.action.toLowerCase()}`;

    case "resolution":
      return `Show the emotional resolution as ${e.action.toLowerCase()}`;

    default:
      return e.action;
  }
}

/* =========================================================
   SCENE ACTION
========================================================= */

function sceneAction(bundle) {
  const beats = bundle.map(microBeat);

  return beats.join(" Then, ");
}

/* =========================================================
   CAMERA
========================================================= */

function camera(bundle) {
  const types = bundle.map((e) => e.type);

  if (types.includes("climax")) {
    return "tight close-up on the critical mechanism followed by a dramatic reveal of the restored lighthouse signal";
  }

  if (
    types.includes("action") &&
    bundle.some(
      (e) => e.location === "Lighthouse Signal Room"
    )
  ) {
    return "close-up of Noah's hands working on the mechanism followed by a medium shot of Noah inside the signal room";
  }

  if (
    types.includes("rescue") &&
    bundle.some(
      (e) => e.location === "Harbor"
    )
  ) {
    return "wide harbor establishing shot followed by a smooth tracking shot of the rescue boat";
  }

  if (types.includes("rescue")) {
    return "wide ocean shot followed by a tracking shot following the rescue boat toward the harbor";
  }

  if (types.includes("conflict")) {
    return "medium group shot followed by close-ups of Noah and the villagers reacting";
  }

  if (types.includes("discovery")) {
    return "over-the-shoulder shot followed by a detailed close-up of the important discovery";
  }

  if (types.includes("warning")) {
    return "medium shot of Noah delivering the warning followed by close-ups of the villagers";
  }

  if (types.includes("decision")) {
    return "medium close-up of Noah's determined expression";
  }

  if (types.includes("movement")) {
    return "wide establishing shot followed by a smooth tracking shot";
  }

  return "cinematic medium shot with a natural environmental establishing view";
}

/* =========================================================
   LIGHTING
========================================================= */

function lighting(bundle) {
  const weather = bundle.map((e) => e.weather);

  if (weather.includes("morning")) {
    return "peaceful clear morning light after the storm";
  }

  if (weather.includes("storm_weakening")) {
    return "dark clouds breaking with softer natural light";
  }

  if (weather.includes("storm")) {
    return "dark overcast storm lighting with rain and strong wind";
  }

  if (
    bundle.some(
      (e) => e.location === "Father's Workshop"
    )
  ) {
    return "warm natural morning light entering through the workshop windows";
  }

  return "clear natural daytime lighting";
}

/* =========================================================
   LOCATION
========================================================= */

function sceneLocation(bundle) {
  if (bundle.length === 1) {
    return bundle[0].location;
  }

  /*
    If the scene contains a movement event,
    use the destination only when the movement is
    the final meaningful beat.
  */

  const last = bundle[bundle.length - 1];

  if (last.type === "movement") {
    return last.location;
  }

  /*
    Otherwise use the location of the dominant
    physical action/discovery/climax.
  */

  const important = [...bundle]
    .reverse()
    .find((e) =>
      [
        "climax",
        "action",
        "discovery",
        "conflict",
        "warning",
        "decision",
        "realization",
      ].includes(e.type)
    );

  return important
    ? important.location
    : bundle[0].location;
}

/* =========================================================
   DIALOGUE
========================================================= */

function sceneDialogue(bundle) {
  const explicit = bundle
    .map((e) => e.dialogue)
    .filter(Boolean);

  if (explicit.length) {
    return explicit[0];
  }

  if (
    bundle.some(
      (e) => e.type === "conflict"
    )
  ) {
    return "Please believe me.";
  }

  if (
    bundle.some(
      (e) => e.type === "warning"
    )
  ) {
    return "A storm is coming.";
  }

  if (
    bundle.some(
      (e) => e.type === "decision"
    )
  ) {
    return "I have to do this.";
  }

  if (
    bundle.some(
      (e) => e.type === "action"
    )
  ) {
    return "Keep going.";
  }

  if (
    bundle.some(
      (e) => e.type === "rescue"
    )
  ) {
    return "Follow the signal!";
  }

  if (
    bundle.some(
      (e) => e.type === "resolution"
    )
  ) {
    return "You saved us.";
  }

  return "";
}

/* =========================================================
   VOICEOVER
========================================================= */

function sceneVoiceover(bundle) {
  const explicit = bundle
    .map((e) => e.voiceover)
    .filter(Boolean);

  if (explicit.length) {
    return explicit[0];
  }

  if (bundle.length === 1) {
    return bundle[0].action;
  }

  return bundle
    .map((e) => e.action)
    .join(" ");
}

/* =========================================================
   VISUAL PROMPT
========================================================= */

function createVisualPrompt(
  bundle,
  characters,
  objects,
  location,
  action,
  characterLocks
) {
  const objectText = objects.length
    ? `Important objects: ${objects.join(", ")}.`
    : "";

  return cleanText(
    `Characters: ${characters.join(", ")}. Location: ${location}. ${objectText} Cinematic action: ${action}. ${characterLocks} Maintain exact face, age, body proportions, hairstyle and clothing continuity. Show only actions and objects belonging to this scene. Do not introduce future events. Do not skip the causal action of this scene. No meta text, no labels, no subtitles.`
  );
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

  const location = sceneLocation(bundle);

  const action = sceneAction(bundle);

  const characterLocks = characters
    .map((name) => {
      const lock =
        CHARACTER_LOCKS[name] ||
        CHARACTER_LOCKS["Main Character"];

      return `${name}: ${lock}`;
    })
    .join(" ");

  const visualPrompt = createVisualPrompt(
    bundle,
    characters,
    objects,
    location,
    action,
    characterLocks
  );

  return {
    scene_number: number,
    start_time: t.start_time,
    end_time: t.end_time,

    event_start: bundle[0].id,
    event_end:
      bundle[bundle.length - 1].id,

    event_ids: bundle.map(
      (e) => e.id
    ),

    characters,
    character_lock: characterLocks,

    location,
    objects,

    visual_prompt: visualPrompt,

    camera: camera(bundle),

    lighting: lighting(bundle),

    action,

    dialogue: sceneDialogue(bundle),

    voiceover: sceneVoiceover(bundle),

    continuity:
      "V25 chronological micro-beat scene. Atomic events remain in order and are represented by coherent cinematic actions.",
  };
}

/* =========================================================
   NOAH 60-SECOND PLAN
========================================================= */

function createNoah60Bundles(events) {
  /*
    V25 deliberately uses smaller cinematic groups.

    Scene 1:
    N01-N04

    Scene 2:
    N05-N09

    Scene 3:
    N10-N15

    Scene 4:
    N16-N21

    Scene 5:
    N22-N26

    Scene 6:
    N27-N30

    The important repair and rescue actions
    remain visible instead of being hidden
    between first/last events.
  */

  const ranges = [
    ["N01", "N04"],
    ["N05", "N09"],
    ["N10", "N15"],
    ["N16", "N21"],
    ["N22", "N26"],
    ["N27", "N30"],
  ];

  return ranges.map(
    ([start, end]) => {
      const a = events.findIndex(
        (e) => e.id === start
      );

      const b = events.findIndex(
        (e) => e.id === end
      );

      return events.slice(
        a,
        b + 1
      );
    }
  );
}

/* =========================================================
   GENERIC COMPRESSION
========================================================= */

function genericCompress(events, count) {
  if (events.length <= count) {
    return events.map((e) => [e]);
  }

  const bundles = [];

  const baseSize =
    Math.floor(events.length / count);

  let remainder =
    events.length % count;

  let cursor = 0;

  for (let i = 0; i < count; i++) {
    const size =
      baseSize +
      (remainder > 0 ? 1 : 0);

    remainder--;

    bundles.push(
      events.slice(
        cursor,
        cursor + size
      )
    );

    cursor += size;
  }

  return bundles;
}

/* =========================================================
   BUILD PROJECT
========================================================= */

function buildProject(
  prompt,
  duration,
  aspectRatio
) {
  const count = sceneCount(duration);

  let events;

  if (isNoahStory(prompt)) {
    events = buildNoahEvents();
  } else {
    const sentences = cleanText(prompt)
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);

    events = sentences.map(
      (sentence, index) =>
        event(
          `G${String(index + 1).padStart(
            2,
            "0"
          )}`,
          sentence,
          "general",
          "Main Location",
          ["Main Character"]
        )
    );
  }

  let bundles;

  if (
    isNoahStory(prompt) &&
    count === 6
  ) {
    bundles =
      createNoah60Bundles(events);
  } else if (
    isNoahStory(prompt) &&
    count === 30
  ) {
    bundles = events.map(
      (e) => [e]
    );
  } else {
    bundles =
      genericCompress(
        events,
        count
      );
  }

  /*
    Long duration:
    controlled repetition only after
    all real events are represented.
  */

  if (bundles.length < count) {
    const expanded = [];

    for (
      let i = 0;
      i < bundles.length;
      i++
    ) {
      expanded.push(
        bundles[i]
      );

      if (
        expanded.length <
          count &&
        bundles[i].length > 0
      ) {
        expanded.push(
          bundles[i]
        );
      }

      if (
        expanded.length >=
        count
      ) {
        break;
      }
    }

    while (
      expanded.length < count
    ) {
      expanded.push(
        expanded[
          expanded.length - 1
        ]
      );
    }

    bundles =
      expanded.slice(
        0,
        count
      );
  }

  const scenes =
    bundles
      .slice(0, count)
      .map(
        (bundle, index) =>
          createScene(
            bundle,
            index + 1
          )
      );

  return {
    scenes,
    events,
  };
}

/* =========================================================
   VALIDATION
========================================================= */

function validateCoverage(
  scenes,
  events
) {
  const used =
    scenes.flatMap(
      (scene) =>
        scene.event_ids || []
    );

  const expected =
    events.map(
      (e) => e.id
    );

  return expected.every(
    (id) =>
      used.includes(id)
  );
}

function validateOrder(
  scenes,
  events
) {
  const positions =
    new Map(
      events.map(
        (e, i) => [
          e.id,
          i,
        ]
      )
    );

  let last = -1;

  for (
    const scene of scenes
  ) {
    for (
      const id of
        scene.event_ids || []
    ) {
      const position =
        positions.get(id);

      if (
        position ===
        undefined
      ) {
        return false;
      }

      if (
        position < last
      ) {
        return false;
      }

      last = position;
    }
  }

  return true;
}

function validateNoPrematureEnding(
  scenes
) {
  let endingSeen =
    false;

  for (
    const scene of scenes
  ) {
    const ids =
      scene.event_ids || [];

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
   API
========================================================= */

app.get(
  "/api/test",
  (req, res) => {
    res.json({
      status: "ok",
      engine:
        ENGINE_VERSION,
      demo_mode:
        DEMO_MODE,
      gemini_enabled:
        GEMINI_ENABLED,

      features: [
        "Chronological Micro-Beats",
        "Atomic Event Preservation",
        "No Random Sampling",
        "Coherent Scene Compression",
        "Character Continuity",
        "Location Continuity",
        "Object Continuity",
        "Story-Aware Lighting",
        "Story-Aware Camera",
        "Exact 10-Second Scenes",
        "Event Coverage Validation",
      ],
    });
  }
);

/* =========================================================
   DEMO PROJECT
========================================================= */

app.post(
  "/api/demo-project",
  (req, res) => {
    try {
      const prompt =
        cleanText(
          req.body?.prompt ||
            ""
        );

      if (!prompt) {
        return res
          .status(400)
          .json({
            error:
              "Prompt is required.",
          });
      }

      const duration =
        normalizeDuration(
          req.body?.duration
        );

      const aspectRatio =
        req.body?.aspectRatio ||
        "9:16";

      const result =
        buildProject(
          prompt,
          duration,
          aspectRatio
        );

      const coverage =
        validateCoverage(
          result.scenes,
          result.events
        );

      const order =
        validateOrder(
          result.scenes,
          result.events
        );

      const ending =
        isNoahStory(prompt)
          ? validateNoPrematureEnding(
              result.scenes
            )
          : true;

      res.json({
        success: true,

        engine:
          ENGINE_VERSION,

        demo_mode:
          DEMO_MODE,

        gemini_enabled:
          GEMINI_ENABLED,

        duration,

        total_scenes:
          result.scenes.length,

        aspect_ratio:
          aspectRatio,

        validation: {
          all_events_represented:
            coverage,

          chronological_order:
            order,

          no_premature_ending:
            ending,
        },

        scenes:
          result.scenes,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message ||
          "Project creation failed.",
      });
    }
  }
);

/* =========================================================
   CREATE PROJECT
========================================================= */

app.post(
  "/api/create-project",
  (req, res) => {
    try {
      const prompt =
        cleanText(
          req.body?.prompt ||
            ""
        );

      if (!prompt) {
        return res
          .status(400)
          .json({
            error:
              "Prompt is required.",
          });
      }

      const duration =
        normalizeDuration(
          req.body?.duration
        );

      const aspectRatio =
        req.body?.aspectRatio ||
        "9:16";

      const result =
        buildProject(
          prompt,
          duration,
          aspectRatio
        );

      res.json({
        success: true,
        engine:
          ENGINE_VERSION,
        demo_mode:
          DEMO_MODE,
        gemini_enabled:
          GEMINI_ENABLED,
        duration,
        total_scenes:
          result.scenes.length,
        aspect_ratio:
          aspectRatio,
        scenes:
          result.scenes,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message ||
          "Project creation failed.",
      });
    }
  }
);

/* =========================================================
   GEMINI DISABLED
========================================================= */

app.post(
  "/api/plan-scenes",
  (req, res) => {
    res.status(501).json({
      error:
        "AI scene planning is disabled in V25 Demo Mode. Gemini is not being called.",
    });
  }
);

/* =========================================================
   FRONTEND FALLBACK
========================================================= */

app.use(
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "public",
        "index.html"
      )
    );
  }
);

/* =========================================================
   START
========================================================= */

app.listen(
  PORT,
  () => {
    console.log(
      `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
    );

    console.log(
      `Demo Mode: ${DEMO_MODE}`
    );

    console.log(
      `Gemini Enabled: ${GEMINI_ENABLED}`
    );
  }
);
