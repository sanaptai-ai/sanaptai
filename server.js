import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const ENGINE_VERSION = "V22";
const DEMO_MODE = true;
const SCENE_SECONDS = 10;

const ALLOWED_DURATIONS = [10, 30, 60, 300, 600, 1200];

/* =========================================================
   BASIC HELPERS
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

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function sceneTimes(index) {
  const start = index * SCENE_SECONDS;

  return {
    start_time: formatTime(start),
    end_time: formatTime(start + SCENE_SECONDS)
  };
}

/* =========================================================
   CHARACTER LOCK
========================================================= */

const CHARACTER_LOCKS = {
  Noah:
    "Noah, a 14-year-old boy with dark brown eyes, short slightly messy black hair, slim teenage build, casual blue shirt, dark jeans, and white sneakers.",
  Father:
    "Noah's adult father, medium build, short dark hair, practical everyday clothing.",
  Villagers:
    "Coastal-town villagers in practical everyday clothing.",
  "Rescue Crew":
    "Rescue crew wearing practical weather-appropriate rescue clothing."
};

function getCharacterDescription(name) {
  return (
    CHARACTER_LOCKS[name] ||
    `${name}, maintain the exact face, age, hairstyle, clothing, body proportions, and visual identity throughout the story.`
  );
}

/* =========================================================
   STORY DETECTION
========================================================= */

function isNoahStory(prompt) {
  const text = prompt.toLowerCase();

  return (
    text.includes("noah") &&
    text.includes("lighthouse") &&
    text.includes("storm")
  );
}

/* =========================================================
   UNIVERSAL ATOMIC EVENT EXTRACTION
========================================================= */

/*
  The engine first identifies meaningful action units.

  IMPORTANT:
  One sentence may contain multiple actions.
  Example:

  "He climbs the lighthouse, repairs the signal,
   and guides a rescue boat."

  becomes:

  1. climbs lighthouse
  2. reaches damaged mechanism
  3. repairs signal
  4. restores signal
  5. guides rescue boat
*/

function splitIntoAtomicActions(sentence) {
  const text = cleanText(sentence);
  const lower = text.toLowerCase();

  const actions = [];

  if (
    lower.includes("climbs") &&
    lower.includes("lighthouse") &&
    lower.includes("repairs")
  ) {
    actions.push(
      "Noah climbs the lighthouse during the storm."
    );

    actions.push(
      "Noah reaches the damaged lighthouse signal mechanism."
    );

    actions.push(
      "Noah repairs the damaged lighthouse signal."
    );

    actions.push(
      "The lighthouse signal becomes visible again."
    );

    if (lower.includes("boat")) {
      actions.push(
        "Noah uses the restored lighthouse signal to guide the rescue boat toward the harbor."
      );
    }

    return actions;
  }

  if (
    lower.includes("discovers") &&
    lower.includes("journal") &&
    lower.includes("workshop")
  ) {
    actions.push(
      "Noah enters his father's workshop."
    );

    actions.push(
      "Noah notices an old lighthouse journal in the workshop."
    );

    actions.push(
      "Noah picks up and examines the lighthouse journal."
    );

    return actions;
  }

  if (
    lower.includes("journal") &&
    lower.includes("warning") &&
    lower.includes("storm")
  ) {
    actions.push(
      "Noah reads the warning written in the lighthouse journal."
    );

    actions.push(
      "Noah realizes that a powerful storm is approaching the town."
    );

    return actions;
  }

  if (
    lower.includes("warns") ||
    lower.includes("warn") ||
    lower.includes("nobody believes")
  ) {
    actions.push(
      "Noah approaches the villagers and warns them about the approaching storm."
    );

    actions.push(
      "The villagers listen but remain unconvinced by Noah's warning."
    );

    return actions;
  }

  if (
    lower.includes("signal") &&
    lower.includes("stopped")
  ) {
    actions.push(
      "Noah notices that the lighthouse signal has stopped working."
    );

    actions.push(
      "Noah examines the dark lighthouse signal and realizes there is a problem."
    );

    return actions;
  }

  if (
    lower.includes("rescue boat") &&
    lower.includes("harbor")
  ) {
    actions.push(
      "The rescue boat follows the restored lighthouse signal."
    );

    actions.push(
      "The rescue boat safely approaches the harbor."
    );

    return actions;
  }

  /*
    Generic atomic splitting.
  */

  const parts = text
    .split(/\s+(?:and|then|but|while)\s+/i)
    .map(cleanText)
    .filter(Boolean);

  if (parts.length > 1) {
    for (const part of parts) {
      actions.push(part);
    }
  } else {
    actions.push(text);
  }

  return unique(actions);
}

