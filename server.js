import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const ENGINE_VERSION = "V21";
const DEMO_MODE = true;
const GEMINI_ENABLED = false;

const ALLOWED_DURATIONS = [10, 30, 60, 300, 600, 1200];
const SCENE_SECONDS = 10;

/* =========================================================
   BASIC UTILITIES
========================================================= */

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\.\.+/g, ".")
    .trim();
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sceneTimes(index) {
  const start = index * SCENE_SECONDS;
  const end = start + SCENE_SECONDS;

  const format = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return {
    start_time: format(start),
    end_time: format(end)
  };
}

/* =========================================================
   CHARACTER SYSTEM
========================================================= */

const DEFAULT_CHARACTER = {
  name: "Main Character",
  description:
    "Keep the same face, age, hairstyle, clothing, body proportions, and visual identity throughout the entire story."
};

function normalizeCharacter(character) {
  return {
    name: cleanText(character?.name || DEFAULT_CHARACTER.name),
    description: cleanText(
      character?.description || DEFAULT_CHARACTER.description
    )
  };
}

/* =========================================================
   STORY EXTRACTION
========================================================= */

function splitStoryIntoSentences(prompt) {
  return cleanText(prompt)
    .split(/(?<=[.!?])\s+/)
    .map((x) => cleanText(x))
    .filter((x) => x.length > 3);
}

function detectCharacters(prompt) {
  const text = cleanText(prompt);

  const characters = [];

  const knownNames = [
    "Noah",
    "Ethan",
    "Aarav",
    "Nishant",
    "Aanya",
    "Hanuman",
    "Ram",
    "Rahul",
    "Mohan",
    "Kabir",
    "Meera",
    "Arjun"
  ];

  for (const name of knownNames) {
    const regex = new RegExp(`\\b${name}\\b`, "i");

    if (regex.test(text)) {
      characters.push({
        name,
        description: `${name}. Maintain exact identity, face, age, hairstyle, clothing, body proportions, and visual appearance throughout the story.`
      });
    }
  }

  if (!characters.length) {
    characters.push(DEFAULT_CHARACTER);
  }

  return characters.map(normalizeCharacter);
}

function detectLocations(prompt) {
  const text = cleanText(prompt).toLowerCase();

  const locations = [];

  const locationRules = [
    ["coastal town", "Coastal Town"],
    ["town", "Town"],
    ["village", "Village"],
    ["forest", "Forest"],
    ["cabin", "Cabin"],
    ["lighthouse", "Lighthouse"],
    ["workshop", "Workshop"],
    ["mountain", "Mountain"],
    ["harbor", "Harbor"],
    ["harbour", "Harbor"],
    ["house", "House"],
    ["home", "Home"],
    ["city", "City"],
    ["street", "Street"],
    ["road", "Road"]
  ];

  for (const [keyword, label] of locationRules) {
    if (text.includes(keyword)) {
      locations.push(label);
    }
  }

  return unique(locations);
}

function detectObjects(prompt) {
  const text = cleanText(prompt).toLowerCase();

  const objects = [];

  const objectRules = [
    ["journal", "Journal"],
    ["map", "Map"],
    ["box", "Box"],
    ["phone", "Phone"],
    ["water", "Water"],
    ["signal", "Signal"],
    ["mechanism", "Mechanism"],
    ["tool", "Tools"],
    ["tools", "Tools"],
    ["boat", "Rescue Boat"],
    ["car", "Vehicle"],
    ["truck", "Vehicle"],
    ["backpack", "Backpack"],
    ["photo", "Photo"]
  ];

  for (const [keyword, label] of objectRules) {
    if (text.includes(keyword)) {
      objects.push(label);
    }
  }

  return unique(objects);
}

/* =========================================================
   EVENT CLASSIFICATION
========================================================= */

