import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// ============================================================
// SANAPTAI V9 — STORY + CHARACTER + EVENT + CONTINUITY ENGINE
// ============================================================

function cleanText(text = "") {
  return String(text)
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .trim();
}

function splitSentences(text = "") {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function has(text, words) {
  const t = text.toLowerCase();
  return words.some(w => t.includes(w.toLowerCase()));
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function durationToSeconds(duration) {
  const d = String(duration || "30 sec").toLowerCase();

  if (d.includes("20")) return 1200;
  if (d.includes("10 min")) return 600;
  if (d.includes("5 min")) return 300;
  if (d.includes("1 min")) return 60;
  if (d.includes("60")) return 60;
  if (d.includes("30")) return 30;
  return 10;
}

function createSceneCount(seconds) {
  return Math.max(1, Math.ceil(seconds / 10));
}

// ------------------------------------------------------------
// CHARACTER PARSER
// ------------------------------------------------------------

function detectCharacters(story) {
  const t = story.toLowerCase();
  const characters = [];

  if (
    t.includes("young boy") ||
    t.includes("little boy") ||
    t.includes("12-year-old boy") ||
    t.includes("12 year old boy")
  ) {
    characters.push({
      id: "main_boy",
      role: "main character",
      description:
        "12-year-old boy, warm natural skin tone, round youthful face, dark brown eyes, short slightly messy black hair, slim child body, sky-blue T-shirt, dark blue jeans and white sneakers"
    });
  } else if (/\bboy\b/.test(t)) {
    characters.push({
      id: "main_boy",
      role: "main character",
      description:
        "young boy with a natural youthful face, short slightly messy black hair, slim child body, simple casual clothing"
    });
  }

  if (
    t.includes("young girl") ||
    t.includes("little girl") ||
    t.includes("12-year-old girl") ||
    t.includes("12 year old girl")
  ) {
    characters.push({
      id: "main_girl",
      role: "main character",
      description:
        "12-year-old girl with a youthful face, dark eyes, shoulder-length dark hair, slim child body, simple casual clothing"
    });
  } else if (/\bgirl\b/.test(t)) {
    characters.push({
      id: "main_girl",
      role: "main character",
      description:
        "young girl with a youthful face, dark hair, slim child body, simple casual clothing"
    });
  }

  if (has(t, ["mother", "mom", "mum"])) {
    characters.push({
      id: "mother",
      role: "supporting character",
      description:
        "35-year-old woman, warm natural face, medium-length dark hair, simple everyday clothing"
    });
  }

  if (has(t, ["father", "dad"])) {
    characters.push({
      id: "father",
      role: "supporting character",
      description:
        "40-year-old man, natural face, short dark hair, average build, simple everyday clothing"
    });
  }

  if (has(t, ["teacher", "school teacher"])) {
    characters.push({
      id: "teacher",
      role: "supporting character",
      description:
        "adult school teacher, professional appearance, simple teacher clothing"
    });
  }

  if (has(t, ["friend", "best friend"])) {
    characters.push({
      id: "friend",
      role: "supporting character",
      description:
        "same supporting friend throughout the entire video, youthful appearance, consistent hairstyle and clothing"
    });
  }

  if (has(t, ["owner", "pet owner"])) {
    characters.push({
      id: "pet_owner",
      role: "supporting character",
      description:
        "adult pet owner, warm natural face, medium build, short dark hair, casual jacket and jeans, permanently consistent appearance"
    });
  }

  if (has(t, ["villain", "enemy", "attacker"])) {
    characters.push({
      id: "villain",
      role: "antagonist",
      description:
        "adult antagonist with consistent face, hairstyle, body proportions and dark practical clothing throughout the video"
    });
  }

  return characters;
}

// ------------------------------------------------------------
// ANIMAL PARSER
// ------------------------------------------------------------

function detectAnimals(story) {
  const t = story.toLowerCase();
  const animals = [];

  if (has(t, ["kitten"])) {
    animals.push({
      id: "kitten",
      description:
        "small abandoned kitten with soft light-gray fur, white chest, white paws and expressive green eyes; identical appearance in every scene"
    });
  }

  if (has(t, ["puppy", "dog"])) {
    animals.push({
      id: "puppy",
      description:
        "small friendly puppy with warm golden-brown fur, floppy ears and expressive dark eyes; identical appearance in every scene"
    });
  }

  if (has(t, ["cat"])) {
    animals.push({
      id: "cat",
      description:
        "same domestic cat throughout the entire video, consistent fur pattern, eye color and body size"
    });
  }

  if (has(t, ["horse"])) {
    animals.push({
      id: "horse",
      description:
        "same horse throughout the video, consistent coat color, markings and body proportions"
    });
  }

  if (has(t, ["rabbit"])) {
    animals.push({
      id: "rabbit",
      description:
        "same small rabbit throughout the video, consistent fur color and markings"
    });
  }

  if (has(t, ["bird"])) {
    animals.push({
      id: "bird",
      description:
        "same small bird throughout the video, consistent feather colors and markings"
    });
  }

  if (has(t, ["snake"])) {
    animals.push({
      id: "snake",
      description:
        "same snake throughout the video, consistent scale pattern, body size and color"
    });
  }

  return animals;
}

// ------------------------------------------------------------
// LOCATION PARSER
// ------------------------------------------------------------

function detectLocations(story) {
  const t = story.toLowerCase();
  const locations = [];

  if (has(t, ["school", "classroom"])) {
    locations.push("school environment");
  }

  if (has(t, ["street", "road", "sidewalk"])) {
    locations.push("same city street and sidewalk");
  }

  if (has(t, ["city", "downtown"])) {
    locations.push("same busy city environment");
  }

  if (has(t, ["park"])) {
    locations.push("same public park");
  }

  if (has(t, ["forest", "woods"])) {
    locations.push("same forest environment");
  }

  if (has(t, ["home", "house", "bedroom", "room"])) {
    locations.push("same home interior");
  }

  if (has(t, ["office"])) {
    locations.push("same office environment");
  }

  if (has(t, ["hospital"])) {
    locations.push("same hospital environment");
  }

  if (has(t, ["village"])) {
    locations.push("same village environment");
  }

  if (has(t, ["mountain", "mountains"])) {
    locations.push("same mountain environment");
  }

  if (locations.length === 0) {
    locations.push("story-appropriate primary location");
  }

  return unique(locations);
}

// ------------------------------------------------------------
// OBJECT PARSER
// ------------------------------------------------------------

function detectObjects(story) {
  const t = story.toLowerCase();
  const objects = [];

  const map = [
    [["poster", "missing-pet poster"], "missing-pet poster"],
    [["shelter", "broken shelter"], "broken shelter"],
    [["collar"], "pet collar"],
    [["food", "pet food"], "pet food bowl"],
    [["towel", "dry"], "towel"],
    [["umbrella"], "umbrella"],
    [["phone", "mobile"], "mobile phone"],
    [["letter"], "letter"],
    [["photo", "picture"], "photograph"],
    [["backpack", "school bag"], "school backpack"],
    [["key"], "key"],
    [["car", "vehicle", "truck"], "story vehicle"]
  ];

  for (const [words, objectName] of map) {
    if (has(t, words)) objects.push(objectName);
  }

  return unique(objects);
}

// ------------------------------------------------------------
// CONDITION PARSER
// ------------------------------------------------------------

function detectConditions(story) {
  const t = story.toLowerCase();
  const conditions = [];

  if (has(t, ["rain", "rainstorm", "raining", "storm"])) {
    conditions.push("sudden rainstorm");
  }

  if (has(t, ["snow", "snowstorm"])) {
    conditions.push("snowy weather");
  }

  if (has(t, ["night", "midnight"])) {
    conditions.push("nighttime");
  }

  if (has(t, ["evening", "sunset"])) {
    conditions.push("evening light");
  }

  if (has(t, ["morning", "sunrise"])) {
    conditions.push("morning light");
  }

  if (has(t, ["dark"])) {
    conditions.push("dark atmospheric conditions");
  }

  return unique(conditions);
}

// ------------------------------------------------------------
// STORY EVENT PARSER
// ------------------------------------------------------------

function detectEvents(story) {
  const sentences = splitSentences(story);
  const events = [];

  for (const sentence of sentences) {
    const s = sentence.toLowerCase();

    if (
      has(s, [
        "walking home from school",
        "walks home from school",
        "walking home",
        "walk home"
      ])
    ) {
      events.push({
        type: "journey",
        text: "The main character walks home from school."
      });
    }

    if (
      has(s, [
        "rainstorm begins",
        "rain begins",
        "starts raining",
        "sudden rain",
        "caught in the rain"
      ])
    ) {
      events.push({
        type: "weather",
        text: "A sudden rainstorm begins."
      });
    }

    if (
      has(s, [
        "finds",
        "found",
        "discovers",
        "sees"
      ])
    ) {
      events.push({
        type: "discovery",
        text: sentence
      });
    }

    if (
      has(s, [
        "abandoned kitten",
        "lost kitten",
        "lost cat"
      ])
    ) {
      events.push({
        type: "animal_discovery",
        text: "The main character finds the abandoned kitten."
      });
    }

    if (
      has(s, [
        "abandoned puppy",
        "lost puppy",
        "lost dog"
      ])
    ) {
      events.push({
        type: "animal_discovery",
        text: "The main character finds the lost puppy."
      });
    }

    if (
      has(s, [
        "decides to protect",
        "protects",
        "save",
        "rescues",
        "rescue"
      ])
    ) {
      events.push({
        type: "rescue",
        text: sentence
      });
    }

    if (
      has(s, [
        "carries",
        "takes home",
        "brings home",
        "carry home"
      ])
    ) {
      events.push({
        type: "transport",
        text: sentence
      });
    }

    if (
      has(s, [
        "dries",
        "dry the",
        "dried"
      ])
    ) {
      events.push({
        type: "care",
        text: "The main character dries the rescued animal."
      });
    }

    if (
      has(s, [
        "gives it food",
        "gives food",
        "feeds",
        "feeding",
        "food"
      ])
    ) {
      events.push({
        type: "feeding",
        text: "The main character feeds the animal."
      });
    }

    if (
      has(s, [
        "missing-pet poster",
        "missing pet poster",
        "poster"
      ])
    ) {
      events.push({
        type: "clue",
        text: "A missing-pet poster provides a clue to the animal's owner."
      });
    }

    if (
      has(s, [
        "owner",
        "reunite",
        "reunites",
        "reunited",
        "reunion"
      ])
    ) {
      events.push({
        type: "reunion",
        text: "The animal is reunited with its owner."
      });
    }

    if (
      has(s, [
        "searches",
        "search",
        "looks for",
        "find the owner"
      ])
    ) {
      events.push({
        type: "search",
        text: sentence
      });
    }

    if (
      has(s, [
        "runs away",
        "runs off",
        "escapes",
        "chase",
        "chases"
      ])
    ) {
      events.push({
        type: "chase",
        text: sentence
      });
    }

    if (
      has(s, [
        "builds",
        "build",
        "constructs",
        "construction"
      ])
    ) {
      events.push({
        type: "building",
        text: sentence
      });
    }

    if (
      has(s, [
        "falls",
        "gets hurt",
        "injured",
        "danger"
      ])
    ) {
      events.push({
        type: "danger",
        text: sentence
      });
    }
  }

  return events;
}

// ------------------------------------------------------------
// SPECIAL STORY SEQUENCES
// ------------------------------------------------------------

function buildSpecialSequence(story) {
  const t = story.toLowerCase();

  // Lost kitten + rain + owner + poster
  if (
    t.includes("kitten") &&
    t.includes("owner") &&
    t.includes("poster") &&
    has(t, ["rain", "rainstorm"])
  ) {
    return [
      {
        type: "journey_weather",
        text: "The boy walks home from school when a sudden rainstorm begins."
      },
      {
        type: "kitten_discovery",
        text: "The boy finds an abandoned kitten under a broken shelter."
      },
      {
        type: "protection",
        text: "The boy decides to protect the kitten from the rain."
      },
      {
        type: "home_care",
        text: "The boy carries the kitten home, dries it and gives it food."
      },
      {
        type: "poster_clue",
        text: "The boy discovers a missing-pet poster and identifies the kitten's owner."
      },
      {
        type: "reunion",
        text: "The boy reunites the kitten with its owner."
      }
    ];
  }

  // Lost puppy + owner
  if (
    has(t, ["puppy", "dog"]) &&
    t.includes("owner") &&
    has(t, ["lost", "missing"])
  ) {
    return [
      {
        type: "discovery",
        text: "The main character notices the lost puppy."
      },
      {
        type: "rescue",
        text: "The main character approaches the puppy and keeps it safe."
      },
      {
        type: "clue",
        text: "The main character searches for information that can identify the owner."
      },
      {
        type: "search",
        text: "The main character follows the available clue to find the owner."
      },
      {
        type: "reunion",
        text: "The puppy is reunited with its owner."
      }
    ];
  }

  return null;
}

// ------------------------------------------------------------
// STORY UNDERSTANDING
// ------------------------------------------------------------

function understandStory(story) {
  const characters = detectCharacters(story);
  const animals = detectAnimals(story);
  const locations = detectLocations(story);
  const objects = detectObjects(story);
  const conditions = detectConditions(story);
  const events = detectEvents(story);
  const specialSequence = buildSpecialSequence(story);

  let goal = "Complete the main objective described by the story.";
  let conflict = "The main character must overcome the challenge described by the story.";

  const t = story.toLowerCase();

  if (t.includes("reunite") || t.includes("owner")) {
    goal = "Find the animal's owner and complete the reunion.";
  } else if (has(t, ["rescue", "save", "protect"])) {
    goal = "Protect or rescue the person or animal in danger.";
  } else if (has(t, ["build", "construct"])) {
    goal = "Complete the building or construction objective.";
  } else if (has(t, ["find", "discover", "search"])) {
    goal = "Find the important person, object or answer described in the story.";
  }

  if (has(t, ["rain", "storm", "snow"])) {
    conflict = "Severe weather creates an obstacle.";
  } else if (has(t, ["lost", "abandoned", "missing"])) {
    conflict = "Someone or something is lost or separated.";
  } else if (has(t, ["villain", "enemy", "danger", "attacker"])) {
    conflict = "A dangerous opposing force creates the main obstacle.";
  }

  return {
    characters,
    animals,
    locations,
    objects,
    conditions,
    events,
    specialSequence,
    goal,
    conflict,
    climax:
      specialSequence?.find(e =>
        ["poster_clue", "reunion"].includes(e.type)
      )?.text || "The main story objective reaches its decisive moment.",
    resolution:
      specialSequence?.find(e => e.type === "reunion")?.text ||
      "The story reaches a natural resolution."
  };
}

// ------------------------------------------------------------
// CHARACTER LOCK
// ------------------------------------------------------------

function buildCharacterLock(understanding) {
  const lines = [];

  for (const c of understanding.characters) {
    lines.push(
      `${c.role.toUpperCase()}: ${c.description}. This identity is permanent throughout the entire video. Never change face, age, hairstyle, hair color, eye color, skin tone, body proportions or clothing.`
    );
  }

  for (const a of understanding.animals) {
    lines.push(
      `ANIMAL LOCK: ${a.id}: ${a.description}. Never change fur/feather/scale pattern, color, eyes, body size or markings.`
    );
  }

  if (!lines.length) {
    lines.push(
      "CHARACTER LOCK: Any character introduced in Scene 1 must remain visually identical throughout the entire video."
    );
  }

  return lines.join(" ");
}

// ------------------------------------------------------------
// STORY ELEMENT LOCK
// ------------------------------------------------------------

function buildStoryElementLock(understanding) {
  const parts = [];

  if (understanding.locations.length) {
    parts.push(
      `LOCATIONS: ${understanding.locations.join(", ")}. Keep geography and recognizable details consistent.`
    );
  }

  if (understanding.objects.length) {
    parts.push(
      `OBJECTS: ${understanding.objects.join(", ")}. Keep appearance, size, color and physical details consistent.`
    );
  }

  if (understanding.conditions.length) {
    parts.push(
      `CONDITIONS: ${understanding.conditions.join(", ")}. Maintain logical weather and time continuity.`
    );
  }

  return parts.join(" ");
}

// ------------------------------------------------------------
// DIALOGUE ENGINE
// ------------------------------------------------------------

function dialogueFor(type, story) {
  const t = story.toLowerCase();

  if (type === "journey_weather") {
    return "I need to get home before this gets worse.";
  }

  if (type === "kitten_discovery") {
    return "Wait... there's a kitten under there.";
  }

  if (type === "protection") {
    return "Come on, little one. I'll keep you safe.";
  }

  if (type === "home_care") {
    return "Let's get you warm, dry, and fed.";
  }

  if (type === "poster_clue") {
    return "Wait... this missing-pet poster is you.";
  }

  if (type === "reunion") {
    return "We found your kitten. She's safe.";
  }

  if (type === "discovery") {
    return "Wait... what is that?";
  }

  if (type === "rescue") {
    return "Stay with me. I'll get you somewhere safe.";
  }

  if (type === "transport") {
    return "Come on. We're getting out of here.";
  }

  if (type === "care") {
    return "You're safe now. Just get comfortable.";
  }

  if (type === "feeding") {
    return "Here you go. You must be hungry.";
  }

  if (type === "clue") {
    return "This could be the clue I've been looking for.";
  }

  if (type === "search") {
    return "Let's follow this clue and find them.";
  }

  if (type === "chase") {
    return "Stop! I've got to catch up!";
  }

  if (type === "building") {
    return "One step at a time. We can finish this.";
  }

  if (type === "danger") {
    return "Stay behind me. I'll handle this.";
  }

  if (type === "journey") {
    return "I just need to keep moving.";
  }

  return "I know what I need to do.";
}

// ------------------------------------------------------------
// VOICEOVER ENGINE
// ------------------------------------------------------------

function voiceoverFor(type) {
  const map = {
    journey_weather:
      "A simple walk home suddenly became a race against the storm.",

    kitten_discovery:
      "Beneath the broken shelter, he discovered a tiny abandoned kitten.",

    protection:
      "Instead of walking away, he chose to protect the helpless animal.",

    home_care:
      "He carried the kitten home, dried her carefully, and gave her food.",

    poster_clue:
      "Then a missing-pet poster revealed a possible path back to her owner.",

    reunion:
      "After the search, the kitten finally returned to the person who had been looking for her.",

    discovery:
      "Something unexpected caught the main character's attention.",

    rescue:
      "The main character chooses to step in and help.",

    transport:
      "The next step is to move the rescued character or object to safety.",

    care:
      "The situation becomes safer as the main character provides care.",

    feeding:
      "A small act of kindness helps the rescued animal recover.",

    clue:
      "An important clue changes the direction of the story.",

    search:
      "The search continues using the new information.",

    chase:
      "The situation suddenly becomes more urgent.",

    building:
      "The main character keeps working toward the goal.",

    danger:
      "A dangerous moment forces the main character to act quickly.",

    journey:
      "The main character continues toward the story's objective."
  };

  return map[type] || "The story moves forward as the main character faces the next challenge.";
}

// ------------------------------------------------------------
// VISUAL PROMPT ENGINE
// ------------------------------------------------------------

function visualFor(event, understanding, sceneNumber, totalScenes, aspectRatio) {
  const characterLock = buildCharacterLock(understanding);
  const elementLock = buildStoryElementLock(understanding);

  return [
    `MASTER CHARACTER LOCK: ${characterLock}`,
    `STORY ELEMENT LOCK: ${elementLock}`,
    `ORIGINAL USER STORY: "${cleanText(understanding.originalStory || "")}"`,
    `SCENE ${sceneNumber} OF ${totalScenes}.`,
    `STORY EVENT: ${event.text}`,
    "This scene must visually show the actual story event above. Do not substitute a generic event.",
    "Use only story-relevant characters, animals, objects and locations.",
    "Natural cinematic movement, realistic facial expressions, believable physics, detailed production design and cinematic movie quality.",
    `Aspect ratio: ${aspectRatio}.`,
    "Exactly 10 seconds of continuous visual storytelling."
  ].join(" ");
}

// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

function cameraFor(type) {
  if (["reunion", "poster_clue", "protection"].includes(type)) {
    return "Cinematic medium shot with a slow emotional push-in, followed by natural character movement.";
  }

  if (["journey_weather", "journey"].includes(type)) {
    return "Natural cinematic tracking shot following the main character through the environment.";
  }

  if (["discovery", "kitten_discovery", "clue"].includes(type)) {
    return "Wide establishing shot followed by a smooth cinematic push toward the important story element.";
  }

  if (["chase", "danger"].includes(type)) {
    return "Dynamic handheld-style cinematic tracking shot with controlled motion and clear subject framing.";
  }

  return "Natural cinematic medium shot following the main action.";
}

// ------------------------------------------------------------
// LIGHTING
// ------------------------------------------------------------

function lightingFor(understanding, type) {
  if (type === "journey_weather" || understanding.conditions.includes("sudden rainstorm")) {
    return "Natural overcast storm lighting, realistic wet surfaces, soft shadows and consistent rainy atmosphere.";
  }

  if (understanding.conditions.includes("nighttime")) {
    return "Cinematic nighttime lighting with realistic practical lights and controlled shadows.";
  }

  if (understanding.conditions.includes("evening light")) {
    return "Warm cinematic evening light with consistent long shadows.";
  }

  return "Natural cinematic lighting with realistic shadows and consistent time-of-day continuity.";
}

// ------------------------------------------------------------
// ACTION
// ------------------------------------------------------------

function actionFor(event) {
  return `${event.text} Complete the action naturally within exactly 10 seconds. Avoid unrelated actions.`;
}

// ------------------------------------------------------------
// SCENE GENERATOR
// ------------------------------------------------------------

function buildScenes(story, duration, aspectRatio) {
  const seconds = durationToSeconds(duration);
  const totalScenes = createSceneCount(seconds);

  const understanding = understandStory(story);
  understanding.originalStory = story;

  let sequence = understanding.specialSequence;

  if (!sequence || sequence.length === 0) {
    sequence = understanding.events.map(e => ({
      type: e.type,
      text: e.text
    }));
  }

  if (sequence.length === 0) {
    sequence = [
      {
        type: "journey",
        text: "The main character begins the story and moves toward the main objective."
      },
      {
        type: "discovery",
        text: "The main character encounters the central situation described in the story."
      },
      {
        type: "conflict",
        text: "The main challenge becomes clear."
      },
      {
        type: "rescue",
        text: "The main character takes action to solve the problem."
      },
      {
        type: "clue",
        text: "New information helps move the story toward its objective."
      },
      {
        type: "reunion",
        text: "The main objective reaches a natural resolution."
      }
    ];
  }

  // For short videos, preserve the most important story events.
  // For longer videos, repeat no event unnecessarily; distribute story events
  // across the available 10-second scenes.
  let selectedEvents = [];

  if (totalScenes <= sequence.length) {
    selectedEvents = sequence.slice(0, totalScenes);
  } else {
    selectedEvents = [...sequence];

    while (selectedEvents.length < totalScenes) {
      const index = selectedEvents.length % sequence.length;
      const base = sequence[index];

      selectedEvents.push({
        type: base.type,
        text: `${base.text} The scene continues naturally, showing the immediate consequence of this event.`
      });
    }
  }

  const scenes = selectedEvents.map((event, index) => {
    const sceneNumber = index + 1;
    const start = index * 10;
    const end = start + 10;

    return {
      scene_number: sceneNumber,
      start_time: `${start}s`,
      end_time: `${end}s`,
      duration: 10,

      event_type: event.type,
      story_event: event.text,

      visual_prompt: visualFor(
        event,
        understanding,
        sceneNumber,
        totalScenes,
        aspectRatio
      ),

      camera: cameraFor(event.type),

      lighting: lightingFor(understanding, event.type),

      action: actionFor(event),

      dialogue: dialogueFor(event.type, story),

      voiceover: voiceoverFor(event.type),

      continuity:
        sceneNumber === 1
          ? "Establish the permanent character identity, story elements, location, weather, time of day and starting situation."
          : "Continue directly from the previous scene. Maintain the MASTER CHARACTER LOCK exactly. Keep all characters, animals, objects, locations, weather, lighting and physical details consistent. Begin from the previous scene's ending state."
    };
  });

  return {
    duration_seconds: seconds,
    duration: `${seconds} seconds`,
    total_scenes: totalScenes,
    aspect_ratio: aspectRatio,
    story_understanding: understanding,
    scenes
  };
}

// ------------------------------------------------------------
// TEST
// ------------------------------------------------------------

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "SANAPTAI V9 server is working"
  });
});

