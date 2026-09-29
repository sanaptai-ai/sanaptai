import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "V32.1";
const SCENE_DURATION = 10;

const ALLOWED_DURATIONS = [10, 30, 60, 300, 600, 1200];

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
   EVENT WEIGHTS
   ========================================================= */

const WEIGHT = {
  opening: 1,
  discovery: 2,
  reading: 1,
  warning: 2,
  doubt: 1,
  realization: 1,
  decision: 1,
  movement: 1,
  travel: 2,
  climb: 2,
  inspection: 1,
  repair_start: 1,
  repair: 2,
  repair_complete: 2,
  storm: 2,
  failure: 1,
  climax: 2,
  rescue: 2,
  resolution: 2,
  gratitude: 2
};

/* =========================================================
   EVENT CREATOR
   ========================================================= */

function makeEvent({
  id,
  type,
  phase,
  location,
  time,
  weather,
  characters = [],
  objects = [],
  action,
  importance = 1
}) {
  return {
    id,
    type,
    phase,
    location,
    time,
    weather,
    characters,
    objects,
    action,
    weight: WEIGHT[type] || 1,
    importance
  };
}

/* =========================================================
   NOAH STORY EVENTS
   IMPORTANT:
   These are chronological atomic events.
   They are NOT scenes.
   ========================================================= */

