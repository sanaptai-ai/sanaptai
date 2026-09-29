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

const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "V40.0";


// ============================================================
// BASIC HELPERS
// ============================================================

function cleanText(text = "") {
  return String(text)
    .replace(/\s+/g, " ")
    .replace(/\.\.+/g, ".")
    .trim();
}

function splitStory(text) {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function lower(text = "") {
  return text.toLowerCase();
}


// ============================================================
// CHARACTER INTELLIGENCE
// ============================================================

const RELATIONSHIP_WORDS = [
  "mother", "father", "mom", "dad", "grandfather", "grandmother",
  "brother", "sister", "friend", "wife", "husband", "son", "daughter",
  "uncle", "aunt", "teacher", "doctor", "police officer"
];

const BAD_CHARACTER_WORDS = new Set([
  "I", "A", "An", "The", "When", "While", "After", "Before",
  "One", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Chicago", "New", "York", "Curious",
  "Inside", "Outside", "That", "This", "Then", "Later",
  "Morning", "Evening", "Night", "College"
]);

function extractCharacters(story) {
  const chars = [];

  // Explicit names:
  // named Ryan / named Sarah
  const named = story.match(/\bnamed\s+([A-Z][a-z]+)\b/g) || [];
  for (const item of named) {
    const name = item.replace(/^named\s+/i, "").trim();
    if (!BAD_CHARACTER_WORDS.has(name)) chars.push(name);
  }

  // Common "X, a ..." introduction
  const intro =
    story.match(/\b([A-Z][a-z]{2,})\s*,?\s+a\s+(?:\d{1,2}-year-old|young|college|teenage|young adult)/g) || [];

  for (const item of intro) {
    const name = item.split(/[,\s]+/)[0];
    if (!BAD_CHARACTER_WORDS.has(name)) chars.push(name);
  }

  // Relationship nouns are characters only if they are actually involved
  const storyLower = lower(story);

  for (const rel of RELATIONSHIP_WORDS) {
    if (storyLower.includes(rel)) {
      const display =
        rel === "mom" ? "Mother" :
        rel === "dad" ? "Father" :
        rel === "grandfather" ? "Grandfather" :
        rel === "grandmother" ? "Grandmother" :
        rel.charAt(0).toUpperCase() + rel.slice(1);

      chars.push(display);
    }
  }

  return unique(chars);
}


// ============================================================
// CHARACTER APPEARANCE — ONLY ACTIVE CHARACTERS
// ============================================================

function charactersForEvent(event, allCharacters) {
  const text = lower(event.text);

  const result = [];

  for (const character of allCharacters) {
    const c = lower(character);

    if (text.includes(c)) {
      result.push(character);
      continue;
    }

    const relationshipMap = {
      mother: ["mother", "mom"],
      father: ["father", "dad"],
      grandfather: ["grandfather", "grandpa"],
      grandmother: ["grandmother", "grandma"],
      brother: ["brother"],
      sister: ["sister"],
      friend: ["friend"],
      wife: ["wife"],
      husband: ["husband"]
    };

    if (
      relationshipMap[c] &&
      relationshipMap[c].some(word => text.includes(word))
    ) {
      result.push(character);
    }
  }

  // If no character is explicitly detected, use protagonist
  // but NEVER add every character to every scene.
  if (result.length === 0 && allCharacters.length > 0) {
    result.push(allCharacters[0]);
  }

  return unique(result);
}


// ============================================================
// LOCATION INTELLIGENCE
// ============================================================

const LOCATION_PATTERNS = [
  ["apartment", "apartment"],
  ["small apartment", "apartment"],
  ["workshop", "workshop"],
  ["bedroom", "bedroom"],
  ["kitchen", "kitchen"],
  ["living room", "living room"],
  ["home", "home"],
  ["house", "house"],
  ["abandoned movie theater", "abandoned movie theater"],
  ["movie theater", "movie theater"],
  ["theater", "movie theater"],
  ["lighthouse", "lighthouse"],
  ["harbor", "harbor"],
  ["beach", "beach"],
  ["school", "school"],
  ["college", "college"],
  ["office", "office"],
  ["restaurant", "restaurant"],
  ["street", "street"],
  ["road", "road"],
  ["forest", "forest"],
  ["park", "park"],
  ["hospital", "hospital"],
  ["airport", "airport"],
  ["train station", "train station"],
  ["warehouse", "warehouse"],
  ["basement", "basement"],
  ["attic", "attic"],
  ["castle", "castle"],
  ["garden", "garden"]
];

const CITIES = [
  "Chicago",
  "New York",
  "Los Angeles",
  "Boston",
  "Seattle",
  "Miami",
  "Denver",
  "Houston",
  "Dallas",
  "San Francisco"
];

function detectLocations(story) {
  const found = [];

  for (const [phrase, display] of LOCATION_PATTERNS) {
    if (lower(story).includes(phrase)) found.push(display);
  }

  for (const city of CITIES) {
    if (story.includes(city)) found.push(city);
  }

  return unique(found);
}

function locationForEvent(event, previousLocation, locations) {
  const text = lower(event.text);

  // Strong event-specific location rules
  if (text.includes("abandoned movie theater") ||
      text.includes("movie theater") ||
      text.includes("theater")) {
    return "abandoned movie theater";
  }

  if (
    text.includes("takes the documents home") ||
    text.includes("takes them home") ||
    text.includes("brings") && text.includes("home")
  ) {
    return "home";
  }

  if (
    text.includes("apartment") ||
    text.includes("shows the photograph to his mother") ||
    text.includes("shows them to his mother")
  ) {
    return "apartment";
  }

  // Preserve previous location when event says "inside", "there", etc.
  if (
    (text.includes("inside") ||
      text.includes("there") ||
      text.includes("that place")) &&
    previousLocation
  ) {
    return previousLocation;
  }

  for (const [phrase, display] of LOCATION_PATTERNS) {
    if (text.includes(phrase)) return display;
  }

  // City is a background location, not a physical location by itself.
  const city = locations.find(x => CITIES.includes(x));
  if (city) {
    return `story location, ${city}`;
  }

  return previousLocation || "story location";
}


// ============================================================
// OBJECT / CLUE INTELLIGENCE
// ============================================================

const OBJECT_PATTERNS = [
  ["old film camera", "old film camera"],
  ["film camera", "film camera"],
  ["camera", "camera"],
  ["photographs", "photographs"],
  ["photograph", "photograph"],
  ["strange symbol", "strange symbol"],
  ["symbol", "symbol"],
  ["hidden metal box", "hidden metal box"],
  ["metal box", "metal box"],
  ["box", "box"],
  ["old letter", "old letter"],
  ["letter", "letter"],
  ["family documents", "family documents"],
  ["documents", "documents"],
  ["journal", "journal"],
  ["diary", "diary"],
  ["map", "map"],
  ["key", "key"],
  ["ring", "ring"],
  ["necklace", "necklace"],
  ["phone", "phone"],
  ["laptop", "laptop"],
  ["boat", "boat"],
  ["car", "car"]
];

function objectsForEvent(event) {
  const text = lower(event.text);
  const found = [];

  for (const [phrase, display] of OBJECT_PATTERNS) {
    if (text.includes(phrase)) found.push(display);
  }

  return unique(found);
}


// ============================================================
// EVENT TYPES
// ============================================================

function detectEventType(text) {
  const t = lower(text);

  if (
    t.includes("finds") ||
    t.includes("discovers") ||
    t.includes("find ")
  ) return "discovery";

  if (
    t.includes("develops") ||
    t.includes("opens") ||
    t.includes("reads") ||
    t.includes("examines")
  ) return "investigation";

  if (
    t.includes("warns") ||
    t.includes("tells him never") ||
    t.includes("tells her never") ||
    t.includes("nervous")
  ) return "warning";

  if (
    t.includes("goes to") ||
    t.includes("runs to") ||
    t.includes("travels to") ||
    t.includes("visits")
  ) return "journey";

  if (
    t.includes("repairs") ||
    t.includes("opens") ||
    t.includes("takes") ||
    t.includes("removes") ||
    t.includes("enters")
  ) return "action";

  if (
    t.includes("realizes") ||
    t.includes("understands") ||
    t.includes("explaining") ||
    t.includes("reveal")
  ) return "revelation";

  if (
    t.includes("preserve") ||
    t.includes("safely") ||
    t.includes("save") ||
    t.includes("thank")
  ) return "resolution";

  return "narrative";
}


// ============================================================
// SMART EVENT SPLITTING
// ============================================================

function splitCompoundSentence(sentence) {
  const s = cleanText(sentence);
  const parts = [];

  // Specific cinematic transitions
  const patterns = [
    /\.\s+When\s+/i,
    /\.\s+But\s+/i,
    /\.\s+Curious about/i,
    /\.\s+Inside,\s*/i,
    /,\s+but\s+/i,
    /,\s+and\s+(?=[A-Z])/i,
    /\s+and then\s+/i
  ];

  let working = s;

  for (const pattern of patterns) {
    if (pattern.test(working)) {
      const chunks = working.split(pattern);

      for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i].trim();

        if (!chunk) continue;

        if (i > 0) {
          if (/^(When|But|Curious|Inside)/i.test(chunk)) {
            chunk = chunk;
          }
        }

        parts.push(chunk);
      }

      if (parts.length > 1) return parts;
    }
  }

  return [s];
}


