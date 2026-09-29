import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "V31";
const DEMO_MODE = true;
const GEMINI_ENABLED = false;
const SCENE_DURATION = 10;

const ALLOWED_DURATIONS = [10, 30, 60, 300, 600, 1200];

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   CHARACTER LOCKS
========================================================= */

const CHARACTER_LOCKS = {
  Noah:
    "Noah, 14-year-old boy, slim build, short slightly messy brown hair, blue eyes, navy blue hoodie, dark jeans, white sneakers",

  Father:
    "Noah's father, middle-aged man, short dark hair with some gray, trimmed beard, brown work jacket and dark trousers",

  Villagers:
    "coastal town villagers wearing practical everyday clothing, consistent appearances",

  RescueCrew:
    "professional coastal rescue crew wearing bright weatherproof rescue jackets and safety gear"
};

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function sceneTimes(index) {
  const start = index * SCENE_DURATION;
  const end = start + SCENE_DURATION;

  return {
    start_time: `${start}s`,
    end_time: `${end}s`
  };
}

function isNoahStory(prompt) {
  const text = cleanText(prompt).toLowerCase();

  return (
    text.includes("noah") &&
    text.includes("lighthouse") &&
    text.includes("storm")
  );
}

/* =========================================================
   NOAH ATOMIC EVENTS
========================================================= */

const NOAH_EVENTS = [
  {
    id: "N01",
    type: "setup",
    location: "Coastal Town",
    characters: ["Noah", "Father"],
    objects: [],
    action: "Noah lives with his father in a small coastal town."
  },
  {
    id: "N02",
    type: "movement",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: [],
    action: "Noah enters his father's workshop one morning."
  },
  {
    id: "N03",
    type: "discovery",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah discovers an old lighthouse journal on the workbench."
  },
  {
    id: "N04",
    type: "discovery",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah opens the journal and begins reading."
  },
  {
    id: "N05",
    type: "warning",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah reads a warning about a powerful storm approaching the town."
  },
  {
    id: "N06",
    type: "realization",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah realizes the storm could put the town in danger."
  },
  {
    id: "N07",
    type: "decision",
    location: "Father's Workshop",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah decides to warn the villagers."
  },
  {
    id: "N08",
    type: "movement",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Journal"],
    action: "Noah leaves the workshop and heads into town."
  },
  {
    id: "N09",
    type: "warning",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: ["Lighthouse Journal"],
    action: "Noah warns the villagers about the approaching storm."
  },
  {
    id: "N10",
    type: "conflict",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: ["Lighthouse Journal"],
    action: "The villagers doubt Noah's warning."
  },
  {
    id: "N11",
    type: "weather",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: [],
    action: "Dark storm clouds begin gathering over the town."
  },
  {
    id: "N12",
    type: "weather",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: [],
    action: "Strong wind begins moving through the town."
  },
  {
    id: "N13",
    type: "weather",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: [],
    action: "Rain begins falling as the storm reaches the town."
  },
  {
    id: "N14",
    type: "realization",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah notices the lighthouse signal has stopped working."
  },
  {
    id: "N15",
    type: "realization",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah realizes boats may not see the harbor safely."
  },
  {
    id: "N16",
    type: "decision",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah decides to repair the lighthouse signal."
  },
  {
    id: "N17",
    type: "movement",
    location: "Coastal Town",
    characters: ["Noah"],
    objects: [],
    action: "Noah runs through the storm toward the lighthouse."
  },
  {
    id: "N18",
    type: "movement",
    location: "Lighthouse",
    characters: ["Noah"],
    objects: [],
    action: "Noah reaches the lighthouse and enters."
  },
  {
    id: "N19",
    type: "movement",
    location: "Lighthouse Stairwell",
    characters: ["Noah"],
    objects: [],
    action: "Noah climbs the lighthouse stairs toward the signal room."
  },
  {
    id: "N20",
    type: "movement",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "Noah reaches the signal room."
  },
  {
    id: "N21",
    type: "inspection",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"],
    action: "Noah examines the damaged signal mechanism."
  },
  {
    id: "N22",
    type: "action",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"],
    action: "Noah prepares his repair tools."
  },
  {
    id: "N23",
    type: "action",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"],
    action: "Noah begins repairing the damaged mechanism."
  },
  {
    id: "N24",
    type: "action",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal", "Repair Tools"],
    action: "Noah completes the critical repair."
  },
  {
    id: "N25",
    type: "climax",
    location: "Lighthouse Signal Room",
    characters: ["Noah"],
    objects: ["Lighthouse Signal"],
    action: "The lighthouse signal turns back on."
  },
  {
    id: "N26",
    type: "movement",
    location: "Open Sea",
    characters: ["RescueCrew"],
    objects: ["Rescue Boat", "Lighthouse Signal"],
    action: "A rescue boat follows the restored lighthouse signal."
  },
  {
    id: "N27",
    type: "movement",
    location: "Harbor",
    characters: ["RescueCrew"],
    objects: ["Rescue Boat", "Lighthouse Signal"],
    action: "The rescue boat approaches the harbor safely."
  },
  {
    id: "N28",
    type: "rescue",
    location: "Harbor",
    characters: ["RescueCrew"],
    objects: ["Rescue Boat"],
    action: "The rescue boat reaches the harbor safely."
  },
  {
    id: "N29",
    type: "resolution",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: [],
    action: "By morning, the storm has passed and the town is calm again."
  },
  {
    id: "N30",
    type: "resolution",
    location: "Coastal Town",
    characters: ["Noah", "Villagers"],
    objects: [],
    action: "The villagers thank Noah for helping save the town."
  }
];