function classifyEvent(sentence) {
  const s = sentence.toLowerCase();

  if (
    /\b(lives|home|town|family|father|mother|friend)\b/.test(s) &&
    !/\b(find|discover|warn|fight|rescue|repair|escape)\b/.test(s)
  ) {
    return "setup";
  }

  if (/\b(find|finds|discover|discovers|sees|notices|hears)\b/.test(s)) {
    return "discovery";
  }

  if (/\b(read|reads|learns|realizes|understands|recognizes)\b/.test(s)) {
    return "realization";
  }

  if (/\b(decides|decide|chooses|tries|attempts)\b/.test(s)) {
    return "decision";
  }

  if (
    /\b(warn|warning|believe|believes|refuse|refuses|doubt|doubts)\b/.test(s)
  ) {
    return "conflict";
  }

  if (/\b(walk|walks|runs|runs|goes|go|travels|moves|climbs|enters)\b/.test(s)) {
    return "movement";
  }

  if (
    /\b(repair|repairs|fix|fixes|build|builds|opens|calls|gives|helps)\b/.test(
      s
    )
  ) {
    return "action";
  }

  if (
    /\b(storm|danger|dangerous|attack|fight|chase|trapped|escape)\b/.test(s)
  ) {
    return "climax";
  }

  if (/\b(rescue|rescues|saved|save|safe|safely)\b/.test(s)) {
    return "rescue";
  }

  if (
    /\b(by morning|sunrise|finally|after|returns|return|home safely)\b/.test(s)
  ) {
    return "resolution";
  }

  return "story";
}

/* =========================================================
   STORY EVENTS
========================================================= */

function buildStoryEvents(prompt) {
  const sentences = splitStoryIntoSentences(prompt);

  return sentences.map((sentence, index) => ({
    id: `E${String(index + 1).padStart(3, "0")}`,
    order: index + 1,
    source: sentence,
    type: classifyEvent(sentence),
    characters: [],
    location: null,
    objects: [],
    action: sentence
  }));
}

/* =========================================================
   EVENT CONTEXT ENGINE
========================================================= */

function inferEventLocation(event, locations) {
  const s = event.source.toLowerCase();

  const locationRules = [
    ["lighthouse", "Lighthouse"],
    ["workshop", "Workshop"],
    ["harbor", "Harbor"],
    ["harbour", "Harbor"],
    ["cabin", "Cabin"],
    ["forest", "Forest"],
    ["mountain", "Mountain"],
    ["village", "Village"],
    ["town", "Coastal Town"],
    ["street", "Street"],
    ["home", "Home"],
    ["house", "House"]
  ];

  for (const [keyword, location] of locationRules) {
    if (s.includes(keyword)) {
      return location;
    }
  }

  return locations[0] || "Story Location";
}

function inferEventObjects(event, objects) {
  const s = event.source.toLowerCase();

  return objects.filter((object) => {
    const o = object.toLowerCase();

    if (o === "journal") {
      return /\b(journal|warning)\b/.test(s);
    }

    if (o === "signal") {
      return /\bsignal\b/.test(s);
    }

    if (o === "mechanism") {
      return /\bmechanism\b/.test(s);
    }

    if (o === "tools") {
      return /\b(tool|tools|repair|fix)\b/.test(s);
    }

    if (o === "rescue boat") {
      return /\bboat\b/.test(s);
    }

    return s.includes(o);
  });
}

function inferEventCharacters(event, characters) {
  const s = event.source.toLowerCase();

  const matched = characters.filter((character) =>
    s.includes(character.name.toLowerCase())
  );

  if (matched.length) {
    return matched.map((x) => x.name);
  }

  return characters.slice(0, 1).map((x) => x.name);
}

function enrichEvents(events, characters, locations, objects) {
  return events.map((event) => ({
    ...event,
    characters: inferEventCharacters(event, characters),
    location: inferEventLocation(event, locations),
    objects: inferEventObjects(event, objects)
  }));
}

/* =========================================================
   SUB-BEAT ENGINE
========================================================= */

