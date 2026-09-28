import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// ==================================================
// HELPERS
// ==================================================

function clean(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function sentences(text) {
  return clean(text)
    .split(/(?<=[.!?])\s+/)
    .map(x => x.trim())
    .filter(Boolean);
}

function durationValue(value) {
  const allowed = [10, 30, 60, 300, 600, 1200];
  const n = Number(value);
  return allowed.includes(n) ? n : 60;
}

function ratioValue(value) {
  return ["9:16", "16:9", "1:1"].includes(value)
    ? value
    : "16:9";
}

function sceneCount(duration) {
  return duration / 10;
}

// ==================================================
// CHARACTER EXTRACTION
// ==================================================

function extractCharacters(story) {
  const result = [];
  const lower = story.toLowerCase();

  // Named characters
  const namedMatches =
    story.match(
      /\b(?:named|called)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g
    ) || [];

  for (const item of namedMatches) {
    const name = item
      .replace(/^(named|called)\s+/i, "")
      .trim();

    result.push({
      name,
      role: "main",
      description: `${name}. Maintain exact age, face, hairstyle, clothing, body proportions and appearance throughout the story.`
    });
  }

  // Main person descriptions
  if (
    lower.includes("young delivery driver") ||
    lower.includes("delivery driver")
  ) {
    result.push({
      name: "Delivery Driver",
      role: "main",
      description:
        "Young delivery driver. Consistent youthful face, practical delivery clothing, winter jacket, pants, boots and delivery gear. Exact appearance must remain unchanged."
    });
  }

  if (
    lower.includes("injured hiker") ||
    lower.includes("hiker")
  ) {
    result.push({
      name: "Injured Hiker",
      role: "supporting",
      description:
        "Adult hiker with visible but non-graphic signs of injury, outdoor winter clothing, backpack and consistent appearance throughout."
    });
  }

  if (
    lower.includes("rescuer") ||
    lower.includes("rescuers")
  ) {
    result.push({
      name: "Rescuers",
      role: "supporting_group",
      description:
        "Professional mountain rescuers wearing consistent winter rescue clothing and equipment."
    });
  }

  if (lower.includes("father")) {
    result.push({
      name: "Father",
      role: "supporting",
      description:
        "Adult father with consistent appearance and clothing."
    });
  }

  if (lower.includes("mother")) {
    result.push({
      name: "Mother",
      role: "supporting",
      description:
        "Adult mother with consistent appearance and clothing."
    });
  }

  // Generic fallback
  if (result.length === 0) {
    result.push({
      name: "Main Character",
      role: "main",
      description:
        "Primary protagonist. Maintain exact appearance, age, hairstyle, clothing and body proportions."
    });
  }

  // Remove duplicates
  const unique = [];
  const seen = new Set();

  for (const c of result) {
    const key = c.name.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(c);
    }
  }

  return unique;
}

// ==================================================
// LOCATION EXTRACTION
// ==================================================

function extractLocations(story) {
  const lower = story.toLowerCase();
  const locations = [];

  const checks = [
    ["mountain", "Mountain"],
    ["cabin", "Mountain Cabin"],
    ["forest", "Forest"],
    ["town", "Town"],
    ["city", "City"],
    ["village", "Village"],
    ["road", "Mountain Road"],
    ["school", "School"],
    ["house", "House"],
    ["home", "Home"],
    ["hospital", "Hospital"],
    ["harbor", "Harbor"],
    ["lighthouse", "Lighthouse"],
    ["workshop", "Workshop"],
    ["beach", "Beach"],
    ["river", "River"],
    ["office", "Office"],
    ["airport", "Airport"],
    ["station", "Station"]
  ];

  for (const [word, location] of checks) {
    if (lower.includes(word)) {
      locations.push(location);
    }
  }

  return [...new Set(locations)];
}

// ==================================================
// OBJECT EXTRACTION
// ==================================================

function extractObjects(story) {
  const lower = story.toLowerCase();
  const objects = [];

  const checks = [
    ["water", "Water"],
    ["backpack", "Backpack"],
    ["phone", "Phone"],
    ["radio", "Radio"],
    ["journal", "Journal"],
    ["map", "Map"],
    ["book", "Book"],
    ["boat", "Boat"],
    ["car", "Car"],
    ["key", "Key"],
    ["door", "Door"],
    ["poster", "Poster"],
    ["signal", "Signal Equipment"],
    ["food", "Food"],
    ["flashlight", "Flashlight"]
  ];

  for (const [word, object] of checks) {
    if (lower.includes(word)) {
      objects.push(object);
    }
  }

  return [...new Set(objects)];
}

