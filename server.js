import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const ENGINE_VERSION = "V35.0";

const CHARACTERS = {
  Noah: {
    name: "Noah",
    description:
      "14-year-old boy, slim build, short slightly messy brown hair, blue eyes, navy blue hoodie, dark jeans, white sneakers"
  },

  Father: {
    name: "Noah's father",
    description:
      "middle-aged man, short dark hair with some gray, trimmed beard, brown work jacket, dark trousers"
  },

  Villagers: {
    name: "Villagers",
    description:
      "coastal-town villagers wearing practical everyday clothing"
  },

  RescueCrew: {
    name: "Rescue crew",
    description:
      "professional coastal rescue crew wearing bright weatherproof rescue jackets and safety gear"
  }
};

/*
========================================================
V35 STORY EVENTS
========================================================
Chronological atomic events.
Each event has:
- id
- phase
- location
- action
- importance
- weight
*/

function getStoryEvents() {
  return [
    {
      id: "N01",
      phase: "setup",
      location: "small coastal town",
      action: "Noah lives with his father in the coastal town.",
      importance: 1,
      weight: 1
    },
    {
      id: "N02",
      phase: "setup",
      location: "father's workshop",
      action: "Noah enters his father's workshop.",
      importance: 2,
      weight: 1
    },
    {
      id: "N03",
      phase: "discovery",
      location: "father's workshop",
      action: "Noah discovers an old lighthouse journal.",
      importance: 3,
      weight: 1
    },
    {
      id: "N04",
      phase: "discovery",
      location: "father's workshop",
      action: "Noah opens the journal and begins reading it.",
      importance: 3,
      weight: 1
    },

    {
      id: "N05",
      phase: "warning",
      location: "father's workshop",
      action: "The journal warns that a powerful storm is approaching the town.",
      importance: 3,
      weight: 1
    },
    {
      id: "N06",
      phase: "warning",
      location: "father's workshop",
      action: "Noah realizes the warning could put the coastal town in danger.",
      importance: 3,
      weight: 1
    },
    {
      id: "N07",
      phase: "warning_attempt",
      location: "town square",
      action: "Noah leaves the workshop and rushes toward the villagers.",
      importance: 2,
      weight: 1
    },
    {
      id: "N08",
      phase: "warning_attempt",
      location: "town square",
      action: "Noah warns the villagers about the approaching storm.",
      importance: 3,
      weight: 1
    },
    {
      id: "N09",
      phase: "warning_attempt",
      location: "town square",
      action: "The villagers dismiss Noah's warning.",
      importance: 3,
      weight: 1
    },
    {
      id: "N10",
      phase: "warning_attempt",
      location: "town square",
      action: "Noah looks toward the darkening horizon.",
      importance: 2,
      weight: 1
    },

    {
      id: "N11",
      phase: "danger",
      location: "coastal town",
      action: "Dark storm clouds move rapidly over the coastal town.",
      importance: 3,
      weight: 1
    },
    {
      id: "N12",
      phase: "danger",
      location: "coastal town",
      action: "Heavy rain begins as the storm reaches the town.",
      importance: 3,
      weight: 1
    },
    {
      id: "N13",
      phase: "danger",
      location: "lighthouse",
      action: "The lighthouse signal suddenly stops working.",
      importance: 3,
      weight: 1
    },
    {
      id: "N14",
      phase: "danger",
      location: "coastal harbor",
      action: "Noah realizes boats approaching the harbor could be in danger.",
      importance: 3,
      weight: 1
    },
    {
      id: "N15",
      phase: "decision",
      location: "coastal town",
      action: "Noah decides to repair the lighthouse signal himself.",
      importance: 3,
      weight: 1
    },

    {
      id: "N16",
      phase: "journey",
      location: "stormy coastal road",
      action: "Noah runs through the heavy rain toward the lighthouse.",
      importance: 2,
      weight: 1
    },
    {
      id: "N17",
      phase: "journey",
      location: "lighthouse entrance",
      action: "Noah reaches the lighthouse entrance.",
      importance: 2,
      weight: 1
    },
    {
      id: "N18",
      phase: "climb",
      location: "lighthouse staircase",
      action: "Noah climbs the lighthouse stairs.",
      importance: 2,
      weight: 1
    },
    {
      id: "N19",
      phase: "climb",
      location: "signal room",
      action: "Noah enters the lighthouse signal room.",
      importance: 2,
      weight: 1
    },
    {
      id: "N20",
      phase: "inspection",
      location: "signal room",
      action: "Noah examines the damaged lighthouse signal mechanism.",
      importance: 3,
      weight: 1
    },

    {
      id: "N21",
      phase: "repair",
      location: "signal room",
      action: "Noah begins repairing the damaged mechanism.",
      importance: 3,
      weight: 1
    },
    {
      id: "N22",
      phase: "repair",
      location: "signal room",
      action: "Noah reconnects the damaged components.",
      importance: 3,
      weight: 1
    },
    {
      id: "N23",
      phase: "restoration",
      location: "signal room",
      action: "The lighthouse mechanism begins moving again.",
      importance: 3,
      weight: 1
    },
    {
      id: "N24",
      phase: "restoration",
      location: "lighthouse",
      action: "The lighthouse signal turns back on.",
      importance: 3,
      weight: 1
    },
    {
      id: "N25",
      phase: "restoration",
      location: "lighthouse",
      action: "Noah watches the restored beam sweep across the sea.",
      importance: 3,
      weight: 1
    },

    {
      id: "N26",
      phase: "rescue",
      location: "coastal sea",
      action: "A rescue boat follows the restored lighthouse beam.",
      importance: 3,
      weight: 1
    },
    {
      id: "N27",
      phase: "rescue",
      location: "harbor",
      action: "The rescue boat reaches the harbor safely.",
      importance: 3,
      weight: 1
    },
    {
      id: "N28",
      phase: "resolution_transition",
      location: "coastal town",
      action: "The storm passes and morning arrives.",
      importance: 3,
      weight: 1
    },
    {
      id: "N29",
      phase: "resolution",
      location: "coastal town",
      action: "The villagers thank Noah for helping save the town.",
      importance: 3,
      weight: 1
    },
    {
      id: "N30",
      phase: "resolution",
      location: "lighthouse",
      action: "Noah looks toward the lighthouse as the town returns to safety.",
      importance: 2,
      weight: 1
    }
  ];
}