function getNoahEvents() {
  return [
    makeEvent({
      id: "N01",
      type: "opening",
      phase: "setup",
      location: "small coastal town",
      time: "morning",
      weather: "calm morning",
      characters: [NOAH, FATHER],
      action:
        "Noah lives with his father in a small coastal town."
    }),

    makeEvent({
      id: "N02",
      type: "movement",
      phase: "setup",
      location: "father's workshop",
      time: "morning",
      weather: "calm morning",
      characters: [NOAH],
      action:
        "Noah enters his father's workshop."
    }),

    makeEvent({
      id: "N03",
      type: "discovery",
      phase: "inciting",
      location: "father's workshop",
      time: "morning",
      weather: "calm morning",
      characters: [NOAH],
      objects: ["old lighthouse journal"],
      action:
        "Noah discovers an old lighthouse journal on the workbench.",
      importance: 2
    }),

    makeEvent({
      id: "N04",
      type: "reading",
      phase: "inciting",
      location: "father's workshop",
      time: "morning",
      weather: "calm morning",
      characters: [NOAH],
      objects: ["old lighthouse journal"],
      action:
        "Noah opens the journal and begins reading it."
    }),

    makeEvent({
      id: "N05",
      type: "warning",
      phase: "rising",
      location: "father's workshop",
      time: "morning",
      weather: "calm morning",
      characters: [NOAH],
      objects: ["old lighthouse journal"],
      action:
        "The journal warns Noah about a powerful storm approaching the town.",
      importance: 2
    }),

    makeEvent({
      id: "N06",
      type: "realization",
      phase: "rising",
      location: "father's workshop",
      time: "morning",
      weather: "calm morning",
      characters: [NOAH],
      objects: ["old lighthouse journal"],
      action:
        "Noah realizes the warning could threaten the town."
    }),

    makeEvent({
      id: "N07",
      type: "movement",
      phase: "rising",
      location: "coastal town",
      time: "late morning",
      weather: "clouds beginning to gather",
      characters: [NOAH],
      action:
        "Noah leaves the workshop and heads toward the villagers."
    }),

    makeEvent({
      id: "N08",
      type: "warning",
      phase: "rising",
      location: "coastal town",
      time: "late morning",
      weather: "clouds beginning to gather",
      characters: [NOAH, VILLAGERS],
      objects: ["old lighthouse journal"],
      action:
        "Noah urgently warns the villagers about the approaching storm.",
      importance: 2
    }),

    makeEvent({
      id: "N09",
      type: "doubt",
      phase: "rising",
      location: "coastal town",
      time: "late morning",
      weather: "clouds beginning to gather",
      characters: [NOAH, VILLAGERS],
      action:
        "The villagers doubt Noah's warning."
    }),

    makeEvent({
      id: "N10",
      type: "reaction",
      phase: "rising",
      location: "coastal town",
      time: "late morning",
      weather: "darkening sky",
      characters: [NOAH],
      action:
        "Noah looks toward the distant horizon, worried."
    }),

    makeEvent({
      id: "N11",
      type: "storm",
      phase: "crisis",
      location: "coastal town",
      time: "afternoon",
      weather: "dark storm clouds",
      characters: [NOAH, VILLAGERS],
      action:
        "Dark storm clouds rapidly cover the sky.",
      importance: 2
    }),

    makeEvent({
      id: "N12",
      type: "storm",
      phase: "crisis",
      location: "coastal town",
      time: "afternoon",
      weather: "powerful wind and heavy rain",
      characters: [NOAH, VILLAGERS],
      action:
        "Strong wind and heavy rain strike the town.",
      importance: 2
    }),

    makeEvent({
      id: "N13",
      type: "failure",
      phase: "crisis",
      location: "coastal town",
      time: "afternoon",
      weather: "violent storm",
      characters: [NOAH],
      objects: ["lighthouse"],
      action:
        "Noah notices that the lighthouse signal has stopped working.",
      importance: 2
    }),

    makeEvent({
      id: "N14",
      type: "realization",
      phase: "crisis",
      location: "coastal town",
      time: "afternoon",
      weather: "violent storm",
      characters: [NOAH],
      objects: ["lighthouse"],
      action:
        "Noah realizes boats approaching the harbor may be in danger."
    }),

    makeEvent({
      id: "N15",
      type: "decision",
      phase: "crisis",
      location: "coastal town",
      time: "afternoon",
      weather: "violent storm",
      characters: [NOAH],
      action:
        "Noah decides to repair the lighthouse signal before boats reach the harbor.",
      importance: 2
    }),

    makeEvent({
      id: "N16",
      type: "movement",
      phase: "climax",
      location: "coastal road",
      time: "afternoon",
      weather: "heavy rain and strong wind",
      characters: [NOAH],
      action:
        "Noah runs through the storm toward the lighthouse.",
      importance: 2
    }),

    makeEvent({
      id: "N17",
      type: "travel",
      phase: "climax",
      location: "lighthouse exterior",
      time: "afternoon",
      weather: "heavy rain and strong wind",
      characters: [NOAH],
      objects: ["lighthouse"],
      action:
        "Noah reaches the lighthouse entrance."
    }),

    makeEvent({
      id: "N18",
      type: "climb",
      phase: "climax",
      location: "lighthouse staircase",
      time: "afternoon",
      weather: "storm outside",
      characters: [NOAH],
      objects: ["lighthouse"],
      action:
        "Noah climbs the lighthouse stairs toward the signal room.",
      importance: 2
    }),

    makeEvent({
      id: "N19",
      type: "movement",
      phase: "climax",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: [NOAH],
      action:
        "Noah enters the signal room."
    }),

    makeEvent({
      id: "N20",
      type: "inspection",
      phase: "climax",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: [NOAH],
      objects: ["damaged signal mechanism"],
      action:
        "Noah examines the damaged signal mechanism.",
      importance: 2
    }),

    makeEvent({
      id: "N21",
      type: "repair_start",
      phase: "climax",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: [NOAH],
      objects: ["damaged signal mechanism"],
      action:
        "Noah begins repairing the damaged mechanism."
    }),

    makeEvent({
      id: "N22",
      type: "repair",
      phase: "climax",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: [NOAH],
      objects: ["damaged signal mechanism"],
      action:
        "Noah works carefully on the damaged mechanism.",
      importance: 2
    }),

    makeEvent({
      id: "N23",
      type: "repair",
      phase: "climax",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: [NOAH],
      objects: ["damaged signal mechanism"],
      action:
        "Noah reconnects the damaged components.",
      importance: 2
    }),

    makeEvent({
      id: "N24",
      type: "repair_complete",
      phase: "climax",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: [NOAH],
      objects: ["lighthouse signal"],
      action:
        "The repaired mechanism starts working again.",
      importance: 2
    }),

    makeEvent({
      id: "N25",
      type: "climax",
      phase: "climax",
      location: "lighthouse signal room",
      time: "afternoon",
      weather: "storm outside",
      characters: [NOAH],
      objects: ["lighthouse signal"],
      action:
        "The lighthouse signal turns back on and sends its beam across the stormy sea.",
      importance: 3
    }),

    makeEvent({
      id: "N26",
      type: "rescue",
      phase: "resolution",
      location: "harbor",
      time: "evening",
      weather: "storm beginning to weaken",
      characters: [RESCUE_CREW],
      objects: ["rescue boat", "lighthouse signal"],
      action:
        "A rescue boat follows the restored lighthouse signal toward the harbor.",
      importance: 3
    }),

    makeEvent({
      id: "N27",
      type: "rescue",
      phase: "resolution",
      location: "harbor",
      time: "evening",
      weather: "storm weakening",
      characters: [RESCUE_CREW],
      objects: ["rescue boat"],
      action:
        "The rescue boat reaches the harbor safely.",
      importance: 2
    }),

    makeEvent({
      id: "N28",
      type: "resolution",
      phase: "resolution",
      location: "coastal town",
      time: "next morning",
      weather: "clear sky after the storm",
      characters: [NOAH, VILLAGERS],
      action:
        "By morning, the storm has passed and the town is safe.",
      importance: 2
    }),

    makeEvent({
      id: "N29",
      type: "gratitude",
      phase: "resolution",
      location: "coastal town",
      time: "next morning",
      weather: "clear sky after the storm",
      characters: [NOAH, VILLAGERS],
      action:
        "The villagers gather around Noah and thank him for helping save the town.",
      importance: 2
    }),

    makeEvent({
      id: "N30",
      type: "resolution",
      phase: "resolution",
      location: "coastal town",
      time: "next morning",
      weather: "clear sky after the storm",
      characters: [NOAH, VILLAGERS],
      objects: ["lighthouse"],
      action:
        "Noah looks toward the lighthouse, knowing the town was saved.",
      importance: 2
    })
  ];
}

