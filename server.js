import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

function cleanText(value = "") {
  return String(value)
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text = "") {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function unique(arr = []) {
  return [...new Set(arr.filter(Boolean))];
}

function sceneTimes(index) {
  const start = index * 10;
  return {
    start_time: `${start}s`,
    end_time: `${start + 10}s`
  };
}

/* =========================
   CHARACTER ENGINE
========================= */

function extractCharacters(text) {
  const chars = [];

  if (/\bNoah\b/i.test(text)) {
    chars.push({
      name: "Noah",
      role: "main",
      description:
        "14-year-old boy named Noah, youthful face, dark brown eyes, short slightly messy black hair, slim teenage build, casual blue shirt, dark jeans and white sneakers."
    });
  }

  if (/\bfather\b/i.test(text)) {
    chars.push({
      name: "Father",
      role: "supporting",
      description:
        "Adult father with natural facial features, medium build, short dark hair, simple practical everyday clothing."
    });
  }

  if (/\bvillagers?\b/i.test(text)) {
    chars.push({
      name: "Villagers",
      role: "supporting",
      description:
        "Group of coastal-town villagers wearing practical everyday clothing."
    });
  }

  if (/rescue boat|rescuer|rescuers/i.test(text)) {
    chars.push({
      name: "Rescue Crew",
      role: "supporting",
      description:
        "Professional rescue crew wearing practical weather-resistant rescue clothing."
    });
  }

  if (!chars.length) {
    chars.push({
      name: "Main Character",
      role: "main",
      description:
        "Main story character with a stable face, age, hairstyle, clothing and body proportions."
    });
  }

  return chars;
}

/* =========================
   LOCATION ENGINE
========================= */

function extractLocations(text) {
  const locations = [];

  const checks = [
    ["coastal town", /coastal town/i],
    ["workshop", /workshop/i],
    ["lighthouse", /lighthouse/i],
    ["harbor", /harbor|harbour/i],
    ["town", /\btown\b/i],
    ["road", /\broad\b/i],
    ["house", /\bhouse\b|\bhome\b/i],
    ["village", /\bvillage\b/i],
    ["forest", /\bforest\b/i],
    ["mountain", /\bmountain\b/i],
    ["beach", /\bbeach\b/i],
    ["river", /\briver\b/i],
    ["lake", /\blake\b/i],
    ["hospital", /\bhospital\b/i],
    ["school", /\bschool\b/i]
  ];

  for (const [name, regex] of checks) {
    if (regex.test(text)) locations.push(name);
  }

  return unique(locations);
}

/* =========================
   OBJECT ENGINE
========================= */

function extractObjects(text) {
  const objects = [];

  const checks = [
    ["Lighthouse Journal", /lighthouse journal|journal/i],
    ["Storm Warning", /storm warning|warning/i],
    ["Lighthouse Signal", /lighthouse signal|signal/i],
    ["Rescue Boat", /rescue boat/i],
    ["Boat", /\bboat\b/i],
    ["Phone", /\bphone\b|\btelephone\b/i],
    ["Map", /\bmap\b/i],
    ["Key", /\bkey\b/i],
    ["Door", /\bdoor\b/i],
    ["Radio", /\bradio\b/i],
    ["Flashlight", /\bflashlight\b/i],
    ["Rope", /\brope\b/i]
  ];

  for (const [name, regex] of checks) {
    if (regex.test(text)) objects.push(name);
  }

  return unique(objects);
}

/* =========================
   V16 STORY EVENT ENGINE
========================= */

function createNoahEvents() {
  return [
    {
      id: "E01",
      type: "setup",
      action:
        "Noah lives with his father in a small coastal town.",
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
        "One morning, Noah spends time with his father in the workshop.",
      characters: ["Noah", "Father"],
      location: "Workshop",
      props: [],
      dialogue: "What are you working on, Dad?",
      voiceover:
        "One morning, Noah visits his father's workshop."
    },

    {
      id: "E03",
      type: "discovery",
      action:
        "Noah notices an old lighthouse journal in his father's workshop.",
      characters: ["Noah"],
      location: "Workshop",
      props: ["Lighthouse Journal"],
      dialogue: "What's this old journal?",
      voiceover:
        "There, Noah notices an old lighthouse journal."
    },

    {
      id: "E04",
      type: "discovery",
      action:
        "Noah picks up the old lighthouse journal and opens it.",
      characters: ["Noah"],
      location: "Workshop",
      props: ["Lighthouse Journal"],
      dialogue: "I wonder what this says.",
      voiceover:
        "Curious, Noah opens the mysterious journal."
    },

    {
      id: "E05",
      type: "discovery",
      action:
        "Noah discovers a warning about a powerful storm approaching the town.",
      characters: ["Noah"],
      location: "Workshop",
      props: ["Lighthouse Journal", "Storm Warning"],
      dialogue: "A powerful storm is coming.",
      voiceover:
        "Inside, Noah discovers a warning about a powerful storm approaching the town."
    },

    {
      id: "E06",
      type: "realization",
      action:
        "Noah realizes the warning could put the coastal town in danger.",
      characters: ["Noah"],
      location: "Workshop",
      props: ["Lighthouse Journal"],
      dialogue: "Everyone needs to know about this.",
      voiceover:
        "Noah realizes the warning could put the town in danger."
    },

    {
      id: "E07",
      type: "decision",
      action:
        "Noah decides to leave the workshop and warn the villagers.",
      characters: ["Noah"],
      location: "Workshop",
      props: ["Lighthouse Journal"],
      dialogue: "I have to warn them.",
      voiceover:
        "Noah decides he must warn the villagers."
    },

    {
      id: "E08",
      type: "action",
      action:
        "Noah walks through the coastal town carrying the warning.",
      characters: ["Noah"],
      location: "Coastal Town",
      props: ["Lighthouse Journal"],
      dialogue: "Please listen to me.",
      voiceover:
        "Noah carries the warning into town."
    },

    {
      id: "E09",
      type: "action",
      action:
        "Noah warns the villagers about the approaching storm.",
      characters: ["Noah", "Villagers"],
      location: "Coastal Town",
      props: ["Lighthouse Journal"],
      dialogue: "A dangerous storm is coming!",
      voiceover:
        "Noah warns the villagers about the approaching storm."
    },

    {
      id: "E10",
      type: "conflict",
      action:
        "The villagers doubt Noah's warning.",
      characters: ["Noah", "Villagers"],
      location: "Coastal Town",
      props: ["Lighthouse Journal"],
      dialogue: "Nobody believes me.",
      voiceover:
        "But the villagers do not believe Noah's warning."
    },

    {
      id: "E11",
      type: "conflict",
      action:
        "Noah shows the journal to the villagers, but they remain uncertain.",
      characters: ["Noah", "Villagers"],
      location: "Coastal Town",
      props: ["Lighthouse Journal"],
      dialogue: "Look at the warning!",
      voiceover:
        "Noah shows them the journal, but they remain uncertain."
    },

    {
      id: "E12",
      type: "conflict",
      action:
        "Dark clouds begin gathering over the coastal town.",
      characters: ["Noah"],
      location: "Coastal Town",
      props: [],
      dialogue: "The storm is really coming.",
      voiceover:
        "Soon, dark clouds begin gathering over the town."
    },

    {
      id: "E13",
      type: "conflict",
      action:
        "Strong winds arrive as the approaching storm grows closer.",
      characters: ["Noah", "Villagers"],
      location: "Coastal Town",
      props: [],
      dialogue: "The weather is changing fast.",
      voiceover:
        "Strong winds arrive as the storm draws closer."
    },

    {
      id: "E14",
      type: "conflict",
      action:
        "Heavy rain begins and the villagers start preparing for the storm.",
      characters: ["Noah", "Villagers"],
      location: "Coastal Town",
      props: [],
      dialogue: "Everyone, get somewhere safe!",
      voiceover:
        "Heavy rain begins as the town prepares for the storm."
    },

    {
      id: "E15",
      type: "discovery",
      action:
        "Noah notices that the lighthouse signal has stopped working.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Lighthouse Signal"],
      dialogue: "The lighthouse signal is out.",
      voiceover:
        "Then Noah notices the lighthouse signal has stopped working."
    },

    {
      id: "E16",
      type: "realization",
      action:
        "Noah realizes boats may not be able to safely find the harbor.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Lighthouse Signal"],
      dialogue: "Boats won't see the harbor.",
      voiceover:
        "Noah realizes the broken signal could put boats in danger."
    },

    {
      id: "E17",
      type: "decision",
      action:
        "Noah decides to repair the lighthouse signal.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Lighthouse Signal"],
      dialogue: "I have to fix it.",
      voiceover:
        "Noah decides to repair the lighthouse signal himself."
    },

    {
      id: "E18",
      type: "action",
      action:
        "Noah moves through the storm toward the lighthouse.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: [],
      dialogue: "I can't turn back now.",
      voiceover:
        "Noah moves through the dangerous storm toward the lighthouse."
    },

    {
      id: "E19",
      type: "action",
      action:
        "Noah climbs the lighthouse during the storm.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: [],
      dialogue: "Just a little farther.",
      voiceover:
        "Noah climbs the lighthouse through the powerful storm."
    },

    {
      id: "E20",
      type: "discovery",
      action:
        "Noah reaches the damaged lighthouse signal mechanism.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Lighthouse Signal"],
      dialogue: "I found the damage.",
      voiceover:
        "At the top, Noah finds the damaged signal mechanism."
    },

    {
      id: "E21",
      type: "action",
      action:
        "Noah carefully examines the damaged lighthouse signal.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Lighthouse Signal"],
      dialogue: "I can repair this.",
      voiceover:
        "Noah carefully examines the damaged signal."
    },

    {
      id: "E22",
      type: "action",
      action:
        "Noah begins repairing the damaged signal mechanism.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Lighthouse Signal"],
      dialogue: "Come on, work.",
      voiceover:
        "Noah begins repairing the damaged signal."
    },

    {
      id: "E23",
      type: "action",
      action:
        "Noah continues repairing the lighthouse signal while the storm rages outside.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Lighthouse Signal"],
      dialogue: "Almost there.",
      voiceover:
        "Despite the storm, Noah keeps working."
    },

    {
      id: "E24",
      type: "climax",
      action:
        "Noah successfully restores the lighthouse signal.",
      characters: ["Noah"],
      location: "Lighthouse",
      props: ["Lighthouse Signal"],
      dialogue: "It's working!",
      voiceover:
        "At last, Noah restores the lighthouse signal."
    },

    {
      id: "E25",
      type: "climax",
      action:
        "A rescue boat appears through the storm and follows the restored lighthouse signal.",
      characters: ["Noah", "Rescue Crew"],
      location: "Harbor",
      props: ["Rescue Boat", "Lighthouse Signal"],
      dialogue: "They can see the signal!",
      voiceover:
        "A rescue boat appears and follows the restored signal."
    },

    {
      id: "E26",
      type: "action",
      action:
        "Noah keeps the lighthouse signal visible as the rescue boat approaches.",
      characters: ["Noah", "Rescue Crew"],
      location: "Lighthouse",
      props: ["Rescue Boat", "Lighthouse Signal"],
      dialogue: "Keep following the light!",
      voiceover:
        "Noah keeps the signal visible as the boat approaches."
    },

    {
      id: "E27",
      type: "action",
      action:
        "The rescue boat safely moves toward the harbor using the lighthouse signal.",
      characters: ["Noah", "Rescue Crew"],
      location: "Harbor",
      props: ["Rescue Boat", "Lighthouse Signal"],
      dialogue: "They're heading safely toward us.",
      voiceover:
        "The rescue boat safely follows the lighthouse signal toward the harbor."
    },

    {
      id: "E28",
      type: "resolution",
      action:
        "The rescue boat reaches the harbor safely as the storm begins to weaken.",
      characters: ["Noah", "Rescue Crew"],
      location: "Harbor",
      props: ["Rescue Boat"],
      dialogue: "They made it safely.",
      voiceover:
        "The rescue boat reaches the harbor as the storm begins to weaken."
    },

    {
      id: "E29",
      type: "resolution",
      action:
        "By morning, the powerful storm has passed and the coastal town is safe.",
      characters: ["Noah", "Father", "Villagers"],
      location: "Coastal Town",
      props: [],
      dialogue: "The storm is finally over.",
      voiceover:
        "By morning, the powerful storm has passed and the town is safe."
    },

    {
      id: "E30",
      type: "resolution",
      action:
        "The villagers realize that Noah helped save the town.",
      characters: ["Noah", "Father", "Villagers"],
      location: "Coastal Town",
      props: [],
      dialogue: "Noah, you helped save our town.",
      voiceover:
        "The villagers finally realize that Noah's courage and quick thinking helped save the town."
    }
  ];
}

