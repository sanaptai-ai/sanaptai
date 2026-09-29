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
const ENGINE_VERSION = "FINAL-1.0";

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
  const matches = String(text).match(/[^.!?]+[.!?]+/g) || [];
  const result = matches.map(clean).filter(x => x.length > 5);

  const consumed = result.join(" ");
  const remainder = clean(String(text).slice(consumed.length));

  if (remainder.length > 5) {
    result.push(remainder);
  }

  return result.length ? result : [clean(text)];
}

function lower(s = "") {
  return s.toLowerCase();
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

// ============================================================
// CHARACTER INTELLIGENCE
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

const bannedNames = new Set([
  "Boston",
  "Chicago",
  "New",
  "York",
  "Los",
  "Angeles",
  "San",
  "Francisco",
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

function analyzeCharacters(story) {
  const result = [];

  for (const m of story.matchAll(/\bnamed\s+([A-Z][a-z]+)\b/g)) {
    if (!bannedNames.has(m[1])) {
      result.push(m[1]);
    }
  }

  for (const m of story.matchAll(
    /\b([A-Z][a-z]{2,})\b(?=\s+(?:is|lives|works|finds|receives|discovers|travels|takes|opens|notices))/g
  )) {
    if (!bannedNames.has(m[1])) {
      result.push(m[1]);
    }
  }

  // Only add relationships if they are actually present as story
  // entities. They will NOT automatically become active characters.
  for (const word of Object.keys(relationshipMap)) {
    const regex = new RegExp(`\\b${word}\\b`, "i");

    if (regex.test(story)) {
      result.push(relationshipMap[word]);
    }
  }

  return unique(result);
}

// ============================================================
// PROTAGONIST
// ============================================================

function findProtagonist(characters) {
  return (
    characters.find(c =>
      ![
        "Mother",
        "Father",
        "Grandfather",
        "Grandmother",
        "Brother",
        "Sister",
        "Friend",
        "Wife",
        "Husband"
      ].includes(c)
    ) || characters[0] || "Character"
  );
}

// ============================================================
// ACTIVE CHARACTER INTELLIGENCE
// ============================================================

function activeCharacters(text, entities, protagonist) {
  const t = lower(text);
  const result = [];

  // Named protagonist is active whenever explicitly mentioned.
  if (
    protagonist &&
    new RegExp(`\\b${protagonist}\\b`, "i").test(text)
  ) {
    result.push(protagonist);
  }

  // Pronouns in an action beat refer to the protagonist unless
  // another physical character is explicitly introduced.
  if (
    protagonist &&
    /\b(he|she|his|her|him|they|their)\b/i.test(text) &&
    /\b(finds|finds|discovers|takes|opens|uses|travels|goes|arrives|enters|notices|receives|sees|reads|examines|realizes|waits)\b/i.test(text)
  ) {
    result.push(protagonist);
  }

  // Mother/Father only become physically present when they are
  // explicitly performing or receiving an action.
  if (
    /\b(mother|mom)\b/i.test(text) &&
    /\b(says|asks|warns|tells|looks|stands|sits|speaks|shows|hands|gives|becomes)\b/i.test(text)
  ) {
    result.push("Mother");
  }

  if (
    /\b(father|dad)\b/i.test(text) &&
    /\b(says|asks|warns|tells|looks|stands|sits|speaks|shows|hands|gives)\b/i.test(text)
  ) {
    result.push("Father");
  }

  // Grandfather is BACKSTORY by default.
  // Only show him if he is physically acting in the present story.
  if (
    /\b(grandfather|grandpa)\b/i.test(text) &&
    /\b(stands|sits|walks|enters|leaves|speaks|talks|meets|holds|hands|waits)\b/i.test(text) &&
    !/\b(late grandfather|late grandpa|his grandfather|his grandpa|her grandfather|her grandpa|grandfather's|grandpa's|once waited)\b/i.test(text)
  ) {
    result.push("Grandfather");
  }

  return unique(result);
}

// ============================================================
// LOCATION INTELLIGENCE
// ============================================================

const locationRules = [
  ["abandoned train station", "abandoned train station"],
  ["train station", "train station"],
  ["apartment", "apartment"],
  ["home", "home"],
  ["house", "house"],
  ["living room", "living room"],
  ["bedroom", "bedroom"],
  ["kitchen", "kitchen"],
  ["workshop", "workshop"],
  ["basement", "basement"],
  ["attic", "attic"],
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

function mentionedLocation(text) {
  const t = lower(text);

  for (const [pattern, location] of locationRules) {
    if (t.includes(pattern)) {
      return location;
    }
  }

  return null;
}

// A location mentioned as part of a photograph, letter, journal,
// memory, description, etc. is NOT the current location.
function isReferencedLocation(text, location) {
  const t = lower(text);

  if (!location) return false;

  const referencePatterns = [
    `photograph shows ${location}`,
    `photo shows ${location}`,
    `picture shows ${location}`,
    `image shows ${location}`,
    `photograph of ${location}`,
    `photo of ${location}`,
    `picture of ${location}`,
    `journal mentions ${location}`,
    `journal described ${location}`,
    `journal about ${location}`,
    `letter mentions ${location}`,
    `story about ${location}`
  ];

  return referencePatterns.some(p => t.includes(p));
}

function isMovementToLocation(text, location) {
  const t = lower(text);

  if (!location) return false;

  return (
    new RegExp(
      `\\b(travels|goes|go|returns|arrives|enters|walks|runs|drives|heads|reaches)\\b[^.]*\\b${location}\\b`,
      "i"
    ).test(text) ||
    new RegExp(
      `\\b(inside|at|into|within)\\b[^.]*\\b${location}\\b`,
      "i"
    ).test(text)
  );
}

function resolveLocations(beats, story) {
  let current = "apartment";

  return beats.map(beat => {
    const mentioned = mentionedLocation(beat.text);

    // Location appearing only inside a photograph/journal/letter
    // does NOT change current scene location.
    if (
      mentioned &&
      !isReferencedLocation(beat.text, mentioned)
    ) {
      if (
        isMovementToLocation(beat.text, mentioned) ||
        /\b(inside|at|in)\b/i.test(beat.text) &&
        !/\b(photograph|photo|picture|journal|letter)\b/i.test(beat.text)
      ) {
        current = mentioned;
      }
    }

    // Explicit "home" after returning home.
    if (
      /\b(takes .* home|brings .* home|returns home|goes home|at home)\b/i.test(beat.text)
    ) {
      current = "home";
    }

    return {
      ...beat,
      location: current
    };
  });
}

// ============================================================
// OBJECT INTELLIGENCE
// ============================================================

function objectsFor(text) {
  const t = lower(text);
  const found = [];

  if (/\b(film camera|old camera|camera)\b/.test(t)) {
    found.push("film camera");
  }

  if (/\b(family photographs|collection of family photographs)\b/.test(t)) {
    found.push("family photographs");
  } else if (/\bphotographs?\b/.test(t)) {
    found.push("photographs");
  }

  if (/\bold journal\b|\bjournal\b/.test(t)) {
    found.push("journal");
  }

  if (/\bmysterious red clock\b|\bred clock\b/.test(t)) {
    found.push("red clock");
  }

  if (
    /\bglass case\b/.test(t) ||
    /\blocked glass case\b/.test(t)
  ) {
    found.push("glass case");
  }

  if (/\bsmall key\b|\bkey\b/.test(t)) {
    found.push("key");
  }

  if (/\bold wooden locker\b|\bwooden locker\b|\blocker\b/.test(t)) {
    found.push("wooden locker");
  }

  if (/\bold letter\b|\bletter\b/.test(t)) {
    found.push("letter");
  }

  if (/\bfamily documents?\b|\bdocuments?\b/.test(t)) {
    found.push("family documents");
  }

  if (/\bmetal box\b|\bbox\b/.test(t)) {
    found.push("metal box");
  }

  return unique(found);
}

// ============================================================
// STORY BEATS
// ============================================================

function classify(text) {
  const t = lower(text);

  if (/lives|is a|works as|works at/.test(t)) {
    return "setup";
  }

  if (/receives|finds|discovers|comes across/.test(t)) {
    return "discovery";
  }

  if (/develops|reads|examines|notices|sees|looks at/.test(t)) {
    return "investigation";
  }

  if (/warns|warning|nervous|tells .* never|tells .* not to/.test(t)) {
    return "warning";
  }

  if (/travels|goes to|returns to|arrives|enters|heads to|reaches/.test(t)) {
    return "journey";
  }

  if (/opens|uses|takes|finds.*inside|hidden|unlocks/.test(t)) {
    return "action";
  }

  if (/reveals|explains|realizes|understands|learns/.test(t)) {
    return "revelation";
  }

  if (/preserve|protect|save|safely|decide/.test(t)) {
    return "resolution";
  }

  return "narrative";
}

// ============================================================
// ATOMIC BEAT SPLITTER
// ============================================================

function splitIntoBeats(sentence) {
  const s = clean(sentence);
  const result = [];

  let match;

  // Example:
  // Alex discovers a key hidden inside the clock and uses it
  // to open an old wooden locker.
  match = s.match(
    /^(.+?\b(?:discovers|finds|notices)\b.+?)\s+and\s+(uses\s+.+)$/i
  );

  if (match) {
    const first = clean(match[1]);
    const secondAction = clean(match[2]);

    const subjectMatch = first.match(
      /^([A-Z][a-z]+)\b/i
    );

    const subject =
      subjectMatch
        ? subjectMatch[1]
        : null;

    result.push(first);

    if (subject) {
      result.push(
        clean(`${subject} ${secondAction}`)
      );
    } else {
      result.push(secondAction);
    }

    return result;
  }

  // Finds X and opens/discovers Y.
  match = s.match(
    /^(.+?\bfinds\b.+?)\s+and\s+(opens|discovers|uses|takes|unlocks)\s+(.+)$/i
  );

  if (match) {
    const first = clean(match[1]);
    const action = clean(`${match[2]} ${match[3]}`);

    const subjectMatch = first.match(
      /^([A-Z][a-z]+)\b/i
    );

    const subject =
      subjectMatch
        ? subjectMatch[1]
        : null;

    result.push(first);
    result.push(
      subject
        ? clean(`${subject} ${action}`)
        : action
    );

    return result;
  }

  // "Inside the locker, he finds X and discovers Y."
  match = s.match(
    /^(.*?\bfinds\b.*?)(?:\s+and\s+)(discovers\s+.*)$/i
  );

  if (match) {
    const first = clean(match[1]);
    const second = clean(match[2]);

    const pronoun =
      first.match(/\b(he|she|they)\b/i);

    if (pronoun) {
      result.push(first);
      result.push(
        clean(`${pronoun[1]} ${second}`)
      );
    } else {
      result.push(first, second);
    }

    return result;
  }

  // Shows X, but Y.
  match = s.match(
    /^(.*?\bshows\b.*?)(?:,\s*but\s+)(.*)$/i
  );

  if (match) {
    result.push(
      clean(match[1]),
      clean(match[2])
    );
    return result;
  }

  // Takes X and realizes Y.
  match = s.match(
    /^(.+?\btakes\b.+?)\s+and\s+(realizes\s+.+)$/i
  );

  if (match) {
    const first = clean(match[1]);
    const second = clean(match[2]);

    const subjectMatch =
      first.match(/^([A-Z][a-z]+)\b/i);

    const subject =
      subjectMatch
        ? subjectMatch[1]
        : null;

    result.push(first);

    result.push(
      subject
        ? clean(`${subject} ${second}`)
        : second
    );

    return result;
  }

  return [s];
}

function buildStoryBeats(story) {
  const beats = [];

  for (const sentence of sentences(story)) {
    const pieces = splitIntoBeats(sentence);

    for (const piece of pieces) {
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
// SCENE ALLOCATION
// ============================================================

function allocateScenes(beats, count) {
  const scenes = Array.from(
    { length: count },
    () => []
  );

  if (beats.length <= count) {
    beats.forEach((beat, index) => {
      scenes[index].push(beat);
    });

    return scenes;
  }

  let cursor = 0;

  for (let i = 0; i < count; i++) {
    const remaining = beats.length - cursor;
    const scenesLeft = count - i;

    // Keep chronological sequence.
    const take = Math.ceil(
      remaining / scenesLeft
    );

    for (
      let j = 0;
      j < take && cursor < beats.length;
      j++
    ) {
      scenes[i].push(beats[cursor++]);
    }
  }

  return scenes;
}

// ============================================================
// DIALOGUE
// ============================================================

function dialogueFor(
  sceneBeats,
  active,
  usedDialogue,
  protagonist
) {
  const text = lower(
    sceneBeats.map(b => b.text).join(" ")
  );

  const candidate = [];

  if (
    /warn|warning|never visit|stay away|do not go/.test(text) &&
    active.includes("Mother")
  ) {
    candidate.push({
      speaker: "Mother",
      text: `${protagonist}, stay away from that place.`
    });
  }

  if (
    /film camera|camera/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "Why did Grandpa keep this camera?"
    });
  }

  if (
    /photograph|photographs/.test(text) &&
    !/red clock/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "Why is this place in Grandpa's photograph?"
    });
  }

  if (
    /journal/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "Grandpa wrote about this place."
    });
  }

  if (
    /red clock/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "That clock is still working."
    });
  }

  if (
    /key/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "There's a key hidden inside."
    });
  }

  if (
    /locker/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "What was Grandpa hiding here?"
    });
  }

  if (
    /letter/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "Grandpa left this here for a reason."
    });
  }

  if (
    /reveals|realizes|understands|family history/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "Now I understand our family's past."
    });
  }

  if (
    /preserve|safely|protect/.test(text)
  ) {
    candidate.push({
      speaker: protagonist,
      text: "I'll keep our family's story safe."
    });
  }

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

    if (/[.!?]$/.test(text)) {
      complete.push(text);
    }
  }

  let output = "";

  for (const sentence of complete) {
    const candidate = output
      ? `${output} ${sentence}`
      : sentence;

    if (candidate.length > 240) {
      break;
    }

    output = candidate;
  }

  return output;
}

