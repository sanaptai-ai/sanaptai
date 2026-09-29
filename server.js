import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const ENGINE_VERSION = "V38.0";

/* =========================================================
   BASIC
========================================================= */

function clean(text = "") {
  return String(text)
    .replace(/\s+/g, " ")
    .replace(/([.!?])([A-Z])/g, "$1 $2")
    .trim();
}

function splitStory(prompt) {
  return String(prompt || "")
    .replace(/\r?\n/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(clean)
    .filter(Boolean);
}

function unique(arr) {
  return [...new Set(Array.isArray(arr) ? arr : [])];
}

function lower(text) {
  return String(text || "").toLowerCase();
}

/* =========================================================
   CHARACTER INTELLIGENCE
========================================================= */

const NON_NAMES = new Set([
  "A",
  "An",
  "The",
  "One",
  "Inside",
  "Outside",
  "Together",
  "When",
  "While",
  "As",
  "By",
  "He",
  "She",
  "They",
  "This",
  "That",
  "It",
  "In",
  "At",
  "On",
  "Then",
  "Finally",
  "Next",
  "Morning",
  "Evening",
  "Lucas",
  "Daniel",
  "Emma",
  "Noah"
]);

function extractCharacters(prompt, sentences) {
  const text = String(prompt || "");
  const found = [];

  // "named Lucas"
  for (const match of text.matchAll(
    /\bnamed\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
  )) {
    found.push(clean(match[1]));
  }

  // Pronoun / relationship based supporting characters
  const relationships = [
    ["mother", "Mother"],
    ["father", "Father"],
    ["grandmother", "Grandmother"],
    ["grandfather", "Grandfather"],
    ["sister", "Sister"],
    ["brother", "Brother"],
    ["friend", "Friend"],
    ["teacher", "Teacher"],
    ["doctor", "Doctor"],
    ["police officer", "Police Officer"],
    ["rescuer", "Rescuer"],
    ["rescue team", "Rescue Team"],
    ["villagers", "Villagers"]
  ];

  const fullText = lower(text);

  for (const [word, label] of relationships) {
    if (fullText.includes(word)) {
      found.push(label);
    }
  }

  // Capitalized names from sentences
  for (const sentence of sentences) {
    const matches =
      sentence.match(/\b[A-Z][a-z]{2,}\b/g) || [];

    for (const name of matches) {
      if (!NON_NAMES.has(name)) {
        found.push(name);
      }
    }
  }

  return unique(found).slice(0, 10);
}

/* =========================================================
   LOCATION INTELLIGENCE
========================================================= */

const LOCATION_PATTERNS = [
  ["train station", "train station"],
  ["railway station", "railway station"],
  ["secret room", "secret room"],
  ["signal room", "signal room"],
  ["workshop", "workshop"],
  ["attic", "attic"],
  ["basement", "basement"],
  ["house", "house"],
  ["home", "home"],
  ["forest", "forest"],
  ["mountains", "mountains"],
  ["mountain", "mountain"],
  ["town", "town"],
  ["village", "village"],
  ["city", "city"],
  ["street", "street"],
  ["road", "road"],
  ["harbor", "harbor"],
  ["harbour", "harbor"],
  ["lighthouse", "lighthouse"],
  ["beach", "beach"],
  ["coast", "coast"],
  ["river", "river"],
  ["bridge", "bridge"],
  ["cave", "cave"],
  ["castle", "castle"],
  ["garden", "garden"],
  ["warehouse", "warehouse"],
  ["airport", "airport"],
  ["hospital", "hospital"],
  ["school", "school"],
  ["office", "office"],
  ["restaurant", "restaurant"],
  ["shop", "shop"],
  ["store", "store"],
  ["tree", "under an old tree"]
];

function detectLocation(sentence, previousLocation = "story location") {
  const s = lower(sentence);

  for (const [pattern, label] of LOCATION_PATTERNS) {
    if (s.includes(pattern)) {
      return label;
    }
  }

  return previousLocation;
}

/* =========================================================
   EVENT TYPE
========================================================= */

function detectEventType(sentence) {
  const s = lower(sentence);

  if (
    /discover|discovers|find|finds|found|reveals|learns|realizes|notices|sees|receives/.test(
      s
    )
  ) {
    return "discovery";
  }

  if (
    /warning|danger|threat|problem|secret|mystery|lost|trapped|storm|flood|attack|missing/.test(
      s
    )
  ) {
    return "conflict";
  }

  if (
    /tries|attempts|follows|studies|searches|runs|travels|goes|takes|climbs|enters|leaves|returns|moves|opens|reads/.test(
      s
    )
  ) {
    return "action";
  }

  if (
    /repair|fixes|rescues|saves|contacts|guides|restores|stops|starts|solves|finds the keepsake/.test(
      s
    )
  ) {
    return "resolution_action";
  }

  if (
    /thanks|thank|safe|safely|saved|returns home|morning|passes|places|brings it home/.test(
      s
    )
  ) {
    return "resolution";
  }

  return "narrative";
}

/* =========================================================
   EVENT IMPORTANCE
========================================================= */

function importanceFor(type, sentence) {
  const s = lower(sentence);

  if (type === "conflict") return 5;
  if (type === "resolution_action") return 5;
  if (type === "resolution") return 5;
  if (type === "discovery") return 4;
  if (type === "action") return 3;

  if (
    /secret|valuable|danger|rescue|save|lost|trapped|storm|flood|hidden|mysterious|heirloom|keepsake|map/.test(
      s
    )
  ) {
    return 5;
  }

  return 2;
}

/* =========================================================
   EVENT EXTRACTION
========================================================= */

function extractEvents(sentences) {
  let previousLocation = "story location";

  return sentences.map((sentence, index) => {
    const location = detectLocation(
      sentence,
      previousLocation
    );

    previousLocation = location;

    const type = detectEventType(sentence);

    return {
      id: `E${String(index + 1).padStart(2, "0")}`,
      order: index + 1,
      text: sentence,
      type,
      importance: importanceFor(type, sentence),
      location
    };
  });
}

/* =========================================================
   GROUPING
========================================================= */

function canMerge(a, b) {
  if (!a || !b) return false;

  // Important events should stand on their own.
  if (a.importance >= 5 || b.importance >= 5) {
    return false;
  }

  // Avoid combining major location changes.
  if (
    a.location !== b.location &&
    a.location !== "story location" &&
    b.location !== "story location"
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
    (group) => Array.isArray(group) && group.length
  );
}

/* =========================================================
   SCENE DISTRIBUTION
========================================================= */

function distributeGroups(groups, sceneCount) {
  const safeGroups = Array.isArray(groups)
    ? groups.filter(
        (g) => Array.isArray(g) && g.length
      )
    : [];

  const scenes = Array.from(
    { length: sceneCount },
    () => []
  );

  if (!safeGroups.length) {
    return scenes;
  }

  /*
    Sequential allocation.
    Never changes event order.
  */

  const base =
    Math.floor(safeGroups.length / sceneCount);

  let remainder =
    safeGroups.length % sceneCount;

  let cursor = 0;

  for (let i = 0; i < sceneCount; i++) {
    let amount = base;

    if (remainder > 0) {
      amount++;
      remainder--;
    }

    // Maximum three cinematic beats per scene.
    amount = Math.min(amount, 3);

    for (let j = 0; j < amount; j++) {
      if (cursor < safeGroups.length) {
        scenes[i].push(safeGroups[cursor]);
        cursor++;
      }
    }
  }

  // If anything remains, append sequentially.
  while (cursor < safeGroups.length) {
    let target = scenes.findIndex(
      (scene) => scene.length < 3
    );

    if (target === -1) {
      target = sceneCount - 1;
    }

    scenes[target].push(
      safeGroups[cursor]
    );

    cursor++;
  }

  return scenes;
}

/* =========================================================
   TIMING
========================================================= */

function beatTimes(count) {
  const n = Math.max(
    1,
    Math.min(3, Number(count) || 1)
  );

  if (n === 1) {
    return [{ start: 0, end: 10 }];
  }

  if (n === 2) {
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

/* =========================================================
   GROUP HELPERS
========================================================= */

function groupText(group) {
  if (!Array.isArray(group)) return "";

  return group
    .map((e) => e?.text || "")
    .filter(Boolean)
    .join(" ");
}

function groupTypes(group) {
  if (!Array.isArray(group)) return [];

  return unique(
    group
      .map((e) => e?.type)
      .filter(Boolean)
  );
}

function groupLocation(group) {
  if (!Array.isArray(group)) {
    return "story location";
  }

  return (
    group.find(
      (e) =>
        e?.location &&
        e.location !== "story location"
    )?.location ||
    "story location"
  );
}

/* =========================================================
   DIALOGUE
========================================================= */

function mainCharacter(characters) {
  return (
    (Array.isArray(characters)
      ? characters.find(
          (c) =>
            ![
              "Mother",
              "Father",
              "Grandmother",
              "Grandfather",
              "Sister",
              "Brother",
              "Friend",
              "Teacher",
              "Doctor",
              "Police Officer",
              "Rescuer",
              "Rescue Team",
              "Villagers"
            ].includes(c)
        )
      : null) ||
    "Main character"
  );
}

function dialogueFor(group, characters, sceneNumber) {
  const text = lower(groupText(group));
  const types = groupTypes(group);
  const hero = mainCharacter(characters);

  if (
    types.includes("conflict") &&
    /danger|storm|threat|lost|trapped|problem|secret/.test(text)
  ) {
    return [
      {
        speaker: hero,
        text: "Something is wrong. We need to act now."
      }
    ];
  }

  if (
    types.includes("discovery") &&
    /discover|find|finds|discovers|hidden|mysterious/.test(text)
  ) {
    return [
      {
        speaker: hero,
        text: "What is this? I have to find out."
      }
    ];
  }

  if (
    types.includes("resolution_action")
  ) {
    return [
      {
        speaker: hero,
        text: "This has to be the answer."
      }
    ];
  }

  if (
    types.includes("resolution") &&
    /thanks|thank|saved|safe|keepsake|photograph|home/.test(
      text
    )
  ) {
    return [
      {
        speaker: hero,
        text: "I finally understand what happened."
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
    return "";
  }

  // Never cut words.
  if (text.length <= 180) {
    return text;
  }

  const words = text.split(" ");
  let result = "";

  for (const word of words) {
    if ((result + " " + word).trim().length > 180) {
      break;
    }

    result = (result + " " + word).trim();
  }

  return result;
}

/* =========================================================
   CAMERA
========================================================= */

function cameraFor(group) {
  const types = groupTypes(group);

  if (types.includes("conflict")) {
    return "Slow push-in and medium close-up to emphasize tension.";
  }

  if (types.includes("discovery")) {
    return "Close-up on the important discovery followed by a reaction shot.";
  }

  if (types.includes("resolution_action")) {
    return "Dynamic tracking shot following the character through the action.";
  }

  if (types.includes("resolution")) {
    return "Warm wide shot followed by a gentle emotional close-up.";
  }

  return "Cinematic medium shot with subtle natural camera movement.";
}

/* =========================================================
   LIGHTING
========================================================= */

function lightingFor(group) {
  const types = groupTypes(group);
  const text = lower(groupText(group));

  if (/rain|storm|night|dark/.test(text)) {
    return "Moody low-key lighting with realistic shadows and atmospheric highlights.";
  }

  if (types.includes("conflict")) {
    return "Dramatic directional lighting with deeper shadows.";
  }

  if (types.includes("resolution")) {
    return "Warm natural lighting suggesting relief and emotional closure.";
  }

  return "Natural cinematic lighting appropriate to the environment.";
}

/* =========================================================
   CONTINUITY
========================================================= */

function characterLock(characters) {
  const safe = Array.isArray(characters)
    ? characters
    : [];

  if (!safe.length) {
    return "Keep all recurring characters visually consistent across every scene.";
  }

  return (
    "Character continuity lock: " +
    safe.join(", ") +
    ". Keep consistent faces, ages, hairstyles, body types, clothing, and physical appearance throughout the entire story."
  );
}

/* =========================================================
   VISUAL PROMPT
========================================================= */

function createVisualPrompt(
  group,
  characters
) {
  const location = groupLocation(group);
  const action = groupText(group);

  const chars =
    Array.isArray(characters) &&
    characters.length
      ? characters.join(", ")
      : "recurring characters";

  return (
    "Cinematic realistic storytelling. " +
    `Location: ${location}. ` +
    `Characters: ${chars}. ` +
    `Action: ${action}. ` +
    "Maintain exact character continuity, realistic environment, natural movement, detailed textures, cinematic composition."
  );
}

/* =========================================================
   SCENE CREATOR
========================================================= */

function createScene(
  sceneGroups,
  sceneNumber,
  characters
) {
  let safeGroups = Array.isArray(sceneGroups)
    ? sceneGroups.filter(
        (g) =>
          Array.isArray(g) &&
          g.length > 0
      )
    : [];

  if (!safeGroups.length) {
    safeGroups = [
      [
        {
          id: `T${sceneNumber}`,
          text: "A brief cinematic transition maintains continuity.",
          type: "narrative",
          importance: 1,
          location: "story location"
        }
      ]
    ];
  }

  safeGroups = safeGroups.slice(0, 3);

  const times = beatTimes(
    safeGroups.length
  );

  const beats = safeGroups.map(
    (group, index) => ({
      beat_number: index + 1,
      start_time: times[index].start,
      end_time: times[index].end,
      event_ids: group.map(
        (event) => event.id
      ),
      action: groupText(group),
      visual_prompt:
        createVisualPrompt(
          group,
          characters
        )
    })
  );

  const events = safeGroups.flatMap(
    (group) =>
      Array.isArray(group)
        ? group
        : []
  );

  const dialogue = [];

  for (let i = 0; i < safeGroups.length; i++) {
    dialogue.push(
      ...dialogueFor(
        safeGroups[i],
        characters,
        sceneNumber
      )
    );
  }

  // Remove duplicate exact dialogue.
  const seenDialogue = new Set();

  const finalDialogue =
    dialogue.filter((d) => {
      const key =
        `${d.speaker}|${d.text}`;

      if (seenDialogue.has(key)) {
        return false;
      }

      seenDialogue.add(key);
      return true;
    });

  const voiceover = safeGroups
    .map(voiceoverFor)
    .filter(Boolean)
    .join(" ");

  return {
    scene_number: sceneNumber,

    start_time:
      (sceneNumber - 1) * 10,

    end_time:
      sceneNumber * 10,

    location:
      events[0]?.location ||
      "story location",

    visual_prompt:
      createVisualPrompt(
        safeGroups[0],
        characters
      ),

    camera:
      cameraFor(safeGroups[0]),

    lighting:
      lightingFor(safeGroups[0]),

    action: events
      .map((e) => e?.text || "")
      .filter(Boolean)
      .join(" "),

    dialogue: finalDialogue,

    voiceover,

    continuity:
      characterLock(characters),

    beats
  };
}

/* =========================================================
   VALIDATION
========================================================= */

function validateScenes(
  scenes,
  events,
  sceneCount
) {
  if (!Array.isArray(scenes)) {
    throw new Error(
      "Scenes are not an array."
    );
  }

  if (scenes.length !== sceneCount) {
    throw new Error(
      `Expected ${sceneCount} scenes, got ${scenes.length}.`
    );
  }

  const expected =
    events.map((e) => e.id);

  const actual = [];

  scenes.forEach(
    (scene, sceneIndex) => {
      const expectedStart =
        sceneIndex * 10;

      const expectedEnd =
        (sceneIndex + 1) * 10;

      if (
        scene.start_time !==
        expectedStart
      ) {
        throw new Error(
          `Scene ${sceneIndex + 1} start time invalid.`
        );
      }

      if (
        scene.end_time !==
        expectedEnd
      ) {
        throw new Error(
          `Scene ${sceneIndex + 1} does not end at 10 seconds.`
        );
      }

      if (
        !Array.isArray(scene.beats) ||
        scene.beats.length < 1 ||
        scene.beats.length > 3
      ) {
        throw new Error(
          `Scene ${sceneIndex + 1} beat structure invalid.`
        );
      }

      scene.beats.forEach(
        (beat, beatIndex) => {
          if (
            beatIndex === 0 &&
            beat.start_time !== 0
          ) {
            throw new Error(
              `Scene ${sceneIndex + 1} does not start at 0.`
            );
          }

          if (
            beatIndex > 0 &&
            beat.start_time !==
              scene.beats[
                beatIndex - 1
              ].end_time
          ) {
            throw new Error(
              `Scene ${sceneIndex + 1} contains a timing gap.`
            );
          }

          if (
            !Array.isArray(
              beat.event_ids
            )
          ) {
            throw new Error(
              `Scene ${sceneIndex + 1} event IDs invalid.`
            );
          }

          actual.push(
            ...beat.event_ids.filter(
              (id) =>
                /^E\d+$/.test(id)
            )
          );
        }
      );

      const last =
        scene.beats[
          scene.beats.length - 1
        ];

      if (last.end_time !== 10) {
        throw new Error(
          `Scene ${sceneIndex + 1} does not end at 10 seconds.`
        );
      }

      if (
        !Array.isArray(scene.dialogue)
      ) {
        throw new Error(
          `Scene ${sceneIndex + 1} dialogue invalid.`
        );
      }
    }
  );

  if (
    actual.length !==
    expected.length
  ) {
    throw new Error(
      `Event coverage mismatch. Expected ${expected.length}, got ${actual.length}.`
    );
  }

  for (
    let i = 0;
    i < expected.length;
    i++
  ) {
    if (
      actual[i] !== expected[i]
    ) {
      throw new Error(
        `Event order mismatch at event ${i + 1}.`
      );
    }
  }

  return true;
}

/* =========================================================
   PROJECT GENERATION
========================================================= */

function generateProject(
  prompt,
  duration,
  aspectRatio
) {
  const safePrompt =
    clean(prompt);

  if (!safePrompt) {
    throw new Error(
      "Video prompt is empty."
    );
  }

  const safeDuration =
    Number(duration) || 60;

  if (safeDuration > 60) {
    throw new Error(
      "V38 testing mode supports up to 60 seconds."
    );
  }

  const sceneCount =
    Math.max(
      1,
      Math.floor(
        safeDuration / 10
      )
    );

  const sentences =
    splitStory(safePrompt);

  if (!sentences.length) {
    throw new Error(
      "No story events detected."
    );
  }

  const characters =
    extractCharacters(
      safePrompt,
      sentences
    );

  const events =
    extractEvents(sentences);

  const groups =
    groupEvents(events);

  const sceneGroups =
    distributeGroups(
      groups,
      sceneCount
    );

  const scenes =
    sceneGroups.map(
      (groupsForScene, index) =>
        createScene(
          groupsForScene,
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
    aspect_ratio:
      aspectRatio || "16:9",
    characters,
    scenes
  };
}

/* =========================================================
   API
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    app: "SANAPTAI",
    engine: ENGINE_VERSION,
    message:
      "SANAPTAI V38 Story Intelligence Engine is running.",
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

      const project =
        generateProject(
          prompt,
          duration,
          aspectRatio
        );

      res.json(project);
    } catch (error) {
      console.error(
        "V38 ERROR:",
        error
      );

      res.status(500).json({
        status: "error",
        app: "SANAPTAI",
        engine: ENGINE_VERSION,
        message:
          "Project creation failed.",
        error:
          error?.message ||
          "Unknown error"
      });
    }
  }
);

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.sendFile(
    process.cwd() +
      "/public/index.html"
  );
});

/* =========================================================
   START
========================================================= */

app.listen(
  PORT,
  () => {
    console.log(
      `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
    );
  }
);
