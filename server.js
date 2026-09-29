import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const ENGINE_VERSION = "V19";
const DEMO_MODE = true;
const GEMINI_ENABLED = false;

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function sceneTimes(sceneNumber) {
  const start = (sceneNumber - 1) * 10;
  const end = start + 10;

  return {
    start_time: `${Math.floor(start / 60)
      .toString()
      .padStart(2, "0")}:${(start % 60).toString().padStart(2, "0")}`,
    end_time: `${Math.floor(end / 60)
      .toString()
      .padStart(2, "0")}:${(end % 60).toString().padStart(2, "0")}`
  };
}

/* =========================================================
   CHARACTER LOCKS
========================================================= */

const CHARACTER_LOCKS = {
  Noah:
    "Noah, a 14-year-old boy with dark brown eyes, short slightly messy black hair, slim teenage build, wearing a casual blue shirt, dark jeans, and white sneakers.",

  Father:
    "Noah's adult father, medium build, short dark hair, practical everyday clothing.",

  Villagers:
    "Coastal-town villagers in practical everyday clothing.",

  RescueCrew:
    "Professional rescue crew wearing weatherproof rescue clothing.",

  Main:
    "Main character with consistent face, age, body proportions, hairstyle, clothing, and appearance across every scene."
};

/* =========================================================
   NOAH CORE STORY
========================================================= */