function extractEvents(story) {
  const sentences = splitStory(story);
  const events = [];

  for (const sentence of sentences) {
    const pieces = splitCompoundSentence(sentence);

    for (const piece of pieces) {
      const text = cleanText(piece);

      if (text.length < 8) continue;

      events.push({
        id: events.length + 1,
        text,
        type: detectEventType(text),
        importance: 1
      });
    }
  }

  return events;
}


// ============================================================
// REMOVE BROKEN FRAGMENTS
// ============================================================

function repairEventText(text) {
  let s = cleanText(text);

  s = s
    .replace(/\bWhen\.$/i, "")
    .replace(/\bBut\.$/i, "")
    .replace(/\bCurious about the warning\.$/i, "")
    .replace(/\.\s+\./g, ".")
    .trim();

  return s;
}


// ============================================================
// EVENT IMPORTANCE
// ============================================================

function importanceFor(event) {
  const t = lower(event.text);

  let score = 1;

  if (
    t.includes("finds") ||
    t.includes("discovers") ||
    t.includes("warns") ||
    t.includes("hidden") ||
    t.includes("letter") ||
    t.includes("documents") ||
    t.includes("realizes") ||
    t.includes("save")
  ) {
    score += 3;
  }

  if (
    t.includes("goes to") ||
    t.includes("takes") ||
    t.includes("shows")
  ) {
    score += 2;
  }

  return score;
}