/* =========================================================
   HELPERS
   ========================================================= */

function uniqueByName(items = []) {
  const map = new Map();

  for (const item of items) {
    if (!item) continue;

    if (typeof item === "string") {
      map.set(item, item);
    } else if (item.name) {
      map.set(item.name, item);
    }
  }

  return [...map.values()];
}

function namesOf(items = []) {
  return items
    .map((item) =>
      typeof item === "string" ? item : item?.name
    )
    .filter(Boolean);
}

function textOfWeather(value) {
  if (!value) return "natural weather";

  if (typeof value === "string") {
    return value;
  }

  return String(value);
}

function sameState(a, b) {
  return (
    a.location === b.location &&
    a.time === b.time &&
    a.weather === b.weather
  );
}

/* =========================================================
   60 SECOND MASTER SCENE MAP
   This is generated from the chronological event model.
   ========================================================= */

function build60SecondScenes(events) {
  /*
   * Six cinematic chapters.
   *
   * Each chapter contains only logically connected events.
   * This prevents the old bug where every leftover event
   * was dumped into Scene 6.
   */

  const groups = [
    ["N01", "N02", "N03", "N04"],
    ["N05", "N06", "N07", "N08", "N09", "N10"],
    ["N11", "N12", "N13", "N14", "N15"],
    ["N16", "N17", "N18", "N19", "N20"],
    ["N21", "N22", "N23", "N24", "N25"],
    ["N26", "N27", "N28", "N29", "N30"]
  ];

  return groups.map((ids, index) => {
    const groupEvents = ids
      .map((id) => events.find((e) => e.id === id))
      .filter(Boolean);

    return makeScene(
      groupEvents,
      index + 1,
      60
    );
  });
}

/* =========================================================
   LONG-FORM DISTRIBUTION
   ========================================================= */