/* =========================================================
   V31 — 10 SECOND SCENE BUDGET
   Each scene has a primary visual beat.
========================================================= */

function createNoah60Plan() {
  return [
    {
      scene: 1,
      primary: ["N03", "N04"],
      location: "Father's Workshop",
      action:
        "Noah discovers the old lighthouse journal on the workbench and opens it to read."
    },

    {
      scene: 2,
      primary: ["N05", "N09", "N10"],
      location: "Coastal Town",
      action:
        "Noah warns the villagers about the powerful storm, but they doubt his warning."
    },

    {
      scene: 3,
      primary: ["N11", "N12", "N13", "N14"],
      location: "Coastal Town",
      action:
        "The storm reaches the town with dark clouds, strong wind and rain, and Noah notices the lighthouse signal has gone dark."
    },

    {
      scene: 4,
      primary: ["N16", "N17", "N18", "N19", "N20", "N21"],
      location: "Lighthouse Signal Room",
      action:
        "Noah runs through the storm to the lighthouse, climbs to the signal room, and examines the damaged mechanism."
    },

    {
      scene: 5,
      primary: ["N22", "N23", "N24", "N25"],
      location: "Lighthouse Signal Room",
      action:
        "Noah works on the damaged mechanism until the lighthouse signal turns back on."
    },

    {
      scene: 6,
      primary: ["N26", "N27", "N28", "N29", "N30"],
      location: "Harbor / Coastal Town",
      action:
        "The rescue boat reaches the harbor safely, then the next morning Noah is thanked by the villagers after the storm has passed."
    }
  ];
}

/* =========================================================
   CAMERA
========================================================= */

function cameraForScene(sceneNumber) {
  switch (sceneNumber) {
    case 1:
      return "Gentle cinematic push-in from Noah to the journal, ending with a close-up of the opened pages.";

    case 2:
      return "Medium shot of Noah addressing the villagers, followed by short reaction shots showing their doubt.";

    case 3:
      return "Wide storm establishing shot followed by a focused close-up of Noah looking toward the dark lighthouse.";

    case 4:
      return "Dynamic tracking shot of Noah running toward the lighthouse, followed by a vertical stair-climb shot and a tight inspection close-up.";

    case 5:
      return "Tight close-ups of Noah's hands repairing the mechanism, ending with a dramatic reveal of the lighthouse beam returning.";

    case 6:
      return "Wide harbor shot of the rescue boat arriving beneath the lighthouse beam, followed by a short peaceful morning shot of Noah with grateful villagers.";

    default:
      return "Natural cinematic camera movement focused on the primary story action.";
  }
}

/* =========================================================
   LIGHTING
========================================================= */

