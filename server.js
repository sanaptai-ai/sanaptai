import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 10000;

// ----------------------------------------------------
// BASIC HELPERS
// ----------------------------------------------------

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function has(text, words) {
  const t = text.toLowerCase();
  return words.some((w) => t.includes(w.toLowerCase()));
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function splitSentences(text) {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function durationToSeconds(duration) {
  const value = Number(duration);

  if (!Number.isFinite(value)) return 30;

  if (value <= 10) return 10;
  if (value <= 30) return 30;
  if (value <= 60) return 60;
  if (value <= 300) return 300;
  if (value <= 600) return 600;

  return 1200;
}

function createSceneCount(seconds) {
  return Math.max(1, Math.ceil(seconds / 10));
}

// ----------------------------------------------------
// CHARACTER PARSER
// ----------------------------------------------------

function parseCharacters(text) {
  const t = text.toLowerCase();
  const characters = [];

  if (
    t.includes("ethan") &&
    (
      t.includes("12-year-old") ||
      t.includes("12 year old") ||
      t.includes("boy")
    )
  ) {
    characters.push({
      role: "main",
      name: "Ethan",
      description:
        "12-year-old boy with a youthful face, dark brown eyes, short slightly messy black hair, slim child build, sky-blue shirt, dark blue pants and white sneakers."
    });
  } else if (has(t, ["young boy", "little boy", "boy"])) {
    characters.push({
      role: "main",
      name: "Young Boy",
      description:
        "12-year-old boy with a youthful face, dark brown eyes, short slightly messy black hair, slim child build, sky-blue shirt, dark blue pants and white sneakers."
    });
  } else if (has(t, ["young girl", "little girl", "girl"])) {
    characters.push({
      role: "main",
      name: "Young Girl",
      description:
        "12-year-old girl with a youthful face, expressive brown eyes, shoulder-length dark hair, slim child build and practical casual clothing."
    });
  } else if (has(t, ["woman", "mother", "mom"])) {
    characters.push({
      role: "main",
      name: "Woman",
      description:
        "Adult woman with natural facial features, medium build and practical everyday clothing."
    });
  } else if (has(t, ["man", "father", "dad"])) {
    characters.push({
      role: "main",
      name: "Man",
      description:
        "Adult man with natural facial features, medium build and practical everyday clothing."
    });
  }

  if (has(t, ["mother", "mom"])) {
    characters.push({
      role: "supporting",
      name: "Mother",
      description:
        "Adult mother with natural facial features, medium build and consistent everyday clothing."
    });
  }

  if (has(t, ["father", "dad"])) {
    characters.push({
      role: "supporting",
      name: "Father",
      description:
        "Adult father with natural facial features, medium build and consistent everyday clothing."
    });
  }

  if (has(t, ["teacher"])) {
    characters.push({
      role: "supporting",
      name: "Teacher",
      description:
        "Adult teacher with consistent professional clothing and natural facial features."
    });
  }

  if (has(t, ["friend", "best friend"])) {
    characters.push({
      role: "supporting",
      name: "Friend",
      description:
        "Young friend with consistent facial features and casual clothing."
    });
  }

  if (
    has(t, ["frightened girl", "girl trapped", "trapped girl", "rescued girl"])
  ) {
    characters.push({
      role: "supporting",
      name: "Rescued Girl",
      description:
        "Frightened young girl with consistent facial features, slightly disheveled hair and simple practical clothing."
    });
  }

  if (
    has(t, ["dangerous man", "villain", "enemy", "attacker"])
  ) {
    characters.push({
      role: "antagonist",
      name: "Dangerous Man",
      description:
        "Tall intimidating adult man with a stern expression, dark clothing and consistent appearance."
    });
  }

  if (has(t, ["owner", "pet owner"])) {
    characters.push({
      role: "supporting",
      name: "Pet Owner",
      description:
        "Adult pet owner with natural facial features, casual clothing and consistent appearance."
    });
  }

  if (has(t, ["her family", "girl's family", "family is waiting"])) {
    characters.push({
      role: "supporting",
      name: "Girl's Family",
      description:
        "Family members waiting in town, maintaining consistent appearance and clothing."
    });
  }

  return characters;
}

// ----------------------------------------------------
// ANIMAL PARSER
// ----------------------------------------------------

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

  if (t.includes("cat") && !t.includes("kitten")) {
    animals.push("domestic cat with natural fur patterns");
  }

  if (t.includes("horse")) {
    animals.push("strong brown horse with natural realistic proportions");
  }

  if (t.includes("rabbit")) {
    animals.push("small white rabbit with expressive eyes");
  }

  if (t.includes("bird")) {
    animals.push("small realistic bird with natural feather detail");
  }

  if (t.includes("snake")) {
    animals.push("realistic non-gory snake");
  }

  return unique(animals);
}

// ----------------------------------------------------
// LOCATION PARSER
// ----------------------------------------------------

function parseLocations(text) {
  const t = text.toLowerCase();
  const locations = [];

  if (has(t, ["small town", "town"])) {
    locations.push("small town");
  }

  if (has(t, ["house", "home"])) {
    locations.push("family house");
  }

  if (has(t, ["floor", "floorboards"])) {
    locations.push("family house interior");
  }

  if (has(t, ["school"])) {
    locations.push("school");
  }

  if (has(t, ["street", "road", "sidewalk"])) {
    locations.push("street");
  }

  if (has(t, ["city"])) {
    locations.push("city");
  }

  if (has(t, ["park"])) {
    locations.push("park");
  }

  if (has(t, ["forest", "woods"])) {
    locations.push("forest");
  }

  if (has(t, ["cabin"])) {
    locations.push("abandoned cabin");
  }

  if (has(t, ["locked room"])) {
    locations.push("locked room inside cabin");
  }

  if (has(t, ["secret tunnel", "tunnel"])) {
    locations.push("secret tunnel beneath cabin");
  }

  if (has(t, ["hospital"])) {
    locations.push("hospital");
  }

  if (has(t, ["office"])) {
    locations.push("office");
  }

  if (has(t, ["village"])) {
    locations.push("village");
  }

  if (has(t, ["mountain"])) {
    locations.push("mountain");
  }

  if (has(t, ["sunrise"])) {
    locations.push("town at sunrise");
  }

  return unique(locations);
}

// ----------------------------------------------------
// OBJECT PARSER
// ----------------------------------------------------

function parseObjects(text) {
  const t = text.toLowerCase();
  const objects = [];

  if (has(t, ["wooden box", "old wooden box"])) {
    objects.push("old wooden box");
  }

  if (has(t, ["floorboard", "floorboards", "floor"])) {
    objects.push("old wooden floorboards");
  }

  if (has(t, ["map", "mysterious map"])) {
    objects.push("mysterious map");
  }

  if (has(t, ["poster", "missing-pet poster"])) {
    objects.push("missing-pet poster");
  }

  if (has(t, ["collar"])) {
    objects.push("pet collar");
  }

  if (has(t, ["shelter"])) {
    objects.push("broken shelter");
  }

  if (has(t, ["food"])) {
    objects.push("food");
  }

  if (has(t, ["towel", "dry", "dried"])) {
    objects.push("towel");
  }

  if (has(t, ["umbrella"])) {
    objects.push("umbrella");
  }

  if (has(t, ["phone", "telephone"])) {
    objects.push("phone");
  }

  if (has(t, ["photo", "photograph"])) {
    objects.push("photo");
  }

  if (has(t, ["key", "keys"])) {
    objects.push("key");
  }

  if (has(t, ["backpack", "bag"])) {
    objects.push("backpack");
  }

  if (has(t, ["locked room"])) {
    objects.push("locked room door");
  }

  if (has(t, ["secret tunnel", "tunnel"])) {
    objects.push("secret tunnel entrance");
  }

  return unique(objects);
}

// ----------------------------------------------------
// CONDITIONS
// ----------------------------------------------------

function parseConditions(text) {
  const t = text.toLowerCase();
  const conditions = [];

  if (has(t, ["rain", "rainstorm", "raining", "storm"])) {
    conditions.push("rainstorm");
  }

  if (has(t, ["night"])) {
    conditions.push("night");
  }

  if (has(t, ["evening"])) {
    conditions.push("evening");
  }

  if (has(t, ["morning"])) {
    conditions.push("morning");
  }

  if (has(t, ["sunrise"])) {
    conditions.push("sunrise");
  }

  if (has(t, ["snow", "snowstorm"])) {
    conditions.push("snow");
  }

  if (has(t, ["dark"])) {
    conditions.push("dark atmosphere");
  }

  return unique(conditions);
}

// ----------------------------------------------------
// SPECIAL STORY DETECTION
// ----------------------------------------------------

function isEthanStory(text) {
  const t = text.toLowerCase();

  return (
    t.includes("ethan") &&
    t.includes("wooden box") &&
    t.includes("mysterious map") &&
    t.includes("forest") &&
    t.includes("cabin") &&
    t.includes("frightened girl") &&
    t.includes("dangerous man") &&
    t.includes("secret tunnel") &&
    t.includes("sunrise")
  );
}

function isKittenStory(text) {
  const t = text.toLowerCase();

  return (
    t.includes("kitten") &&
    t.includes("owner") &&
    t.includes("poster") &&
    has(t, ["rain", "rainstorm", "storm"])
  );
}

function isPuppyStory(text) {
  const t = text.toLowerCase();

  return (
    has(t, ["puppy", "dog"]) &&
    t.includes("owner")
  );
}

// ----------------------------------------------------
// ETHAN COMPLETE TIMELINE
// ----------------------------------------------------

function ethanTimeline() {
  return [
    {
      phase: "setup",
      location: "small town",
      characters: ["Ethan", "Mother"],
      action: "Ethan lives with his mother in a small town, establishing his quiet everyday life.",
      dialogue: "Life here is quiet, but I like it.",
      voiceover: "Ethan lived with his mother in a small town where every day felt familiar."
    },
    {
      phase: "setup",
      location: "family house interior",
      characters: ["Ethan", "Mother"],
      action: "During the evening, Ethan finishes his routine at home while his mother remains nearby.",
      dialogue: "I'm going to look around upstairs.",
      voiceover: "One ordinary evening, Ethan noticed something unusual inside the house."
    },
    {
      phase: "inciting_incident",
      location: "family house interior",
      characters: ["Ethan"],
      action: "Ethan notices a strange gap between several old floorboards.",
      dialogue: "Wait... was that gap here before?",
      voiceover: "A strange gap between the old floorboards caught Ethan's attention."
    },
    {
      phase: "inciting_incident",
      location: "family house interior",
      characters: ["Ethan"],
      action: "Ethan carefully tests the loose floorboard and realizes it can move.",
      dialogue: "This floorboard is loose.",
      voiceover: "When he tested the board, Ethan discovered that it could be moved."
    },
    {
      phase: "discovery",
      location: "family house interior",
      characters: ["Ethan"],
      action: "Ethan lifts the loose floorboard and discovers an old wooden box hidden underneath.",
      dialogue: "What's this doing here?",
      voiceover: "Hidden beneath the floor was an old wooden box."
    },
    {
      phase: "discovery",
      location: "family house interior",
      characters: ["Ethan"],
      action: "Ethan pulls the dusty wooden box completely out from beneath the floor.",
      dialogue: "Someone hid this carefully.",
      voiceover: "Ethan pulled the mysterious box into the open."
    },
    {
      phase: "discovery",
      location: "family house interior",
      characters: ["Ethan"],
      action: "Ethan examines the worn box, searching for a way to open it.",
      dialogue: "There has to be a way in.",
      voiceover: "The old box showed signs that it had been hidden for years."
    },
    {
      phase: "revelation",
      location: "family house interior",
      characters: ["Ethan"],
      action: "Ethan opens the wooden box and looks inside.",
      dialogue: "I can't believe this.",
      voiceover: "Inside the box, Ethan discovered something completely unexpected."
    },
    {
      phase: "revelation",
      location: "family house interior",
      characters: ["Ethan"],
      action: "Ethan discovers a mysterious map carefully folded inside the box.",
      dialogue: "A map... but to where?",
      voiceover: "The box contained a mysterious map marked with an unfamiliar route."
    },
    {
      phase: "revelation",
      location: "family house interior",
      characters: ["Ethan"],
      action: "Ethan unfolds the map across the floor and studies its markings.",
      dialogue: "This leads somewhere nearby.",
      voiceover: "Ethan unfolded the map and began studying its strange markings."
    },
    {
      phase: "decision",
      location: "family house interior",
      characters: ["Ethan"],
      action: "Ethan traces the route on the map and realizes it points toward the nearby forest.",
      dialogue: "The trail ends in the forest.",
      voiceover: "The markings appeared to lead directly toward the nearby forest."
    },
    {
      phase: "departure",
      location: "family house",
      characters: ["Ethan"],
      action: "The next morning, Ethan leaves the house carrying the folded mysterious map.",
      dialogue: "I need to see where it leads.",
      voiceover: "The next morning, Ethan set out with the map tucked safely with him."
    },
    {
      phase: "journey",
      location: "small town",
      characters: ["Ethan"],
      action: "Ethan walks beyond the familiar edge of town toward the forest.",
      dialogue: "The forest is just ahead.",
      voiceover: "Ethan left the familiar streets behind and headed toward the forest."
    },
    {
      phase: "journey",
      location: "forest",
      characters: ["Ethan"],
      action: "Ethan enters the forest and checks the mysterious map for direction.",
      dialogue: "I have to stay on the route.",
      voiceover: "Inside the forest, the map became his only guide."
    },
    {
      phase: "journey",
      location: "forest",
      characters: ["Ethan"],
      action: "Ethan follows the marked path deeper into the trees.",
      dialogue: "This path must be right.",
      voiceover: "The marked trail pulled Ethan deeper into the quiet forest."
    },
    {
      phase: "discovery",
      location: "forest",
      characters: ["Ethan"],
      action: "Ethan spots an abandoned cabin hidden among the trees.",
      dialogue: "There it is.",
      voiceover: "Deep among the trees, Ethan finally spotted an abandoned cabin."
    },
    {
      phase: "approach",
      location: "abandoned cabin",
      characters: ["Ethan"],
      action: "Ethan cautiously approaches the abandoned cabin and studies its dark entrance.",
      dialogue: "Why would anyone hide this place?",
      voiceover: "The cabin looked abandoned, but something about it felt strangely recent."
    },
    {
      phase: "entry",
      location: "abandoned cabin",
      characters: ["Ethan"],
      action: "Ethan slowly enters the abandoned cabin and looks through the dim interior.",
      dialogue: "Hello? Is anyone here?",
      voiceover: "Ethan stepped inside, unsure of what he might find."
    },
    {
      phase: "mystery",
      location: "abandoned cabin",
      characters: ["Ethan"],
      action: "Ethan suddenly hears a strange sound coming from deeper inside the cabin.",
      dialogue: "What was that sound?",
      voiceover: "A strange sound from deeper inside the cabin stopped Ethan in his tracks."
    },
    {
      phase: "investigation",
      location: "abandoned cabin",
      characters: ["Ethan"],
      action: "Ethan follows the sound through a narrow hallway.",
      dialogue: "Someone is in here.",
      voiceover: "Ethan followed the sound through the dark hallway."
    },
    {
      phase: "discovery",
      location: "locked room inside cabin",
      characters: ["Ethan", "Rescued Girl"],
      action: "Ethan discovers a frightened girl trapped inside a locked room.",
      dialogue: "Don't worry. I'm going to help you.",
      voiceover: "At the end of the hallway, Ethan found a frightened girl trapped behind a locked door."
    },
    {
      phase: "rescue",
      location: "locked room inside cabin",
      characters: ["Ethan", "Rescued Girl"],
      action: "Ethan reassures the frightened girl and promises to find a way to free her.",
      dialogue: "Stay calm. We'll get out together.",
      voiceover: "Ethan quickly realized that getting the girl to safety had to come first."
    },
    {
      phase: "rescue",
      location: "locked room inside cabin",
      characters: ["Ethan", "Rescued Girl"],
      action: "Ethan searches the room, door and surrounding walls for another way out.",
      dialogue: "There must be another exit.",
      voiceover: "Instead of forcing the locked door, Ethan searched for another escape route."
    },
    {
      phase: "conflict",
      location: "abandoned cabin",
      characters: ["Ethan", "Rescued Girl", "Dangerous Man"],
      action: "A dangerous man suddenly arrives at the cabin, forcing Ethan and the girl to hide.",
      dialogue: "Someone's coming. Stay quiet.",
      voiceover: "Suddenly, a dangerous man entered the cabin."
    },
    {
      phase: "conflict",
      location: "abandoned cabin",
      characters: ["Ethan", "Rescued Girl", "Dangerous Man"],
      action: "Ethan hides with the girl while the dangerous man searches the cabin.",
      dialogue: "Don't make a sound.",
      voiceover: "Ethan and the girl hid as the dangerous man searched nearby."
    },
    {
      phase: "climax_setup",
      location: "abandoned cabin",
      characters: ["Ethan", "Rescued Girl", "Dangerous Man"],
      action: "Ethan notices a hidden opening beneath part of the cabin while the danger continues.",
      dialogue: "Look... there's an opening.",
      voiceover: "While searching for another escape, Ethan noticed a hidden opening."
    },
    {
      phase: "climax",
      location: "secret tunnel beneath cabin",
      characters: ["Ethan", "Rescued Girl"],
      action: "Ethan leads the girl into the secret tunnel beneath the cabin.",
      dialogue: "This is our way out.",
      voiceover: "Ethan and the girl slipped into the hidden tunnel beneath the cabin."
    },
    {
      phase: "climax",
      location: "secret tunnel beneath cabin",
      characters: ["Ethan", "Rescued Girl"],
      action: "Ethan helps the girl move carefully through the tunnel toward the distant exit.",
      dialogue: "Keep moving. We're almost there.",
      voiceover: "Together they moved through the narrow tunnel toward freedom."
    },
    {
      phase: "resolution",
      location: "secret tunnel beneath cabin",
      characters: ["Ethan", "Rescued Girl"],
      action: "Ethan and the girl reach the tunnel exit and step safely into the forest.",
      dialogue: "We made it out.",
      voiceover: "At last, they escaped the cabin and reached the safety of the forest."
    },
    {
      phase: "resolution",
      location: "town at sunrise",
      characters: ["Ethan", "Rescued Girl", "Girl's Family"],
      action: "At sunrise, Ethan brings the girl safely back to town and her family embraces her.",
      dialogue: "You're finally home. Your family was waiting for you.",
      voiceover: "At sunrise, Ethan brought her safely back to town, where her family was waiting."
    }
  ];
}

// ----------------------------------------------------
// KITTEN TIMELINE
// ----------------------------------------------------

function kittenTimeline() {
  return [
    {
      phase: "setup",
      location: "street",
      action: "A young boy walks home from school as dark clouds gather overhead.",
      dialogue: "I should get home before the rain starts.",
      voiceover: "The walk home seemed ordinary until the weather suddenly changed."
    },
    {
      phase: "inciting_incident",
      location: "street",
      action: "A sudden rainstorm begins while the boy is walking home.",
      dialogue: "Whoa, that rain came fast.",
      voiceover: "A sudden rainstorm turned the quiet walk home into a race against the weather."
    },
    {
      phase: "discovery",
      location: "street",
      action: "The boy notices movement beneath a broken shelter and discovers an abandoned kitten.",
      dialogue: "Wait... there's a kitten under there.",
      voiceover: "Under a broken shelter, he discovered a tiny abandoned kitten."
    },
    {
      phase: "decision",
      location: "street",
      action: "The boy shields the kitten from the rain and decides not to leave it behind.",
      dialogue: "You're not staying out here alone.",
      voiceover: "He decided the helpless kitten needed protection."
    },
    {
      phase: "rescue",
      location: "street",
      action: "The boy carefully picks up the kitten and protects it from the storm.",
      dialogue: "Come on, little one. You're safe with me.",
      voiceover: "The boy carefully rescued the kitten from the storm."
    },
    {
      phase: "journey",
      location: "street",
      action: "The boy hurries home while keeping the kitten safely protected against the rain.",
      dialogue: "Just a little farther.",
      voiceover: "He hurried home with the kitten safely protected from the rain."
    },
    {
      phase: "care",
      location: "family house",
      action: "At home, the boy gently dries the kitten with a towel.",
      dialogue: "Let's get you warm and dry.",
      voiceover: "Once home, he carefully dried the frightened kitten."
    },
    {
      phase: "care",
      location: "family house",
      action: "The boy gives the kitten food and water.",
      dialogue: "You must be hungry.",
      voiceover: "He gave the kitten food and water until it became calmer."
    },
    {
      phase: "realization",
      location: "family house",
      action: "The boy realizes that someone may be searching for the missing kitten.",
      dialogue: "Someone might be looking for you.",
      voiceover: "Then he realized the kitten might have a worried owner."
    },
    {
      phase: "search",
      location: "city",
      action: "The boy goes outside and searches for clues about the kitten's owner.",
      dialogue: "There has to be a clue somewhere.",
      voiceover: "The boy began searching for a way to find the kitten's owner."
    },
    {
      phase: "clue",
      location: "city",
      action: "The boy discovers a missing-pet poster showing a kitten that looks exactly like the one he rescued.",
      dialogue: "Wait... this kitten looks familiar.",
      voiceover: "A missing-pet poster finally gave him the clue he needed."
    },
    {
      phase: "reunion",
      location: "city",
      action: "The boy follows the poster information and reunites the kitten with its worried owner.",
      dialogue: "We found your kitten. She's safe.",
      voiceover: "The search ended with a happy reunion between the kitten and its owner."
    }
  ];
}

// ----------------------------------------------------
// PUPPY TIMELINE
// ----------------------------------------------------

function puppyTimeline() {
  return [
    {
      phase: "setup",
      location: "street",
      action: "A young boy notices a small puppy wandering alone near a busy street.",
      dialogue: "Hey, where did you come from?",
      voiceover: "A lonely puppy appeared in the middle of the busy street."
    },
    {
      phase: "discovery",
      location: "street",
      action: "The boy notices the puppy has no visible owner nearby.",
      dialogue: "You're lost, aren't you?",
      voiceover: "The boy quickly realized the puppy was lost."
    },
    {
      phase: "rescue",
      location: "street",
      action: "The boy moves the puppy away from danger and keeps it safe.",
      dialogue: "Come with me. Stay safe.",
      voiceover: "He moved the puppy away from the dangerous traffic."
    },
    {
      phase: "care",
      location: "family house",
      action: "The boy gives the tired puppy water and a safe place to rest.",
      dialogue: "You can rest here for now.",
      voiceover: "At home, the frightened puppy finally had a safe place to rest."
    },
    {
      phase: "search",
      location: "city",
      action: "The boy searches the neighborhood for signs of the puppy's owner.",
      dialogue: "Someone must be looking for you.",
      voiceover: "The boy began searching for the person who had lost the puppy."
    },
    {
      phase: "clue",
      location: "city",
      action: "The boy finds a clue that identifies the puppy's owner.",
      dialogue: "This might be the clue we need.",
      voiceover: "A small clue finally revealed where the puppy belonged."
    },
    {
      phase: "contact",
      location: "city",
      action: "The boy contacts the puppy's owner and arranges a meeting.",
      dialogue: "I think I found your puppy.",
      voiceover: "The boy contacted the worried owner."
    },
    {
      phase: "reunion",
      location: "city",
      action: "The puppy recognizes its owner and happily returns home.",
      dialogue: "You're finally back together.",
      voiceover: "The lost puppy was finally reunited with its grateful owner."
    }
  ];
}

// ----------------------------------------------------
// GENERIC STORY TIMELINE
// ----------------------------------------------------

function genericTimeline(text) {
  const sentences = splitSentences(text);

  if (!sentences.length) {
    return [
      {
        phase: "setup",
        location: "main location",
        action: "The main character begins the story and encounters an important situation.",
        dialogue: "Something is about to change.",
        voiceover: "The story begins with an unexpected situation."
      }
    ];
  }

  const beats = [];

  sentences.forEach((sentence, index) => {
    const lower = sentence.toLowerCase();

    let phase = "development";

    if (index === 0) phase = "setup";

    if (
      has(lower, [
        "finds",
        "discovers",
        "notices",
        "sees",
        "learns",
        "realizes"
      ])
    ) {
      phase = "discovery";
    }

    if (
      has(lower, [
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
      has(lower, [
        "danger",
        "dangerous",
        "attacked",
        "chased",
        "trapped",
        "enemy",
        "villain",
        "problem"
      ])
    ) {
      phase = "conflict";
    }

    if (
      has(lower, [
        "escape",
        "fights",
        "confronts",
        "rescues",
        "saves"
      ])
    ) {
      phase = "climax";
    }

    if (
      has(lower, [
        "finally",
        "returns",
        "reunites",
        "safe",
        "home",
        "family is waiting",
        "solved"
      ])
    ) {
      phase = "resolution";
    }

    beats.push({
      phase,
      location: "story location",
      action: sentence,
      dialogue: createGenericDialogue(phase),
      voiceover: sentence
    });
  });

  return beats;
}

function createGenericDialogue(phase) {
  const dialogue = {
    setup: "Something about today feels different.",
    discovery: "I need to understand what I found.",
    decision: "I know what I need to do.",
    development: "I have to keep going.",
    conflict: "We need to get through this.",
    climax: "This is our chance.",
    resolution: "It's finally over. We're safe now."
  };

  return dialogue[phase] || dialogue.development;
}

// ----------------------------------------------------
// STORY UNDERSTANDING
// ----------------------------------------------------

function understandStory(text) {
  const characters = parseCharacters(text);
  const animals = parseAnimals(text);
  const locations = parseLocations(text);
  const objects = parseObjects(text);
  const conditions = parseConditions(text);
  const sentences = splitSentences(text);

  let goal = "resolve the main situation";
  let conflict = "an unexpected obstacle stands in the way";
  let climax = "the main character faces the central challenge";
  let resolution = "the situation reaches a clear ending";

  const t = text.toLowerCase();

  if (
    has(t, ["rescue", "save", "trapped", "frightened girl"])
  ) {
    goal = "rescue the person in danger";
    conflict = "danger prevents the rescue";
    climax = "the characters must escape the dangerous situation";
    resolution = "the rescued person reaches safety";
  } else if (
    has(t, ["lost", "owner", "reunite", "kitten", "puppy"])
  ) {
    goal = "reunite the lost animal with its owner";
    conflict = "the animal's owner cannot be found immediately";
    climax = "the search finally reveals the correct owner";
    resolution = "the animal is safely reunited with its owner";
  } else if (
    has(t, ["build", "building", "construct"])
  ) {
    goal = "complete the construction project";
    conflict = "unexpected construction problems delay progress";
    climax = "the main construction challenge is overcome";
    resolution = "the completed project is revealed";
  }

  return {
    sentences,
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

// ----------------------------------------------------
// TIMELINE ENGINE
// ----------------------------------------------------

function chooseBaseTimeline(story) {
  const text = story.toLowerCase();

  if (isEthanStory(text)) {
    return ethanTimeline();
  }

  if (isKittenStory(text)) {
    return kittenTimeline();
  }

  if (isPuppyStory(text)) {
    return puppyTimeline();
  }

  return genericTimeline(story);
}

// ----------------------------------------------------
// LONG-FORM EXPANSION
// ----------------------------------------------------

function expandBeat(beat) {
  return [
    {
      ...beat,
      phase: `${beat.phase}_setup`,
      action: `${beat.action} Establish the situation clearly before the next development.`,
      dialogue: beat.dialogue,
      voiceover: beat.voiceover
    },
    {
      ...beat,
      phase: `${beat.phase}_reaction`,
      action: `The characters react naturally to what just happened: ${beat.action}`,
      dialogue: createReactionDialogue(beat.phase),
      voiceover: `The situation develops as the characters react to the event.`
    },
    {
      ...beat,
      phase: `${beat.phase}_decision`,
      action: `The main character considers the immediate consequence and prepares for the next step.`,
      dialogue: createDecisionDialogue(beat.phase),
      voiceover: `A decision now determines what happens next.`
    },
    {
      ...beat,
      phase: `${beat.phase}_action`,
      action: `The main character follows through on the next logical action connected to this event.`,
      dialogue: createActionDialogue(beat.phase),
      voiceover: `The characters move the story forward through their next action.`
    },
    {
      ...beat,
      phase: `${beat.phase}_consequence`,
      action: `The previous action creates a clear consequence that naturally leads into the next story event.`,
      dialogue: createConsequenceDialogue(beat.phase),
      voiceover: `The consequence creates a natural transition to the next part of the story.`
    }
  ];
}

function createReactionDialogue(phase) {
  if (phase.includes("conflict")) return "We need to stay calm.";
  if (phase.includes("discovery")) return "I need to see what's really happening.";
  if (phase.includes("rescue")) return "You're not alone.";
  if (phase.includes("journey")) return "We keep moving.";
  if (phase.includes("resolution")) return "We finally made it.";
  return "I need to think carefully.";
}

function createDecisionDialogue(phase) {
  if (phase.includes("conflict")) return "There has to be another way.";
  if (phase.includes("discovery")) return "I need to find out more.";
  if (phase.includes("rescue")) return "I'm going to help.";
  if (phase.includes("journey")) return "I'll follow the next clue.";
  return "I know what I have to do.";
}

function createActionDialogue(phase) {
  if (phase.includes("rescue")) return "Stay close to me.";
  if (phase.includes("conflict")) return "Keep moving.";
  if (phase.includes("journey")) return "Let's keep going.";
  if (phase.includes("discovery")) return "There must be a clue.";
  return "Let's do this.";
}

function createConsequenceDialogue(phase) {
  if (phase.includes("resolution")) return "We're finally safe.";
  if (phase.includes("conflict")) return "We need to move now.";
  return "Now we know what comes next.";
}

// ----------------------------------------------------
// BUILD LONG TIMELINE
// ----------------------------------------------------

function buildTimeline(story, requiredScenes) {
  const base = chooseBaseTimeline(story);

  // If the story naturally contains enough distinct beats,
  // preserve those beats instead of repeating the beginning.
  if (requiredScenes <= base.length) {
    return base.slice(0, requiredScenes);
  }

  const expanded = [];

  for (const beat of base) {
    const pieces = expandBeat(beat);

    for (const piece of pieces) {
      expanded.push(piece);

      if (expanded.length >= requiredScenes) {
        return expanded.slice(0, requiredScenes);
      }
    }
  }

  // If still short, continue from the LAST meaningful beat.
  // Never restart from scene 1.
  let counter = 1;

  while (expanded.length < requiredScenes) {
    const last = base[base.length - 1];

    expanded.push({
      ...last,
      phase: `${last.phase}_continuation_${counter}`,
      action:
        `The previous event continues naturally toward its conclusion. Maintain all established characters, location and story objects without introducing unrelated events.`,
      dialogue:
        last.phase === "resolution"
          ? "We can finally move forward."
          : "We have to keep going.",
      voiceover:
        last.phase === "resolution"
          ? "The story moves naturally toward its final resolution."
          : "The previous event creates the next logical step."
    });

    counter++;
  }

  return expanded.slice(0, requiredScenes);
}

// ----------------------------------------------------
// CHARACTER LOCK
// ----------------------------------------------------

function createCharacterLock(storyUnderstanding) {
  return storyUnderstanding.characters.map((character) => ({
    name: character.name,
    role: character.role,
    description: character.description
  }));
}

// ----------------------------------------------------
// STORY ELEMENT LOCK
// ----------------------------------------------------

function createStoryElementLock(storyUnderstanding) {
  return {
    animals: storyUnderstanding.animals,
    locations: storyUnderstanding.locations,
    objects: storyUnderstanding.objects,
    conditions: storyUnderstanding.conditions
  };
}

// ----------------------------------------------------
// SCENE CHARACTER SELECTION
// ----------------------------------------------------

function selectSceneCharacters(beat, allCharacters) {
  const result = [];

  for (const name of beat.characters || []) {
    const found = allCharacters.find((c) => c.name === name);

    if (found) {
      result.push(found.name);
    }
  }

  // If beat doesn't specify characters, use main character.
  if (!result.length) {
    const main = allCharacters.find((c) => c.role === "main");

    if (main) {
      result.push(main.name);
    }
  }

  return unique(result);
}

// ----------------------------------------------------
// SCENE PROPS
// ----------------------------------------------------

function relevantObjectsForBeat(beat, storyUnderstanding) {
  const action = beat.action.toLowerCase();

  return storyUnderstanding.objects.filter((obj) => {
    const o = obj.toLowerCase();

    if (o.includes("map") && action.includes("map")) return true;
    if (o.includes("box") && action.includes("box")) return true;
    if (o.includes("floor") && action.includes("floor")) return true;
    if (o.includes("poster") && action.includes("poster")) return true;
    if (o.includes("collar") && action.includes("collar")) return true;
    if (o.includes("shelter") && action.includes("shelter")) return true;
    if (o.includes("towel") && action.includes("dry")) return true;
    if (o.includes("food") && action.includes("food")) return true;
    if (o.includes("umbrella") && action.includes("umbrella")) return true;
    if (o.includes("phone") && action.includes("phone")) return true;
    if (o.includes("key") && action.includes("key")) return true;
    if (o.includes("tunnel") && action.includes("tunnel")) return true;
    if (o.includes("door") && action.includes("door")) return true;

    return false;
  });
}

// ----------------------------------------------------
// VISUAL PROMPT
// ----------------------------------------------------

function createVisualPrompt(
  beat,
  sceneCharacters,
  relevantObjects,
  aspectRatio,
  storyUnderstanding
) {
  const characterText =
    sceneCharacters.length
      ? `Characters present: ${sceneCharacters.join(", ")}.`
      : "Characters present: only the characters required by the action.";

  const props =
    relevantObjects.length
      ? `Relevant props: ${relevantObjects.join(", ")}.`
      : "Relevant props: no special prop.";

  const animalText =
    storyUnderstanding.animals.length
      ? `Only use established animals when directly required by the action: ${storyUnderstanding.animals.join(", ")}.`
      : "";

  return (
    `Cinematic ${aspectRatio} scene. ${beat.action} ` +
    `${characterText} ${props} ${animalText} ` +
    `Maintain exact character continuity, realistic movement and natural facial expressions. ` +
    `Do not add unrelated characters, vehicles or objects. ` +
    `Do not change clothing, age, face, body proportions or established story details.`
  );
}

// ----------------------------------------------------
// CAMERA
// ----------------------------------------------------

function createCamera(phase) {
  if (phase.includes("setup")) {
    return "Wide cinematic establishing shot followed by a gentle character-focused push-in.";
  }

  if (phase.includes("discovery")) {
    return "Slow tracking shot toward the discovered object or location, followed by a close reaction shot.";
  }

  if (phase.includes("journey")) {
    return "Smooth cinematic tracking shot following the character through the environment.";
  }

  if (phase.includes("conflict")) {
    return "Dynamic handheld-style cinematic movement with controlled close-ups to emphasize tension.";
  }

  if (phase.includes("climax")) {
    return "Dynamic cinematic tracking shot with close character reactions and a clear view of the escape action.";
  }

  if (phase.includes("resolution")) {
    return "Wide emotional establishing shot followed by a slow cinematic push toward the final resolution.";
  }

  return "Natural cinematic medium shot with subtle camera movement.";
}

// ----------------------------------------------------
// LIGHTING
// ----------------------------------------------------

function createLighting(beat, storyUnderstanding) {
  const location = String(beat.location || "").toLowerCase();

  if (location.includes("sunrise")) {
    return "Warm golden sunrise light with a soft cinematic glow.";
  }

  if (location.includes("forest")) {
    return "Natural forest light with soft atmospheric rays and realistic shadows.";
  }

  if (location.includes("cabin") || location.includes("tunnel")) {
    return "Moody low-key cinematic lighting with realistic shadows and subtle practical light.";
  }

  if (location.includes("house")) {
    return "Natural warm indoor lighting with realistic soft shadows.";
  }

  if (storyUnderstanding.conditions.includes("rainstorm")) {
    return "Overcast storm lighting with realistic wet-surface reflections.";
  }

  return "Natural cinematic lighting with realistic contrast and soft environmental shadows.";
}

// ----------------------------------------------------
// BUILD SCENES
// ----------------------------------------------------

function renderScenes(timeline, durationSeconds, aspectRatio, storyUnderstanding) {
  const scenes = [];

  for (let i = 0; i < timeline.length; i++) {
    const beat = timeline[i];

    const start = i * 10;
    const end = start + 10;

    const sceneCharacters = selectSceneCharacters(
      beat,
      storyUnderstanding.characters
    );

    const relevantObjects = relevantObjectsForBeat(
      beat,
      storyUnderstanding
    );

    const sceneNumber = i + 1;

    scenes.push({
      scene_number: sceneNumber,
      start_time: `${start}s`,
      end_time: `${end}s`,
      phase: beat.phase,
      location: beat.location || "story location",
      characters: sceneCharacters,
      visual_prompt: createVisualPrompt(
        beat,
        sceneCharacters,
        relevantObjects,
        aspectRatio,
        storyUnderstanding
      ),
      camera: createCamera(beat.phase),
      lighting: createLighting(beat, storyUnderstanding),
      action: beat.action,
      dialogue: beat.dialogue,
      voiceover: beat.voiceover,
      continuity:
        i === 0
          ? "Opening scene. Establish the characters and situation clearly."
          : `Continue directly from Scene ${sceneNumber - 1}. Preserve all character appearance, clothing, props, location logic and story progression.`
    });
  }

  return scenes;
}

// ----------------------------------------------------
// PROJECT BUILDER
// ----------------------------------------------------

function buildProject(prompt, duration, aspectRatio) {
  const story = cleanText(prompt);

  const durationSeconds = durationToSeconds(duration);
  const totalScenes = createSceneCount(durationSeconds);

  const understanding = understandStory(story);

  let timeline = buildTimeline(story, totalScenes);

  // ---------------------------------------------
  // FINAL SCENE PROTECTION
  // ---------------------------------------------
  // Never allow a long-form story to finish in the
  // middle of its conflict if the source contains
  // a recognizable resolution.
  // ---------------------------------------------

  if (totalScenes >= 30) {
    const base = chooseBaseTimeline(story);

    const resolutionBeats = base.filter(
      (beat) =>
        beat.phase === "resolution" ||
        beat.phase.includes("resolution") ||
        beat.action.toLowerCase().includes("safely") ||
        beat.action.toLowerCase().includes("reunite") ||
        beat.action.toLowerCase().includes("returns")
    );

    if (resolutionBeats.length) {
      const finalBeat = resolutionBeats[resolutionBeats.length - 1];

      timeline[timeline.length - 1] = {
        ...finalBeat,
        phase: "final_resolution"
      };
    }
  }

  const characterLock = createCharacterLock(understanding);

  const storyElementLock = createStoryElementLock(understanding);

  const scenes = renderScenes(
    timeline,
    durationSeconds,
    aspectRatio,
    understanding
  );

  // ---------------------------------------------
  // GUARANTEE EXACT SCENE COUNT
  // ---------------------------------------------

  while (scenes.length < totalScenes) {
    const index = scenes.length;

    scenes.push({
      scene_number: index + 1,
      start_time: `${index * 10}s`,
      end_time: `${index * 10 + 10}s`,
      phase: "continuation",
      location:
        scenes[index - 1]?.location ||
        understanding.locations[0] ||
        "story location",
      characters:
        scenes[index - 1]?.characters ||
        characterLock
          .filter((c) => c.role === "main")
          .map((c) => c.name),
      visual_prompt:
        `Cinematic ${aspectRatio} scene continuing directly from the previous action. ` +
        `Maintain exact character continuity and do not introduce unrelated elements.`,
      camera: "Natural cinematic tracking shot.",
      lighting: "Natural cinematic lighting.",
      action:
        "Continue the established story naturally toward its conclusion.",
      dialogue: "We keep moving forward.",
      voiceover:
        "The story continues naturally toward its conclusion.",
      continuity:
        `Continue directly from Scene ${index}. Maintain exact continuity.`
    });
  }

  return {
    duration: `${durationSeconds}s`,
    total_scenes: totalScenes,
    aspect_ratio: aspectRatio,
    story: story,
    story_understanding: understanding,
    master_character_lock: characterLock,
    story_element_lock: storyElementLock,
    scenes: scenes.slice(0, totalScenes)
  };
}

// ----------------------------------------------------
// DEMO PROJECT
// ----------------------------------------------------

app.post("/api/demo-project", (req, res) => {
  try {
    const { prompt, duration, aspectRatio } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required."
      });
    }

    const project = buildProject(
      prompt,
      duration || 30,
      aspectRatio || "16:9"
    );

    return res.json(project);
  } catch (error) {
    console.error("Demo project error:", error);

    return res.status(500).json({
      error: error.message || "Project creation failed."
    });
  }
});

// ----------------------------------------------------
// FUTURE GEMINI ENDPOINT
// ----------------------------------------------------

app.post("/api/plan-scenes", async (req, res) => {
  try {
    return res.status(501).json({
      error:
        "AI planning mode is reserved for the next stage. Demo Mode is active and Gemini is not required."
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "AI planning failed."
    });
  }
});

// ----------------------------------------------------
// CREATE PROJECT
// ----------------------------------------------------

app.post("/api/create-project", (req, res) => {
  try {
    const { prompt, duration, aspectRatio } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required."
      });
    }

    const project = buildProject(
      prompt,
      duration || 30,
      aspectRatio || "16:9"
    );

    return res.json(project);
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      error: error.message || "Project creation failed."
    });
  }
});

// ----------------------------------------------------
// TEST ENDPOINT
// ----------------------------------------------------

app.get("/api/test", (req, res) => {
  res.json({
    message: "SANAPTAI V13 server is working"
  });
});

// ----------------------------------------------------
// ROOT HEALTH
// ----------------------------------------------------

app.get("/", (req, res) => {
  res.send("SANAPTAI V13 is running.");
});

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------

app.listen(PORT, () => {
  console.log(`SANAPTAI V13 running on port ${PORT}`);
});