function buildLongScenes(events, duration) {
  const count = Math.ceil(
    duration / SCENE_DURATION
  );

  /*
   * For long-form, distribute the complete chronological
   * event list across scene slots while preserving order.
   *
   * Events are never randomly sampled.
   */

  const scenes = [];

  let cursor = 0;

  for (let sceneNumber = 1; sceneNumber <= count; sceneNumber++) {
    const remainingEvents = events.length - cursor;
    const remainingScenes = count - sceneNumber + 1;

    if (remainingEvents <= 0) {
      scenes.push(
        makeEmptyContinuationScene(
          sceneNumber,
          duration
        )
      );
      continue;
    }

    /*
     * Target approximately equal event density while
     * always preserving chronology.
     */
    let take = Math.ceil(
      remainingEvents / remainingScenes
    );

    /*
     * Avoid excessively large action bundles.
     */
    take = Math.min(take, 4);

    const selected = events.slice(
      cursor,
      cursor + take
    );

    cursor += selected.length;

    scenes.push(
      makeScene(
        selected,
        sceneNumber,
        duration
      )
    );
  }

  /*
   * If events remain because of strict 4-event limit,
   * merge them forward carefully rather than dumping them
   * into the last scene.
   */
  while (
    cursor < events.length &&
    scenes.length > 0
  ) {
    const targetIndex = scenes.length - 1;

    const extra = events[cursor];
    cursor++;

    scenes[targetIndex] = makeScene(
      [
        ...scenes[targetIndex]._events,
        extra
      ],
      targetIndex + 1,
      duration
    );
  }

  return scenes;
}

/* =========================================================
   SCENE CREATION
   ========================================================= */

function makeScene(events, sceneNumber, duration) {
  const first = events[0];
  const last = events[events.length - 1];

  const transition =
    events.some((event, i) => {
      if (i === 0) return false;
      return !sameState(events[i - 1], event);
    });

  const characters = uniqueByName(
    events.flatMap((e) => e.characters || [])
  );

  const objects = [
    ...new Set(
      events.flatMap((e) => e.objects || [])
    )
  ];

  const locations = [
    ...new Set(events.map((e) => e.location))
  ];

  const times = [
    ...new Set(events.map((e) => e.time))
  ];

  const weather = [
    ...new Set(
      events.map((e) => textOfWeather(e.weather))
    )
  ];

  const totalWeight = events.reduce(
    (sum, e) => sum + e.weight,
    0
  );

  const majorCount = events.filter(
    (e) => e.importance >= 2
  ).length;

  const beats = createBeats(events);

  const visualPrompt = createVisualPrompt({
    events,
    characters,
    objects,
    locations,
    times,
    weather,
    transition
  });

  const action = events
    .map((e) => e.action)
    .join(" ");

  const dialogue = createDialogue(events);

  const voiceover = createVoiceover(events);

  const scene = {
    scene_number: sceneNumber,
    start_time:
      (sceneNumber - 1) * SCENE_DURATION,
    end_time: Math.min(
      sceneNumber * SCENE_DURATION,
      duration
    ),

    mode: transition
      ? "cinematic_transition"
      : "continuous",

    event_ids: events.map((e) => e.id),

    scene_budget: {
      total_weight: totalWeight,
      major_event_count: majorCount,
      action_count: events.length,
      ten_second_limit: true
    },

    beats,

    characters,

    objects,

    location: locations.join(" → "),

    time_state: times.join(" → "),

    weather: weather.join(" → "),

    visual_prompt: visualPrompt,

    camera: createCamera(events),

    lighting: createLighting(events),

    action,

    dialogue,

    voiceover,

    continuity: createContinuity(
      events,
      transition
    ),

    _events: events
  };

  return scene;
}

function createBeats(events) {
  const totalWeight = events.reduce(
    (sum, e) => sum + e.weight,
    0
  );

  return events.map((e) => {
    const seconds = Math.max(
      1,
      Math.round(
        (e.weight / totalWeight) * 10
      )
    );

    return {
      event_id: e.id,
      duration_hint_seconds: seconds,
      action: e.action,
      location: e.location,
      time_state: e.time,
      weather: e.weather
    };
  });
}

/* =========================================================
   VISUAL PROMPT
   ========================================================= */

