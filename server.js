import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "V33";
const SCENE_DURATION = 10;

const ALLOWED_DURATIONS = [
  10,
  30,
  60,
  300,
  600,
  1200
];

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   CHARACTER LOCKS
========================================================= */

const NOAH = {
  name: "Noah",
  description:
    "14-year-old boy, slim build, short slightly messy brown hair, blue eyes, navy blue hoodie, dark jeans, white sneakers"
};

const FATHER = {
  name: "Father",
  description:
    "middle-aged man, short dark hair with some gray, trimmed beard, brown work jacket and dark trousers"
};

const VILLAGERS = {
  name: "Villagers",
  description:
    "coastal town villagers wearing practical everyday clothing"
};

const RESCUE_CREW = {
  name: "Rescue Crew",
  description:
    "professional coastal rescue crew wearing bright weatherproof rescue jackets and safety gear"
};

/* =========================================================
   TEST STORY EVENTS
   Universal event format
========================================================= */

function makeEvent(
  id,
  action,
  location,
  time,
  weather,
  weight,
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

function getTestEvents() {
  return [

    makeEvent(
      "N01",
      "Noah lives with his father in a small coastal town.",
      "coastal town",
      "morning",
      "calm morning",
      2,
      [NOAH.name, FATHER.name]
    ),

    makeEvent(
      "N02",
      "Noah enters his father's workshop.",
      "father's workshop",
      "morning",
      "calm morning",
      1,
      [NOAH.name, FATHER.name]
    ),

    makeEvent(
      "N03",
      "Noah discovers an old lighthouse journal.",
      "father's workshop",
      "morning",
      "calm morning",
      2,
      [NOAH.name],
      "old lighthouse journal"
    ),

    makeEvent(
      "N04",
      "Noah opens the journal and begins reading.",
      "father's workshop",
      "morning",
      "calm morning",
      2,
      [NOAH.name],
      "old lighthouse journal"
    ),

    makeEvent(
      "N05",
      "The journal warns about a powerful storm approaching the town.",
      "father's workshop",
      "morning",
      "darkening sky outside",
      3,
      [NOAH.name],
      "old lighthouse journal"
    ),

    makeEvent(
      "N06",
      "Noah realizes the warning could threaten the coastal town.",
      "father's workshop",
      "morning",
      "darkening sky",
      2,
      [NOAH.name]
    ),

    makeEvent(
      "N07",
      "Noah leaves the workshop to warn the villagers.",
      "town street",
      "late morning",
      "strongening wind",
      2,
      [NOAH.name]
    ),

    makeEvent(
      "N08",
      "Noah warns the villagers about the approaching storm.",
      "town square",
      "late morning",
      "strong wind",
      2,
      [NOAH.name, VILLAGERS.name]
    ),

    makeEvent(
      "N09",
      "The villagers doubt Noah's warning.",
      "town square",
      "late morning",
      "strong wind",
      2,
      [NOAH.name, VILLAGERS.name]
    ),

    makeEvent(
      "N10",
      "Noah looks toward the darkening horizon.",
      "town square",
      "late morning",
      "dark storm clouds",
      1,
      [NOAH.name]
    ),

    makeEvent(
      "N11",
      "The storm begins moving toward the town.",
      "coastal town",
      "afternoon",
      "dark storm clouds and heavy wind",
      2,
      [VILLAGERS.name]
    ),

    makeEvent(
      "N12",
      "Heavy rain begins falling.",
      "coastal town",
      "afternoon",
      "heavy rain",
      1,
      [VILLAGERS.name]
    ),

    makeEvent(
      "N13",
      "The lighthouse signal suddenly stops working.",
      "coastal lighthouse",
      "afternoon",
      "heavy rain and strong wind",
      3,
      [],
      "lighthouse signal"
    ),

    makeEvent(
      "N14",
      "Noah notices that boats approaching the harbor are in danger.",
      "coastal town",
      "afternoon",
      "heavy rain",
      2,
      [NOAH.name]
    ),

    makeEvent(
      "N15",
      "Noah decides to repair the lighthouse signal himself.",
      "coastal town",
      "afternoon",
      "heavy rain and strong wind",
      2,
      [NOAH.name]
    ),

    makeEvent(
      "N16",
      "Noah runs through the storm toward the lighthouse.",
      "coastal road",
      "afternoon",
      "heavy rain and strong wind",
      3,
      [NOAH.name]
    ),

    makeEvent(
      "N17",
      "Noah reaches the lighthouse entrance.",
      "lighthouse entrance",
      "afternoon",
      "heavy rain",
      1,
      [NOAH.name]
    ),

    makeEvent(
      "N18",
      "Noah climbs the lighthouse stairs toward the signal room.",
      "lighthouse stairs",
      "afternoon",
      "storm outside",
      3,
      [NOAH.name]
    ),

    makeEvent(
      "N19",
      "Noah enters the signal room.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      1,
      [NOAH.name]
    ),

    makeEvent(
      "N20",
      "Noah examines the damaged signal mechanism.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      3,
      [NOAH.name],
      "damaged lighthouse mechanism"
    ),

    makeEvent(
      "N21",
      "Noah begins repairing the damaged mechanism.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      3,
      [NOAH.name],
      "damaged lighthouse mechanism"
    ),

    makeEvent(
      "N22",
      "Noah reconnects the damaged components.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      3,
      [NOAH.name],
      "lighthouse mechanism"
    ),

    makeEvent(
      "N23",
      "The lighthouse mechanism begins moving again.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      2,
      [NOAH.name],
      "lighthouse mechanism"
    ),

    makeEvent(
      "N24",
      "The lighthouse signal turns back on.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      3,
      [NOAH.name],
      "lighthouse signal"
    ),

    makeEvent(
      "N25",
      "Noah sees the restored beam sweeping across the sea.",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      2,
      [NOAH.name],
      "lighthouse signal"
    ),

    makeEvent(
      "N26",
      "A rescue boat follows the restored lighthouse beam toward the harbor.",
      "open sea",
      "afternoon",
      "heavy rain",
      3,
      [RESCUE_CREW.name],
      "rescue boat"
    ),

    makeEvent(
      "N27",
      "The rescue boat reaches the harbor safely.",
      "harbor",
      "afternoon",
      "rain beginning to weaken",
      3,
      [RESCUE_CREW.name, VILLAGERS.name],
      "rescue boat"
    ),

    makeEvent(
      "N28",
      "By the next morning, the storm has passed.",
      "coastal town",
      "next morning",
      "clear morning",
      2,
      [NOAH.name, VILLAGERS.name]
    ),

    makeEvent(
      "N29",
      "The villagers thank Noah for helping save the town.",
      "town square",
      "next morning",
      "clear morning",
      3,
      [NOAH.name, VILLAGERS.name]
    ),

    makeEvent(
      "N30",
      "Noah looks toward the lighthouse as the town begins recovering.",
      "town square",
      "next morning",
      "clear morning",
      2,
      [NOAH.name],
      "lighthouse"
    )
  ];
}

/* =========================================================
   HELPERS
========================================================= */

function textOf(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value
      .map((item) => textOf(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    if (value.name) return String(value.name);
    if (value.description) return String(value.description);
    return Object.values(value)
      .map((item) => textOf(item))
      .filter(Boolean)
      .join(", ");
  }

  return String(value);
}

function uniqueStrings(items = []) {
  return [...new Set(
    items
      .map((item) => textOf(item).trim())
      .filter(Boolean)
  )];
}

function uniqueCharacters(events) {
  return uniqueStrings(
    events.flatMap((event) => event.characters || [])
  );
}

function uniqueObjects(events) {
  return uniqueStrings(
    events.map((event) => event.object)
  );
}

function sameState(events) {
  if (!events.length) return true;

  const location = events[0].location;
  const time = events[0].time;
  const weather = events[0].weather;

  return events.every(
    (event) =>
      event.location === location &&
      event.time === time &&
      event.weather === weather
  );
}

/* =========================================================
   EXACT 10-SECOND BEAT SCHEDULER
========================================================= */

function scheduleDurations(events, totalSeconds = 10) {
  if (!events.length) return [];

  /*
   Each event gets at least 1 second.
   Remaining seconds are distributed by weight.
   Final result ALWAYS equals totalSeconds.
  */

  if (events.length > totalSeconds) {
    const reduced = [];

    for (let i = 0; i < events.length; i += 2) {
      const first = events[i];
      const second = events[i + 1];

      if (!second) {
        reduced.push({
          ...first,
          action: first.action
        });
      } else {
        reduced.push({
          ...first,
          id: `${first.id}_${second.id}`,
          action: `${first.action} ${second.action}`
        });
      }
    }

    return scheduleDurations(reduced, totalSeconds);
  }

  const durations = events.map(() => 1);

  let remaining =
    totalSeconds - durations.reduce((a, b) => a + b, 0);

  while (remaining > 0) {
    let bestIndex = 0;

    for (let i = 1; i < events.length; i++) {
      const currentScore =
        events[i].weight / durations[i];

      const bestScore =
        events[bestIndex].weight / durations[bestIndex];

      if (currentScore > bestScore) {
        bestIndex = i;
      }
    }

    durations[bestIndex]++;
    remaining--;
  }

  return durations;
}

function createTransitionBeat(start, end, fromState, toState) {
  return {
    event_id: "TRANSITION",
    start_time: start,
    end_time: end,
    duration_seconds: end - start,
    type: "cinematic_transition",
    action:
      `Cinematic transition from ${fromState} to ${toState}.`,
    location: toState,
    time_state: toState,
    weather: ""
  };
}

function createBeats(events) {
  if (!events.length) return [];

  const durations = scheduleDurations(events, SCENE_DURATION);

  const beats = [];

  let cursor = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const duration = durations[i];

    beats.push({
      event_id: event.id,
      start_time: cursor,
      end_time: cursor + duration,
      duration_seconds: duration,
      type: "story_beat",
      action: event.action,
      location: textOf(event.location),
      time_state: textOf(event.time),
      weather: textOf(event.weather)
    });

    cursor += duration;
  }

  /*
   Absolute safety:
   last beat ALWAYS ends at exactly 10 seconds.
  */

  if (beats.length) {
    beats[beats.length - 1].end_time = SCENE_DURATION;
    beats[beats.length - 1].duration_seconds =
      SCENE_DURATION - beats[beats.length - 1].start_time;
  }

  return beats;
}

/* =========================================================
   VISUAL PROMPT
========================================================= */

function createVisualPrompt(events, beats) {
  const characterText = uniqueCharacters(events).join("; ");
  const objectText = uniqueObjects(events).join(", ");

  const beatText = beats
    .map(
      (beat) =>
        `${beat.start_time}-${beat.end_time}s: ${beat.action}`
    )
    .join(" ");

  return [
    "Cinematic AI video scene.",
    "Maintain exact character identity, age, face, hairstyle, clothing, body proportions and visual continuity.",
    characterText
      ? `Characters: ${characterText}.`
      : "",
    objectText
      ? `Important objects: ${objectText}.`
      : "",
    `Timed action: ${beatText}`,
    "Natural motion, physically believable movement, consistent environment, detailed cinematic composition."
  ]
    .filter(Boolean)
    .join(" ");
}

/* =========================================================
   CAMERA
========================================================= */

function createCamera(events) {
  const actions = events.map((e) => e.action.toLowerCase()).join(" ");

  if (
    actions.includes("runs") ||
    actions.includes("climbs") ||
    actions.includes("moving")
  ) {
    return "Dynamic tracking shot with controlled cinematic movement.";
  }

  if (
    actions.includes("discovers") ||
    actions.includes("opens") ||
    actions.includes("examines")
  ) {
    return "Slow cinematic push-in with close-up detail shots.";
  }

  if (
    actions.includes("thanks") ||
    actions.includes("looks")
  ) {
    return "Stable emotional medium shot followed by a gentle wide shot.";
  }

  return "Cinematic medium and wide shots with smooth controlled camera movement.";
}

/* =========================================================
   LIGHTING
========================================================= */

function createLighting(events) {
  const weather = events
    .map((e) => textOf(e.weather).toLowerCase())
    .join(" ");

  if (weather.includes("storm") || weather.includes("rain")) {
    return "Dark dramatic storm lighting, cool tones, wet atmospheric highlights and realistic volumetric light.";
  }

  if (weather.includes("clear")) {
    return "Soft natural morning light with realistic cinematic highlights.";
  }

  return "Natural cinematic lighting with realistic environmental shadows.";
}

/* =========================================================
   DIALOGUE
========================================================= */

function createDialogue(events) {
  const ids = events.map((e) => e.id);

  if (ids.includes("N05") || ids.includes("N08")) {
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

  if (ids.includes("N15")) {
    return [
      {
        speaker: "Noah",
        text: "Then I'll fix the lighthouse myself."
      }
    ];
  }

  if (ids.includes("N21") || ids.includes("N22")) {
    return [
      {
        speaker: "Noah",
        text: "Come on... work."
      }
    ];
  }

  if (ids.includes("N24") || ids.includes("N25")) {
    return [
      {
        speaker: "Noah",
        text: "Yes! It's working!"
      }
    ];
  }

  if (ids.includes("N29")) {
    return [
      {
        speaker: "Villagers",
        text: "Thank you, Noah. You saved our town."
      }
    ];
  }

  return [];
}

/* =========================================================
   VOICEOVER
========================================================= */

function createVoiceover(events) {
  const ids = events.map((e) => e.id);

  if (ids.includes("N01") || ids.includes("N03")) {
    return "Noah discovers an old lighthouse journal that will change the course of the stormy day.";
  }

  if (ids.includes("N05") || ids.includes("N08")) {
    return "The warning is ignored, but Noah can see the storm approaching.";
  }

  if (ids.includes("N11") || ids.includes("N15")) {
    return "As the storm arrives and the lighthouse fails, Noah decides to act.";
  }

  if (ids.includes("N16") || ids.includes("N20")) {
    return "Noah races through the storm and reaches the damaged lighthouse mechanism.";
  }

  if (ids.includes("N21") || ids.includes("N25")) {
    return "With determination, Noah repairs the mechanism and restores the guiding light.";
  }

  if (ids.includes("N26") || ids.includes("N30")) {
    return "The rescue boat reaches safety, and by morning the grateful town recognizes Noah's courage.";
  }

  return events
    .map((e) => e.action)
    .join(" ");
}

/* =========================================================
   CONTINUITY
========================================================= */

function createContinuity(events, previousScene = null) {
  const characters = uniqueCharacters(events);

  let text =
    `Keep ${characters.join(", ") || "all characters"} visually consistent with previous scenes.`;

  if (previousScene) {
    text +=
      ` Continue naturally from Scene ${previousScene.scene_number} without changing character appearance or important objects.`;
  }

  if (!sameState(events)) {
    text +=
      " This scene contains a deliberate cinematic transition in location, time or weather.";
  } else {
    text +=
      " Maintain continuous location, time of day and weather throughout the scene.";
  }

  return text;
}

/* =========================================================
   SCENE CREATOR
========================================================= */

function makeScene(events, sceneNumber, previousScene = null) {
  const beats = createBeats(events);

  const start =
    (sceneNumber - 1) * SCENE_DURATION;

  const end =
    start + SCENE_DURATION;

  const transitionRequired =
    !sameState(events);

  return {
    scene_number: sceneNumber,
    start_time: start,
    end_time: end,
    duration_seconds: SCENE_DURATION,

    visual_prompt: createVisualPrompt(events, beats),

    camera: createCamera(events),

    lighting: createLighting(events),

    action: events
      .map((e) => e.action)
      .join(" "),

    dialogue: createDialogue(events),

    voiceover: createVoiceover(events),

    continuity: createContinuity(
      events,
      previousScene
    ),

    transition_required: transitionRequired,

    beats,

    characters: uniqueCharacters(events),

    objects: uniqueObjects(events),

    location: textOf(events[0]?.location),

    time_state: textOf(events[0]?.time),

    weather: textOf(events[0]?.weather)
  };
}

/* =========================================================
   60 SECOND STORY
========================================================= */

function build60SecondScenes(events) {
  /*
    Important events are grouped by story purpose.
    Small events are merged inside the timed beat scheduler.
  */

  const groups = [
    ["N01", "N02", "N03", "N04"],

    ["N05", "N06", "N07", "N08", "N09", "N10"],

    ["N11", "N12", "N13", "N14", "N15"],

    ["N16", "N17", "N18", "N19", "N20"],

    ["N21", "N22", "N23", "N24", "N25"],

    ["N26", "N27", "N28", "N29", "N30"]
  ];

  const eventMap = new Map(
    events.map((event) => [event.id, event])
  );

  const scenes = [];

  for (let i = 0; i < groups.length; i++) {
    const sceneEvents = groups[i]
      .map((id) => eventMap.get(id))
      .filter(Boolean);

    scenes.push(
      makeScene(
        sceneEvents,
        i + 1,
        scenes[i - 1] || null
      )
    );
  }

  return scenes;
}

/* =========================================================
   LONG-FORM ENGINE
========================================================= */

function buildLongScenes(events, totalSeconds) {
  const totalScenes =
    Math.ceil(totalSeconds / SCENE_DURATION);

  const scenes = [];

  /*
    For long-form we distribute the complete chronological
    event chain across the required number of scenes.
  */

  const chunks = Array.from(
    { length: totalScenes },
    () => []
  );

  for (let i = 0; i < events.length; i++) {
    const index =
      Math.min(
        totalScenes - 1,
        Math.floor(
          (i / events.length) * totalScenes
        )
      );

    chunks[index].push(events[i]);
  }

  /*
    Empty scenes inherit nearby story context instead of
    producing random filler.
  */

  let lastNonEmpty = [];

  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].length) {
      lastNonEmpty = chunks[i];
    } else if (lastNonEmpty.length) {
      chunks[i] = lastNonEmpty.slice(-2);
    }
  }

  for (let i = 0; i < chunks.length; i++) {
    scenes.push(
      makeScene(
        chunks[i],
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

function validateScenes(scenes, totalDuration) {
  const errors = [];

  const expectedScenes =
    Math.ceil(totalDuration / SCENE_DURATION);

  if (scenes.length !== expectedScenes) {
    errors.push(
      `Expected ${expectedScenes} scenes but got ${scenes.length}.`
    );
  }

  for (const scene of scenes) {
    if (scene.duration_seconds !== SCENE_DURATION) {
      errors.push(
        `Scene ${scene.scene_number} is not exactly 10 seconds.`
      );
    }

    if (!Array.isArray(scene.beats)) {
      errors.push(
        `Scene ${scene.scene_number} has no beat schedule.`
      );
      continue;
    }

    const beatTotal = scene.beats.reduce(
      (sum, beat) =>
        sum + Number(beat.duration_seconds || 0),
      0
    );

    if (beatTotal !== SCENE_DURATION) {
      errors.push(
        `Scene ${scene.scene_number} beat total is ${beatTotal}s instead of 10s.`
      );
    }

    if (scene.beats.length) {
      if (scene.beats[0].start_time !== 0) {
        errors.push(
          `Scene ${scene.scene_number} does not start at 0s.`
        );
      }

      const last =
        scene.beats[scene.beats.length - 1];

      if (last.end_time !== 10) {
        errors.push(
          `Scene ${scene.scene_number} does not end at 10s.`
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
   API
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message: "SANAPTAI API is working.",
    engine_version: ENGINE_VERSION
  });
});

/*
  Gemini deliberately disabled during engine testing.
*/

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    status: "disabled",
    message:
      "Gemini scene planning is temporarily disabled during SANAPTAI engine testing.",
    engine_version: ENGINE_VERSION
  });
});

