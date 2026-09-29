import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "V33.2";
const SCENE_DURATION = 10;

const ALLOWED_DURATIONS = [10, 30, 60, 300, 600, 1200];

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   CHARACTER LOCKS
========================================================= */

const CHARACTERS = {
  Noah:
    "14-year-old boy, slim build, short slightly messy brown hair, blue eyes, navy blue hoodie, dark jeans, white sneakers",

  Father:
    "middle-aged man, short dark hair with some gray, trimmed beard, brown work jacket and dark trousers",

  Villagers:
    "coastal town villagers wearing practical everyday clothing",

  "Rescue Crew":
    "professional coastal rescue crew wearing bright weatherproof rescue jackets and safety gear"
};

/* =========================================================
   UNIVERSAL EVENT
========================================================= */

function event(
  id,
  action,
  location,
  time,
  weather,
  weight = 1,
  characters = [],
  object = ""
) {
  return {
    id,
    action,
    location,
    time,
    weather,
    weight,
    characters,
    object
  };
}

/* =========================================================
   TEST STORY
========================================================= */

function getStoryEvents() {
  return [

    event(
      "N01",
      "Noah lives with his father in a small coastal town.",
      "coastal town",
      "morning",
      "calm morning",
      2,
      ["Noah", "Father"]
    ),

    event(
      "N02",
      "Noah enters his father's workshop.",
      "father's workshop",
      "morning",
      "calm morning",
      1,
      ["Noah"]
    ),

    event(
      "N03",
      "Noah discovers an old lighthouse journal.",
      "father's workshop",
      "morning",
      "calm morning",
      2,
      ["Noah"],
      "old lighthouse journal"
    ),

    event(
      "N04",
      "Noah opens the journal and begins reading.",
      "father's workshop",
      "morning",
      "calm morning",
      2,
      ["Noah"],
      "old lighthouse journal"
    ),

    event(
      "N05",
      "The journal warns about a powerful storm approaching the town.",
      "father's workshop",
      "morning",
      "darkening sky",
      3,
      ["Noah"],
      "old lighthouse journal"
    ),

    event(
      "N06",
      "Noah realizes the warning could threaten the coastal town.",
      "father's workshop",
      "morning",
      "darkening sky",
      2,
      ["Noah"]
    ),

    event(
      "N07",
      "Noah leaves the workshop to warn the villagers.",
      "town square",
      "late morning",
      "strong wind",
      2,
      ["Noah"]
    ),

    event(
      "N08",
      "Noah warns the villagers about the approaching storm.",
      "town square",
      "late morning",
      "strong wind",
      2,
      ["Noah", "Villagers"]
    ),

    event(
      "N09",
      "The villagers doubt Noah's warning.",
      "town square",
      "late morning",
      "strong wind",
      2,
      ["Noah", "Villagers"]
    ),

    event(
      "N10",
      "Noah looks toward the darkening horizon.",
      "town square",
      "late morning",
      "dark storm clouds",
      1,
      ["Noah"]
    ),

    event(
      "N11",
      "The storm moves toward the town.",
      "coastal town",
      "afternoon",
      "dark storm clouds and heavy wind",
      2,
      ["Villagers"]
    ),

    event(
      "N12",
      "Heavy rain begins falling.",
      "coastal town",
      "afternoon",
      "heavy rain",
      1,
      ["Villagers"]
    ),

    event(
      "N13",
      "The lighthouse signal suddenly stops working.",
      "coastal lighthouse",
      "afternoon",
      "heavy rain and strong wind",
      3,
      [],
      "lighthouse signal"
    ),

    event(
      "N14",
      "Noah notices that boats approaching the harbor are in danger.",
      "coastal lighthouse",
      "afternoon",
      "heavy rain",
      2,
      ["Noah"]
    ),

    event(
      "N15",
      "Noah decides to repair the lighthouse signal himself.",
      "coastal lighthouse",
      "afternoon",
      "heavy rain and strong wind",
      2,
      ["Noah"]
    ),

    event(
      "N16",
      "Noah runs through the storm toward the lighthouse.",
      "coastal road",
      "afternoon",
      "heavy rain and strong wind",
      3,
      ["Noah"]
    ),

    event(
      "N17",
      "Noah reaches the lighthouse entrance.",
      "lighthouse entrance",
      "afternoon",
      "heavy rain",
      1,
      ["Noah"]
    ),

    event(
      "N18",
      "Noah climbs the lighthouse stairs toward the signal room.",
      "lighthouse stairs",
      "afternoon",
      "storm outside",
      3,
      ["Noah"]
    ),

    event(
      "N19",
      "Noah enters the signal room.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      1,
      ["Noah"]
    ),

    event(
      "N20",
      "Noah examines the damaged signal mechanism.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      3,
      ["Noah"],
      "damaged lighthouse mechanism"
    ),

    event(
      "N21",
      "Noah begins repairing the damaged mechanism.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      3,
      ["Noah"],
      "damaged lighthouse mechanism"
    ),

    event(
      "N22",
      "Noah reconnects the damaged components.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      3,
      ["Noah"],
      "lighthouse mechanism"
    ),

    event(
      "N23",
      "The lighthouse mechanism begins moving again.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      2,
      ["Noah"],
      "lighthouse mechanism"
    ),

    event(
      "N24",
      "The lighthouse signal turns back on.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      3,
      ["Noah"],
      "lighthouse signal"
    ),

    event(
      "N25",
      "Noah sees the restored beam sweeping across the sea.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      2,
      ["Noah"],
      "lighthouse signal"
    ),

    event(
      "N26",
      "A rescue boat follows the restored lighthouse beam toward the harbor.",
      "open sea",
      "afternoon",
      "heavy rain",
      3,
      ["Rescue Crew"],
      "rescue boat"
    ),

    event(
      "N27",
      "The rescue boat reaches the harbor safely.",
      "harbor",
      "afternoon",
      "rain weakening",
      3,
      ["Rescue Crew", "Villagers"],
      "rescue boat"
    ),

    event(
      "N28",
      "The next morning, the storm has completely passed.",
      "coastal town",
      "next morning",
      "clear morning",
      2,
      ["Noah", "Villagers"]
    ),

    event(
      "N29",
      "The villagers thank Noah for helping save the town.",
      "town square",
      "next morning",
      "clear morning",
      3,
      ["Noah", "Villagers"]
    ),

    event(
      "N30",
      "Noah looks toward the lighthouse as the town begins recovering.",
      "town square",
      "next morning",
      "clear morning",
      2,
      ["Noah"],
      "lighthouse"
    )
  ];
}