// ============================================================
// STORY GROUPING
// ============================================================

function groupEvents(events) {
  const groups = [];

  for (const event of events) {
    event.importance = importanceFor(event);

    const last = groups[groups.length - 1];

    if (!last) {
      groups.push([event]);
      continue;
    }

    const lastText = lower(last[last.length - 1].text);
    const currentText = lower(event.text);

    // Keep direct cause/effect together when appropriate.
    const sameObject =
      (currentText.includes("photograph") && lastText.includes("photograph")) ||
      (currentText.includes("symbol") && lastText.includes("symbol")) ||
      (currentText.includes("box") && lastText.includes("box")) ||
      (currentText.includes("letter") && lastText.includes("letter")) ||
      (currentText.includes("documents") && lastText.includes("documents"));

    if (sameObject && last.length < 2) {
      last.push(event);
    } else {
      groups.push([event]);
    }
  }

  return groups;
}


// ============================================================
// DISTRIBUTE EVENTS INTO EXACT SCENES
// ============================================================

function flattenGroups(groups) {
  return groups.flat();
}

function distributeEvents(events, sceneCount) {
  if (events.length === 0) return [];

  const result = Array.from(
    { length: sceneCount },
    () => []
  );

  // Critical events get their own scene whenever possible.
  const critical = events.filter(e => e.importance >= 4);

  if (events.length <= sceneCount) {
    events.forEach((event, i) => {
      result[i].push(event);
    });
    return result;
  }

  // Sequential distribution first.
  const perScene = Math.ceil(events.length / sceneCount);

  let index = 0;

  for (let s = 0; s < sceneCount; s++) {
    const remainingEvents = events.length - index;
    const remainingScenes = sceneCount - s;

    const take = Math.max(
      1,
      Math.ceil(remainingEvents / remainingScenes)
    );

    for (let j = 0; j < take && index < events.length; j++) {
      result[s].push(events[index++]);
    }
  }

  return result;
}