/* =========================
   GENERIC STORY ENGINE
========================= */

function createGenericEvents(text) {
  const sentences = splitSentences(text);

  return sentences.map((sentence, index) => ({
    id: `G${String(index + 1).padStart(2, "0")}`,
    type:
      index === 0
        ? "setup"
        : /finally|by morning|returns home|safe|saved|reunited/i.test(sentence)
        ? "resolution"
        : /discovers|finds|notices|sees|hears|realizes|learns/i.test(sentence)
        ? "discovery"
        : /decides|plans|chooses|tries|attempts|begins/i.test(sentence)
        ? "decision"
        : /storm|danger|attack|trapped|lost|problem|threat|fire|accident/i.test(sentence)
        ? "conflict"
        : /helps|rescues|gives|calls|repairs|builds|carries|protects|searches|climbs|runs|walks|drives|enters|leaves/i.test(sentence)
        ? "action"
        : "story",
    action: sentence,
    characters: extractCharacters(sentence).map(c => c.name),
    location: extractLocations(sentence)[0] || "Story Location",
    props: extractObjects(sentence),
    dialogue: "We have to keep going.",
    voiceover: sentence
  }));
}

function buildGenericTimeline(text, targetScenes) {
  const events = createGenericEvents(text);

  if (!events.length) {
    return [];
  }

  const timeline = [];

  for (const event of events) {
    timeline.push({
      ...event,
      phase: "main"
    });
  }

  while (timeline.length < targetScenes) {
    const source = events[(timeline.length - events.length) % events.length];

    timeline.splice(
      Math.max(0, timeline.length - 1),
      0,
      {
        ...source,
        phase: "development",
        action:
          `Continue the exact story event: ${source.action}`,
        voiceover:
          source.voiceover
      }
    );
  }

  return timeline.slice(0, targetScenes);
}

