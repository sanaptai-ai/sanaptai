import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

let ai = null;

if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });
}

/* =========================
   HELPERS
========================= */

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function has(text, words) {
  const lower = text.toLowerCase();
  return words.some(word => lower.includes(word));
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function durationToSeconds(duration) {
  const value = Number(duration);
  return Number.isFinite(value) && value > 0 ? value : 30;
}

function sceneCount(duration) {
  return Math.ceil(durationToSeconds(duration) / 10);
}

function splitSentences(text) {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(x => x.trim())
    .filter(Boolean);
}

/* =========================
   CHARACTER PARSER
========================= */

function parseCharacters(text) {
  const result = [];

  if (has(text, ["young boy", "little boy", "12-year-old boy", "boy"])) {
    result.push({
      id: "main_boy",
      role: "main_character",
      name: "young boy",
      description:
        "12-year-old boy, youthful round face, warm natural skin tone, dark brown eyes, short slightly messy black hair, slim child body, sky-blue T-shirt, dark blue jeans and white sneakers"
    });
  }

  if (has(text, ["young girl", "little girl", "12-year-old girl", "girl"])) {
    result.push({
      id: "main_girl",
      role: "main_character",
      name: "young girl",
      description:
        "12-year-old girl, youthful face, warm natural skin tone, dark brown eyes, shoulder-length dark hair, light-blue shirt, dark jeans and white sneakers"
    });
  }

  if (has(text, ["mother", "mom", "mum"])) {
    result.push({
      id: "mother",
      role: "supporting_character",
      name: "mother",
      description:
        "adult woman with consistent face, hairstyle, body proportions and simple casual clothing"
    });
  }

  if (has(text, ["father", "dad"])) {
    result.push({
      id: "father",
      role: "supporting_character",
      name: "father",
      description:
        "adult man with consistent face, hairstyle, body proportions and casual clothing"
    });
  }

  if (has(text, ["teacher"])) {
    result.push({
      id: "teacher",
      role: "supporting_character",
      name: "teacher",
      description:
        "adult school teacher with consistent appearance and professional clothing"
    });
  }

  if (has(text, ["friend", "best friend"])) {
    result.push({
      id: "friend",
      role: "supporting_character",
      name: "friend",
      description:
        "same-age friend with consistent face, hairstyle, body proportions and clothing"
    });
  }

  if (has(text, ["owner", "pet owner"])) {
    result.push({
      id: "pet_owner",
      role: "supporting_character",
      name: "pet owner",
      description:
        "adult pet owner with consistent face, short dark hair, medium build, casual jacket and jeans"
    });
  }

  if (has(text, ["villain", "enemy", "bad guy"])) {
    result.push({
      id: "villain",
      role: "antagonist",
      name: "villain",
      description:
        "adult antagonist with consistent face, hairstyle, body proportions and dark clothing"
    });
  }

  return result;
}

/* =========================
   ANIMAL PARSER
========================= */

function parseAnimals(text) {
  const result = [];

  if (has(text, ["kitten"])) {
    result.push({
      id: "kitten",
      name: "kitten",
      description:
        "small abandoned kitten with soft light-gray fur, white chest, white paws and expressive green eyes"
    });
  }

  if (has(text, ["puppy", "dog"])) {
    result.push({
      id: "puppy",
      name: "puppy",
      description:
        "small friendly puppy with soft brown-and-white fur and expressive dark eyes"
    });
  }

  if (has(text, ["horse"])) {
    result.push({
      id: "horse",
      name: "horse",
      description:
        "strong brown horse with black mane and consistent appearance"
    });
  }

  if (has(text, ["rabbit"])) {
    result.push({
      id: "rabbit",
      name: "rabbit",
      description:
        "small white rabbit with soft fur and expressive dark eyes"
    });
  }

  if (has(text, ["bird"])) {
    result.push({
      id: "bird",
      name: "bird",
      description:
        "small bird with consistent feathers and natural movement"
    });
  }

  if (has(text, ["snake"])) {
    result.push({
      id: "snake",
      name: "snake",
      description:
        "large dark snake with consistent markings and realistic movement"
    });
  }

  return result;
}

/* =========================
   LOCATION PARSER
========================= */

function parseLocations(text) {
  const result = [];

  if (has(text, ["school", "classroom"])) result.push("school");
  if (has(text, ["street", "road", "sidewalk"])) result.push("street");
  if (has(text, ["city", "downtown"])) result.push("city");
  if (has(text, ["park"])) result.push("park");
  if (has(text, ["forest", "woods"])) result.push("forest");
  if (has(text, ["home", "house", "room", "bedroom", "kitchen"])) result.push("home");
  if (has(text, ["office"])) result.push("office");
  if (has(text, ["hospital"])) result.push("hospital");
  if (has(text, ["village"])) result.push("village");
  if (has(text, ["mountain"])) result.push("mountain");

  return unique(result);
}

/* =========================
   OBJECT PARSER
========================= */

function parseObjects(text) {
  const result = [];

  if (has(text, ["poster"])) result.push("missing-pet poster");
  if (has(text, ["shelter"])) result.push("broken shelter");
  if (has(text, ["collar"])) result.push("pet collar");
  if (has(text, ["food", "feed", "feeding"])) result.push("pet food");
  if (has(text, ["towel", "dry", "dried"])) result.push("dry towel");
  if (has(text, ["umbrella"])) result.push("umbrella");
  if (has(text, ["phone"])) result.push("phone");
  if (has(text, ["letter"])) result.push("letter");
  if (has(text, ["photo", "photograph"])) result.push("photo");
  if (has(text, ["backpack", "school bag"])) result.push("backpack");
  if (has(text, ["key"])) result.push("key");

  if (has(text, ["car", "vehicle", "truck", "bus"])) {
    result.push("vehicle");
  }

  return unique(result);
}

/* =========================
   CONDITIONS
========================= */

function parseConditions(text) {
  const result = [];

  if (has(text, ["rain", "rainstorm", "raining", "storm"])) {
    result.push("rainstorm");
  }

  if (has(text, ["snow", "snowstorm"])) result.push("snow");
  if (has(text, ["night"])) result.push("night");
  if (has(text, ["evening"])) result.push("evening");
  if (has(text, ["morning"])) result.push("morning");
  if (has(text, ["dark"])) result.push("dark atmosphere");

  return unique(result);
}

/* =========================
   SPECIAL STORY TIMELINES
========================= */

function kittenTimeline(text) {
  const lower = text.toLowerCase();

  if (
    !lower.includes("kitten") ||
    !lower.includes("owner") ||
    !lower.includes("poster") ||
    !(
      lower.includes("rain") ||
      lower.includes("storm")
    )
  ) {
    return null;
  }

  return [
    {
      id: "k1",
      location: "street",
      characters: ["main_character"],
      animals: [],
      objects: [],
      action: "The boy walks home from school as a sudden rainstorm begins.",
      visual:
        "A young boy walks home from school on a city street as dark storm clouds gather and heavy rain suddenly begins."
    },
    {
      id: "k2",
      location: "street",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: ["broken shelter"],
      action: "The boy notices an abandoned kitten hiding beneath a broken shelter.",
      visual:
        "The boy stops beside a broken roadside shelter and discovers a tiny abandoned kitten hiding underneath."
    },
    {
      id: "k3",
      location: "street",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: ["broken shelter"],
      action: "The boy shields the frightened kitten from the rain.",
      visual:
        "The boy crouches beside the frightened kitten and uses his body to shield it from the heavy rain."
    },
    {
      id: "k4",
      location: "street",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: [],
      action: "The boy carefully picks up the kitten and decides to take it somewhere safe.",
      visual:
        "The boy gently picks up the wet kitten and holds it securely against his chest."
    },
    {
      id: "k5",
      location: "street",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: [],
      action: "The boy hurries home through the rain while protecting the kitten.",
      visual:
        "The boy walks quickly through the rainy street while carefully protecting the kitten in his arms."
    },
    {
      id: "k6",
      location: "home",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: ["dry towel"],
      action: "The boy places the kitten somewhere warm and starts drying its wet fur.",
      visual:
        "Inside a warm home, the boy gently places the kitten down and begins drying its wet fur with a soft towel."
    },
    {
      id: "k7",
      location: "home",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: ["pet food"],
      action: "The boy prepares food and gives it to the hungry kitten.",
      visual:
        "The boy places fresh food into a small bowl and watches the hungry kitten begin eating."
    },
    {
      id: "k8",
      location: "home",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: [],
      action: "The boy realizes the kitten may have a family searching for it.",
      visual:
        "The boy looks thoughtfully at the calm kitten and realizes that someone may be searching for it."
    },
    {
      id: "k9",
      location: "city",
      characters: ["main_character"],
      animals: [],
      objects: ["missing-pet poster"],
      action: "The boy notices a missing-pet poster on a public notice board.",
      visual:
        "The boy walks past a city notice board and suddenly notices a missing-pet poster."
    },
    {
      id: "k10",
      location: "city",
      characters: ["main_character"],
      animals: [],
      objects: ["missing-pet poster"],
      action: "The boy studies the poster and recognizes the kitten in the photograph.",
      visual:
        "The boy closely examines the missing-pet poster and recognizes the kitten shown in its photograph."
    },
    {
      id: "k11",
      location: "city",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: ["missing-pet poster"],
      action: "The boy follows the information from the poster to contact the owner.",
      visual:
        "The boy uses the contact information from the poster while keeping the kitten safely beside him."
    },
    {
      id: "k12",
      location: "city",
      characters: ["main_character", "pet_owner"],
      animals: ["kitten"],
      objects: [],
      action: "The boy meets the kitten's owner and brings the animal back to them.",
      visual:
        "The boy meets the relieved pet owner and carefully hands the kitten back to its grateful family."
    }
  ];
}

/* =========================
   PUPPY TIMELINE
========================= */

function puppyTimeline(text) {
  const lower = text.toLowerCase();

  if (
    !(lower.includes("puppy") || lower.includes("dog")) ||
    !lower.includes("owner")
  ) {
    return null;
  }

  return [
    {
      id: "p1",
      location: "street",
      characters: ["main_character"],
      animals: ["puppy"],
      objects: [],
      action: "The boy notices a lost puppy wandering alone.",
      visual:
        "The young boy notices a small lost puppy standing alone on a busy city street."
    },
    {
      id: "p2",
      location: "street",
      characters: ["main_character"],
      animals: ["puppy"],
      objects: [],
      action: "The boy carefully approaches the frightened puppy.",
      visual:
        "The boy slowly kneels and approaches the frightened puppy without startling it."
    },
    {
      id: "p3",
      location: "street",
      characters: ["main_character"],
      animals: ["puppy"],
      objects: [],
      action: "The boy gains the puppy's trust.",
      visual:
        "The boy gently comforts the puppy until it begins trusting him."
    },
    {
      id: "p4",
      location: "street",
      characters: ["main_character"],
      animals: ["puppy"],
      objects: ["pet collar"],
      action: "The boy checks the puppy's collar for identifying information.",
      visual:
        "The boy carefully examines the puppy's collar searching for a name or contact detail."
    },
    {
      id: "p5",
      location: "city",
      characters: ["main_character"],
      animals: ["puppy"],
      objects: [],
      action: "The boy begins searching for the puppy's owner.",
      visual:
        "The boy walks through the city with the puppy while searching for clues about its owner."
    },
    {
      id: "p6",
      location: "city",
      characters: ["main_character"],
      animals: ["puppy"],
      objects: ["phone"],
      action: "The boy uses his phone to follow a possible lead.",
      visual:
        "The boy checks information on his phone while the puppy waits beside him."
    },
    {
      id: "p7",
      location: "city",
      characters: ["main_character", "pet_owner"],
      animals: ["puppy"],
      objects: [],
      action: "The boy finds the puppy's owner.",
      visual:
        "The boy recognizes the puppy's relieved owner approaching from across the street."
    },
    {
      id: "p8",
      location: "city",
      characters: ["main_character", "pet_owner"],
      animals: ["puppy"],
      objects: [],
      action: "The boy reunites the puppy with its grateful owner.",
      visual:
        "The puppy happily runs into its owner's arms during an emotional reunion."
    }
  ];
}

/* =========================
   GENERIC TIMELINE
========================= */

function genericTimeline(text) {
  const sentences = splitSentences(text);

  if (!sentences.length) {
    return [{
      id: "g1",
      location: "environment",
      characters: ["main_character"],
      animals: [],
      objects: [],
      action: "The story begins.",
      visual: "Cinematic establishing shot introducing the story and main character."
    }];
  }

  return sentences.map((sentence, index) => {
    const lower = sentence.toLowerCase();

    let location = "environment";

    if (lower.includes("school")) location = "school";
    else if (
      lower.includes("home") ||
      lower.includes("house") ||
      lower.includes("room")
    ) location = "home";
    else if (
      lower.includes("street") ||
      lower.includes("road") ||
      lower.includes("sidewalk")
    ) location = "street";
    else if (lower.includes("city")) location = "city";
    else if (lower.includes("park")) location = "park";
    else if (
      lower.includes("forest") ||
      lower.includes("woods")
    ) location = "forest";
    else if (lower.includes("office")) location = "office";

    const animals = [];

    if (lower.includes("kitten")) animals.push("kitten");
    if (lower.includes("puppy") || lower.includes("dog")) animals.push("puppy");

    return {
      id: `g${index + 1}`,
      location,
      characters: ["main_character"],
      animals,
      objects: [],
      action: sentence,
      visual:
        `Cinematic realistic scene showing the main character as ${sentence.toLowerCase()}`
    };
  });
}

/* =========================
   SUB-SCENE EXPANSION
========================= */

function expandBeat(beat) {
  const action = beat.action;
  const visual = beat.visual;

  return [
    {
      ...beat,
      sub: "setup",
      action: `The story moment begins: ${action}`,
      visual:
        `${visual} Establish the environment and clearly show the beginning of this moment.`
    },
    {
      ...beat,
      sub: "reaction",
      action:
        `The main character reacts naturally to what is happening: ${action}`,
      visual:
        `${visual} Focus on the character's natural reaction and emotion.`
    },
    {
      ...beat,
      sub: "decision",
      action:
        `The main character makes a decision connected to this moment.`,
      visual:
        `${visual} Show the character making a clear decision that moves the story forward.`
    },
    {
      ...beat,
      sub: "action",
      action:
        `The main character acts on that decision.`,
      visual:
        `${visual} Show the main physical action clearly and naturally.`
    },
    {
      ...beat,
      sub: "consequence",
      action:
        `The action creates an immediate consequence that leads toward the next story beat.`,
      visual:
        `${visual} Show the immediate consequence while preserving all continuity.`
    }
  ];
}

/* =========================
   BUILD LONG TIMELINE
========================= */

function buildTimeline(story, requiredScenes) {
  let base =
    kittenTimeline(story) ||
    puppyTimeline(story) ||
    genericTimeline(story);

  /*
   * Short videos:
   * use the actual story beats directly.
   */
  if (requiredScenes <= base.length) {
    return base.slice(0, requiredScenes);
  }

  /*
   * Long videos:
   * expand each story beat into multiple cinematic sub-scenes.
   */
  let expanded = [];

  for (const beat of base) {
    expanded.push(...expandBeat(beat));
  }

  /*
   * If still not enough scenes, expand again with
   * continuity-preserving micro beats.
   */
  let pass = 0;

  while (expanded.length < requiredScenes && pass < 10) {
    const next = [];

    for (const beat of expanded) {
      next.push(beat);

      if (next.length < requiredScenes) {
        next.push({
          ...beat,
          sub: `${beat.sub}_continuation`,
          action:
            `The current moment continues naturally before the next story event.`,
          visual:
            `${beat.visual} Continue the same continuous moment without changing the characters, location or props.`
        });
      }
    }

    expanded = next;
    pass++;
  }

  return expanded.slice(0, requiredScenes);
}

/* =========================
   CHARACTER LOCK
========================= */

function characterLock(storyData) {
  return [
    ...storyData.characters,
    ...storyData.animals
  ].map(item => ({
    id: item.id,
    name: item.name,
    description: item.description
  }));
}

/* =========================
   DIALOGUE
========================= */

function dialogueFor(beat) {
  const text = `${beat.id} ${beat.sub} ${beat.action}`.toLowerCase();

  if (text.includes("rain") || text.includes("storm")) {
    return "I need to find a safe place.";
  }

  if (text.includes("kitten") && text.includes("discover")) {
    return "Wait... there's a kitten here.";
  }

  if (text.includes("kitten") && text.includes("protect")) {
    return "Don't worry. I'll keep you safe.";
  }

  if (text.includes("pick")) {
    return "Come on, little one.";
  }

  if (text.includes("home") && text.includes("dry")) {
    return "Let's get you warm and dry.";
  }

  if (text.includes("food") || text.includes("feed")) {
    return "Here, you must be hungry.";
  }

  if (text.includes("poster") && text.includes("recogn")) {
    return "That's you. I found your owner.";
  }

  if (text.includes("owner")) {
    return "I think we found your family.";
  }

  if (text.includes("puppy")) {
    return "Stay with me. I'll help you.";
  }

  if (text.includes("collar")) {
    return "Maybe this collar has a clue.";
  }

  if (text.includes("search")) {
    return "I'll keep looking.";
  }

  if (text.includes("reunit")) {
    return "You're finally home.";
  }

  return "I know what I need to do.";
}

/* =========================
   VOICEOVER
========================= */

function voiceoverFor(beat) {
  const text = beat.action.toLowerCase();

  if (text.includes("rain") || text.includes("storm")) {
    return "The weather suddenly changes and forces the story in a new direction.";
  }

  if (text.includes("kitten")) {
    return "A small discovery gives the main character a reason to stop and help.";
  }

  if (text.includes("poster")) {
    return "A simple clue opens a possible path toward the truth.";
  }

  if (text.includes("owner")) {
    return "The search finally brings the missing pieces together.";
  }

  if (text.includes("puppy")) {
    return "The helpless animal now depends on someone willing to help.";
  }

  return "This moment pushes the story naturally toward what happens next.";
}

/* =========================
   CAMERA
========================= */

function cameraFor(index) {
  const cameras = [
    "wide cinematic establishing shot",
    "medium tracking shot",
    "over-the-shoulder shot",
    "slow cinematic push-in",
    "natural handheld medium shot",
    "emotional close-up",
    "side tracking shot",
    "low-angle cinematic shot"
  ];

  return cameras[index % cameras.length];
}

/* =========================
   LIGHTING
========================= */

function lightingFor(beat) {
  const text = `${beat.location} ${beat.action}`.toLowerCase();

  if (text.includes("rain") || text.includes("storm")) {
    return "dramatic overcast storm lighting with realistic wet-surface reflections";
  }

  if (beat.location === "home") {
    return "warm soft indoor lighting creating a safe emotional atmosphere";
  }

  if (text.includes("reunit") || text.includes("owner")) {
    return "warm natural golden light emphasizing the emotional moment";
  }

  return "natural cinematic lighting appropriate to the scene and time of day";
}

/* =========================
   SCENE CHARACTERS
========================= */

function resolveCharacters(beat, storyData) {
  const names = [];

  const main = storyData.characters.find(
    x => x.role === "main_character"
  );

  if (
    main &&
    beat.characters.includes("main_character")
  ) {
    names.push(main.name);
  }

  if (beat.characters.includes("pet_owner")) {
    const owner = storyData.characters.find(
      x => x.id === "pet_owner"
    );

    if (owner) names.push(owner.name);
  }

  return unique(names);
}

/* =========================
   CREATE SCENES
========================= */

function createScenes(story, duration, aspectRatio) {
  const seconds = durationToSeconds(duration);
  const total = sceneCount(seconds);

  const storyData = {
    characters: parseCharacters(story),
    animals: parseAnimals(story),
    locations: parseLocations(story),
    objects: parseObjects(story),
    conditions: parseConditions(story)
  };

  const timeline = buildTimeline(story, total);

  const scenes = timeline.map((beat, index) => {
    const start = index * 10;
    const end = Math.min(start + 10, seconds);

    const characters = resolveCharacters(
      beat,
      storyData
    );

    const animals = (beat.animals || []).map(id => {
      const animal = storyData.animals.find(
        x => x.id === id
      );
      return animal ? animal.name : id;
    });

    const objects = beat.objects || [];

    const continuity = [
      "Keep the exact same character face, age, hairstyle, body proportions and clothing throughout the entire project.",
      "Keep every animal's appearance identical throughout the project.",
      `Keep this scene strictly in the ${beat.location} location.`,
      `Characters: ${characters.join(", ") || "main character"}.`,
      `Animals: ${animals.join(", ") || "none"}.`,
      `Props: ${objects.join(", ") || "none"}.`,
      "Do not introduce unrelated characters, locations, vehicles or props."
    ].join(" ");

    return {
      scene_number: index + 1,
      start_time: start,
      end_time: end,
      duration: end - start,
      phase: beat.sub || "story_beat",
      location: beat.location,
      characters,
      animals,
      objects,
      visual_prompt:
        `${beat.visual} Realistic cinematic detail, natural human movement, accurate environmental physics, consistent character design, aspect ratio ${aspectRatio}.`,
      camera: cameraFor(index),
      lighting: lightingFor(beat),
      action: beat.action,
      dialogue: dialogueFor(beat),
      voiceover: voiceoverFor(beat),
      continuity
    };
  });

  return {
    duration: seconds,
    total_scenes: total,
    aspect_ratio: aspectRatio,
    story,
    story_understanding: storyData,
    master_character_lock: characterLock(storyData),
    story_element_lock: {
      locations: storyData.locations,
      objects: storyData.objects,
      conditions: storyData.conditions
    },
    timeline: timeline.map((beat, index) => ({
      timeline_number: index + 1,
      phase: beat.sub || "story_beat",
      location: beat.location,
      action: beat.action
    })),
    scenes
  };
}

/* =========================
   API TEST
========================= */

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "SANAPTAI V11 server is working"
  });
});

