import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "V32";
const DEMO_MODE = true;
const GEMINI_ENABLED = false;

const SCENE_DURATION = 10;
const ALLOWED_DURATIONS = [10, 30, 60, 300, 600, 1200];

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   V32 — UNIVERSAL STORY / SCENE ENGINE
   ========================================================= */

const WEIGHTS = {
  discovery: 1,
  opening: 1,
  reaction: 1,
  warning: 1,
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
  failure: 1,
  storm: 1,
  climax: 2,
  rescue: 2,
  resolution: 2,
  gratitude: 2
};

function event(
  id,
  type,
  phase,
  location,
  timeState,
  weather,
  characters,
  objects,
  action,
  importance = 1
) {
  return {
    id,
    type,
    phase,
    location,
    timeState,
    weather,
    characters,
    objects,
    action,
    weight: WEIGHTS[type] || 1,
    importance
  };
}

/* =========================================================
   CHARACTER LOCK
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
   NOAH TEST STORY — ATOMIC EVENTS
   These are story events, not final scenes.
   ========================================================= */

function createNoahEvents() {
  return [
    event(
      "N01",
      "opening",
      "setup",
      "small coastal town",
      "morning",
      "calm",
      [NOAH, FATHER],
      [],
      "Noah lives with his father in a small coastal town.",
      1
    ),

    event(
      "N02",
      "movement",
      "setup",
      "father's workshop",
      "morning",
      [NOAH],
      [],
      "Noah enters his father's workshop.",
      1
    ),

    event(
      "N03",
      "discovery",
      "inciting",
      "father's workshop",
      "morning",
      [NOAH],
      ["old lighthouse journal"],
      "Noah discovers an old lighthouse journal on the workbench.",
      2
    ),

    event(
      "N04",
      "opening",
      "inciting",
      "father's workshop",
      "morning",
      [NOAH],
      ["old lighthouse journal"],
      "Noah opens the journal and begins reading it.",
      1
    ),

    event(
      "N05",
      "warning",
      "rising",
      "father's workshop",
      "morning",
      [NOAH],
      ["old lighthouse journal"],
      "The journal warns Noah about a powerful storm approaching the town.",
      2
    ),

    event(
      "N06",
      "reaction",
      "rising",
      "father's workshop",
      "morning",
      [NOAH],
      ["old lighthouse journal"],
      "Noah realizes the warning could threaten the town.",
      1
    ),

    event(
      "N07",
      "movement",
      "rising",
      "coastal town",
      "late morning",
      [NOAH],
      [],
      "Noah leaves the workshop and heads toward the villagers.",
      1
    ),

    event(
      "N08",
      "warning",
      "rising",
      "coastal town",
      "late morning",
      [NOAH, VILLAGERS],
      ["old lighthouse journal"],
      "Noah urgently warns the villagers about the approaching storm.",
      2
    ),

    event(
      "N09",
      "doubt",
      "rising",
      "coastal town",
      "late morning",
      [NOAH, VILLAGERS],
      [],
      "The villagers doubt Noah's warning.",
      1
    ),

    event(
      "N10",
      "reaction",
      "rising",
      "coastal town",
      "late morning",
      [NOAH, VILLAGERS],
      [],
      "Noah looks toward the distant horizon, worried.",
      1
    ),

    event(
      "N11",
      "storm",
      "crisis",
      "coastal town",
      "afternoon",
      "dark clouds gathering",
      [NOAH, VILLAGERS],
      [],
      "Dark storm clouds rapidly cover the sky.",
      2
    ),

    event(
      "N12",
      "storm",
      "crisis",
      "coastal town",
      "afternoon",
      "powerful wind and heavy rain",
      [NOAH, VILLAGERS],
      [],
      "Strong wind and heavy rain strike the town.",
      2
    ),

    event(
      "N13",
      "failure",
      "crisis",
      "coastal town",
      "afternoon",
      "violent storm",
      [NOAH],
      ["lighthouse"],
      "Noah notices that the lighthouse signal has stopped working.",
      2
    ),

    event(
      "N14",
      "realization",
      "crisis",
      "coastal town",
      "afternoon",
      "violent storm",
      [NOAH],
      ["lighthouse"],
      "Noah realizes boats approaching the harbor may be in danger.",
      1
    ),

    event(
      "N15",
      "decision",
      "crisis",
      "coastal town",
      "afternoon",
      "violent storm",
      [NOAH],
      [],
      "Noah decides he must repair the lighthouse signal.",
      2
    ),

    event(
      "N16",
      "movement",
      "climax",
      "coastal road",
      "afternoon",
      "heavy rain and strong wind",
      [NOAH],
      [],
      "Noah runs through the storm toward the lighthouse.",
      2
    ),

    event(
      "N17",
      "travel",
      "climax",
      "lighthouse exterior",
      "afternoon",
      "heavy rain and strong wind",
      [NOAH],
      ["lighthouse"],
      "Noah reaches the lighthouse entrance.",
      1
    ),

    event(
      "N18",
      "climb",
      "climax",
      "lighthouse staircase",
      "afternoon",
      "storm outside",
      [NOAH],
      ["lighthouse"],
      "Noah climbs the lighthouse stairs toward the signal room.",
      2
    ),

    event(
      "N19",
      "movement",
      "climax",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      [NOAH],
      [],
      "Noah enters the signal room.",
      1
    ),

    event(
      "N20",
      "inspection",
      "climax",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      [NOAH],
      ["damaged signal mechanism"],
      "Noah examines the damaged signal mechanism.",
      2
    ),

    event(
      "N21",
      "repair_start",
      "climax",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      [NOAH],
      ["damaged signal mechanism"],
      "Noah begins repairing the damaged mechanism.",
      1
    ),

    event(
      "N22",
      "repair",
      "climax",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      [NOAH],
      ["damaged signal mechanism"],
      "Noah works carefully on the damaged mechanism.",
      2
    ),

    event(
      "N23",
      "repair",
      "climax",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      [NOAH],
      ["damaged signal mechanism"],
      "Noah reconnects the damaged components.",
      2
    ),

    event(
      "N24",
      "repair_complete",
      "climax",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      [NOAH],
      ["lighthouse signal"],
      "The repaired mechanism starts working again.",
      2
    ),

    event(
      "N25",
      "climax",
      "climax",
      "lighthouse signal room",
      "afternoon",
      "storm outside",
      [NOAH],
      ["lighthouse signal"],
      "The lighthouse signal turns back on and sends its beam across the stormy sea.",
      3
    ),

    event(
      "N26",
      "rescue",
      "resolution",
      "harbor",
      "evening",
      "storm beginning to weaken",
      [NOAH, RESCUE_CREW],
      ["rescue boat", "lighthouse signal"],
      "A rescue boat follows the restored lighthouse signal toward the harbor.",
      3
    ),

    event(
      "N27",
      "rescue",
      "resolution",
      "harbor",
      "evening",
      "storm weakening",
      [RESCUE_CREW],
      ["rescue boat"],
      "The rescue boat reaches the harbor safely.",
      2
    ),

    event(
      "N28",
      "resolution",
      "resolution",
      "coastal town",
      "next morning",
      "clear sky after the storm",
      [NOAH, VILLAGERS],
      [],
      "By morning, the storm has passed and the town is safe.",
      2
    ),

    event(
      "N29",
      "gratitude",
      "resolution",
      "coastal town",
      "next morning",
      "clear sky after the storm",
      [NOAH, VILLAGERS],
      [],
      "The villagers gather around Noah and thank him.",
      2
    ),

    event(
      "N30",
      "resolution",
      "resolution",
      "coastal town",
      "next morning",
      "clear sky after the storm",
      [NOAH, VILLAGERS],
      [],
      "Noah quietly looks toward the lighthouse, knowing the town was saved.",
      2
    )
  ];
}