/* =========================================================
   DEMO PROJECT
========================================================= */

app.post("/api/demo-project", (req, res) => {
  try {
    const prompt =
      textOf(req.body?.prompt) ||
      "A 14-year-old boy named Noah saves his coastal town from a powerful storm.";

    const duration =
      Number(req.body?.duration) || 60;

    const aspectRatio =
      textOf(req.body?.aspectRatio) || "16:9";

    if (!ALLOWED_DURATIONS.includes(duration)) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid duration. Allowed durations: 10, 30, 60, 300, 600, 1200."
      });
    }

    /*
      Current engine test uses the Noah story so that timing,
      continuity and scene scheduling can be verified reliably.
    */

    const events = getTestEvents();

    let scenes;

    if (duration === 60) {
      scenes = build60SecondScenes(events);
    } else if (duration === 10) {
      scenes = [
        makeScene(
          events.slice(0, 4),
          1
        )
      ];
    } else {
      scenes = buildLongScenes(
        events,
        duration
      );
    }

    /*
      Adjust final scene timing for durations that are not
      multiples of 10. Current allowed durations are all
      multiples of 10, so this remains safe.
    */

    const validation =
      validateScenes(
        scenes,
        duration
      );

    return res.json({
      status: "success",

      engine_version: ENGINE_VERSION,

      mode: "DEMO_ENGINE",

      gemini_enabled: false,

      prompt,

      duration,

      total_scenes: scenes.length,

      aspect_ratio: aspectRatio,

      scene_duration_seconds: SCENE_DURATION,

      exact_timing: true,

      validation,

      characters: {
        Noah: NOAH.description,
        Father: FATHER.description,
        Villagers: VILLAGERS.description,
        RescueCrew: RESCUE_CREW.description
      },

      scenes
    });

  } catch (error) {
    console.error(
      "SANAPTAI ENGINE ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: error.message,
      engine_version: ENGINE_VERSION
    });
  }
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
   SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
  );
});
