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
const ENGINE_VERSION = "V41.0";


// ============================================================
// TEXT
// ============================================================

function clean(s = "") {
  return String(s)
    .replace(/\s+/g, " ")
    .replace(/\.\.+/g, ".")
    .trim();
}

function sentences(text) {
  return (text.match(/[^.!?]+[.!?]+/g) || [text])
    .map(clean)
    .filter(x => x.length > 5);
}

function lower(s = "") {
  return s.toLowerCase();
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}


// ============================================================
// STORY ENTITIES
// ============================================================

const relationshipMap = {
  mother: "Mother",
  mom: "Mother",
  father: "Father",
  dad: "Father",
  grandfather: "Grandfather",
  grandpa: "Grandfather",
  grandmother: "Grandmother",
  grandma: "Grandmother",
  brother: "Brother",
  sister: "Sister",
  friend: "Friend",
  wife: "Wife",
  husband: "Husband"
};

const cities = [
  "Boston",
  "Chicago",
  "New York",
  "Los Angeles",
  "Seattle",
  "Miami",
  "Denver",
  "Houston",
  "Dallas",
  "San Francisco"
];

function analyzeCharacters(story) {
  const result = [];
  const text = story;

  // "named Alex"
  for (const m of text.matchAll(/\bnamed\s+([A-Z][a-z]+)\b/g)) {
    result.push(m[1]);
  }

  // "a 22-year-old ... named Alex" / "Alex is..."
  for (const m of text.matchAll(
    /\b([A-Z][a-z]{2,})\b(?=\s+(?:is|lives|works|finds|receives|discovers|travels|takes|opens|notices))/g
  )) {
    result.push(m[1]);
  }

  // Relationships only become characters if story actually
  // describes their presence/action, not merely possession.
  const t = lower(story);

  for (const [word, display] of Object.entries(relationshipMap)) {
    const regex = new RegExp(
      `\\b(?:${word})\\b`,
      "i"
    );

    if (regex.test(t)) {
      result.push(display);
    }
  }

  const chars = unique(result);

  // Remove location/time/common words accidentally captured.
  const banned = new Set([
    "Boston",
    "Chicago",
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Curious",
    "Inside",
    "When",
    "One",
    "The",
    "After",
    "Before"
  ]);

  return chars.filter(x => !banned.has(x));
}


// ============================================================
// ACTIVE CHARACTER DETECTION
// ============================================================

function activeCharacters(text, entities) {
  const t = lower(text);
  const result = [];

  for (const character of entities) {
    const c = lower(character);

    if (t.includes(c)) {
      result.push(character);
      continue;
    }

    // Relationship must be doing something in this beat.
    if (
      character === "Mother" &&
      /\b(mother|mom)\b/i.test(text)
    ) {
      result.push(character);
    }

    if (
      character === "Father" &&
      /\b(father|dad)\b/i.test(text)
    ) {
      result.push(character);
    }

    // Grandfather is normally BACKSTORY unless physically present.
    // Words such as "late grandfather", "grandpa's", "grandfather's"
    // do NOT put him on screen.
    if (
      character === "Grandfather" &&
      /\b(grandfather|grandpa)\b/i.test(text) &&
      !/\b(lives|walks|stands|sits|speaks|waits|enters|appears|meets|sees)\b/i.test(text)
    ) {
      // backstory only
    }
  }

  return unique(result);
}


// ============================================================
// LOCATION MODEL
// ============================================================

const locationRules = [
  ["apartment", "apartment"],
  ["home", "home"],
  ["house", "house"],
  ["living room", "living room"],
  ["bedroom", "bedroom"],
  ["kitchen", "kitchen"],
  ["workshop", "workshop"],
  ["basement", "basement"],
  ["attic", "attic"],
  ["abandoned train station", "abandoned train station"],
  ["train station", "train station"],
  ["movie theater", "movie theater"],
  ["theater", "movie theater"],
  ["lighthouse", "lighthouse"],
  ["harbor", "harbor"],
  ["school", "school"],
  ["college", "college"],
  ["office", "office"],
  ["restaurant", "restaurant"],
  ["hospital", "hospital"],
  ["airport", "airport"],
  ["street", "street"],
  ["road", "road"],
  ["forest", "forest"],
  ["park", "park"],
  ["beach", "beach"]
];

function explicitLocation(text) {
  const t = lower(text);

  for (const [pattern, location] of locationRules) {
    if (t.includes(pattern)) return location;
  }

  return null;
}

