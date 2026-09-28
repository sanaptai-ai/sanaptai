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
   BASIC HELPERS
========================= */

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text) {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
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

  if (!Number.isFinite(value) || value <= 0) {
    return 30;
  }

  return value;
}

function createSceneCount(durationSeconds) {
  return Math.ceil(durationSeconds / 10);
}

/* =========================
   STORY PARSER
========================= */

function parseCharacters(text) {
  const characters = [];

  if (has(text, [
    "young boy",
    "little boy",
    "12-year-old boy",
    "boy"
  ])) {
    characters.push({
      id: "main_boy",
      type: "main_character",
      name: "young boy",
      description:
        "12-year-old boy with a youthful round face, warm natural skin tone, dark brown eyes, short slightly messy black hair, slim child body, sky-blue T-shirt, dark blue jeans and white sneakers"
    });
  }

  if (has(text, [
    "young girl",
    "little girl",
    "12-year-old girl",
    "girl"
  ])) {
    characters.push({
      id: "main_girl",
      type: "main_character",
      name: "young girl",
      description:
        "12-year-old girl with a youthful face, warm natural skin tone, dark brown eyes, shoulder-length dark hair, slim child body, light-blue shirt, dark jeans and white sneakers"
    });
  }

  if (has(text, ["mother", "mom", "mum"])) {
    characters.push({
      id: "mother",
      type: "supporting_character",
      name: "mother",
      description:
        "adult woman with consistent facial features, medium build and simple casual clothing"
    });
  }

  if (has(text, ["father", "dad"])) {
    characters.push({
      id: "father",
      type: "supporting_character",
      name: "father",
      description:
        "adult man with consistent facial features, medium build and casual clothing"
    });
  }

  if (has(text, ["teacher"])) {
    characters.push({
      id: "teacher",
      type: "supporting_character",
      name: "teacher",
      description:
        "adult school teacher with consistent appearance and modest professional clothing"
    });
  }

  if (has(text, ["friend", "best friend"])) {
    characters.push({
      id: "friend",
      type: "supporting_character",
      name: "friend",
      description:
        "same-age friend with consistent face, hair, body proportions and clothing"
    });
  }

  if (has(text, [
    "owner",
    "pet owner",
    "kitten's owner",
    "puppy's owner"
  ])) {
    characters.push({
      id: "pet_owner",
      type: "supporting_character",
      name: "pet owner",
      description:
        "adult pet owner with a consistent face, hairstyle, body proportions and casual jacket with jeans"
    });
  }

  if (has(text, [
    "villain",
    "enemy",
    "bad guy"
  ])) {
    characters.push({
      id: "villain",
      type: "antagonist",
      name: "villain",
      description:
        "adult antagonist with a consistent face, body proportions, dark clothing and distinctive appearance"
    });
  }

  return characters;
}

/* =========================
   ANIMALS
========================= */

function parseAnimals(text) {
  const animals = [];

  if (has(text, ["kitten"])) {
    animals.push({
      id: "kitten",
      name: "kitten",
      description:
        "small abandoned kitten with soft light-gray fur, white chest, white paws and expressive green eyes"
    });
  }

  if (has(text, ["puppy", "dog"])) {
    animals.push({
      id: "puppy",
      name: "puppy",
      description:
        "small friendly puppy with soft brown-and-white fur and expressive dark eyes"
    });
  }

  if (has(text, ["cat"])) {
    animals.push({
      id: "cat",
      name: "cat",
      description:
        "small domestic cat with consistent fur pattern and expressive eyes"
    });
  }

  if (has(text, ["horse"])) {
    animals.push({
      id: "horse",
      name: "horse",
      description:
        "strong brown horse with a black mane and consistent appearance"
    });
  }

  if (has(text, ["rabbit"])) {
    animals.push({
      id: "rabbit",
      name: "rabbit",
      description:
        "small white rabbit with soft fur and expressive dark eyes"
    });
  }

  if (has(text, ["bird"])) {
    animals.push({
      id: "bird",
      name: "bird",
      description:
        "small bird with consistent feathers and natural movements"
    });
  }

  if (has(text, ["snake"])) {
    animals.push({
      id: "snake",
      name: "snake",
      description:
        "large dark snake with consistent markings and realistic movement"
    });
  }

  return animals;
}

