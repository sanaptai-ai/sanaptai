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
  return String(value).replace(/\s+/g, " ").trim();
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

/* =========================================================
   CHARACTER ENGINE
========================================================= */

function getCharacter(name) {
  const locks = {
    Noah:
      "14-year-old boy named Noah, youthful face, dark brown eyes, short slightly messy black hair, slim teenage build, casual blue shirt, dark jeans and white sneakers.",

    Father:
      "Adult father with natural facial features, medium build, short dark hair, simple practical everyday clothing.",

    Villagers:
      "Group of coastal-town villagers wearing practical everyday clothing.",

    "Rescue Crew":
      "Professional rescue crew wearing practical weather-resistant rescue clothing.",

    "Main Character":
      "Main story character with a stable face, age, hairstyle, clothing, body proportions and physical appearance."
  };

  return locks[name] || locks["Main Character"];
}

function extractCharacters(text) {
  const result = [];

  if (/\bNoah\b/i.test(text)) result.push("Noah");
  if (/\bfather\b/i.test(text)) result.push("Father");
  if (/\bvillagers?\b/i.test(text)) result.push("Villagers");
  if (/rescue boat|rescuers?|rescue crew/i.test(text)) {
    result.push("Rescue Crew");
  }

  if (!result.length) result.push("Main Character");

  return unique(result);
}

/* =========================================================
   LOCATION ENGINE
========================================================= */

function extractLocation(text) {
  const checks = [
    ["Coastal Town", /coastal town/i],
    ["Workshop", /workshop/i],
    ["Lighthouse", /lighthouse/i],
    ["Harbor", /harbor|harbour/i],
    ["Town", /\btown\b/i],
    ["House", /\bhouse\b|\bhome\b/i],
    ["Road", /\broad\b/i],
    ["Village", /\bvillage\b/i],
    ["Forest", /\bforest\b/i],
    ["Mountain", /\bmountain\b/i],
    ["Beach", /\bbeach\b/i],
    ["River", /\briver\b/i],
    ["Lake", /\blake\b/i],
    ["Hospital", /\bhospital\b/i]
  ];

  for (const [name, regex] of checks) {
    if (regex.test(text)) return name;
  }

  return "Story Location";
}

/* =========================================================
   PROP ENGINE
========================================================= */

function extractProps(text) {
  const props = [];

  if (/lighthouse journal|journal/i.test(text)) {
    props.push("Lighthouse Journal");
  }

  if (/storm warning|warning/i.test(text)) {
    props.push("Storm Warning");
  }

  if (/lighthouse signal|signal/i.test(text)) {
    props.push("Lighthouse Signal");
  }

  if (/rescue boat/i.test(text)) {
    props.push("Rescue Boat");
  }

  return unique(props);
}

/* =========================================================
   NOAH CORE STORY
========================================================= */