function createSubBeats(event) {
  const source = cleanText(event.source);

  switch (event.type) {
    case "setup":
      return [
        {
          phase: "establish",
          action: source,
          sourceEvent: event.id
        },
        {
          phase: "observe",
          action: source,
          sourceEvent: event.id
        }
      ];

    case "discovery":
      return [
        {
          phase: "notice",
          action: source,
          sourceEvent: event.id
        },
        {
          phase: "examine",
          action: source,
          sourceEvent: event.id
        }
      ];

    case "realization":
      return [
        {
          phase: "understand",
          action: source,
          sourceEvent: event.id
        },
        {
          phase: "react",
          action: source,
          sourceEvent: event.id
        }
      ];

    case "decision":
      return [
        {
          phase: "decide",
          action: source,
          sourceEvent: event.id
        },
        {
          phase: "commit",
          action: source,
          sourceEvent: event.id
        }
      ];

    case "conflict":
      return [
        {
          phase: "confront",
          action: source,
          sourceEvent: event.id
        },
        {
          phase: "reaction",
          action: source,
          sourceEvent: event.id
        }
      ];

    case "movement":
      return [
        {
          phase: "move",
          action: source,
          sourceEvent: event.id
        },
        {
          phase: "arrive",
          action: source,
          sourceEvent: event.id
        }
      ];

    case "action":
      return [
        {
          phase: "begin",
          action: source,
          sourceEvent: event.id
        },
        {
          phase: "perform",
          action: source,
          sourceEvent: event.id
        }
      ];

    case "climax":
      return [
        {
          phase: "danger",
          action: source,
          sourceEvent: event.id
        },
        {
          phase: "critical",
          action: source,
          sourceEvent: event.id
        }
      ];

    case "rescue":
      return [
        {
          phase: "rescue",
          action: source,
          sourceEvent: event.id
        },
        {
          phase: "safety",
          action: source,
          sourceEvent: event.id
        }
      ];

    case "resolution":
      return [
        {
          phase: "aftermath",
          action: source,
          sourceEvent: event.id
        },
        {
          phase: "resolution",
          action: source,
          sourceEvent: event.id
        }
      ];

    default:
      return [
        {
          phase: "main",
          action: source,
          sourceEvent: event.id
        },
        {
          phase: "detail",
          action: source,
          sourceEvent: event.id
        }
      ];
  }
}

/* =========================================================
   STORY PHASE
========================================================= */

function getStoryPhase(events, eventIndex) {
  const total = Math.max(events.length - 1, 1);
  const progress = eventIndex / total;

  if (progress < 0.15) return "setup";
  if (progress < 0.35) return "development";
  if (progress < 0.60) return "conflict";
  if (progress < 0.82) return "climax";
  if (progress < 0.94) return "resolution";
  return "final";
}

/* =========================================================
   CAMERA ENGINE
========================================================= */

function cameraForEvent(event, beat) {
  const type = event.type;

  if (type === "setup") {
    return beat === "establish"
      ? "Wide cinematic establishing shot showing the environment and characters."
      : "Medium cinematic shot showing the characters naturally within the location.";
  }

  if (type === "discovery") {
    return beat === "notice"
      ? "Medium shot showing the character noticing the story-relevant object."
      : "Over-the-shoulder close-up showing the character examining the story-relevant object.";
  }

  if (type === "realization") {
    return "Medium close-up focused on the character's reaction while keeping the relevant story object visible.";
  }

  if (type === "decision") {
    return "Medium cinematic shot focused on the character making the decision.";
  }

  if (type === "conflict") {
    return beat === "confront"
      ? "Medium-wide shot showing the characters facing each other."
      : "Wide reaction shot showing the disagreement within the environment.";
  }

  if (type === "movement") {
    return beat === "move"
      ? "Wide tracking shot following the character's movement."
      : "Medium arrival shot showing the character reaching the story location.";
  }

  if (type === "action") {
    return "Detailed cinematic close-up showing the character performing the exact task.";
  }

  if (type === "climax") {
    return "Dynamic cinematic shot emphasizing the immediate danger without adding unrelated events.";
  }

  if (type === "rescue") {
    return "Wide cinematic shot clearly showing the rescue and the characters involved.";
  }

  if (type === "resolution") {
    return "Wide emotional cinematic shot showing the characters in the resolved environment.";
  }

  return "Medium cinematic shot focused on the exact story action.";
}