/* =========================
   LOCATIONS
========================= */

function parseLocations(text) {
  const locations = [];

  if (has(text, ["school", "classroom"])) {
    locations.push("school");
  }

  if (has(text, [
    "street",
    "road",
    "sidewalk",
    "walking home"
  ])) {
    locations.push("street");
  }

  if (has(text, ["city", "busy city"])) {
    locations.push("city");
  }

  if (has(text, ["park"])) {
    locations.push("park");
  }

  if (has(text, ["forest", "woods"])) {
    locations.push("forest");
  }

  if (has(text, [
    "home",
    "house",
    "room",
    "bedroom",
    "kitchen"
  ])) {
    locations.push("home");
  }

  if (has(text, ["office"])) {
    locations.push("office");
  }

  if (has(text, ["hospital"])) {
    locations.push("hospital");
  }

  if (has(text, ["village"])) {
    locations.push("village");
  }

  if (has(text, ["mountain"])) {
    locations.push("mountain");
  }

  return unique(locations);
}

/* =========================
   OBJECTS
========================= */

function parseObjects(text) {
  const objects = [];

  if (has(text, ["poster"])) objects.push("missing-pet poster");
  if (has(text, ["shelter"])) objects.push("broken shelter");
  if (has(text, ["collar"])) objects.push("pet collar");
  if (has(text, ["food", "feed", "feeding"])) objects.push("pet food");
  if (has(text, ["towel", "dry", "dried"])) objects.push("dry towel");
  if (has(text, ["umbrella"])) objects.push("umbrella");
  if (has(text, ["phone", "telephone"])) objects.push("phone");
  if (has(text, ["letter"])) objects.push("letter");
  if (has(text, ["photo", "photograph"])) objects.push("photo");
  if (has(text, ["backpack", "school bag"])) objects.push("backpack");
  if (has(text, ["key"])) objects.push("key");

  if (has(text, [
    "car",
    "vehicle",
    "truck",
    "bus"
  ])) {
    objects.push("vehicle");
  }

  return unique(objects);
}

/* =========================
   CONDITIONS
========================= */

function parseConditions(text) {
  const conditions = [];

  if (has(text, [
    "rain",
    "rainstorm",
    "raining",
    "storm"
  ])) {
    conditions.push("rainstorm");
  }

  if (has(text, ["snow", "snowstorm"])) {
    conditions.push("snow");
  }

  if (has(text, ["night"])) {
    conditions.push("night");
  }

  if (has(text, ["evening"])) {
    conditions.push("evening");
  }

  if (has(text, ["morning"])) {
    conditions.push("morning");
  }

  if (has(text, ["dark"])) {
    conditions.push("dark atmosphere");
  }

  return unique(conditions);
}

/* =========================
   EVENT DETECTION
========================= */

