import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 10000;

const ENGINE_VERSION = "SANAPTAI-20M-2.0";

// ============================================================
// STATIC FRONTEND
// ============================================================

app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// TEXT HELPERS
// ============================================================

function clean(value = "") {
  return String(value)
    .replace(/\r/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\.{2,}/g, ".")
    .replace(/!{2,}/g, "!")
    .replace(/\?{2,}/g, "?")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
}

function ensurePeriod(value = "") {
  const text = clean(value);

  if (!text) return "";

  if (/[.!?]$/.test(text)) {
    return text;
  }

  return `${text}.`;
}

function sentences(text = "") {
  const source = clean(text);

  if (!source) return [];

  const matches =
    source.match(/[^.!?]+[.!?]+/g) || [];

  const result = matches
    .map(clean)
    .filter((item) => item.length > 3);

  if (result.length) {
    return result;
  }

  return [source];
}

function lower(value = "") {
  return String(value).toLowerCase();
}

function unique(array = []) {
  return [...new Set(array.filter(Boolean))];
}

function safeNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

// ============================================================
// DURATION
// ============================================================

function parseDuration(value) {
  if (typeof value === "number") {
    return Math.max(
      10,
      Math.min(1200, Math.floor(value / 10) * 10)
    );
  }

  const text = lower(value);

  if (!text) {
    return 60;
  }

  const match = text.match(/(\d+(?:\.\d+)?)/);

  if (!match) {
    return 60;
  }

  const number = Number(match[1]);

  if (text.includes("minute")) {
    return Math.max(
      10,
      Math.min(1200, Math.round(number * 60 / 10) * 10)
    );
  }

  return Math.max(
    10,
    Math.min(1200, Math.floor(number / 10) * 10)
  );
}

// ============================================================
// CHARACTER INTELLIGENCE
// ============================================================

const relationshipMap = {
  mother: "Mother",
  mom: "Mother",
  mum: "Mother",

  father: "Father",
  dad: "Father",

  grandfather: "Grandfather",
  grandpa: "Grandfather",
  "grandfather's": "Grandfather",
  "grandpa's": "Grandfather",

  grandmother: "Grandmother",
  grandma: "Grandmother",

  brother: "Brother",
  sister: "Sister",

  wife: "Wife",
  husband: "Husband",

  son: "Son",
  daughter: "Daughter"
};

const bannedNames = [
  "someone",
  "something",
  "person",
  "man",
  "woman",
  "people",
  "inside",
  "outside",
  "one",
  "the"
];

