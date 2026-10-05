import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "FINAL-1.4";

// ============================================================
// STATIC FRONTEND
// ============================================================

app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// TEXT HELPERS
// ============================================================

function clean(s = "") {
  return String(s)
    .replace(/\s+/g, " ")
    .replace(/\.{2,}/g, ".")
    .replace(/!{2,}/g, "!")
    .replace(/\?{2,}/g, "?")
    .replace(/\s+([.!?])/g, "$1")
    .trim();
}

function sentences(text) {
  const matches = String(text).match(/[^.!?]+[.!?]+/g) || [];
  const result = matches.map(clean).filter(x => x.length > 5);
  if (result.length) return result;
  const fallback = clean(text);
  return fallback ? [fallback] : [];
}

function lower(s = "") {
  return String(s).toLowerCase();
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function ensurePeriod(text = "") {
  const value = clean(text);
  if (!value) return "";
  if (/[.!?]$/.test(value)) return value;
  return `${value}.`;
}

// ============================================================
// CHARACTER INTELLIGENCE
// ============================================================

const relationshipMap = {
  mother: "Mother", mom: "Mother", mum: "Mother",
  father: "Father", dad: "Father",
  grandfather: "Grandfather", grandpa: "Grandfather", "grandfather's": "Grandfather", "grandpa's": "Grandfather",
  grandmother: "Grandmother", grandma: "Grandmother",
  brother: "Brother", sister: "Sister",
  wife: "Wife", husband: "Husband",
  son: "Son", daughter: "Daughter"
};

const bannedNames = ["someone", "something", "person", "man", "woman", "people", "someone else"];

function analyzeCharacters(prompt) {
  const text = String(prompt);
  const names = [];
  const namePatterns = [
    /\b(?:named|called)\s+([A-Z][a-z]{2,})\b/g,
    /\b(?:I am|I'm)\s+([A-Z][a-z]{2,})\b/g
  ];

  for (const regex of namePatterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const name = match[1];
      if (name && !bannedNames.includes(lower(name)) && !names.includes(name)) {
        names.push(name);
      }
    }
  }

  if (!names.length) {
    const capitalized = text.match(/\b[A-Z][a-z]{2,}\b/g) || [];
    for (const word of capitalized) {
      if (!["The", "A", "An", "One", "Inside", "Boston", "New", "York", "Los", "Angeles", "Grandpa", "Grandfather", "Mother", "Father"].includes(word)) {
        names.push(word);
      }
    }
  }

  return unique(names);
}

function findProtagonist(prompt, characters = []) {
  const text = String(prompt);
  const namedMatch = text.match(/\b(?:named|called)\s+([A-Z][a-z]{2,})\b/);
  if (namedMatch && namedMatch[1]) return namedMatch[1];
  if (characters.length) return characters[0];
  return "Alex";
}

function activeCharacters(sceneText, protagonist) {
  const text = lower(sceneText);
  const result = [];

  if (protagonist && new RegExp(`\\b${protagonist.toLowerCase()}\\b`).test(text)) {
    result.push(protagonist);
  }

  for (const [keyword, character] of Object.entries(relationshipMap)) {
    const regex = new RegExp(`\\b${keyword}\\b`);
    if (!regex.test(text)) continue;

    if (character === "Grandfather") {
      const backstory = /photograph|photo|picture|journal|letter|memory|past|history|late grandfather|old grandfather/.test(text);
      const physicalAction = /standing|walking|sitting|waiting|running|holding|opens|opened|takes|took|enters|entered|leaves|left|arrives|arrived|travels|travelled/.test(text);
      if (backstory && !physicalAction) continue;
    }

    if (!result.includes(character)) result.push(character);
  }

  if (!result.length && protagonist) result.push(protagonist);
  return result;
}

// ============================================================
// LOCATION & OBJECT INTELLIGENCE
// ============================================================

const locationRules = [
  { keywords: ["apartment", "home", "house", "bedroom", "living room", "kitchen"], name: "Alex's apartment" },
  { keywords: ["abandoned train station", "train station", "railway station", "station"], name: "abandoned train station" },
  { keywords: ["street", "road", "outside", "city"], name: "city street" },
  { keywords: ["forest", "woods"], name: "forest" },
  { keywords: ["school"], name: "school" },
  { keywords: ["hospital"], name: "hospital" },
  { keywords: ["office"], name: "office" }
];

function mentionedLocation(text) {
  const value = lower(text);
  for (const rule of locationRules) {
    for (const keyword of rule.keywords) {
      if (value.includes(keyword)) return rule.name;
    }
  }
  return null;
}

function resolveLocations(beats) {
  let currentLocation = "Alex's apartment";
  return beats.map(beat => {
    const text = beat.text || "";
    const mentioned = mentionedLocation(text);
    if (mentioned) currentLocation = mentioned;
    return { ...beat, location: currentLocation };
  });
}

function objectsFor(text) {
  const value = lower(text);
  const objects = [];
  if (/film camera|old camera|camera/.test(value)) objects.push("film camera");
  if (/family photographs|photographs|photograph|photo/.test(value)) objects.push("family photographs");
  if (/journal|old journal/.test(value)) objects.push("old journal");
  if (/red clock/.test(value)) objects.push("red clock");
  if (/key/.test(value)) objects.push("key");
  if (/wooden locker|locker/.test(value)) objects.push("wooden locker");
  if (/letter/.test(value)) objects.push("letter");
  return unique(objects);
}

function classify(text) {
  const value = lower(text);
  if (/realizes|realise|realized|realised|understands|understood|truth|family history|revelation|reveals/.test(value)) return "revelation";
  if (/warning|warn|danger|dangerous|stay away|do not go|never visit/.test(value)) return "warning";
  if (/travels|travel|goes to|go to|heads to|journeys|arrives|reaches/.test(value)) return "journey";
  if (/opens|opened|unlocks|unlocked|takes|took|uses|used/.test(value)) return "action";
  if (/finds|found|discovers|discovered|notices|sees/.test(value)) return "discovery";
  if (/returns|return|keeps|protects|preserves|safe|home/.test(value)) return "resolution";
  return "setup";
}

function splitAtomicBeats(text) {
  const source = clean(text);
  if (!source) return [];
  const rawSentences = sentences(source);
  return rawSentences.map(ensurePeriod).filter(Boolean);
}

function buildStoryBeats(prompt) {
  const beats = splitAtomicBeats(prompt);
  if (!beats.length) return [{ text: clean(prompt), type: "setup" }];
  return beats.map((text, index) => ({ id: index + 1, text, type: classify(text) }));
}

function allocateScenes(beats, sceneCount) {
  const groups = [];
  if (!beats.length) {
    for (let i = 0; i < sceneCount; i++) groups.push([]);
    return groups;
  }
  const total = beats.length;
  for (let i = 0; i < sceneCount; i++) {
    const start = Math.floor((i * total) / sceneCount);
    const end = Math.floor(((i + 1) * total) / sceneCount);
    let group = beats.slice(start, end);
    if (!group.length) group = [beats[Math.min(i, beats.length - 1)]];
    groups.push(group);
  }
  return groups;
}

function dialogueFor(sceneBeats, active, usedDialogue, protagonist, isFinalScene = false) {
  const text = lower(sceneBeats.map(b => b.text).join(" "));
  if (isFinalScene) {
    return [{ speaker: protagonist, text: "Now I understand the truth about my family's past." }];
  }
  return [];
}

function voiceoverFor(beats) {
  return clean(beats.map(b => b.text).join(" "));
}

function cameraFor(type, objects = []) {
  if (objects.length) return `Cinematic close-up focusing on ${objects[0]}.`;
  return "Slow cinematic establishing shot with natural camera movement.";
}

function lightingFor(type) {
  return "Natural cinematic lighting with soft environmental shadows.";
}

function createScene(index, beats, allCharacters, protagonist, usedDialogue, isFinalScene = false) {
  const action = clean(beats.map(b => b.text).join(" "));
  const active = activeCharacters(action, protagonist);
  const objects = unique(beats.flatMap(b => objectsFor(b.text)));
  const type = "setup";
  const location = beats.find(b => b.location)?.location || "Alex's apartment";
  const dialogue = dialogueFor(beats, active, usedDialogue, protagonist, isFinalScene);
  const voiceover = voiceoverFor(beats);

  return {
    scene_number: index + 1,
    start_time: index * 10,
    end_time: (index + 1) * 10,
    duration: 10,
    type,
    location,
    characters: active,
    objects,
    action,
    visual_prompt: clean(`Cinematic storytelling at ${location}. Action: ${action}`),
    dialogue,
    voiceover,
    camera: cameraFor(type, objects),
    lighting: lightingFor(type),
    continuity_lock: `Keep ${protagonist} visually consistent.`,
    final_scene: isFinalScene
  };
}

function generateProject(prompt, duration, aspectRatio) {
  const requestedSeconds = Number(duration) || 60;
  const seconds = Math.min(60, Math.max(10, Math.floor(requestedSeconds / 10) * 10));
  const sceneCount = Math.floor(seconds / 10);

  const characters = analyzeCharacters(prompt);
  const protagonist = findProtagonist(prompt, characters);
  const rawBeats = buildStoryBeats(prompt);
  const beats = resolveLocations(rawBeats);
  const sceneGroups = allocateScenes(beats, sceneCount);

  const usedDialogue = new Set();
  const scenes = sceneGroups.map((group, index) =>
    createScene(index, group, characters, protagonist, usedDialogue, index === sceneCount - 1)
  );

  return {
    success: true,
    engine_version: ENGINE_VERSION,
    // BOTH FORMATS PROVIDED TO PREVENT FRONTEND BREAKAGE:
    scenes: scenes, 
    scene_plan: scenes,
    project: {
      prompt: clean(prompt),
      duration: seconds,
      total_scenes: sceneCount,
      aspect_ratio: aspectRatio || "16:9",
      protagonist,
      characters,
      scenes
    }
  };
}

// ============================================================
// API ENDPOINTS
// ============================================================

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "SANAPTAI API is working!", engine: ENGINE_VERSION });
});

const handleProjectRequest = (req, res) => {
  try {
    const { prompt, duration = 60, aspectRatio = "16:9" } = req.body || {};
    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ success: false, error: "Video prompt is required." });
    }
    const result = generateProject(String(prompt), duration, aspectRatio);
    return res.json(result);
  } catch (error) {
    console.error("GENERATION ERROR:", error);
    return res.status(500).json({ success: false, error: "Project creation failed.", details: error?.message });
  }
};

app.post("/api/demo-project", handleProjectRequest);
app.post("/api/create-project", handleProjectRequest);
app.post("/api/plan-scenes", handleProjectRequest);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/api", (req, res) => {
  res.status(404).json({ success: false, error: "API endpoint not found." });
});

app.listen(PORT, () => {
  console.log(`SANAPTAI backend running on port ${PORT} (Engine ${ENGINE_VERSION})`);
});
