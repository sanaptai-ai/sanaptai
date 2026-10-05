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

const ENGINE_VERSION = "FINAL-1.2";

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
  const matches =
    String(text).match(/[^.!?]+[.!?]+/g) || [];

  const result = matches
    .map(clean)
    .filter(x => x.length > 5);

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

  if (/[.!?]$/.test(value)) {
    return value;
  }

  return `${value}.`;
}

// ============================================================
// CHARACTER INTELLIGENCE
// ============================================================

const relationshipMap = {
  mother: "Mother",
  mom: "Mother",
  mum: "Mother",

  father: "Father",
  dad: "Father",

  grandfather: "Grandfather",
  grandpa: "Grandfather",
  "grandfather's": "Grandfather",
  "grandpa's": "Grandfather",

  grandmother: "Grandmother",
  grandma: "Grandmother",

  brother: "Brother",
  sister: "Sister",

  wife: "Wife",
  husband: "Husband",

  son: "Son",
  daughter: "Daughter"
};

const bannedNames = [
  "someone",
  "something",
  "person",
  "man",
  "woman",
  "people",
  "someone else"
];

function analyzeCharacters(prompt) {
  const text = String(prompt);

  const names = [];

  // Proper names after common introduction patterns.
  const namePatterns = [
    /\b(?:named|called)\s+([A-Z][a-z]{2,})\b/g,
    /\b(?:I am|I'm)\s+([A-Z][a-z]{2,})\b/g
  ];

  for (const regex of namePatterns) {
    let match;

    while ((match = regex.exec(text)) !== null) {
      const name = match[1];

      if (
        name &&
        !bannedNames.includes(lower(name)) &&
        !names.includes(name)
      ) {
        names.push(name);
      }
    }
  }

  // If no explicit name is found, detect capitalized names conservatively.
  if (!names.length) {
    const capitalized =
      text.match(/\b[A-Z][a-z]{2,}\b/g) || [];

    for (const word of capitalized) {
      if (
        ![
          "The",
          "A",
          "An",
          "One",
          "Inside",
          "Boston",
          "New",
          "York",
          "Los",
          "Angeles",
          "Grandpa",
          "Grandfather",
          "Mother",
          "Father"
        ].includes(word)
      ) {
        names.push(word);
      }
    }
  }

  return unique(names);
}

function findProtagonist(prompt, characters = []) {
  const text = String(prompt);

  const namedMatch =
    text.match(/\b(?:named|called)\s+([A-Z][a-z]{2,})\b/);

  if (namedMatch && namedMatch[1]) {
    return namedMatch[1];
  }

  if (characters.length) {
    return characters[0];
  }

  return "Alex";
}

function activeCharacters(sceneText, protagonist) {
  const text = lower(sceneText);

  const result = [];

  if (
    protagonist &&
    new RegExp(`\\b${protagonist.toLowerCase()}\\b`).test(text)
  ) {
    result.push(protagonist);
  }

  for (const [keyword, character] of Object.entries(
    relationshipMap
  )) {
    const regex = new RegExp(`\\b${keyword}\\b`);

    if (!regex.test(text)) continue;

    // Grandfather references in memories, photos, journals,
    // letters, etc. should not automatically place him physically
    // inside the scene.
    if (character === "Grandfather") {
      const backstory =
        /photograph|photo|picture|journal|letter|memory|past|history|late grandfather|old grandfather/.test(
          text
        );

      const physicalAction =
        /standing|walking|sitting|waiting|running|holding|opens|opened|takes|took|enters|entered|leaves|left|arrives|arrived|travels|travelled/.test(
          text
        );

      if (backstory && !physicalAction) {
        continue;
      }
    }

    if (!result.includes(character)) {
      result.push(character);
    }
  }

  if (!result.length && protagonist) {
    result.push(protagonist);
  }

  return result;
}

// ============================================================
// LOCATION INTELLIGENCE
// ============================================================

const locationRules = [
  {
    keywords: [
      "apartment",
      "home",
      "house",
      "bedroom",
      "living room",
      "kitchen"
    ],
    name: "Alex's apartment"
  },

  {
    keywords: [
      "abandoned train station",
      "train station",
      "railway station",
      "station"
    ],
    name: "abandoned train station"
  },

  {
    keywords: [
      "street",
      "road",
      "outside",
      "city"
    ],
    name: "city street"
  },

  {
    keywords: [
      "forest",
      "woods"
    ],
    name: "forest"
  },

  {
    keywords: [
      "school"
    ],
    name: "school"
  },

  {
    keywords: [
      "hospital"
    ],
    name: "hospital"
  },

  {
    keywords: [
      "office"
    ],
    name: "office"
  }
];

function mentionedLocation(text) {
  const value = lower(text);

  for (const rule of locationRules) {
    for (const keyword of rule.keywords) {
      if (value.includes(keyword)) {
        return rule.name;
      }
    }
  }

  return null;
}

function isReferencedLocation(text, location) {
  const value = lower(text);

  if (!location) return false;

  if (
    location === "abandoned train station" &&
    /photograph|photo|picture|journal|letter/.test(value) &&
    !/travels to|travels|arrives|enters|inside|at the station/.test(
      value
    )
  ) {
    return true;
  }

  return false;
}

function isMovementToLocation(text, location) {
  const value = lower(text);

  if (!location) return false;

  if (
    location === "abandoned train station" &&
    /travels|travel|goes|go|heads|journeys|arrives|reaches|returns/.test(
      value
    ) &&
    /station/.test(value)
  ) {
    return true;
  }

  return false;
}

function resolveLocations(beats) {
  let currentLocation = "Alex's apartment";

  return beats.map(beat => {
    const text = beat.text || "";

    const mentioned = mentionedLocation(text);

    if (mentioned) {
      if (
        mentioned !== "abandoned train station" ||
        isMovementToLocation(text, mentioned) ||
        !isReferencedLocation(text, mentioned)
      ) {
        currentLocation = mentioned;
      }
    }

    return {
      ...beat,
      location: currentLocation
    };
  });
}

// ============================================================
// OBJECT INTELLIGENCE
// ============================================================

function objectsFor(text) {
  const value = lower(text);

  const objects = [];

  if (/film camera|old camera|camera/.test(value)) {
    objects.push("film camera");
  }

  if (/family photographs|photographs|photograph|photo/.test(value)) {
    objects.push("family photographs");
  }

  if (/journal|old journal/.test(value)) {
    objects.push("old journal");
  }

  if (/red clock/.test(value)) {
    objects.push("red clock");
  }

  if (/glass case/.test(value)) {
    objects.push("glass case");
  }

  if (/key/.test(value)) {
    objects.push("key");
  }

  if (/wooden locker|locker/.test(value)) {
    objects.push("wooden locker");
  }

  if (/letter/.test(value)) {
    objects.push("letter");
  }

  if (/family documents|documents/.test(value)) {
    objects.push("family documents");
  }

  if (/metal box/.test(value)) {
    objects.push("metal box");
  }

  return unique(objects);
}

// ============================================================
// STORY CLASSIFICATION
// ============================================================

function classify(text) {
  const value = lower(text);

  if (
    /realizes|realise|realized|realised|understands|understood|truth|family history|revelation|reveals/.test(
      value
    )
  ) {
    return "revelation";
  }

  if (
    /warning|warn|danger|dangerous|stay away|do not go|never visit/.test(
      value
    )
  ) {
    return "warning";
  }

  if (
    /travels|travel|goes to|go to|heads to|journeys|arrives|reaches/.test(
      value
    )
  ) {
    return "journey";
  }

  if (
    /opens|opened|unlocks|unlocked|takes|took|uses|used|pulls|pulled/.test(
      value
    )
  ) {
    return "action";
  }

  if (
    /finds|found|discovers|discovered|notices|noticed|sees|saw/.test(
      value
    )
  ) {
    return "discovery";
  }

  if (
    /investigates|investigate|searches|search|examines|examines|looks for/.test(
      value
    )
  ) {
    return "investigation";
  }

  if (
    /returns|return|keeps|protects|preserves|safe|home/.test(
      value
    )
  ) {
    return "resolution";
  }

  return "setup";
}

// ============================================================
// ATOMIC STORY BEAT SPLITTER
// ============================================================

function splitAtomicBeats(text) {
  const source = clean(text);

  if (!source) return [];

  const result = [];

  const rawSentences = sentences(source);

  for (const sentence of rawSentences) {
    const value = clean(sentence);

    // Finds something and immediately uses/opens it.
    const findUse =
      value.match(
        /^(.*?\b(?:finds|found|discovers|discovered)\b.*?)(\b(?:opens|opened|uses|used|takes|took|unlocks|unlocked)\b.*)$/i
      );

    if (findUse) {
      result.push(ensurePeriod(findUse[1]));
      result.push(ensurePeriod(findUse[2]));
      continue;
    }

    // Finds something and discovers another clue.
    const findDiscover =
      value.match(
        /^(.*?\b(?:finds|found)\b.*?)(\b(?:discovers|discovered|realizes|realised|realized)\b.*)$/i
      );

    if (findDiscover) {
      result.push(ensurePeriod(findDiscover[1]));
      result.push(ensurePeriod(findDiscover[2]));
      continue;
    }

    // Takes something and realizes something.
    const takesRealizes =
      value.match(
        /^(.*?\b(?:takes|took|holds|held)\b.*?)(\b(?:realizes|realized|understands|understood)\b.*)$/i
      );

    if (takesRealizes) {
      result.push(ensurePeriod(takesRealizes[1]));
      result.push(ensurePeriod(takesRealizes[2]));
      continue;
    }

    // "shows X, but..."
    const showBut =
      value.match(
        /^(.*?\bshows?\b.*?)(\bbut\b.*)$/i
      );

    if (showBut) {
      result.push(ensurePeriod(showBut[1]));
      result.push(ensurePeriod(showBut[2]));
      continue;
    }

    result.push(ensurePeriod(value));
  }

  return result.map(clean).filter(Boolean);
}

function buildStoryBeats(prompt) {
  const beats = splitAtomicBeats(prompt);

  if (!beats.length) {
    return [
      {
        text: clean(prompt),
        type: "setup"
      }
    ];
  }

  return beats.map((text, index) => ({
    id: index + 1,
    text,
    type: classify(text)
  }));
}

// ============================================================
// SCENE ALLOCATION
// ============================================================

function allocateScenes(beats, sceneCount) {
  const groups = [];

  if (!beats.length) {
    for (let i = 0; i < sceneCount; i++) {
      groups.push([]);
    }

    return groups;
  }

  const total = beats.length;

  for (let i = 0; i < sceneCount; i++) {
    const start = Math.floor((i * total) / sceneCount);
    const end = Math.floor(
      ((i + 1) * total) / sceneCount
    );

    let group = beats.slice(start, end);

    // Every scene should have at least one beat when possible.
    if (!group.length) {
      const fallbackIndex = Math.min(
        i,
        beats.length - 1
      );

      group = [beats[fallbackIndex]];
    }

    groups.push(group);
  }

  return groups;
}

// ============================================================
// DIALOGUE INTELLIGENCE FINAL-1.2
// ============================================================

function dialogueFor(
  sceneBeats,
  active,
  usedDialogue,
  protagonist,
  isFinalScene = false
) {
  const text = lower(
    sceneBeats.map(b => b.text).join(" ")
  );

  const candidates = [];

  const add = (speaker, dialogue) => {
    candidates.push({
      speaker,
      text: clean(dialogue)
    });
  };

  // ----------------------------------------------------------
  // 1. FINAL REALIZATION
  // Highest priority.
  // ----------------------------------------------------------

  if (
    isFinalScene &&
    /realizes|realise|realized|realised|understands|understood|learns|learned|family history|family's past|family past|truth about.*family/.test(
      text
    )
  ) {
    add(
      protagonist,
      "Now I understand the truth about my family's past."
    );
  }

  // ----------------------------------------------------------
  // 2. EXACT WAITING EVENT
  // Must beat generic locker dialogue.
  // ----------------------------------------------------------

  if (
    /\b(waited|waiting|wait)\b/.test(text) &&
    /\b(never returned|never came back|never came|never arrived|didn't return|did not return)\b/.test(
      text
    )
  ) {
    add(
      protagonist,
      "Grandpa was waiting for someone who never returned."
    );
  }

  // ----------------------------------------------------------
  // 3. MOTHER WARNING
  // ----------------------------------------------------------

  if (
    /warn|warning|never visit|stay away|do not go/.test(
      text
    ) &&
    active.includes("Mother")
  ) {
    add(
      "Mother",
      `${protagonist}, stay away from that place.`
    );
  }

  // ----------------------------------------------------------
  // 4. CAMERA
  // ----------------------------------------------------------

  if (/film camera|old camera|camera/.test(text)) {
    add(
      protagonist,
      "Why did Grandpa keep this camera?"
    );
  }

  // ----------------------------------------------------------
  // 5. JOURNAL
  // ----------------------------------------------------------

  if (/journal/.test(text)) {
    add(
      protagonist,
      "Grandpa wrote about this place."
    );
  }

  // ----------------------------------------------------------
  // 6. RED CLOCK
  // ----------------------------------------------------------

  if (/red clock/.test(text)) {
    add(
      protagonist,
      "That clock is still working."
    );
  }

  // ----------------------------------------------------------
  // 7. KEY
  // ----------------------------------------------------------

  if (/key/.test(text)) {
    add(
      protagonist,
      "There's a key hidden inside."
    );
  }

  // ----------------------------------------------------------
  // 8. PHOTOGRAPH
  // ----------------------------------------------------------

  if (
    /photograph|photographs|photo/.test(text) &&
    !/red clock/.test(text)
  ) {
    add(
      protagonist,
      "Why is this place in Grandpa's photograph?"
    );
  }

  // ----------------------------------------------------------
  // 9. LOCKER
  // Only generic if there is no stronger waiting event.
  // ----------------------------------------------------------

  if (
    /locker/.test(text) &&
    !/waiting|waited|never returned|never came back/.test(
      text
    )
  ) {
    add(
      protagonist,
      "What was Grandpa hiding here?"
    );
  }

  // ----------------------------------------------------------
  // 10. LETTER
  // Never override final realization.
  // ----------------------------------------------------------

  if (
    /letter/.test(text) &&
    !isFinalScene &&
    !/realizes|realise|realized|realised|understands|understood|family history|family's past|family past/.test(
      text
    )
  ) {
    add(
      protagonist,
      "Grandpa left this here for a reason."
    );
  }

  // ----------------------------------------------------------
  // 11. GENERAL REVELATION
  // ----------------------------------------------------------

  if (
    /reveals|realizes|realise|realized|realised|understands|understood/.test(
      text
    ) &&
    !isFinalScene
  ) {
    add(
      protagonist,
      "Now I understand what Grandpa was trying to reveal."
    );
  }

  // ----------------------------------------------------------
  // 12. RESOLUTION
  // ----------------------------------------------------------

  if (/preserve|safely|protect/.test(text)) {
    add(
      protagonist,
      "I'll keep our family's story safe."
    );
  }

  // ----------------------------------------------------------
  // FIRST UNUSED DIALOGUE
  // ----------------------------------------------------------

  for (const d of candidates) {
    if (!usedDialogue.has(d.text)) {
      usedDialogue.add(d.text);
      return [d];
    }
  }

  return [];
}