/* =========================================================
   LIGHTING ENGINE
========================================================= */

function lightingForEvent(event, previousEvent = null) {
  const text = `${event.source} ${previousEvent?.source || ""}`.toLowerCase();

  if (/\bstorm|heavy rain|strong wind|danger\b/.test(text)) {
    return "Dramatic storm lighting with dark overcast sky, strong rain, cool realistic tones, and natural environmental shadows.";
  }

  if (/\bsunrise|morning after|by morning|after the storm|safe\b/.test(text)) {
    return "Peaceful clear morning lighting, soft natural sunlight, calm atmosphere, realistic soft shadows.";
  }

  if (event.location === "Workshop") {
    return "Warm natural morning workshop lighting, calm weather, realistic soft shadows.";
  }

  if (event.location === "Lighthouse") {
    return "Natural coastal daylight with realistic lighthouse interior illumination and soft environmental shadows.";
  }

  return "Clear natural daytime lighting with realistic soft shadows.";
}

/* =========================================================
   DIALOGUE ENGINE
========================================================= */

function createDialogue(event) {
  const type = event.type;

  if (type === "setup") {
    return "This place has always felt like home.";
  }

  if (type === "discovery") {
    return "What is this?";
  }

  if (type === "realization") {
    return "This warning is serious.";
  }

  if (type === "decision") {
    return "I have to do something.";
  }

  if (type === "conflict") {
    return "Please, you have to believe me.";
  }

  if (type === "movement") {
    return "I need to get there now.";
  }

  if (type === "action") {
    return "I can't give up.";
  }

  if (type === "climax") {
    return "Stay calm. We've got this.";
  }

  if (type === "rescue") {
    return "You're safe now.";
  }

  if (type === "resolution") {
    return "It's finally over.";
  }

  return "";
}

/* =========================================================
   VOICEOVER ENGINE
========================================================= */

function createVoiceover(event) {
  return cleanText(event.source);
}

/* =========================================================
   CHARACTER LOCK
========================================================= */

function buildCharacterLock(characters) {
  return characters
    .map(
      (character) =>
        `${character.name}: ${character.description}`
    )
    .join(" | ");
}

/* =========================================================
   SCENE VISUAL PROMPT
========================================================= */

function buildVisualPrompt({
  event,
  beat,
  sceneNumber,
  characters,
  previousEvent
}) {
  const characterNames = event.characters.length
    ? event.characters.join(", ")
    : characters.map((x) => x.name).join(", ");

  const characterLock = buildCharacterLock(characters);

  const location = event.location || "Story Location";

  const props =
    event.objects.length > 0
      ? `Required story-relevant props only: ${event.objects.join(", ")}.`
      : "No unnecessary props.";

  const camera = cameraForEvent(event, beat.phase);

  const lighting = lightingForEvent(event, previousEvent);

  return [
    "Cinematic 16:9 video scene.",
    `Scene ${sceneNumber}.`,
    `Exact story action: ${event.action}.`,
    `Characters: ${characterNames}.`,
    `Location: ${location}.`,
    props,
    `Camera: ${camera}`,
    `Lighting: ${lighting}`,
    `Character continuity: ${characterLock}`,
    "Show only the exact story action stated in this scene.",
    "Do not introduce unrelated people, vehicles, animals, objects, locations, or events.",
    "Do not introduce characters before they are required by the story.",
    "Preserve chronological story order.",
    "Do not describe future actions.",
    "Do not describe preparation for a future scene.",
    "Do not use meta wording such as continue the story, develop this event, prepare for next action, or story continues.",
    "Maintain exact character identity, face, age, hairstyle, clothing, body proportions, and visual style throughout the entire video."
  ].join(" ");
}

