import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const ai = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

// --------------------------------------------------
// BASIC HELPERS
// --------------------------------------------------

function cleanText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function splitSentences(text) {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function normalizeDuration(value) {
  const allowed = [10, 30, 60, 300, 600, 1200];
  const n = Number(value);
  return allowed.includes(n) ? n : 60;
}

function normalizeAspectRatio(value) {
  return ["9:16", "16:9", "1:1"].includes(value)
    ? value
    : "16:9";
}

function totalScenesFor(duration) {
  return Math.max(1, Math.floor(duration / 10));
}

// --------------------------------------------------
// STORY UNDERSTANDING
// --------------------------------------------------

function extractCharacters(story) {
  const characters = [];
  const seen = new Set();

  const named =
    story.match(
      /\b(?:named|called)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g
    ) || [];

  for (const item of named) {
    const match = item.match(
      /\b(?:named|called)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/
    );

    if (match) {
      const name = match[1].trim();

      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());

        characters.push({
          role: "main",
          name,
          description: `${name}, with consistent facial features, hairstyle, age, body proportions and clothing throughout the entire story.`
        });
      }
    }
  }

  // Detect common relationship characters
  const relationPatterns = [
    ["father", "Father"],
    ["mother", "Mother"],
    ["brother", "Brother"],
    ["sister", "Sister"],
    ["friend", "Friend"],
    ["wife", "Wife"],
    ["husband", "Husband"],
    ["daughter", "Daughter"],
    ["son", "Son"],
    ["teacher", "Teacher"],
    ["villagers", "Villagers"],
    ["village", "Villagers"],
    ["police officer", "Police Officer"],
    ["doctor", "Doctor"],
    ["dog", "Dog"],
    ["cat", "Cat"],
    ["horse", "Horse"],
    ["puppy", "Puppy"],
    ["kitten", "Kitten"]
  ];

  for (const [keyword, display] of relationPatterns) {
    if (
      story.toLowerCase().includes(keyword) &&
      !seen.has(display.toLowerCase())
    ) {
      seen.add(display.toLowerCase());

      characters.push({
        role: display === "Villagers" ? "supporting_group" : "supporting",
        name: display,
        description:
          display === "Villagers"
            ? "A consistent group of villagers with natural everyday clothing and appearance."
            : `Consistent ${display.toLowerCase()} character with stable appearance, clothing and proportions.`
      });
    }
  }

  if (characters.length === 0) {
    characters.push({
      role: "main",
      name: "Main Character",
      description:
        "The primary protagonist described by the story. Maintain exact appearance, age, clothing and proportions throughout."
    });
  }

  return characters;
}

function extractLocations(story) {
  const locations = [];
  const lower = story.toLowerCase();

  const candidates = [
    ["house", "House"],
    ["home", "Home"],
    ["town", "Town"],
    ["city", "City"],
    ["village", "Village"],
    ["forest", "Forest"],
    ["school", "School"],
    ["workshop", "Workshop"],
    ["lighthouse", "Lighthouse"],
    ["harbor", "Harbor"],
    ["hospital", "Hospital"],
    ["road", "Road"],
    ["street", "Street"],
    ["beach", "Beach"],
    ["mountain", "Mountain"],
    ["river", "River"],
    ["cabin", "Cabin"],
    ["farm", "Farm"],
    ["office", "Office"],
    ["restaurant", "Restaurant"],
    ["station", "Station"],
    ["airport", "Airport"]
  ];

  for (const [keyword, display] of candidates) {
    if (lower.includes(keyword)) {
      locations.push(display);
    }
  }

  return locations.length ? [...new Set(locations)] : ["Story Location"];
}

function extractObjects(story) {
  const objects = [];
  const lower = story.toLowerCase();

  const candidates = [
    ["journal", "Journal"],
    ["book", "Book"],
    ["map", "Map"],
    ["letter", "Letter"],
    ["phone", "Phone"],
    ["car", "Car"],
    ["boat", "Boat"],
    ["key", "Key"],
    ["door", "Door"],
    ["box", "Box"],
    ["poster", "Poster"],
    ["signal", "Signal Equipment"],
    ["flashlight", "Flashlight"],
    ["weapon", "Weapon"],
    ["bag", "Bag"],
    ["camera", "Camera"],
    ["money", "Money"],
    ["food", "Food"]
  ];

  for (const [keyword, display] of candidates) {
    if (lower.includes(keyword)) {
      objects.push(display);
    }
  }

  return [...new Set(objects)];
}

// --------------------------------------------------
// EVENT EXTRACTION
// --------------------------------------------------