// ============================================================
// VOICEOVER INTELLIGENCE
// ============================================================

function voiceoverFor(beats) {
  const lines = [];

  for (const beat of beats) {
    const parts = sentences(beat.text);

    for (const part of parts) {
      const sentence = ensurePeriod(part);

      if (sentence) {
        lines.push(sentence);
      }
    }
  }

  // Keep complete sentences and avoid excessively long narration.
  const selected = [];
  let currentLength = 0;

  for (const line of lines) {
    const candidateLength =
      currentLength +
      (currentLength ? 1 : 0) +
      line.length;

    if (
      candidateLength > 240 &&
      selected.length
    ) {
      break;
    }

    selected.push(line);
    currentLength = candidateLength;
  }

  return clean(selected.join(" "));
}

// ============================================================
// CAMERA INTELLIGENCE
// ============================================================

function cameraFor(type, objects = []) {
  if (objects.includes("red clock")) {
    return "Slow cinematic push-in toward the red clock, ending on a detailed close-up.";
  }

  if (objects.includes("family photographs")) {
    return "Gentle over-the-shoulder shot followed by a slow close-up of the photograph.";
  }

  if (objects.includes("film camera")) {
    return "Medium shot transitioning into a detailed close-up of the film camera.";
  }

  if (objects.includes("old journal")) {
    return "Over-the-shoulder shot moving slowly toward the open journal.";
  }

  if (objects.includes("wooden locker")) {
    return "Tracking shot toward the wooden locker followed by a tense close-up.";
  }

  if (objects.includes("key")) {
    return "Close-up of the key followed by a slow reveal of the surrounding environment.";
  }

  switch (type) {
    case "setup":
      return "Slow cinematic establishing shot with a natural camera movement.";

    case "journey":
      return "Smooth tracking shot following the protagonist through the environment.";

    case "warning":
      return "Slow controlled push-in emphasizing the character's concerned expression.";

    case "discovery":
      return "Slow push-in toward the discovered clue with a subtle reveal.";

    case "investigation":
      return "Over-the-shoulder investigative shot with a gradual camera movement.";

    case "action":
      return "Dynamic medium shot followed by a detailed close-up of the action.";

    case "revelation":
      return "Slow cinematic push-in toward the protagonist's emotional reaction.";

    case "resolution":
      return "Gentle wide shot with a slow pull-back creating a reflective ending.";

    default:
      return "Cinematic medium shot with natural movement and realistic framing.";
  }
}