/* =========================================================
   SCENE BUDGET
   ========================================================= */

const NORMAL_SCENE_MAX_WEIGHT = 4;
const NORMAL_SCENE_MAX_MAJOR_EVENTS = 2;

function isMajor(e) {
  return (
    e.importance >= 2 ||
    [
      "travel",
      "climb",
      "repair",
      "repair_complete",
      "climax",
      "rescue",
      "resolution",
      "gratitude"
    ].includes(e.type)
  );
}

function sameTemporalState(a, b) {
  return (
    a.location === b.location &&
    a.timeState === b.timeState &&
    a.weather === b.weather
  );
}

function isResolutionTransition(a, b) {
  if (!a || !b) return false;

  return (
    a.phase === "resolution" &&
    b.phase === "resolution" &&
    a.timeState !== b.timeState
  );
}

/* =========================================================
   UNIVERSAL EVENT PACKING
   ========================================================= */

function buildScenesFromEvents(events, durationSeconds) {
  const sceneCount = Math.ceil(durationSeconds / SCENE_DURATION);

  const scenes = [];
  let index = 0;

  for (let sceneNumber = 1; sceneNumber <= sceneCount; sceneNumber++) {
    const remainingScenes = sceneCount - sceneNumber + 1;
    const remainingEvents = events.length - index;

    if (remainingEvents <= 0) break;

    let chosen = [];
    let weight = 0;
    let majorCount = 0;

    while (index < events.length) {
      const candidate = events[index];

      const wouldExceedWeight =
        chosen.length > 0 &&
        weight + candidate.weight > NORMAL_SCENE_MAX_WEIGHT;

      const wouldExceedMajor =
        chosen.length > 0 &&
        majorCount + (isMajor(candidate) ? 1 : 0) >
          NORMAL_SCENE_MAX_MAJOR_EVENTS;

      const previous = chosen[chosen.length - 1];

      const temporalBreak =
        previous &&
        !sameTemporalState(previous, candidate);

      const explicitTransition =
        previous &&
        isResolutionTransition(previous, candidate);

      /*
       * A normal scene cannot silently jump location/time/weather.
       * A resolution scene may use one explicit transition.
       */
      if (
        chosen.length > 0 &&
        temporalBreak &&
        !explicitTransition
      ) {
        break;
      }

      if (
        chosen.length > 0 &&
        !explicitTransition &&
        (wouldExceedWeight || wouldExceedMajor)
      ) {
        break;
      }

      /*
       * If we are running out of scenes, allow controlled
       * compression only when events are naturally related.
       */
      if (
        remainingEvents > remainingScenes &&
        chosen.length === 0 &&
        remainingScenes === 1
      ) {
        // handled by controlled final-scene packing below
      }

      chosen.push(candidate);
      weight += candidate.weight;

      if (isMajor(candidate)) {
        majorCount++;
      }

      index++;
    }

    /*
     * Never create an empty scene.
     */
    if (chosen.length === 0 && index < events.length) {
      chosen.push(events[index]);
      index++;
    }

    /*
     * If the final scene still has events, use an explicit
     * transition montage instead of pretending continuity.
     */
    if (
      sceneNumber === sceneCount &&
      index < events.length
    ) {
      while (index < events.length) {
        chosen.push(events[index]);
        index++;
      }
    }

    scenes.push(
      createScene(chosen, sceneNumber, durationSeconds)
    );
  }

  /*
   * If the algorithm produced fewer scenes than required,
   * rebalance the longest scenes.
   */
  return rebalanceScenes(scenes, sceneCount, durationSeconds);
}