function createVisualPrompt({
  events,
  characters,
  objects,
  locations,
  times,
  weather,
  transition
}) {
  const characterText = characters
    .map((c) =>
      typeof c === "string"
        ? c
        : `${c.name}: ${c.description}`
    )
    .join("; ");

  const objectText =
    objects.length > 0
      ? objects.join(", ")
      : "none";

  const actionText = events
    .map((e) => e.action)
    .join(" Then ");

  let prompt =
    `${characterText}. ` +
    `Location: ${locations.join(" → ")}. ` +
    `Time: ${times.join(" → ")}. ` +
    `Weather: ${weather.join(" → ")}. ` +
    `Objects: ${objectText}. ` +
    `Action: ${actionText}. ` +
    `Maintain exact character appearance, age, face, hairstyle, clothing, body proportions and object continuity. `;

  if (transition) {
    prompt +=
      "Use an explicit cinematic transition when time or location changes. Do not portray different times as happening simultaneously.";
  } else {
    prompt +=
      "Keep the action in continuous chronological time without unexplained jumps.";
  }

  return prompt;
}

/* =========================================================
   CAMERA
   ========================================================= */

function createCamera(events) {
  const types = events.map((e) => e.type);

  if (types.includes("discovery")) {
    return "Slow cinematic push-in toward the lighthouse journal, followed by a close-up of Noah opening it.";
  }

  if (
    types.includes("warning") ||
    types.includes("doubt")
  ) {
    return "Medium shot of Noah warning the villagers, followed by natural reaction shots.";
  }

  if (types.includes("storm")) {
    return "Wide coastal establishing shot followed by dynamic tracking shots showing the storm arriving.";
  }

  if (types.includes("failure")) {
    return "Medium shot of Noah noticing the dark lighthouse, followed by a close-up of the failed signal.";
  }

  if (types.includes("decision")) {
    return "Close-up on Noah's determined expression, then a dynamic tracking shot as he starts moving.";
  }

  if (types.includes("travel")) {
    return "Dynamic tracking shot following Noah through the storm toward the lighthouse.";
  }

  if (types.includes("climb")) {
    return "Upward tracking shot following Noah climbing the lighthouse staircase.";
  }

  if (types.includes("inspection")) {
    return "Over-the-shoulder shot followed by a detailed close-up of the damaged mechanism.";
  }

  if (
    types.includes("repair") ||
    types.includes("repair_start")
  ) {
    return "Tight close-ups of Noah's hands repairing the mechanism with controlled over-the-shoulder framing.";
  }

  if (
    types.includes("repair_complete") ||
    types.includes("climax")
  ) {
    return "Close-up of the mechanism activating, followed by a dramatic wide shot of the lighthouse beam.";
  }

  if (types.includes("rescue")) {
    return "Wide harbor shot followed by a tracking shot of the rescue boat entering safely.";
  }

  if (
    types.includes("gratitude") ||
    types.includes("resolution")
  ) {
    return "Warm medium shots of Noah and the villagers, ending on a peaceful wide shot of the lighthouse.";
  }

  return "Cinematic medium shot with natural camera movement.";
}

/* =========================================================
   LIGHTING
   ========================================================= */

function createLighting(events) {
  const allWeather = events
    .map((e) => textOfWeather(e.weather))
    .join(" ")
    .toLowerCase();

  const allTimes = events
    .map((e) => e.time)
    .join(" ")
    .toLowerCase();

  if (allTimes.includes("next morning")) {
    return "Warm clear morning sunlight after the storm with a peaceful atmosphere.";
  }

  if (
    allWeather.includes("storm") ||
    allWeather.includes("rain") ||
    allWeather.includes("dark clouds") ||
    allWeather.includes("wind")
  ) {
    return "Dark storm lighting, cold gray daylight, wet reflective surfaces and dramatic atmospheric contrast.";
  }

  if (allTimes.includes("evening")) {
    return "Dim evening light with the lighthouse beam cutting clearly through the atmosphere.";
  }

  return "Soft natural morning light with realistic cinematic coastal atmosphere.";
}

/* =========================================================
   DIALOGUE
   ========================================================= */