function classifySentence(sentence) {
  const s = sentence.toLowerCase();

  if (
    s.includes("finally") ||
    s.includes("by morning") ||
    s.includes("in the end") ||
    s.includes("eventually") ||
    s.includes("saved") ||
    s.includes("returned") ||
    s.includes("reunited") ||
    s.includes("realize") ||
    s.includes("realized")
  ) {
    return "resolution";
  }

  if (
    s.includes("decides") ||
    s.includes("decided") ||
    s.includes("chooses") ||
    s.includes("chose") ||
    s.includes("tries to") ||
    s.includes("attempts")
  ) {
    return "decision";
  }

  if (
    s.includes("discovers") ||
    s.includes("finds") ||
    s.includes("find") ||
    s.includes("learns") ||
    s.includes("sees") ||
    s.includes("notices") ||
    s.includes("hears")
  ) {
    return "discovery";
  }

  if (
    s.includes("storm") ||
    s.includes("danger") ||
    s.includes("attacks") ||
    s.includes("threat") ||
    s.includes("chasing") ||
    s.includes("trapped") ||
    s.includes("broken") ||
    s.includes("stops")
  ) {
    return "conflict";
  }

  if (
    s.includes("repairs") ||
    s.includes("rescues") ||
    s.includes("escapes") ||
    s.includes("climbs") ||
    s.includes("runs") ||
    s.includes("carries") ||
    s.includes("builds") ||
    s.includes("opens") ||
    s.includes("warns") ||
    s.includes("guides")
  ) {
    return "action";
  }

  return "setup";
}

function buildStoryEvents(story) {
  const sentences = splitSentences(story);

  return sentences.map((sentence, index) => ({
    event_id: index + 1,
    source_sentence: sentence,
    type: classifySentence(sentence),
    importance: index === sentences.length - 1 ? "critical" : "normal"
  }));
}

// --------------------------------------------------
// DYNAMIC BEAT EXPANSION
// --------------------------------------------------

function expandEvent(event, index, totalEvents) {
  const sentence = event.source_sentence;
  const type = event.type;

  const beats = [];

  if (type === "setup") {
    beats.push(
      {
        phase: "setup",
        action: `Establish the situation described in: ${sentence}`
      },
      {
        phase: "reaction",
        action: `Show the main character naturally experiencing the situation from: ${sentence}`
      }
    );
  } else if (type === "discovery") {
    beats.push(
      {
        phase: "discovery",
        action: `Show the character approaching the discovery described in: ${sentence}`
      },
      {
        phase: "revelation",
        action: `Clearly reveal the important discovery from: ${sentence}`
      },
      {
        phase: "reaction",
        action: `Show the character's natural reaction to the discovery`
      }
    );
  } else if (type === "decision") {
    beats.push(
      {
        phase: "decision",
        action: `Show the character realizing what must be done from: ${sentence}`
      },
      {
        phase: "preparation",
        action: `Show the character preparing to act on that decision`
      }
    );
  } else if (type === "conflict") {
    beats.push(
      {
        phase: "conflict",
        action: `Clearly establish the problem described in: ${sentence}`
      },
      {
        phase: "reaction",
        action: `Show the character reacting to the developing conflict`
      },
      {
        phase: "escalation",
        action: `Increase the tension while staying faithful to: ${sentence}`
      }
    );
  } else if (type === "action") {
    beats.push(
      {
        phase: "action",
        action: `Show the main action described in: ${sentence}`
      },
      {
        phase: "consequence",
        action: `Show the immediate consequence of that action`
      }
    );
  } else if (type === "resolution") {
    beats.push(
      {
        phase: "resolution",
        action: `Show the outcome described in: ${sentence}`
      },
      {
        phase: "final",
        action: `Clearly complete the story according to: ${sentence}`
      }
    );
  }

  if (beats.length === 0) {
    beats.push({
      phase: "story",
      action: sentence
    });
  }

  return beats.map((beat, subIndex) => ({
    ...beat,
    event_id: event.event_id,
    source_sentence: sentence,
    beat_index: subIndex + 1
  }));
}

// --------------------------------------------------
// TIMELINE BUILDER
// --------------------------------------------------

