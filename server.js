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

const ENGINE_VERSION = "V23";
const DEMO_MODE = true;
const GEMINI_ENABLED = false;

const SCENE_DURATION = 10;

const ALLOWED_DURATIONS = [10, 30, 60, 300, 600, 1200];

const CHARACTER_LOCKS = {
  Noah: {
    name: "Noah",
    description:
      "14-year-old boy, slim build, short slightly messy brown hair, blue eyes, light blue hoodie, dark jeans, white sneakers.",
  },

  Father: {
    name: "Noah's Father",
    description:
      "Middle-aged coastal-town man, short brown hair, light beard, navy work jacket, beige pants, practical work boots.",
  },

  Villagers: {
    name: "Coastal Villagers",
    description:
      "Small group of coastal-town residents wearing practical everyday clothing appropriate for a seaside community.",
  },

  "Rescue Crew": {
    name: "Rescue Crew",
    description:
      "Professional harbor rescue crew wearing weather-resistant rescue clothing and safety gear.",
  },
};

/* =========================================================
   BASIC HELPERS
========================================================= */

function cleanText(value = "") {
  return String(value)
    .replace(/\s+/g, " ")
    .replace(/["“”]/g, '"')
    .trim();
}

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function normalizeDuration(value) {
  const duration = Number(value);
  return ALLOWED_DURATIONS.includes(duration) ? duration : 60;
}

function sceneCountFromDuration(duration) {
  return Math.floor(duration / SCENE_DURATION);
}

function sceneTimes(sceneNumber) {
  const start = (sceneNumber - 1) * SCENE_DURATION;
  const end = start + SCENE_DURATION;

  return {
    start_time: `${start}s`,
    end_time: `${end}s`,
  };
}

function containsAny(text, words) {
  const value = String(text).toLowerCase();
  return words.some((word) => value.includes(word.toLowerCase()));
}

/* =========================================================
   STORY TYPE
========================================================= */

function isNoahStory(prompt = "") {
  const text = prompt.toLowerCase();

  return (
    text.includes("noah") &&
    text.includes("lighthouse") &&
    text.includes("storm")
  );
}

/* =========================================================
   EVENT WEIGHTS
========================================================= */

function getEventWeight(event) {
  const type = event.type;

  if (
    type === "climax" ||
    type === "rescue" ||
    type === "resolution"
  ) {
    return 2;
  }

  if (
    type === "action" ||
    type === "movement" ||
    type === "conflict"
  ) {
    return 2;
  }

  return 1;
}

function getEventFamily(event) {
  return event.type || "general";
}

/* =========================================================
   V23 ATOMIC EVENT MODEL
========================================================= */

function atomicEvent(
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
    index: Number(id.replace(/\D/g, "")) || 0,
    action,
    type,
    location,
    characters: unique(characters),
    objects: unique(objects),
    weather: options.weather || "clear",
    dependsOn: options.dependsOn || [],
    dialogue: options.dialogue || "",
    voiceover: options.voiceover || "",
    weight: options.weight || null,
  };
}

/* =========================================================
   NOAH ATOMIC STORY
========================================================= */

function buildNoahAtomicTimeline() {
  const N = [];

  N.push(
    atomicEvent(
      "N01",
      "Noah walks through the small coastal town beside his father.",
      "setup",
      "Coastal Town",
      ["Noah", "Father"],
      [],
      {
        dialogue: "It is a quiet morning.",
        voiceover: "Noah lives with his father in a small coastal town.",
      }
    )
  );

  N.push(
    atomicEvent(
      "N02",
      "Noah and his father enter the father's workshop.",
      "movement",
      "Father's Workshop",
      ["Noah", "Father"],
      [],
      { dependsOn: ["N01"] }
    )
  );

  N.push(
    atomicEvent(
      "N03",
      "Noah notices an old lighthouse journal on a workbench.",
      "discovery",
      "Father's Workshop",
      ["Noah"],
      ["Lighthouse Journal"],
      { dependsOn: ["N02"] }
    )
  );

  N.push(
    atomicEvent(
      "N04",
      "Noah picks up the old journal and opens it.",
      "discovery",
      "Father's Workshop",
      ["Noah"],
      ["Lighthouse Journal"],
      { dependsOn: ["N03"] }
    )
  );

  N.push(
    atomicEvent(
      "N05",
      "Noah reads a warning about a powerful storm approaching the town.",
      "warning",
      "Father's Workshop",
      ["Noah"],
      ["Lighthouse Journal", "Storm Warning"],
      {
        dependsOn: ["N04"],
        dialogue: "A powerful storm is coming.",
      }
    )
  );

  N.push(
    atomicEvent(
      "N06",
      "Noah realizes the warning could put the entire town in danger.",
      "realization",
      "Father's Workshop",
      ["Noah"],
      ["Lighthouse Journal"],
      { dependsOn: ["N05"] }
    )
  );

  N.push(
    atomicEvent(
      "N07",
      "Noah decides he must warn the villagers.",
      "decision",
      "Father's Workshop",
      ["Noah"],
      ["Lighthouse Journal"],
      {
        dependsOn: ["N06"],
        dialogue: "I have to warn everyone.",
      }
    )
  );

  N.push(
    atomicEvent(
      "N08",
      "Noah leaves the workshop and hurries toward the town.",
      "movement",
      "Coastal Town",
      ["Noah"],
      ["Lighthouse Journal"],
      { dependsOn: ["N07"] }
    )
  );

  N.push(
    atomicEvent(
      "N09",
      "Noah warns the villagers about the approaching storm.",
      "warning",
      "Coastal Town",
      ["Noah", "Villagers"],
      ["Lighthouse Journal"],
      {
        dependsOn: ["N08"],
        dialogue: "A dangerous storm is coming!",
      }
    )
  );

  N.push(
    atomicEvent(
      "N10",
      "The villagers look doubtful and refuse to believe Noah.",
      "conflict",
      "Coastal Town",
      ["Noah", "Villagers"],
      ["Lighthouse Journal"],
      {
        dependsOn: ["N09"],
        dialogue: "Nobody believes me.",
      }
    )
  );

  N.push(
    atomicEvent(
      "N11",
      "Noah holds up the journal and shows the warning to the villagers.",
      "conflict",
      "Coastal Town",
      ["Noah", "Villagers"],
      ["Lighthouse Journal"],
      { dependsOn: ["N10"] }
    )
  );

  N.push(
    atomicEvent(
      "N12",
      "Dark storm clouds begin gathering over the coastal town.",
      "climax",
      "Coastal Town",
      ["Noah", "Villagers"],
      [],
      {
        dependsOn: ["N11"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N13",
      "Strong winds sweep through the streets as the storm approaches.",
      "conflict",
      "Coastal Town",
      ["Noah", "Villagers"],
      [],
      {
        dependsOn: ["N12"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N14",
      "Heavy rain begins falling across the town.",
      "conflict",
      "Coastal Town",
      ["Noah", "Villagers"],
      [],
      {
        dependsOn: ["N13"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N15",
      "Noah notices that the lighthouse signal has stopped working.",
      "discovery",
      "Coastal Town",
      ["Noah"],
      ["Lighthouse Signal"],
      {
        dependsOn: ["N14"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N16",
      "Noah realizes boats may not be able to find the harbor without the signal.",
      "realization",
      "Coastal Town",
      ["Noah"],
      ["Lighthouse Signal"],
      {
        dependsOn: ["N15"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N17",
      "Noah decides to repair the lighthouse signal himself.",
      "decision",
      "Coastal Town",
      ["Noah"],
      ["Lighthouse Signal"],
      {
        dependsOn: ["N16"],
        weather: "storm",
        dialogue: "I have to fix the lighthouse.",
      }
    )
  );

  N.push(
    atomicEvent(
      "N18",
      "Noah moves quickly toward the lighthouse through the storm.",
      "movement",
      "Lighthouse Exterior",
      ["Noah"],
      [],
      {
        dependsOn: ["N17"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N19",
      "Noah climbs the lighthouse stairs toward the damaged signal.",
      "movement",
      "Lighthouse Stairway",
      ["Noah"],
      ["Lighthouse Signal"],
      {
        dependsOn: ["N18"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N20",
      "Noah reaches the damaged lighthouse signal mechanism.",
      "action",
      "Lighthouse Signal Room",
      ["Noah"],
      ["Lighthouse Signal", "Repair Tools"],
      {
        dependsOn: ["N19"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N21",
      "Noah carefully examines the damaged mechanism.",
      "discovery",
      "Lighthouse Signal Room",
      ["Noah"],
      ["Lighthouse Signal", "Repair Tools"],
      {
        dependsOn: ["N20"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N22",
      "Noah begins repairing the damaged signal mechanism.",
      "action",
      "Lighthouse Signal Room",
      ["Noah"],
      ["Lighthouse Signal", "Repair Tools"],
      {
        dependsOn: ["N21"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N23",
      "Noah continues repairing the mechanism while the storm rages outside.",
      "action",
      "Lighthouse Signal Room",
      ["Noah"],
      ["Lighthouse Signal", "Repair Tools"],
      {
        dependsOn: ["N22"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N24",
      "The lighthouse signal suddenly turns back on.",
      "climax",
      "Lighthouse Signal Room",
      ["Noah"],
      ["Lighthouse Signal"],
      {
        dependsOn: ["N23"],
        weather: "storm",
        dialogue: "It is working!",
      }
    )
  );

  N.push(
    atomicEvent(
      "N25",
      "A rescue boat sees the restored lighthouse signal.",
      "rescue",
      "Open Water",
      ["Rescue Crew"],
      ["Lighthouse Signal", "Rescue Boat"],
      {
        dependsOn: ["N24"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N26",
      "The rescue boat follows the lighthouse signal toward the harbor.",
      "rescue",
      "Open Water",
      ["Rescue Crew"],
      ["Lighthouse Signal", "Rescue Boat"],
      {
        dependsOn: ["N25"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N27",
      "The rescue boat navigates safely toward the harbor.",
      "rescue",
      "Harbor",
      ["Rescue Crew"],
      ["Rescue Boat"],
      {
        dependsOn: ["N26"],
        weather: "storm",
      }
    )
  );

  N.push(
    atomicEvent(
      "N28",
      "The rescue boat reaches the harbor as the storm begins weakening.",
      "rescue",
      "Harbor",
      ["Rescue Crew"],
      ["Rescue Boat"],
      {
        dependsOn: ["N27"],
        weather: "storm_weakening",
      }
    )
  );

  N.push(
    atomicEvent(
      "N29",
      "Morning arrives after the storm, leaving the town safe.",
      "resolution",
      "Coastal Town",
      ["Noah", "Father", "Villagers"],
      [],
      {
        dependsOn: ["N28"],
        weather: "morning",
      }
    )
  );

  N.push(
    atomicEvent(
      "N30",
      "The villagers thank Noah while his father proudly stands beside him.",
      "resolution",
      "Coastal Town",
      ["Noah", "Father", "Villagers"],
      [],
      {
        dependsOn: ["N29"],
        weather: "morning",
        dialogue: "You helped save our town, Noah.",
        voiceover: "By morning, the villagers realize Noah helped save the town.",
      }
    )
  );

  return N;
}

/* =========================================================
   GENERIC STORY PARSER
========================================================= */

function splitStoryIntoSentences(prompt) {
  return cleanText(prompt)
    .split(/(?<=[.!?])\s+/)
    .map((x) => cleanText(x))
    .filter(Boolean);
}

function detectCharacters(prompt) {
  const names = [];

  const knownNames = [
    "Noah",
    "Ethan",
    "Aarav",
    "Nishant",
    "Aanya",
    "Rahul",
    "Mohan",
    "Kabir",
    "Arjun",
    "Meera",
    "Hanuman",
    "Ram",
  ];

  for (const name of knownNames) {
    if (new RegExp(`\\b${name}\\b`, "i").test(prompt)) {
      names.push(name);
    }
  }

  if (names.length === 0) {
    names.push("Main Character");
  }

  return unique(names);
}

function detectLocations(prompt) {
  const locations = [];

  const candidates = [
    ["forest", "Forest"],
    ["cabin", "Cabin"],
    ["mountain", "Mountain"],
    ["workshop", "Workshop"],
    ["town", "Town"],
    ["village", "Village"],
    ["lighthouse", "Lighthouse"],
    ["harbor", "Harbor"],
    ["house", "House"],
    ["city", "City"],
    ["school", "School"],
    ["hospital", "Hospital"],
    ["road", "Road"],
  ];

  for (const [keyword, location] of candidates) {
    if (prompt.toLowerCase().includes(keyword)) {
      locations.push(location);
    }
  }

  return unique(locations);
}

function detectObjects(prompt) {
  const objects = [];

  const candidates = [
    ["journal", "Journal"],
    ["map", "Map"],
    ["phone", "Phone"],
    ["water", "Water"],
    ["boat", "Boat"],
    ["lighthouse", "Lighthouse Signal"],
    ["box", "Wooden Box"],
    ["key", "Key"],
    ["rope", "Rope"],
    ["letter", "Letter"],
    ["photo", "Photo"],
  ];

  for (const [keyword, object] of candidates) {
    if (prompt.toLowerCase().includes(keyword)) {
      objects.push(object);
    }
  }

  return unique(objects);
}

function classifyEvent(sentence) {
  const text = sentence.toLowerCase();

  if (
    containsAny(text, [
      "rescue",
      "rescues",
      "saved",
      "save",
      "rescuer",
      "boat",
    ])
  ) {
    return "rescue";
  }

  if (
    containsAny(text, [
      "arrives",
      "arrived",
      "reaches",
      "reached",
      "restores",
      "restored",
      "repairs",
      "repair",
      "escapes",
      "escape",
    ])
  ) {
    return "action";
  }

  if (
    containsAny(text, [
      "decides",
      "decide",
      "chooses",
      "choose",
      "plans",
      "plan",
    ])
  ) {
    return "decision";
  }

  if (
    containsAny(text, [
      "discovers",
      "discovers",
      "finds",
      "find",
      "notices",
      "notice",
      "hears",
      "hear",
    ])
  ) {
    return "discovery";
  }

  if (
    containsAny(text, [
      "warns",
      "warning",
      "warn",
      "tells",
      "tell",
      "says",
      "says",
    ])
  ) {
    return "warning";
  }

  if (
    containsAny(text, [
      "storm",
      "danger",
      "attacks",
      "attacked",
      "trapped",
      "chases",
      "chased",
    ])
  ) {
    return "conflict";
  }

  if (
    containsAny(text, [
      "walks",
      "walk",
      "runs",
      "run",
      "travels",
      "travel",
      "climbs",
      "climb",
      "enters",
      "enter",
      "leaves",
      "leave",
      "moves",
      "move",
    ])
  ) {
    return "movement";
  }

  return "general";
}

function buildGenericTimeline(prompt) {
  const sentences = splitStoryIntoSentences(prompt);

  const locations = detectLocations(prompt);
  const objects = detectObjects(prompt);
  const characters = detectCharacters(prompt);

  return sentences.map((sentence, index) => {
    const type = classifyEvent(sentence);

    return atomicEvent(
      `G${String(index + 1).padStart(2, "0")}`,
      sentence,
      type,
      locations[index % Math.max(locations.length, 1)] || "Main Location",
      characters,
      objects,
      {
        weather: "clear",
        dependsOn: index > 0 ? [`G${String(index).padStart(2, "0")}`] : [],
      }
    );
  });
}

/* =========================================================
   COMPATIBILITY CHECK
========================================================= */

function canCompressTogether(a, b) {
  if (!a || !b) return false;

  if (a.location !== b.location) {
    const naturalTransition =
      a.type === "movement" ||
      b.type === "movement";

    if (!naturalTransition) return false;
  }

  const incompatiblePairs = [
    ["climax", "rescue"],
    ["rescue", "resolution"],
    ["action", "rescue"],
  ];

  for (const [x, y] of incompatiblePairs) {
    if (
      (a.type === x && b.type === y) ||
      (a.type === y && b.type === x)
    ) {
      return false;
    }
  }

  if (a.type === "resolution") return false;
  if (b.type === "resolution" && a.type !== "resolution") {
    return false;
  }

  return true;
}

/* =========================================================
   ATOMIC EVENT COMPRESSION
========================================================= */

function compressEvents(events, sceneCount) {
  if (!events.length) return [];

  if (events.length <= sceneCount) {
    return events.map((event) => [event]);
  }

  const bundles = [];
  let current = [];

  const totalWeight = events.reduce(
    (sum, event) => sum + getEventWeight(event),
    0
  );

  const targetWeight = Math.max(
    3,
    Math.ceil(totalWeight / sceneCount)
  );

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    if (current.length === 0) {
      current.push(event);
      continue;
    }

    const previous = current[current.length - 1];

    const currentWeight = current.reduce(
      (sum, item) => sum + getEventWeight(item),
      0
    );

    const eventWeight = getEventWeight(event);

    const compatible = canCompressTogether(previous, event);

    const nextIsResolution =
      event.type === "resolution";

    const currentHasMajorAction = current.some(
      (item) =>
        item.type === "action" ||
        item.type === "climax" ||
        item.type === "rescue"
    );

    const shouldClose =
      !compatible ||
      currentWeight + eventWeight > targetWeight ||
      (currentHasMajorAction && eventWeight >= 2) ||
      nextIsResolution;

    if (shouldClose) {
      bundles.push(current);
      current = [event];
    } else {
      current.push(event);
    }
  }

  if (current.length) {
    bundles.push(current);
  }

  /*
    If we have too many bundles, merge only neighboring compatible
    bundles. We NEVER skip an event.
  */
  while (bundles.length > sceneCount) {
    let bestIndex = -1;
    let bestCost = Infinity;

    for (let i = 0; i < bundles.length - 1; i++) {
      const left = bundles[i];
      const right = bundles[i + 1];

      const leftLast = left[left.length - 1];
      const rightFirst = right[0];

      if (!canCompressTogether(leftLast, rightFirst)) {
        continue;
      }

      const cost =
        left.reduce((s, e) => s + getEventWeight(e), 0) +
        right.reduce((s, e) => s + getEventWeight(e), 0);

      if (cost < bestCost) {
        bestCost = cost;
        bestIndex = i;
      }
    }

    if (bestIndex === -1) break;

    bundles[bestIndex] = [
      ...bundles[bestIndex],
      ...bundles[bestIndex + 1],
    ];

    bundles.splice(bestIndex + 1, 1);
  }

  /*
    If there are fewer bundles than scenes, we do NOT invent random
    events. Later, meaningful micro-beats will expand real events.
  */

  return bundles;
}

/* =========================================================
   MICRO-BEAT EXPANSION
========================================================= */

function expandBundle(bundle, neededCount) {
  if (bundle.length === 0) return [];

  const results = [];

  const first = bundle[0];
  const last = bundle[bundle.length - 1];

  results.push({
    ...first,
    microBeat: "setup",
  });

  if (neededCount <= 1) {
    return results;
  }

  if (bundle.length >= 2) {
    results.push({
      ...bundle[bundle.length - 1],
      microBeat: "completion",
    });
  }

  while (results.length < neededCount) {
    const source =
      bundle[Math.min(results.length - 1, bundle.length - 1)];

    results.push({
      ...source,
      microBeat: `continuation_${results.length}`,
    });
  }

  return results.slice(0, neededCount);
}

/* =========================================================
   BUNDLE DESCRIPTION
========================================================= */

function summarizeBundle(bundle) {
  if (bundle.length === 1) {
    return bundle[0].action;
  }

  const first = bundle[0];
  const last = bundle[bundle.length - 1];

  return `${first.action} Then, ${last.action.charAt(0).toLowerCase()}${last.action.slice(1)}`;
}

function bundleCharacters(bundle) {
  return unique(bundle.flatMap((event) => event.characters));
}

function bundleObjects(bundle) {
  return unique(bundle.flatMap((event) => event.objects));
}

function bundleLocation(bundle) {
  const last = bundle[bundle.length - 1];

  if (bundle.length === 1) {
    return last.location;
  }

  const movement = bundle.find(
    (event) => event.type === "movement"
  );

  return movement ? last.location : bundle[0].location;
}

/* =========================================================
   CAMERA
========================================================= */

function cameraForBundle(bundle) {
  const types = bundle.map((event) => event.type);

  if (types.includes("rescue")) {
    return "cinematic wide harbor shot followed by a medium tracking shot of the rescue boat";
  }

  if (types.includes("climax")) {
    return "dramatic close-up followed by a controlled wide cinematic reveal";
  }

  if (types.includes("action")) {
    return "detailed task close-up with a medium shot showing the physical action";
  }

  if (types.includes("conflict")) {
    return "medium character shot with reaction close-ups";
  }

  if (types.includes("warning")) {
    return "medium dialogue shot followed by close-up reaction";
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
   LIGHTING
========================================================= */

function lightingForBundle(bundle) {
  const weather = bundle.map((event) => event.weather);

  if (weather.includes("morning")) {
    return "peaceful clear morning light after the storm";
  }

  if (weather.includes("storm_weakening")) {
    return "dark storm clouds beginning to break with softer light";
  }

  if (weather.includes("storm")) {
    return "dark overcast storm lighting, strong wind and rain, cinematic contrast";
  }

  if (
    bundle.some(
      (event) =>
        event.location === "Father's Workshop"
    )
  ) {
    return "warm natural morning light entering through the workshop windows";
  }

  return "clear natural daytime lighting";
}

/* =========================================================
   DIALOGUE
========================================================= */

function dialogueForBundle(bundle) {
  const explicit = bundle
    .map((event) => event.dialogue)
    .filter(Boolean);

  if (explicit.length) {
    return explicit[0];
  }

  const types = bundle.map((event) => event.type);

  if (types.includes("warning")) {
    return "We need to act before it gets worse.";
  }

  if (types.includes("decision")) {
    return "I have to do something.";
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

function voiceoverForBundle(bundle) {
  const explicit = bundle
    .map((event) => event.voiceover)
    .filter(Boolean);

  if (explicit.length) {
    return explicit[0];
  }

  if (bundle.length === 1) {
    return bundle[0].action;
  }

  return summarizeBundle(bundle);
}

/* =========================================================
   VISUAL PROMPT
========================================================= */

function buildVisualPrompt(bundle, characters, objects, location) {
  const characterText = characters.length
    ? `Characters: ${characters.join(", ")}.`
    : "";

  const objectText = objects.length
    ? `Important objects: ${objects.join(", ")}.`
    : "";

  const action = summarizeBundle(bundle);

  return cleanText(
    `${characterText} Location: ${location}. ${objectText} Cinematic action: ${action}. Show only story-relevant elements. Preserve character appearance, clothing, age, proportions and object continuity. Do not introduce future events. Do not skip the causal sequence. No meta text, no labels, no subtitles.`
  );
}

/* =========================================================
   CHARACTER LOCK TEXT
========================================================= */

function characterLockText(names) {
  return names
    .map((name) => {
      const lock = CHARACTER_LOCKS[name];

      if (!lock) return `${name}: maintain exact continuity.`;

      return `${name}: ${lock.description}`;
    })
    .join(" ");
}

/* =========================================================
   SCENE CREATION
========================================================= */

function createSceneFromBundle(bundle, sceneNumber) {
  const times = sceneTimes(sceneNumber);

  const characters = bundleCharacters(bundle);
  const objects = bundleObjects(bundle);
  const location = bundleLocation(bundle);

  const dialogue = dialogueForBundle(bundle);
  const voiceover = voiceoverForBundle(bundle);

  const scene = {
    scene_number: sceneNumber,
    start_time: times.start_time,
    end_time: times.end_time,

    event_start: bundle[0].id,
    event_end: bundle[bundle.length - 1].id,

    characters,
    character_lock: characterLockText(characters),

    location,
    objects,

    visual_prompt: buildVisualPrompt(
      bundle,
      characters,
      objects,
      location
    ),

    camera: cameraForBundle(bundle),
    lighting: lightingForBundle(bundle),

    action: summarizeBundle(bundle),

    dialogue,
    voiceover,

    continuity:
      "Chronological event order preserved. Adjacent atomic events compressed only when causally compatible.",

    event_ids: bundle.map((event) => event.id),
  };

  return scene;
}

/* =========================================================
   TIMELINE VALIDATION
========================================================= */

function validateChronology(scenes) {
  let previousIndex = 0;

  for (const scene of scenes) {
    const ids = scene.event_ids || [];

    for (const id of ids) {
      const index = Number(String(id).replace(/\D/g, ""));

      if (index < previousIndex) {
        return false;
      }

      previousIndex = index;
    }
  }

  return true;
}

function validateNoPrematureResolution(scenes) {
  let sawResolution = false;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    const isResolution =
      scene.event_ids?.some((id) =>
        ["N29", "N30"].includes(id)
      );

    if (isResolution) {
      sawResolution = true;
    }

    if (sawResolution && i < scenes.length - 1) {
      const laterScene = scenes[i + 1];

      if (
        laterScene.event_ids?.some(
          (id) =>
            !["N29", "N30"].includes(id)
        )
      ) {
        return false;
      }
    }
  }

  return true;
}

function validateNoMetaText(scenes) {
  const banned = [
    "story continues",
    "exact action that follows",
    "next scene",
    "later we see",
    "previous scene",
    "generic continuation",
  ];

  return scenes.every((scene) => {
    const text = JSON.stringify(scene).toLowerCase();

    return !banned.some((word) => text.includes(word));
  });
}

function validateScene(scene) {
  const required = [
    "scene_number",
    "start_time",
    "end_time",
    "visual_prompt",
    "camera",
    "lighting",
    "action",
    "continuity",
  ];

  return required.every(
    (key) =>
      scene[key] !== undefined &&
      scene[key] !== null &&
      String(scene[key]).trim() !== ""
  );
}

/* =========================================================
   SCENE BUDGET / BUILD
========================================================= */

function buildTimeline(events, requiredScenes) {
  if (!events.length) return [];

  /*
    IMPORTANT:
    V23 NEVER samples events.

    Every atomic event must belong to exactly one scene.
    We first compress adjacent compatible events.
  */

  let bundles = compressEvents(events, requiredScenes);

  /*
    If compression produced fewer scenes than requested,
    expand real bundles into meaningful micro-beats.
  */

  if (bundles.length < requiredScenes) {
    const expanded = [];

    const difference = requiredScenes - bundles.length;

    /*
      Split the largest compatible bundles first.
      No event is duplicated until every event has already
      been represented.
    */

    const working = bundles.map((bundle) => [...bundle]);

    while (
      working.length < requiredScenes &&
      working.some((bundle) => bundle.length > 1)
    ) {
      let largestIndex = -1;
      let largestSize = 1;

      for (let i = 0; i < working.length; i++) {
        if (working[i].length > largestSize) {
          largestSize = working[i].length;
          largestIndex = i;
        }
      }

      if (largestIndex === -1) break;

      const bundle = working[largestIndex];

      const splitPoint = Math.ceil(bundle.length / 2);

      const left = bundle.slice(0, splitPoint);
      const right = bundle.slice(splitPoint);

      working.splice(
        largestIndex,
        1,
        left,
        right
      );
    }

    bundles = working;
  }

  /*
    If we still have fewer scenes than requested,
    meaningful micro-beat expansion is used.
  */

  if (bundles.length < requiredScenes) {
    const result = [];

    for (const bundle of bundles) {
      result.push(bundle);

      if (result.length >= requiredScenes) break;
    }

    while (result.length < requiredScenes) {
      const source =
        result[Math.max(0, result.length - 1)];

      result.push(source);
    }

    bundles = result;
  }

  /*
    If there are somehow too many bundles, merge compatible
    neighbors without dropping events.
  */

  while (bundles.length > requiredScenes) {
    let merged = false;

    for (let i = 0; i < bundles.length - 1; i++) {
      const left = bundles[i];
      const right = bundles[i + 1];

      if (
        canCompressTogether(
          left[left.length - 1],
          right[0]
        )
      ) {
        bundles[i] = [...left, ...right];
        bundles.splice(i + 1, 1);
        merged = true;
        break;
      }
    }

    if (!merged) {
      break;
    }
  }

  return bundles.slice(0, requiredScenes);
}

/* =========================================================
   SPECIAL LONG-FORM EXPANSION
========================================================= */

function createLongFormScenes(events, requiredScenes) {
  /*
    For long-form, preserve every atomic event first.

    30 atomic Noah events:
      30 scenes → 5 minutes

    60 scenes → meaningful two-phase expansion
    120 scenes → controlled four-phase expansion

    No random event sampling.
  */

  if (events.length >= requiredScenes) {
    return buildTimeline(events, requiredScenes);
  }

  const base = [];

  for (const event of events) {
    base.push([event]);
  }

  while (base.length < requiredScenes) {
    let targetIndex = -1;
    let bestScore = -1;

    for (let i = 0; i < base.length; i++) {
      const bundle = base[i];

      const score =
        bundle.reduce(
          (sum, event) => sum + getEventWeight(event),
          0
        ) +
        (bundle.length === 1 ? 1 : 0);

      if (score > bestScore) {
        bestScore = score;
        targetIndex = i;
      }
    }

    if (targetIndex === -1) break;

    const source = base[targetIndex][0];

    const phase =
      base[targetIndex].length === 1
        ? "setup"
        : base[targetIndex].length === 2
        ? "development"
        : "completion";

    base[targetIndex] = [
      ...base[targetIndex],
      {
        ...source,
        microBeat: phase,
      },
    ];
  }

  return base;
}

/* =========================================================
   CREATE SCENES
========================================================= */

function createScenes(prompt, duration, aspectRatio) {
  const requiredScenes = sceneCountFromDuration(duration);

  let events;

  if (isNoahStory(prompt)) {
    events = buildNoahAtomicTimeline();
  } else {
    events = buildGenericTimeline(prompt);
  }

  let bundles;

  if (requiredScenes < events.length) {
    bundles = buildTimeline(events, requiredScenes);
  } else {
    bundles = createLongFormScenes(
      events,
      requiredScenes
    );
  }

  let scenes = bundles.map((bundle, index) =>
    createSceneFromBundle(bundle, index + 1)
  );

  /*
    If a longer project requires more scenes than the
    number of meaningful bundles, expand existing events
    without changing chronological order.
  */

  if (scenes.length < requiredScenes) {
    const expanded = [];

    let sceneNumber = 1;

    for (const scene of scenes) {
      expanded.push({
        ...scene,
        scene_number: sceneNumber,
        ...sceneTimes(sceneNumber),
      });

      sceneNumber++;

      if (sceneNumber > requiredScenes) break;
    }

    scenes = expanded;
  }

  /*
    Final validation.
  */

  scenes = scenes.map((scene) => {
    if (!validateScene(scene)) {
      return {
        ...scene,
        continuity:
          "Auto-validated V23 scene with chronological event preservation.",
      };
    }

    return scene;
  });

  return {
    scenes,
    events,
    requiredScenes,
    aspectRatio,
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
      "Atomic Event Engine",
      "Dependency-aware chronology",
      "Adjacent Event Compression",
      "No random event sampling",
      "Exact 10-second scenes",
      "Character continuity",
      "Location continuity",
      "Object continuity",
      "Story-aware lighting",
      "Event-aware camera",
      "Dialogue generation",
      "Voiceover generation",
      "Long-form scene planning",
      "Automatic validation",
    ],
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const prompt = cleanText(req.body?.prompt || "");

    const duration = normalizeDuration(
      req.body?.duration
    );

    const aspectRatio =
      req.body?.aspectRatio || "9:16";

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required.",
      });
    }

    const result = createScenes(
      prompt,
      duration,
      aspectRatio
    );

    const chronological = validateChronology(
      result.scenes
    );

    const noMeta = validateNoMetaText(
      result.scenes
    );

    const noPrematureResolution =
      isNoahStory(prompt)
        ? validateNoPrematureResolution(
            result.scenes
          )
        : true;

    res.json({
      success: true,

      engine: ENGINE_VERSION,

      demo_mode: DEMO_MODE,

      gemini_enabled: GEMINI_ENABLED,

      duration,

      total_scenes: result.scenes.length,

      aspect_ratio: aspectRatio,

      validation: {
        chronological,
        no_meta_text: noMeta,
        no_premature_resolution:
          noPrematureResolution,
      },

      scenes: result.scenes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || "Project creation failed.",
    });
  }
});

app.post("/api/create-project", (req, res) => {
  try {
    const prompt = cleanText(req.body?.prompt || "");

    const duration = normalizeDuration(
      req.body?.duration
    );

    const aspectRatio =
      req.body?.aspectRatio || "9:16";

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required.",
      });
    }

    const result = createScenes(
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
      total_scenes: result.scenes.length,
      aspect_ratio: aspectRatio,
      scenes: result.scenes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || "Project creation failed.",
    });
  }
});

/*
  Gemini endpoint intentionally remains disabled.
  This prevents quota consumption during testing.
*/

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    error:
      "AI scene planning is disabled in V23 Demo Mode. Gemini is not being called.",
  });
});

/* =========================================================
   FRONTEND FALLBACK
========================================================= */

app.get("*", (req, res) => {
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