function createNoahCoreEvents() {
  return [
    {
      id: "E01",
      type: "setup",
      action:
        "Noah and his father walk together along the quiet streets of their coastal town.",
      characters: ["Noah", "Father"],
      location: "Coastal Town",
      props: [],
      dialogue: "This town has always been home to us.",
      voiceover:
        "Fourteen-year-old Noah lives with his father in a small coastal town."
    },

    {
      id: "E02",
      type: "setup",
      action:
        "Noah enters his father's workshop and looks around the familiar workbench.",
      characters: ["Noah", "Father"],
      location: "Father's Workshop",
      props: ["Workbench", "Tools"],
      dialogue: "Dad, what are you working on?",
      voiceover:
        "One morning, Noah visits his father's workshop."
    },

    {
      id: "E03",
      type: "discovery",
      action:
        "Noah notices an old lighthouse journal resting on the workshop workbench.",
      characters: ["Noah"],
      location: "Father's Workshop",
      props: ["Lighthouse Journal"],
      dialogue: "What's this old journal?",
      voiceover:
        "Something unusual catches Noah's attention."
    },

    {
      id: "E04",
      type: "discovery",
      action:
        "Noah picks up the old lighthouse journal and opens its worn pages.",
      characters: ["Noah"],
      location: "Father's Workshop",
      props: ["Lighthouse Journal"],
      dialogue: "I've never seen this before.",
      voiceover:
        "Noah opens the mysterious journal."
    },

    {
      id: "E05",
      type: "warning",
      action:
        "Noah reads the journal's warning about a powerful storm approaching the town.",
      characters: ["Noah"],
      location: "Father's Workshop",
      props: ["Lighthouse Journal", "Storm Warning"],
      dialogue: "A powerful storm is coming.",
      voiceover:
        "The journal contains a warning about a powerful storm."
    },

    {
      id: "E06",
      type: "realization",
      action:
        "Noah realizes the warning could put the coastal town in serious danger.",
      characters: ["Noah"],
      location: "Father's Workshop",
      props: ["Lighthouse Journal"],
      dialogue: "People need to know.",
      voiceover:
        "Noah realizes the warning cannot be ignored."
    },

    {
      id: "E07",
      type: "decision",
      action:
        "Noah firmly decides to leave the workshop and warn the villagers.",
      characters: ["Noah"],
      location: "Father's Workshop",
      props: ["Lighthouse Journal"],
      dialogue: "I'm going to warn everyone.",
      voiceover:
        "Noah decides to warn the town."
    },

    {
      id: "E08",
      type: "movement",
      action:
        "Noah walks quickly through the coastal town carrying the lighthouse journal.",
      characters: ["Noah"],
      location: "Coastal Town",
      props: ["Lighthouse Journal"],
      dialogue: "I have to reach them.",
      voiceover:
        "Noah heads into town."
    },

    {
      id: "E09",
      type: "conflict",
      action:
        "Noah urgently warns several villagers that a powerful storm is approaching.",
      characters: ["Noah", "Villagers"],
      location: "Coastal Town",
      props: ["Lighthouse Journal"],
      dialogue: "A dangerous storm is coming!",
      voiceover:
        "Noah tries to warn the villagers."
    },

    {
      id: "E10",
      type: "conflict",
      action:
        "Several villagers remain unconvinced and question Noah's warning.",
      characters: ["Noah", "Villagers"],
      location: "Coastal Town",
      props: ["Lighthouse Journal"],
      dialogue: "Why won't they listen?",
      voiceover:
        "The villagers do not believe Noah."
    },

    {
      id: "E11",
      type: "conflict",
      action:
        "Noah shows the lighthouse journal to the skeptical villagers, but uncertainty remains.",
      characters: ["Noah", "Villagers"],
      location: "Coastal Town",
      props: ["Lighthouse Journal"],
      dialogue: "Look at the warning!",
      voiceover:
        "Noah tries to prove that the warning is real."
    },

    {
      id: "E12",
      type: "climax",
      action:
        "Dark storm clouds rapidly gather above the coastal town.",
      characters: ["Noah", "Villagers"],
      location: "Coastal Town",
      props: [],
      dialogue: "It's starting.",
      voiceover:
        "The first signs of the storm appear."
    },

    {
      id: "E13",
      type: "climax",
      action:
        "Strong winds sweep through the coastal streets as the villagers react to the worsening weather.",
      characters: ["Noah", "Villagers"],
      location: "Coastal Town",
      props: [],
      dialogue: "The storm is here!",
      voiceover:
        "The weather suddenly becomes dangerous."
    },

    {
      id: "E14",
      type: "climax",
      action:
        "Heavy rain begins as villagers hurry to protect themselves from the storm.",
      characters: ["Noah", "Villagers"],
      location: "Coastal Town",
      props: [],
      dialogue: "Everyone, get somewhere safe!",
      voiceover:
        "Heavy rain hits the town."
    },

    {
      id: "E15",
      type: "discovery",
      action:
        "Noah looks toward the lighthouse and realizes its signal has stopped working.",
      characters: ["Noah"],
      location: "Coastal Town",
      props: ["Lighthouse Signal"],
      dialogue: "The lighthouse signal is out.",
      voiceover:
        "Then Noah notices another serious problem."
    },

    {
      id: "E16",
      type: "realization",
      action:
        "Noah realizes that without the lighthouse signal, boats may not find the harbor safely.",
      characters: ["Noah"],
      location: "Coastal Town",
      props: ["Lighthouse Signal"],
      dialogue: "The boats won't see the harbor.",
      voiceover:
        "Noah understands the danger facing boats offshore."
    },

    {
      id: "E17",
      type: "decision",
      action:
        "Noah decides to climb the lighthouse and repair the broken signal himself.",
      characters: ["Noah"],
      location: "Coastal Town",
      props: ["Lighthouse Signal"],
      dialogue: "I'll fix the signal.",
      voiceover:
        "Noah makes a dangerous decision."
    },

    {
      id: "E18",
      type: "movement",
      action:
        "Noah moves through the storm toward the lighthouse entrance.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: [],
      dialogue: "I have to get inside.",
      voiceover:
        "Noah reaches the lighthouse."
    },

    {
      id: "E19",
      type: "action",
      action:
        "Noah climbs the lighthouse stairs while rain and wind shake the building.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: [],
      dialogue: "Keep going.",
      voiceover:
        "Noah climbs higher into the storm."
    },

    {
      id: "E20",
      type: "discovery",
      action:
        "Noah reaches the lighthouse mechanism and sees that the signal system is damaged.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Damaged Signal Mechanism"],
      dialogue: "The mechanism is damaged.",
      voiceover:
        "Noah finally reaches the broken signal."
    },

    {
      id: "E21",
      type: "action",
      action:
        "Noah carefully examines the damaged lighthouse mechanism to determine how it can be repaired.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Damaged Signal Mechanism", "Tools"],
      dialogue: "I can repair this.",
      voiceover:
        "Noah studies the damaged mechanism."
    },

    {
      id: "E22",
      type: "action",
      action:
        "Noah begins repairing the damaged lighthouse signal using the available tools.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Damaged Signal Mechanism", "Tools"],
      dialogue: "Come on, work.",
      voiceover:
        "Noah begins the difficult repair."
    },

    {
      id: "E23",
      type: "action",
      action:
        "Noah continues repairing the lighthouse mechanism despite the violent wind and rain.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Damaged Signal Mechanism", "Tools"],
      dialogue: "I can't give up.",
      voiceover:
        "Despite the storm, Noah keeps working."
    },

    {
      id: "E24",
      type: "climax",
      action:
        "The repaired lighthouse signal suddenly activates and shines through the storm.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Lighthouse Signal"],
      dialogue: "It works!",
      voiceover:
        "The lighthouse signal is restored."
    },

    {
      id: "E25",
      type: "rescue",
      action:
        "A rescue boat appears offshore and its crew spots the restored lighthouse signal.",
      characters: ["Rescue Crew"],
      location: "Coastal Harbor",
      props: ["Rescue Boat", "Lighthouse Signal"],
      dialogue: "There it is!",
      voiceover:
        "The rescue boat sees the restored signal."
    },

    {
      id: "E26",
      type: "rescue",
      action:
        "The rescue boat follows the lighthouse signal toward the safe harbor entrance.",
      characters: ["Rescue Crew"],
      location: "Coastal Harbor",
      props: ["Rescue Boat", "Lighthouse Signal"],
      dialogue: "Follow the light!",
      voiceover:
        "The signal guides the boat toward safety."
    },

    {
      id: "E27",
      type: "rescue",
      action:
        "The rescue boat carefully navigates toward the harbor while the lighthouse signal remains visible.",
      characters: ["Rescue Crew"],
      location: "Coastal Harbor",
      props: ["Rescue Boat", "Lighthouse Signal"],
      dialogue: "We're almost there.",
      voiceover:
        "The boat reaches the safe route."
    },

    {
      id: "E28",
      type: "resolution",
      action:
        "The rescue boat reaches the harbor safely as the storm begins to weaken.",
      characters: ["Rescue Crew"],
      location: "Coastal Harbor",
      props: ["Rescue Boat"],
      dialogue: "We're safe.",
      voiceover:
        "The boat reaches the harbor as the storm weakens."
    },

    {
      id: "E29",
      type: "resolution",
      action:
        "Morning arrives over the coastal town after the storm has passed, leaving wet streets and calm skies.",
      characters: ["Noah", "Father"],
      location: "Coastal Town",
      props: [],
      dialogue: "The storm is finally over.",
      voiceover:
        "By morning, the storm has passed."
    },

    {
      id: "E30",
      type: "resolution",
      action:
        "The villagers gather around Noah and thank him for warning the town and restoring the lighthouse signal while he stands beside his proud father.",
      characters: ["Noah", "Father", "Villagers"],
      location: "Coastal Town",
      props: [],
      dialogue: "You helped save our town, Noah.",
      voiceover:
        "With the storm gone, the villagers realize that Noah's warning and courage helped keep the town safe."
    }
  ];
}