/*
========================================================
HELPERS
========================================================
*/

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function cleanText(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map(cleanText)
      .filter(Boolean)
      .join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value)
      .map(cleanText)
      .filter(Boolean)
      .join(" ");
  }

  return String(value);
}

function characterText(names) {
  return unique(names)
    .map((name) => {
      const character = CHARACTERS[name];

      if (!character) return "";

      return `${character.name}: ${character.description}`;
    })
    .filter(Boolean)
    .join(" | ");
}

function objectText(ids) {
  const objects = [];

  for (const id of ids) {
    if (["N03", "N04", "N05", "N06"].includes(id)) {
      objects.push("old lighthouse journal");
    }

    if (
      ["N13", "N15", "N20", "N21", "N22", "N23", "N24", "N25"].includes(id)
    ) {
      objects.push("lighthouse signal mechanism");
    }

    if (["N26", "N27"].includes(id)) {
      objects.push("rescue boat");
    }
  }

  return unique(objects);
}

/*
========================================================
CHARACTER ASSIGNMENT
========================================================
*/

function charactersForEvents(events) {
  const ids = events.map((e) => e.id);

  const characters = ["Noah"];

  if (ids.includes("N01") || ids.includes("N02")) {
    characters.push("Father");
  }

  if (
    ids.includes("N08") ||
    ids.includes("N09") ||
    ids.includes("N29")
  ) {
    characters.push("Villagers");
  }

  if (ids.includes("N26") || ids.includes("N27")) {
    characters.push("RescueCrew");
  }

  return unique(characters);
}

/*
========================================================
DIALOGUE
========================================================
*/