// ============================================================
// LIGHTING INTELLIGENCE
// ============================================================

function lightingFor(type) {
  switch (type) {
    case "setup":
      return "Natural cinematic lighting with soft environmental shadows.";

    case "journey":
      return "Atmospheric cinematic lighting with realistic environmental contrast.";

    case "warning":
      return "Moody low-key lighting with subtle dramatic shadows.";

    case "discovery":
      return "Focused cinematic lighting emphasizing the discovered clue.";

    case "investigation":
      return "Dim atmospheric lighting with realistic directional shadows.";

    case "action":
      return "Dynamic cinematic lighting with strong environmental contrast.";

    case "revelation":
      return "Emotional cinematic lighting with a subtle warm highlight.";

    case "resolution":
      return "Soft reflective cinematic lighting with a calm natural atmosphere.";

    default:
      return "Realistic cinematic lighting with natural shadows.";
  }
}

// ============================================================
// SCENE CREATION
// ============================================================

function createScene(
  index,
  beats,
  allCharacters,
  protagonist,
  usedDialogue,
  isFinalScene = false
) {
  const action = clean(
    beats
      .map(b => b.text)
      .join(" ")
  );

  const active = activeCharacters(
    action,
    protagonist
  );

  const objects = unique(
    beats.flatMap(b => objectsFor(b.text))
  );

  const types = beats.map(
    b => b.type
  );

  let type =
    types[types.length - 1] || "setup";

  if (types.includes("revelation")) {
    type = "revelation";
  } else if (types.includes("warning")) {
    type = "warning";
  } else if (types.includes("journey")) {
    type = "journey";
  }

  const location =
    beats.find(b => b.location)?.location ||
    "Alex's apartment";

  const dialogue = dialogueFor(
    beats,
    active,
    usedDialogue,
    protagonist,
    isFinalScene
  );

  const voiceover = voiceoverFor(beats);

  const charactersText =
    active.length
      ? active.join(", ")
      : protagonist;

  const objectText =
    objects.length
      ? ` Important visible objects: ${objects.join(", ")}.`
      : "";

  const visualPrompt = clean(
    `Cinematic realistic storytelling. Location: ${location}. Characters: ${charactersText}. Action: ${action}${objectText} Maintain exact chronological story logic and visual continuity. Natural body movement, realistic environment, detailed textures, believable expressions, cinematic composition.`
  );

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

    visual_prompt: visualPrompt,

    dialogue,

    voiceover,

    camera: cameraFor(type, objects),

    lighting: lightingFor(type),

    continuity_lock:
      `Keep ${protagonist} visually consistent throughout the entire story. Maintain consistent face, age, hairstyle, clothing, body proportions, environment, props, and chronological continuity.`,

    final_scene: isFinalScene
  };
}