function detectEvent(sentence) {
  const s = sentence.toLowerCase();

  if (
    s.includes("rain") ||
    s.includes("rainstorm") ||
    s.includes("storm") ||
    s.includes("snow")
  ) {
    return "weather";
  }

  if (
    s.includes("finds") ||
    s.includes("found") ||
    s.includes("discovers") ||
    s.includes("sees")
  ) {
    return "discovery";
  }

  if (
    s.includes("abandoned kitten") ||
    s.includes("lost kitten") ||
    s.includes("lost puppy") ||
    s.includes("lost dog")
  ) {
    return "animal_discovery";
  }

  if (
    s.includes("protect") ||
    s.includes("save") ||
    s.includes("rescues") ||
    s.includes("rescue")
  ) {
    return "rescue";
  }

  if (
    s.includes("carries") ||
    s.includes("carry") ||
    s.includes("takes") ||
    s.includes("brings")
  ) {
    return "transport";
  }

  if (
    s.includes("dries") ||
    s.includes("dry") ||
    s.includes("care for") ||
    s.includes("takes care")
  ) {
    return "care";
  }

  if (
    s.includes("feeds") ||
    s.includes("feed") ||
    s.includes("gives it food") ||
    s.includes("gives food")
  ) {
    return "feeding";
  }

  if (
    s.includes("poster") ||
    s.includes("collar") ||
    s.includes("clue")
  ) {
    return "clue";
  }

  if (
    s.includes("owner") &&
    (
      s.includes("reunite") ||
      s.includes("reunites") ||
      s.includes("returns") ||
      s.includes("returned")
    )
  ) {
    return "reunion";
  }

  if (
    s.includes("search") ||
    s.includes("searches") ||
    s.includes("looking for") ||
    s.includes("looks for")
  ) {
    return "search";
  }

  if (
    s.includes("chase") ||
    s.includes("chases") ||
    s.includes("runs after")
  ) {
    return "chase";
  }

  if (
    s.includes("build") ||
    s.includes("builds") ||
    s.includes("construct")
  ) {
    return "building";
  }

  if (
    s.includes("danger") ||
    s.includes("dangerous") ||
    s.includes("threat")
  ) {
    return "danger";
  }

  return "story_action";
}

/* =========================
   STORY EVENTS
========================= */

function parseEvents(text) {
  const sentences = splitSentences(text);

  return sentences.map((sentence, index) => ({
    event_id: index + 1,
    sentence,
    type: detectEvent(sentence)
  }));
}

/* =========================
   SPECIAL TIMELINES
========================= */

function buildKittenTimeline(text) {
  const lower = text.toLowerCase();

  const hasKitten = lower.includes("kitten");
  const hasOwner = lower.includes("owner");
  const hasPoster = lower.includes("poster");
  const hasRain =
    lower.includes("rain") ||
    lower.includes("rainstorm") ||
    lower.includes("storm");

  if (!hasKitten || !hasOwner || !hasPoster || !hasRain) {
    return null;
  }

  return [
    {
      phase: "journey_weather",
      location: "street",
      characters: ["main_character"],
      animals: [],
      objects: [],
      action:
        "The boy walks home from school as a sudden rainstorm begins around him.",
      visual:
        "A young boy walking home from school on a city street while dark storm clouds gather and heavy rain suddenly starts."
    },
    {
      phase: "kitten_discovery",
      location: "street",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: ["broken shelter"],
      action:
        "The boy notices a tiny abandoned kitten hiding beneath a broken shelter.",
      visual:
        "The boy stops beside a broken roadside shelter and carefully discovers the small abandoned kitten hiding underneath it."
    },
    {
      phase: "protection",
      location: "street",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: ["broken shelter"],
      action:
        "The boy shields the kitten from the rain and decides to protect it.",
      visual:
        "The boy crouches beside the frightened kitten, shielding it from the heavy rain and gently reaching toward it."
    },
    {
      phase: "home_care",
      location: "home",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: ["dry towel", "pet food"],
      action:
        "At home, the boy dries the kitten with a towel and prepares food for it.",
      visual:
        "Inside a warm home, the boy gently dries the kitten with a towel and places food in a small bowl."
    },
    {
      phase: "poster_clue",
      location: "city",
      characters: ["main_character"],
      animals: ["kitten"],
      objects: ["missing-pet poster"],
      action:
        "The boy spots a missing-pet poster and realizes it may identify the kitten's owner.",
      visual:
        "The boy stands beside a public notice board and suddenly notices a missing-pet poster showing the same kitten."
    },
    {
      phase: "reunion",
      location: "city",
      characters: ["main_character", "pet_owner"],
      animals: ["kitten"],
      objects: ["missing-pet poster"],
      action:
        "The boy brings the kitten to its owner and the emotional reunion begins.",
      visual:
        "The boy reunites the kitten with its relieved owner on a city sidewalk as the owner lovingly reaches for the animal."
    }
  ];
}