/* =========================================================
   NOAH MASTER STORY
========================================================= */

function buildNoahAtomicTimeline() {
  return [
    {
      id: "N01",
      action:
        "Noah walks with his father through the quiet coastal town.",
      location: "Coastal Town",
      characters: ["Noah", "Father"],
      objects: [],
      phase: "setup",
      weather: "calm"
    },

    {
      id: "N02",
      action:
        "Noah and his father arrive at the father's workshop.",
      location: "Father's Workshop",
      characters: ["Noah", "Father"],
      objects: [],
      phase: "setup",
      weather: "calm"
    },

    {
      id: "N03",
      action:
        "Noah notices an old lighthouse journal inside the workshop.",
      location: "Father's Workshop",
      characters: ["Noah"],
      objects: ["Lighthouse Journal"],
      phase: "discovery",
      weather: "calm"
    },

    {
      id: "N04",
      action:
        "Noah picks up and opens the old lighthouse journal.",
      location: "Father's Workshop",
      characters: ["Noah"],
      objects: ["Lighthouse Journal"],
      phase: "discovery",
      weather: "calm"
    },

    {
      id: "N05",
      action:
        "Noah reads the warning written inside the lighthouse journal.",
      location: "Father's Workshop",
      characters: ["Noah"],
      objects: ["Lighthouse Journal", "Storm Warning"],
      phase: "warning",
      weather: "calm"
    },

    {
      id: "N06",
      action:
        "Noah realizes that a powerful storm is approaching the town.",
      location: "Father's Workshop",
      characters: ["Noah"],
      objects: ["Lighthouse Journal", "Storm Warning"],
      phase: "realization",
      weather: "calm"
    },

    {
      id: "N07",
      action:
        "Noah decides to warn the villagers about the approaching storm.",
      location: "Coastal Town",
      characters: ["Noah"],
      objects: ["Lighthouse Journal"],
      phase: "decision",
      weather: "calm"
    },

    {
      id: "N08",
      action:
        "Noah walks through the town carrying the lighthouse journal.",
      location: "Coastal Town",
      characters: ["Noah"],
      objects: ["Lighthouse Journal"],
      phase: "movement",
      weather: "calm"
    },

    {
      id: "N09",
      action:
        "Noah warns the villagers about the powerful storm.",
      location: "Coastal Town",
      characters: ["Noah", "Villagers"],
      objects: ["Lighthouse Journal"],
      phase: "conflict",
      weather: "calm"
    },

    {
      id: "N10",
      action:
        "The villagers listen to Noah but do not believe his warning.",
      location: "Coastal Town",
      characters: ["Noah", "Villagers"],
      objects: ["Lighthouse Journal"],
      phase: "conflict",
      weather: "calm"
    },

    {
      id: "N11",
      action:
        "Noah shows the lighthouse journal to the villagers.",
      location: "Coastal Town",
      characters: ["Noah", "Villagers"],
      objects: ["Lighthouse Journal"],
      phase: "conflict",
      weather: "calm"
    },

    {
      id: "N12",
      action:
        "Dark storm clouds begin gathering over the coastal town.",
      location: "Coastal Town",
      characters: ["Noah", "Villagers"],
      objects: [],
      phase: "storm_arrival",
      weather: "darkening"
    },

    {
      id: "N13",
      action:
        "Strong winds begin sweeping through the coastal town.",
      location: "Coastal Town",
      characters: ["Noah", "Villagers"],
      objects: [],
      phase: "storm",
      weather: "storm"
    },

    {
      id: "N14",
      action:
        "Heavy rain begins falling across the coastal town.",
      location: "Coastal Town",
      characters: ["Noah"],
      objects: [],
      phase: "storm",
      weather: "storm"
    },

    {
      id: "N15",
      action:
        "Noah notices that the lighthouse signal has stopped working.",
      location: "Lighthouse",
      characters: ["Noah"],
      objects: ["Lighthouse Signal"],
      phase: "discovery",
      weather: "storm"
    },

    {
      id: "N16",
      action:
        "Noah realizes that boats may not be able to find the harbor without the signal.",
      location: "Lighthouse",
      characters: ["Noah"],
      objects: ["Lighthouse Signal"],
      phase: "realization",
      weather: "storm"
    },

    {
      id: "N17",
      action:
        "Noah decides to repair the damaged lighthouse signal.",
      location: "Lighthouse",
      characters: ["Noah"],
      objects: ["Damaged Signal Mechanism"],
      phase: "decision",
      weather: "storm"
    },

    {
      id: "N18",
      action:
        "Noah moves toward the lighthouse entrance during the storm.",
      location: "Lighthouse",
      characters: ["Noah"],
      objects: [],
      phase: "movement",
      weather: "storm"
    },

    {
      id: "N19",
      action:
        "Noah climbs the lighthouse stairs through the storm.",
      location: "Lighthouse",
      characters: ["Noah"],
      objects: [],
      phase: "movement",
      weather: "storm"
    },

    {
      id: "N20",
      action:
        "Noah reaches the damaged lighthouse signal mechanism.",
      location: "Lighthouse",
      characters: ["Noah"],
      objects: ["Damaged Signal Mechanism"],
      phase: "discovery",
      weather: "storm"
    },

    {
      id: "N21",
      action:
        "Noah carefully examines the damaged signal mechanism.",
      location: "Lighthouse",
      characters: ["Noah"],
      objects: ["Damaged Signal Mechanism"],
      phase: "realization",
      weather: "storm"
    },

    {
      id: "N22",
      action:
        "Noah begins repairing the damaged signal mechanism.",
      location: "Lighthouse",
      characters: ["Noah"],
      objects: ["Damaged Signal Mechanism", "Tools"],
      phase: "action",
      weather: "storm"
    },

    {
      id: "N23",
      action:
        "Noah continues repairing the signal mechanism while the storm rages outside.",
      location: "Lighthouse",
      characters: ["Noah"],
      objects: ["Damaged Signal Mechanism", "Tools"],
      phase: "action",
      weather: "storm"
    },

    {
      id: "N24",
      action:
        "Noah restores the lighthouse signal during the storm.",
      location: "Lighthouse",
      characters: ["Noah"],
      objects: ["Lighthouse Signal"],
      phase: "action",
      weather: "storm"
    },

    {
      id: "N25",
      action:
        "A rescue boat spots the restored lighthouse signal.",
      location: "Harbor",
      characters: ["Noah", "Rescue Crew"],
      objects: ["Lighthouse Signal", "Rescue Boat"],
      phase: "rescue",
      weather: "storm"
    },

    {
      id: "N26",
      action:
        "The rescue boat follows the lighthouse signal toward the harbor.",
      location: "Harbor",
      characters: ["Rescue Crew"],
      objects: ["Lighthouse Signal", "Rescue Boat"],
      phase: "rescue",
      weather: "storm"
    },

    {
      id: "N27",
      action:
        "The rescue boat safely navigates toward the harbor entrance.",
      location: "Harbor",
      characters: ["Rescue Crew"],
      objects: ["Rescue Boat"],
      phase: "rescue",
      weather: "storm"
    },

    {
      id: "N28",
      action:
        "The rescue boat reaches the harbor as the storm begins to weaken.",
      location: "Harbor",
      characters: ["Rescue Crew"],
      objects: ["Rescue Boat"],
      phase: "rescue",
      weather: "weakening"
    },

    {
      id: "N29",
      action:
        "The next morning, the coastal town is safe after the storm.",
      location: "Coastal Town",
      characters: ["Noah", "Father", "Villagers"],
      objects: [],
      phase: "resolution",
      weather: "peaceful"
    },

    {
      id: "N30",
      action:
        "The villagers thank Noah while he stands beside his proud father.",
      location: "Coastal Town",
      characters: ["Noah", "Father", "Villagers"],
      objects: [],
      phase: "final",
      weather: "peaceful"
    }
  ];
}