// ============================================================
// VALIDATION
// ============================================================

function validate(scenes) {
  const errors = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    if (scene.duration !== 10) {
      errors.push(
        `Scene ${i + 1} duration is not 10 seconds.`
      );
    }

    if (
      scene.end_time -
        scene.start_time !==
      10
    ) {
      errors.push(
        `Scene ${i + 1} timing is invalid.`
      );
    }

    if (!clean(scene.action)) {
      errors.push(
        `Scene ${i + 1} has empty action.`
      );
    }

    if (
      scene.voiceover &&
      !/[.!?]$/.test(scene.voiceover)
    ) {
      errors.push(
        `Scene ${i + 1} voiceover does not end correctly.`
      );
    }

    if (/\.\./.test(scene.visual_prompt)) {
      errors.push(
        `Scene ${i + 1} contains double punctuation in visual prompt.`
      );
    }

    if (
      scene.dialogue &&
      scene.dialogue.length
    ) {
      const dialogueText =
        scene.dialogue[0].text || "";

      if (dialogueText.length > 150) {
        errors.push(
          `Scene ${i + 1} dialogue is too long.`
        );
      }

      // Scene 5/event-level protection.
      const actionText = lower(
        scene.action
      );

      const dialogueLower = lower(
        dialogueText
      );

      if (
        /waiting|waited/.test(actionText) &&
        /never returned|never came back|never came|did not return|didn't return/.test(
          actionText
        ) &&
        !/waiting|returned|came back/.test(
          dialogueLower
        )
      ) {
        errors.push(
          `Scene ${i + 1} dialogue does not match the waiting/return event.`
        );
      }

      // Final scene protection.
      if (
        i === scenes.length - 1 &&
        /family history|family's past|family past|realizes|realized|understands|understood/.test(
          actionText
        ) &&
        !/understand|truth|family|past/.test(
          dialogueLower
        )
      ) {
        errors.push(
          `Final scene dialogue does not match the final realization.`
        );
      }
    }
  }

  // Detect repeated dialogue.
  const dialogueTexts = scenes
    .flatMap(scene =>
      (scene.dialogue || []).map(
        d => lower(d.text)
      )
    )
    .filter(Boolean);

  const seen = new Set();

  for (const dialogue of dialogueTexts) {
    if (seen.has(dialogue)) {
      errors.push(
        `Repeated dialogue detected: ${dialogue}`
      );
    }

    seen.add(dialogue);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================================
// PROJECT GENERATION
// ============================================================

function generateProject(
  prompt,
  duration,
  aspectRatio
) {
  const requestedSeconds =
    Number(duration) || 60;

  // Current stable engine is intentionally capped
  // at 60 seconds.
  const seconds = Math.min(
    60,
    Math.max(
      10,
      Math.floor(
        requestedSeconds / 10
      ) * 10
    )
  );

  const sceneCount =
    Math.floor(seconds / 10);

  const characters =
    analyzeCharacters(prompt);

  const protagonist =
    findProtagonist(
      prompt,
      characters
    );

  const rawBeats =
    buildStoryBeats(prompt);

  const beats =
    resolveLocations(rawBeats);

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
          protagonist,
          usedDialogue,
          index === sceneCount - 1
        )
    );

  const validation =
    validate(scenes);

  return {
    success: true,

    engine_version:
      ENGINE_VERSION,

    project: {
      prompt: clean(prompt),

      duration: seconds,

      total_scenes: sceneCount,

      aspect_ratio:
        aspectRatio || "16:9",

      protagonist,

      characters,

      scenes
    },

    validation
  };
}