// ============================================================
// 10 SECOND TIMING
// ============================================================

function sceneTimes(index) {
  const start = index * 10;
  const end = start + 10;

  return {
    start_time: start,
    end_time: end
  };
}


// ============================================================
// DIALOGUE ENGINE
// ============================================================

function dialogueFor(events, characters) {
  const text = lower(events.map(e => e.text).join(" "));
  const protagonist = characters[0] || "Character";

  const mother =
    characters.find(c => lower(c) === "mother") || "Mother";

  if (text.includes("warn") || text.includes("never visit")) {
    return [
      {
        speaker: mother,
        text: `${protagonist}, stay away from that place.`
      }
    ];
  }

  if (text.includes("film camera") || text.includes("camera")) {
    return [
      {
        speaker: protagonist,
        text: "Where did Grandpa get this camera?"
      }
    ];
  }

  if (text.includes("photograph") || text.includes("photographs")) {
    return [
      {
        speaker: protagonist,
        text: "Why is this place in Grandpa's photograph?"
      }
    ];
  }

  if (text.includes("symbol")) {
    return [
      {
        speaker: protagonist,
        text: "I've seen this symbol before."
      }
    ];
  }

  if (text.includes("metal box") || text.includes("hidden box")) {
    return [
      {
        speaker: protagonist,
        text: "What could be hidden inside?"
      }
    ];
  }

  if (text.includes("letter")) {
    return [
      {
        speaker: protagonist,
        text: "Grandpa left this here for a reason."
      }
    ];
  }

  if (text.includes("documents")) {
    return [
      {
        speaker: protagonist,
        text: "These documents explain our family's past."
      }
    ];
  }

  if (text.includes("realizes") || text.includes("family's history")) {
    return [
      {
        speaker: mother,
        text: "Now I understand what Grandpa was protecting."
      }
    ];
  }

  if (text.includes("preserve") || text.includes("safely")) {
    return [
      {
        speaker: protagonist,
        text: "Let's keep these safe for our family."
      }
    ];
  }

  if (text.includes("goes to") || text.includes("travels")) {
    return [
      {
        speaker: protagonist,
        text: "I need to see this place myself."
      }
    ];
  }

  return [];
}


// ============================================================
// VOICEOVER ENGINE
// ============================================================

function makeVoiceover(events) {
  const raw = events
    .map(e => repairEventText(e.text))
    .filter(Boolean)
    .join(" ");

  // Never return an unfinished fragment.
  const sentences = raw.match(/[^.!?]+[.!?]+/g) || [];

  if (sentences.length === 0) {
    return raw;
  }

  // Maximum practical voiceover for a 10-second scene.
  let result = "";

  for (const sentence of sentences) {
    const candidate =
      result ? `${result} ${sentence.trim()}` : sentence.trim();

    if (candidate.length > 210) break;

    result = candidate;
  }

  // If the first complete sentence itself is long,
  // return it instead of cutting it.
  return result || sentences[0].trim();
}


// ============================================================
// CAMERA
// ============================================================