/* =========================================================
   TIMELINE BUILDER
========================================================= */

function buildTimeline(events, durationSeconds) {
  const requiredScenes = durationSeconds / SCENE_SECONDS;

  if (events.length === 0) {
    return [];
  }

  /*
    First pass:
    every source event gets chronological sub-beats.
  */

  const expanded = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const subBeats = createSubBeats(event);

    for (const beat of subBeats) {
      expanded.push({
        event,
        beat,
        eventIndex: i
      });
    }
  }

  /*
    If the story is shorter than the requested video,
    distribute scenes across the existing chronological events.
    Never reset to event 1.
  */

  const timeline = [];

  for (let i = 0; i < requiredScenes; i++) {
    const sourceIndex = Math.floor(
      (i / requiredScenes) * expanded.length
    );

    const safeIndex = clamp(
      sourceIndex,
      0,
      expanded.length - 1
    );

    timeline.push(expanded[safeIndex]);
  }

  return timeline;
}

/* =========================================================
   VALIDATOR
========================================================= */

function validateScene(scene, previousScene, allEvents) {
  const errors = [];

  if (!scene.action) {
    errors.push("missing_action");
  }

  if (!scene.location) {
    errors.push("missing_location");
  }

  if (!scene.visual_prompt) {
    errors.push("missing_visual_prompt");
  }

  if (scene.scene_number > 1 && previousScene) {
    const currentEventOrder = scene.event_order;
    const previousEventOrder = previousScene.event_order;

    if (currentEventOrder < previousEventOrder) {
      errors.push("chronology_reversed");
    }
  }

  const finalEvent = allEvents[allEvents.length - 1];

  const isFinalEvent =
    finalEvent &&
    scene.event_id === finalEvent.id;

  if (!isFinalEvent && scene.type === "resolution") {
    errors.push("premature_resolution");
  }

  if (
    /continue the story|story continues|prepare for|next scene|develop this event/i.test(
      scene.visual_prompt
    )
  ) {
    errors.push("meta_wording");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/* =========================================================
   AUTO-FIX
========================================================= */

function autoFixScene(scene, previousScene, allEvents) {
  const fixed = { ...scene };

  const event = allEvents.find(
    (x) => x.id === fixed.event_id
  );

  if (!event) {
    return fixed;
  }

  fixed.location = event.location;
  fixed.characters = event.characters;
  fixed.objects = event.objects;

  fixed.camera = cameraForEvent(
    event,
    fixed.beat_phase
  );

  fixed.lighting = lightingForEvent(
    event,
    previousScene
      ? allEvents.find((x) => x.id === previousScene.event_id)
      : null
  );

  fixed.action = event.action;
  fixed.dialogue = createDialogue(event);
  fixed.voiceover = createVoiceover(event);

  fixed.visual_prompt = buildVisualPrompt({
    event,
    beat: {
      phase: fixed.beat_phase
    },
    sceneNumber: fixed.scene_number,
    characters: fixed.character_objects,
    previousEvent: previousScene
      ? allEvents.find((x) => x.id === previousScene.event_id)
      : null
  });

  return fixed;
}

/* =========================================================
   SCENE CREATION
========================================================= */

function createScenes(prompt, durationSeconds, aspectRatio) {
  const characters = detectCharacters(prompt);
  const locations = detectLocations(prompt);
  const objects = detectObjects(prompt);

  let events = buildStoryEvents(prompt);

  events = enrichEvents(
    events,
    characters,
    locations,
    objects
  );

  const timeline = buildTimeline(
    events,
    durationSeconds
  );

  const scenes = [];

  for (let i = 0; i < timeline.length; i++) {
    const item = timeline[i];
    const event = item.event;
    const beat = item.beat;

    const time = sceneTimes(i);

    const scene = {
      scene_number: i + 1,
      start_time: time.start_time,
      end_time: time.end_time,
      duration: 10,

      aspect_ratio: aspectRatio,

      event_id: event.id,
      event_order: event.order,
      type: event.type,
      beat_phase: beat.phase,

      characters: event.characters,
      character_objects: characters,

      location: event.location,
      objects: event.objects,

      visual_prompt: buildVisualPrompt({
        event,
        beat,
        sceneNumber: i + 1,
        characters,
        previousEvent:
          i > 0
            ? timeline[i - 1].event
            : null
      }),

      camera: cameraForEvent(
        event,
        beat.phase
      ),

      lighting: lightingForEvent(
        event,
        i > 0
          ? timeline[i - 1].event
          : null
      ),

      action: event.action,

      dialogue: createDialogue(event),

      voiceover: createVoiceover(event),

      continuity:
        "Maintain exact character identity, face, age, hairstyle, clothing, body proportions, location continuity, and story chronology."
    };

    scenes.push(scene);
  }

  /*
    Validation + automatic correction
  */

  for (let i = 0; i < scenes.length; i++) {
    const previous = i > 0 ? scenes[i - 1] : null;

    const result = validateScene(
      scenes[i],
      previous,
      events
    );

    if (!result.valid) {
      scenes[i] = autoFixScene(
        scenes[i],
        previous,
        events
      );
    }
  }

  /*
    Final safety pass:
    guarantee exact chronological event order.
  */

  for (let i = 1; i < scenes.length; i++) {
    if (
      scenes[i].event_order <
      scenes[i - 1].event_order
    ) {
      scenes[i].event_order =
        scenes[i - 1].event_order;
    }
  }

  return {
    characters,
    locations,
    objects,
    events,
    scenes
  };
}

/* =========================================================
   API
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    engine: ENGINE_VERSION,
    demo_mode: DEMO_MODE,
    gemini_enabled: GEMINI_ENABLED,
    scene_duration: 10,
    message:
      "SANAPTAI V21 Universal Story Engine is running."
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio
    } = req.body || {};

    const durationSeconds = Number(duration) || 30;
    const ratio = aspectRatio || "16:9";

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        success: false,
        error: "Story prompt is required."
      });
    }

    if (!ALLOWED_DURATIONS.includes(durationSeconds)) {
      return res.status(400).json({
        success: false,
        error:
          "Duration must be 10, 30, 60, 300, 600, or 1200 seconds."
      });
    }

    const result = createScenes(
      String(prompt),
      durationSeconds,
      ratio
    );

    res.json({
      success: true,
      engine: ENGINE_VERSION,
      demo_mode: DEMO_MODE,

      duration: durationSeconds,
      total_scenes: result.scenes.length,
      aspect_ratio: ratio,

      characters: result.characters,
      locations: result.locations,
      objects: result.objects,
      events: result.events,

      scenes: result.scenes
    });
  } catch (error) {
    console.error("Demo project error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Project creation failed."
    });
  }
});

app.post("/api/create-project", (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio
    } = req.body || {};

    const durationSeconds = Number(duration) || 30;
    const ratio = aspectRatio || "16:9";

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Story prompt is required."
      });
    }

    const result = createScenes(
      String(prompt),
      durationSeconds,
      ratio
    );

    res.json({
      success: true,
      engine: ENGINE_VERSION,
      demo_mode: DEMO_MODE,
      duration: durationSeconds,
      total_scenes: result.scenes.length,
      aspect_ratio: ratio,
      scenes: result.scenes
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Project creation failed."
    });
  }
});

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    success: false,
    engine: ENGINE_VERSION,
    message:
      "AI scene planning is reserved for a future version. Demo planning is active."
  });
});

/* =========================================================
   SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
  );
});