function buildTimeline(story, totalScenes) {
  const events = buildStoryEvents(story);

  let beats = [];

  for (let i = 0; i < events.length; i++) {
    beats.push(...expandEvent(events[i], i, events.length));
  }

  // Guarantee final source sentence survives.
  const finalSentence =
    events.length > 0
      ? events[events.length - 1].source_sentence
      : story;

  // If there are too few beats, add meaningful continuity beats.
  while (beats.length < totalScenes) {
    const source =
      beats.length > 0
        ? beats[beats.length % beats.length]
        : {
            phase: "story",
            action: story,
            source_sentence: story,
            event_id: 1
          };

    beats.push({
      phase: "continuation",
      action: `Continue the story naturally from the previous action without introducing a new unrelated event.`,
      source_sentence: source.source_sentence,
      event_id: source.event_id
    });
  }

  // If there are too many beats, distribute scenes across the story
  // while always protecting the final story event.
  if (beats.length > totalScenes) {
    const selected = [];

    const lastIndex = beats.length - 1;

    for (let i = 0; i < totalScenes - 1; i++) {
      const ratio = i / Math.max(1, totalScenes - 1);
      const index = Math.floor(ratio * lastIndex);

      const candidate = beats[index];

      if (
        !selected.some(
          b =>
            b.source_sentence === candidate.source_sentence &&
            b.phase === candidate.phase
        )
      ) {
        selected.push(candidate);
      }
    }

    selected.push(
      beats.find(
        b =>
          b.source_sentence === finalSentence &&
          (b.phase === "final" || b.phase === "resolution")
      ) || beats[lastIndex]
    );

    beats = selected.slice(0, totalScenes);
  }

  // Exact scene count.
  while (beats.length < totalScenes) {
    beats.push({
      phase: "continuation",
      action:
        "Continue naturally from the previous scene while preserving the story's established characters, location, props and objective.",
      source_sentence: finalSentence,
      event_id: events.length || 1
    });
  }

  return beats.slice(0, totalScenes);
}

// --------------------------------------------------
// LIGHTING ENGINE
// --------------------------------------------------

function lightingForScene(beat, sceneNumber, totalScenes) {
  const phase = beat.phase;
  const text = `${beat.action} ${beat.source_sentence}`.toLowerCase();

  if (
    sceneNumber === totalScenes ||
    phase === "final" ||
    phase === "resolution"
  ) {
    return "Natural lighting appropriate to the final story outcome. If the story explicitly reaches morning, use peaceful morning light; if night, use realistic night lighting. Do not introduce weather or lighting that contradicts the story.";
  }

  if (
    text.includes("storm") ||
    text.includes("rain") ||
    text.includes("heavy wind")
  ) {
    return "Dramatic weather lighting matching the active storm or rain described by the story, with realistic atmospheric depth and wet surfaces only when appropriate.";
  }

  if (
    phase === "discovery" ||
    phase === "revelation"
  ) {
    return "Cinematic natural lighting appropriate to the established location and time of day, with subtle emphasis on the discovery.";
  }

  if (
    phase === "conflict" ||
    phase === "escalation"
  ) {
    return "Cinematic dramatic lighting matching the established environment and time of day, increasing tension without changing the story's actual weather.";
  }

  return "Natural cinematic lighting appropriate to the established location, time of day and weather. Maintain realistic shadows and consistent visual continuity.";
}

// --------------------------------------------------
// CAMERA ENGINE
// --------------------------------------------------

function cameraForScene(beat, sceneNumber, totalScenes) {
  if (sceneNumber === 1) {
    return "Wide cinematic establishing shot followed by a gentle character-focused push-in.";
  }

  if (sceneNumber === totalScenes) {
    return "Wide emotional establishing shot followed by a slow cinematic push toward the final story outcome.";
  }

  if (beat.phase === "discovery" || beat.phase === "revelation") {
    return "Medium cinematic shot followed by a subtle push-in toward the important discovery.";
  }

  if (
    beat.phase === "action" ||
    beat.phase === "conflict" ||
    beat.phase === "escalation"
  ) {
    return "Dynamic cinematic tracking shot with controlled movement that follows the action.";
  }

  return "Natural cinematic medium shot with subtle camera movement.";
}

// --------------------------------------------------
// DIALOGUE ENGINE
// --------------------------------------------------

function dialogueForScene(beat, sceneNumber, totalScenes) {
  if (sceneNumber === totalScenes) {
    return "We made it through.";
  }

  if (beat.phase === "discovery" || beat.phase === "revelation") {
    return "What is this?";
  }

  if (beat.phase === "conflict" || beat.phase === "escalation") {
    return "Something is wrong.";
  }

  if (beat.phase === "decision") {
    return "I have to do something.";
  }

  if (beat.phase === "action") {
    return "Let's do this.";
  }

  if (beat.phase === "reaction") {
    return "I need to understand what happened.";
  }

  return "This is where it all begins.";
}

// --------------------------------------------------
// VOICEOVER ENGINE
// --------------------------------------------------