/* =========================================================
   CINEMATIC SUB-BEATS
========================================================= */

function createSubBeats(event) {
  const a = event.action;

  const map = {
    E01: [
      "Noah and his father walk together through the quiet coastal streets.",
      "Noah and his father share a calm moment as they continue through town."
    ],

    E02: [
      "Noah enters the workshop and looks toward his father's workbench.",
      "His father continues working while Noah looks around the familiar room."
    ],

    E03: [
      "Noah notices the old lighthouse journal on the workbench.",
      "Noah steps closer and studies the worn journal with curiosity."
    ],

    E04: [
      "Noah reaches for the old lighthouse journal.",
      "Noah opens the journal and looks at its aged pages."
    ],

    E05: [
      "Noah reads the storm warning written inside the journal.",
      "Noah's expression changes as he understands the seriousness of the warning."
    ],

    E06: [
      "Noah looks concerned after realizing the danger to the town.",
      "Noah looks toward the workshop entrance, determined to warn everyone."
    ],

    E07: [
      "Noah firmly decides to warn the villagers.",
      "Noah leaves the workshop carrying the journal."
    ],

    E08: [
      "Noah walks quickly through the coastal streets.",
      "Noah continues toward the villagers with the journal in hand."
    ],

    E09: [
      "Noah urgently tells the villagers that a powerful storm is coming.",
      "The villagers turn toward Noah as he holds up the journal."
    ],

    E10: [
      "Several villagers exchange skeptical looks after hearing Noah's warning.",
      "Noah faces the unconvinced villagers and tries to make them understand."
    ],

    E11: [
      "Noah holds the journal open and shows the warning to the villagers.",
      "The villagers look at the journal while remaining uncertain."
    ],

    E12: [
      "Dark storm clouds gather above the coastal town.",
      "Noah and the villagers look upward as the sky rapidly darkens."
    ],

    E13: [
      "Strong wind sweeps through the coastal streets.",
      "Villagers react as the worsening wind makes the danger obvious."
    ],

    E14: [
      "Heavy rain begins falling across the town.",
      "Villagers hurry to protect themselves as the storm intensifies."
    ],

    E15: [
      "Noah looks toward the lighthouse through the storm.",
      "Noah realizes the lighthouse signal has stopped working."
    ],

    E16: [
      "Noah looks toward the dark sea with concern.",
      "Noah realizes boats may not find the harbor without the signal."
    ],

    E17: [
      "Noah makes the decision to repair the lighthouse signal.",
      "Noah turns toward the lighthouse and commits to the dangerous task."
    ],

    E18: [
      "Noah reaches the lighthouse entrance through the storm.",
      "Noah enters the lighthouse and looks toward the staircase."
    ],

    E19: [
      "Noah climbs the lighthouse stairs through the violent storm.",
      "Noah continues climbing as wind and rain shake the lighthouse."
    ],

    E20: [
      "Noah reaches the damaged lighthouse mechanism.",
      "Noah closely inspects the broken signal system."
    ],

    E21: [
      "Noah examines the damaged mechanism and identifies the repair point.",
      "Noah gathers the necessary tools beside the mechanism."
    ],

    E22: [
      "Noah begins repairing the damaged lighthouse mechanism.",
      "Noah carefully works on the signal system with the tools."
    ],

    E23: [
      "Noah continues repairing the mechanism while the storm rages outside.",
      "Noah makes the final repair despite the difficult conditions."
    ],

    E24: [
      "The lighthouse signal suddenly activates.",
      "The restored signal shines brightly through the storm."
    ],

    E25: [
      "A rescue boat appears offshore and spots the lighthouse signal.",
      "The rescue crew turns toward the visible signal."
    ],

    E26: [
      "The rescue boat follows the lighthouse signal toward the harbor.",
      "The rescue crew keeps the boat aligned with the guiding light."
    ],

    E27: [
      "The rescue boat moves carefully toward the harbor entrance.",
      "The boat follows the safe route marked by the lighthouse signal."
    ],

    E28: [
      "The rescue boat reaches the harbor safely.",
      "The storm begins weakening as the boat reaches shelter."
    ],

    E29: [
      "Morning sunlight appears over the quiet coastal town.",
      "Noah and his father look across the town after the storm."
    ],

    E30: [
      "The villagers gather around Noah and thank him for helping save the town.",
      "Noah stands beside his proud father as the safe town begins a peaceful morning."
    ]
  };

  return map[event.id] || [a, a];
}