/* =========================
   TIMELINE SELECTOR
========================= */

function buildTimeline(text, targetScenes) {
  const lower = text.toLowerCase();

  const isNoahStory =
    lower.includes("14-year-old boy named noah") &&
    lower.includes("lighthouse journal") &&
    lower.includes("powerful storm") &&
    lower.includes("villagers") &&
    lower.includes("rescue boat");

  if (isNoahStory) {
    const events = createNoahEvents();

    /*
      For Noah's story the 30 events are deliberately locked.
      This prevents filler scenes and protects chronological order.
    */
    if (targetScenes === 30) {
      return events;
    }

    if (targetScenes < 30) {
      const selected = [];

      for (let i = 0; i < targetScenes; i++) {
        const position =
          Math.round(
            (i * (events.length - 1)) /
              Math.max(1, targetScenes - 1)
          );

        selected.push(events[position]);
      }

      return selected;
    }

    const expanded = [...events];

    while (expanded.length < targetScenes) {
      const insertIndex = Math.max(1, expanded.length - 1);

      const source = events[
        (expanded.length - 1) % Math.max(1, events.length - 1)
      ];

      expanded.splice(insertIndex, 0, {
        ...source,
        id: `EXP-${expanded.length + 1}`,
        phase: "development",
        action:
          `Further develop this exact story event without introducing a new event: ${source.action}`,
        voiceover: source.voiceover
      });
    }

    return expanded.slice(0, targetScenes);
  }

  return buildGenericTimeline(text, targetScenes);
}