function createDialogue(events) {
  const lines = [];

  for (const e of events) {
    if (
      e.type === "warning" &&
      e.characters.some(
        (c) =>
          typeof c !== "string" &&
          c.name === "Noah"
      )
    ) {
      lines.push(
        "Noah: A powerful storm is coming. We need to prepare now."
      );
    }

    if (e.type === "doubt") {
      lines.push(
        "Villager: Noah, you're just imagining it."
      );
    }

    if (e.type === "decision") {
      lines.push(
        "Noah: Then I'll fix the lighthouse myself."
      );
    }

    if (e.type === "repair_start") {
      lines.push("Noah: Come on... work.");
    }

    if (e.type === "repair_complete") {
      lines.push("Noah: Yes! It's working!");
    }

    if (e.type === "gratitude") {
      lines.push(
        "Villager: Noah, you helped save our town. Thank you."
      );
    }
  }

  /*
   * Maximum two short dialogue lines per 10-second scene.
   */
  return [...new Set(lines)].slice(0, 2).join(" ");
}

/* =========================================================
   VOICEOVER
   ========================================================= */

function createVoiceover(events) {
  const important = events
    .filter(
      (e) =>
        e.importance >= 2 ||
        [
          "warning",
          "failure",
          "decision",
          "climax",
          "rescue",
          "resolution",
          "gratitude"
        ].includes(e.type)
    )
    .map((e) => e.action);

  if (important.length === 0) {
    return events[0]?.action || "";
  }

  return important.join(" ");
}

/* =========================================================
   CONTINUITY
   ========================================================= */

function createContinuity(events, transition) {
  const characters = uniqueByName(
    events.flatMap((e) => e.characters || [])
  );

  const names = namesOf(characters);

  let text =
    `Maintain exact continuity for ${names.join(
      ", "
    ) || "all characters"}. ` +
    "Keep face, age, hairstyle, clothing, body proportions and important objects consistent. ";

  if (transition) {
    text +=
      "This scene contains a deliberate cinematic time or location transition. Clearly show the transition rather than mixing the moments together.";
  } else {
    text +=
      "All actions occur in continuous chronological time with no unexplained time or location jump.";
  }

  return text;
}

/* =========================================================
   EMPTY CONTINUATION
   ========================================================= */

function makeEmptyContinuationScene(
  sceneNumber,
  duration
) {
  return {
    scene_number: sceneNumber,
    start_time:
      (sceneNumber - 1) * SCENE_DURATION,
    end_time: Math.min(
      sceneNumber * SCENE_DURATION,
      duration
    ),
    mode: "continuous",
    event_ids: [],
    scene_budget: {
      total_weight: 0,
      major_event_count: 0,
      action_count: 0,
      ten_second_limit: true
    },
    beats: [],
    characters: [],
    objects: [],
    location: "",
    time_state: "",
    weather: "",
    visual_prompt:
      "Continue the established story world and character continuity.",
    camera: "Cinematic establishing shot.",
    lighting: "Natural cinematic lighting.",
    action:
      "Continue the story naturally without introducing unrelated events.",
    dialogue: "",
    voiceover: "",
    continuity:
      "Maintain all established character and world continuity."
  };
}

/* =========================================================
   VALIDATION
   ========================================================= */