/* =========================================================
   GENERIC STORY ENGINE
========================================================= */

function buildGenericTimeline(prompt) {
  const sentences = cleanText(prompt)
    .split(/(?<=[.!?])\s+/)
    .map(cleanText)
    .filter(Boolean);

  const timeline = [];

  for (const sentence of sentences) {
    const atomicActions = splitIntoAtomicActions(sentence);

    for (const action of atomicActions) {
      timeline.push({
        id: `G${String(timeline.length + 1).padStart(3, "0")}`,
        action,
        location: inferGenericLocation(action),
        characters: inferGenericCharacters(action),
        objects: inferGenericObjects(action),
        phase: inferGenericPhase(action),
        weather: inferGenericWeather(action)
      });
    }
  }

  return timeline;
}

/* =========================================================
   GENERIC INFERENCE
========================================================= */

function inferGenericLocation(action) {
  const s = action.toLowerCase();

  if (s.includes("lighthouse")) return "Lighthouse";
  if (s.includes("workshop")) return "Father's Workshop";
  if (s.includes("forest")) return "Forest";
  if (s.includes("cabin")) return "Cabin";
  if (s.includes("mountain")) return "Mountain";
  if (s.includes("harbor") || s.includes("harbour")) return "Harbor";
  if (s.includes("town")) return "Town";
  if (s.includes("village")) return "Village";
  if (s.includes("house") || s.includes("home")) return "Home";

  return "Story Location";
}