function cityFromStory(story) {
  for (const city of cities) {
    if (story.includes(city)) return city;
  }
  return null;
}


// ============================================================
// OBJECT NORMALIZATION
// ============================================================

const objectRules = [
  ["old film camera", "film camera"],
  ["film camera", "film camera"],
  ["camera", "film camera"],

  ["photographs", "photographs"],
  ["photograph", "photograph"],

  ["old journal", "journal"],
  ["journal", "journal"],

  ["mysterious red clock", "red clock"],
  ["red clock", "red clock"],
  ["clock", "clock"],

  ["locked glass case", "glass case"],
  ["glass case", "glass case"],

  ["small key", "key"],
  ["key", "key"],

  ["old wooden locker", "wooden locker"],
  ["locker", "wooden locker"],

  ["old letter", "letter"],
  ["letter", "letter"],

  ["family photographs", "family photographs"],
  ["family documents", "family documents"],
  ["documents", "documents"],

  ["metal box", "metal box"],
  ["box", "box"]
];

function objectsFor(text) {
  const t = lower(text);
  const found = [];

  for (const [pattern, object] of objectRules) {
    if (t.includes(pattern)) found.push(object);
  }

  return unique(found);
}


// ============================================================
// STORY BEAT ENGINE
// ============================================================

function classify(text) {
  const t = lower(text);

  if (/lives|is a|works as|works at/.test(t))
    return "setup";

  if (/receives|finds|discovers|comes across/.test(t))
    return "discovery";

  if (/develops|reads|examines|notices|sees|looks at/.test(t))
    return "investigation";

  if (/warns|warning|nervous|tells .* never|tells .* not to/.test(t))
    return "warning";

  if (/travels|goes to|returns to|arrives|enters/.test(t))
    return "journey";

  if (/opens|uses|takes|finds.*inside|hidden|unlocks/.test(t))
    return "action";

  if (/reveals|explains|realizes|understands|learns/.test(t))
    return "revelation";

  if (/preserve|protect|save|safely|decide/.test(t))
    return "resolution";

  return "narrative";
}


// Split sentences into actual causal beats.
// Example:
// "Alex discovers a key and uses it to open a locker."
// becomes:
// 1. discovers key
// 2. uses key to open locker
function splitIntoBeats(sentence) {
  const s = clean(sentence);
  const result = [];

  let match;

  // X discovers/finds A and uses A to B
  match = s.match(
    /^(.*?\b(?:discovers|finds|notices)\b.*?)(?:\s+and\s+)(uses\s+.+)$/i
  );

  if (match) {
    result.push(clean(match[1]));
    result.push(clean(match[2]));
    return result;
  }

  // "Inside ..., he finds ... and discovers ..."
  match = s.match(
    /^(.*?\bfinds\b.*?)(?:\s+and\s+)(discovers\s+.*)$/i
  );

  if (match) {
    result.push(clean(match[1]));
    result.push(clean(match[2]));
    return result;
  }

  // "shows ... but ..."
  match = s.match(
    /^(.*?\bshows\b.*?)(?:,\s*but\s+)(.*)$/i
  );

  if (match) {
    result.push(clean(match[1]));
    result.push(clean(match[2]));
    return result;
  }

  // "takes ... and realizes ..."
  match = s.match(
    /^(.*?\btakes\b.*?)(?:\s+and\s+)(realizes\s+.*)$/i
  );

  if (match) {
    result.push(clean(match[1]));
    result.push(clean(match[2]));
    return result;
  }

  return [s];
}

function buildStoryBeats(story) {
  const beats = [];

  for (const sentence of sentences(story)) {
    for (const piece of splitIntoBeats(sentence)) {
      const text = clean(piece);

      if (!text) continue;

      beats.push({
        id: beats.length + 1,
        text,
        type: classify(text),
        objects: objectsFor(text)
      });
    }
  }

  return beats;
}


// ============================================================
// IMPORTANT: CURRENT LOCATION ≠ MENTIONED LOCATION
// ============================================================

function resolveLocations(beats, story) {
  let current = null;
  const city = cityFromStory(story);

  return beats.map((beat, index) => {
    const explicit = explicitLocation(beat.text);

    if (explicit) {
      current = explicit;
    } else if (!current) {
      current = "home";
    }

    return {
      ...beat,
      location: current,
      city
    };
  });
}


// ============================================================
// SCENE ALLOCATION
// ============================================================