function lightingForScene(sceneNumber) {
  switch (sceneNumber) {
    case 1:
      return "Natural calm morning daylight entering the workshop.";

    case 2:
      return "Overcast daytime light with early storm clouds developing.";

    case 3:
      return "Darkening storm light with strong wind, rain and wet reflections.";

    case 4:
      return "Dark storm lighting with cool ambient light entering the lighthouse from outside.";

    case 5:
      return "Dark storm lighting with strong contrast and the restored lighthouse beam creating a dramatic glow.";

    case 6:
      return "Transition from stormy harbor conditions to soft early morning light after the storm, with calm water.";

    default:
      return "Natural cinematic lighting appropriate to the story moment.";
  }
}

/* =========================================================
   DIALOGUE
========================================================= */

function dialogueForScene(sceneNumber) {
  switch (sceneNumber) {
    case 1:
      return "What's this old journal doing here?";

    case 2:
      return "A powerful storm is coming. Please listen to me.";

    case 3:
      return "The lighthouse signal is out.";

    case 4:
      return "I have to fix it before the boats arrive.";

    case 5:
      return "Come on... work.";

    case 6:
      return "They're safe.";

    default:
      return "";
  }
}

/* =========================================================
   VOICEOVER
========================================================= */

function voiceoverForScene(sceneNumber) {
  switch (sceneNumber) {
    case 1:
      return "Noah discovers an old lighthouse journal in his father's workshop.";

    case 2:
      return "Noah warns the villagers, but they refuse to believe the storm is coming.";

    case 3:
      return "The storm arrives, and Noah sees that the lighthouse signal has failed.";

    case 4:
      return "Noah races through the storm, reaches the lighthouse, and finds the signal mechanism damaged.";

    case 5:
      return "Noah repairs the mechanism and restores the lighthouse beam.";

    case 6:
      return "The rescue boat reaches the harbor safely. By morning, the grateful villagers thank Noah.";

    default:
      return "";
  }
}

/* =========================================================
   CHARACTER / OBJECT HELPERS
========================================================= */

function getCharacters(events) {
  return unique(events.flatMap(e => e.characters || []));
}

function getObjects(events) {
  return unique(events.flatMap(e => e.objects || []));
}

function resolveCharacterLock(name) {
  if (name === "RescueCrew") return CHARACTER_LOCKS.RescueCrew;
  return CHARACTER_LOCKS[name] || name;
}

/* =========================================================
   VISUAL PROMPT
========================================================= */

function buildVisualPrompt({
  characters,
  location,
  objects,
  action,
  camera,
  lighting
}) {
  const characterText = characters
    .map(resolveCharacterLock)
    .join(". ");

  const objectText =
    objects.length > 0
      ? `Important visible objects: ${objects.join(", ")}.`
      : "Show only necessary story elements.";

  return cleanText(`
Cinematic live-action movie scene.

Characters: ${characterText}.

Keep exact character identity, face, age, hairstyle, body proportions and clothing consistent throughout the entire video.

Location: ${location}.

${objectText}

Visible action: ${action}

Camera: ${camera}

Lighting: ${lighting}

Realistic human movement, believable physics, natural facial expressions,
cinematic depth of field, detailed environment, realistic weather and atmosphere.

Keep the action physically believable for a ten-second shot.
Do not invent unrelated events.
Do not introduce unrelated characters or props.
No text overlays.
No subtitles.
No logos.
No meta instructions.
`);
}

/* =========================================================
   NOAH SCENE BUILDER
========================================================= */