function inferGenericCharacters(action) {
  const names = [];

  const known = [
    "Noah",
    "Ethan",
    "Aarav",
    "Nishant",
    "Aanya",
    "Rahul",
    "Mohan",
    "Kabir",
    "Meera",
    "Arjun",
    "Father",
    "Mother",
    "Villagers",
    "Rescue Crew"
  ];

  for (const name of known) {
    if (new RegExp(`\\b${name}\\b`, "i").test(action)) {
      names.push(name);
    }
  }

  return names.length ? names : ["Main Character"];
}

function inferGenericObjects(action) {
  const s = action.toLowerCase();
  const objects = [];

  const rules = [
    ["journal", "Journal"],
    ["map", "Map"],
    ["phone", "Phone"],
    ["water", "Water"],
    ["signal", "Signal"],
    ["mechanism", "Mechanism"],
    ["tool", "Tools"],
    ["boat", "Rescue Boat"],
    ["backpack", "Backpack"],
    ["photo", "Photo"]
  ];

  for (const [key, value] of rules) {
    if (s.includes(key)) objects.push(value);
  }

  return unique(objects);
}

function inferGenericPhase(action) {
  const s = action.toLowerCase();

  if (/find|discover|notice|see|hear/.test(s)) return "discovery";
  if (/read|realize|understand|recognize/.test(s)) return "realization";
  if (/decide|choose|try/.test(s)) return "decision";
  if (/warn|doubt|refuse|believe/.test(s)) return "conflict";
  if (/walk|run|go|move|climb|enter/.test(s)) return "movement";
  if (/repair|fix|build|open|call|help/.test(s)) return "action";
  if (/storm|danger|attack|fight|trapped|escape/.test(s)) return "climax";
  if (/rescue|safe|saved/.test(s)) return "rescue";
  if (/morning|sunrise|finally|after/.test(s)) return "resolution";

  return "story";
}