/* =========================================================
   CAMERA ENGINE V19
   IMPORTANT:
   CAMERA IS NOW EVENT-TYPE FIRST.
========================================================= */

function cameraForScene(event, beatIndex = 0) {
  const type = event.type;

  if (type === "setup") {
    return beatIndex === 0
      ? "Wide cinematic establishing shot showing the full environment and characters."
      : "Medium cinematic shot focused on the characters and their interaction.";
  }

  if (type === "discovery" || type === "warning") {
    return beatIndex === 0
      ? "Cinematic close-up focused on the important object or discovery."
      : "Over-the-shoulder close-up showing the character examining the important object.";
  }

  if (type === "realization") {
    return "Cinematic medium close-up focused on the character's realization and reaction.";
  }

  if (type === "decision") {
    return "Cinematic medium shot showing the character making a determined decision.";
  }

  if (type === "conflict") {
    return beatIndex === 0
      ? "Cinematic two-shot showing both sides of the conversation and conflict."
      : "Wide reaction shot showing the characters' disagreement within the environment.";
  }

  if (type === "movement") {
    return "Smooth cinematic tracking shot following the character's movement.";
  }

  if (type === "action") {
    return beatIndex === 0
      ? "Detailed cinematic close-up showing the character performing the task."
      : "Medium environmental shot showing the character actively completing the task.";
  }

  if (type === "climax") {
    return beatIndex === 0
      ? "Dynamic cinematic tracking shot emphasizing the intensity of the moment."
      : "Wide dramatic shot showing the full scale of the dangerous situation.";
  }

  if (type === "rescue") {
    return beatIndex === 0
      ? "Long-lens cinematic shot tracking the rescue boat through the storm."
      : "Wide cinematic harbor shot showing the rescue boat following the lighthouse signal.";
  }

  if (type === "resolution") {
    return beatIndex === 0
      ? "Wide peaceful cinematic shot showing the safe town after the storm."
      : "Wide emotional closing shot showing the characters together in the peaceful town.";
  }

  return "Cinematic medium shot clearly showing the stated story action.";
}