/* =========================================================
   HELPERS
========================================================= */

function text(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value
      .map(text)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    if (value.text) return String(value.text);
    if (value.name) return String(value.name);
    return Object.values(value)
      .map(text)
      .filter(Boolean)
      .join(", ");
  }

  return String(value);
}

function unique(values) {
  return [
    ...new Set(
      values
        .map(text)
        .map((x) => x.trim())
        .filter(Boolean)
    )
  ];
}

function getCharacters(events) {
  return unique(
    events.flatMap((e) => e.characters || [])
  );
}

function getObjects(events) {
  return unique(
    events.map((e) => e.object)
  );
}

/* =========================================================
   STATE
========================================================= */

function stateOf(e) {
  return `${e.location}|${e.time}|${e.weather}`;
}

function requiresTransition(previousEvent, currentEvent) {
  if (!previousEvent || !currentEvent) return false;

  return (
    previousEvent.location !== currentEvent.location ||
    previousEvent.time !== currentEvent.time ||
    previousEvent.weather !== currentEvent.weather
  );
}

/* =========================================================
   CINEMATIC MERGING
========================================================= */

function mergeEvents(events, maxBeats = 3) {
  if (events.length <= maxBeats) {
    return events;
  }

  const result = [];

  /*
    Preserve first important event.
  */

  result.push(events[0]);

  /*
    Middle events are merged into meaningful action groups.
  */

  const middle = events.slice(1, -1);

  if (middle.length) {
    const middleWeight = middle.reduce(
      (sum, e) => sum + e.weight,
      0
    );

    result.push({
      ...middle[0],
      id: middle.map((e) => e.id).join("_"),
      action: middle
        .map((e) => e.action)
        .join(" "),
      weight: middleWeight,
      characters: unique(
        middle.flatMap((e) => e.characters || [])
      ),
      object: unique(
        middle.map((e) => e.object)
      ).join(", ")
    });
  }

  result.push(events[events.length - 1]);

  return result;
}