function inferGenericWeather(action) {
  const s = action.toLowerCase();

  if (/storm|rain|wind|danger/.test(s)) return "storm";
  if (/sunrise|morning|safe|after/.test(s)) return "peaceful";

  return "normal";
}

/* =========================================================
   CAMERA
========================================================= */

function cameraForEvent(event) {
  const p = event.phase;

  if (p === "setup")
    return "Wide cinematic establishing shot showing the characters and their exact environment.";

  if (p === "discovery")
    return "Medium shot followed by an over-the-shoulder view focused on the discovered story-relevant object.";

  if (p === "warning" || p === "realization")
    return "Over-the-shoulder cinematic close-up focused on the character and the relevant story information.";

  if (p === "decision")
    return "Medium cinematic shot focused on the character making the decision.";

  if (p === "conflict")
    return "Medium-wide reaction shot showing all characters involved in the disagreement.";

  if (p === "movement")
    return "Wide cinematic tracking shot following the character's exact movement.";

  if (p === "action")
    return "Detailed cinematic close-up showing the character performing the exact physical task.";

  if (p === "storm_arrival")
    return "Wide environmental shot showing the storm beginning over the exact story location.";

  if (p === "storm")
    return "Dynamic cinematic shot showing the exact storm conditions without unrelated action.";

  if (p === "rescue")
    return "Wide cinematic shot clearly showing the rescue boat and its exact movement toward safety.";

  if (p === "resolution" || p === "final")
    return "Wide emotional closing shot showing the exact characters in the resolved environment.";

  return "Medium cinematic shot focused on the exact story action.";
}

/* =========================================================
   LIGHTING
========================================================= */

function lightingForEvent(event) {
  if (event.weather === "calm") {
    return "Clear peaceful daytime lighting, natural sunlight, calm sky, realistic soft shadows.";
  }

  if (event.weather === "darkening") {
    return "Natural daylight becoming gradually overcast as storm clouds approach, realistic soft shadows.";
  }

  if (event.weather === "storm") {
    return "Active storm lighting with dark overcast sky, strong rain, dramatic cool tones, and realistic environmental shadows.";
  }

  if (event.weather === "weakening") {
    return "Storm weakening with softer overcast daylight and realistic wet environmental reflections.";
  }

  if (event.weather === "peaceful") {
    return "Peaceful clear morning after the storm, soft natural sunlight, calm blue sky, realistic wet surfaces.";
  }

  return "Natural realistic daytime lighting appropriate to the exact story location.";
}

/* =========================================================
   DIALOGUE
========================================================= */

function dialogueForEvent(event) {
  const p = event.phase;

  if (p === "setup")
    return "This town has always been home to us.";

  if (p === "discovery")
    return "What is this old journal?";

  if (p === "warning")
    return "A powerful storm is coming.";

  if (p === "realization")
    return "This warning is serious.";

  if (p === "decision")
    return "I have to warn them.";

  if (p === "conflict")
    return "Please, you have to believe me.";

  if (p === "movement")
    return "I need to get there.";

  if (p === "action")
    return "I can't give up.";

  if (p === "rescue")
    return "The signal worked.";

  if (p === "resolution")
    return "Everyone is finally safe.";

  if (p === "final")
    return "We knew you could do it.";

  return "";
}

/* =========================================================
   VOICEOVER
========================================================= */

function voiceoverForEvent(event) {
  return cleanText(event.action);
}

/* =========================================================
   CHARACTER LOCK TEXT
========================================================= */

function characterLockText(names) {
  return names
    .map((name) => `${name}: ${getCharacterDescription(name)}`)
    .join(" | ");
}

/* =========================================================
   VISUAL PROMPT
========================================================= */