/* =========================================================
   LIGHTING ENGINE V19
========================================================= */

function lightingForScene(event, sceneNumber) {
  const type = event.type;

  if (sceneNumber <= 11) {
    if (event.location === "Father's Workshop") {
      return "Warm natural morning light through workshop windows, calm weather, soft realistic shadows.";
    }

    return "Clear peaceful daytime lighting, natural coastal sunlight, calm sky, realistic soft shadows.";
  }

  if (sceneNumber === 12) {
    return "Darkening storm-cloud lighting, cool overcast atmosphere, natural daylight fading.";
  }

  if (sceneNumber >= 13 && sceneNumber <= 27) {
    if (sceneNumber >= 15 && sceneNumber <= 23) {
      return "Heavy storm lighting with dark overcast sky, strong rain, dramatic cool tones, practical lighthouse illumination.";
    }

    return "Active storm lighting with dark clouds, rain, strong wind, dramatic natural contrast.";
  }

  if (sceneNumber === 28) {
    return "Storm weakening with soft overcast daylight, wet surfaces, calmer atmosphere.";
  }

  if (sceneNumber >= 29) {
    return "Peaceful clear morning after the storm, soft golden sunlight, wet reflective surfaces, calm blue sky.";
  }

  return "Natural cinematic lighting appropriate to the current story moment.";
}

/* =========================================================
   NOAH TIMELINE
========================================================= */

function buildNoahTimeline(totalScenes) {
  const core = createNoahCoreEvents();

  if (totalScenes === 30) {
    return core.map((event, index) => ({
      ...event,
      beat_index: 0,
      beat_text: event.action,
      source_event: event.id
    }));
  }

  const subBeatTimeline = [];

  for (const event of core) {
    const beats = createSubBeats(event);

    beats.forEach((beat, index) => {
      subBeatTimeline.push({
        ...event,
        beat_index: index,
        beat_text: beat,
        source_event: event.id
      });
    });
  }

  if (totalScenes === 60) {
    return subBeatTimeline.slice(0, 60);
  }

  if (totalScenes === 120) {
    const expanded = [];

    for (const item of subBeatTimeline) {
      expanded.push({
        ...item,
        beat_index: 0,
        beat_text: item.beat_text
      });

      expanded.push({
        ...item,
        beat_index: 1,
        beat_text: item.beat_text
      });
    }

    return expanded.slice(0, 120);
  }

  return subBeatTimeline.slice(0, totalScenes);
}

/* =========================================================
   GENERIC ENGINE
========================================================= */