/* =========================================================
   SCENE CREATION
   ========================================================= */

function sceneMode(events) {
  if (events.length <= 1) return "continuous";

  for (let i = 1; i < events.length; i++) {
    if (!sameTemporalState(events[i - 1], events[i])) {
      return "transition";
    }
  }

  return "continuous";
}

function buildBeats(events) {
  if (!events.length) return [];

  const totalWeight = events.reduce(
    (sum, e) => sum + e.weight,
    0
  );

  return events.map((e) => {
    const durationHint =
      Math.max(
        1,
        Math.round((e.weight / totalWeight) * 10)
      );

    return {
      event_id: e.id,
      duration_hint_seconds: durationHint,
      action: e.action,
      location: e.location,
      time_state: e.timeState,
      weather: e.weather
    };
  });
}

function createScene(events, sceneNumber, durationSeconds) {
  const first = events[0];
  const last = events[events.length - 1];

  const mode = sceneMode(events);

  const locations = [
    ...new Set(events.map((e) => e.location))
  ];

  const timeStates = [
    ...new Set(events.map((e) => e.timeState))
  ];

  const weatherStates = [
    ...new Set(events.map((e) => e.weather))
  ];

  const characters = [
    ...new Map(
      events
        .flatMap((e) => e.characters || [])
        .map((c) => [c.name, c])
    ).values()
  ];

  const objects = [
    ...new Set(
      events.flatMap((e) => e.objects || [])
    )
  ];

  const actions = events.map((e) => e.action);

  const totalWeight = events.reduce(
    (sum, e) => sum + e.weight,
    0
  );

  const majorEvents = events.filter(isMajor).length;

  const visualPrompt =
    `${characters
      .map((c) => c.description)
      .join("; ")}. ` +
    `Location: ${locations.join(" transitioning to ")}. ` +
    `Time: ${timeStates.join(" transitioning to ")}. ` +
    `Weather: ${weatherStates.join(" transitioning to ")}. ` +
    `Objects: ${objects.length ? objects.join(", ") : "none"}. ` +
    `Action: ${actions.join(" Then ")}. ` +
    `Maintain exact character appearance, clothing, age, body proportions and object continuity. ` +
    (mode === "transition"
      ? "Use a clearly visible cinematic transition for the temporal or location change."
      : "Keep the action temporally continuous without unexplained jumps.");

  const camera = chooseCamera(events);
  const lighting = chooseLighting(events);

  const dialogue = buildDialogue(events);
  const voiceover = buildVoiceover(events);

  return {
    scene_number: sceneNumber,
    start_time: (sceneNumber - 1) * SCENE_DURATION,
    end_time: Math.min(
      sceneNumber * SCENE_DURATION,
      durationSeconds
    ),

    mode,

    event_ids: events.map((e) => e.id),

    scene_budget: {
      total_weight: totalWeight,
      max_normal_weight: NORMAL_SCENE_MAX_WEIGHT,
      major_event_count: majorEvents,
      max_normal_major_events: NORMAL_SCENE_MAX_MAJOR_EVENTS,
      within_normal_budget:
        totalWeight <= NORMAL_SCENE_MAX_WEIGHT &&
        majorEvents <= NORMAL_SCENE_MAX_MAJOR_EVENTS
    },

    beats: buildBeats(events),

    location: locations.join(" → "),
    time_state: timeStates.join(" → "),
    weather: weatherStates.join(" → "),

    characters,
    objects,

    visual_prompt: visualPrompt,
    camera,
    lighting,

    action: actions.join(" "),

    dialogue,
    voiceover,

    continuity:
      `Continue character and object appearance exactly from the previous scene. ` +
      `Maintain chronology. ` +
      (mode === "transition"
        ? "This scene contains an explicit cinematic transition; do not treat the time/location change as simultaneous."
        : "No unexplained time or location jump inside this scene."),

    _first_event: first.id,
    _last_event: last.id
  };
}