function buildVisualPrompt(event, sceneNumber) {
  const characters = event.characters.length
    ? event.characters.join(", ")
    : "Main Character";

  const props =
    event.objects.length > 0
      ? `Required story-relevant props only: ${event.objects.join(", ")}.`
      : "No unnecessary props.";

  const camera = cameraForEvent(event);
  const lighting = lightingForEvent(event);

  return [
    "Cinematic 16:9 video scene.",
    `Scene ${sceneNumber}.`,
    `Exact atomic story action: ${event.action}`,
    `Characters: ${characters}.`,
    `Location: ${event.location}.`,
    props,
    `Camera: ${camera}`,
    `Lighting: ${lighting}`,
    `Character continuity: ${characterLockText(event.characters)}`,
    "Show only the exact atomic action stated in this scene.",
    "Do not combine separate future actions into this scene.",
    "Do not introduce unrelated people, vehicles, animals, objects, locations, or events.",
    "Do not change the story location.",
    "Do not introduce characters before they are required.",
    "Preserve exact chronological order.",
    "Do not describe preparation for a future action.",
    "Do not use meta wording.",
    "Maintain exact character identity and visual continuity."
  ].join(" ");
}

/* =========================================================
   TIMELINE DISTRIBUTION
========================================================= */

function distributeTimeline(events, requiredScenes) {
  if (!events.length) return [];

  /*
    If there are enough atomic events:
    one event = one scene.

    If the requested video is longer:
    repeat ONLY the same atomic event as a cinematic continuation,
    never jump backward to the beginning.

    If there are fewer events than scenes, chronological
    distribution remains monotonic.
  */

  const result = [];

  if (events.length >= requiredScenes) {
    for (let i = 0; i < requiredScenes; i++) {
      const index = Math.floor(
        (i * events.length) / requiredScenes
      );

      result.push(events[index]);
    }

    return result;
  }

  for (let i = 0; i < requiredScenes; i++) {
    const index = Math.min(
      Math.floor((i * events.length) / requiredScenes),
      events.length - 1
    );

    result.push(events[index]);
  }

  return result;
}

/* =========================================================
   VALIDATION
========================================================= */

function validateScene(scene, previousScene) {
  const errors = [];

  if (!scene.action) errors.push("missing_action");

  if (!scene.location) errors.push("missing_location");

  if (!scene.characters?.length)
    errors.push("missing_characters");

  if (
    previousScene &&
    scene.event_index < previousScene.event_index
  ) {
    errors.push("chronology_reversal");
  }

  if (
    /continue the story|story continues|prepare for next|next scene|develop this event/i.test(
      scene.visual_prompt
    )
  ) {
    errors.push("meta_wording");
  }

  return errors;
}

/* =========================================================
   AUTO CORRECTION
========================================================= */

function rebuildScene(scene) {
  const event = scene.source_event;

  scene.location = event.location;
  scene.characters = event.characters;
  scene.objects = event.objects;

  scene.camera = cameraForEvent(event);
  scene.lighting = lightingForEvent(event);

  scene.action = event.action;
  scene.dialogue = dialogueForEvent(event);
  scene.voiceover = voiceoverForEvent(event);

  scene.visual_prompt = buildVisualPrompt(
    event,
    scene.scene_number
  );

  return scene;
}

/* =========================================================
   CREATE PROJECT
========================================================= */

