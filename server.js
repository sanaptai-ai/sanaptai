import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const ENGINE_VERSION = "V36.0";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "with", "his", "her",
  "their", "they", "he", "she", "it", "this", "that", "to",
  "of", "in", "on", "at", "from", "as", "was", "were", "is",
  "are", "be", "has", "have", "had", "for", "by", "into",
  "then", "one", "day", "morning", "night"
]);

function clean(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitStory(prompt) {
  return clean(prompt)
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(clean)
    .filter((x) => x.length > 12);
}

function extractCharacters(prompt) {
  const names = new Set();

  const patterns = [
    /\b(?:named|called)\s+([A-Z][a-z]+)/g,
    /\b([A-Z][a-z]{2,})\s+(?:lives|discovers|finds|goes|runs|sees|decides|tries|helps|meets|enters|leaves|opens|repairs|returns)\b/g
  ];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(prompt)) !== null) {
      if (match[1] && !STOPWORDS.has(match[1].toLowerCase())) {
        names.add(match[1]);
      }
    }
  }

  return [...names];
}

function extractLocations(sentences) {
  const locations = new Set();

  const locationWords =
    /\b(?:town|city|village|house|home|workshop|school|forest|forest|street|road|harbor|harbour|lighthouse|beach|mountain|office|hospital|station|room|castle|farm|island|coast|coastal town)\b/gi;

  for (const sentence of sentences) {
    const matches = sentence.match(locationWords);

    if (matches) {
      matches.forEach((m) => locations.add(m.toLowerCase()));
    }
  }

  return [...locations];
}

function detectEventType(sentence) {
  const s = sentence.toLowerCase();

  if (
    /lives|grows up|is a|has a family|works as|lives with/.test(s)
  ) {
    return "setup";
  }

  if (
    /discovers|finds|opens|receives|learns|notices|sees|finds out/.test(s)
  ) {
    return "discovery";
  }

  if (
    /warning|warns|danger|threat|storm|problem|trouble|dangerous/.test(s)
  ) {
    return "warning";
  }

  if (
    /tries|attempts|asks|tells|confronts|faces|fails|refuses|rejects/.test(s)
  ) {
    return "conflict";
  }

  if (
    /decides|chooses|plans|determines|must|will/.test(s)
  ) {
    return "decision";
  }

  if (
    /runs|walks|travels|goes|returns|reaches|climbs|enters|leaves/.test(s)
  ) {
    return "journey";
  }

  if (
    /repairs|fixes|builds|fights|rescues|saves|stops|opens|breaks/.test(s)
  ) {
    return "action";
  }

  if (
    /turns on|starts|works again|restores|returns to normal|safe/.test(s)
  ) {
    return "resolution";
  }

  if (
    /morning|finally|thank|thanks|saved|survives|ends|after the/.test(s)
  ) {
    return "ending";
  }

  return "story";
}

function importanceFor(type, sentence) {
  const s = sentence.toLowerCase();

  if (
    type === "warning" ||
    type === "conflict" ||
    type === "decision" ||
    type === "action" ||
    type === "resolution" ||
    type === "ending"
  ) {
    return 3;
  }

  if (
    /discovers|finds|reaches|enters|leaves|notices|realizes/.test(s)
  ) {
    return 2;
  }

  return 1;
}

function extractEvents(sentences) {
  return sentences.map((sentence, index) => {
    const type = detectEventType(sentence);

    return {
      id: `E${String(index + 1).padStart(2, "0")}`,
      order: index + 1,
      phase: type,
      action: sentence,
      importance: importanceFor(type, sentence),
      location: guessLocation(sentence),
      weight: type === "action" || type === "conflict" ? 2 : 1
    };
  });
}

function guessLocation(sentence) {
  const s = sentence.toLowerCase();

  const locations = [
    "lighthouse",
    "workshop",
    "harbor",
    "harbour",
    "town",
    "village",
    "city",
    "house",
    "home",
    "school",
    "forest",
    "street",
    "road",
    "beach",
    "mountain",
    "office",
    "hospital",
    "station",
    "room",
    "castle",
    "farm",
    "island",
    "coast"
  ];

  for (const location of locations) {
    if (s.includes(location)) {
      return location;
    }
  }

  return "story location";
}

/*
========================================================
CINEMATIC GROUPING
========================================================
*/

function canMerge(a, b) {
  if (!a || !b) return false;

  if (a.location !== b.location) {
    const travel =
      a.phase === "journey" ||
      b.phase === "journey";

    if (!travel) return false;
  }

  if (
    a.phase === "ending" ||
    b.phase === "ending"
  ) {
    return false;
  }

  return true;
}

function groupEvents(events) {
  const groups = [];
  let current = [];

  for (const event of events) {
    if (current.length === 0) {
      current.push(event);
      continue;
    }

    const previous = current[current.length - 1];

    if (
      current.length < 2 &&
      canMerge(previous, event)
    ) {
      current.push(event);
    } else {
      groups.push(current);
      current = [event];
    }
  }

  if (current.length) {
    groups.push(current);
  }

  return groups;
}