// ------------------------------------------------------------
// DEMO PROJECT
// NO GEMINI REQUEST
// ------------------------------------------------------------

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt,
      duration = "30 sec",
      aspectRatio = "16:9"
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        error: "Please enter a story prompt."
      });
    }

    const project = buildScenes(
      String(prompt).trim(),
      duration,
      aspectRatio || "16:9"
    );

    res.json({
      success: true,
      mode: "demo",
      message: "SANAPTAI V9 project created successfully.",
      ...project
    });
  } catch (error) {
    console.error("Demo Project Error:", error);

    res.status(500).json({
      error: "Project creation failed.",
      details: error.message
    });
  }
});

// ------------------------------------------------------------
// AI STORY PLANNER
// FUTURE MODE — USES GEMINI ONLY WHEN CALLED
// ------------------------------------------------------------

app.post("/api/plan-scenes", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server."
      });
    }

    const {
      prompt,
      duration = "30 sec",
      aspectRatio = "16:9"
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        error: "Please enter a story prompt."
      });
    }

    const seconds = durationToSeconds(duration);
    const sceneCount = createSceneCount(seconds);

    const systemInstruction = `
You are SANAPTAI V9 Story Planning Engine.

Convert the user's story into exactly ${sceneCount} scenes.

ABSOLUTE RULES:
1. Every scene is exactly 10 seconds.
2. Preserve the actual events from the user's story.
3. Do not invent unrelated events.
4. Create a MASTER CHARACTER LOCK.
5. Create an ANIMAL LOCK when animals exist.
6. Create a LOCATION LOCK.
7. Create an OBJECT LOCK.
8. Maintain continuity from one scene to the next.
9. Dialogue must be short enough to speak naturally within 10 seconds.
10. Voiceover must also fit within 10 seconds.
11. Output valid JSON only.

Required JSON structure:
{
  "story_understanding": {
    "characters": [],
    "animals": [],
    "locations": [],
    "objects": [],
    "goal": "",
    "conflict": "",
    "climax": "",
    "resolution": ""
  },
  "scenes": [
    {
      "scene_number": 1,
      "start_time": "0s",
      "end_time": "10s",
      "duration": 10,
      "story_event": "",
      "visual_prompt": "",
      "camera": "",
      "lighting": "",
      "action": "",
      "dialogue": "",
      "voiceover": "",
      "continuity": ""
    }
  ]
}
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                `${systemInstruction}\n\n` +
                `Aspect ratio: ${aspectRatio}\n` +
                `Duration: ${seconds} seconds\n\n` +
                `USER STORY:\n${String(prompt).trim()}`
            }
          ]
        }
      ]
    });

    const raw = result.text || "";

    let parsed;

    try {
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({
        error: "AI returned invalid JSON.",
        raw
      });
    }

    res.json({
      success: true,
      mode: "ai",
      duration_seconds: seconds,
      duration: `${seconds} seconds`,
      total_scenes: sceneCount,
      aspect_ratio: aspectRatio,
      ...parsed
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(500).json({
      error: "AI story planning failed.",
      details: error.message
    });
  }
});

// ------------------------------------------------------------
// CREATE PROJECT
// ------------------------------------------------------------

app.post("/api/create-project", (req, res) => {
  try {
    const {
      prompt,
      duration = "30 sec",
      aspectRatio = "16:9"
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        error: "Please enter a story prompt."
      });
    }

    const project = buildScenes(
      String(prompt).trim(),
      duration,
      aspectRatio || "16:9"
    );

    res.json({
      success: true,
      ...project
    });
  } catch (error) {
    console.error("Create Project Error:", error);

    res.status(500).json({
      error: "Project creation failed.",
      details: error.message
    });
  }
});

// ------------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------------

app.get("/", (req, res) => {
  res.send("SANAPTAI V9 is running.");
});

// ------------------------------------------------------------
// SERVER
// ------------------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SANAPTAI V9 running on port ${PORT}`);
});