/* =========================================================
   EXACT 10 SECOND ALLOCATION
========================================================= */

function allocateSeconds(events, total = 10) {
  if (!events.length) return [];

  const beats = events.slice(0, total);

  /*
    Every beat starts with one second.
  */

  const durations = beats.map(() => 1);

  let remaining =
    total -
    durations.reduce(
      (sum, value) => sum + value,
      0
    );

  while (remaining > 0) {
    let best = 0;

    for (let i = 1; i < beats.length; i++) {
      const current =
        beats[i].weight /
        durations[i];

      const selected =
        beats[best].weight /
        durations[best];

      if (current > selected) {
        best = i;
      }
    }

    durations[best]++;
    remaining--;
  }

  return durations;
}

/* =========================================================
   BEAT SCHEDULER
========================================================= */

function createBeatSchedule(events) {
  if (!events.length) return [];

  /*
    Maximum 3 major cinematic beats.
  */

  const merged =
    mergeEvents(events, 3);

  const durations =
    allocateSeconds(
      merged,
      SCENE_DURATION
    );

  const beats = [];

  let cursor = 0;

  for (let i = 0; i < merged.length; i++) {
    const e = merged[i];

    const duration =
      durations[i];

    beats.push({
      event_id: e.id,

      start_time: cursor,

      end_time:
        cursor + duration,

      duration_seconds:
        duration,

      action: e.action,

      location: text(e.location),

      time_state: text(e.time),

      weather: text(e.weather)
    });

    cursor += duration;
  }

  /*
    Hard guarantee:
    final beat ends at exactly 10.
  */

  if (beats.length) {
    const last =
      beats[beats.length - 1];

    last.end_time = 10;

    last.duration_seconds =
      10 - last.start_time;
  }

  return beats;
}

/* =========================================================
   SPECIAL SCENE 6
========================================================= */

function createFinalSceneBeats() {
  return [
    {
      event_id: "N26_N27",
      start_time: 0,
      end_time: 5,
      duration_seconds: 5,
      action:
        "The rescue boat follows the restored lighthouse beam and reaches the harbor safely.",
      location: "harbor",
      time_state: "afternoon",
      weather: "rain weakening"
    },

    {
      event_id: "TRANSITION_N28",
      start_time: 5,
      end_time: 6,
      duration_seconds: 1,
      type: "cinematic_transition",
      action:
        "Cinematic transition to the next morning after the storm.",
      location: "coastal town",
      time_state: "next morning",
      weather: "clear morning"
    },

    {
      event_id: "N28_N29_N30",
      start_time: 6,
      end_time: 10,
      duration_seconds: 4,
      action:
        "By morning the storm has passed, the villagers thank Noah, and Noah looks toward the lighthouse as the town recovers.",
      location: "town square",
      time_state: "next morning",
      weather: "clear morning"
    }
  ];
}

/* =========================================================
   VISUAL PROMPT
========================================================= */

function visualPrompt(events, beats) {
  const characters =
    getCharacters(events)
      .map(
        (name) =>
          `${name}: ${CHARACTERS[name] || ""}`
      )
      .join("; ");

  const objects =
    getObjects(events).join(", ");

  const timing =
    beats
      .map(
        (b) =>
          `${b.start_time}-${b.end_time}s: ${b.action}`
      )
      .join(" ");

  return [
    "Cinematic AI video scene.",
    "Maintain exact character identity, face, age, hairstyle, clothing and body proportions.",
    characters
      ? `Characters: ${characters}.`
      : "",
    objects
      ? `Important objects: ${objects}.`
      : "",
    `Exact timed action: ${timing}`,
    "Natural physically believable movement.",
    "No sudden character redesign.",
    "No unexplained object changes.",
    "Cinematic composition and realistic environmental continuity."
  ]
    .filter(Boolean)
    .join(" ");
}

/* =========================================================
   CAMERA
========================================================= */