function analyzeCharacters(prompt) {
  const text = String(prompt);

  const names = [];

  const patterns = [
    /\b(?:named|called)\s+([A-Z][a-z]{2,})\b/g,
    /\b(?:I am|I'm)\s+([A-Z][a-z]{2,})\b/g
  ];

  for (const regex of patterns) {
    let match;

    while ((match = regex.exec(text)) !== null) {
      const name = match[1];

      if (
        name &&
        !bannedNames.includes(lower(name)) &&
        !names.includes(name)
      ) {
        names.push(name);
      }
    }
  }

  return unique(names);
}

function findProtagonist(prompt, characters = []) {
  const text = String(prompt);

  const named =
    text.match(
      /\b(?:named|called)\s+([A-Z][a-z]{2,})\b/
    );

  if (named && named[1]) {
    return named[1];
  }

  if (characters.length) {
    return characters[0];
  }

  return "Alex";
}

function activeCharacters(sceneText, protagonist) {
  const text = lower(sceneText);

  const result = [];

  if (
    protagonist &&
    text.includes(lower(protagonist))
  ) {
    result.push(protagonist);
  }

  for (const [keyword, character] of Object.entries(
    relationshipMap
  )) {
    const regex = new RegExp(
      `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
    );

    if (!regex.test(text)) {
      continue;
    }

    if (character === "Grandfather") {
      const backstory =
        /photograph|photo|picture|journal|letter|memory|past|history|late grandfather|old grandfather/.test(
          text
        );

      const physicalAction =
        /standing|walking|sitting|waiting|running|holding|opens|opened|takes|took|enters|entered|leaves|left|arrives|arrived|travels|travelled/.test(
          text
        );

      if (backstory && !physicalAction) {
        continue;
      }
    }

    if (!result.includes(character)) {
      result.push(character);
    }
  }

  if (!result.length && protagonist) {
    result.push(protagonist);
  }

  return result;
}

// ============================================================
// LOCATION INTELLIGENCE
// ============================================================

const locationRules = [
  {
    keywords: [
      "apartment",
      "home",
      "house",
      "bedroom",
      "living room",
      "kitchen"
    ],
    name: "Alex's apartment"
  },

  {
    keywords: [
      "abandoned train station",
      "train station",
      "railway station",
      "station"
    ],
    name: "abandoned train station"
  },

  {
    keywords: [
      "street",
      "road",
      "outside",
      "city"
    ],
    name: "city street"
  },

  {
    keywords: [
      "forest",
      "woods"
    ],
    name: "forest"
  },

  {
    keywords: [
      "school"
    ],
    name: "school"
  },

  {
    keywords: [
      "hospital"
    ],
    name: "hospital"
  },

  {
    keywords: [
      "office"
    ],
    name: "office"
  }
];

function mentionedLocation(text) {
  const value = lower(text);

  for (const rule of locationRules) {
    for (const keyword of rule.keywords) {
      if (value.includes(keyword)) {
        return rule.name;
      }
    }
  }

  return null;
}

function resolveLocations(beats) {
  let currentLocation = "Alex's apartment";

  return beats.map((beat) => {
    const mentioned = mentionedLocation(beat.text);

    if (mentioned) {
      currentLocation = mentioned;
    }

    return {
      ...beat,
      location: currentLocation
    };
  });
}

// ============================================================
// OBJECT INTELLIGENCE
// ============================================================

function objectsFor(text) {
  const value = lower(text);

  const objects = [];

  if (/film camera|old camera|camera/.test(value)) {
    objects.push("film camera");
  }

  if (
    /family photographs|photographs|photograph|photo|picture/.test(
      value
    )
  ) {
    objects.push("family photograph");
  }

  if (/journal|old journal/.test(value)) {
    objects.push("old journal");
  }

  if (/red clock/.test(value)) {
    objects.push("red clock");
  }

  if (/key/.test(value)) {
    objects.push("key");
  }

  if (/wooden locker|locker/.test(value)) {
    objects.push("wooden locker");
  }

  if (/letter/.test(value)) {
    objects.push("letter");
  }

  if (/glass case|case/.test(value)) {
    objects.push("glass case");
  }

  return unique(objects);
}

// ============================================================
// STORY CLASSIFICATION
// ============================================================

function classify(text) {
  const value = lower(text);

  if (
    /realizes|realise|realized|realised|understands|understood|truth|family history|revelation|reveals|finally/.test(
      value
    )
  ) {
    return "revelation";
  }

  if (
    /warning|warn|danger|dangerous|stay away|do not go|never visit/.test(
      value
    )
  ) {
    return "warning";
  }

  if (
    /travels|travel|goes to|go to|heads to|journeys|arrives|reaches/.test(
      value
    )
  ) {
    return "journey";
  }

  if (
    /opens|opened|unlocks|unlocked|takes|took|uses|used|enters|entered/.test(
      value
    )
  ) {
    return "action";
  }

  if (
    /finds|found|discovers|discovered|notices|sees|receives|received/.test(
      value
    )
  ) {
    return "discovery";
  }

  if (
    /returns|return|keeps|protects|preserves|safe|home|comes back/.test(
      value
    )
  ) {
    return "resolution";
  }

  if (
    /investigates|examines|studies|searches|looks|checks|reads/.test(
      value
    )
  ) {
    return "investigation";
  }

  return "setup";
}

// ============================================================
// STORY BEATS
// ============================================================

function splitAtomicBeats(text) {
  const source = clean(text);

  if (!source) {
    return [];
  }

  return sentences(source)
    .map(ensurePeriod)
    .filter(Boolean);
}

function buildStoryBeats(prompt) {
  const beats = splitAtomicBeats(prompt);

  if (!beats.length) {
    return [
      {
        id: 1,
        text: clean(prompt),
        type: "setup"
      }
    ];
  }

  return beats.map((text, index) => ({
    id: index + 1,
    text,
    type: classify(text)
  }));
}

// ============================================================
// SCENE ALLOCATION
// ============================================================

function allocateScenes(beats, sceneCount) {
  const groups = [];

  if (!beats.length) {
    for (let i = 0; i < sceneCount; i++) {
      groups.push([]);
    }

    return groups;
  }

  /*
   * For short stories, keep beats distributed naturally.
   * For long videos, cycle through beats without losing
   * chronological order.
   */

  for (let i = 0; i < sceneCount; i++) {
    const start = Math.floor(
      (i * beats.length) / sceneCount
    );

    const end = Math.floor(
      ((i + 1) * beats.length) / sceneCount
    );

    let group = beats.slice(start, end);

    if (!group.length) {
      const nearestIndex = Math.min(
        Math.floor(
          (i * beats.length) / sceneCount
        ),
        beats.length - 1
      );

      group = [beats[nearestIndex]];
    }

    groups.push(group);
  }

  return groups;
}

// ============================================================
// DIALOGUE ENGINE
// ============================================================

function dialogueFor(
  sceneBeats,
  protagonist,
  usedDialogue,
  isFinalScene = false
) {
  const text = lower(
    sceneBeats.map((beat) => beat.text).join(" ")
  );

  let dialogue = "";

  if (isFinalScene) {
    dialogue =
      "Now I finally understand what really happened.";
  } else if (
    /photograph|photo|picture/.test(text)
  ) {
    dialogue =
      "Why would Grandpa keep this photograph?";
  } else if (/journal/.test(text)) {
    dialogue =
      "This journal mentions the same place.";
  } else if (/red clock/.test(text)) {
    dialogue =
      "That clock is still working.";
  } else if (/key/.test(text)) {
    dialogue =
      "Why was this key hidden here?";
  } else if (/locker/.test(text)) {
    dialogue =
      "What was Grandpa hiding in here?";
  } else if (/letter/.test(text)) {
    dialogue =
      "This letter changes everything.";
  } else if (
    /travels|travel|goes to|go to|heads to|arrives|reaches/.test(
      text
    )
  ) {
    dialogue =
      "I need to find out what happened here.";
  } else if (
    /finds|found|discovers|discovered|notices|sees|receives|received/.test(
      text
    )
  ) {
    dialogue =
      "Something about this doesn't feel right.";
  } else if (
    /opens|opened|unlocks|unlocked|enters|entered/.test(
      text
    )
  ) {
    dialogue =
      "I have to see what's inside.";
  } else if (
    /investigates|examines|studies|searches|looks|checks|reads/.test(
      text
    )
  ) {
    dialogue =
      "There has to be something I'm missing.";
  }

  dialogue = clean(dialogue);

  if (!dialogue) {
    return [];
  }

  if (usedDialogue.has(dialogue)) {
    return [];
  }

  usedDialogue.add(dialogue);

  return [
    {
      speaker: protagonist,
      text: dialogue
    }
  ];
}

// ============================================================
// VOICEOVER ENGINE
// ============================================================

function voiceoverFor(
  sceneBeats,
  sceneType,
  isFinalScene = false
) {
  const text = lower(
    sceneBeats.map((beat) => beat.text).join(" ")
  );

  if (isFinalScene) {
    return "The truth finally connected the missing pieces of his family's past.";
  }

  if (
    sceneType === "setup"
  ) {
    return "He had no idea this ordinary moment would change everything.";
  }

  if (
    sceneType === "discovery"
  ) {
    return "The discovery gave him a reason to keep searching.";
  }

  if (
    sceneType === "investigation"
  ) {
    return "The more he searched, the deeper the mystery became.";
  }

  if (
    sceneType === "journey"
  ) {
    return "Determined to find answers, he followed the only clue he had.";
  }

  if (
    sceneType === "warning"
  ) {
    return "For the first time, he realized that he might be in danger.";
  }

  if (
    sceneType === "action"
  ) {
    return "Every step brought him closer to the truth.";
  }

  if (
    sceneType === "revelation"
  ) {
    return "What he discovered changed everything he believed.";
  }

  if (
    sceneType === "resolution"
  ) {
    return "At last, the long-hidden mystery began to make sense.";
  }

  if (/photograph|photo|picture/.test(text)) {
    return "The old photograph seemed to contain a clue from the past.";
  }

  if (/journal/.test(text)) {
    return "The journal revealed that the mystery was older than he expected.";
  }

  if (/letter/.test(text)) {
    return "The letter carried the final piece of a forgotten story.";
  }

  return "Something about this moment felt more important than it seemed.";
}

// ============================================================
// CAMERA
// ============================================================

function cameraFor(type, objects = []) {
  if (type === "discovery") {
    return objects.length
      ? `Slow push-in toward ${objects[0]} as the character discovers it.`
      : "Slow cinematic push-in as the character notices something unusual.";
  }

  if (type === "investigation") {
    return "Controlled cinematic tracking shot following the character as they investigate the surroundings.";
  }

  if (type === "journey") {
    return "Wide cinematic tracking shot following the character through the environment.";
  }

  if (type === "action") {
    return "Dynamic medium shot with subtle handheld cinematic movement.";
  }

  if (type === "revelation") {
    return "Slow dramatic close-up on the character's emotional reaction.";
  }

  if (type === "resolution") {
    return "Gentle cinematic pull-back revealing the character and surrounding environment.";
  }

  return "Slow cinematic establishing shot with natural camera movement.";
}

// ============================================================
// LIGHTING
// ============================================================

function lightingFor(type) {
  if (type === "warning") {
    return "Moody cinematic lighting with deeper shadows and subtle tension.";
  }

  if (type === "revelation") {
    return "Dramatic cinematic lighting emphasizing the character's emotional reaction.";
  }

  if (type === "resolution") {
    return "Warm cinematic lighting creating an emotional sense of closure.";
  }

  return "Natural cinematic lighting with realistic environmental shadows.";
}

// ============================================================
// VISUAL PROMPT
// ============================================================

function buildVisualPrompt({
  location,
  protagonist,
  characters,
  objects,
  action,
  camera,
  lighting
}) {
  const characterDescription =
    characters.length
      ? characters.join(", ")
      : protagonist;

  const objectDescription =
    objects.length
      ? `Important objects: ${objects.join(", ")}.`
      : "";

  return clean(
    `Cinematic 3D animated movie scene at ${location}. ` +
    `Main character: ${characterDescription}. ` +
    `Visible action: ${action} ` +
    `${objectDescription} ` +
    `${camera} ` +
    `${lighting} ` +
    `Highly detailed environment, natural body movement, expressive facial emotions, realistic cinematic composition, consistent character appearance, professional film quality.`
  );
}

// ============================================================
// SCENE CREATION
// ============================================================

function createScene(
  index,
  beats,
  allCharacters,
  protagonist,
  usedDialogue,
  isFinalScene,
  totalScenesCount
) {
  const action = clean(
    beats
      .map((beat) => beat.text)
      .join(" ")
  );

  const active = activeCharacters(
    action,
    protagonist
  );

  const objects = unique(
    beats.flatMap((beat) =>
      objectsFor(beat.text)
    )
  );

  const type =
    beats[0]?.type || "setup";

  const location =
    beats.find((beat) => beat.location)
      ?.location ||
    "Alex's apartment";

  const dialogue = dialogueFor(
    beats,
    protagonist,
    usedDialogue,
    isFinalScene
  );

  const voiceover = voiceoverFor(
    beats,
    type,
    isFinalScene
  );

  const camera = cameraFor(
    type,
    objects
  );

  const lighting = lightingFor(type);

  const continuityLock =
    `Keep ${protagonist} visually consistent throughout the entire story: same face, age, hairstyle, body type and clothing unless the story explicitly changes them.`;

  const scenesPerAct = Math.max(
    1,
    Math.ceil(totalScenesCount / 4)
  );

  const actNumber = Math.min(
    4,
    Math.floor(index / scenesPerAct) + 1
  );

  const chapter =
    `Act ${actNumber}`;

  const visualPrompt =
    buildVisualPrompt({
      location,
      protagonist,
      characters:
        active.length
          ? active
          : [protagonist],
      objects,
      action,
      camera,
      lighting
    });

  return {
    scene_number: index + 1,

    start_time: index * 10,

    end_time:
      (index + 1) * 10,

    duration: 10,

    type,

    location,

    chapter,

    characters:
      active.length
        ? active
        : [protagonist],

    objects,

    action,

    visual_prompt:
      clean(visualPrompt),

    dialogue,

    voiceover:
      clean(voiceover),

    camera,

    lighting,

    continuity_lock:
      continuityLock,

    continuity:
      continuityLock,

    final_scene:
      Boolean(isFinalScene)
  };
}

// ============================================================
// LONG VIDEO SUPPORT
// ============================================================

function expandLongStoryBeats(
  beats,
  sceneCount
) {
  if (beats.length >= sceneCount) {
    return beats;
  }

  const expanded = [];

  for (let i = 0; i < sceneCount; i++) {
    const source =
      beats[
        Math.min(
          beats.length - 1,
          Math.floor(
            (i * beats.length) /
              sceneCount
          )
        )
      ];

    expanded.push({
      ...source,
      id: i + 1
    });
  }

  return expanded;
}

// ============================================================
// PROJECT GENERATOR
// ============================================================

function generateProject(
  prompt,
  duration,
  aspectRatio
) {
  const seconds = parseDuration(
    duration
  );

  const sceneCount =
    Math.floor(seconds / 10);

  const aspect =
    clean(aspectRatio) ||
    "16:9";

  const characters =
    analyzeCharacters(prompt);

  const protagonist =
    findProtagonist(
      prompt,
      characters
    );

  const rawBeats =
    buildStoryBeats(prompt);

  const resolvedBeats =
    resolveLocations(rawBeats);

  const workingBeats =
    expandLongStoryBeats(
      resolvedBeats,
      sceneCount
    );

  const sceneGroups =
    allocateScenes(
      workingBeats,
      sceneCount
    );

  const usedDialogue =
    new Set();

  const scenes =
    sceneGroups.map(
      (group, index) =>
        createScene(
          index,
          group,
          characters,
          protagonist,
          usedDialogue,
          index === sceneCount - 1,
          sceneCount
        )
    );

  return {
    success: true,

    engine_version:
      ENGINE_VERSION,

    duration:
      seconds,

    total_scenes:
      sceneCount,

    aspect_ratio:
      aspect,

    scenes,

    scene_plan:
      scenes,

    project: {
      prompt:
        clean(prompt),

      duration:
        seconds,

      total_scenes:
        sceneCount,

      aspect_ratio:
        aspect,

      protagonist,

      characters,

      scenes
    }
  };
}

// ============================================================
// API TEST
// ============================================================

app.get(
  "/api/test",
  (req, res) => {
    res.json({
      success: true,
      message:
        "SANAPTAI 20M API is working!",
      engine:
        ENGINE_VERSION,
      timestamp:
        new Date().toISOString()
    });
  }
);

// ============================================================
// PROJECT API
// ============================================================

function handleProjectRequest(
  req,
  res
) {
  try {
    const body =
      req.body || {};

    const prompt =
      body.prompt ||
      body.story ||
      body.videoPrompt ||
      body.video_prompt;

    const duration =
      body.duration ||
      60;

    const aspectRatio =
      body.aspectRatio ||
      body.aspect_ratio ||
      "16:9";

    if (
      !prompt ||
      !String(prompt).trim()
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Video prompt is required."
      });
    }

    const result =
      generateProject(
        String(prompt),
        duration,
        aspectRatio
      );

    return res.json(result);

  } catch (error) {
    console.error(
      "GENERATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Project creation failed.",
      details:
        error?.message ||
        "Unknown server error."
    });
  }
}

// ============================================================
// SUPPORTED ENDPOINTS
// ============================================================

app.post(
  "/api/create-project",
  handleProjectRequest
);

app.post(
  "/api/plan-scenes",
  handleProjectRequest
);

app.post(
  "/api/demo-project",
  handleProjectRequest
);

// ============================================================
// FRONTEND
// ============================================================

app.get(
  "/",
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "public",
        "index.html"
      )
    );
  }
);

// ============================================================
// UNKNOWN API
// ============================================================

app.use(
  "/api",
  (req, res) => {
    res.status(404).json({
      success: false,
      error:
        "API endpoint not found."
    });
  }
);

// ============================================================
// SERVER START
// ============================================================
// ============================================================
// SANAPTAI VIDEO JOB SYSTEM
// ============================================================

const videoJobs = new Map();

function createJobId() {
  return `sanaptai_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// CREATE VIDEO JOB
app.post("/api/generate-video", async (req, res) => {
  try {
    const body = req.body || {};

    let project = body.project;

    // Agar frontend ne project nahi bheja,
    // to existing stable scene engine use hoga.
    if (!project) {
      const prompt =
        body.prompt ||
        body.story ||
        body.videoPrompt ||
        body.video_prompt;

      if (!prompt || !String(prompt).trim()) {
        return res.status(400).json({
          success: false,
          error: "Video prompt is required."
        });
      }

      project = generateProject(
        String(prompt),
        body.duration || 60,
        body.aspectRatio || body.aspect_ratio || "16:9"
      );
    }

    if (!project || !project.scenes || !project.scenes.length) {
      return res.status(400).json({
        success: false,
        error: "No scene plan available."
      });
    }

    const jobId = createJobId();

    const job = {
      job_id: jobId,
      status: "provider_not_connected",
      progress: 0,
      message:
        "Scene plan is ready. Video generation provider is not connected yet.",
      created_at: new Date().toISOString(),
      duration: project.duration,
      total_scenes: project.scenes.length,
      aspect_ratio: project.aspect_ratio,
      current_scene: 0,
      total_scene_count: project.scenes.length,
      project
    };

    videoJobs.set(jobId, job);

    return res.json({
      success: true,
      job_id: jobId,
      status: job.status,
      progress: 0,
      message: job.message,
      total_scenes: job.total_scene_count
    });

  } catch (error) {
    console.error("VIDEO JOB ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Video job creation failed.",
      details: error?.message || "Unknown error."
    });
  }
});


// VIDEO JOB STATUS
app.get("/api/video-status/:jobId", (req, res) => {
  const { jobId } = req.params;

  const job = videoJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: "Video job not found."
    });
  }

  return res.json({
    success: true,
    job_id: job.job_id,
    status: job.status,
    progress: job.progress,
    message: job.message,
    current_scene: job.current_scene,
    total_scenes: job.total_scene_count,
    video_url: job.video_url || null,
    created_at: job.created_at
  });
});