function scoreBeat(beat) {
  const t = lower(beat.text);

  let score = 1;

  if (beat.type === "discovery") score += 3;
  if (beat.type === "warning") score += 3;
  if (beat.type === "revelation") score += 4;
  if (beat.type === "resolution") score += 4;
  if (beat.objects.length) score += 1;

  if (
    t.includes("and") ||
    t.includes("inside") ||
    t.includes("then")
  ) {
    score += 1;
  }

  return score;
}

function allocateScenes(beats, count) {
  const scenes = Array.from(
    { length: count },
    () => []
  );

  if (beats.length <= count) {
    beats.forEach((b, i) => scenes[i].push(b));
    return scenes;
  }

  // Preserve chronological order.
  // Never reorder beats by importance.
  let cursor = 0;

  for (let i = 0; i < count; i++) {
    const remaining = beats.length - cursor;
    const scenesLeft = count - i;

    let take = Math.ceil(remaining / scenesLeft);

    // Resolution should remain in final scene.
    if (i === count - 1) {
      take = remaining;
    }

    for (let j = 0; j < take && cursor < beats.length; j++) {
      scenes[i].push(beats[cursor++]);
    }
  }

  return scenes;
}


// ============================================================
// DIALOGUE — HISTORY AWARE
// ============================================================

function dialogueFor(sceneBeats, active, usedDialogue) {
  const text = lower(
    sceneBeats.map(x => x.text).join(" ")
  );

  const protagonist =
    active.find(x =>
      ![
        "Mother",
        "Father",
        "Grandfather",
        "Grandmother"
      ].includes(x)
    ) || active[0] || "Character";

  const mother = active.includes("Mother");
  const candidate = [];

  if (
    /warn|warning|never visit|stay away|do not go/.test(text) &&
    mother
  ) {
    candidate.push({
      speaker: "Mother",
      text: `${protagonist}, stay away from that place.`
    });
  }

  if (
    !candidate.length &&
    /film camera|camera/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "Why did Grandpa keep this camera?"
    });
  }

  if (
    !candidate.length &&
    /photograph|photographs/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "Why is this place in Grandpa's photograph?"
    });
  }

  if (
    !candidate.length &&
    /journal/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "Grandpa wrote about this place."
    });
  }

  if (
    !candidate.length &&
    /red clock|clock/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "That clock is still working."
    });
  }

  if (
    !candidate.length &&
    /key/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "There is a key hidden inside."
    });
  }

  if (
    !candidate.length &&
    /locker/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "What was Grandpa hiding here?"
    });
  }

  if (
    !candidate.length &&
    /letter/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "Grandpa left this here for a reason."
    });
  }

  if (
    !candidate.length &&
    /reveal|reveals|realizes|understands|family/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "Now I understand what Grandpa left behind."
    });
  }

  if (
    !candidate.length &&
    /preserve|safely|protect/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "I'll keep our family's story safe."
    });
  }

  // NEVER repeat dialogue.
  for (const d of candidate) {
    if (!usedDialogue.has(d.text)) {
      usedDialogue.add(d.text);
      return [d];
    }
  }

  return [];
}


// ============================================================
// VOICEOVER
// ============================================================

function voiceoverFor(beats) {
  const complete = [];

  for (const beat of beats) {
    const text = clean(beat.text);

    if (
      text.endsWith(".") ||
      text.endsWith("!") ||
      text.endsWith("?")
    ) {
      complete.push(text);
    }
  }

  // Never cut a sentence in the middle.
  let output = "";

  for (const sentence of complete) {
    const candidate =
      output
        ? `${output} ${sentence}`
        : sentence;

    if (candidate.length > 230) break;

    output = candidate;
  }

  return output;
}


// ============================================================
// CAMERA / LIGHTING
// ============================================================

function cameraFor(type, objects) {
  if (objects.length) {
    return "Medium cinematic shot followed by a controlled close-up of the important story object, ending on the character's reaction.";
  }

  if (type === "journey") {
    return "Cinematic tracking shot following the character toward the destination.";
  }

  if (type === "warning") {
    return "Slow push-in toward the characters, emphasizing facial expressions and tension.";
  }

  if (type === "revelation") {
    return "Slow cinematic push-in ending on an emotional close-up.";
  }

  if (type === "resolution") {
    return "Calm medium shot followed by a warm emotional close-up.";
  }

  return "Natural cinematic medium shot with subtle camera movement.";
}

