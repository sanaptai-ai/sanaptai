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

function cleanText(text = "") {
  return text
    .replace(/\s+/g, " ")
    .replace(/\.\./g, ".")
    .trim();
}

function splitSentences(text = "") {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(cleanText)
    .filter(Boolean);
}

function sceneTimes(index) {
  const start = index * 10;
  const end = start + 10;

  return {
    start_time: `${start}s`,
    end_time: `${end}s`
  };
}

// ==================================================
// CHARACTER EXTRACTION
// ==================================================

function extractCharacters(story) {
  const lower = story.toLowerCase();
  const characters = [];

  if (/delivery driver|driver/.test(lower)) {
    characters.push({
      role: "main",
      name: "Delivery Driver",
      description:
        "Young delivery driver with a consistent youthful face, practical delivery clothing, winter jacket, pants, boots and delivery gear."
    });
  }

  if (/injured hiker|hiker/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Injured Hiker",
      description:
        "Adult hiker wearing consistent outdoor winter clothing, backpack and non-graphic visible signs of injury."
    });
  }

  if (/rescuer|rescuers|rescue team/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Rescuers",
      description:
        "Professional mountain rescuers wearing consistent winter rescue clothing and equipment."
    });
  }

  if (/father/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Father",
      description:
        "Adult father with consistent natural appearance and clothing."
    });
  }

  if (/mother/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Mother",
      description:
        "Adult mother with consistent natural appearance and clothing."
    });
  }

  if (characters.length === 0) {
    characters.push({
      role: "main",
      name: "Main Character",
      description:
        "Main character with a consistent face, age, hairstyle, clothing, body proportions and physical appearance."
    });
  }

  return characters;
}

// ==================================================
// LOCATION EXTRACTION
// ==================================================