// ============================================================
// CAMERA / LIGHT
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
// SCENE CREATION
// ============================================================

function createScene(
  index,
  beats,
  allCharacters,
  protagonist,
  usedDialogue
) {
  const action = beats
    .map(b => b.text)
    .join(" ");

  const active = unique(
    beats.flatMap(b =>
      activeCharacters(
        b.text,
        allCharacters,
        protagonist
      )
    )
  );

  // If pronoun/action beats exist but explicit name isn't present,
  // protagonist must still be the visible character.
  if (
    active.length === 0 &&
    beats.some(b =>
      /\b(he|she|his|her|him|they|their)\b/i.test(b.text)
    )
  ) {
    active.push(protagonist);
  }

  const objects = unique(
    beats.flatMap(b => b.objects)
  );

  const dialogue = dialogueFor(
    beats,
    active,
    usedDialogue,
    protagonist
  );

  const voiceover =
    voiceoverFor(beats);

  const location =
    beats[0]?.location || "home";

  const type =
    beats[0]?.type || "narrative";

  const charactersText =
    active.length
      ? active.join(", ")
      : protagonist;

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
      errors.push(
        `Timing error in scene ${i + 1}`
      );
    }

    if (!scene.action) {
      errors.push(
        `Empty action in scene ${i + 1}`
      );
    }

    if (
      scene.voiceover &&
      !/[.!?]$/.test(scene.voiceover.trim())
    ) {
      errors.push(
        `Incomplete voiceover in scene ${i + 1}`
      );
    }

    for (const d of scene.dialogue || []) {
      if (dialogueSeen.has(d.text)) {
        errors.push(
          `Repeated dialogue in scene ${i + 1}`
        );
      }

      dialogueSeen.add(d.text);

      if (d.text.length > 150) {
        errors.push(
          `Dialogue too long in scene ${i + 1}`
        );
      }
    }
  });

  return errors;
}