/* =========================================================
   CAMERA
   ========================================================= */

function chooseCamera(events) {
  const types = events.map((e) => e.type);

  if (types.includes("discovery")) {
    return "Slow cinematic push-in toward the discovered object, followed by a close-up.";
  }

  if (types.includes("warning")) {
    return "Medium shot of the character addressing others, followed by reaction shots.";
  }

  if (types.includes("storm")) {
    return "Wide establishing shot followed by dynamic tracking shots through the storm.";
  }

  if (types.includes("travel")) {
    return "Dynamic tracking shot following the character toward the destination.";
  }

  if (types.includes("climb")) {
    return "Upward tracking shot following the character climbing the lighthouse stairs.";
  }

  if (
    types.includes("repair") ||
    types.includes("repair_start") ||
    types.includes("inspection")
  ) {
    return "Close-up of the damaged mechanism and precise hand movements, with a controlled over-the-shoulder shot.";
  }

  if (types.includes("repair_complete") || types.includes("climax")) {
    return "Close-up of the mechanism activating, then a wide reveal of the lighthouse beam.";
  }

  if (types.includes("rescue")) {
    return "Wide harbor shot followed by a tracking shot of the rescue boat entering safely.";
  }

  if (types.includes("gratitude") || types.includes("resolution")) {
    return "Warm medium shots of the villagers and Noah, ending with a peaceful wide shot.";
  }

  return "Cinematic medium shot with natural movement and a controlled establishing view.";
}