function createNoahCoreEvents() {
  return [
    {
      id: "E01",
      type: "setup",
      action: "Noah lives with his father in a small coastal town.",
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

/* =========================================================
   V17 TWO-SCENE EXPANSION
========================================================= */

function expandCoreEvent(event) {
  const e = { ...event };

  const variants = {
    setup: [
      {
        ...e,
        phase: "establish",
        action: e.action,
        dialogue: e.dialogue,
        voiceover: e.voiceover
      },
      {
        ...e,
        phase: "reaction",
        action: `Show the characters naturally experiencing this exact situation: ${e.action}`,
        dialogue:
          e.id === "E01"
            ? "It's a quiet morning in town."
            : "Let's get started.",
        voiceover: e.voiceover
      }
    ],

    discovery: [
      {
        ...e,
        phase: "approach",
        action: e.id === "E03"
          ? "Noah notices something unusual in the workshop and moves closer to the old lighthouse journal."
          : e.id === "E04"
          ? "Noah carefully examines the old lighthouse journal before opening it."
          : e.id === "E05"
          ? "Noah studies the pages of the lighthouse journal and notices a serious warning."
          : e.id === "E15"
          ? "Noah looks toward the lighthouse and notices that its usual signal is missing."
          : e.id === "E20"
          ? "Noah reaches the top of the lighthouse and approaches the damaged signal mechanism."
          : e.action,
        dialogue:
          e.id === "E05"
            ? "Something is wrong here."
            : e.id === "E15"
            ? "Why is the light off?"
            : "What is this?",
        voiceover: e.voiceover
      },
      {
        ...e,
        phase: "reveal",
        action: e.action,
        dialogue: e.dialogue,
        voiceover: e.voiceover
      }
    ],

    realization: [
      {
        ...e,
        phase: "observation",
        action: `Noah carefully considers the situation described by this story event: ${e.action}`,
        dialogue:
          e.id === "E16"
            ? "Those boats need that signal."
            : "This could be serious.",
        voiceover: e.voiceover
      },
      {
        ...e,
        phase: "understanding",
        action: e.action,
        dialogue: e.dialogue,
        voiceover: e.voiceover
      }
    ],

    decision: [
      {
        ...e,
        phase: "choice",
        action: `Noah considers what must be done next before acting on this decision: ${e.action}`,
        dialogue:
          e.id === "E07"
            ? "Someone has to warn them."
            : "I know what I have to do.",
        voiceover: e.voiceover
      },
      {
        ...e,
        phase: "commitment",
        action: e.action,
        dialogue: e.dialogue,
        voiceover: e.voiceover
      }
    ],

    action: [
      {
        ...e,
        phase: "preparation",
        action: `Noah prepares for the exact action that follows: ${e.action}`,
        dialogue:
          e.id === "E18"
            ? "I have to reach the lighthouse."
            : e.id === "E19"
            ? "I have to keep climbing."
            : e.id === "E22"
            ? "Let's get this working."
            : e.id === "E26"
            ? "Stay with the signal."
            : "Keep moving.",
        voiceover: e.voiceover
      },
      {
        ...e,
        phase: "execution",
        action: e.action,
        dialogue: e.dialogue,
        voiceover: e.voiceover
      }
    ],

    conflict: [
      {
        ...e,
        phase: "build",
        action:
          e.id === "E12"
            ? "Noah watches dark clouds gather over the coastal town."
            : e.id === "E13"
            ? "Strong winds intensify around Noah and the villagers as the storm approaches."
            : e.id === "E14"
            ? "Heavy rain intensifies while the villagers react to the approaching storm."
            : e.action,
        dialogue:
          e.id === "E12"
            ? "Those clouds are getting darker."
            : e.id === "E13"
            ? "The storm is getting closer."
            : e.id === "E14"
            ? "We need to get inside."
            : e.dialogue,
        voiceover: e.voiceover
      },
      {
        ...e,
        phase: "consequence",
        action: e.action,
        dialogue: e.dialogue,
        voiceover: e.voiceover
      }
    ],

    climax: [
      {
        ...e,
        phase: "attempt",
        action:
          e.id === "E24"
            ? "Noah makes the final connection and attempts to restore the lighthouse signal."
            : e.id === "E25"
            ? "Through the storm, Noah spots the rescue boat responding to the restored signal."
            : e.action,
        dialogue:
          e.id === "E24"
            ? "Please turn on."
            : e.id === "E25"
            ? "They saw the light!"
            : e.dialogue,
        voiceover: e.voiceover
      },
      {
        ...e,
        phase: "result",
        action: e.action,
        dialogue: e.dialogue,
        voiceover: e.voiceover
      }
    ],

    resolution: [
      {
        ...e,
        phase: "arrival",
        action:
          e.id === "E29"
            ? "The first calm morning arrives after the powerful storm."
            : e.id === "E30"
            ? "The villagers gather in the safe coastal town and look toward Noah."
            : e.action,
        dialogue:
          e.id === "E29"
            ? "It's finally quiet."
            : e.id === "E30"
            ? "We owe you thanks."
            : e.dialogue,
        voiceover: e.voiceover
      },
      {
        ...e,
        phase: "completion",
        action: e.action,
        dialogue: e.dialogue,
        voiceover: e.voiceover
      }
    ]
  };

  return variants[e.type] || [
    {
      ...e,
      phase: "main"
    },
    {
      ...e,
      phase: "continuation",
      action: `Continue the exact story event naturally: ${e.action}`
    }
  ];
}

/* =========================================================
   V17 LONG-FORM TIMELINE
========================================================= */

function buildNoahTimeline(targetScenes) {
  const core = createNoahCoreEvents();

  /*
    30 scenes:
    exactly one core event per scene.

    60 scenes:
    exactly two cinematic phases per core event.

    120 scenes:
    each core event gets four controlled phases.
  */

  if (targetScenes === 30) {
    return core;
  }

  if (targetScenes === 60) {
    return core.flatMap(expandCoreEvent);
  }

  if (targetScenes === 120) {
    const timeline = [];

    for (const event of core) {
      const pair = expandCoreEvent(event);

      for (const scene of pair) {
        timeline.push(scene);

        timeline.push({
          ...scene,
          phase: `${scene.phase}-continuation`,
          action:
            `Continue the same story moment without advancing to a later event: ${scene.action}`,
          dialogue:
            scene.phase === "execution"
              ? "Keep going."
              : scene.dialogue,
          voiceover: scene.voiceover
        });
      }
    }

    return timeline;
  }

  /*
    For unusual durations, sample the 60-scene structure
    while preserving chronological order and the final event.
  */

  const expanded = core.flatMap(expandCoreEvent);

  if (targetScenes < expanded.length) {
    const result = [];

    for (let i = 0; i < targetScenes; i++) {
      const index = Math.round(
        (i * (expanded.length - 1)) /
          Math.max(1, targetScenes - 1)
      );

      result.push(expanded[index]);
    }

    return result;
  }

  const result = [...expanded];

  while (result.length < targetScenes) {
    const lastCoreEvent = core[core.length - 1];

    result.splice(result.length - 1, 0, {
      ...lastCoreEvent,
      phase: "ending-development",
      action:
        "Continue the peaceful aftermath immediately before the final realization: the town remains safe after Noah's actions.",
      characters: ["Noah", "Father", "Villagers"],
      location: "Coastal Town",
      props: [],
      dialogue: "The town is safe now.",
      voiceover:
        "The town remains safe as the people prepare for the final realization."
    });
  }

  return result.slice(0, targetScenes);
}

/* =========================================================
   GENERIC ENGINE
========================================================= */

function buildGenericTimeline(prompt, targetScenes) {
  const sentences = cleanText(prompt)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const events = sentences.map((sentence, i) => ({
    id: `G${i + 1}`,
    type:
      i === 0
        ? "setup"
        : /finally|by morning|safe|saved|returns home|reunited/i.test(sentence)
        ? "resolution"
        : /discover|find|notice|see|hear|realize|learn/i.test(sentence)
        ? "discovery"
        : /decide|plan|choose|try|attempt|begin/i.test(sentence)
        ? "decision"
        : /storm|danger|attack|trapped|lost|fire|accident|threat/i.test(sentence)
        ? "conflict"
        : /help|rescue|give|call|repair|build|carry|protect|search|climb|run|walk|drive|enter|leave/i.test(sentence)
        ? "action"
        : "story",
    action: sentence,
    characters: extractCharacters(sentence),
    location: extractLocation(sentence),
    props: extractProps(sentence),
    dialogue: "We have to keep going.",
    voiceover: sentence
  }));

  const expanded = [];

  for (const event of events) {
    expanded.push(event);

    if (expanded.length < targetScenes) {
      expanded.push({
        ...event,
        phase: "development",
        action:
          `Continue this exact story moment naturally without introducing a new event: ${event.action}`
      });
    }
  }

  while (expanded.length < targetScenes) {
    const source =
      events[(expanded.length - events.length) % events.length];

    expanded.splice(expanded.length - 1, 0, {
      ...source,
      phase: "development",
      action:
        `Further develop this exact story moment without introducing a new event: ${source.action}`
    });
  }

  return expanded.slice(0, targetScenes);
}

/* =========================================================
   TIMELINE SELECTOR
========================================================= */

function buildTimeline(prompt, targetScenes) {
  const lower = prompt.toLowerCase();

  const isNoahStory =
    lower.includes("14-year-old boy named noah") &&
    lower.includes("lighthouse journal") &&
    lower.includes("powerful storm") &&
    lower.includes("villagers") &&
    lower.includes("rescue boat");

  if (isNoahStory) {
    return buildNoahTimeline(targetScenes);
  }

  return buildGenericTimeline(prompt, targetScenes);
}

/* =========================================================
   CAMERA
========================================================= */

function cameraForScene(event, index, total) {
  const text = `${event.action} ${event.phase || ""}`.toLowerCase();

  if (index === 0) {
    return "Wide cinematic establishing shot followed by a gentle push toward the main character.";
  }

  if (index === total - 1) {
    return "Wide emotional establishing shot followed by a slow cinematic push toward the completed story outcome.";
  }

  if (/notice|discover|journal|warning|signal|damage/i.test(text)) {
    return "Cinematic medium close-up with a controlled push-in emphasizing the discovery.";
  }

  if (/storm|wind|rain|climb|repair|rescue|danger/i.test(text)) {
    return "Dynamic cinematic tracking shot with controlled movement emphasizing the developing action.";
  }

  if (/morning|aftermath|safe|villagers gather/i.test(text)) {
    return "Wide cinematic shot with a slow controlled movement emphasizing the peaceful aftermath.";
  }

  return "Natural cinematic medium shot with subtle camera movement.";
}

/* =========================================================
   LIGHTING
========================================================= */

function lightingForScene(event) {
  const text = `${event.action} ${event.location} ${event.phase || ""}`.toLowerCase();

  if (/storm|wind|rain|dark cloud|danger|lighthouse signal.*out/i.test(text)) {
    return "Dramatic overcast storm lighting with dark clouds, realistic atmospheric depth, natural shadows and weather-appropriate visibility.";
  }

  if (/morning|sunrise|by morning|passed|peaceful aftermath|safe now/i.test(text)) {
    return "Peaceful morning or sunrise lighting with soft golden daylight, realistic shadows and a fresh post-storm atmosphere.";
  }

  if (/lighthouse/i.test(text)) {
    return "Moody storm lighting outside with practical lighthouse illumination inside and realistic contrast.";
  }

  if (/workshop/i.test(text)) {
    return "Natural warm morning daylight entering the workshop with realistic soft shadows.";
  }

  return "Natural cinematic lighting appropriate to the exact story moment and location.";
}

/* =========================================================
   SCENE BUILDER
========================================================= */

function createScenes(timeline, aspectRatio) {
  return timeline.map((event, index) => {
    const times = sceneTimes(index);

    const characters =
      event.characters && event.characters.length
        ? event.characters
        : ["Main Character"];

    const props = unique(event.props || []);

    const characterLock = characters
      .map(
        name =>
          `${name}: ${getCharacter(name)} Exact appearance must remain unchanged.`
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
Relevant props: ${propText}.

CHARACTER LOCK:
${characterLock}

Maintain exact character identity, face, age, hairstyle, clothing, body proportions and physical appearance.

Keep the same characters consistent across every scene.

Use only characters, props and locations required by this scene.

Do not add unrelated people, vehicles, animals, objects, locations or events.

Do not introduce a character before the story action requires that character to appear.

Preserve chronological story order.

Do not repeat an earlier story event unless this scene explicitly continues the same immediate moment.

Realistic movement, natural facial expressions and believable physical behavior.

Scene ${index + 1} of ${timeline.length}.
`.trim();

    return {
      scene_number: index + 1,
      start_time: times.start_time,
      end_time: times.end_time,
      visual_prompt: visualPrompt,
      camera: cameraForScene(event, index, timeline.length),
      lighting: lightingForScene(event),
      action: cleanText(event.action),
      dialogue: cleanText(event.dialogue),
      voiceover: cleanText(event.voiceover),
      continuity:
        index === 0
          ? "Opening scene. Establish the story and lock all main character identities."
          : index === timeline.length - 1
          ? "Final scene. Complete the actual story ending and preserve established continuity."
          : `Continue directly from Scene ${index}. Preserve exact character identity, clothing, location and immediate story progression.`
    };
  });
}

/* =========================================================
   PROJECT
========================================================= */

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
    aspectRatio
  );

  return {
    success: true,
    version: "V17",
    mode: "demo",
    gemini: false,
    duration,
    total_scenes: scenes.length,
    aspect_ratio: aspectRatio,
    prompt,
    scenes
  };
}

/* =========================================================
   ROUTES
========================================================= */

app.get("/", (req, res) => {
  res.send("SANAPTAI V17 is live");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    version: "V17",
    engine: "Chronological Long-Form Story Expansion Engine",
    demo_mode: true,
    gemini: false,
    exact_scene_duration: "10 seconds",
    supported_long_form: ["30 scenes", "60 scenes", "120 scenes"]
  });
});

app.post("/api/demo-project", (req, res) => {
  try {
    res.json(createProject(req.body));
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
    res.json(createProject(req.body));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    success: false,
    message:
      "AI planning is reserved for a future SANAPTAI version. Demo Mode does not use Gemini."
  });
});

app.listen(PORT, () => {
  console.log(`SANAPTAI V17 running on port ${PORT}`);
});