function buildNoahScenes(duration) {
  const requiredScenes = duration / SCENE_DURATION;

  /*
    60-second version:
    Use the carefully designed six-scene cinematic plan.
  */
  if (requiredScenes === 6) {
    const plan = createNoah60Plan();

    return plan.map((item, index) => {
      const times = sceneTimes(index);

      const events = item.primary
        .map(id => NOAH_EVENTS.find(e => e.id === id))
        .filter(Boolean);

      const characters = getCharacters(events);
      const objects = getObjects(events);

      /*
        Scene 6 needs Noah + villagers for the final resolution.
      */
      if (index === 5) {
        if (!characters.includes("Noah")) {
          characters.push("Noah");
        }

        if (!characters.includes("Villagers")) {
          characters.push("Villagers");
        }
      }

      const camera = cameraForScene(index + 1);
      const lighting = lightingForScene(index + 1);

      const visualPrompt = buildVisualPrompt({
        characters,
        location: item.location,
        objects,
        action: item.action,
        camera,
        lighting
      });

      return {
        scene_number: index + 1,
        start_time: times.start_time,
        end_time: times.end_time,
        characters,
        location: item.location,
        objects,
        visual_prompt: visualPrompt,
        camera,
        lighting,
        action: item.action,
        dialogue: dialogueForScene(index + 1),
        voiceover: voiceoverForScene(index + 1),
        continuity:
          "Maintain exact Noah character identity, lighthouse appearance, signal mechanism, weather progression and story continuity."
      };
    });
  }

  /*
    30-second version:
    Preserve beginning, conflict, climax and resolution.
  */
  if (requiredScenes === 3) {
    const plan = [
      {
        location: "Father's Workshop / Coastal Town",
        characters: ["Noah", "Villagers"],
        objects: ["Lighthouse Journal"],
        action:
          "Noah discovers the lighthouse journal, learns about the approaching storm, warns the villagers, and they doubt him."
      },
      {
        location: "Coastal Town / Lighthouse Signal Room",
        characters: ["Noah"],
        objects: ["Lighthouse Signal", "Repair Tools"],
        action:
          "The storm reaches town, the lighthouse signal fails, and Noah races to the lighthouse to repair it."
      },
      {
        location: "Harbor / Coastal Town",
        characters: ["Noah", "RescueCrew", "Villagers"],
        objects: ["Rescue Boat", "Lighthouse Signal"],
        action:
          "The restored signal guides the rescue boat safely into the harbor, and by morning the villagers thank Noah."
      }
    ];

    return plan.map((item, index) => {
      const times = sceneTimes(index);
      const camera = cameraForScene(index + 1);
      const lighting = lightingForScene(index + 1);

      const visualPrompt = buildVisualPrompt({
        characters: item.characters,
        location: item.location,
        objects: item.objects,
        action: item.action,
        camera,
        lighting
      });

      return {
        scene_number: index + 1,
        start_time: times.start_time,
        end_time: times.end_time,
        characters: item.characters,
        location: item.location,
        objects: item.objects,
        visual_prompt: visualPrompt,
        camera,
        lighting,
        action: item.action,
        dialogue: "",
        voiceover: item.action,
        continuity:
          "Maintain exact chronological story continuity."
      };
    });
  }

  /*
    10-second version:
    Use the story's central causal chain rather than
    simply sampling random events.
  */
  if (requiredScenes === 1) {
    const item = {
      location: "Coastal Town / Lighthouse / Harbor",
      characters: ["Noah", "Villagers", "RescueCrew"],
      objects: [
        "Lighthouse Journal",
        "Lighthouse Signal",
        "Repair Tools",
        "Rescue Boat"
      ],
      action:
        "Noah discovers the storm warning, warns the town, repairs the failed lighthouse signal, and the restored signal guides a rescue boat safely to the harbor."
    };

    const times = sceneTimes(0);

    const camera =
      "Compressed cinematic sequence moving from the journal discovery to the storm, lighthouse repair, restored beam and safe harbor arrival.";

    const lighting =
      "Cinematic progression from calm morning light through storm darkness to the restored lighthouse beam.";

    const visualPrompt = buildVisualPrompt({
      characters: item.characters,
      location: item.location,
      objects: item.objects,
      action: item.action,
      camera,
      lighting
    });

    return [
      {
        scene_number: 1,
        start_time: times.start_time,
        end_time: times.end_time,
        characters: item.characters,
        location: item.location,
        objects: item.objects,
        visual_prompt: visualPrompt,
        camera,
        lighting,
        action: item.action,
        dialogue: "",
        voiceover:
          "Noah discovers the warning, saves the lighthouse signal, and helps guide a rescue boat safely to harbor.",
        continuity:
          "Maintain exact story chronology and character continuity."
      }
    ];
  }

  /*
    Long-form mode:
    30 scenes = one meaningful event per scene.
    60 scenes = two controlled cinematic beats per event.
    120 scenes = four controlled beats per event.
  */

  const base = NOAH_EVENTS.map(event => ({
    event
  }));

  const sceneList = [];

  if (requiredScenes === 30) {
    for (let i = 0; i < 30; i++) {
      sceneList.push(base[i].event);
    }
  } else if (requiredScenes === 60) {
    for (const event of NOAH_EVENTS) {
      sceneList.push(event);
      sceneList.push({
        ...event,
        action:
          event.type === "action"
            ? `A closer continuation of the repair work: ${event.action}`
            : `A cinematic continuation of the same moment: ${event.action}`
      });
    }
  } else {
    for (const event of NOAH_EVENTS) {
      for (let i = 0; i < 4; i++) {
        sceneList.push({
          ...event,
          action:
            i === 0
              ? event.action
              : `A cinematic continuation of the same story moment: ${event.action}`
        });
      }
    }

    /*
      Final resolution protection.
    */
    sceneList[sceneList.length - 1] = NOAH_EVENTS[29];
  }

  const finalScenes = sceneList.slice(0, requiredScenes);

  return finalScenes.map((event, index) => {
    const times = sceneTimes(index);

    const camera =
      event.type === "action"
        ? "Tight cinematic close-up focused on the physical task."
        : event.type === "movement"
          ? "Smooth cinematic tracking shot following the character's movement."
          : event.type === "discovery"
            ? "Slow cinematic push-in toward the important story object."
            : event.type === "resolution"
              ? "Wide cinematic closing shot emphasizing the emotional resolution."
              : "Cinematic medium shot focused on the character's immediate action.";

    const lighting =
      event.type === "weather"
        ? "Darkening storm lighting with realistic wind and rain."
        : event.phase === "resolution"
          ? "Soft peaceful morning light after the storm."
          : event.phase === "climax"
            ? "Dark storm lighting with strong cinematic contrast."
            : "Natural cinematic lighting appropriate to the story moment.";

    const visualPrompt = buildVisualPrompt({
      characters: event.characters,
      location: event.location,
      objects: event.objects,
      action: event.action,
      camera,
      lighting
    });

    return {
      scene_number: index + 1,
      start_time: times.start_time,
      end_time: times.end_time,
      characters: event.characters,
      location: event.location,
      objects: event.objects,
      visual_prompt: visualPrompt,
      camera,
      lighting,
      action: event.action,
      dialogue: "",
      voiceover: event.action,
      continuity:
        "Maintain exact chronological story continuity."
    };
  });
}