/* =========================
   DEMO MODE
========================= */

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio
    } = req.body;

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        success: false,
        error: "Story prompt is required."
      });
    }

    const result = createScenes(
      String(prompt).trim(),
      duration || 30,
      aspectRatio || "16:9"
    );

    res.json({
      success: true,
      mode: "demo",
      ...result
    });

  } catch (error) {
    console.error("Demo Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* =========================
   GEMINI MODE
========================= */

app.post("/api/plan-scenes", async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "GEMINI_API_KEY is not configured."
      });
    }

    const {
      prompt,
      duration,
      aspectRatio
    } = req.body;

    const total = sceneCount(duration || 30);

    const instruction = `
You are SANAPTAI V11.

Convert the story into exactly ${total} cinematic scenes.

STRICT RULES:
- Every scene is exactly 10 seconds.
- Chronological order must be preserved.
- One primary action per scene.
- Do not invent unrelated events.
- Do not invent unrelated vehicles or props.
- Characters must remain visually identical.
- Locations must be scene-specific.
- Dialogue must fit inside 10 seconds.
- Output JSON only.

Return:
{
  "scenes": [
    {
      "scene_number": 1,
      "start_time": 0,
      "end_time": 10,
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

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents:
        instruction +
        "\n\nSTORY:\n" +
        prompt +
        "\n\nASPECT RATIO:\n" +
        (aspectRatio || "16:9")
    });

    const raw =
      response.text ||
      response.candidates?.[0]?.content?.parts
        ?.map(p => p.text || "")
        .join("") ||
      "";

    let parsed;

    try {
      parsed = JSON.parse(
        raw
          .replace(/^```json/i, "")
          .replace(/^```/i, "")
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim()
      );
    } catch {
      return res.status(500).json({
        success: false,
        error: "Gemini returned invalid JSON.",
        raw
      });
    }

    res.json({
      success: true,
      mode: "ai",
      duration: durationToSeconds(duration || 30),
      total_scenes: total,
      aspect_ratio: aspectRatio || "16:9",
      scenes: parsed.scenes || []
    });

  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* =========================
   CREATE PROJECT
========================= */

app.post("/api/create-project", (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required."
      });
    }

    const result = createScenes(
      prompt,
      duration || 30,
      aspectRatio || "16:9"
    );

    res.json({
      success: true,
      project: result
    });

  } catch (error) {
    console.error("Create Project Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  res.send("SANAPTAI V11 is running.");
});

/* =========================
   START
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SANAPTAI V11 running on port ${PORT}`);
});