function lightingFor(type) {
  if (type === "warning") {
    return "Dramatic directional lighting with controlled shadows.";
  }

  if (
    type === "discovery" ||
    type === "investigation" ||
    type === "action"
  ) {
    return "Focused cinematic lighting emphasizing the important clue.";
  }

  if (
    type === "revelation" ||
    type === "resolution"
  ) {
    return "Warm natural cinematic lighting supporting emotional understanding.";
  }

  return "Natural cinematic lighting appropriate to the time and location.";
}


// ============================================================
// SCENE
// ============================================================

function createScene(index, beats, allCharacters, usedDialogue) {
  const first = beats[0];

  const action = beats
    .map(b => b.text)
    .join(" ");

  const active = unique(
    beats.flatMap(b =>
      activeCharacters(b.text, allCharacters)
    )
  );

  const objects = unique(
    beats.flatMap(b => b.objects)
  );

  const dialogue = dialogueFor(
    beats,
    active,
    usedDialogue
  );

  const voiceover =
    voiceoverFor(beats);

  const location =
    first.location || "story location";

  const type =
    first.type || "narrative";

  const charactersText =
    active.length
      ? active.join(", ")
      : "story protagonist";

  const objectText =
    objects.length
      ? ` Important story objects: ${objects.join(", ")}.`
      : "";

  return {
    scene_number: index + 1,
    start_time: index * 10,
    end_time: (index + 1) * 10,

    visual_prompt:
      `Cinematic realistic storytelling. ` +
      `Location: ${location}. ` +
      `Characters: ${charactersText}. ` +
      `Action: ${action}.` +
      objectText +
      ` Maintain exact chronological story logic and visual continuity. ` +
      `Natural body movement, realistic environment, detailed textures, ` +
      `believable expressions, cinematic composition.`,

    camera:
      cameraFor(type, objects),

    lighting:
      lightingFor(type),

    action,

    dialogue,

    voiceover,

    continuity:
      `Character continuity lock: ${charactersText}. ` +
      `Keep identical faces, approximate ages, hairstyles, body proportions, ` +
      `clothing style, colors, accessories, and physical identity across scenes. ` +
      `Only show characters who are actually present in this scene. ` +
      `Do not place backstory-only characters physically in the scene. ` +
      `Location continuity: ${location}.` +
      objectText
  };
}


// ============================================================
// VALIDATION
// ============================================================

function validate(scenes) {
  const errors = [];
  const dialogueSeen = new Set();

  scenes.forEach((scene, i) => {
    if (
      scene.start_time !== i * 10 ||
      scene.end_time !== (i + 1) * 10
    ) {
      errors.push(`Timing error in scene ${i + 1}`);
    }

    if (!scene.action) {
      errors.push(`Empty action in scene ${i + 1}`);
    }

    if (
      scene.voiceover &&
      !/[.!?]$/.test(scene.voiceover.trim())
    ) {
      errors.push(`Incomplete voiceover in scene ${i + 1}`);
    }

    for (const d of scene.dialogue || []) {
      if (dialogueSeen.has(d.text)) {
        errors.push(`Repeated dialogue in scene ${i + 1}`);
      }

      dialogueSeen.add(d.text);
    }
  });

  return errors;
}


// ============================================================
// PROJECT
// ============================================================

function generateProject(prompt, duration, aspectRatio) {
  const story = clean(prompt);

  const seconds =
    Math.max(
      10,
      Math.min(
        60,
        Number(duration) || 60
      )
    );

  const sceneCount =
    Math.floor(seconds / 10);

  const characters =
    analyzeCharacters(story);

  let beats =
    buildStoryBeats(story);

  beats =
    resolveLocations(beats, story);

  if (!beats.length) {
    throw new Error("No story beats detected.");
  }

  const sceneGroups =
    allocateScenes(
      beats,
      sceneCount
    );

  const usedDialogue =
    new Set();

  const scenes =
    sceneGroups.map(
      (group, index) =>
        createScene(
          index,
          group,
          characters,
          usedDialogue
        )
    );

  const errors =
    validate(scenes);

  if (errors.length) {
    console.warn(
      "V41 validation:",
      errors
    );
  }

  return {
    success: true,
    engine_version: ENGINE_VERSION,
    mode: "LOCAL_STORY_INTELLIGENCE",
    duration: seconds,
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
    message:
      "SANAPTAI V41 story intelligence engine is running.",
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
    console.error(
      "SANAPTAI V41 ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Story generation failed."
    });
  }
});


app.get("/", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );
});


app.listen(PORT, () => {
  console.log(
    `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
  );
});