function dialogueFor(events) {
  const ids = events.map((e) => e.id);

  const dialogue = [];

  if (ids.includes("N08") && ids.includes("N09")) {
    dialogue.push({
      speaker: "Noah",
      text: "A powerful storm is coming. We need to prepare now."
    });

    dialogue.push({
      speaker: "Villager",
      text: "Noah, you're just imagining it."
    });
  }

  if (ids.includes("N15")) {
    dialogue.push({
      speaker: "Noah",
      text: "Then I'll fix the lighthouse myself."
    });
  }

  if (ids.includes("N21") && ids.includes("N22")) {
    dialogue.push({
      speaker: "Noah",
      text: "Come on... work."
    });
  }

  if (ids.includes("N29")) {
    dialogue.push({
      speaker: "Villager",
      text: "Thank you, Noah. You saved our town."
    });
  }

  return dialogue;
}

function countDialogueWords(dialogue) {
  return dialogue
    .map((item) => item.text || "")
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/*
========================================================
VOICEOVER
========================================================
*/

function voiceoverFor(events) {
  const ids = events.map((e) => e.id);

  if (ids.includes("N01") && ids.includes("N02")) {
    return "Noah lives in a small coastal town and enters his father's workshop.";
  }

  if (ids.includes("N03") && ids.includes("N04")) {
    return "Inside the workshop, Noah discovers an old lighthouse journal and opens it.";
  }

  if (ids.includes("N05") && ids.includes("N06")) {
    return "The journal reveals a dangerous storm warning, and Noah realizes the town may be at risk.";
  }

  if (ids.includes("N07") && ids.includes("N08") && ids.includes("N09")) {
    return "Noah reaches the villagers and warns them, but they refuse to believe him.";
  }

  if (ids.includes("N10")) {
    return "Noah watches the dark horizon and realizes the danger is getting closer.";
  }

  if (ids.includes("N11") && ids.includes("N12")) {
    return "The storm arrives with dark clouds and heavy rain.";
  }

  if (ids.includes("N13") && ids.includes("N14")) {
    return "The lighthouse signal fails, leaving boats approaching the harbor in danger.";
  }

  if (ids.includes("N15")) {
    return "With no one else acting, Noah decides to repair the lighthouse himself.";
  }

  if (ids.includes("N16") && ids.includes("N17")) {
    return "Noah runs through the storm and reaches the lighthouse.";
  }

  if (ids.includes("N18") && ids.includes("N19")) {
    return "He climbs the lighthouse stairs and reaches the signal room.";
  }

  if (ids.includes("N20")) {
    return "Noah finds the damaged signal mechanism and prepares to repair it.";
  }

  if (ids.includes("N21") && ids.includes("N22")) {
    return "Noah works quickly to reconnect the damaged mechanism.";
  }

  if (ids.includes("N23") && ids.includes("N24")) {
    return "The mechanism comes alive, and the lighthouse signal turns back on.";
  }

  if (ids.includes("N25")) {
    return "The restored beam sweeps across the dark sea.";
  }

  if (ids.includes("N26") && ids.includes("N27")) {
    return "A rescue boat follows the lighthouse beam and reaches the harbor safely.";
  }

  if (ids.includes("N28")) {
    return "By morning, the storm has passed.";
  }

  if (ids.includes("N29") && ids.includes("N30")) {
    return "The villagers thank Noah as he looks toward the lighthouse, knowing the town is safe.";
  }

  return events.map((e) => e.action).join(" ");
}

/*
========================================================
CINEMATIC BEAT SUMMARIZATION
========================================================
*/

function actionForBeat(events) {
  const ids = events.map((e) => e.id);

  /*
  Specific cinematic combinations.
  These are not random; they prevent several tiny actions
  from becoming an unreadable 10-second sequence.
  */

  if (ids.join(",") === "N01,N02") {
    return "Noah enters the small coastal-town workshop where he lives with his father.";
  }

  if (ids.join(",") === "N03") {
    return "Noah discovers an old lighthouse journal on the workshop table.";
  }

  if (ids.join(",") === "N04") {
    return "Noah opens the journal and begins reading its mysterious pages.";
  }

  if (ids.join(",") === "N05,N06") {
    return "Noah reads the storm warning and realizes the approaching danger could threaten the town.";
  }

  if (ids.join(",") === "N07,N08,N09") {
    return "Noah reaches the town square and warns the villagers, but they dismiss his warning.";
  }

  if (ids.join(",") === "N10") {
    return "Noah looks toward the dark horizon as the approaching storm becomes visible.";
  }

  if (ids.join(",") === "N11,N12") {
    return "Dark storm clouds cover the town as heavy rain begins.";
  }

  if (ids.join(",") === "N13,N14") {
    return "The lighthouse signal fails, and Noah realizes boats approaching the harbor are in danger.";
  }

  if (ids.join(",") === "N15") {
    return "Noah makes the decision to repair the lighthouse signal himself.";
  }

  if (ids.join(",") === "N16,N17") {
    return "Noah runs through the storm and reaches the lighthouse entrance.";
  }

  if (ids.join(",") === "N18,N19") {
    return "Noah climbs the lighthouse stairs and enters the signal room.";
  }

  if (ids.join(",") === "N20") {
    return "Noah examines the damaged lighthouse signal mechanism.";
  }

  if (ids.join(",") === "N21,N22") {
    return "Noah works on the damaged mechanism and reconnects its components.";
  }

  if (ids.join(",") === "N23,N24") {
    return "The mechanism starts moving and the lighthouse signal turns back on.";
  }

  if (ids.join(",") === "N25") {
    return "Noah watches the restored lighthouse beam sweep across the sea.";
  }

  if (ids.join(",") === "N26,N27") {
    return "A rescue boat follows the restored beam and reaches the harbor safely.";
  }

  if (ids.join(",") === "N28") {
    return "The storm passes and morning arrives over the quiet coastal town.";
  }

  if (ids.join(",") === "N29,N30") {
    return "The villagers thank Noah as he looks toward the lighthouse and the safe town.";
  }

  return events.map((e) => e.action).join(" ");
}

/*
========================================================
CAMERA
========================================================
*/

function cameraFor(events, beatIndex) {
  const ids = events.map((e) => e.id);

  if (ids.includes("N01") || ids.includes("N02")) {
    return "Wide establishing shot followed by a gentle tracking move toward Noah.";
  }

  if (ids.includes("N03") || ids.includes("N04")) {
    return "Slow cinematic push-in toward the journal and Noah's reaction.";
  }

  if (ids.includes("N05") || ids.includes("N06")) {
    return "Medium close-up on Noah reading, then a slow push toward his concerned expression.";
  }

  if (ids.includes("N07") || ids.includes("N08") || ids.includes("N09")) {
    return "Handheld-style medium tracking shot following Noah into the town square, then reaction shots of villagers.";
  }

  if (ids.includes("N10")) {
    return "Over-the-shoulder shot from behind Noah toward the darkening horizon.";
  }

  if (ids.includes("N11") || ids.includes("N12")) {
    return "Wide atmospheric shot of the coastal town under rapidly darkening storm clouds.";
  }

  if (ids.includes("N13") || ids.includes("N14")) {
    return "Alternating close-ups of the dark lighthouse and Noah realizing the danger.";
  }

  if (ids.includes("N15")) {
    return "Medium close-up as Noah makes his decision, followed by a determined slow push-in.";
  }

  if (ids.includes("N16") || ids.includes("N17")) {
    return "Dynamic tracking shot following Noah running through heavy rain toward the lighthouse.";
  }

  if (ids.includes("N18") || ids.includes("N19")) {
    return "Low-angle tracking shot climbing with Noah up the lighthouse stairs.";
  }

  if (ids.includes("N20")) {
    return "Close-up inspection shot of the damaged mechanism, then Noah's focused face.";
  }

  if (ids.includes("N21") || ids.includes("N22")) {
    return "Tight mechanical close-ups mixed with medium shots of Noah repairing the mechanism.";
  }

  if (ids.includes("N23") || ids.includes("N24")) {
    return "Close-up of the mechanism activating, followed by a dramatic pull-back revealing the lighthouse beam.";
  }

  if (ids.includes("N25")) {
    return "Wide cinematic shot of the restored beam sweeping across the ocean.";
  }

  if (ids.includes("N26") || ids.includes("N27")) {
    return "Wide aerial-style view of the rescue boat following the lighthouse beam toward the harbor.";
  }

  if (ids.includes("N28")) {
    return "Slow sunrise transition from storm clouds to a calm coastal town.";
  }

  if (ids.includes("N29") || ids.includes("N30")) {
    return "Warm medium shot of the villagers thanking Noah, ending with a slow pull-back toward the lighthouse.";
  }

  return beatIndex === 0
    ? "Cinematic establishing shot."
    : "Smooth cinematic tracking shot.";
}

/*
========================================================
LIGHTING
========================================================
*/

function lightingFor(events) {
  const ids = events.map((e) => e.id);

  if (ids.some((id) => ["N11", "N12", "N13", "N14", "N15"].includes(id))) {
    return "Dark storm lighting, cold overcast sky, wet reflective surfaces, dramatic contrast.";
  }

  if (ids.some((id) => ["N16", "N17", "N18", "N19", "N20"].includes(id))) {
    return "Cold blue-gray storm light mixed with dim lighthouse interior lighting.";
  }

  if (ids.some((id) => ["N21", "N22", "N23", "N24", "N25"].includes(id))) {
    return "Moody storm lighting with warm mechanical highlights and a powerful lighthouse beam.";
  }

  if (ids.some((id) => ["N26", "N27"].includes(id))) {
    return "Dark ocean atmosphere illuminated by the bright lighthouse beam.";
  }

  if (ids.includes("N28") || ids.includes("N29") || ids.includes("N30")) {
    return "Soft warm morning sunlight after the storm, calm atmosphere, gentle golden highlights.";
  }

  return "Natural cinematic lighting with realistic coastal atmosphere.";
}

/*
========================================================
CONTINUITY
========================================================
*/

function continuityFor(events, sceneNumber) {
  const ids = events.map((e) => e.id);

  let continuity =
    "Maintain Noah's exact appearance, clothing, age, hairstyle and facial identity.";

  if (ids.some((id) => ["N11", "N12", "N13", "N14", "N15"].includes(id))) {
    continuity +=
      " The weather must visibly progress into a powerful storm with increasing rain and darkness.";
  }

  if (ids.some((id) => ["N16", "N17", "N18", "N19", "N20"].includes(id))) {
    continuity +=
      " Noah's navy hoodie, dark jeans and white sneakers remain unchanged and become visibly wet from the storm.";
  }

  if (ids.some((id) => ["N21", "N22", "N23", "N24", "N25"].includes(id))) {
    continuity +=
      " Keep the same damaged lighthouse mechanism and signal room layout throughout the repair.";
  }

  if (ids.some((id) => ["N26", "N27"].includes(id))) {
    continuity +=
      " The rescue boat must follow the same restored lighthouse beam established in the previous scene.";
  }

  if (ids.some((id) => ["N28", "N29", "N30"].includes(id))) {
    continuity +=
      " Transition naturally from the stormy night into a calm morning without changing character identities.";
  }

  continuity += ` Scene ${sceneNumber} must connect directly to the previous scene without resetting the story.`;

  return continuity;
}

/*
========================================================
VISUAL PROMPT
========================================================
*/

function createVisualPrompt(sceneNumber, beat, characters) {
  const characterLock = characterText(characters);

  return [
    `Cinematic 3D animated movie style, slightly realistic, 4K quality.`,
    `Scene ${sceneNumber}, exact beat ${beat.start_time}-${beat.end_time}.`,
    `Action: ${beat.action}`,
    `Location: ${beat.location}.`,
    `Characters present: ${characterLock}`,
    `Camera: ${beat.camera}`,
    `Lighting: ${beat.lighting}`,
    `Maintain strict character identity and environmental continuity.`,
    `Do not add unrelated characters, objects, actions, locations, or story events.`,
    `The action must happen naturally within this exact time window.`
  ].join(" ");
}

/*
========================================================
BEAT TIME ALLOCATION
========================================================
*/

function allocateBeatTimes(count) {
  if (count === 3) {
    return [
      { start: 0, end: 3 },
      { start: 3, end: 7 },
      { start: 7, end: 10 }
    ];
  }

  if (count === 2) {
    return [
      { start: 0, end: 5 },
      { start: 5, end: 10 }
    ];
  }

  return [{ start: 0, end: 10 }];
}

/*
========================================================
V35 SCENE BEAT PLAN
========================================================
This is the cinematic grouping layer.

Important:
The grouping is chronological.
No event can jump backward or disappear.
Each beat has one clear cinematic purpose.
*/

const V35_BEAT_PLAN = [
  {
    scene: 1,
    beats: [
      ["N01", "N02"],
      ["N03"],
      ["N04"]
    ]
  },

  {
    scene: 2,
    beats: [
      ["N05", "N06"],
      ["N07", "N08", "N09"],
      ["N10"]
    ]
  },

  {
    scene: 3,
    beats: [
      ["N11", "N12"],
      ["N13", "N14"],
      ["N15"]
    ]
  },

  {
    scene: 4,
    beats: [
      ["N16", "N17"],
      ["N18", "N19"],
      ["N20"]
    ]
  },

  {
    scene: 5,
    beats: [
      ["N21", "N22"],
      ["N23", "N24"],
      ["N25"]
    ]
  },

  {
    scene: 6,
    beats: [
      ["N26", "N27"],
      ["N28"],
      ["N29", "N30"]
    ]
  }
];

/*
========================================================
SCENE CREATION
========================================================
*/

function makeScene(scenePlan, eventMap) {
  const sceneNumber = scenePlan.scene;

  const groups = scenePlan.beats.map((ids) =>
    ids
      .map((id) => eventMap.get(id))
      .filter(Boolean)
  );

  const times = allocateBeatTimes(groups.length);

  const beats = groups.map((events, index) => {
    const time = times[index];

    const characters = charactersForEvents(events);
    const objects = objectText(events.map((e) => e.id));

    const action = actionForBeat(events);

    const beat = {
      start_time: time.start,
      end_time: time.end,
      location: events[0]?.location || "unknown",
      action,
      event_ids: events.map((e) => e.id),
      characters,
      objects,
      camera: cameraFor(events, index),
      lighting: lightingFor(events)
    };

    beat.visual_prompt = createVisualPrompt(
      sceneNumber,
      beat,
      characters
    );

    return beat;
  });

  const allEvents = groups.flat();

  const dialogue = dialogueFor(allEvents);

  return {
    scene_number: sceneNumber,
    start_time: "0s",
    end_time: "10s",

    visual_prompt: beats
      .map(
        (beat) =>
          `${beat.start_time}-${beat.end_time}s: ${beat.action}`
      )
      .join(" "),

    camera: beats
      .map(
        (beat) =>
          `${beat.start_time}-${beat.end_time}s: ${beat.camera}`
      )
      .join(" "),

    lighting: beats
      .map(
        (beat) =>
          `${beat.start_time}-${beat.end_time}s: ${beat.lighting}`
      )
      .join(" "),

    action: beats
      .map(
        (beat) =>
          `${beat.start_time}-${beat.end_time}s: ${beat.action}`
      )
      .join(" "),

    dialogue,

    voiceover: voiceoverFor(allEvents),

    continuity: continuityFor(allEvents, sceneNumber),

    characters: unique(
      beats.flatMap((beat) => beat.characters)
    ),

    objects: unique(
      beats.flatMap((beat) => beat.objects)
    ),

    beats
  };
}

/*
========================================================
FINAL SCENE
========================================================
*/

function makeFinalScene(eventMap) {
  const rescueEvents = ["N26", "N27"]
    .map((id) => eventMap.get(id))
    .filter(Boolean);

  const transitionEvents = ["N28"]
    .map((id) => eventMap.get(id))
    .filter(Boolean);

  const resolutionEvents = ["N29", "N30"]
    .map((id) => eventMap.get(id))
    .filter(Boolean);

  const beats = [
    {
      start_time: 0,
      end_time: 5,
      location: "harbor",
      action:
        "A rescue boat follows the restored lighthouse beam and reaches the harbor safely.",
      event_ids: ["N26", "N27"],
      characters: ["RescueCrew"],
      objects: ["rescue boat", "lighthouse signal mechanism"],
      camera:
        "Wide cinematic tracking shot following the rescue boat toward the harbor.",
      lighting:
        "Dark storm atmosphere illuminated by the powerful lighthouse beam."
    },

    {
      start_time: 5,
      end_time: 6,
      location: "coastal town",
      action:
        "The storm passes and the scene transitions naturally into the next morning.",
      event_ids: ["N28"],
      characters: ["Noah"],
      objects: [],
      camera:
        "Smooth cinematic time transition from storm clouds into warm morning light.",
      lighting:
        "Storm darkness gradually fades into soft golden morning sunlight."
    },

    {
      start_time: 6,
      end_time: 10,
      location: "coastal town and lighthouse",
      action:
        "The villagers thank Noah as he looks toward the lighthouse and the safe town.",
      event_ids: ["N29", "N30"],
      characters: ["Noah", "Villagers"],
      objects: ["lighthouse"],
      camera:
        "Warm medium shot of the villagers thanking Noah, ending with a slow pull-back toward the lighthouse.",
      lighting:
        "Soft golden morning light after the storm."
    }
  ];

  for (const beat of beats) {
    beat.visual_prompt = createVisualPrompt(
      6,
      beat,
      beat.characters
    );
  }

  const dialogue = [
    {
      speaker: "Villager",
      text: "Thank you, Noah. You saved our town."
    }
  ];

  return {
    scene_number: 6,
    start_time: "0s",
    end_time: "10s",

    visual_prompt: beats
      .map(
        (beat) =>
          `${beat.start_time}-${beat.end_time}s: ${beat.action}`
      )
      .join(" "),

    camera: beats
      .map(
        (beat) =>
          `${beat.start_time}-${beat.end_time}s: ${beat.camera}`
      )
      .join(" "),

    lighting: beats
      .map(
        (beat) =>
          `${beat.start_time}-${beat.end_time}s: ${beat.lighting}`
      )
      .join(" "),

    action: beats
      .map(
        (beat) =>
          `${beat.start_time}-${beat.end_time}s: ${beat.action}`
      )
      .join(" "),

    dialogue,

    voiceover:
      "The rescue boat reaches safety. By morning, the storm has passed and the villagers thank Noah for saving the town.",

    continuity:
      "The rescue must directly follow the restored lighthouse signal. Transition naturally from the stormy night to the next morning. Keep Noah's exact appearance and preserve the lighthouse location.",

    characters: ["Noah", "Villagers", "RescueCrew"],

    objects: ["rescue boat", "lighthouse signal mechanism", "lighthouse"],

    beats
  };
}

/*
========================================================
VALIDATION
========================================================
*/

function validateScenes(scenes, expectedEventIds) {
  const errors = [];

  if (scenes.length !== 6) {
    errors.push(`Expected 6 scenes, received ${scenes.length}.`);
  }

  const flattenedIds = [];

  for (const scene of scenes) {
    if (scene.start_time !== "0s") {
      errors.push(`Scene ${scene.scene_number} must start at 0s.`);
    }

    if (scene.end_time !== "10s") {
      errors.push(`Scene ${scene.scene_number} must end at 10s.`);
    }

    if (!Array.isArray(scene.beats)) {
      errors.push(`Scene ${scene.scene_number} has no beat array.`);
      continue;
    }

    if (scene.beats.length !== 3) {
      errors.push(
        `Scene ${scene.scene_number} must contain exactly 3 beats.`
      );
    }

    let previousEnd = 0;

    for (const beat of scene.beats) {
      if (beat.start_time !== previousEnd) {
        errors.push(
          `Scene ${scene.scene_number} has a timing gap or overlap.`
        );
      }

      if (beat.end_time <= beat.start_time) {
        errors.push(
          `Scene ${scene.scene_number} contains invalid beat timing.`
        );
      }

      previousEnd = beat.end_time;

      if (!Array.isArray(beat.event_ids)) {
        errors.push(
          `Scene ${scene.scene_number} contains invalid event IDs.`
        );
      } else {
        flattenedIds.push(...beat.event_ids);
      }

      if (!beat.action || typeof beat.action !== "string") {
        errors.push(
          `Scene ${scene.scene_number} contains an empty cinematic action.`
        );
      }

      if (!beat.location) {
        errors.push(
          `Scene ${scene.scene_number} contains an empty location.`
        );
      }
    }

    if (previousEnd !== 10) {
      errors.push(
        `Scene ${scene.scene_number} does not end exactly at 10 seconds.`
      );
    }

    if (!Array.isArray(scene.dialogue)) {
      errors.push(
        `Scene ${scene.scene_number} dialogue must be an array.`
      );
    } else {
      const words = countDialogueWords(scene.dialogue);

      if (words > 35) {
        errors.push(
          `Scene ${scene.scene_number} dialogue is too long: ${words} words.`
        );
      }
    }

    if (!scene.voiceover || typeof scene.voiceover !== "string") {
      errors.push(
        `Scene ${scene.scene_number} is missing voiceover.`
      );
    }
  }

  const expected = JSON.stringify(expectedEventIds);
  const actual = JSON.stringify(flattenedIds);

  if (expected !== actual) {
    errors.push(
      `Chronology/event coverage mismatch. Expected ${expected}, received ${actual}.`
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/*
========================================================
ENGINE
========================================================
*/

function generateProject() {
  const events = getStoryEvents();

  const eventMap = new Map(
    events.map((event) => [event.id, event])
  );

  const scenes = V35_BEAT_PLAN.map((plan) =>
    makeScene(plan, eventMap)
  );

  /*
  Scene 6 receives the special final-resolution treatment.
  */
  scenes[5] = makeFinalScene(eventMap);

  const validation = validateScenes(
    scenes,
    events.map((event) => event.id)
  );

  if (!validation.valid) {
    throw new Error(
      "V35 validation failed:\n" +
        validation.errors.join("\n")
    );
  }

  return {
    engine_version: ENGINE_VERSION,
    mode: "DETERMINISTIC_CINEMATIC_ENGINE",
    duration: 60,
    total_scenes: scenes.length,
    scene_duration: 10,
    aspect_ratio: "16:9",
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
    engine: ENGINE_VERSION,
    message: "SANAPTAI V35 cinematic beat engine is running.",
    gemini: "disabled",
    video_generation: "disabled",
    planner: "deterministic"
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt = "",
      duration = 60,
      aspectRatio = "16:9"
    } = req.body || {};

    if (!prompt.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Video prompt is required."
      });
    }

    if (Number(duration) !== 60) {
      return res.status(400).json({
        status: "error",
        code: "duration_not_ready",
        message:
          "V35 testing currently supports exactly 60 seconds."
      });
    }

    const project = generateProject();

    project.prompt = prompt;
    project.aspect_ratio = aspectRatio;

    return res.json(project);
  } catch (error) {
    console.error("V35 ENGINE ERROR:", error);

    return res.status(500).json({
      status: "error",
      engine: ENGINE_VERSION,
      message: "V35 engine validation failed.",
      error: error.message
    });
  }
});

/*
========================================================
HEALTH
========================================================
*/

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

/*
========================================================
START SERVER
========================================================
*/

app.listen(PORT, () => {
  console.log(`SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`);
});