function buildPuppyTimeline(text) {
  const lower = text.toLowerCase();

  if (
    !lower.includes("puppy") &&
    !lower.includes("dog")
  ) {
    return null;
  }

  if (!lower.includes("owner")) {
    return null;
  }

  return [
    {
      phase: "discovery",
      location: "street",
      characters: ["main_character"],
      animals: ["puppy"],
      objects: [],
      action:
        "The boy notices a lost puppy wandering alone.",
      visual:
        "The young boy notices a small lost puppy standing alone on a busy city street."
    },
    {
      phase: "rescue",
      location: "street",
      characters: ["main_character"],
      animals: ["puppy"],
      objects: [],
      action:
        "The boy approaches carefully and helps the frightened puppy.",
      visual:
        "The boy kneels carefully beside the frightened puppy and gently gains its trust."
    },
    {
      phase: "clue",
      location: "street",
      characters: ["main_character"],
      animals: ["puppy"],
      objects: ["pet collar"],
      action:
        "The boy checks the puppy's collar for identifying information.",
      visual:
        "The boy carefully examines the puppy's collar looking for a name or contact detail."
    },
    {
      phase: "search",
      location: "city",
      characters: ["main_character"],
      animals: ["puppy"],
      objects: ["phone"],
      action:
        "The boy uses the available clue to search for the puppy's owner.",
      visual:
        "The boy searches through the city while keeping the puppy safely beside him."
    },
    {
      phase: "reunion",
      location: "city",
      characters: ["main_character", "pet_owner"],
      animals: ["puppy"],
      objects: [],
      action:
        "The boy reunites the puppy with its grateful owner.",
      visual:
        "The puppy happily runs toward its relieved owner while the boy watches the emotional reunion."
    }
  ];
}

/* =========================
   GENERIC TIMELINE
========================= */

function buildGenericTimeline(story) {
  const events = parseEvents(story);

  if (events.length === 0) {
    return [
      {
        phase: "opening",
        location: "environment",
        characters: ["main_character"],
        animals: [],
        objects: [],
        action: "The main character begins the story.",
        visual:
          "Cinematic establishing shot introducing the main character and the story environment."
      }
    ];
  }

  return events.map((event, index) => {
    let location = "environment";

    const s = event.sentence.toLowerCase();

    if (s.includes("school")) location = "school";
    else if (
      s.includes("home") ||
      s.includes("house") ||
      s.includes("room")
    ) {
      location = "home";
    } else if (
      s.includes("street") ||
      s.includes("road") ||
      s.includes("sidewalk")
    ) {
      location = "street";
    } else if (s.includes("city")) {
      location = "city";
    } else if (s.includes("park")) {
      location = "park";
    } else if (
      s.includes("forest") ||
      s.includes("woods")
    ) {
      location = "forest";
    } else if (s.includes("office")) {
      location = "office";
    } else if (s.includes("hospital")) {
      location = "hospital";
    }

    const animals = [];

    if (s.includes("kitten")) animals.push("kitten");
    if (s.includes("puppy") || s.includes("dog")) {
      animals.push("puppy");
    }

    return {
      phase: `${event.type}_${index + 1}`,
      location,
      characters: ["main_character"],
      animals,
      objects: [],
      action: event.sentence,
      visual:
        `Cinematic realistic scene showing the main character ${event.sentence.toLowerCase()}`
    };
  });
}

/* =========================
   STORY UNDERSTANDING
========================= */