function camera(events) {
  const actions =
    events
      .map((e) => e.action.toLowerCase())
      .join(" ");

  if (
    actions.includes("run") ||
    actions.includes("climb")
  ) {
    return "Dynamic tracking shot followed by controlled cinematic movement.";
  }

  if (
    actions.includes("discover") ||
    actions.includes("journal") ||
    actions.includes("repair")
  ) {
    return "Slow push-in with close-up detail shots of the important action.";
  }

  if (
    actions.includes("thank") ||
    actions.includes("morning")
  ) {
    return "Emotional medium shot followed by a gentle wide establishing shot.";
  }

  return "Cinematic medium and wide shots with smooth controlled camera movement.";
}

/* =========================================================
   LIGHTING
========================================================= */

function lighting(events) {
  const weather =
    events
      .map((e) => text(e.weather).toLowerCase())
      .join(" ");

  if (weather.includes("clear")) {
    return "Soft natural morning light with realistic cinematic highlights.";
  }

  if (
    weather.includes("storm") ||
    weather.includes("rain") ||
    weather.includes("wind")
  ) {
    return "Dark dramatic storm lighting with cool tones, wet highlights and realistic volumetric light.";
  }

  return "Natural cinematic lighting with realistic environmental shadows.";
}

/* =========================================================
   DIALOGUE
========================================================= */

function dialogueFor(events) {
  const ids =
    events.flatMap((e) =>
      String(e.id).split("_")
    );

  if (
    ids.includes("N05") ||
    ids.includes("N08") ||
    ids.includes("N09")
  ) {
    return [
      {
        speaker: "Noah",
        text:
          "A powerful storm is coming. We need to prepare now."
      },
      {
        speaker: "Villager",
        text:
          "Noah, you're just imagining it."
      }
    ];
  }

  if (ids.includes("N15")) {
    return [
      {
        speaker: "Noah",
        text:
          "Then I'll fix the lighthouse myself."
      }
    ];
  }

  if (
    ids.includes("N21") ||
    ids.includes("N22")
  ) {
    return [
      {
        speaker: "Noah",
        text:
          "Come on... work."
      }
    ];
  }

  if (
    ids.includes("N24") ||
    ids.includes("N25")
  ) {
    return [
      {
        speaker: "Noah",
        text:
          "Yes! It's working!"
      }
    ];
  }

  if (
    ids.includes("N29") ||
    ids.includes("N30")
  ) {
    return [
      {
        speaker: "Villagers",
        text:
          "Thank you, Noah. You saved our town."
      }
    ];
  }

  return [];
}

/* =========================================================
   VOICEOVER
========================================================= */

function voiceoverFor(events) {
  const ids =
    events.flatMap((e) =>
      String(e.id).split("_")
    );

  if (
    ids.includes("N03") ||
    ids.includes("N04")
  ) {
    return "Noah discovers an old lighthouse journal containing a dangerous warning.";
  }

  if (
    ids.includes("N05") ||
    ids.includes("N08")
  ) {
    return "The warning is ignored, but Noah can see the storm approaching.";
  }

  if (
    ids.includes("N13") ||
    ids.includes("N15")
  ) {
    return "When the lighthouse fails, Noah decides he must act.";
  }

  if (
    ids.includes("N16") ||
    ids.includes("N20")
  ) {
    return "Noah races through the storm and reaches the damaged lighthouse mechanism.";
  }

  if (
    ids.includes("N21") ||
    ids.includes("N25")
  ) {
    return "Noah repairs the mechanism and restores the guiding light.";
  }

  if (
    ids.includes("N26") ||
    ids.includes("N29")
  ) {
    return "The rescue boat reaches safety, and by morning the grateful town thanks Noah.";
  }

  return "";
}

/* =========================================================
   CONTINUITY
========================================================= */

function continuityFor(
  events,
  previousScene
) {
  const characters =
    getCharacters(events);

  let result =
    `Maintain exact visual identity for ${characters.join(", ") || "all characters"}.`;

  if (previousScene) {
    result +=
      ` Continue directly from Scene ${previousScene.scene_number}.`;
  }

  return result;
}

/* =========================================================
   GENERIC SCENE
========================================================= */