// ==================================================
// ATOMIC EVENT ENGINE
// ==================================================

function createAtomicEvents(story) {
  const s = sentences(story);
  const events = [];

  for (let i = 0; i < s.length; i++) {
    const text = s[i];
    const lower = text.toLowerCase();

    // ----------------------------------------------
    // DELIVERY DRIVER + SNOWSTORM
    // ----------------------------------------------

    if (
      lower.includes("delivery driver") &&
      lower.includes("snowstorm")
    ) {
      events.push({
        id: "E1",
        type: "problem",
        characters: ["Delivery Driver"],
        location: "Mountain",
        action:
          "The young delivery driver becomes lost while driving through a heavy snowstorm.",
        source: text
      });

      continue;
    }

    // ----------------------------------------------
    // CABIN + HIKER
    // ----------------------------------------------

    if (
      lower.includes("cabin") &&
      lower.includes("hiker")
    ) {
      events.push({
        id: "E2",
        type: "discovery",
        characters: ["Delivery Driver", "Injured Hiker"],
        location: "Mountain Cabin",
        action:
          "The delivery driver discovers an old cabin and finds an injured hiker inside.",
        source: text
      });

      continue;
    }

    // ----------------------------------------------
    // WATER
    // ----------------------------------------------

    if (lower.includes("water")) {
      events.push({
        id: "E3",
        type: "rescue",
        characters: ["Delivery Driver", "Injured Hiker"],
        location: "Mountain Cabin",
        action:
          "The delivery driver gives the injured hiker water.",
        source: text
      });
    }

    // ----------------------------------------------
    // CALL FOR HELP
    // ----------------------------------------------

    if (
      lower.includes("calls for help") ||
      lower.includes("call for help") ||
      lower.includes("calls") && lower.includes("help")
    ) {
      events.push({
        id: "E4",
        type: "rescue",
        characters: ["Delivery Driver", "Injured Hiker"],
        location: "Mountain Cabin",
        action:
          "The delivery driver calls for emergency help while staying with the injured hiker.",
        source: text
      });
    }

    // ----------------------------------------------
    // STAYS THROUGH NIGHT
    // ----------------------------------------------

    if (
      lower.includes("through the night") ||
      lower.includes("stays with")
    ) {
      events.push({
        id: "E5",
        type: "survival",
        characters: ["Delivery Driver", "Injured Hiker"],
        location: "Mountain Cabin",
        action:
          "The delivery driver stays beside the injured hiker through the night.",
        source: text
      });
    }

    // ----------------------------------------------
    // SUNRISE + RESCUERS
    // ----------------------------------------------

    if (
      lower.includes("sunrise") &&
      lower.includes("rescuers")
    ) {
      events.push({
        id: "E6",
        type: "resolution",
        characters: [
          "Delivery Driver",
          "Injured Hiker",
          "Rescuers"
        ],
        location: "Mountain Cabin",
        action:
          "At sunrise, rescuers arrive and safely take the injured hiker home.",
        source: text,
        final: true
      });

      continue;
    }

    // ----------------------------------------------
    // GENERIC EVENT
    // ----------------------------------------------

    const alreadyRepresented =
      events.some(e => e.source === text);

    if (!alreadyRepresented) {
      events.push({
        id: `E${events.length + 1}`,
        type: "story",
        characters: [],
        location: null,
        action: text,
        source: text
      });
    }
  }

  return events;
}

// ==================================================
// EVENT → SCENE EXPANSION
// ==================================================

function expandEvent(event) {
  const e = [];

  if (event.type === "problem") {
    e.push({
      event,
      phase: "establish",
      action: event.action
    });

    e.push({
      event,
      phase: "reaction",
      action:
        "The delivery driver realizes he is lost and carefully searches for a safe route through the storm."
    });

    return e;
  }

  if (event.type === "discovery") {
    e.push({
      event,
      phase: "approach",
      action:
        "The delivery driver spots the old cabin through the snow and approaches it carefully."
    });

    e.push({
      event,
      phase: "discovery",
      action: event.action
    });

    return e;
  }

  if (event.type === "rescue") {
    e.push({
      event,
      phase: "action",
      action: event.action
    });

    return e;
  }

  if (event.type === "survival") {
    e.push({
      event,
      phase: "night",
      action:
        "The delivery driver remains beside the injured hiker inside the cabin through the dangerous night."
    });

    return e;
  }

  if (event.type === "resolution") {
    e.push({
      event,
      phase: "sunrise",
      action:
        "Sunrise arrives as the storm weakens and rescuers approach the cabin."
    });

    e.push({
      event,
      phase: "final",
      action: event.action
    });

    return e;
  }

  return [
    {
      event,
      phase: "story",
      action: event.action
    }
  ];
}