function understandStory(story) {
  const characters = parseCharacters(story);
  const animals = parseAnimals(story);
  const locations = parseLocations(story);
  const objects = parseObjects(story);
  const conditions = parseConditions(story);
  const events = parseEvents(story);

  let timeline = buildKittenTimeline(story);

  if (!timeline) {
    timeline = buildPuppyTimeline(story);
  }

  if (!timeline) {
    timeline = buildGenericTimeline(story);
  }

  let goal = "complete the story objective";

  const lower = story.toLowerCase();

  if (
    lower.includes("reunite") ||
    lower.includes("reunites") ||
    lower.includes("owner")
  ) {
    goal = "reunite the lost animal with its owner";
  } else if (
    lower.includes("rescue") ||
    lower.includes("save") ||
    lower.includes("protect")
  ) {
    goal = "protect or rescue someone or something in danger";
  } else if (
    lower.includes("build") ||
    lower.includes("construct")
  ) {
    goal = "complete the construction goal";
  } else if (
    lower.includes("find") ||
    lower.includes("discovers")
  ) {
    goal = "discover the truth or reach the objective";
  }

  let conflict = "the main character must overcome the story's obstacles";

  if (conditions.length > 0) {
    conflict = `the main character must overcome ${conditions.join(", ")}`;
  }

  if (
    lower.includes("lost") ||
    lower.includes("abandoned")
  ) {
    conflict = "the main character must solve a lost-or-abandoned situation";
  }

  return {
    characters,
    animals,
    locations,
    objects,
    conditions,
    events,
    timeline,
    goal,
    conflict
  };
}

/* =========================
   CHARACTER LOCK
========================= */

function buildCharacterLock(storyData) {
  const locks = [];

  for (const character of storyData.characters) {
    locks.push({
      id: character.id,
      name: character.name,
      description: character.description
    });
  }

  for (const animal of storyData.animals) {
    locks.push({
      id: animal.id,
      name: animal.name,
      description: animal.description
    });
  }

  return locks;
}

/* =========================
   STORY ELEMENT LOCK
========================= */

function buildElementLock(storyData) {
  return {
    locations: storyData.locations,
    objects: storyData.objects,
    conditions: storyData.conditions
  };
}

/* =========================
   DIALOGUE
========================= */

function generateDialogue(scene, storyData) {
  const phase = scene.phase;

  if (phase === "journey_weather") {
    return "I need to get home before this gets worse.";
  }

  if (phase === "kitten_discovery") {
    return "Wait... there's a kitten under there.";
  }

  if (phase === "protection") {
    return "Come on, little one. I'll keep you safe.";
  }

  if (phase === "home_care") {
    return "Let's get you warm, dry, and fed.";
  }

  if (phase === "poster_clue") {
    return "Wait... this missing-pet poster is you.";
  }

  if (phase === "reunion") {
    return "We found your kitten. She's safe.";
  }

  if (phase === "discovery") {
    return "I need to figure out what's happening.";
  }

  if (phase === "rescue") {
    return "You're safe now. Stay close to me.";
  }

  if (phase === "clue") {
    return "There has to be a clue here.";
  }

  if (phase === "search") {
    return "I'll keep looking until I find them.";
  }

  if (phase.includes("weather")) {
    return "I need to find a way through this.";
  }

  if (phase.includes("building")) {
    return "I'll make sure this is done right.";
  }

  return "I know what I need to do next.";
}

/* =========================
   VOICEOVER
========================= */