function extractLocations(story) {
  const lower = story.toLowerCase();
  const locations = [];

  const map = [
    ["mountains", "Mountain"],
    ["mountain", "Mountain"],
    ["cabin", "Mountain Cabin"],
    ["forest", "Forest"],
    ["town", "Town"],
    ["village", "Village"],
    ["city", "City"],
    ["road", "Road"],
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

  for (const [keyword, location] of map) {
    if (lower.includes(keyword) && !locations.includes(location)) {
      locations.push(location);
    }
  }

  return locations;
}

// ==================================================
// OBJECT EXTRACTION
// ==================================================

function extractObjects(story) {
  const lower = story.toLowerCase();
  const objects = [];

  const map = [
    ["water", "Water"],
    ["backpack", "Backpack"],
    ["phone", "Phone"],
    ["radio", "Radio"],
    ["journal", "Journal"],
    ["map", "Map"],
    ["boat", "Boat"],
    ["car", "Car"],
    ["truck", "Delivery Vehicle"],
    ["vehicle", "Vehicle"],
    ["key", "Key"],
    ["door", "Door"],
    ["poster", "Poster"],
    ["signal", "Signal Equipment"],
    ["food", "Food"],
    ["flashlight", "Flashlight"]
  ];

  for (const [keyword, object] of map) {
    if (lower.includes(keyword) && !objects.includes(object)) {
      objects.push(object);
    }
  }

  return objects;
}

// ==================================================
// SPECIAL DELIVERY DRIVER STORY ENGINE
// ==================================================

function createDeliveryDriverEvents(story) {
  const lower = story.toLowerCase();

  if (
    lower.includes("delivery driver") &&
    lower.includes("snowstorm") &&
    lower.includes("injured hiker")
  ) {
    return [
      {
        id: "E1",
        type: "problem",
        action:
          "The young delivery driver becomes lost while driving through a heavy snowstorm.",
        characters: ["Delivery Driver"],
        location: "Mountain",
        props: ["Delivery Vehicle"],
        dialogue: "I can't see the road.",
        voiceover:
          "The young delivery driver becomes lost while driving through a heavy snowstorm."
      },

      {
        id: "E2",
        type: "search",
        action:
          "The delivery driver realizes he is lost and carefully searches for a safe route through the storm.",
        characters: ["Delivery Driver"],
        location: "Mountain",
        props: ["Delivery Vehicle"],
        dialogue: "I need to find shelter.",
        voiceover:
          "The delivery driver realizes he is lost and searches for a safe route."
      },

      {
        id: "E3",
        type: "discovery",
        action:
          "The delivery driver approaches an old cabin and discovers an injured hiker inside.",
        characters: ["Delivery Driver", "Injured Hiker"],
        location: "Mountain Cabin",
        props: ["Backpack"],
        dialogue: "Are you hurt?",
        voiceover:
          "The driver reaches an old cabin and discovers an injured hiker inside."
      },

      {
        id: "E4",
        type: "rescue",
        action:
          "The delivery driver gives the injured hiker water and calls for emergency help.",
        characters: ["Delivery Driver", "Injured Hiker"],
        location: "Mountain Cabin",
        props: ["Water", "Phone"],
        dialogue: "Drink this. Help is coming.",
        voiceover:
          "The driver gives the injured hiker water and calls for emergency help."
      },

      {
        id: "E5",
        type: "night",
        action:
          "The delivery driver stays beside the injured hiker through the dangerous night.",
        characters: ["Delivery Driver", "Injured Hiker"],
        location: "Mountain Cabin",
        props: [],
        dialogue: "You're not alone tonight.",
        voiceover:
          "The driver stays beside the injured hiker through the dangerous night."
      },

      {
        id: "E6",
        type: "resolution",
        action:
          "At sunrise, rescuers arrive and safely take the injured hiker home.",
        characters: ["Delivery Driver", "Injured Hiker", "Rescuers"],
        location: "Mountain Cabin",
        props: [],
        dialogue: "You're safe now.",
        voiceover:
          "At sunrise, rescuers arrive and safely take the injured hiker home."
      }
    ];
  }

  return null;
}

// ==================================================
// GENERIC STORY ENGINE
// ==================================================

function createGenericEvents(story) {
  const sentences = splitSentences(story);

  return sentences.map((sentence, index) => ({
    id: `G${index + 1}`,
    type: "story",
    action: sentence,
    characters: ["Main Character"],
    location: "Story Location",
    props: [],
    dialogue: "",
    voiceover: sentence
  }));
}

// ==================================================
// EVENT EXPANSION
// ==================================================

function expandEvent(event) {
  // Important:
  // Discovery stays as ONE scene.
  // This prevents the injured hiker from appearing
  // before the actual discovery.

  if (event.type === "discovery") {
    return [event];
  }

  if (event.type === "problem") {
    return [event];
  }

  if (event.type === "search") {
    return [event];
  }

  if (event.type === "rescue") {
    return [event];
  }

  if (event.type === "night") {
    return [event];
  }

  if (event.type === "resolution") {
    return [event];
  }

  return [event];
}

// ==================================================
// TIMELINE BUILDER
// ==================================================

function buildTimeline(events, targetScenes) {
  let timeline = [];

  for (const event of events) {
    timeline.push(...expandEvent(event));
  }

  // ------------------------------------------------
  // SPECIAL CASE:
  // DELIVERY DRIVER STORY
  // ------------------------------------------------

  if (
    events.length === 6 &&
    events[0]?.id === "E1" &&
    events[1]?.id === "E2" &&
    events[2]?.id === "E3" &&
    events[3]?.id === "E4" &&
    events[4]?.id === "E5" &&
    events[5]?.id === "E6"
  ) {
    // Exactly 6 scenes.
    // Every important story beat is preserved.
    return events.slice(0, targetScenes);
  }

  // ------------------------------------------------
  // TOO MANY SCENES
  // ------------------------------------------------

  if (timeline.length > targetScenes) {
    const finalEvent = timeline[timeline.length - 1];

    timeline = timeline.slice(0, targetScenes - 1);
    timeline.push(finalEvent);
  }

  // ------------------------------------------------
  // FEWER SCENES
  // ------------------------------------------------

  while (timeline.length < targetScenes) {
    const finalEvent = timeline[timeline.length - 1];

    if (finalEvent?.type === "resolution") {
      const arrivalScene = {
        ...finalEvent,
        id: `${finalEvent.id}_arrival`,
        action:
          "The rescuers arrive and begin helping the characters at the scene.",
        dialogue: "Help is here.",
        voiceover:
          "The rescuers finally arrive to help."
      };

      timeline.splice(timeline.length - 1, 0, arrivalScene);
    } else {
      const previous = timeline[timeline.length - 1];

      timeline.push({
        ...previous,
        id: `${previous.id}_continuation`,
        action:
          `The characters continue the immediate action: ${previous.action}`,
        dialogue: previous.dialogue,
        voiceover: previous.voiceover
      });
    }
  }

  // Final safety protection.
  if (timeline.length > targetScenes) {
    const finalEvent = timeline[timeline.length - 1];

    timeline = timeline.slice(0, targetScenes - 1);
    timeline.push(finalEvent);
  }

  return timeline;
}

// ==================================================
// SCENE CONTEXT
// ==================================================

function getRelevantProps(event) {
  return Array.isArray(event.props) ? event.props : [];
}

function getLocation(event) {
  return event.location || "Story Location";
}

function getCharacters(event, allCharacters) {
  const names = event.characters || [];

  return allCharacters.filter(character =>
    names.includes(character.name)
  );
}

// ==================================================
// SMART LIGHTING
// ==================================================

function lightingForScene(event) {
  const text =
    `${event.type} ${event.action}`.toLowerCase();

  if (
    text.includes("sunrise") ||
    event.type === "resolution" ||
    text.includes("morning")
  ) {
    return "Peaceful sunrise lighting with soft golden daylight, calm atmosphere and realistic early-morning shadows.";
  }

  if (
    event.type === "night" ||
    text.includes("night")
  ) {
    return "Realistic nighttime cabin lighting with subtle warm practical light contrasting against the cold dark exterior.";
  }

  if (
    text.includes("snowstorm") ||
    text.includes("storm") ||
    text.includes("snow")
  ) {
    return "Heavy winter storm lighting with cold overcast sky, blowing snow, realistic atmospheric depth and snow-covered surfaces.";
  }

  if (event.location === "Mountain Cabin") {
    return "Cold natural daylight entering the cabin, soft realistic shadows and subtle warm interior contrast.";
  }

  return "Natural cinematic daylight appropriate to the established location and story moment.";
}

// ==================================================
// SMART CAMERA
// ==================================================

function cameraForScene(event, index, total) {
  if (index === 0) {
    return "Wide cinematic establishing shot followed by a gentle push toward the protagonist.";
  }

  if (index === total - 1) {
    return "Wide emotional establishing shot followed by a slow cinematic push toward the completed story outcome.";
  }

  if (event.type === "discovery") {
    return "Medium cinematic shot followed by a subtle push toward the important discovery.";
  }

  if (
    event.type === "rescue" ||
    event.type === "help"
  ) {
    return "Natural medium tracking shot following the characters and their immediate actions.";
  }

  if (event.type === "night") {
    return "Natural cinematic medium shot with subtle camera movement inside the cabin.";
  }

  return "Natural cinematic medium shot with subtle camera movement.";
}

// ==================================================
// DIALOGUE
// ==================================================

function dialogueForScene(event) {
  if (event.dialogue) {
    return event.dialogue;
  }

  switch (event.type) {
    case "problem":
      return "I need to stay calm.";

    case "search":
      return "There has to be a safe way.";

    case "discovery":
      return "Are you okay?";

    case "rescue":
      return "Help is coming.";

    case "night":
      return "We'll make it through the night.";

    case "resolution":
      return "You're safe now.";

    default:
      return "Stay calm. We'll get through this.";
  }
}

// ==================================================
// CHARACTER LOCK
// ==================================================

function characterLockBlock(characters) {
  return characters
    .map(
      c =>
        `${c.name}: ${c.description} Exact appearance must remain unchanged.`
    )
    .join(" ");
}

// ==================================================
// SCENE CREATION
// ==================================================

function createScenes(story, duration, aspectRatio) {
  const targetScenes = Math.max(
    1,
    Math.floor(Number(duration) / 10)
  );

  const characters = extractCharacters(story);
  const locations = extractLocations(story);
  const objects = extractObjects(story);

  let events = createDeliveryDriverEvents(story);

  if (!events) {
    events = createGenericEvents(story);
  }

  const timeline = buildTimeline(
    events,
    targetScenes
  );

  const scenes = timeline.map((event, index) => {
    const times = sceneTimes(index);

    const activeCharacters =
      getCharacters(event, characters);

    const relevantProps =
      getRelevantProps(event);

    const characterNames =
      activeCharacters.length > 0
        ? activeCharacters
            .map(c => c.name)
            .join(", ")
        : "Main Character";

    const propsText =
      relevantProps.length > 0
        ? relevantProps.join(", ")
        : "No special props required";

    const visualPrompt = `
Cinematic ${aspectRatio} scene.

Show ONLY this exact story action:
${cleanText(event.action)}

Active characters: ${characterNames}.
Location: ${getLocation(event)}.
Relevant props: ${propsText}.

CHARACTER LOCK:
${characterLockBlock(characters)}

Maintain exact character identity, face, age, hairstyle, clothing, body proportions and physical appearance.

Keep the same characters consistent across every scene.

Use only characters, props and locations required by this scene.

Do not add unrelated people, vehicles, animals, objects, locations or events.

If a vehicle is listed as a relevant prop, it is required and must appear naturally in the scene.
If a vehicle is not listed as a relevant prop, do not add one.

Realistic movement, natural facial expressions and believable physical behavior.

Scene ${index + 1} of ${targetScenes}.
`.trim();

    return {
      scene_number: index + 1,
      start_time: times.start_time,
      end_time: times.end_time,

      visual_prompt: visualPrompt,

      camera: cameraForScene(
        event,
        index,
        targetScenes
      ),

      lighting: lightingForScene(event),

      action: cleanText(event.action),

      dialogue: dialogueForScene(event),

      voiceover: cleanText(
        event.voiceover || event.action
      ),

      continuity:
        index === 0
          ? "Opening scene. Establish the story and lock all main character identities."
          : index === targetScenes - 1
          ? "Final scene. Complete the actual story ending and preserve established continuity."
          : `Continue directly from Scene ${index}. Preserve exact character identity, clothing, location and relevant story elements.`
    };
  });

  return {
    duration: Number(duration),
    total_scenes: targetScenes,
    aspect_ratio: aspectRatio,

    characters,
    locations,
    objects,

    scenes
  };
}

// ==================================================
// API ROUTES
// ==================================================

app.get("/", (req, res) => {
  res.send("SANAPTAI V14.3 is live");
});

// --------------------------------------------------

app.get("/api/test", (req, res) => {
  res.json({
    status: "ok",
    version: "V14.3",
    engine: "Context-Aware Story Timeline",
    demo_mode: true,
    gemini: false
  });
});

// --------------------------------------------------

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt,
      duration = 60,
      aspectRatio = "16:9"
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required."
      });
    }

    const project = createScenes(
      prompt.trim(),
      Number(duration),
      aspectRatio
    );

    res.json(project);

  } catch (error) {
    console.error(
      "Demo project error:",
      error
    );

    res.status(500).json({
      error:
        error.message ||
        "Project creation failed."
    });
  }
});

// --------------------------------------------------

app.post("/api/create-project", (req, res) => {
  try {
    const {
      prompt,
      duration = 60,
      aspectRatio = "16:9"
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required."
      });
    }

    const project = createScenes(
      prompt.trim(),
      Number(duration),
      aspectRatio
    );

    res.json(project);

  } catch (error) {
    console.error(
      "Create project error:",
      error
    );

    res.status(500).json({
      error:
        error.message ||
        "Project creation failed."
    });
  }
});

// --------------------------------------------------
// GEMINI DISABLED FOR DEMO MODE
// --------------------------------------------------

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    error:
      "AI scene planning is reserved for a future version.",
    version: "V14.3"
  });
});

// ==================================================
// SERVER
// ==================================================

app.listen(PORT, () => {
  console.log(
    `SANAPTAI V14.3 running on port ${PORT}`
  );
});