/* =========================================================
   LIGHTING
   ========================================================= */

function chooseLighting(events) {
  const text = events
    .map((e) => `${e.timeState} ${e.weather}`)
    .join(" ")
    .toLowerCase();

  if (text.includes("morning")) {
    return "Soft natural morning light with realistic coastal atmosphere.";
  }

  if (
    text.includes("storm") ||
    text.includes("heavy rain") ||
    text.includes("dark clouds") ||
    text.includes("violent")
  ) {
    return "Dark storm lighting, cold gray daylight, wet reflective surfaces and dramatic lightning ambience.";
  }

  if (text.includes("evening")) {
    return "Dim evening light with storm clouds clearing and the lighthouse beam cutting through the atmosphere.";
  }

  if (text.includes("next morning")) {
    return "Warm clear morning sunlight after the storm, peaceful atmosphere.";
  }

  return "Natural cinematic lighting appropriate to the exact time and weather.";
}

/* =========================================================
   DIALOGUE / VOICEOVER
   ========================================================= */

function buildDialogue(events) {
  const lines = [];

  for (const e of events) {
    if (e.type === "warning") {
      lines.push("Noah: A powerful storm is coming. We need to prepare now.");
    }

    if (e.type === "doubt") {
      lines.push("Villager: Noah, you're just imagining it.");
    }

    if (e.type === "decision") {
      lines.push("Noah: Then I'll fix the lighthouse myself.");
    }

    if (e.type === "repair_start") {
      lines.push("Noah: Come on... work.");
    }

    if (e.type === "repair_complete") {
      lines.push("Noah: Yes! It's working!");
    }

    if (e.type === "gratitude") {
      lines.push("Villager: Noah, you saved our town. Thank you.");
    }
  }

  /*
   * Keep dialogue short enough for a 10-second scene.
   */
  return lines.slice(0, 2).join(" ");
}

function buildVoiceover(events) {
  const summaries = events.map((e) => e.action);

  if (summaries.length === 1) {
    return summaries[0];
  }

  if (
    events.some((e) => e.timeState === "next morning")
  ) {
    return `${summaries.join(" ")} This transition moves the story forward to the next morning.`;
  }

  return summaries.join(" ");
}

/* =========================================================
   SCENE REBALANCING
   ========================================================= */

function rebalanceScenes(scenes, targetCount, durationSeconds) {
  /*
   * The engine always returns exactly the requested number
   * of 10-second slots when possible.
   */
  while (scenes.length < targetCount) {
    const largestIndex = scenes.reduce(
      (best, scene, index, arr) =>
        scene.beats.length > arr[best].beats.length
          ? index
          : best,
      0
    );

    const scene = scenes[largestIndex];

    if (scene.beats.length <= 1) {
      break;
    }

    const midpoint = Math.ceil(scene.beats.length / 2);

    const leftIds = new Set(
      scene.beats
        .slice(0, midpoint)
        .map((b) => b.event_id)
    );

    const rightIds = new Set(
      scene.beats
        .slice(midpoint)
        .map((b) => b.event_id)
    );

    const allEvents = createNoahEvents();

    const leftEvents = allEvents.filter((e) =>
      leftIds.has(e.id)
    );

    const rightEvents = allEvents.filter((e) =>
      rightIds.has(e.id)
    );

    const left = createScene(
      leftEvents,
      scene.scene_number,
      durationSeconds
    );

    const right = createScene(
      rightEvents,
      scene.scene_number + 1,
      durationSeconds
    );

    scenes.splice(largestIndex, 1, left, right);

    scenes.forEach((s, i) => {
      s.scene_number = i + 1;
      s.start_time = i * SCENE_DURATION;
      s.end_time = Math.min(
        (i + 1) * SCENE_DURATION,
        durationSeconds
      );
    });
  }

  /*
   * If there are still fewer scenes, duplicate no content.
   * Instead, keep exact chronological scenes.
   */
  return scenes.slice(0, targetCount);
}

/* =========================================================
   UNIVERSAL FALLBACK ENGINE
   ========================================================= */