function cameraFor(type, objects) {
  if (objects.length > 0) {
    return "Begin with a medium cinematic shot, move toward the important object with a controlled close-up, then capture the character's reaction.";
  }

  if (type === "journey") {
    return "Use a cinematic tracking shot following the character's movement, ending with a clear view of the destination.";
  }

  if (type === "warning") {
    return "Slow push-in toward the characters, emphasizing facial expressions and emotional tension.";
  }

  if (type === "revelation") {
    return "Start with a medium shot, then slowly push into a close-up as the realization becomes clear.";
  }

  if (type === "resolution") {
    return "Use a calm medium shot followed by a warm emotional close-up of the characters.";
  }

  return "Natural cinematic medium shot with subtle camera movement and clear visual storytelling.";
}


// ============================================================
// LIGHTING
// ============================================================

function lightingFor(type) {
  if (type === "warning") {
    return "Dramatic directional lighting with controlled shadows to emphasize tension.";
  }

  if (type === "discovery" || type === "investigation") {
    return "Focused cinematic lighting that naturally draws attention toward the discovered clue.";
  }

  if (type === "journey") {
    return "Atmospheric cinematic lighting appropriate to the time of day and environment.";
  }

  if (type === "revelation" || type === "resolution") {
    return "Warm natural cinematic lighting suggesting emotional understanding and resolution.";
  }

  return "Natural cinematic lighting appropriate to the location, time of day, and story mood.";
}


// ============================================================
// VISUAL PROMPT
// ============================================================

function createVisualPrompt({
  location,
  characters,
  events,
  objects,
  type
}) {
  const action = events
    .map(e => repairEventText(e.text))
    .filter(Boolean)
    .join(" ");

  const characterText =
    characters.length > 0
      ? characters.join(", ")
      : "story characters";

  const objectText =
    objects.length > 0
      ? ` Important story objects: ${objects.join(", ")}.`
      : "";

  return (
    `Cinematic realistic storytelling. ` +
    `Location: ${location}. ` +
    `Characters: ${characterText}. ` +
    `Action: ${action}.` +
    objectText +
    ` Maintain exact character continuity and chronological story logic. ` +
    `Natural body movement, realistic environment, detailed textures, ` +
    `believable expressions, cinematic composition, consistent visual identity.`
  );
}


// ============================================================
// CONTINUITY
// ============================================================

function continuityFor(characters, objects, location) {
  const characterLock =
    characters.length > 0
      ? characters.join(", ")
      : "recurring characters";

  const objectLock =
    objects.length > 0
      ? ` Important object continuity: ${objects.join(", ")}.`
      : "";

  return (
    `Character continuity lock: ${characterLock}. ` +
    `Keep identical faces, approximate ages, hairstyles, body proportions, ` +
    `clothing style, colors, accessories, and physical identity across scenes. ` +
    `Only show characters who are actually present in the current scene. ` +
    `Do not randomly redesign or replace recurring characters. ` +
    `Location continuity: ${location}.` +
    objectLock
  );
}


// ============================================================
// SCENE CREATION
// ============================================================

function createScene(index, eventGroup, allCharacters, previousLocation, locations) {
  const repairedEvents = eventGroup.map(e => ({
    ...e,
    text: repairEventText(e.text)
  }));

  const combinedText = repairedEvents
    .map(e => e.text)
    .join(" ");

  const event = {
    ...repairedEvents[0],
    text: combinedText
  };

  const characters = charactersForEvent(
    event,
    allCharacters
  );

  const objects = unique(
    repairedEvents.flatMap(e => objectsForEvent(e))
  );

  const location = locationForEvent(
    event,
    previousLocation,
    locations
  );

  const type = repairedEvents[0]?.type || "narrative";

  const dialogue = dialogueFor(
    repairedEvents,
    characters
  );

  const voiceover = makeVoiceover(
    repairedEvents
  );

  const times = sceneTimes(index);

  const action = repairedEvents
    .map(e => e.text)
    .filter(Boolean)
    .join(" ");

  return {
    scene_number: index + 1,
    start_time: times.start_time,
    end_time: times.end_time,

    visual_prompt: createVisualPrompt({
      location,
      characters,
      events: repairedEvents,
      objects,
      type
    }),

    camera: cameraFor(type, objects),

    lighting: lightingFor(type),

    action,

    dialogue,

    voiceover,

    continuity: continuityFor(
      characters,
      objects,
      location
    )
  };
}