function generateVoiceover(scene) {
  const phase = scene.phase;

  if (phase === "journey_weather") {
    return "A simple walk home suddenly became a race against the storm.";
  }

  if (phase === "kitten_discovery") {
    return "Beneath the broken shelter, he discovered a tiny abandoned kitten.";
  }

  if (phase === "protection") {
    return "Instead of walking away, he chose to protect the helpless animal.";
  }

  if (phase === "home_care") {
    return "At home, he dried the kitten and gave her something to eat.";
  }

  if (phase === "poster_clue") {
    return "Then a missing-pet poster revealed a possible path back to her owner.";
  }

  if (phase === "reunion") {
    return "After the search, the kitten finally returned to the person who had been looking for her.";
  }

  if (phase === "discovery") {
    return "The discovery changed the direction of the story.";
  }

  if (phase === "rescue") {
    return "He chose to help instead of walking away.";
  }

  if (phase === "clue") {
    return "One small clue could reveal the answer.";
  }

  if (phase === "search") {
    return "The search continued until the missing piece finally appeared.";
  }

  return "The story moves forward as the character faces the next moment.";
}

/* =========================
   CAMERA
========================= */

function generateCamera(index, total) {
  const cameras = [
    "wide cinematic establishing shot",
    "medium tracking shot",
    "slow handheld close-up",
    "over-the-shoulder shot",
    "gentle cinematic push-in",
    "emotional close-up"
  ];

  return cameras[index % cameras.length];
}

/* =========================
   LIGHTING
========================= */

function generateLighting(scene, storyData) {
  if (
    scene.phase === "journey_weather" ||
    scene.phase === "kitten_discovery" ||
    scene.phase === "protection"
  ) {
    return "dramatic overcast storm lighting with realistic rain reflections";
  }

  if (scene.phase === "home_care") {
    return "warm soft indoor lighting creating a safe emotional atmosphere";
  }

  if (scene.phase === "poster_clue") {
    return "natural daytime city lighting with subtle cinematic contrast";
  }

  if (scene.phase === "reunion") {
    return "warm golden natural light emphasizing the emotional reunion";
  }

  return "natural cinematic lighting appropriate to the environment";
}

/* =========================
   SCENE LOCATION
========================= */

function sceneLocation(scene) {
  if (scene.location === "environment") {
    return "story environment";
  }

  return scene.location;
}

/* =========================
   SCENE CHARACTERS
========================= */

function resolveSceneCharacters(scene, storyData) {
  const result = [];

  if (
    scene.characters.includes("main_character") &&
    storyData.characters.length > 0
  ) {
    const main = storyData.characters.find(
      c => c.type === "main_character"
    );

    if (main) {
      result.push(main.name);
    }
  }

  if (scene.characters.includes("pet_owner")) {
    const owner = storyData.characters.find(
      c => c.id === "pet_owner"
    );

    if (owner) {
      result.push(owner.name);
    }
  }

  return unique(result);
}

/* =========================
   SCENE GENERATOR
========================= */