// ============================================================
// API: TEST
// ============================================================

app.get("/api/test", (req, res) => {
  res.json({
    success: true,

    message:
      "SANAPTAI API is working perfectly!",

    engine:
      ENGINE_VERSION,

    gemini:
      "disabled",

    video_generation:
      "disabled",

    timestamp:
      new Date().toISOString()
  });
});

// ============================================================
// API: DEMO PROJECT
// ============================================================

app.post(
  "/api/demo-project",
  (req, res) => {
    try {
      const {
        prompt,
        duration = 60,
        aspectRatio = "16:9"
      } = req.body || {};

      if (
        !prompt ||
        !String(prompt).trim()
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Video prompt is required."
        });
      }

      const result =
        generateProject(
          String(prompt),
          duration,
          aspectRatio
        );

      return res.json(result);
    } catch (error) {
      console.error(
        "PROJECT GENERATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        error:
          "Project creation failed.",

        details:
          error?.message ||
          "Unknown error"
      });
    }
  }
);

// ============================================================
// API: CREATE PROJECT
// Alias for future frontend use.
// ============================================================

app.post(
  "/api/create-project",
  (req, res) => {
    try {
      const {
        prompt,
        duration = 60,
        aspectRatio = "16:9"
      } = req.body || {};

      if (
        !prompt ||
        !String(prompt).trim()
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Video prompt is required."
        });
      }

      const result =
        generateProject(
          String(prompt),
          duration,
          aspectRatio
        );

      return res.json(result);
    } catch (error) {
      console.error(
        "CREATE PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        error:
          "Project creation failed.",

        details:
          error?.message ||
          "Unknown error"
      });
    }
  }
);