/* =========================================================
   GENERIC STORY ENGINE
========================================================= */

function splitSentences(text) {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(cleanText)
    .filter(Boolean);
}

function buildGenericScenes(prompt, duration) {
  const count = duration / SCENE_DURATION;
  const sentences = splitSentences(prompt);

  const scenes = [];

  for (let i = 0; i < count; i++) {
    const sentence =
      sentences[i] ||
      sentences[sentences.length - 1] ||
      "The story continues.";

    const times = sceneTimes(i);

    const action =
      i === count - 1
        ? `${sentence} The story reaches its final resolution.`
        : sentence;

    const camera =
      i === 0
        ? "Cinematic establishing shot followed by a gentle push-in."
        : i === count - 1
          ? "Wide cinematic closing shot emphasizing the final resolution."
          : "Cinematic medium shot following the main character.";

    const lighting =
      i === count - 1
        ? "Cinematic lighting appropriate to the final resolution."
        : "Natural cinematic lighting appropriate to the current story moment.";

    const visualPrompt = buildVisualPrompt({
      characters: ["Main Character"],
      location: "Story Location",
      objects: [],
      action,
      camera,
      lighting
    });

    scenes.push({
      scene_number: i + 1,
      start_time: times.start_time,
      end_time: times.end_time,
      characters: ["Main Character"],
      location: "Story Location",
      objects: [],
      visual_prompt: visualPrompt,
      camera,
      lighting,
      action,
      dialogue: "",
      voiceover: sentence,
      continuity:
        "Maintain exact character identity and chronological story continuity."
    });
  }

  return scenes;
}

/* =========================================================
   VALIDATION
========================================================= */

