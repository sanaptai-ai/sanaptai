import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));


// =====================================================
// HELPERS
// =====================================================

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function has(text, words) {
  const t = String(text).toLowerCase();
  return words.some((word) => t.includes(word.toLowerCase()));
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function splitSentences(text) {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function durationToSeconds(duration) {
  const n = Number(duration);

  if (!Number.isFinite(n)) return 30;
  if (n <= 10) return 10;
  if (n <= 30) return 30;
  if (n <= 60) return 60;
  if (n <= 300) return 300;
  if (n <= 600) return 600;

  return 1200;
}

function sceneCount(seconds) {
  return Math.ceil(seconds / 10);
}


// =====================================================
// CHARACTER PARSER
// =====================================================

function parseCharacters(text) {
  const t = text.toLowerCase();
  const characters = [];

  if (
    t.includes("noah") &&
    (t.includes("14-year-old") || t.includes("14 year old"))
  ) {
    characters.push({
      role: "main",
      name: "Noah",
      description:
        "14-year-old boy named Noah, youthful face, dark brown eyes, short slightly messy black hair, slim teenage build, casual blue shirt, dark jeans and white sneakers."
    });
  } else if (has(t, ["young boy", "little boy", "boy"])) {
    characters.push({
      role: "main",
      name: "Young Boy",
      description:
        "Young boy with youthful face, dark eyes, short slightly messy hair and consistent casual clothing."
    });
  } else if (has(t, ["young girl", "little girl", "girl"])) {
    characters.push({
      role: "main",
      name: "Young Girl",
      description:
        "Young girl with youthful face, expressive eyes and consistent casual clothing."
    });
  } else if (has(t, ["woman", "mother", "mom"])) {
    characters.push({
      role: "main",
      name: "Woman",
      description:
        "Adult woman with natural facial features and consistent everyday clothing."
    });
  } else if (has(t, ["man", "father", "dad"])) {
    characters.push({
      role: "main",
      name: "Man",
      description:
        "Adult man with natural facial features and consistent everyday clothing."
    });
  }

  if (has(t, ["father", "dad"])) {
    characters.push({
      role: "supporting",
      name: "Father",
      description:
        "Adult father with natural facial features, medium build and consistent casual clothing."
    });
  }

  if (has(t, ["mother", "mom"])) {
    characters.push({
      role: "supporting",
      name: "Mother",
      description:
        "Adult mother with natural facial features, medium build and consistent casual clothing."
    });
  }

  if (has(t, ["villager", "villagers"])) {
    characters.push({
      role: "supporting",
      name: "Villagers",
      description:
        "Group of coastal-town villagers wearing practical everyday clothing."
    });
  }

  if (has(t, ["girl trapped", "frightened girl", "trapped girl"])) {
    characters.push({
      role: "supporting",
      name: "Rescued Girl",
      description:
        "Frightened young girl with consistent facial features and practical clothing."
    });
  }

  if (has(t, ["dangerous man", "villain", "enemy"])) {
    characters.push({
      role: "antagonist",
      name: "Dangerous Man",
      description:
        "Tall intimidating adult man wearing dark clothing with a stern expression."
    });
  }

  if (has(t, ["owner", "pet owner"])) {
    characters.push({
      role: "supporting",
      name: "Pet Owner",
      description:
        "Adult pet owner with consistent casual appearance."
    });
  }

  return characters;
}


// =====================================================
// ANIMALS
// =====================================================

function parseAnimals(text) {
  const t = text.toLowerCase();
  const animals = [];

  if (t.includes("kitten")) {
    animals.push(
      "small kitten with soft light-gray fur, white chest, white paws and expressive green eyes"
    );
  }

  if (t.includes("puppy") || t.includes("dog")) {
    animals.push(
      "small friendly puppy with soft fur and expressive eyes"
    );
  }

  if (t.includes("horse")) {
    animals.push("realistic brown horse");
  }

  if (t.includes("rabbit")) {
    animals.push("small white rabbit");
  }

  if (t.includes("bird")) {
    animals.push("small realistic bird");
  }

  return unique(animals);
}


// =====================================================
// LOCATIONS
// =====================================================

function parseLocations(text) {
  const t = text.toLowerCase();
  const locations = [];

  if (has(t, ["coastal town", "small town"])) {
    locations.push("small coastal town");
  } else if (t.includes("town")) {
    locations.push("town");
  }

  if (has(t, ["house", "home"])) {
    locations.push("home");
  }

  if (has(t, ["workshop"])) {
    locations.push("father's workshop");
  }

  if (has(t, ["lighthouse"])) {
    locations.push("lighthouse");
  }

  if (has(t, ["harbor", "harbour"])) {
    locations.push("harbor");
  }

  if (has(t, ["forest", "woods"])) {
    locations.push("forest");
  }

  if (has(t, ["cabin"])) {
    locations.push("abandoned cabin");
  }

  if (has(t, ["street", "road"])) {
    locations.push("street");
  }

  if (has(t, ["school"])) {
    locations.push("school");
  }

  return unique(locations);
}


// =====================================================
// OBJECTS
// =====================================================

function parseObjects(text) {
  const t = text.toLowerCase();
  const objects = [];

  if (has(t, ["journal", "lighthouse journal"])) {
    objects.push("old lighthouse journal");
  }

  if (has(t, ["box", "wooden box"])) {
    objects.push("old wooden box");
  }

  if (has(t, ["map", "mysterious map"])) {
    objects.push("mysterious map");
  }

  if (has(t, ["lighthouse signal", "signal"])) {
    objects.push("lighthouse signal equipment");
  }

  if (has(t, ["boat", "rescue boat"])) {
    objects.push("rescue boat");
  }

  if (has(t, ["poster"])) {
    objects.push("poster");
  }

  if (has(t, ["phone", "telephone"])) {
    objects.push("phone");
  }

  if (has(t, ["key", "keys"])) {
    objects.push("key");
  }

  return unique(objects);
}


// =====================================================
// CONDITIONS
// =====================================================

function parseConditions(text) {
  const t = text.toLowerCase();
  const conditions = [];

  if (has(t, ["storm", "stormy", "rainstorm"])) {
    conditions.push("powerful storm");
  }

  if (has(t, ["morning"])) {
    conditions.push("morning");
  }

  if (has(t, ["evening"])) {
    conditions.push("evening");
  }

  if (has(t, ["sunrise"])) {
    conditions.push("sunrise");
  }

  if (has(t, ["night"])) {
    conditions.push("night");
  }

  return unique(conditions);
}


// =====================================================
// NOAH STORY DETECTION
// =====================================================

function isNoahStory(text) {
  const t = text.toLowerCase();

  return (
    t.includes("noah") &&
    t.includes("father") &&
    t.includes("coastal town") &&
    t.includes("lighthouse journal") &&
    t.includes("storm") &&
    t.includes("villagers") &&
    t.includes("lighthouse") &&
    t.includes("rescue boat") &&
    t.includes("harbor")
  );
}


// =====================================================
// NOAH — 30 DISTINCT STORY BEATS
// =====================================================

function noahTimeline() {
  return [
    {
      phase: "setup",
      location: "small coastal town",
      characters: ["Noah", "Father"],
      action:
        "Noah lives with his father in a small coastal town and begins another ordinary morning.",
      dialogue: "It's a quiet morning here.",
      voiceover:
        "Fourteen-year-old Noah lived with his father in a small coastal town."
    },

    {
      phase: "setup",
      location: "father's workshop",
      characters: ["Noah", "Father"],
      action:
        "Noah spends the morning helping his father inside the workshop.",
      dialogue: "Dad, what should I work on?",
      voiceover:
        "That morning, Noah was helping his father in the workshop."
    },

    {
      phase: "discovery",
      location: "father's workshop",
      characters: ["Noah"],
      action:
        "While looking around the workshop, Noah notices an old journal hidden behind some tools.",
      dialogue: "What's this old book?",
      voiceover:
        "While searching for a tool, Noah discovered an old journal."
    },

    {
      phase: "discovery",
      location: "father's workshop",
      characters: ["Noah"],
      action:
        "Noah carefully pulls the old lighthouse journal from its hiding place.",
      dialogue: "This looks important.",
      voiceover:
        "The worn journal appeared to have been hidden there for years."
    },

    {
      phase: "discovery",
      location: "father's workshop",
      characters: ["Noah"],
      action:
        "Noah opens the journal and begins reading its handwritten pages.",
      dialogue: "Who wrote this?",
      voiceover:
        "Inside were handwritten notes about the town's lighthouse."
    },

    {
      phase: "revelation",
      location: "father's workshop",
      characters: ["Noah"],
      action:
        "Noah finds a warning describing a powerful storm approaching the coastal town.",
      dialogue: "A storm is coming?",
      voiceover:
        "One entry contained a warning about a powerful storm approaching."
    },

    {
      phase: "revelation",
      location: "father's workshop",
      characters: ["Noah"],
      action:
        "Noah reads further and realizes the warning is connected to the lighthouse signal.",
      dialogue: "The lighthouse signal matters.",
      voiceover:
        "The journal explained that the lighthouse signal could guide boats away from danger."
    },

    {
      phase: "decision",
      location: "father's workshop",
      characters: ["Noah"],
      action:
        "Noah decides that the townspeople need to hear the warning immediately.",
      dialogue: "I have to warn everyone.",
      voiceover:
        "Noah decided he could not keep the warning to himself."
    },

    {
      phase: "warning",
      location: "small coastal town",
      characters: ["Noah", "Villagers"],
      action:
        "Noah runs into town and begins telling villagers about the approaching storm.",
      dialogue: "A major storm is coming!",
      voiceover:
        "Noah rushed into town and tried to warn the villagers."
    },

    {
      phase: "doubt",
      location: "small coastal town",
      characters: ["Noah", "Villagers"],
      action:
        "Several villagers doubt Noah because the weather still appears relatively calm.",
      dialogue: "Please believe me.",
      voiceover:
        "The villagers struggled to believe the warning while the sky remained calm."
    },

    {
      phase: "doubt",
      location: "small coastal town",
      characters: ["Noah", "Villagers"],
      action:
        "Noah shows the lighthouse journal, but the villagers remain uncertain.",
      dialogue: "The journal warned us.",
      voiceover:
        "Even after seeing the journal, the villagers remained skeptical."
    },

    {
      phase: "warning",
      location: "small coastal town",
      characters: ["Noah"],
      action:
        "Noah looks toward the horizon and notices dark clouds gathering over the sea.",
      dialogue: "Look at the horizon.",
      voiceover:
        "Then Noah saw dark clouds forming over the distant water."
    },

    {
      phase: "storm_arrival",
      location: "small coastal town",
      characters: ["Noah", "Villagers"],
      action:
        "Strong winds begin sweeping through the coastal town as the storm approaches.",
      dialogue: "It's starting.",
      voiceover:
        "The first powerful winds confirmed Noah's warning."
    },

    {
      phase: "storm_arrival",
      location: "small coastal town",
      characters: ["Noah", "Villagers"],
      action:
        "Rain begins falling heavily and the villagers hurry to secure their homes.",
      dialogue: "Everyone needs to get inside.",
      voiceover:
        "Heavy rain quickly swept across the town."
    },

    {
      phase: "problem",
      location: "small coastal town",
      characters: ["Noah"],
      action:
        "Noah notices that the lighthouse signal is no longer visible through the storm.",
      dialogue: "The lighthouse signal is gone.",
      voiceover:
        "Through the rain, Noah realized the lighthouse signal had stopped working."
    },

    {
      phase: "realization",
      location: "small coastal town",
      characters: ["Noah"],
      action:
        "Noah realizes that a damaged lighthouse signal could leave boats without a safe guide.",
      dialogue: "Boats won't see the harbor.",
      voiceover:
        "Without the lighthouse signal, boats approaching the harbor could lose their safest guide."
    },

    {
      phase: "decision",
      location: "small coastal town",
      characters: ["Noah"],
      action:
        "Noah decides that he must reach the lighthouse and restore the signal.",
      dialogue: "I have to fix it.",
      voiceover:
        "Noah made a dangerous decision: he would repair the lighthouse signal himself."
    },

    {
      phase: "journey",
      location: "small coastal town",
      characters: ["Noah"],
      action:
        "Noah moves through the storm toward the lighthouse while fighting against strong wind and rain.",
      dialogue: "I can't turn back.",
      voiceover:
        "Noah pushed through the storm toward the lighthouse."
    },

    {
      phase: "journey",
      location: "lighthouse",
      characters: ["Noah"],
      action:
        "Noah reaches the base of the lighthouse and looks up at the towering structure.",
      dialogue: "I made it.",
      voiceover:
        "At last, Noah reached the lighthouse."
    },

    {
      phase: "climb",
      location: "lighthouse",
      characters: ["Noah"],
      action:
        "Noah begins climbing the lighthouse stairs while the storm shakes the structure.",
      dialogue: "Just keep climbing.",
      voiceover:
        "Noah climbed higher while the storm raged outside."
    },

    {
      phase: "climb",
      location: "lighthouse",
      characters: ["Noah"],
      action:
        "Noah reaches the upper equipment room and discovers damage around the signal mechanism.",
      dialogue: "This is what broke.",
      voiceover:
        "Near the top, Noah found the damaged lighthouse signal mechanism."
    },

    {
      phase: "repair",
      location: "lighthouse",
      characters: ["Noah"],
      action:
        "Noah carefully examines the damaged signal equipment and identifies the problem.",
      dialogue: "I know what needs fixing.",
      voiceover:
        "Noah studied the damaged equipment and found the broken connection."
    },

    {
      phase: "repair",
      location: "lighthouse",
      characters: ["Noah"],
      action:
        "Noah works carefully to reconnect the damaged signal mechanism.",
      dialogue: "Come on... work.",
      voiceover:
        "With the storm still raging, Noah carefully repaired the damaged connection."
    },

    {
      phase: "repair",
      location: "lighthouse",
      characters: ["Noah"],
      action:
        "The lighthouse signal flickers back to life, illuminating the stormy darkness.",
      dialogue: "Yes! It's working!",
      voiceover:
        "The lighthouse signal suddenly flickered back to life."
    },

    {
      phase: "climax",
      location: "lighthouse",
      characters: ["Noah"],
      action:
        "Noah looks through the lighthouse window and spots a rescue boat struggling near the harbor entrance.",
      dialogue: "There's a boat out there!",
      voiceover:
        "From the lighthouse, Noah spotted a rescue boat approaching through the dangerous storm."
    },

    {
      phase: "climax",
      location: "lighthouse",
      characters: ["Noah"],
      action:
        "Noah keeps the lighthouse signal visible so the rescue boat can identify the safe direction.",
      dialogue: "Follow the light!",
      voiceover:
        "Noah kept the restored signal shining as a guide toward the harbor."
    },

    {
      phase: "climax",
      location: "harbor",
      characters: ["Noah"],
      action:
        "The rescue boat follows the lighthouse signal and safely approaches the harbor.",
      dialogue: "They're following it.",
      voiceover:
        "The rescue boat followed the lighthouse signal toward the safe harbor."
    },

    {
      phase: "resolution",
      location: "harbor",
      characters: ["Noah", "Villagers"],
      action:
        "The rescue boat reaches the harbor safely while the worst of the storm begins to weaken.",
      dialogue: "They made it safely.",
      voiceover:
        "The boat reached the harbor as the storm finally began to weaken."
    },

    {
      phase: "resolution",
      location: "small coastal town",
      characters: ["Noah", "Villagers"],
      action:
        "By morning, the storm has passed and the villagers gather safely in town.",
      dialogue: "The storm is over.",
      voiceover:
        "By morning, the powerful storm had finally passed."
    },

    {
      phase: "final_resolution",
      location: "small coastal town",
      characters: ["Noah", "Father", "Villagers"],
      action:
        "The villagers realize that Noah's warning and his lighthouse repair helped save the town, and his father proudly stands beside him.",
      dialogue: "You saved us, Noah.",
      voiceover:
        "The villagers finally understood that Noah's courage and quick thinking had helped save the town."
    }
  ];
}


// =====================================================
// GENERIC EVENT-AWARE TIMELINE
// =====================================================

function genericTimeline(text) {
  const sentences = splitSentences(text);

  return sentences.map((sentence, index) => {
    const t = sentence.toLowerCase();

    let phase = "development";

    if (index === 0) phase = "setup";

    if (
      has(t, [
        "finds",
        "discovers",
        "notices",
        "sees",
        "learns"
      ])
    ) {
      phase = "discovery";
    }

    if (
      has(t, [
        "decides",
        "chooses",
        "plans",
        "tries",
        "attempts"
      ])
    ) {
      phase = "decision";
    }

    if (
      has(t, [
        "danger",
        "dangerous",
        "storm",
        "trapped",
        "chased",
        "enemy",
        "villain",
        "problem"
      ])
    ) {
      phase = "conflict";
    }

    if (
      has(t, [
        "rescues",
        "saves",
        "escapes",
        "fights",
        "confronts"
      ])
    ) {
      phase = "climax";
    }

    if (
      has(t, [
        "finally",
        "returns",
        "reunites",
        "safe",
        "saved",
        "home",
        "morning"
      ])
    ) {
      phase = "resolution";
    }

    return {
      phase,
      location: "story location",
      characters: [],
      action: sentence,
      dialogue: dialogueForPhase(phase),
      voiceover: sentence
    };
  });
}

function dialogueForPhase(phase) {
  const map = {
    setup: "Something feels different today.",
    discovery: "I need to understand this.",
    decision: "I know what I have to do.",
    development: "Let's keep moving.",
    conflict: "We need to stay calm.",
    climax: "This is our chance.",
    resolution: "We made it. We're safe now."
  };

  return map[phase] || "Let's keep moving.";
}


// =====================================================
// STORY UNDERSTANDING
// =====================================================

function understandStory(text) {
  const characters = parseCharacters(text);
  const animals = parseAnimals(text);
  const locations = parseLocations(text);
  const objects = parseObjects(text);
  const conditions = parseConditions(text);

  const t = text.toLowerCase();

  let goal = "resolve the central situation";
  let conflict = "an obstacle threatens the goal";
  let climax = "the main character faces the central challenge";
  let resolution = "the story reaches a clear ending";

  if (isNoahStory(t)) {
    goal = "warn the town and keep the rescue boat safe";
    conflict =
      "a powerful storm and broken lighthouse signal threaten the harbor";
    climax =
      "Noah repairs the lighthouse signal and guides the rescue boat";
    resolution =
      "the storm passes and the villagers realize Noah helped save the town";
  } else if (has(t, ["rescue", "trapped", "dangerous man"])) {
    goal = "rescue the person in danger";
    conflict =
      "the dangerous situation prevents an easy rescue";
    climax =
      "the characters escape the danger";
    resolution =
      "the rescued person reaches safety";
  } else if (
    has(t, ["kitten", "puppy", "owner", "reunite"])
  ) {
    goal = "reunite the lost animal with its owner";
    conflict =
      "the owner cannot immediately be found";
    climax =
      "the correct owner is identified";
    resolution =
      "the animal returns safely to its owner";
  }

  return {
    sentences: splitSentences(text),
    characters,
    animals,
    locations,
    objects,
    conditions,
    goal,
    conflict,
    climax,
    resolution
  };
}


// =====================================================
// TIMELINE SELECTION
// =====================================================

function chooseTimeline(story) {
  const t = story.toLowerCase();

  if (isNoahStory(t)) {
    return noahTimeline();
  }

  if (
    t.includes("kitten") &&
    t.includes("owner") &&
    t.includes("poster")
  ) {
    return [
      {
        phase: "setup",
        location: "street",
        action:
          "The boy walks home from school as dark clouds gather.",
        dialogue: "I should get home soon.",
        voiceover:
          "The walk home begins like an ordinary afternoon."
      },
      {
        phase: "conflict",
        location: "street",
        action: "A sudden rainstorm begins.",
        dialogue: "That rain came fast.",
        voiceover:
          "A sudden storm changes everything."
      },
      {
        phase: "discovery",
        location: "street",
        action:
          "The boy discovers an abandoned kitten under a broken shelter.",
        dialogue: "You're all alone?",
        voiceover:
          "He discovers a tiny abandoned kitten."
      },
      {
        phase: "rescue",
        location: "street",
        action:
          "The boy protects the kitten from the rain.",
        dialogue: "I'll keep you safe.",
        voiceover:
          "He decides not to leave the kitten behind."
      },
      {
        phase: "care",
        location: "home",
        action:
          "The boy carries the kitten home, dries it and gives it food.",
        dialogue: "Let's get you warm.",
        voiceover:
          "At home, he carefully takes care of the kitten."
      },
      {
        phase: "clue",
        location: "city",
        action:
          "The boy finds a missing-pet poster identifying the kitten's owner.",
        dialogue: "I think I found your owner.",
        voiceover:
          "A missing-pet poster provides the clue he needs."
      },
      {
        phase: "resolution",
        location: "city",
        action:
          "The boy reunites the kitten with its worried owner.",
        dialogue: "She's finally home.",
        voiceover:
          "The kitten is safely reunited with its owner."
      }
    ];
  }

  return genericTimeline(story);
}


// =====================================================
// LONG STORY DISTRIBUTION
// =====================================================

function buildTimeline(story, requiredScenes) {
  const base = chooseTimeline(story);

  if (requiredScenes <= base.length) {
    return base.slice(0, requiredScenes);
  }

  const result = [];

  const expansionTemplates = {
    setup: [
      "Establish the situation and surroundings clearly.",
      "Show the character naturally interacting with the established environment."
    ],

    discovery: [
      "The character examines the discovery carefully.",
      "The character reacts to the importance of the discovery."
    ],

    decision: [
      "The character considers the possible consequence.",
      "The character commits to the next logical action."
    ],

    development: [
      "The current action develops naturally.",
      "The result of the action creates the next story step."
    ],

    conflict: [
      "The obstacle becomes more difficult.",
      "The character searches for a practical response."
    ],

    climax: [
      "The central challenge reaches its most important moment.",
      "The character's action directly affects the outcome."
    ],

    resolution: [
      "The immediate danger or problem begins to settle.",
      "The characters see the positive result of their actions."
    ],

    final_resolution: [
      "The final consequence becomes clear.",
      "The story reaches its emotional conclusion."
    ]
  };

  let cursor = 0;

  while (result.length < requiredScenes) {
    const beat = base[cursor % base.length];

    if (
      !result.some(
        (x) => x._baseIndex === cursor % base.length
      )
    ) {
      result.push({
        ...beat,
        _baseIndex: cursor % base.length
      });
    }

    if (result.length >= requiredScenes) break;

    const templates =
      expansionTemplates[beat.phase] ||
      expansionTemplates.development;

    for (const template of templates) {
      if (result.length >= requiredScenes) break;

      result.push({
        ...beat,
        phase: `${beat.phase}_development`,
        action: `${beat.action} ${template}`,
        dialogue: dialogueForPhase(beat.phase),
        voiceover:
          `The story develops naturally as ${template.toLowerCase()}`,
        _baseIndex: cursor % base.length
      });
    }

    cursor++;

    if (cursor > base.length * 3) break;
  }

  const finalBeat = base[base.length - 1];

  if (requiredScenes >= 10) {
    result[requiredScenes - 1] = {
      ...finalBeat,
      phase: "final_resolution",
      _baseIndex: base.length - 1
    };
  }

  return result
    .slice(0, requiredScenes)
    .map(({ _baseIndex, ...scene }) => scene);
}


// =====================================================
// CHARACTER LOCK
// =====================================================

function characterLock(characters) {
  return characters.map((character) => ({
    name: character.name,
    role: character.role,
    description: character.description
  }));
}


// =====================================================
// SCENE CHARACTERS
// =====================================================

function sceneCharacters(beat, allCharacters) {
  if (beat.characters && beat.characters.length) {
    return beat.characters;
  }

  const main = allCharacters.find(
    (x) => x.role === "main"
  );

  return main ? [main.name] : [];
}


// =====================================================
// RELEVANT OBJECTS
// =====================================================

function relevantObjects(beat, understanding) {
  const action = beat.action.toLowerCase();

  return understanding.objects.filter((object) => {
    const o = object.toLowerCase();

    if (o.includes("journal") && action.includes("journal"))
      return true;

    if (o.includes("box") && action.includes("box"))
      return true;

    if (o.includes("map") && action.includes("map"))
      return true;

    if (o.includes("signal") && action.includes("signal"))
      return true;

    if (o.includes("boat") && action.includes("boat"))
      return true;

    if (o.includes("poster") && action.includes("poster"))
      return true;

    if (o.includes("tunnel") && action.includes("tunnel"))
      return true;

    return false;
  });
}


// =====================================================
// CAMERA
// =====================================================

function cameraForPhase(phase) {
  if (phase.includes("setup")) {
    return "Wide cinematic establishing shot followed by a gentle character-focused push-in.";
  }

  if (phase.includes("discovery")) {
    return "Slow cinematic push-in toward the discovered detail followed by a close reaction shot.";
  }

  if (
    phase.includes("journey") ||
    phase.includes("climb")
  ) {
    return "Smooth tracking shot following the character through the environment.";
  }

  if (
    phase.includes("conflict") ||
    phase.includes("storm")
  ) {
    return "Dynamic cinematic tracking with controlled close-ups emphasizing urgency.";
  }

  if (phase.includes("climax")) {
    return "Dynamic wide shot followed by close action coverage and a clear view of the critical event.";
  }

  if (phase.includes("resolution")) {
    return "Wide emotional establishing shot followed by a slow cinematic push toward the final outcome.";
  }

  return "Natural cinematic medium shot with subtle camera movement.";
}


// =====================================================
// V13.2 — SMART LIGHTING
// =====================================================

function lightingForScene(beat, understanding) {
  const location = String(
    beat.location || ""
  ).toLowerCase();

  const phase = String(
    beat.phase || ""
  ).toLowerCase();

  const action = String(
    beat.action || ""
  ).toLowerCase();

  // -----------------------------------------------
  // FINAL MORNING — STORM IS OVER
  // -----------------------------------------------

  if (
    phase.includes("final_resolution") ||
    (
      phase.includes("resolution") &&
      action.includes("by morning")
    )
  ) {
    return "Clear peaceful morning after the storm, soft golden sunlight, fresh wet surfaces, calm sky and warm cinematic atmosphere.";
  }

  // -----------------------------------------------
  // EARLY RESOLUTION — STORM WEAKENING
  // -----------------------------------------------

  if (
    phase.includes("resolution") &&
    (
      action.includes("storm begins to weaken") ||
      action.includes("storm finally began to weaken") ||
      location.includes("harbor")
    )
  ) {
    return "Early morning transition after the storm, soft cool daylight breaking through clouds, wet reflective surfaces and gradually calming atmosphere.";
  }

  // -----------------------------------------------
  // NORMAL MORNING / SETUP
  // -----------------------------------------------

  if (
    phase === "setup" &&
    (
      location.includes("coastal town") ||
      location.includes("workshop")
    )
  ) {
    return "Clear peaceful coastal morning light, soft natural sunlight, calm sky, gentle shadows and realistic cinematic depth. No rain and no storm.";
  }

  // -----------------------------------------------
  // WORKSHOP BEFORE STORM
  // -----------------------------------------------

  if (
    location.includes("workshop") &&
    !action.includes("storm") &&
    !phase.includes("storm")
  ) {
    return "Natural warm morning light entering the workshop, soft realistic shadows and peaceful atmosphere. No rain and no storm.";
  }

  // -----------------------------------------------
  // DISCOVERY / WARNING BEFORE STORM
  // -----------------------------------------------

  if (
    (
      phase.includes("discovery") ||
      phase.includes("revelation") ||
      phase.includes("decision") ||
      phase.includes("warning") ||
      phase.includes("doubt")
    ) &&
    !phase.includes("storm_arrival")
  ) {
    return "Natural daytime coastal lighting with calm weather, soft daylight and realistic environmental shadows. No rain and no active storm.";
  }

  // -----------------------------------------------
  // DARK CLOUDS / STORM APPROACH
  // -----------------------------------------------

  if (
    phase.includes("storm_arrival") ||
    action.includes("dark clouds") ||
    action.includes("storm approaches")
  ) {
    return "Rapidly darkening overcast sky with dramatic clouds, increasing wind, cool atmospheric light and realistic cinematic depth. Rain only when visible in the action.";
  }

  // -----------------------------------------------
  // ACTIVE STORM
  // -----------------------------------------------

  if (
    phase.includes("problem") ||
    phase.includes("journey") ||
    phase.includes("climb") ||
    phase.includes("repair") ||
    phase.includes("climax")
  ) {
    return "Dark dramatic storm lighting with heavy rain, strong wind, wet reflective surfaces and realistic atmospheric depth.";
  }

  // -----------------------------------------------
  // LIGHTHOUSE
  // -----------------------------------------------

  if (location.includes("lighthouse")) {
    return "Moody storm lighting outside with practical lighthouse illumination inside, realistic wet surfaces and cinematic contrast.";
  }

  // -----------------------------------------------
  // FALLBACK
  // -----------------------------------------------

  return "Natural cinematic lighting with realistic contrast and soft environmental shadows.";
}


// =====================================================
// VISUAL PROMPT
// =====================================================

function visualPrompt(
  beat,
  characters,
  objects,
  aspectRatio,
  understanding
) {
  const charText = characters.length
    ? `Characters present: ${characters.join(", ")}.`
    : "Characters present: only characters required by the action.";

  const objectText = objects.length
    ? `Relevant props: ${objects.join(", ")}.`
    : "Relevant props: no special prop.";

  return (
    `Cinematic ${aspectRatio} scene. ${beat.action} ` +
    `${charText} ${objectText} ` +
    `Maintain exact character continuity, realistic movement and natural facial expressions. ` +
    `Do not add unrelated characters, vehicles or objects. ` +
    `Do not change established age, face, hairstyle, clothing, body proportions or important story props.`
  );
}


// =====================================================
// RENDER SCENES
// =====================================================

function renderScenes(
  timeline,
  aspectRatio,
  understanding
) {
  return timeline.map((beat, index) => {
    const number = index + 1;
    const start = index * 10;
    const end = start + 10;

    const chars = sceneCharacters(
      beat,
      understanding.characters
    );

    const objects = relevantObjects(
      beat,
      understanding
    );

    return {
      scene_number: number,
      start_time: `${start}s`,
      end_time: `${end}s`,
      phase: beat.phase,
      location:
        beat.location || "story location",
      characters: chars,

      visual_prompt: visualPrompt(
        beat,
        chars,
        objects,
        aspectRatio,
        understanding
      ),

      camera: cameraForPhase(
        beat.phase
      ),

      lighting: lightingForScene(
        beat,
        understanding
      ),

      action: beat.action,

      dialogue: beat.dialogue,

      voiceover: beat.voiceover,

      continuity:
        number === 1
          ? "Opening scene. Establish the story clearly."
          : `Continue directly from Scene ${number - 1}. Preserve exact character appearance, clothing, location, props and story progression.`
    };
  });
}


// =====================================================
// BUILD PROJECT
// =====================================================

function buildProject(
  prompt,
  duration,
  aspectRatio
) {
  const story = cleanText(prompt);

  if (!story) {
    throw new Error("Prompt is required.");
  }

  const seconds = durationToSeconds(duration);
  const totalScenes = sceneCount(seconds);

  const understanding =
    understandStory(story);

  const timeline = buildTimeline(
    story,
    totalScenes
  );

  const scenes = renderScenes(
    timeline,
    aspectRatio,
    understanding
  );

  return {
    duration: `${seconds}s`,
    total_scenes: totalScenes,
    aspect_ratio: aspectRatio,
    story,
    story_understanding: understanding,

    master_character_lock:
      characterLock(
        understanding.characters
      ),

    story_element_lock: {
      animals: understanding.animals,
      locations: understanding.locations,
      objects: understanding.objects,
      conditions: understanding.conditions
    },

    scenes
  };
}


// =====================================================
// DEMO API
// =====================================================

app.post("/api/demo-project", (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio
    } = req.body;

    const project = buildProject(
      prompt,
      duration || 30,
      aspectRatio || "16:9"
    );

    res.json(project);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error:
        error.message ||
        "Project creation failed."
    });
  }
});


// =====================================================
// CREATE PROJECT
// =====================================================

app.post("/api/create-project", (req, res) => {
  try {
    const {
      prompt,
      duration,
      aspectRatio
    } = req.body;

    const project = buildProject(
      prompt,
      duration || 30,
      aspectRatio || "16:9"
    );

    res.json(project);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error:
        error.message ||
        "Project creation failed."
    });
  }
});


// =====================================================
// AI MODE — RESERVED
// =====================================================

app.post("/api/plan-scenes", (req, res) => {
  res.status(501).json({
    error:
      "AI planning mode is reserved for the next stage. Demo Mode is active."
  });
});


// =====================================================
// TEST
// =====================================================

app.get("/api/test", (req, res) => {
  res.json({
    message:
      "SANAPTAI V13.2 server is working"
  });
});


// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  res.send(
    "SANAPTAI V13.2 is running."
  );
});


// =====================================================
// START
// =====================================================

app.listen(PORT, () => {
  console.log(
    `SANAPTAI V13.2 running on port ${PORT}`
  );
});