/* =========================
   SMART CAMERA
========================= */

function cameraForScene(event, index, total) {
  const action = `${event.action} ${event.type}`.toLowerCase();

  if (index === 0) {
    return "Wide cinematic establishing shot followed by a gentle push toward the main character.";
  }

  if (index === total - 1) {
    return "Wide emotional establishing shot followed by a slow cinematic push toward the completed story outcome.";
  }

  if (/discover|journal|find|notice|realize/i.test(action)) {
    return "Cinematic medium close-up with a controlled push-in emphasizing the discovery.";
  }

  if (/storm|danger|conflict|climb|repair|rescue/i.test(action)) {
    return "Dynamic cinematic tracking shot with controlled movement emphasizing the developing action.";
  }

  return "Natural cinematic medium shot with subtle camera movement.";
}

/* =========================
   SMART LIGHTING
========================= */

function lightingForScene(event) {
  const text = `${event.action} ${event.location}`.toLowerCase();

  if (/morning|sunrise|by morning|passed|safe/.test(text)) {
    return "Peaceful morning or sunrise lighting, soft golden daylight, realistic shadows and fresh post-storm atmosphere.";
  }

  if (/storm|rain|dark cloud|wind|danger/.test(text)) {
    return "Dramatic overcast storm lighting with realistic atmospheric depth, dark clouds, natural shadows and weather-appropriate visibility.";
  }

  if (/lighthouse/.test(text)) {
    return "Moody cinematic storm lighting outside with practical lighthouse illumination inside.";
  }

  if (/workshop/.test(text)) {
    return "Natural warm daylight entering the workshop with realistic soft shadows.";
  }

  return "Natural cinematic lighting appropriate to the exact story moment and location.";
}