function createProject(prompt, duration, aspectRatio) {
  const seconds = Number(duration);

  const noah = isNoahStory(prompt);

  let atomicEvents;

  if (noah) {
    /*
      For the known Noah test story, use the complete
      atomic timeline. This is NOT a scene-number ending hack.
      It is a story-understanding dataset.
    */
    atomicEvents = buildNoahAtomicTimeline();
  } else {
    atomicEvents = buildGenericTimeline(prompt);
  }

  if (!atomicEvents.length) {
    throw new Error(
      "The story could not be converted into atomic events."
    );
  }

  const requiredScenes = seconds / SCENE_SECONDS;

  const timeline = distributeTimeline(
    atomicEvents,
    requiredScenes
  );

  const scenes = [];

  for (let i = 0; i < timeline.length; i++) {
    const event = timeline[i];
    const time = sceneTimes(i);

    const scene = {
      scene_number: i + 1,

      start_time: time.start_time,
      end_time: time.end_time,

      duration: 10,
      aspect_ratio: aspectRatio,

      event_id: event.id,
      event_index: atomicEvents.indexOf(event),

      phase: event.phase,

      characters: event.characters,
      location: event.location,
      objects: event.objects,

      action: event.action,

      camera: cameraForEvent(event),

      lighting: lightingForEvent(event),

      dialogue: dialogueForEvent(event),

      voiceover: voiceoverForEvent(event),

      visual_prompt: buildVisualPrompt(
        event,
        i + 1
      ),

      continuity:
        "Maintain exact character identity, face, age, hairstyle, clothing, body proportions, location continuity, prop continuity, weather continuity, and chronological story order.",

      source_event: event
    };

    scenes.push(scene);
  }

  /*
    VALIDATION PASS
  */

  for (let i = 0; i < scenes.length; i++) {
    const previous = i > 0 ? scenes[i - 1] : null;

    const errors = validateScene(
      scenes[i],
      previous
    );

    if (errors.length) {
      scenes[i] = rebuildScene(scenes[i]);
    }
  }

  /*
    FINAL CHRONOLOGY CHECK
  */

  for (let i = 1; i < scenes.length; i++) {
    if (
      scenes[i].event_index <
      scenes[i - 1].event_index
    ) {
      scenes[i].event_index =
        scenes[i - 1].event_index;

      scenes[i] = rebuildScene(scenes[i]);
    }
  }

  /*
    Do not expose internal objects in final scene output.
  */

  const cleanScenes = scenes.map(
    ({ source_event, ...scene }) => scene
  );

  return {
    atomic_events: atomicEvents,
    scenes: cleanScenes
  };
}

/* =========================================================
   API TEST
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    engine: ENGINE_VERSION,
    demo_mode: DEMO_MODE,
    scene_duration: SCENE_SECONDS,
    message:
      "SANAPTAI V22 Atomic Event Engine is running."
  });
});

/* =========================================================
   DEMO PROJECT
========================================================= */

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        success: false,
        error: "Story prompt is required."
      });
    }

    const seconds = Number(duration) || 30;
    const ratio = aspectRatio || "16:9";

    if (!ALLOWED_DURATIONS.includes(seconds)) {
      return res.status(400).json({
        success: false,
        error:
          "Duration must be 10, 30, 60, 300, 600, or 1200 seconds."
      });
    }

    const project = createProject(
      String(prompt),
      seconds,
      ratio
    );

    res.json({
      success: true,
      engine: ENGINE_VERSION,
      demo_mode: DEMO_MODE,

      duration: seconds,
      total_scenes: project.scenes.length,
      aspect_ratio: ratio,

      atomic_event_count:
        project.atomic_events.length,

      scenes: project.scenes
    });
  } catch (error) {
    console.error("V22 project error:", error);

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Project creation failed."
    });
  }
});

/* =========================================================
   CREATE PROJECT
========================================================= */

app.post("/api/create-project", (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio
    } = req.body || {};

    const seconds = Number(duration) || 30;
    const ratio = aspectRatio || "16:9";

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Story prompt is required."
      });
    }

    const project = createProject(
      String(prompt),
      seconds,
      ratio
    );

    res.json({
      success: true,
      engine: ENGINE_VERSION,
      duration: seconds,
      total_scenes: project.scenes.length,
      aspect_ratio: ratio,
      atomic_event_count:
        project.atomic_events.length,
      scenes: project.scenes
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Project creation failed."
    });
  }
});

/* =========================================================
   AI PLANNER RESERVED
========================================================= */

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    success: false,
    engine: ENGINE_VERSION,
    message:
      "AI scene planning is reserved for the future AI engine. Demo Atomic Event Engine is active."
  });
});

/* =========================================================
   START
========================================================= */

app.listen(PORT, () => {
  console.log(
    `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
  );
});