function voiceoverForScene(beat, sceneNumber, totalScenes) {
  if (sceneNumber === totalScenes) {
    return `In the end, ${beat.source_sentence}`;
  }

  if (beat.phase === "continuation") {
    return "The story moves forward as the consequences of the previous moment unfold.";
  }

  return beat.source_sentence;
}

// --------------------------------------------------
// VISUAL PROMPT
// --------------------------------------------------

function visualPromptForScene({
  beat,
  characters,
  locations,
  objects,
  aspectRatio,
  sceneNumber,
  totalScenes
}) {
  const characterNames = characters.map(c => c.name).join(", ");

  const relevantLocations =
    locations.length > 0 ? locations.join(", ") : "established story location";

  const relevantObjects =
    objects.length > 0 ? objects.join(", ") : "only story-relevant props";

  return `Cinematic ${aspectRatio} scene. Visually portray this exact story beat: ${beat.action}. Characters present when relevant: ${characterNames}. Established locations: ${relevantLocations}. Relevant story props only: ${relevantObjects}. Maintain exact character continuity, realistic movement, natural facial expressions and believable physical behavior. Do not add unrelated characters, vehicles, objects, locations or events. Do not change established age, face, hairstyle, clothing, body proportions or important story props. Scene ${sceneNumber} of ${totalScenes}.`;
}

// --------------------------------------------------
// CREATE PROJECT
// --------------------------------------------------

function createProject({ prompt, duration, aspectRatio }) {
  const totalScenes = totalScenesFor(duration);

  const story = cleanText(prompt);

  const characters = extractCharacters(story);
  const locations = extractLocations(story);
  const objects = extractObjects(story);

  const events = buildStoryEvents(story);
  const timeline = buildTimeline(story, totalScenes);

  const scenes = timeline.map((beat, index) => {
    const sceneNumber = index + 1;

    return {
      scene_number: sceneNumber,
      start_time: `${index * 10}s`,
      end_time: `${(index + 1) * 10}s`,

      visual_prompt: visualPromptForScene({
        beat,
        characters,
        locations,
        objects,
        aspectRatio,
        sceneNumber,
        totalScenes
      }),

      camera: cameraForScene(
        beat,
        sceneNumber,
        totalScenes
      ),

      lighting: lightingForScene(
        beat,
        sceneNumber,
        totalScenes
      ),

      action: beat.action,

      dialogue: dialogueForScene(
        beat,
        sceneNumber,
        totalScenes
      ),

      voiceover: voiceoverForScene(
        beat,
        sceneNumber,
        totalScenes
      ),

      continuity:
        sceneNumber === 1
          ? "Opening scene. Establish the story clearly."
          : sceneNumber === totalScenes
            ? "Final scene. Complete the story and preserve all established character and world continuity."
            : `Continue directly from Scene ${sceneNumber - 1}. Preserve exact character appearance, clothing, location, props and story progression.`
    };
  });

  return {
    version: "V14",
    mode: "Universal Story Engine Demo",
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

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    status: "SANAPTAI V14 is live",
    engine: "Universal Story Engine",
    mode: "Demo",
    video_generation: false,
    gemini_enabled: Boolean(ai)
  });
});

// Demo mode — NO GEMINI REQUEST
app.post("/api/demo-project", (req, res) => {
  try {
    const prompt = cleanText(req.body?.prompt);

    if (!prompt) {
      return res.status(400).json({
        error: "Story prompt is required."
      });
    }

    const duration = normalizeDuration(req.body?.duration);
    const aspectRatio = normalizeAspectRatio(
      req.body?.aspectRatio
    );

    const project = createProject({
      prompt,
      duration,
      aspectRatio
    });

    res.json(project);
  } catch (error) {
    console.error("Demo project error:", error);

    res.status(500).json({
      error: "Project creation failed.",
      details: error.message
    });
  }
});

// Reserved AI route
app.post("/api/plan-scenes", async (req, res) => {
  res.status(501).json({
    error: "AI planning mode is reserved for a later version.",
    version: "V14"
  });
});

// Compatibility route
app.post("/api/create-project", (req, res) => {
  try {
    const prompt = cleanText(req.body?.prompt);

    if (!prompt) {
      return res.status(400).json({
        error: "Story prompt is required."
      });
    }

    const duration = normalizeDuration(req.body?.duration);
    const aspectRatio = normalizeAspectRatio(
      req.body?.aspectRatio
    );

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

app.get("/api/test", (req, res) => {
  res.json({
    status: "OK",
    version: "V14",
    engine: "Universal Story Engine",
    demo_mode: true,
    gemini_calls: false
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(`SANAPTAI V14 running on port ${PORT}`);
});