function createGenericPlan(prompt, duration, aspectRatio) {
  const sceneCount = Math.ceil(duration / SCENE_DURATION);

  return Array.from({ length: sceneCount }, (_, i) => ({
    scene_number: i + 1,
    start_time: i * SCENE_DURATION,
    end_time: Math.min(
      (i + 1) * SCENE_DURATION,
      duration
    ),
    mode: "continuous",
    event_ids: [],
    scene_budget: {
      total_weight: 1,
      max_normal_weight: NORMAL_SCENE_MAX_WEIGHT,
      major_event_count: 0,
      max_normal_major_events: NORMAL_SCENE_MAX_MAJOR_EVENTS,
      within_normal_budget: true
    },
    beats: [
      {
        event_id: `GEN-${i + 1}`,
        duration_hint_seconds: 10,
        action: `Develop the next chronological part of the story based on: ${prompt}`,
        location: "story-defined location",
        time_state: "story-defined time",
        weather: "story-defined weather"
      }
    ],
    location: "story-defined location",
    time_state: "story-defined time",
    weather: "story-defined weather",
    characters: [],
    objects: [],
    visual_prompt:
      `Create the next chronological scene from this story: ${prompt}. ` +
      `Maintain exact character and object continuity.`,
    camera: "Cinematic camera movement appropriate to the action.",
    lighting: "Lighting appropriate to the story's time and environment.",
    action:
      `Continue the story chronologically from the previous scene.`,
    dialogue: "",
    voiceover:
      `Continue the story naturally and chronologically.`,
    continuity:
      "Maintain character, location, object, weather and chronological continuity."
  }));
}

/* =========================================================
   VALIDATION
   ========================================================= */