function extractCharacters(prompt) {
  const characters = [];

  if (/\bNoah\b/i.test(prompt)) characters.push("Noah");
  if (/\bEthan\b/i.test(prompt)) characters.push("Ethan");
  if (/\bfather\b/i.test(prompt)) characters.push("Father");
  if (/\bmother\b/i.test(prompt)) characters.push("Mother");
  if (/\bgirl\b/i.test(prompt)) characters.push("Girl");
  if (/\bboy\b/i.test(prompt)) characters.push("Boy");
  if (/\bgirl\b/i.test(prompt)) characters.push("Girl");
  if (/\bdriver\b/i.test(prompt)) characters.push("Delivery Driver");
  if (/\bhiker\b/i.test(prompt)) characters.push("Hiker");

  return unique(characters);
}

function extractLocation(prompt) {
  if (/coastal|lighthouse|harbor/i.test(prompt)) return "Coastal Town";
  if (/forest|cabin/i.test(prompt)) return "Forest";
  if (/mountain|snow/i.test(prompt)) return "Mountain";
  if (/workshop/i.test(prompt)) return "Workshop";
  if (/town/i.test(prompt)) return "Town";

  return "Main Location";
}

function extractProps(prompt) {
  const props = [];

  if (/journal/i.test(prompt)) props.push("Journal");
  if (/map/i.test(prompt)) props.push("Map");
  if (/box/i.test(prompt)) props.push("Wooden Box");
  if (/phone|calls for help/i.test(prompt)) props.push("Phone");
  if (/water/i.test(prompt)) props.push("Water");
  if (/lighthouse/i.test(prompt)) props.push("Lighthouse");
  if (/boat/i.test(prompt)) props.push("Boat");

  return unique(props);
}

function createGenericEvents(prompt) {
  const sentences = cleanText(prompt)
    .split(/[.!?]+/)
    .map(cleanText)
    .filter(Boolean);

  const characters = extractCharacters(prompt);
  const location = extractLocation(prompt);
  const props = extractProps(prompt);

  if (!sentences.length) {
    return [
      {
        id: "E01",
        type: "setup",
        action: "The main character stands in the main location.",
        characters: characters.length ? characters : ["Main Character"],
        location,
        props,
        dialogue: "Something is about to happen.",
        voiceover: "The story begins."
      }
    ];
  }

  return sentences.map((sentence, index) => ({
    id: `E${String(index + 1).padStart(2, "0")}`,
    type:
      index === 0
        ? "setup"
        : index === sentences.length - 1
        ? "resolution"
        : "action",
    action: sentence,
    characters: characters.length ? characters : ["Main Character"],
    location,
    props,
    dialogue: "",
    voiceover: sentence
  }));
}