function validateScenes(scenes, duration) {
  const errors = [];
  const warnings = [];

  const expected =
    Math.ceil(duration / SCENE_DURATION);

  if (scenes.length !== expected) {
    errors.push(
      `Expected ${expected} scenes but received ${scenes.length}.`
    );
  }

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    const expectedStart =
      i * SCENE_DURATION;

    const expectedEnd = Math.min(
      (i + 1) * SCENE_DURATION,
      duration
    );

    if (scene.start_time !== expectedStart) {
      errors.push(
        `Scene ${i + 1}: incorrect start time.`
      );
    }

    if (scene.end_time !== expectedEnd) {
      errors.push(
        `Scene ${i + 1}: incorrect end time.`
      );
    }

    if (
      scene.visual_prompt.includes(
        "[object Object]"
      ) ||
      scene.weather.includes("[object Object]")
    ) {
      errors.push(
        `Scene ${i + 1}: object serialization bug detected.`
      );
    }

    if (!scene.beats.length) {
      errors.push(
        `Scene ${i + 1}: no story beats.`
      );
    }

    if (
      scene.scene_budget.total_weight > 5
    ) {
      warnings.push(
        `Scene ${i + 1}: high action density.`
      );
    }
  }

  /*
   * Event duplication check.
   */
  const ids = scenes.flatMap(
    (scene) => scene.event_ids
  );

  const duplicates = ids.filter(
    (id, index) =>
      ids.indexOf(id) !== index
  );

  if (duplicates.length) {
    errors.push(
      `Duplicate events: ${[
        ...new Set(duplicates)
      ].join(", ")}`
    );
  }

  /*
   * Noah-specific completeness validation.
   */
  if (ids.length) {
    const required = [
      "N03",
      "N05",
      "N08",
      "N09",
      "N11",
      "N13",
      "N15",
      "N16",
      "N18",
      "N20",
      "N22",
      "N25",
      "N26",
      "N27",
      "N28",
      "N29"
    ];

    for (const id of required) {
      if (!ids.includes(id)) {
        errors.push(
          `Required story event missing: ${id}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/* =========================================================
   NOAH PLAN
   ========================================================= */

function createNoahPlan(duration, aspectRatio) {
  const events = getNoahEvents();

  let scenes;

  if (duration === 60) {
    /*
     * IMPORTANT:
     * Exactly six fixed chronological chapters.
     */
    scenes = build60SecondScenes(events);
  } else if (duration === 30) {
    /*
     * For 30 sec, preserve the entire story arc.
     */
    const shortEvents = [
      events.find((e) => e.id === "N03"),
      events.find((e) => e.id === "N05"),
      events.find((e) => e.id === "N08"),
      events.find((e) => e.id === "N09"),
      events.find((e) => e.id === "N11"),
      events.find((e) => e.id === "N13"),
      events.find((e) => e.id === "N15"),
      events.find((e) => e.id === "N16"),
      events.find((e) => e.id === "N18"),
      events.find((e) => e.id === "N20"),
      events.find((e) => e.id === "N22"),
      events.find((e) => e.id === "N25"),
      events.find((e) => e.id === "N26"),
      events.find((e) => e.id === "N27"),
      events.find((e) => e.id === "N28"),
      events.find((e) => e.id === "N29")
    ].filter(Boolean);

    const groups = [
      shortEvents.slice(0, 4),
      shortEvents.slice(4, 9),
      shortEvents.slice(9, 12)
    ];

    scenes = groups.map(
      (group, index) =>
        makeScene(
          group,
          index + 1,
          duration
        )
    );
  } else if (duration === 10) {
    /*
     * For a single 10-second clip, create a compressed
     * story trailer rather than randomly selecting an event.
     */
    const trailerEvents = [
      events.find((e) => e.id === "N03"),
      events.find((e) => e.id === "N11"),
      events.find((e) => e.id === "N13"),
      events.find((e) => e.id === "N25"),
      events.find((e) => e.id === "N27"),
      events.find((e) => e.id === "N29")
    ].filter(Boolean);

    scenes = [
      makeScene(
        trailerEvents,
        1,
        duration
      )
    ];
  } else {
    scenes = buildLongScenes(
      events,
      duration
    );
  }

  const validation = validateScenes(
    scenes,
    duration
  );

  return {
    engine: ENGINE_VERSION,
    demo_mode: true,
    gemini_enabled: false,
    duration,
    total_scenes: Math.ceil(
      duration / SCENE_DURATION
    ),
    aspect_ratio: aspectRatio,
    scene_duration: SCENE_DURATION,
    story_type:
      "chronological cinematic story",
    validation,
    scenes
  };
}

/* =========================================================
   GENERIC ENGINE
   ========================================================= */

function createGenericPlan(
  prompt,
  duration,
  aspectRatio
) {
  const sceneCount = Math.ceil(
    duration / SCENE_DURATION
  );

  const scenes = [];

  for (
    let i = 0;
    i < sceneCount;
    i++
  ) {
    scenes.push({
      scene_number: i + 1,
      start_time:
        i * SCENE_DURATION,
      end_time: Math.min(
        (i + 1) * SCENE_DURATION,
        duration
      ),
      mode: "continuous",
      event_ids: [`GEN-${i + 1}`],
      scene_budget: {
        total_weight: 1,
        major_event_count: 0,
        action_count: 1,
        ten_second_limit: true
      },
      beats: [
        {
          event_id: `GEN-${i + 1}`,
          duration_hint_seconds: 10,
          action:
            `Continue the story chronologically from the previous scene: ${prompt}`,
          location: "story-defined location",
          time_state: "story-defined time",
          weather: "story-defined weather"
        }
      ],
      characters: [],
      objects: [],
      location: "story-defined location",
      time_state: "story-defined time",
      weather: "story-defined weather",
      visual_prompt:
        `Create scene ${i + 1} of this story: ${prompt}. Maintain exact character and object continuity and continue chronologically.`,
      camera:
        "Cinematic camera movement appropriate to the current action.",
      lighting:
        "Lighting appropriate to the story's current time and environment.",
      action:
        `Continue the story chronologically from the previous scene.`,
      dialogue: "",
      voiceover:
        "Continue the story naturally and chronologically.",
      continuity:
        "Maintain character, object, location and chronological continuity."
    });
  }

  return scenes;
}

/* =========================================================
   STORY DETECTION
   ========================================================= */

function isNoahStory(prompt) {
  const text =
    String(prompt || "").toLowerCase();

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
    engine: ENGINE_VERSION,
    message:
      "SANAPTAI engine is running successfully."
  });
});

app.post(
  "/api/demo-project",
  (req, res) => {
    try {
      const {
        prompt = "",
        duration = 60,
        aspectRatio = "16:9"
      } = req.body || {};

      const durationNumber =
        Number(duration);

      if (
        !ALLOWED_DURATIONS.includes(
          durationNumber
        )
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid duration. Allowed: " +
            ALLOWED_DURATIONS.join(", ")
        });
      }

      if (!String(prompt).trim()) {
        return res.status(400).json({
          status: "error",
          message:
            "Video prompt is required."
        });
      }

      const plan = isNoahStory(prompt)
        ? createNoahPlan(
            durationNumber,
            aspectRatio
          )
        : {
            engine: ENGINE_VERSION,
            demo_mode: true,
            gemini_enabled: false,
            duration: durationNumber,
            total_scenes: Math.ceil(
              durationNumber /
                SCENE_DURATION
            ),
            aspect_ratio: aspectRatio,
            scene_duration:
              SCENE_DURATION,
            story_type:
              "generic chronological story",
            validation: {
              valid: true,
              errors: [],
              warnings: []
            },
            scenes:
              createGenericPlan(
                prompt,
                durationNumber,
                aspectRatio
              )
          };

      res.json({
        status: "success",
        message:
          `SANAPTAI ${ENGINE_VERSION} project created successfully.`,
        ...plan
      });
    } catch (error) {
      console.error(
        "DEMO PROJECT ERROR:",
        error
      );

      res.status(500).json({
        status: "error",
        engine: ENGINE_VERSION,
        message: error.message
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
      const {
        prompt = "",
        duration = 60,
        aspectRatio = "16:9"
      } = req.body || {};

      const durationNumber =
        Number(duration);

      if (!String(prompt).trim()) {
        return res.status(400).json({
          status: "error",
          message:
            "Video prompt is required."
        });
      }

      if (
        !ALLOWED_DURATIONS.includes(
          durationNumber
        )
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid duration."
        });
      }

      const plan = isNoahStory(prompt)
        ? createNoahPlan(
            durationNumber,
            aspectRatio
          )
        : {
            engine: ENGINE_VERSION,
            demo_mode: true,
            gemini_enabled: false,
            duration: durationNumber,
            total_scenes: Math.ceil(
              durationNumber /
                SCENE_DURATION
            ),
            aspect_ratio: aspectRatio,
            scene_duration:
              SCENE_DURATION,
            scenes:
              createGenericPlan(
                prompt,
                durationNumber,
                aspectRatio
              )
          };

      res.json({
        status: "success",
        project: plan
      });
    } catch (error) {
      console.error(
        "CREATE PROJECT ERROR:",
        error
      );

      res.status(500).json({
        status: "error",
        message: error.message
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
      status: "disabled",
      engine: ENGINE_VERSION,
      message:
        "Gemini scene planning is disabled during engine testing."
    });
  }
);

/* =========================================================
   EXPRESS 5 SAFE FALLBACK
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
});