function makeScene(
  events,
  sceneNumber,
  previousScene = null
) {
  const beats =
    createBeatSchedule(events);

  return {
    scene_number: sceneNumber,

    start_time:
      (sceneNumber - 1) *
      SCENE_DURATION,

    end_time:
      sceneNumber *
      SCENE_DURATION,

    duration_seconds:
      SCENE_DURATION,

    visual_prompt:
      visualPrompt(events, beats),

    camera:
      camera(events),

    lighting:
      lighting(events),

    action:
      beats
        .map((b) => b.action)
        .join(" "),

    dialogue:
      dialogueFor(events),

    voiceover:
      voiceoverFor(events),

    continuity:
      continuityFor(
        events,
        previousScene
      ),

    beats,

    characters:
      getCharacters(events),

    objects:
      getObjects(events),

    location:
      text(events[0]?.location),

    time_state:
      text(events[0]?.time),

    weather:
      text(events[0]?.weather)
  };
}

/* =========================================================
   60 SECOND ENGINE
========================================================= */

function build60SecondScenes(events) {
  const map =
    new Map(
      events.map((e) => [e.id, e])
    );

  const groups = [
    ["N01", "N02", "N03", "N04"],

    ["N05", "N06", "N07", "N08", "N09", "N10"],

    ["N11", "N12", "N13", "N14", "N15"],

    ["N16", "N17", "N18", "N19", "N20"],

    ["N21", "N22", "N23", "N24", "N25"],

    ["N26", "N27", "N28", "N29", "N30"]
  ];

  const scenes = [];

  for (
    let i = 0;
    i < groups.length;
    i++
  ) {
    const group =
      groups[i]
        .map((id) => map.get(id))
        .filter(Boolean);

    let scene;

    if (i === 5) {
      scene = makeScene(
        group,
        i + 1,
        scenes[i - 1] || null
      );

      scene.beats =
        createFinalSceneBeats();

      scene.visual_prompt =
        visualPrompt(
          group,
          scene.beats
        );

      scene.action =
        scene.beats
          .map((b) => b.action)
          .join(" ");

      scene.location = "open sea → harbor → town square";
      scene.time_state = "afternoon → next morning";
      scene.weather = "storm → clear morning";

      scene.continuity =
        "Maintain exact character identity. Scene begins during the storm, then uses a clearly visible 1-second cinematic transition to the next morning. Do not show afternoon and next morning as simultaneous events.";
    } else {
      scene =
        makeScene(
          group,
          i + 1,
          scenes[i - 1] || null
        );
    }

    scenes.push(scene);
  }

  return scenes;
}

/* =========================================================
   LONG FORM
========================================================= */

function buildLongScenes(
  events,
  duration
) {
  const totalScenes =
    Math.ceil(
      duration / SCENE_DURATION
    );

  const scenes = [];

  /*
    Preserve chronology.
    Events are distributed sequentially,
    never randomly.
  */

  const perScene =
    Math.max(
      1,
      Math.ceil(
        events.length /
        totalScenes
      )
    );

  for (
    let i = 0;
    i < totalScenes;
    i++
  ) {
    const start =
      i * perScene;

    const end =
      Math.min(
        start + perScene,
        events.length
      );

    let group =
      events.slice(
        start,
        end
      );

    /*
      For scenes after the core story has ended,
      hold the final state rather than inventing events.
    */

    if (!group.length) {
      group = [
        events[
          events.length - 1
        ]
      ];
    }

    scenes.push(
      makeScene(
        group,
        i + 1,
        scenes[i - 1] || null
      )
    );
  }

  return scenes;
}

/* =========================================================
   VALIDATION
========================================================= */