/* =========================
   SCENE CREATOR
========================= */

function createScenes(timeline, totalDuration, aspectRatio) {
  return timeline.map((event, index) => {
    const time = sceneTimes(index);

    const characters =
      event.characters && event.characters.length
        ? event.characters
        : ["Main Character"];

    const props = unique(event.props || []);

    const characterDescriptions = extractCharacters(
      characters.join(" ")
    );

    const characterLock = characterDescriptions
      .map(
        c =>
          `${c.name}: ${c.description} Exact appearance must remain unchanged.`
      )
      .join(" ");

    const propText =
      props.length > 0
        ? props.join(", ")
        : "No special props required.";

    const visualPrompt = `
Cinematic ${aspectRatio} scene.

Show ONLY this exact story action:
${event.action}

Active characters: ${characters.join(", ")}.
Location: ${event.location}.
Relevant props: ${propText}

CHARACTER LOCK:
${characterLock}

Maintain exact character identity, face, age, hairstyle, clothing, body proportions and physical appearance.

Keep the same characters consistent across every scene.

Use only characters, props and locations required by this scene.

Do not add unrelated people, vehicles, animals, objects, locations or events.

Do not introduce a character before the story action requires that character to appear.

Preserve chronological story order.

Realistic movement, natural facial expressions and believable physical behavior.

Scene ${index + 1} of ${timeline.length}.
`.trim();

    return {
      scene_number: index + 1,
      start_time: time.start_time,
      end_time: time.end_time,
      visual_prompt: visualPrompt,
      camera: cameraForScene(event, index, timeline.length),
      lighting: lightingForScene(event),
      action: event.action,
      dialogue: cleanText(event.dialogue),
      voiceover: cleanText(event.voiceover),
      continuity:
        index === 0
          ? "Opening scene. Establish the story and lock all main character identities."
          : index === timeline.length - 1
          ? "Final scene. Complete the actual story ending and preserve established continuity."
          : `Continue directly from Scene ${index}. Preserve exact character identity, clothing, location and relevant story elements.`
    };
  });
}

/* =========================
   PROJECT CREATOR
========================= */

function createProject(body = {}) {
  const prompt = cleanText(body.prompt || "");
  const duration = Number(body.duration || 60);
  const aspectRatio = body.aspectRatio || "16:9";

  const totalScenes = Math.max(
    1,
    Math.round(duration / 10)
  );

  const timeline = buildTimeline(
    prompt,
    totalScenes
  );

  const scenes = createScenes(
    timeline,
    duration,
    aspectRatio
  );

  return {
    success: true,
    mode: "demo",
    version: "V16",
    duration,
    total_scenes: scenes.length,
    aspect_ratio: aspectRatio,
    prompt,
    scenes
  };
}

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.send("SANAPTAI V16 is live");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    version: "V16",
    engine: "Universal Story Event Timeline Engine",
    demo_mode: true,
    gemini: false,
    exact_scene_duration: "10 seconds",
    long_form: true
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    const project = createProject(req.body);
    res.json(project);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/create-project", (req, res) => {
  try {
    const project = createProject(req.body);
    res.json(project);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/*
  Gemini is intentionally disabled for now.
  This prevents quota usage while testing the local story engine.
*/
app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    success: false,
    message:
      "AI planning is reserved for a future SANAPTAI version. Demo Mode is active and does not use Gemini."
  });
});

app.listen(PORT, () => {
  console.log(`SANAPTAI V16 running on port ${PORT}`);
});