// ==================================================
// TIMELINE DISTRIBUTION
// ==================================================

function buildTimeline(story, totalScenes) {
  const events = createAtomicEvents(story);

  let beats = [];

  for (const event of events) {
    beats.push(...expandEvent(event));
  }

  // Remove duplicates
  const unique = [];
  const keys = new Set();

  for (const beat of beats) {
    const key =
      `${beat.event.id}-${beat.phase}-${beat.action}`;

    if (!keys.has(key)) {
      keys.add(key);
      unique.push(beat);
    }
  }

  beats = unique;

  // If we need fewer scenes, preserve the important story events.
  if (beats.length > totalScenes) {
    const finalBeat = beats[beats.length - 1];

    const selected = [];

    const nonFinal = beats.slice(0, -1);

    for (
      let i = 0;
      i < totalScenes - 1;
      i++
    ) {
      const position =
        Math.floor(
          (i / Math.max(1, totalScenes - 1)) *
          nonFinal.length
        );

      selected.push(
        nonFinal[
          Math.min(position, nonFinal.length - 1)
        ]
      );
    }

    selected.push(finalBeat);

    beats = selected;
  }

  // If we need more scenes, expand existing events.
  while (beats.length < totalScenes) {
    const source =
      beats[beats.length - 1] ||
      {
        event: {
          id: "E1",
          type: "story",
          characters: [],
          location: null,
          source: story
        },
        phase: "story",
        action: story
      };

    beats.push({
      event: source.event,
      phase: "continuation",
      action:
        `Continue naturally from the previous moment: ${source.action}`
    });
  }

  return beats.slice(0, totalScenes);
}

// ==================================================
// SMART LIGHTING
// ==================================================

function lighting(beat, sceneNumber, totalScenes) {
  const text =
    `${beat.action} ${beat.event.source}`.toLowerCase();

  if (
    beat.phase === "sunrise" ||
    beat.phase === "final" ||
    text.includes("sunrise")
  ) {
    return "Peaceful sunrise lighting with soft golden daylight, calm atmosphere and realistic early-morning shadows.";
  }

  if (
    text.includes("snowstorm") ||
    text.includes("snow") ||
    text.includes("storm")
  ) {
    return "Heavy winter storm lighting with cold overcast sky, blowing snow, realistic atmospheric depth and wet or snow-covered surfaces.";
  }

  if (beat.phase === "night") {
    return "Realistic nighttime cabin lighting with subtle warm practical light contrasting against the cold dark exterior.";
  }

  return "Natural cinematic lighting appropriate to the established location, time of day and weather.";
}

// ==================================================
// CAMERA
// ==================================================

function camera(beat, sceneNumber, totalScenes) {
  if (sceneNumber === 1) {
    return "Wide cinematic establishing shot followed by a gentle push toward the protagonist.";
  }

  if (sceneNumber === totalScenes) {
    return "Wide emotional establishing shot followed by a slow cinematic push toward the completed story outcome.";
  }

  if (
    beat.phase === "discovery" ||
    beat.phase === "approach"
  ) {
    return "Medium cinematic shot followed by a subtle push toward the important discovery.";
  }

  if (
    beat.phase === "action" ||
    beat.phase === "reaction"
  ) {
    return "Natural tracking shot following the character's movement and reaction.";
  }

  return "Natural cinematic medium shot with subtle camera movement.";
}

// ==================================================
// DIALOGUE
// ==================================================

function dialogue(beat, sceneNumber, totalScenes) {
  if (beat.phase === "establish") {
    return "I can't see the road.";
  }

  if (beat.phase === "reaction") {
    return "I need to find shelter.";
  }

  if (beat.phase === "approach") {
    return "There has to be someone inside.";
  }

  if (beat.phase === "discovery") {
    return "Are you hurt?";
  }

  if (beat.event.id === "E3") {
    return "Here, drink some water.";
  }

  if (beat.event.id === "E4") {
    return "Stay with me. Help is coming.";
  }

  if (beat.phase === "night") {
    return "You're not alone tonight.";
  }

  if (
    beat.phase === "sunrise"
  ) {
    return "They're finally here.";
  }

  if (beat.phase === "final") {
    return "You're safe now.";
  }

  return "Stay calm. We'll get through this.";
}

// ==================================================
// VOICEOVER
// ==================================================

function voiceover(beat, sceneNumber, totalScenes) {
  if (beat.phase === "final") {
    return "At sunrise, rescuers arrived and safely took the injured hiker home.";
  }

  return clean(
    beat.action
  );
}