// CANCEL VIDEO JOB
app.post("/api/video-cancel/:jobId", (req, res) => {
  const { jobId } = req.params;

  const job = videoJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: "Video job not found."
    });
  }

  if (
    job.status === "completed" ||
    job.status === "failed"
  ) {
    return res.json({
      success: false,
      message: `Job is already ${job.status}.`
    });
  }

  job.status = "cancelled";
  job.progress = 0;
  job.message = "Video generation cancelled.";

  videoJobs.set(jobId, job);

  return res.json({
    success: true,
    job_id: jobId,
    status: "cancelled"
  });
});


// VIDEO ENGINE STATUS
app.get("/api/video-engine", (req, res) => {
  const provider = process.env.VIDEO_PROVIDER || "none";

  return res.json({
    success: true,
    engine: ENGINE_VERSION,
    provider,
    video_generation:
      provider !== "none"
        ? "configured"
        : "not_connected",
    message:
      provider !== "none"
        ? "Video provider configured."
        : "Scene engine is ready. Connect a video provider to render videos."
  });
});
// ============================================================
// SANAPTAI VIDEO JOB SYSTEM
// ============================================================

const videoJobs = new Map();

function createJobId() {
  return `sanaptai_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}


// ============================================================
// CREATE VIDEO JOB
// ============================================================

app.post("/api/generate-video", async (req, res) => {
  try {
    const body = req.body || {};

    let project = body.project;

    // Agar frontend project nahi bhejta,
    // existing stable scene engine automatically use hoga.
    if (!project) {
      const prompt =
        body.prompt ||
        body.story ||
        body.videoPrompt ||
        body.video_prompt;

      if (!prompt || !String(prompt).trim()) {
        return res.status(400).json({
          success: false,
          error: "Video prompt is required."
        });
      }

      project = generateProject(
        String(prompt),
        body.duration || 60,
        body.aspectRatio ||
          body.aspect_ratio ||
          "16:9"
      );
    }

    if (
      !project ||
      !project.scenes ||
      !project.scenes.length
    ) {
      return res.status(400).json({
        success: false,
        error: "No scene plan available."
      });
    }

    const jobId = createJobId();

    const job = {
      job_id: jobId,

      // Abhi provider connect nahi hai.
      // Fake completed video nahi banega.
      status: "provider_not_connected",

      progress: 0,

      message:
        "Scene plan is ready. Video generation provider is not connected yet.",

      created_at: new Date().toISOString(),

      duration: project.duration,

      total_scenes: project.scenes.length,

      aspect_ratio: project.aspect_ratio,

      current_scene: 0,

      total_scene_count: project.scenes.length,

      video_url: null,

      project
    };

    videoJobs.set(jobId, job);

    return res.json({
      success: true,

      job_id: jobId,

      status: job.status,

      progress: 0,

      message: job.message,

      duration: job.duration,

      total_scenes: job.total_scene_count,

      aspect_ratio: job.aspect_ratio
    });

  } catch (error) {

    console.error(
      "VIDEO JOB ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      error:
        "Video job creation failed.",

      details:
        error?.message ||
        "Unknown error."
    });
  }
});


// ============================================================
// VIDEO JOB STATUS
// ============================================================

app.get(
  "/api/video-status/:jobId",
  (req, res) => {

    const { jobId } = req.params;

    const job = videoJobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Video job not found."
      });
    }

    return res.json({
      success: true,

      job_id: job.job_id,

      status: job.status,

      progress: job.progress,

      message: job.message,

      current_scene:
        job.current_scene,

      total_scenes:
        job.total_scene_count,

      video_url:
        job.video_url || null,

      created_at:
        job.created_at
    });
  }
);


// ============================================================
// CANCEL VIDEO JOB
// ============================================================

app.post(
  "/api/video-cancel/:jobId",
  (req, res) => {

    const { jobId } = req.params;

    const job = videoJobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Video job not found."
      });
    }

    if (
      job.status === "completed" ||
      job.status === "failed"
    ) {
      return res.json({
        success: false,

        message:
          `Job is already ${job.status}.`
      });
    }

    job.status = "cancelled";

    job.progress = 0;

    job.message =
      "Video generation cancelled.";

    videoJobs.set(jobId, job);

    return res.json({
      success: true,

      job_id: jobId,

      status: "cancelled"
    });
  }
);


// ============================================================
// VIDEO ENGINE STATUS
// ============================================================

app.get(
  "/api/video-engine",
  (req, res) => {

    const provider =
      process.env.VIDEO_PROVIDER ||
      "none";

    return res.json({
      success: true,

      engine:
        ENGINE_VERSION,

      provider,

      video_generation:
        provider !== "none"
          ? "configured"
          : "not_connected",

      message:
        provider !== "none"
          ? "Video provider configured."
          : "Scene engine is ready. Connect a video provider to render videos."
    });
  }
);
app.listen(
  PORT,
  () => {
    console.log(
      `SANAPTAI backend running on port ${PORT}`
    );

    console.log(
      `Engine: ${ENGINE_VERSION}`
    );

    console.log(
      `Maximum duration: 20 minutes`
    );

    console.log(
      `Scene duration: 10 seconds`
    );
  }
);