function summarizeGroup(group) {
  if (group.length === 1) {
    return group[0].action;
  }

  const first = group[0].action;
  const rest = group.slice(1).map((x) => x.action);

  return `${first} ${rest.join(" ")}`;
}

/*
========================================================
SCENE DISTRIBUTION
========================================================
*/

function distributeGroups(groups, sceneCount) {
  const scenes = Array.from({ length: sceneCount }, () => []);

  const safeGroups = Array.isArray(groups)
    ? groups.filter((g) => Array.isArray(g) && g.length > 0)
    : [];

  if (safeGroups.length === 0) {
    return scenes;
  }

  safeGroups.forEach((group, index) => {
    const sceneIndex = Math.min(
      Math.floor(index * sceneCount / safeGroups.length),
      sceneCount - 1
    );

    scenes[sceneIndex].push(group);
  });

  // Empty scenes को पिछले available group से भरना नहीं है।
  // इससे duplicate events और iterable errors से बचते हैं।
  return scenes;
}

function beatTimes(count) {
  if (count <= 1) {
    return [
      { start: 0, end: 10 }
    ];
  }

  if (count === 2) {
    return [
      { start: 0, end: 5 },
      { start: 5, end: 10 }
    ];
  }

  return [
    { start: 0, end: 3 },
    { start: 3, end: 7 },
    { start: 7, end: 10 }
  ];
}

/*
========================================================
DIALOGUE
========================================================
*/

function makeDialogue(groups) {
  const text = groups
    .flat()
    .map((e) => e.action)
    .join(" ");

  const s = text.toLowerCase();

  if (s.includes("warn")) {
    return [
      {
        speaker: "Main Character",
        text: "We need to act before it is too late."
      }
    ];
  }

  if (s.includes("decides") || s.includes("must")) {
    return [
      {
        speaker: "Main Character",
        text: "I'll handle this myself."
      }
    ];
  }

  if (
    s.includes("thanks") ||
    s.includes("thank")
  ) {
    return [
      {
        speaker: "Supporting Character",
        text: "Thank you. You saved us."
      }
    ];
  }

  return [];
}

/*
========================================================
VOICEOVER
========================================================
*/

function makeVoiceover(groups) {
  const text = groups
    .flat()
    .map((e) => e.action)
    .join(" ");

  if (text.length <= 180) {
    return text;
  }

  return text.slice(0, 177).trim() + "...";
}

/*
========================================================
CAMERA / LIGHTING
========================================================
*/

function cameraFor(groups) {
  const text = groups
    .flat()
    .map((e) => e.action)
    .join(" ")
    .toLowerCase();

  if (/runs|chases|fights|rescues/.test(text)) {
    return "Dynamic cinematic tracking shot with controlled handheld movement.";
  }

  if (/discovers|finds|opens|notices/.test(text)) {
    return "Slow cinematic push-in emphasizing the discovery and character reaction.";
  }

  if (/storm|danger|threat/.test(text)) {
    return "Wide atmospheric shot followed by dramatic reaction close-ups.";
  }

  if (/repairs|fixes|builds/.test(text)) {
    return "Detailed close-ups of the action mixed with focused medium shots.";
  }

  if (/thanks|morning|safe|saved/.test(text)) {
    return "Warm cinematic medium shot ending with a slow pull-back.";
  }

  return "Smooth cinematic camera movement with natural framing.";
}

function lightingFor(groups) {
  const text = groups
    .flat()
    .map((e) => e.action)
    .join(" ")
    .toLowerCase();

  if (/storm|night|danger/.test(text)) {
    return "Dramatic cinematic lighting, darker atmosphere and strong contrast.";
  }

  if (/morning|sunrise|safe|thanks/.test(text)) {
    return "Warm natural morning light with soft cinematic highlights.";
  }

  return "Natural cinematic lighting with realistic environmental shadows.";
}

/*
========================================================
CHARACTER LOCK
========================================================
*/

function characterLock(characters) {
  if (!characters.length) {
    return "Maintain consistent main-character identity throughout the story.";
  }

  return `Maintain these detected characters consistently: ${characters.join(
    ", "
  )}. Do not change their age, face, clothing, hairstyle or identity unless the story explicitly requires it.`;
}

/*
========================================================
SCENE CREATOR
========================================================
*/