function validateScenes(scenes, duration) {
  const errors = [];

  const expected = duration / SCENE_DURATION;

  if (scenes.length !== expected) {
    errors.push(
      `Expected ${expected} scenes but received ${scenes.length}.`
    );
  }

  scenes.forEach((scene, index) => {
    const expectedStart = `${index * 10}s`;
    const expectedEnd = `${(index + 1) * 10}s`;

    if (
      scene.start_time !== expectedStart ||
      scene.end_time !== expectedEnd
    ) {
      errors.push(`Scene ${index + 1} timing is incorrect.`);
    }

    if (!scene.visual_prompt) {
      errors.push(`Scene ${index + 1} has no visual prompt.`);
    }

    if (!scene.action) {
      errors.push(`Scene ${index + 1} has no action.`);
    }
  });

  /*
    Story completion checks.
  */
  const allText = scenes
    .map(s => `${s.action} ${s.voiceover}`)
    .join(" ")
    .toLowerCase();

  if (isNoahStory(allText)) {
    const requiredWords = [
      ["journal", "journal"],
      ["storm", "storm"],
      ["lighthouse", "lighthouse"],
      ["repair", "repair"],
      ["rescue", "rescue"],
      ["thank", "final resolution"]
    ];

    for (const [word, label] of requiredWords) {
      if (!allText.includes(word)) {
        errors.push(`Missing Noah story element: ${label}.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/* =========================================================
   API
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message: "SANAPTAI backend is working.",
    engine: ENGINE_VERSION,
    demo_mode: DEMO_MODE,
    gemini_enabled: GEMINI_ENABLED
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const prompt = cleanText(req.body?.prompt);
    const duration = Number(req.body?.duration || 60);
    const aspectRatio = cleanText(
      req.body?.aspectRatio || "16:9"
    );

    if (!prompt) {
      return res.status(400).json({
        status: "error",
        message: "Video prompt is required."
      });
    }

    if (!ALLOWED_DURATIONS.includes(duration)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid duration."
      });
    }

    let scenes;

    if (isNoahStory(prompt)) {
      scenes = buildNoahScenes(duration);
    } else {
      scenes = buildGenericScenes(
        prompt,
        duration
      );
    }

    const validation = validateScenes(
      scenes,
      duration
    );

    res.json({
      status: "success",
      message: "PROJECT CREATED!",
      engine: ENGINE_VERSION,
      demo_mode: DEMO_MODE,
      gemini_enabled: GEMINI_ENABLED,
      duration,
      total_scenes: scenes.length,
      aspect_ratio: aspectRatio,
      validation,
      scenes
    });
  } catch (error) {
    console.error(
      "Project creation error:",
      error
    );

    res.status(500).json({
      status: "error",
      message:
        `Project creation failed. ${error.message}`
    });
  }
});

/* =========================================================
   COMPATIBILITY
========================================================= */

app.post("/api/create-project", (req, res) => {
  try {
    const prompt = cleanText(req.body?.prompt);
    const duration = Number(req.body?.duration || 60);
    const aspectRatio = cleanText(
      req.body?.aspectRatio || "16:9"
    );

    const scenes = isNoahStory(prompt)
      ? buildNoahScenes(duration)
      : buildGenericScenes(prompt, duration);

    const validation = validateScenes(
      scenes,
      duration
    );

    res.json({
      status: "success",
      message: "PROJECT CREATED!",
      engine: ENGINE_VERSION,
      duration,
      total_scenes: scenes.length,
      aspect_ratio: aspectRatio,
      validation,
      scenes
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message:
        `Project creation failed. ${error.message}`
    });
  }
});

/* =========================================================
   GEMINI RESERVED
========================================================= */

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    status: "disabled",
    message:
      "Gemini scene planning is temporarily disabled. SANAPTAI V31 is running in Demo Mode.",
    engine: ENGINE_VERSION,
    gemini_enabled: false
  });
});

/* =========================================================
   EXPRESS 5 SAFE FRONTEND FALLBACK
========================================================= */

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
  );

  console.log(
    `Demo Mode: ${DEMO_MODE}`
  );

  console.log(
    `Gemini Enabled: ${GEMINI_ENABLED}`
  );
});