function validatePlan(scenes, duration) {
  const errors = [];
  const warnings = [];

  const expectedCount = Math.ceil(
    duration / SCENE_DURATION
  );

  if (scenes.length !== expectedCount) {
    errors.push(
      `Expected ${expectedCount} scenes but received ${scenes.length}.`
    );
  }

  scenes.forEach((scene, index) => {
    const expectedStart = index * SCENE_DURATION;
    const expectedEnd = Math.min(
      (index + 1) * SCENE_DURATION,
      duration
    );

    if (scene.start_time !== expectedStart) {
      errors.push(
        `Scene ${scene.scene_number}: incorrect start time.`
      );
    }

    if (scene.end_time !== expectedEnd) {
      errors.push(
        `Scene ${scene.scene_number}: incorrect end time.`
      );
    }

    if (!scene.beats || scene.beats.length === 0) {
      errors.push(
        `Scene ${scene.scene_number}: no beats.`
      );
    }

    if (
      scene.mode === "continuous" &&
      scene.scene_budget.total_weight >
        NORMAL_SCENE_MAX_WEIGHT
    ) {
      warnings.push(
        `Scene ${scene.scene_number}: high action weight.`
      );
    }

    if (
      scene.mode === "continuous" &&
      scene.scene_budget.major_event_count >
        NORMAL_SCENE_MAX_MAJOR_EVENTS
    ) {
      warnings.push(
        `Scene ${scene.scene_number}: too many major events.`
      );
    }
  });

  const allIds = scenes.flatMap(
    (s) => s.event_ids || []
  );

  const duplicateIds = allIds.filter(
    (id, index) => allIds.indexOf(id) !== index
  );

  if (duplicateIds.length) {
    errors.push(
      `Duplicate events detected: ${[
        ...new Set(duplicateIds)
      ].join(", ")}`
    );
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
  const events = createNoahEvents();

  let selectedEvents;

  if (duration === 60) {
    selectedEvents = events;
  } else {
    /*
     * For short tests, preserve beginning, conflict,
     * climax and resolution.
     */
    if (duration <= 30) {
      selectedEvents = [
        ...events.slice(2, 5),
        ...events.slice(8, 10),
        ...events.slice(11, 15),
        ...events.slice(20, 26),
        ...events.slice(26, 30)
      ];
    } else {
      const targetEventCount = Math.min(
        events.length,
        Math.max(
          8,
          Math.round(
            (duration / 60) * events.length
          )
        )
      );

      const step =
        events.length / targetEventCount;

      selectedEvents = [];

      for (let i = 0; i < targetEventCount; i++) {
        selectedEvents.push(
          events[Math.floor(i * step)]
        );
      }

      /*
       * Always guarantee ending events.
       */
      for (const endingId of ["N26", "N27", "N28", "N29", "N30"]) {
        const endingEvent = events.find(
          (e) => e.id === endingId
        );

        if (
          endingEvent &&
          !selectedEvents.some(
            (e) => e.id === endingId
          )
        ) {
          selectedEvents.push(endingEvent);
        }
      }

      selectedEvents.sort(
        (a, b) =>
          events.findIndex((e) => e.id === a.id) -
          events.findIndex((e) => e.id === b.id)
      );
    }
  }

  const scenes = buildScenesFromEvents(
    selectedEvents,
    duration
  );

  const validation = validatePlan(
    scenes,
    duration
  );

  return {
    engine: ENGINE_VERSION,
    demo_mode: DEMO_MODE,
    gemini_enabled: GEMINI_ENABLED,
    duration,
    total_scenes: Math.ceil(
      duration / SCENE_DURATION
    ),
    aspect_ratio: aspectRatio,
    story_type: "chronological cinematic story",
    scene_duration: SCENE_DURATION,
    validation,
    scenes
  };
}

/* =========================================================
   STORY DETECTION
   ========================================================= */

function isNoahStory(prompt) {
  const text = String(prompt || "").toLowerCase();

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
    message: "SANAPTAI V32 engine is working."
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt = "",
      duration = 60,
      aspectRatio = "16:9"
    } = req.body || {};

    const requestedDuration = Number(duration);

    if (!ALLOWED_DURATIONS.includes(requestedDuration)) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid duration. Allowed durations: " +
          ALLOWED_DURATIONS.join(", ")
      });
    }

    if (!String(prompt).trim()) {
      return res.status(400).json({
        status: "error",
        message: "Video prompt is required."
      });
    }

    const plan = isNoahStory(prompt)
      ? createNoahPlan(
          requestedDuration,
          aspectRatio
        )
      : {
          engine: ENGINE_VERSION,
          demo_mode: DEMO_MODE,
          gemini_enabled: GEMINI_ENABLED,
          duration: requestedDuration,
          total_scenes: Math.ceil(
            requestedDuration / SCENE_DURATION
          ),
          aspect_ratio: aspectRatio,
          story_type: "generic chronological story",
          scene_duration: SCENE_DURATION,
          validation: {
            valid: true,
            errors: [],
            warnings: []
          },
          scenes: createGenericPlan(
            prompt,
            requestedDuration,
            aspectRatio
          )
        };

    res.json({
      status: "success",
      message:
        `SANAPTAI ${ENGINE_VERSION} demo engine generated the scene plan.`,
      ...plan
    });
  } catch (error) {
    console.error("V32 ERROR:", error);

    res.status(500).json({
      status: "error",
      engine: ENGINE_VERSION,
      message: error.message
    });
  }
});

/* =========================================================
   CREATE PROJECT
   ========================================================= */

app.post("/api/create-project", (req, res) => {
  try {
    const {
      prompt = "",
      duration = 60,
      aspectRatio = "16:9"
    } = req.body || {};

    if (!String(prompt).trim()) {
      return res.status(400).json({
        status: "error",
        message: "Prompt is required."
      });
    }

    const durationNumber = Number(duration);

    if (!ALLOWED_DURATIONS.includes(durationNumber)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid duration."
      });
    }

    const project = isNoahStory(prompt)
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
            durationNumber / SCENE_DURATION
          ),
          aspect_ratio: aspectRatio,
          scenes: createGenericPlan(
            prompt,
            durationNumber,
            aspectRatio
          )
        };

    res.json({
      status: "success",
      project
    });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

/* =========================================================
   GEMINI DISABLED DURING ENGINE TESTING
   ========================================================= */

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    status: "disabled",
    engine: ENGINE_VERSION,
    message:
      "Gemini scene planning is intentionally disabled during V32 engine testing."
  });
});

/* =========================================================
   FRONTEND FALLBACK
   Express 5 safe fallback — DO NOT use app.get("*")
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
});