function generateScenes(story, duration, aspectRatio) {
  const durationSeconds = durationToSeconds(duration);
  const totalScenes = createSceneCount(durationSeconds);

  const storyData = understandStory(story);

  const timeline = storyData.timeline;

  const scenes = [];

  for (let i = 0; i < totalScenes; i++) {
    let sourceScene;

    if (i < timeline.length) {
      sourceScene = timeline[i];
    } else {
      /*
       * Long-form expansion:
       * Instead of repeating the exact same scene,
       * expand the existing story beats with consequences.
       */

      const base = timeline[i % timeline.length];

      sourceScene = {
        ...base,
        phase: `${base.phase}_extended_${i + 1}`,
        action:
          `${base.action} The immediate consequence of this moment develops the story further.`,
        visual:
          `${base.visual} Continue the same moment naturally, preserving character appearance, location, props, weather and emotional continuity.`
      };
    }

    const startTime = i * 10;
    const endTime = Math.min(startTime + 10, durationSeconds);

    const characters = resolveSceneCharacters(
      sourceScene,
      storyData
    );

    const animals = sourceScene.animals
      .map(id => {
        const animal = storyData.animals.find(
          a => a.id === id
        );

        return animal ? animal.name : id;
      });

    const objects = sourceScene.objects || [];

    const continuity = [
      "Use the exact same character face, age, hairstyle, body proportions and clothing as previous scenes.",
      "Keep animal appearance identical across every scene.",
      "Do not introduce new characters, locations or props unless the story requires them.",
      `Scene location: ${sceneLocation(sourceScene)}.`,
      `Characters in this scene: ${characters.join(", ") || "main story character"}.`,
      `Animals in this scene: ${animals.join(", ") || "none"}.`,
      `Objects in this scene: ${objects.join(", ") || "none"}.`
    ].join(" ");

    scenes.push({
      scene_number: i + 1,
      start_time: startTime,
      end_time: endTime,
      duration: endTime - startTime,
      phase: sourceScene.phase,
      location: sceneLocation(sourceScene),
      characters,
      animals,
      objects,
      visual_prompt:
        `${sourceScene.visual} Realistic cinematic visual style, detailed natural movement, consistent characters, aspect ratio ${aspectRatio}.`,
      camera: generateCamera(i, totalScenes),
      lighting: generateLighting(sourceScene, storyData),
      action: sourceScene.action,
      dialogue: generateDialogue(sourceScene, storyData),
      voiceover: generateVoiceover(sourceScene),
      continuity
    });
  }

  return {
    duration: durationSeconds,
    total_scenes: totalScenes,
    aspect_ratio: aspectRatio,
    story,
    story_understanding: {
      goal: storyData.goal,
      conflict: storyData.conflict,
      characters: storyData.characters,
      animals: storyData.animals,
      locations: storyData.locations,
      objects: storyData.objects,
      conditions: storyData.conditions,
      events: storyData.events
    },
    master_character_lock: buildCharacterLock(storyData),
    story_element_lock: buildElementLock(storyData),
    timeline: timeline.map((item, index) => ({
      timeline_number: index + 1,
      phase: item.phase,
      location: item.location,
      action: item.action
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
    message: "SANAPTAI V10 server is working"
  });
});

/* =========================
   DEMO PROJECT
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

    const result = generateScenes(
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
    console.error("Demo Project Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* =========================
   GEMINI AI PLANNER
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

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Story prompt is required."
      });
    }

    const totalScenes = createSceneCount(
      durationToSeconds(duration || 30)
    );

    const systemInstruction = `
You are SANAPTAI Story Planning Engine.

Convert the user's story into exactly ${totalScenes} scenes.

STRICT RULES:

1. Every scene is exactly 10 seconds.
2. One main action per scene.
3. Preserve chronological story order.
4. Maintain character consistency.
5. Maintain location continuity.
6. Do not invent unrelated objects.
7. Do not invent vehicles unless the story mentions one.
8. Keep animal appearance identical.
9. Dialogue must fit naturally inside 10 seconds.
10. Include voiceover when appropriate.
11. Output valid JSON only.

Required JSON:
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
      contents: `${systemInstruction}

Story:
${prompt}

Aspect Ratio:
${aspectRatio || "16:9"}
`
    });

    const text =
      response.text ||
      response.candidates?.[0]?.content?.parts
        ?.map(p => p.text || "")
        .join("") ||
      "";

    let parsed;

    try {
      parsed = JSON.parse(
        text
          .replace(/^```json/i, "")
          .replace(/^```/i, "")
          .replace(/```$/i, "")
          .trim()
      );
    } catch {
      return res.status(500).json({
        success: false,
        error: "Gemini returned invalid JSON.",
        raw: text
      });
    }

    res.json({
      success: true,
      mode: "ai",
      duration: durationToSeconds(duration || 30),
      total_scenes: totalScenes,
      aspect_ratio: aspectRatio || "16:9",
      scenes: parsed.scenes || []
    });

  } catch (error) {
    console.error("Gemini Planner Error:", error);

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

    const project = generateScenes(
      prompt,
      duration || 30,
      aspectRatio || "16:9"
    );

    res.json({
      success: true,
      project
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
  res.send("SANAPTAI V10 is running.");
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SANAPTAI V10 running on port ${PORT}`);
});