function createScene(groups, sceneNumber, characters) {
  const limitedGroups = groups.slice(0, 3);
  const times = beatTimes(limitedGroups.length);

  const beats = limitedGroups.map((group, index) => {
    const [start, end] = times[index];

    const action = summarizeGroup(group);

    return {
      start_time: start,
      end_time: end,
      location: group[0]?.location || "story location",
      action,
      event_ids: group.map((e) => e.id),
      camera: cameraFor([group]),
      lighting: lightingFor([group])
    };
  });

  return {
    scene_number: sceneNumber,
    start_time: "0s",
    end_time: "10s",

    visual_prompt: beats
      .map(
        (b) =>
          `${b.start_time}-${b.end_time}s: ${b.action}`
      )
      .join(" "),

    camera: beats
      .map(
        (b) =>
          `${b.start_time}-${b.end_time}s: ${b.camera}`
      )
      .join(" "),

    lighting: beats
      .map(
        (b) =>
          `${b.start_time}-${b.end_time}s: ${b.lighting}`
      )
      .join(" "),

    action: beats
      .map(
        (b) =>
          `${b.start_time}-${b.end_time}s: ${b.action}`
      )
      .join(" "),

    dialogue: makeDialogue(limitedGroups),

    voiceover: makeVoiceover(limitedGroups),

    continuity: characterLock(characters),

    characters,

    beats
  };
}

/*
========================================================
VALIDATION
========================================================
*/

function validateScenes(scenes, events) {
  const errors = [];

  if (!scenes.length) {
    errors.push("No scenes generated.");
  }

  for (const scene of scenes) {
    if (scene.start_time !== "0s") {
      errors.push(`Scene ${scene.scene_number} start time invalid.`);
    }

    if (scene.end_time !== "10s") {
      errors.push(`Scene ${scene.scene_number} end time invalid.`);
    }

    if (!Array.isArray(scene.beats)) {
      errors.push(`Scene ${scene.scene_number} has no beats.`);
      continue;
    }

    let previous = 0;

    for (const beat of scene.beats) {
      if (beat.start_time !== previous) {
        errors.push(
          `Scene ${scene.scene_number} contains timing gap.`
        );
      }

      previous = beat.end_time;

      if (!beat.action) {
        errors.push(
          `Scene ${scene.scene_number} has empty action.`
        );
      }
    }

    if (previous !== 10) {
      errors.push(
        `Scene ${scene.scene_number} does not end at 10 seconds.`
      );
    }

    if (!Array.isArray(scene.dialogue)) {
      errors.push(
        `Scene ${scene.scene_number} dialogue invalid.`
      );
    }
  }

  const generatedIds = scenes.flatMap((scene) =>
    scene.beats.flatMap((beat) => beat.event_ids)
  );

  const expectedIds = events.map((e) => e.id);

  if (
    JSON.stringify(generatedIds) !==
    JSON.stringify(expectedIds)
  ) {
    errors.push(
      "Event chronology or event coverage mismatch."
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/*
========================================================
V36 ENGINE
========================================================
*/

function generateProject(prompt, duration, aspectRatio) {
  const sentences = splitStory(prompt);

  if (sentences.length < 2) {
    throw new Error(
      "Story is too short. Please provide a complete story."
    );
  }

  const characters = extractCharacters(prompt);
  const locations = extractLocations(sentences);
  const events = extractEvents(sentences);

  /*
  Current supported cinematic duration.
  60 seconds = 6 x 10-second scenes.
  */
  const sceneCount = Math.floor(Number(duration) / 10);

  if (sceneCount < 1) {
    throw new Error("Duration must be at least 10 seconds.");
  }

  if (sceneCount > 6) {
    throw new Error(
      "V36 currently supports up to 60 seconds while the universal planner is being tested."
    );
  }

  const groups = groupEvents(events);

  const sceneGroups = distributeGroups(
    groups,
    sceneCount
  );

  const scenes = sceneGroups.map(
    (groupsForScene, index) =>
      createScene(
        groupsForScene,
        index + 1,
        characters
      )
  );

  const validation = validateScenes(
    scenes,
    events
  );

  if (!validation.valid) {
    throw new Error(
      validation.errors.join("\n")
    );
  }

  return {
    status: "success",
    engine: ENGINE_VERSION,
    mode: "UNIVERSAL_LOCAL_STORY_PLANNER",

    prompt,

    duration: Number(duration),

    total_scenes: scenes.length,

    aspect_ratio: aspectRatio,

    story_analysis: {
      detected_characters: characters,
      detected_locations: locations,
      total_events: events.length,
      total_cinematic_groups: groups.length
    },

    scenes
  };
}

/*
========================================================
API
========================================================
*/

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    app: "SANAPTAI",
    engine: ENGINE_VERSION,
    message: "SANAPTAI V36 Universal Story Engine is running.",
    gemini: "disabled",
    video_generation: "disabled"
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt = "",
      duration = 60,
      aspectRatio = "16:9"
    } = req.body || {};

    if (!clean(prompt)) {
      return res.status(400).json({
        status: "error",
        message: "Video prompt is required."
      });
    }

    const project = generateProject(
      prompt,
      duration,
      aspectRatio
    );

    return res.json(project);
  } catch (error) {
    console.error("V36 ERROR:", error);
console.error("V36 STACK:", error.stack);
    return res.status(400).json({
      status: "error",
      engine: ENGINE_VERSION,
      message: error.message
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(
    process.cwd() + "/public/index.html"
  );
});

app.listen(PORT, () => {
  console.log(
    `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
  );
});