// ============================================================
// PROJECT
// ============================================================

function generateProject(
  prompt,
  duration,
  aspectRatio
) {
  const story = clean(prompt);

  const seconds = Math.max(
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

  const protagonist =
    findProtagonist(characters);

  let beats =
    buildStoryBeats(story);

  if (!beats.length) {
    throw new Error(
      "No story beats detected."
    );
  }

  beats =
    resolveLocations(
      beats,
      story
    );

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
          usedDialogue
        )
    );

  const errors =
    validate(scenes);

  if (errors.length) {
    console.warn(
      `${ENGINE_VERSION} validation:`,
      errors
    );
  }

  return {
    success: true,
    engine_version: ENGINE_VERSION,
    mode: "LOCAL_STORY_INTELLIGENCE",
    duration: seconds,
    total_scenes: sceneCount,
    aspect_ratio:
      aspectRatio || "16:9",
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
      "SANAPTAI final story intelligence engine is running.",
    gemini: "disabled",
    video_generation: "disabled"
  });
});

app.post(
  "/api/demo-project",
  (req, res) => {
    try {
      const {
        prompt,
        duration,
        aspectRatio
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

      const project =
        generateProject(
          prompt,
          duration,
          aspectRatio
        );

      res.json(project);

    } catch (error) {
      console.error(
        `${ENGINE_VERSION} ERROR:`,
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Story generation failed."
      });
    }
  }
);

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