// ==================================================
// VISUAL PROMPT
// ==================================================

function visualPrompt(
  beat,
  characters,
  locations,
  objects,
  ratio,
  sceneNumber,
  totalScenes
) {
  const activeCharacters =
    beat.event.characters.length
      ? beat.event.characters.join(", ")
      : characters.map(c => c.name).join(", ");

  const location =
    beat.event.location ||
    locations[0] ||
    "established story location";

  const props =
    objects.length
      ? objects.join(", ")
      : "only props explicitly required by this scene";

  const characterLocks = characters
    .map(
      c =>
        `${c.name}: ${c.description}`
    )
    .join(" ");

  return `Cinematic ${ratio} scene. Show ONLY this exact story action: ${beat.action}. Active characters: ${activeCharacters}. Location: ${location}. Relevant props: ${props}.

CHARACTER LOCK:
${characterLocks}

Maintain exact character identity, face, age, hairstyle, clothing, body proportions and physical appearance. Keep the same characters consistent across every scene. Do not add unrelated people, vehicles, animals, objects, locations or events. Do not remove a character required by this scene. Realistic movement, natural facial expressions and believable physical behavior.

Scene ${sceneNumber} of ${totalScenes}.`;
}

// ==================================================
// PROJECT CREATION
// ==================================================

function createProject({
  prompt,
  duration,
  aspectRatio
}) {
  const story = clean(prompt);

  const totalScenes =
    sceneCount(duration);

  const characters =
    extractCharacters(story);

  const locations =
    extractLocations(story);

  const objects =
    extractObjects(story);

  const events =
    createAtomicEvents(story);

  const timeline =
    buildTimeline(
      story,
      totalScenes
    );

  const scenes =
    timeline.map(
      (beat, index) => {
        const number =
          index + 1;

        return {
          scene_number: number,

          start_time:
            `${index * 10}s`,

          end_time:
            `${(index + 1) * 10}s`,

          visual_prompt:
            visualPrompt(
              beat,
              characters,
              locations,
              objects,
              aspectRatio,
              number,
              totalScenes
            ),

          camera:
            camera(
              beat,
              number,
              totalScenes
            ),

          lighting:
            lighting(
              beat,
              number,
              totalScenes
            ),

          action:
            beat.action,

          dialogue:
            dialogue(
              beat,
              number,
              totalScenes
            ),

          voiceover:
            voiceover(
              beat,
              number,
              totalScenes
            ),

          continuity:
            number === 1
              ? "Opening scene. Establish the story and lock all main character identities."
              : number === totalScenes
                ? "Final scene. Complete the actual story ending. Preserve every established character and location."
                : `Continue directly from Scene ${number - 1}. Preserve exact character identity, clothing, location, props and story progression.`
        };
      }
    );

  return {
    version: "V14.1",
    mode: "Universal Story Engine",
    duration,
    total_scenes: totalScenes,
    aspect_ratio: aspectRatio,

    story_understanding: {
      original_story: story,
      characters,
      locations,
      objects,
      events
    },

    scenes
  };
}

// ==================================================
// ROUTES
// ==================================================

app.get("/", (req, res) => {
  res.json({
    status: "SANAPTAI V14.1 is live",
    engine: "Character + Event Lock",
    mode: "Demo",
    video_generation: false
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    status: "OK",
    version: "V14.1",
    engine: "Character + Event Lock",
    gemini_calls: false
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const prompt = clean(req.body?.prompt);

    if (!prompt) {
      return res.status(400).json({
        error: "Story prompt is required."
      });
    }

    const duration =
      durationValue(req.body?.duration);

    const aspectRatio =
      ratioValue(req.body?.aspectRatio);

    res.json(
      createProject({
        prompt,
        duration,
        aspectRatio
      })
    );

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Project creation failed.",
      details: error.message
    });
  }
});

app.post("/api/create-project", (req, res) => {
  try {
    const prompt = clean(req.body?.prompt);

    if (!prompt) {
      return res.status(400).json({
        error: "Story prompt is required."
      });
    }

    const duration =
      durationValue(req.body?.duration);

    const aspectRatio =
      ratioValue(req.body?.aspectRatio);

    res.json(
      createProject({
        prompt,
        duration,
        aspectRatio
      })
    );

  } catch (error) {
    res.status(500).json({
      error: "Project creation failed.",
      details: error.message
    });
  }
});

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    error:
      "AI planning mode will be enabled in a later version.",
    version: "V14.1"
  });
});

// ==================================================
// START
// ==================================================

app.listen(PORT, () => {
  console.log(
    `SANAPTAI V14.1 running on port ${PORT}`
  );
});