// ============================================================
// API: PLAN SCENES
// ============================================================

app.post(
  "/api/plan-scenes",
  (req, res) => {
    try {
      const {
        prompt,
        duration = 60,
        aspectRatio = "16:9"
      } = req.body || {};

      if (
        !prompt ||
        !String(prompt).trim()
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Video prompt is required."
        });
      }

      const result =
        generateProject(
          String(prompt),
          duration,
          aspectRatio
        );

      return res.json(result);
    } catch (error) {
      console.error(
        "PLAN SCENES ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        error:
          "Scene planning failed.",

        details:
          error?.message ||
          "Unknown error"
      });
    }
  }
);

// ============================================================
// ROOT
// ============================================================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );
});

// ============================================================
// 404 API HANDLER
// ============================================================

app.use(
  "/api",
  (req, res) => {
    res.status(404).json({
      success: false,
      error:
        "API endpoint not found."
    });
  }
);

// ============================================================
// SERVER START
// ============================================================

app.listen(PORT, () => {
  console.log(
    `SANAPTAI backend running on port ${PORT}`
  );

  console.log(
    `SANAPTAI Engine: ${ENGINE_VERSION}`
  );

  console.log(
    "Gemini: disabled"
  );

  console.log(
    "Video generation: disabled"
  );
});
