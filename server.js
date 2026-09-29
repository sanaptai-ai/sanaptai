import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const ENGINE_VERSION = "V37.0";

/* =========================================================
   BASIC HELPERS
========================================================= */

function clean(text = "") {
  return String(text)
    .replace(/\s+/g, " ")
    .replace(/^[\s,.;:]+|[\s,.;:]+$/g, "")
    .trim();
}

function splitStory(prompt) {
  return String(prompt || "")
    .replace(/\r/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(clean)
    .filter(Boolean);
}

function unique(arr) {
  return [...new Set((Array.isArray(arr) ? arr : []).filter(Boolean))];
}

/* =========================================================
   CHARACTER DETECTION
========================================================= */

function extractCharacters(prompt, sentences) {
  const found = [];

  const text = `${prompt} ${sentences.join(" ")}`;

  // "named Daniel", "named Emma"
  const named = [...text.matchAll(
    /\bnamed\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
  )];

  for (const match of named) {
    found.push(clean(match[1]));
  }

  // Common "Daniel ...", "Emma ..."
  for (const sentence of sentences) {
    const matches = sentence.match(/\b[A-Z][a-z]{2,}\b/g) || [];

    for (const name of matches) {
      const blocked = [
        "The",
        "A",
        "An",
        "One",
        "Inside",
        "By",
        "As",
        "When",
        "He",
        "She",
        "They",
        "This",
        "That",
        "In",
        "At",
        "On"
      ];

      if (!blocked.includes(name)) {
        found.push(name);
      }
    }
  }

  return unique(found).slice(0, 8);
}

/* =========================================================
   LOCATION DETECTION
========================================================= */

const LOCATION_WORDS = [
  "house",
  "home",
  "workshop",
  "attic",
  "basement",
  "forest",
  "mountain",
  "mountains",
  "town",
  "village",
  "city",
  "street",
  "road",
  "station",
  "train station",
  "harbor",
  "harbour",
  "lighthouse",
  "school",
  "office",
  "hospital",
  "beach",
  "coast",
  "coastal",
  "river",
  "bridge",
  "cave",
  "castle",
  "room",
  "garden",
  "warehouse",
  "airport",
  "restaurant",
  "store",
  "shop"
];

function detectLocation(sentence) {
  const lower = sentence.toLowerCase();

  for (const location of LOCATION_WORDS) {
    if (lower.includes(location)) {
      return location;
    }
  }

  return "story location";
}

/* =========================================================
   EVENT TYPE
========================================================= */

function detectEventType(sentence) {
  const s = sentence.toLowerCase();

  if (
    /discover|finds|find|discovers|reveals|learns|realizes|notices|sees|receives/.test(s)
  ) {
    return "discovery";
  }

  if (
    /warning|danger|storm|threat|problem|secret|mystery|missing|lost|trapped|dangerous/.test(s)
  ) {
    return "conflict";
  }

  if (
    /tries|attempts|follows|searches|runs|travels|goes|takes|climbs|enters|leaves|returns|studies/.test(s)
  ) {
    return "action";
  }

  if (
    /repair|fixes|opens|builds|rescues|saves|contacts|guides|stops|starts|solves/.test(s)
  ) {
    return "resolution_action";
  }

  if (
    /thanks|thank|safe|safely|saved|returns home|morning|passes|ends|finally/.test(s)
  ) {
    return "resolution";
  }

  return "narrative";
}

/* =========================================================
   IMPORTANCE
========================================================= */

function importanceFor(type, sentence) {
  const s = sentence.toLowerCase();

  if (type === "resolution_action") return 5;
  if (type === "resolution") return 5;
  if (type === "conflict") return 5;
  if (type === "discovery") return 4;
  if (type === "action") return 3;

  if (
    /secret|valuable|danger|rescue|save|lost|trapped|storm|hidden|mysterious/.test(s)
  ) {
    return 5;
  }

  return 2;
}

/* =========================================================
   EVENT EXTRACTION
========================================================= */

function extractEvents(sentences) {
  return sentences.map((sentence, index) => {
    const type = detectEventType(sentence);

    return {
      id: `E${String(index + 1).padStart(2, "0")}`,
      order: index + 1,
      text: sentence,
      type,
      importance: importanceFor(type, sentence),
      location: detectLocation(sentence)
    };
  });
}

/* =========================================================
   EVENT GROUPING
   IMPORTANT:
   Every group is ALWAYS an ARRAY.
========================================================= */

function canMerge(a, b) {
  if (!a || !b) return false;

  // Never merge major conflict/resolution events together.
  if (a.importance >= 5 || b.importance >= 5) {
    return false;
  }

  // Don't merge different locations.
  if (
    a.location !== "story location" &&
    b.location !== "story location" &&
    a.location !== b.location
  ) {
    return false;
  }

  return true;
}

function groupEvents(events) {
  const groups = [];

  for (const event of Array.isArray(events) ? events : []) {
    const previous = groups[groups.length - 1];

    if (
      previous &&
      Array.isArray(previous) &&
      previous.length < 2 &&
      canMerge(previous[previous.length - 1], event)
    ) {
      previous.push(event);
    } else {
      groups.push([event]);
    }
  }

  return groups.filter(
    (group) => Array.isArray(group) && group.length > 0
  );
}

/* =========================================================
   SCENE DISTRIBUTION
   Guaranteed arrays.
========================================================= */

function distributeGroups(groups, sceneCount) {
  const safeGroups = Array.isArray(groups)
    ? groups.filter(
        (group) => Array.isArray(group) && group.length > 0
      )
    : [];

  const scenes = Array.from(
    { length: sceneCount },
    () => []
  );

  if (safeGroups.length === 0) {
    return scenes;
  }

  /*
    Keep chronological order.
    Spread groups across scenes.
  */

  const total = safeGroups.length;

  safeGroups.forEach((group, index) => {
    let sceneIndex = Math.floor(
      (index * sceneCount) / total
    );

    if (sceneIndex >= sceneCount) {
      sceneIndex = sceneCount - 1;
    }

    scenes[sceneIndex].push(group);
  });

  /*
    If a scene is empty, move one group from the
    nearest scene that has more than one group.
  */

  for (let i = 0; i < sceneCount; i++) {
    if (scenes[i].length > 0) continue;

    let donor = -1;

    for (let j = 0; j < sceneCount; j++) {
      if (scenes[j].length > 1) {
        donor = j;
        break;
      }
    }

    if (donor !== -1) {
      const moved = scenes[donor].pop();

      if (i < donor) {
        scenes[i].push(moved);
      } else {
        scenes[i].unshift(moved);
      }
    }
  }

  return scenes;
}

/* =========================================================
   BEAT TIMING
   ALWAYS ENDS AT 10
========================================================= */

function beatTimes(count) {
  const safeCount = Math.max(
    1,
    Math.min(3, Number(count) || 1)
  );

  if (safeCount === 1) {
    return [
      {
        start: 0,
        end: 10
      }
    ];
  }

  if (safeCount === 2) {
    return [
      {
        start: 0,
        end: 5
      },
      {
        start: 5,
        end: 10
      }
    ];
  }

  return [
    {
      start: 0,
      end: 3
    },
    {
      start: 3,
      end: 7
    },
    {
      start: 7,
      end: 10
    }
  ];
}

/* =========================================================
   TEXT HELPERS
========================================================= */

function groupText(group) {
  if (!Array.isArray(group)) return "";

  return group
    .map((event) => event?.text || "")
    .filter(Boolean)
    .join(" ");
}

function groupTypes(group) {
  if (!Array.isArray(group)) return [];

  return unique(
    group.map((event) => event?.type)
  );
}

function groupLocation(group) {
  if (!Array.isArray(group)) {
    return "story location";
  }

  const locations = group
    .map((event) => event?.location)
    .filter(Boolean);

  return locations[0] || "story location";
}

/* =========================================================
   DIALOGUE
========================================================= */

function dialogueFor(group, characters) {
  const text = groupText(group).toLowerCase();
  const types = groupTypes(group);

  const mainCharacter =
    Array.isArray(characters) && characters.length
      ? characters[0]
      : "The main character";

  if (
    types.includes("conflict") &&
    /warning|storm|danger|threat|lost|trapped|problem/.test(text)
  ) {
    return [
      {
        speaker: mainCharacter,
        text: "Something is wrong. We need to act now."
      }
    ];
  }

  if (types.includes("discovery")) {
    return [
      {
        speaker: mainCharacter,
        text: "What is this? I have to find out."
      }
    ];
  }

  if (types.includes("resolution_action")) {
    return [
      {
        speaker: mainCharacter,
        text: "Come on. We can do this."
      }
    ];
  }

  if (types.includes("resolution")) {
    return [
      {
        speaker: "Supporting character",
        text: "You did it. Thank you."
      }
    ];
  }

  return [];
}

/* =========================================================
   VOICEOVER
========================================================= */

function voiceoverFor(group) {
  const text = clean(groupText(group));

  if (!text) {
    return "The story continues.";
  }

  return text.length > 180
    ? `${text.slice(0, 177)}...`
    : text;
}

/* =========================================================
   CAMERA
========================================================= */

function cameraFor(group) {
  const types = groupTypes(group);

  if (types.includes("conflict")) {
    return "Medium close-up with a slow push-in, emphasizing tension.";
  }

  if (types.includes("discovery")) {
    return "Close-up on the discovery followed by a reaction shot.";
  }

  if (types.includes("resolution_action")) {
    return "Dynamic tracking shot following the main action.";
  }

  if (types.includes("resolution")) {
    return "Wide cinematic shot followed by a warm close-up.";
  }

  return "Cinematic medium shot with a gentle camera movement.";
}

/* =========================================================
   LIGHTING
========================================================= */

function lightingFor(group) {
  const types = groupTypes(group);

  if (types.includes("conflict")) {
    return "Dramatic directional lighting with stronger shadows.";
  }

  if (types.includes("discovery")) {
    return "Moody cinematic lighting with focused highlights.";
  }

  if (types.includes("resolution")) {
    return "Warm natural light suggesting relief and closure.";
  }

  return "Natural cinematic lighting appropriate to the location.";
}

/* =========================================================
   CHARACTER LOCK
========================================================= */

function characterLock(characters) {
  const safeCharacters = Array.isArray(characters)
    ? characters
    : [];

  if (!safeCharacters.length) {
    return "Maintain consistent appearance for all recurring characters.";
  }

  return (
    "Character continuity lock: " +
    safeCharacters.join(", ") +
    ". Maintain the same face, age, hairstyle, body type, clothing, and overall appearance in every scene."
  );
}

/* =========================================================
   VISUAL PROMPT
========================================================= */

function createVisualPrompt(group, characters) {
  const location = groupLocation(group);
  const text = groupText(group);

  const characterPart =
    Array.isArray(characters) && characters.length
      ? `Main characters: ${characters.join(", ")}.`
      : "Maintain consistent main characters.";

  return [
    "Cinematic realistic storytelling.",
    `Location: ${location}.`,
    characterPart,
    `Action: ${text}.`,
    "Natural movement, consistent environment, detailed cinematic composition, realistic textures."
  ].join(" ");
}

/* =========================================================
   SCENE CREATION
========================================================= */

function createScene(sceneGroups, sceneNumber, characters) {
  const safeGroups = Array.isArray(sceneGroups)
    ? sceneGroups
        .filter(
          (group) =>
            Array.isArray(group) &&
            group.length > 0
        )
        .slice(0, 3)
    : [];

  /*
    Never create zero beats.
  */

  if (safeGroups.length === 0) {
    safeGroups.push([
      {
        id: "TRANSITION",
        text: "A brief cinematic transition maintains story continuity.",
        type: "narrative",
        importance: 1,
        location: "story location"
      }
    ]);
  }

  const times = beatTimes(safeGroups.length);

  const beats = safeGroups.map((group, index) => {
    const time = times[index];

    return {
      beat_number: index + 1,
      start_time: time.start,
      end_time: time.end,
      event_ids: Array.isArray(group)
        ? group.map((event) => event.id)
        : [],
      action: groupText(group),
      visual_prompt: createVisualPrompt(
        group,
        characters
      )
    };
  });

  const allEvents = safeGroups.flatMap((group) =>
    Array.isArray(group) ? group : []
  );

  const dialogue = safeGroups.flatMap((group) =>
    dialogueFor(group, characters)
  );

  const voiceover = safeGroups
    .map(voiceoverFor)
    .filter(Boolean)
    .join(" ");

  const location =
    allEvents[0]?.location || "story location";

  const visualPrompt = createVisualPrompt(
    safeGroups[0],
    characters
  );

  return {
    scene_number: sceneNumber,
    start_time: (sceneNumber - 1) * 10,
    end_time: sceneNumber * 10,

    location,

    visual_prompt: visualPrompt,

    camera: cameraFor(safeGroups[0]),
    lighting: lightingFor(safeGroups[0]),

    action: allEvents
      .map((event) => event?.text || "")
      .filter(Boolean)
      .join(" "),

    dialogue,

    voiceover,

    continuity: characterLock(characters),

    beats
  };
}

/* =========================================================
   VALIDATION
========================================================= */

function validateScenes(scenes, events, sceneCount) {
  if (!Array.isArray(scenes)) {
    throw new Error("Scenes are not an array.");
  }

  if (scenes.length !== sceneCount) {
    throw new Error(
      `Expected ${sceneCount} scenes, got ${scenes.length}.`
    );
  }

  const expectedIds = Array.isArray(events)
    ? events.map((event) => event.id)
    : [];

  const actualIds = [];

  scenes.forEach((scene, index) => {
    const expectedStart = index * 10;
    const expectedEnd = (index + 1) * 10;

    if (scene.start_time !== expectedStart) {
      throw new Error(
        `Scene ${index + 1} must start at ${expectedStart} seconds.`
      );
    }

    if (scene.end_time !== expectedEnd) {
      throw new Error(
        `Scene ${index + 1} must end at ${expectedEnd} seconds.`
      );
    }

    if (!Array.isArray(scene.beats)) {
      throw new Error(
        `Scene ${index + 1} beats are invalid.`
      );
    }

    if (scene.beats.length < 1 || scene.beats.length > 3) {
      throw new Error(
        `Scene ${index + 1} must contain 1 to 3 beats.`
      );
    }

    scene.beats.forEach((beat, beatIndex) => {
      if (
        typeof beat.start_time !== "number" ||
        typeof beat.end_time !== "number"
      ) {
        throw new Error(
          `Scene ${index + 1} beat ${beatIndex + 1} has invalid timing.`
        );
      }

      if (beatIndex === 0 && beat.start_time !== 0) {
        throw new Error(
          `Scene ${index + 1} does not start at 0 seconds.`
        );
      }

      if (
        beatIndex > 0 &&
        beat.start_time !==
          scene.beats[beatIndex - 1].end_time
      ) {
        throw new Error(
          `Scene ${index + 1} has a timing gap.`
        );
      }
    });

    const lastBeat =
      scene.beats[scene.beats.length - 1];

    if (lastBeat.end_time !== 10) {
      throw new Error(
        `Scene ${index + 1} does not end at 10 seconds.`
      );
    }

    if (!Array.isArray(scene.dialogue)) {
      throw new Error(
        `Scene ${index + 1} dialogue is invalid.`
      );
    }

    for (const id of scene.beats.flatMap(
      (beat) =>
        Array.isArray(beat.event_ids)
          ? beat.event_ids
          : []
    )) {
      if (id !== "TRANSITION") {
        actualIds.push(id);
      }
    }
  });

  /*
    Only compare real events when events exist.
  */

  const expectedReal = expectedIds;

  if (expectedReal.length > 0) {
    if (
      actualIds.length !== expectedReal.length
    ) {
      throw new Error(
        `Event coverage mismatch. Expected ${expectedReal.length}, got ${actualIds.length}.`
      );
    }

    for (let i = 0; i < expectedReal.length; i++) {
      if (actualIds[i] !== expectedReal[i]) {
        throw new Error(
          `Event order mismatch at position ${i + 1}.`
        );
      }
    }
  }

  return true;
}

/* =========================================================
   PROJECT GENERATOR
========================================================= */

function generateProject(
  prompt,
  duration,
  aspectRatio
) {
  const safePrompt = clean(prompt);

  if (!safePrompt) {
    throw new Error("Story prompt is empty.");
  }

  const safeDuration =
    Number(duration) > 0
      ? Number(duration)
      : 60;

  /*
    V37 testing limit.
    We can expand this later.
  */

  if (safeDuration > 60) {
    throw new Error(
      "V37 testing mode currently supports up to 60 seconds."
    );
  }

  const sceneCount =
    Math.max(1, Math.floor(safeDuration / 10));

  const sentences = splitStory(safePrompt);

  if (!sentences.length) {
    throw new Error(
      "Could not detect story events."
    );
  }

  const characters = extractCharacters(
    safePrompt,
    sentences
  );

  const events = extractEvents(sentences);

  const groups = groupEvents(events);

  const distributed = distributeGroups(
    groups,
    sceneCount
  );

  const scenes = distributed.map(
    (sceneGroups, index) =>
      createScene(
        sceneGroups,
        index + 1,
        characters
      )
  );

  validateScenes(
    scenes,
    events,
    sceneCount
  );

  return {
    status: "success",
    app: "SANAPTAI",
    engine: ENGINE_VERSION,

    duration: safeDuration,
    total_scenes: sceneCount,
    aspect_ratio: aspectRatio || "16:9",

    characters,
    scenes
  };
}

/* =========================================================
   API TEST
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    app: "SANAPTAI",
    engine: ENGINE_VERSION,
    message:
      "SANAPTAI V37 Universal Story Engine is running.",
    gemini: "disabled",
    video_generation: "disabled"
  });
});

/* =========================================================
   PROJECT API
========================================================= */

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio
    } = req.body || {};

    const project = generateProject(
      prompt,
      duration,
      aspectRatio
    );

    res.json(project);
  } catch (error) {
    console.error("V37 ERROR:", error);

    res.status(500).json({
      status: "error",
      app: "SANAPTAI",
      engine: ENGINE_VERSION,
      message: "Project creation failed.",
      error: error.message
    });
  }
});

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.sendFile(
    process.cwd() + "/public/index.html"
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