// ============================================================
// VALIDATION
// ============================================================

function validateScenes(scenes) {
  const errors = [];

  scenes.forEach((scene, index) => {
    if (scene.start_time !== index * 10) {
      errors.push(
        `Scene ${scene.scene_number} starts at ${scene.start_time}, expected ${index * 10}.`
      );
    }

    if (scene.end_time !== (index + 1) * 10) {
      errors.push(
        `Scene ${scene.scene_number} ends at ${scene.end_time}, expected ${(index + 1) * 10}.`
      );
    }

    if (!scene.action || scene.action.length < 5) {
      errors.push(
        `Scene ${scene.scene_number} has no meaningful action.`
      );
    }

    if (scene.voiceover) {
      const last = scene.voiceover.trim().slice(-1);

      if (![".", "!", "?"].includes(last)) {
        errors.push(
          `Scene ${scene.scene_number} voiceover is not a complete sentence.`
        );
      }
    }

    if (Array.isArray(scene.dialogue)) {
      for (const d of scene.dialogue) {
        if (d.text && d.text.length > 150) {
          errors.push(
            `Scene ${scene.scene_number} dialogue is too long.`
          );
        }
      }
    }
  });

  return errors;
}


// ============================================================
// PROJECT GENERATOR
// ============================================================

function generateProject(prompt, duration, aspectRatio) {
  const story = cleanText(prompt);

  const requestedDuration =
    Math.max(10, Math.min(60, Number(duration) || 60));

  const sceneCount =
    Math.floor(requestedDuration / 10);

  const characters =
    extractCharacters(story);

  const locations =
    detectLocations(story);

  const rawEvents =
    extractEvents(story);

  if (rawEvents.length === 0) {
    throw new Error(
      "No meaningful story events could be detected."
    );
  }

  const groups =
    groupEvents(rawEvents);

  const events =
    flattenGroups(groups);

  const sceneGroups =
    distributeEvents(events, sceneCount);

  const scenes = [];

  let previousLocation = null;

  for (let i = 0; i < sceneCount; i++) {
    const group =
      sceneGroups[i].length > 0
        ? sceneGroups[i]
        : [events[Math.min(i, events.length - 1)]];

    const scene =
      createScene(
        i,
        group,
        characters,
        previousLocation,
        locations
      );

    previousLocation =
      scene.continuity
        .match(/Location continuity: ([^.]+)/)?.[1]
        || previousLocation;

    scenes.push(scene);
  }

  const validationErrors =
    validateScenes(scenes);

  if (validationErrors.length > 0) {
    console.warn(
      "Validation warnings:",
      validationErrors
    );
  }

  return {
    success: true,
    engine_version: ENGINE_VERSION,
    mode: "DEMO_LOCAL_STORY_ENGINE",
    duration: requestedDuration,
    total_scenes: sceneCount,
    aspect_ratio: aspectRatio || "16:9",
    scenes
  };
}


// ============================================================
// API
// ============================================================

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    engine: ENGINE_VERSION,
    message: "SANAPTAI V40 engine is running successfully.",
    gemini: "disabled",
    video_generation: "disabled"
  });
});


app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        success: false,
        error: "Video prompt is required."
      });
    }

    const project =
      generateProject(
        prompt,
        duration,
        aspectRatio
      );

    res.json(project);

  } catch (error) {
    console.error("PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Project generation failed."
    });
  }
});


// ============================================================
// ROOT
// ============================================================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});


// ============================================================
// SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(
    `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
  );
});