function validateScenes(
  scenes,
  duration
) {
  const errors = [];

  const expected =
    Math.ceil(
      duration / SCENE_DURATION
    );

  if (
    scenes.length !== expected
  ) {
    errors.push(
      `Scene count mismatch: expected ${expected}, got ${scenes.length}.`
    );
  }

  for (const scene of scenes) {
    if (
      scene.duration_seconds !== 10
    ) {
      errors.push(
        `Scene ${scene.scene_number}: duration is not 10 seconds.`
      );
    }

    if (
      !Array.isArray(scene.beats) ||
      scene.beats.length === 0
    ) {
      errors.push(
        `Scene ${scene.scene_number}: missing beats.`
      );
      continue;
    }

    let total = 0;

    let expectedStart = 0;

    for (const beat of scene.beats) {
      if (
        beat.start_time !== expectedStart
      ) {
        errors.push(
          `Scene ${scene.scene_number}: beat starts at ${beat.start_time}, expected ${expectedStart}.`
        );
      }

      if (
        beat.end_time <=
        beat.start_time
      ) {
        errors.push(
          `Scene ${scene.scene_number}: invalid beat timing.`
        );
      }

      total +=
        beat.duration_seconds;

      expectedStart =
        beat.end_time;
    }

    if (total !== 10) {
      errors.push(
        `Scene ${scene.scene_number}: beat total is ${total}, expected 10.`
      );
    }

    if (
      expectedStart !== 10
    ) {
      errors.push(
        `Scene ${scene.scene_number}: final beat ends at ${expectedStart}, expected 10.`
      );
    }

    /*
      No object serialization bugs.
    */

    const dialogue =
      scene.dialogue || [];

    if (
      !Array.isArray(dialogue)
    ) {
      errors.push(
        `Scene ${scene.scene_number}: dialogue must be an array.`
      );
    }

    /*
      Basic dialogue length protection.
    */

    if (
      Array.isArray(dialogue)
    ) {
      const words =
        dialogue
          .map((d) => text(d?.text))
          .join(" ")
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .length;

      if (words > 35) {
        errors.push(
          `Scene ${scene.scene_number}: dialogue exceeds safe 10-second length.`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/* =========================================================
   API TEST
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message:
      "SANAPTAI API is working.",
    engine_version:
      ENGINE_VERSION
  });
});

/* =========================================================
   GEMINI DISABLED
========================================================= */

app.post(
  "/api/plan-scenes",
  (req, res) => {
    res.status(501).json({
      status: "disabled",
      message:
        "Gemini planning is disabled during engine validation.",
      engine_version:
        ENGINE_VERSION
    });
  }
);

/* =========================================================
   PROJECT
========================================================= */

app.post(
  "/api/demo-project",
  (req, res) => {
    try {
      const prompt =
        text(req.body?.prompt) ||
        "A 14-year-old boy named Noah saves his coastal town from a powerful storm.";

      const duration =
        Number(req.body?.duration) ||
        60;

      const aspectRatio =
        text(req.body?.aspectRatio) ||
        "16:9";

      if (
        !ALLOWED_DURATIONS.includes(
          duration
        )
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Allowed durations: 10, 30, 60, 300, 600, 1200."
        });
      }

      /*
        Current engine validation story.
        Prompt is preserved in the API response.
      */

      const events =
        getStoryEvents();

      let scenes;

      if (duration === 60) {
        scenes =
          build60SecondScenes(
            events
          );
      } else if (duration === 10) {
        scenes = [
          makeScene(
            events.slice(0, 3),
            1
          )
        ];
      } else {
        scenes =
          buildLongScenes(
            events,
            duration
          );
      }

      const validation =
        validateScenes(
          scenes,
          duration
        );

      /*
        IMPORTANT:
        Never return fake success if validation failed.
      */

      if (!validation.valid) {
        console.error(
          "ENGINE VALIDATION FAILED:",
          validation.errors
        );

        return res.status(500).json({
          status: "engine_validation_failed",
          engine_version:
            ENGINE_VERSION,
          errors:
            validation.errors
        });
      }

      res.json({
        status: "success",

        engine_version:
          ENGINE_VERSION,

        mode:
          "DEMO_ENGINE",

        gemini_enabled:
          false,

        prompt,

        duration,

        total_scenes:
          scenes.length,

        aspect_ratio:
          aspectRatio,

        scene_duration_seconds:
          10,

        exact_timing:
          true,

        validation,

        character_locks:
          CHARACTERS,

        scenes
      });

    } catch (error) {
      console.error(
        "SANAPTAI ENGINE ERROR:",
        error
      );

      res.status(500).json({
        status: "error",
        message:
          error.message,
        engine_version:
          ENGINE_VERSION
      });
    }
  }
);

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

app.listen(
  PORT,
  () => {
    console.log(
      `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
    );
  }
);