function buildGenericTimeline(prompt, totalScenes) {
  const events = createGenericEvents(prompt);

  const timeline = [];

  for (let i = 0; i < totalScenes; i++) {
    const event = events[i % events.length];

    timeline.push({
      ...event,
      beat_index: i % 2,
      beat_text: event.action,
      source_event: event.id
    });
  }

  return timeline;
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

function buildTimeline(prompt, totalScenes) {
  if (isNoahStory(prompt)) {
    return buildNoahTimeline(totalScenes);
  }

  return buildGenericTimeline(prompt, totalScenes);
}

/* =========================================================
   SCENE CREATOR
========================================================= */

function createScenes(prompt, duration, aspectRatio) {
  const totalScenes = Math.max(1, Math.floor(Number(duration) / 10));

  const timeline = buildTimeline(prompt, totalScenes);

  const scenes = timeline.map((event, index) => {
    const sceneNumber = index + 1;
    const times = sceneTimes(sceneNumber);

    const characters = event.characters || ["Main Character"];
    const props = event.props || [];

    const characterLocks = characters.map((character) => {
      if (CHARACTER_LOCKS[character]) {
        return CHARACTER_LOCKS[character];
      }

      return `${character}, maintain exactly the same face, age, hairstyle, body proportions, clothing, and appearance in every scene.`;
    });

    const camera = cameraForScene(event, event.beat_index || 0);
    const lighting = lightingForScene(event, sceneNumber);

    let action = cleanText(event.beat_text || event.action);

    if (sceneNumber === 30 && isNoahStory(prompt)) {
      action =
        "The villagers gather around Noah and thank him for warning the town and restoring the lighthouse signal while he stands beside his proud father.";
    }

    if (sceneNumber === 60 && isNoahStory(prompt)) {
      action =
        "The villagers gather around Noah and thank him for helping save the town as Noah stands beside his proud father in the safe coastal town.";
    }

    const visualPrompt = [
      `Cinematic ${aspectRatio} video scene.`,
      `Exact story action: ${action}.`,
      `Characters: ${characters.join(", ")}.`,
      `Character continuity: ${characterLocks.join(" ")}`,
      `Location: ${event.location}.`,
      props.length
        ? `Required props only: ${props.join(", ")}.`
        : "No unnecessary props.",
      `Camera: ${camera}`,
      `Lighting: ${lighting}`,
      "Show only the exact action stated in this scene.",
      "Do not introduce unrelated people, vehicles, animals, objects, locations, or events.",
      "Do not introduce characters before they are required by the story.",
      "Preserve chronological story order.",
      "Do not describe future actions.",
      "Do not describe preparation for a future scene.",
      "Do not use meta wording such as continue the story, develop this event, prepare for next action, or story continues.",
      "Keep the same character identity and appearance throughout the entire video."
    ].join(" ");

    return {
      scene_number: sceneNumber,
      start_time: times.start_time,
      end_time: times.end_time,

      source_event: event.source_event,

      action,

      characters,
      location: event.location,
      props,

      visual_prompt: visualPrompt,

      camera,
      lighting,

      dialogue: cleanText(event.dialogue),
      voiceover: cleanText(event.voiceover),

      continuity:
        "Maintain exact character identity, face, age, hairstyle, clothing, body proportions, and visual style from previous scenes."
    };
  });

  return scenes;
}

/* =========================================================
   PROJECT CREATOR
========================================================= */

function createProject(body) {
  const prompt = cleanText(body.prompt);

  const duration = Number(body.duration || 30);

  const allowedDurations = [10, 30, 60, 300, 600, 1200];

  const safeDuration = allowedDurations.includes(duration)
    ? duration
    : 30;

  const aspectRatio = body.aspectRatio || "9:16";

  const scenes = createScenes(
    prompt,
    safeDuration,
    aspectRatio
  );

  return {
    engine: ENGINE_VERSION,
    mode: DEMO_MODE ? "DEMO" : "AI",
    gemini_enabled: GEMINI_ENABLED,

    duration: safeDuration,
    total_scenes: scenes.length,

    scene_duration_seconds: 10,

    aspect_ratio: aspectRatio,

    prompt,

    scenes
  };
}

/* =========================================================
   ROUTES
========================================================= */

app.get("/", (req, res) => {
  res.send("SANAPTAI V19 is live");
});

app.get("/api/test", (req, res) => {
  res.json({
    status: "ok",
    engine: ENGINE_VERSION,
    engine_name: "Cinematic Event-Aware Story Engine",
    demo_mode: DEMO_MODE,
    gemini_enabled: GEMINI_ENABLED,
    exact_scene_duration: "10 seconds",
    supported_scenes: [1, 3, 6, 30, 60, 120]
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const project = createProject(req.body || {});
    res.json(project);
  } catch (error) {
    console.error("Demo Project Error:", error);

    res.status(500).json({
      error: "Project creation failed",
      message: error.message
    });
  }
});

app.post("/api/create-project", (req, res) => {
  try {
    const project = createProject(req.body || {});
    res.json(project);
  } catch (error) {
    console.error("Create Project Error:", error);

    res.status(500).json({
      error: "Project creation failed",
      message: error.message
    });
  }
});

/*
  Reserved for future AI mode.

  Gemini remains OFF during V19 testing.
*/

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    status: "reserved",
    message:
      "AI scene planning is reserved for a future version. V19 currently uses the deterministic Demo Engine.",
    gemini_enabled: false
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(`SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`);
});
