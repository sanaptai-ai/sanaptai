import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const ENGINE_VERSION = "V39.0";

/* =========================================================
   BASIC HELPERS
========================================================= */

function clean(text = "") {
  return String(text)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

function lower(text = "") {
  return String(text).toLowerCase();
}

function unique(arr = []) {
  return [...new Set(arr.filter(Boolean))];
}

function splitStory(prompt = "") {
  const text = String(prompt)
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return [];

  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'“‘])/)
    .map(clean)
    .filter(Boolean);
}

/* =========================================================
   CHARACTER INTELLIGENCE
========================================================= */

const RELATIONSHIPS = [
  ["mother", "Mother"],
  ["mom", "Mother"],
  ["father", "Father"],
  ["dad", "Father"],
  ["grandmother", "Grandmother"],
  ["grandma", "Grandmother"],
  ["grandfather", "Grandfather"],
  ["grandpa", "Grandfather"],
  ["sister", "Sister"],
  ["brother", "Brother"],
  ["friend", "Friend"],
  ["teacher", "Teacher"],
  ["doctor", "Doctor"],
  ["neighbor", "Neighbor"],
  ["neighbour", "Neighbor"],
  ["police officer", "Police Officer"],
  ["policewoman", "Police Officer"],
  ["policeman", "Police Officer"],
  ["rescuer", "Rescuer"],
  ["rescue team", "Rescue Team"],
  ["villagers", "Villagers"],
  ["villager", "Villager"],
  ["daughter", "Daughter"],
  ["son", "Son"],
  ["wife", "Wife"],
  ["husband", "Husband"]
];

const NON_CHARACTER_WORDS = new Set([
  "A",
  "An",
  "The",
  "One",
  "When",
  "While",
  "As",
  "By",
  "Inside",
  "Outside",
  "Together",
  "This",
  "That",
  "It",
  "In",
  "At",
  "On",
  "Then",
  "Finally",
  "Next",
  "Morning",
  "Evening",
  "Night",
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]);

const COMMON_NON_NAMES = new Set([
  "Chicago",
  "New",
  "York",
  "Los",
  "Angeles",
  "London",
  "Paris",
  "America",
  "American",
  "English",
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Morning",
  "Evening",
  "Night",
  "Curious",
  "Finally",
  "Later",
  "Suddenly",
  "Inside",
  "Outside",
  "Together",
  "Family",
  "History"
]);

function extractCharacters(prompt, sentences) {
  const text = String(prompt || "");
  const found = [];

  /*
    1. Explicit names:
    named Ryan
    named Ryan Smith
  */
  for (const match of text.matchAll(
    /\bnamed\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/g
  )) {
    const name = clean(match[1]);

    if (
      name &&
      !COMMON_NON_NAMES.has(name)
    ) {
      found.push(name);
    }
  }

  /*
    2. Names introduced as:
    Ryan, a 19-year-old...
    Ryan is...
    Ryan lives...
  */
  for (const sentence of sentences) {
    const patterns = [
      /\b([A-Z][a-z]{2,})\s*,\s*a\s+(?:\d+[- ]year[- ]old|young|college|teenage|teenaged|adult|man|woman|boy|girl)/g,
      /\b([A-Z][a-z]{2,})\s+(?:is|lives|finds|discovers|goes|runs|walks|shows|takes|returns|decides|starts|begins)\b/g
    ];

    for (const pattern of patterns) {
      for (const match of sentence.matchAll(pattern)) {
        const name = match[1];

        if (
          name &&
          !NON_CHARACTER_WORDS.has(name) &&
          !COMMON_NON_NAMES.has(name)
        ) {
          found.push(name);
        }
      }
    }
  }

  /*
    3. Relationship characters
  */
  const fullText = lower(text);

  for (const [word, label] of RELATIONSHIPS) {
    if (
      new RegExp(
        `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      ).test(fullText)
    ) {
      found.push(label);
    }
  }

  /*
    4. Capitalized words — ONLY when they look like
       real names and aren't known locations/days/etc.
  */
  for (const sentence of sentences) {
    const matches =
      sentence.match(/\b[A-Z][a-z]{2,}\b/g) || [];

    for (const name of matches) {
      if (
        NON_CHARACTER_WORDS.has(name) ||
        COMMON_NON_NAMES.has(name)
      ) {
        continue;
      }

      /*
        Don't treat words after "in", "at", "on", etc.
        as characters when they clearly represent locations.
      */
      const index = sentence.indexOf(name);
      const before = lower(
        sentence.slice(
          Math.max(0, index - 15),
          index
        )
      );

      if (
        /\b(in|at|near|from|to|inside|outside|through)\s*$/.test(
          before
        )
      ) {
        continue;
      }

      /*
        Require stronger evidence for standalone capitalized words.
      */
      if (
        /\b(?:named|said|asks|asked|tells|told|replies|replying|whispers|shouts|yells)\b/i.test(
          sentence
        )
      ) {
        found.push(name);
      }
    }
  }

  return unique(found).slice(0, 12);
}

/* =========================================================
   LOCATION INTELLIGENCE
========================================================= */

const LOCATION_PATTERNS = [
  ["movie theater", "abandoned movie theater"],
  ["cinema", "cinema"],
  ["apartment", "apartment"],
  ["small apartment", "small apartment"],
  ["workshop", "workshop"],
  ["attic", "attic"],
  ["basement", "basement"],
  ["bedroom", "bedroom"],
  ["kitchen", "kitchen"],
  ["living room", "living room"],
  ["secret room", "secret room"],
  ["signal room", "signal room"],
  ["train station", "train station"],
  ["railway station", "railway station"],
  ["airport", "airport"],
  ["hospital", "hospital"],
  ["school", "school"],
  ["office", "office"],
  ["restaurant", "restaurant"],
  ["shop", "shop"],
  ["store", "store"],
  ["warehouse", "warehouse"],
  ["lighthouse", "lighthouse"],
  ["harbor", "harbor"],
  ["harbour", "harbor"],
  ["beach", "beach"],
  ["coast", "coast"],
  ["forest", "forest"],
  ["mountains", "mountains"],
  ["mountain", "mountain"],
  ["village", "village"],
  ["town", "town"],
  ["city", "city"],
  ["street", "street"],
  ["road", "road"],
  ["bridge", "bridge"],
  ["river", "river"],
  ["cave", "cave"],
  ["castle", "castle"],
  ["garden", "garden"],
  ["park", "park"],
  ["house", "house"],
  ["home", "home"]
];

const CITY_NAMES = [
  "Chicago",
  "New York",
  "Los Angeles",
  "San Francisco",
  "Boston",
  "Seattle",
  "Miami",
  "London",
  "Paris",
  "Tokyo",
  "Toronto",
  "Las Vegas",
  "Washington"
];

function detectLocation(sentence, previousLocation = "story location") {
  const text = String(sentence || "");
  const s = lower(text);

  /*
    Prefer specific compound locations.
  */
  for (const [pattern, label] of LOCATION_PATTERNS) {
    if (s.includes(pattern)) {
      let result = label;

      /*
        Capture city after:
        apartment in Chicago
        house in Boston
      */
      for (const city of CITY_NAMES) {
        if (
          new RegExp(
            `\\b${city.replace(" ", "\\s+")}\\b`,
            "i"
          ).test(text)
        ) {
          result += `, ${city}`;
          break;
        }
      }

      return result;
    }
  }

  /*
    City-only location.
  */
  for (const city of CITY_NAMES) {
    if (
      new RegExp(
        `\\b${city.replace(" ", "\\s+")}\\b`,
        "i"
      ).test(text)
    ) {
      return city;
    }
  }

  return previousLocation;
}

/* =========================================================
   OBJECT / STORY CLUE INTELLIGENCE
========================================================= */

const OBJECT_PATTERNS = [
  ["film camera", "old film camera"],
  ["camera", "camera"],
  ["photographs", "photographs"],
  ["photograph", "photograph"],
  ["photo", "photograph"],
  ["journal", "journal"],
  ["letter", "letter"],
  ["metal box", "metal box"],
  ["box", "box"],
  ["symbol", "strange symbol"],
  ["documents", "family documents"],
  ["document", "family document"],
  ["map", "map"],
  ["key", "key"],
  ["ring", "ring"],
  ["necklace", "necklace"],
  ["diary", "diary"],
  ["book", "book"],
  ["note", "note"],
  ["message", "message"],
  ["phone", "phone"],
  ["laptop", "laptop"],
  ["car", "car"],
  ["boat", "boat"],
  ["signal", "signal mechanism"],
  ["mechanism", "mechanism"],
  ["keepsake", "keepsake"],
  ["heirloom", "heirloom"]
];

function extractObjects(text) {
  const found = [];
  const s = lower(text);

  for (const [pattern, label] of OBJECT_PATTERNS) {
    if (
      new RegExp(
        `\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      ).test(s)
    ) {
      found.push(label);
    }
  }

  return unique(found);
}

function objectsForEvent(text) {
  return extractObjects(text);
}

/* =========================================================
   EVENT TYPE
========================================================= */

function detectEventType(sentence) {
  const s = lower(sentence);

  if (
    /\b(?:warns|warning|danger|threat|problem|secret|mystery|lost|trapped|storm|flood|attack|missing|nervous|afraid|refuses|doesn't believe|does not believe)\b/.test(
      s
    )
  ) {
    return "conflict";
  }

  if (
    /\b(?:discovers|discovered|discover|finds|found|find|reveals|learns|realizes|realised|notices|noticed|sees|saw|receives|received|uncovers|opens|reads)\b/.test(
      s
    )
  ) {
    return "discovery";
  }

  if (
    /\b(?:repairs|repair|fixes|fix|rescues|rescue|saves|save|contacts|contact|guides|guide|restores|restore|stops|stop|solves|solve|protects|protect|preserves|preserve)\b/.test(
      s
    )
  ) {
    return "resolution_action";
  }

  if (
    /\b(?:thanks|thank|safe|safely|saved|returns home|return home|morning|passes|decides to preserve|preserve them)\b/.test(
      s
    )
  ) {
    return "resolution";
  }

  if (
    /\b(?:tries|attempts|follows|studies|searches|runs|travels|goes|takes|climbs|enters|leaves|returns|moves|walks|drives|brings|shows|develops|develop|visits|looks|looks at)\b/.test(
      s
    )
  ) {
    return "action";
  }

  return "narrative";
}

function importanceFor(type, sentence) {
  const s = lower(sentence);

  if (type === "conflict") return 5;
  if (type === "resolution_action") return 5;
  if (type === "resolution") return 5;
  if (type === "discovery") return 4;
  if (type === "action") return 3;

  if (
    /\b(?:hidden|secret|mysterious|valuable|danger|rescue|save|lost|trapped|storm|warning|symbol|letter|documents|treasure|clue)\b/.test(
      s
    )
  ) {
    return 5;
  }

  return 2;
}

/* =========================================================
   SMART EVENT SPLITTING
========================================================= */

/*
  V38 treated one long sentence as one event.

  V39 breaks compound sentences into meaningful causal events.
*/

function splitCompoundSentence(sentence) {
  const text = clean(sentence);

  if (!text) return [];

  /*
    Protect common phrases from accidental splitting.
  */
  let working = text
    .replace(/\bbut nobody\b/gi, "but_nobody")
    .replace(/\bbut she\b/gi, "but_she")
    .replace(/\bbut he\b/gi, "but_he")
    .replace(/\band together\b/gi, "and_together");

  /*
    Strong action connectors.
  */
  working = working
    .replace(
      /,\s*(and then|then|after that|before that)\s+/gi,
      ". "
    )
    .replace(
      /;\s*/g,
      ". "
    );

  /*
    Split clauses where a new clear action begins.
  */
  working = working
    .replace(
      /,\s+(?=(?:Ryan|Noah|Lucas|Emma|Daniel|[A-Z][a-z]{2,})\s+(?:finds|discovers|goes|runs|takes|shows|returns|enters|leaves|opens|reads|develops|decides|realizes|notices|sees|climbs|repairs|tries|starts|begins|walks|drives)\b)/g,
      ". "
    )
    .replace(
      /\s+(?=(?:Ryan|Noah|Lucas|Emma|Daniel|[A-Z][a-z]{2,})\s+(?:finds|discovers|goes|runs|takes|shows|returns|enters|leaves|opens|reads|develops|decides|realizes|notices|sees|climbs|repairs|tries|starts|begins|walks|drives)\b)/g,
      ". "
    );

  /*
    Restore protected phrases.
  */
  working = working
    .replace(/but_nobody/gi, "but nobody")
    .replace(/but_she/gi, "but she")
    .replace(/but_he/gi, "but he")
    .replace(/and_together/gi, "and together");

  const parts = working
    .split(/(?<=[.!?])\s+/)
    .map(clean)
    .filter(Boolean);

  /*
    Don't destroy very short fragments.
  */
  if (parts.length <= 1) {
    return [text];
  }

  return parts;
}

function extractEvents(sentences) {
  const events = [];
  let previousLocation = "story location";
  let eventNumber = 1;

  for (const sentence of sentences) {
    const parts = splitCompoundSentence(sentence);

    for (const part of parts) {
      const location = detectLocation(
        part,
        previousLocation
      );

      if (
        location !== "story location"
      ) {
        previousLocation = location;
      }

      const type =
        detectEventType(part);

      events.push({
        id: `E${String(eventNumber).padStart(2, "0")}`,
        order: eventNumber,
        text: part,
        type,
        importance: importanceFor(
          type,
          part
        ),
        location,
        objects: objectsForEvent(part)
      });

      eventNumber++;
    }
  }

  return events;
}

/* =========================================================
   GROUPING
========================================================= */

function canMerge(a, b) {
  if (!a || !b) return false;

  /*
    Never merge major story beats.
  */
  if (
    a.importance >= 5 ||
    b.importance >= 5
  ) {
    return false;
  }

  /*
    Discovery and conflict should generally
    remain visually distinct.
  */
  if (
    a.type === "discovery" &&
    b.type === "conflict"
  ) {
    return false;
  }

  if (
    a.type === "conflict" &&
    b.type === "discovery"
  ) {
    return false;
  }

  /*
    Major location change = new beat.
  */
  if (
    a.location !== b.location &&
    a.location !== "story location" &&
    b.location !== "story location"
  ) {
    return false;
  }

  return true;
}

function groupEvents(events) {
  const groups = [];

  for (const event of events) {
    const previous =
      groups[groups.length - 1];

    if (
      previous &&
      previous.length < 2 &&
      canMerge(
        previous[previous.length - 1],
        event
      )
    ) {
      previous.push(event);
    } else {
      groups.push([event]);
    }
  }

  return groups;
}

/* =========================================================
   SCENE DISTRIBUTION
========================================================= */

function distributeGroups(
  groups,
  sceneCount
) {
  const safeGroups = Array.isArray(groups)
    ? groups.filter(
        (g) =>
          Array.isArray(g) &&
          g.length > 0
      )
    : [];

  const scenes = Array.from(
    { length: sceneCount },
    () => []
  );

  if (!safeGroups.length) {
    return scenes;
  }

  /*
    We want important beats to receive their
    own cinematic space.

    Sequential order is NEVER changed.
  */

  const total = safeGroups.length;

  /*
    If there are enough groups, spread them
    sequentially across scenes.
  */
  let cursor = 0;

  for (
    let sceneIndex = 0;
    sceneIndex < sceneCount;
    sceneIndex++
  ) {
    const scenesLeft =
      sceneCount - sceneIndex;

    const groupsLeft =
      total - cursor;

    if (groupsLeft <= 0) {
      break;
    }

    /*
      Leave enough groups for remaining scenes
      when possible.
    */
    const target =
      Math.max(
        1,
        Math.ceil(
          groupsLeft / scenesLeft
        )
      );

    const amount =
      Math.min(
        3,
        target,
        groupsLeft
      );

    for (
      let i = 0;
      i < amount;
      i++
    ) {
      scenes[sceneIndex].push(
        safeGroups[cursor]
      );

      cursor++;
    }
  }

  /*
    Anything remaining goes sequentially.
  */
  while (
    cursor < safeGroups.length
  ) {
    const target =
      scenes.findIndex(
        (scene) =>
          scene.length < 3
      );

    const index =
      target >= 0
        ? target
        : sceneCount - 1;

    scenes[index].push(
      safeGroups[cursor]
    );

    cursor++;
  }

  return scenes;
}

/* =========================================================
   TIMING
========================================================= */

function beatTimes(count) {
  const n = Math.max(
    1,
    Math.min(3, Number(count) || 1)
  );

  if (n === 1) {
    return [
      {
        start: 0,
        end: 10
      }
    ];
  }

  if (n === 2) {
    return [
      {
        start: 0,
        end: 5
      },
      {
        start: 5,
        end: 10
      }
    ];
  }

  return [
    {
      start: 0,
      end: 3
    },
    {
      start: 3,
      end: 7
    },
    {
      start: 7,
      end: 10
    }
  ];
}

/* =========================================================
   GROUP HELPERS
========================================================= */

function groupText(group) {
  return Array.isArray(group)
    ? group
        .map((e) => e?.text || "")
        .filter(Boolean)
        .join(" ")
    : "";
}

function groupTypes(group) {
  return Array.isArray(group)
    ? unique(
        group
          .map((e) => e?.type)
          .filter(Boolean)
      )
    : [];
}

function groupLocation(group) {
  if (!Array.isArray(group)) {
    return "story location";
  }

  return (
    group.find(
      (event) =>
        event?.location &&
        event.location !==
          "story location"
    )?.location ||
    "story location"
  );
}

function groupObjects(group) {
  if (!Array.isArray(group)) {
    return [];
  }

  return unique(
    group.flatMap(
      (event) =>
        Array.isArray(event?.objects)
          ? event.objects
          : []
    )
  );
}

/* =========================================================
   MAIN CHARACTER
========================================================= */

const SUPPORTING_LABELS = new Set(
  RELATIONSHIPS.map(
    ([, label]) => label
  )
);

function mainCharacter(characters) {
  if (!Array.isArray(characters)) {
    return "Main character";
  }

  return (
    characters.find(
      (character) =>
        !SUPPORTING_LABELS.has(
          character
        )
    ) ||
    characters[0] ||
    "Main character"
  );
}

/* =========================================================
   DIALOGUE INTELLIGENCE
========================================================= */

function dialogueFor(
  group,
  characters,
  sceneNumber
) {
  const text = lower(
    groupText(group)
  );

  const types =
    groupTypes(group);

  const hero =
    mainCharacter(characters);

  const objects =
    groupObjects(group);

  /*
    Specific context dialogue.
    Each line is intentionally short enough
    for a 10-second scene.
  */

  if (
    /mother|mom/.test(text) &&
    /nervous|warning|never|don't|do not/.test(
      text
    )
  ) {
    return [
      {
        speaker: "Mother",
        text: "Ryan, stay away from that place."
      }
    ];
  }

  if (
    types.includes("discovery") &&
    objects.includes("old film camera")
  ) {
    return [
      {
        speaker: hero,
        text: "Where did Grandpa get this camera?"
      }
    ];
  }

  if (
    types.includes("discovery") &&
    objects.includes("photograph")
  ) {
    return [
      {
        speaker: hero,
        text: "Why is this place in Grandpa's photo?"
      }
    ];
  }

  if (
    types.includes("discovery") &&
    objects.includes("strange symbol")
  ) {
    return [
      {
        speaker: hero,
        text: "I've seen this symbol before."
      }
    ];
  }

  if (
    types.includes("discovery") &&
    objects.includes("metal box")
  ) {
    return [
      {
        speaker: hero,
        text: "What could be hidden inside?"
      }
    ];
  }

  if (
    types.includes("discovery") &&
    objects.includes("letter")
  ) {
    return [
      {
        speaker: hero,
        text: "Grandpa left this here for a reason."
      }
    ];
  }

  if (
    types.includes("discovery") &&
    objects.includes("family documents")
  ) {
    return [
      {
        speaker: hero,
        text: "These documents explain everything."
      }
    ];
  }

  if (
    types.includes("conflict")
  ) {
    return [
      {
        speaker: hero,
        text: "Something about this isn't right."
      }
    ];
  }

  if (
    types.includes("action") &&
    /goes|enters|visits|travels|runs|walks/.test(
      text
    )
  ) {
    return [
      {
        speaker: hero,
        text: "I need to see this for myself."
      }
    ];
  }

  if (
    types.includes("resolution_action")
  ) {
    return [
      {
        speaker: hero,
        text: "I have to protect what we found."
      }
    ];
  }

  if (
    types.includes("resolution")
  ) {
    return [
      {
        speaker: hero,
        text: "Now we finally know the truth."
      }
    ];
  }

  /*
    Avoid unnecessary dialogue in pure exposition.
  */
  return [];
}

/* =========================================================
   VOICEOVER
========================================================= */

function sentenceChunks(text) {
  return String(text)
    .split(/(?<=[.!?])\s+/)
    .map(clean)
    .filter(Boolean);
}

function voiceoverFor(group) {
  const text =
    clean(groupText(group));

  if (!text) {
    return "";
  }

  /*
    Prefer complete sentences.
    180 chars is kept as a safe limit for
    a short 10-second voiceover.
  */
  const sentences =
    sentenceChunks(text);

  let result = "";

  for (const sentence of sentences) {
    const candidate =
      result
        ? `${result} ${sentence}`
        : sentence;

    if (candidate.length <= 180) {
      result = candidate;
    } else {
      break;
    }
  }

  /*
    If even the first sentence is too long,
    shorten it at a natural clause boundary.
  */
  if (!result) {
    const clauses = text
      .split(/[,;:]\s+/)
      .map(clean)
      .filter(Boolean);

    for (const clause of clauses) {
      if (
        clause.length <= 180
      ) {
        result = clause;
        break;
      }
    }
  }

  /*
    Final fallback: word-safe cut.
  */
  if (!result) {
    const words =
      text.split(/\s+/);

    for (const word of words) {
      const candidate =
        result
          ? `${result} ${word}`
          : word;

      if (
        candidate.length > 165
      ) {
        break;
      }

      result = candidate;
    }
  }

  return result.trim();
}

/* =========================================================
   CAMERA
========================================================= */

function cameraFor(group) {
  const types =
    groupTypes(group);

  const text =
    lower(groupText(group));

  if (
    types.includes("discovery")
  ) {
    return "Begin with a medium shot, then move into a close-up of the discovered clue or object and finish on the character's reaction.";
  }

  if (
    types.includes("conflict")
  ) {
    return "Slow cinematic push-in with a medium close-up, emphasizing tension and the character's reaction.";
  }

  if (
    types.includes("resolution_action")
  ) {
    return "Dynamic tracking shot following the character through the important action, ending with a clear visual result.";
  }

  if (
    types.includes("resolution")
  ) {
    return "Gentle wide establishing shot followed by a warm emotional close-up.";
  }

  if (
    /runs|chases|drives|travels|climbs/.test(
      text
    )
  ) {
    return "Smooth cinematic tracking shot following the character's movement through the environment.";
  }

  return "Cinematic medium shot with subtle natural camera movement and clear visual storytelling.";
}

/* =========================================================
   LIGHTING
========================================================= */

function lightingFor(group) {
  const types =
    groupTypes(group);

  const text =
    lower(groupText(group));

  if (
    /night|dark|storm|rain/.test(
      text
    )
  ) {
    return "Moody low-key cinematic lighting with realistic shadows, atmospheric highlights, and natural environmental light.";
  }

  if (
    types.includes("conflict")
  ) {
    return "Dramatic directional lighting with controlled shadows to emphasize tension.";
  }

  if (
    types.includes("discovery")
  ) {
    return "Focused cinematic lighting that naturally draws attention toward the important clue or object.";
  }

  if (
    types.includes("resolution")
  ) {
    return "Warm natural cinematic lighting suggesting relief, understanding, and emotional closure.";
  }

  return "Natural cinematic lighting appropriate to the location, time of day, and story mood.";
}

/* =========================================================
   CHARACTER CONTINUITY
========================================================= */

function characterLock(
  characters
) {
  const safe =
    Array.isArray(characters)
      ? characters
      : [];

  if (!safe.length) {
    return "Maintain the same protagonist and recurring characters consistently across every scene.";
  }

  return (
    "Character continuity lock: " +
    safe.join(", ") +
    ". Keep identical faces, approximate ages, hairstyles, body proportions, clothing style, colors, accessories, and physical identity across every scene. Do not randomly redesign or replace recurring characters."
  );
}

/* =========================================================
   VISUAL PROMPT
========================================================= */

function createVisualPrompt(
  group,
  characters
) {
  const location =
    groupLocation(group);

  const action =
    groupText(group);

  const objects =
    groupObjects(group);

  const characterList =
    Array.isArray(characters) &&
    characters.length
      ? characters.join(", ")
      : "recurring story characters";

  const objectText =
    objects.length
      ? ` Important story objects: ${objects.join(", ")}.`
      : "";

  return (
    "Cinematic realistic storytelling. " +
    `Location: ${location}. ` +
    `Characters: ${characterList}. ` +
    `Action: ${action}.` +
    objectText +
    " Maintain exact character continuity and chronological story logic. Natural body movement, realistic environment, detailed textures, believable expressions, cinematic composition, consistent visual identity."
  );
}

/* =========================================================
   SCENE CREATOR
========================================================= */

function createScene(
  sceneGroups,
  sceneNumber,
  characters
) {
  let safeGroups =
    Array.isArray(sceneGroups)
      ? sceneGroups.filter(
          (group) =>
            Array.isArray(group) &&
            group.length > 0
        )
      : [];

  /*
    Empty scene fallback.
  */
  if (!safeGroups.length) {
    safeGroups = [
      [
        {
          id: `T${sceneNumber}`,
          text: "A brief cinematic transition maintains story continuity.",
          type: "narrative",
          importance: 1,
          location:
            "story location",
          objects: []
        }
      ]
    ];
  }

  safeGroups =
    safeGroups.slice(0, 3);

  const times =
    beatTimes(
      safeGroups.length
    );

  const beats =
    safeGroups.map(
      (group, index) => ({
        beat_number:
          index + 1,

        start_time:
          times[index].start,

        end_time:
          times[index].end,

        event_ids:
          group.map(
            (event) =>
              event.id
          ),

        action:
          groupText(group),

        visual_prompt:
          createVisualPrompt(
            group,
            characters
          )
      })
    );

  const events =
    safeGroups.flatMap(
      (group) =>
        Array.isArray(group)
          ? group
          : []
    );

  /*
    Scene dialogue.
  */
  const dialogue = [];

  for (
    const group of safeGroups
  ) {
    dialogue.push(
      ...dialogueFor(
        group,
        characters,
        sceneNumber
      )
    );
  }

  /*
    Remove exact duplicates.
  */
  const seen =
    new Set();

  const finalDialogue =
    dialogue.filter(
      (item) => {
        const key =
          `${item.speaker}|${item.text}`;

        if (
          seen.has(key)
        ) {
          return false;
        }

        seen.add(key);
        return true;
      }
    );

  /*
    Combine voiceover while
    keeping complete sentences.
  */
  const voiceParts =
    safeGroups
      .map(voiceoverFor)
      .filter(Boolean);

  let voiceover = "";

  for (
    const part of voiceParts
  ) {
    const candidate =
      voiceover
        ? `${voiceover} ${part}`
        : part;

    if (
      candidate.length <= 180
    ) {
      voiceover =
        candidate;
    }
  }

  /*
    Primary visual prompt should represent
    the whole scene, not only its first beat.
  */
  const combinedVisual =
    createVisualPrompt(
      safeGroups.flat(),
      characters
    );

  return {
    scene_number:
      sceneNumber,

    start_time:
      (sceneNumber - 1) * 10,

    end_time:
      sceneNumber * 10,

    location:
      groupLocation(
        safeGroups.flat()
      ),

    visual_prompt:
      combinedVisual,

    camera:
      cameraFor(
        safeGroups.flat()
      ),

    lighting:
      lightingFor(
        safeGroups.flat()
      ),

    action:
      events
        .map(
          (event) =>
            event?.text || ""
        )
        .filter(Boolean)
        .join(" "),

    dialogue:
      finalDialogue,

    voiceover,

    continuity:
      characterLock(
        characters
      ),

    beats
  };
}

/* =========================================================
   VALIDATION
========================================================= */

function validateScenes(
  scenes,
  events,
  sceneCount
) {
  if (
    !Array.isArray(scenes)
  ) {
    throw new Error(
      "Scenes are not an array."
    );
  }

  if (
    scenes.length !==
    sceneCount
  ) {
    throw new Error(
      `Expected ${sceneCount} scenes, got ${scenes.length}.`
    );
  }

  const expected =
    events.map(
      (event) => event.id
    );

  const actual = [];

  scenes.forEach(
    (scene, sceneIndex) => {
      const expectedStart =
        sceneIndex * 10;

      const expectedEnd =
        (sceneIndex + 1) * 10;

      if (
        scene.start_time !==
        expectedStart
      ) {
        throw new Error(
          `Scene ${sceneIndex + 1} start time invalid.`
        );
      }

      if (
        scene.end_time !==
        expectedEnd
      ) {
        throw new Error(
          `Scene ${sceneIndex + 1} end time invalid.`
        );
      }

      if (
        !Array.isArray(
          scene.beats
        ) ||
        scene.beats.length < 1 ||
        scene.beats.length > 3
      ) {
        throw new Error(
          `Scene ${sceneIndex + 1} beat structure invalid.`
        );
      }

      scene.beats.forEach(
        (beat, beatIndex) => {
          if (
            beat.start_time >=
            beat.end_time
          ) {
            throw new Error(
              `Scene ${sceneIndex + 1} contains an invalid beat duration.`
            );
          }

          if (
            beatIndex === 0 &&
            beat.start_time !== 0
          ) {
            throw new Error(
              `Scene ${sceneIndex + 1} does not start at 0.`
            );
          }

          if (
            beatIndex > 0 &&
            beat.start_time !==
              scene.beats[
                beatIndex - 1
              ].end_time
          ) {
            throw new Error(
              `Scene ${sceneIndex + 1} contains a timing gap.`
            );
          }

          if (
            !Array.isArray(
              beat.event_ids
            )
          ) {
            throw new Error(
              `Scene ${sceneIndex + 1} event IDs invalid.`
            );
          }

          actual.push(
            ...beat.event_ids.filter(
              (id) =>
                /^E\d+$/.test(id)
            )
          );
        }
      );

      const lastBeat =
        scene.beats[
          scene.beats.length - 1
        ];

      if (
        lastBeat.end_time !==
        10
      ) {
        throw new Error(
          `Scene ${sceneIndex + 1} does not end at 10 seconds.`
        );
      }

      if (
        !Array.isArray(
          scene.dialogue
        )
      ) {
        throw new Error(
          `Scene ${sceneIndex + 1} dialogue invalid.`
        );
      }

      /*
        Dialogue safety check.
        A 10-second dialogue line should
        remain short.
      */
      for (
        const line of scene.dialogue
      ) {
        if (
          !line ||
          typeof line.text !==
            "string"
        ) {
          throw new Error(
            `Scene ${sceneIndex + 1} contains invalid dialogue.`
          );
        }

        if (
          line.text.length > 150
        ) {
          throw new Error(
            `Scene ${sceneIndex + 1} dialogue is too long for a 10-second clip.`
          );
        }
      }
    }
  );

  /*
    Event coverage.
  */
  if (
    actual.length !==
    expected.length
  ) {
    throw new Error(
      `Event coverage mismatch. Expected ${expected.length}, got ${actual.length}.`
    );
  }

  /*
    Exact chronological order.
  */
  for (
    let i = 0;
    i < expected.length;
    i++
  ) {
    if (
      actual[i] !==
      expected[i]
    ) {
      throw new Error(
        `Event order mismatch at event ${i + 1}.`
      );
    }
  }

  return true;
}

/* =========================================================
   PROJECT GENERATION
========================================================= */

function generateProject(
  prompt,
  duration,
  aspectRatio
) {
  const safePrompt =
    clean(prompt);

  if (!safePrompt) {
    throw new Error(
      "Video prompt is empty."
    );
  }

  const safeDuration =
    Number(duration) || 60;

  if (
    safeDuration < 10
  ) {
    throw new Error(
      "Minimum testing duration is 10 seconds."
    );
  }

  if (
    safeDuration > 60
  ) {
    throw new Error(
      "V39 testing mode supports up to 60 seconds."
    );
  }

  /*
    Only 10-second boundaries.
  */
  const sceneCount =
    Math.floor(
      safeDuration / 10
    );

  const sentences =
    splitStory(
      safePrompt
    );

  if (
    !sentences.length
  ) {
    throw new Error(
      "No story events detected."
    );
  }

  const characters =
    extractCharacters(
      safePrompt,
      sentences
    );

  const objects =
    extractObjects(
      safePrompt
    );

  const events =
    extractEvents(
      sentences
    );

  if (
    !events.length
  ) {
    throw new Error(
      "No story events detected."
    );
  }

  const groups =
    groupEvents(
      events
    );

  const sceneGroups =
    distributeGroups(
      groups,
      sceneCount
    );

  const scenes =
    sceneGroups.map(
      (
        groupsForScene,
        index
      ) =>
        createScene(
          groupsForScene,
          index + 1,
          characters
        )
    );

  validateScenes(
    scenes,
    events,
    sceneCount
  );

  return {
    status: "success",

    app: "SANAPTAI",

    engine:
      ENGINE_VERSION,

    mode: "STORY_ENGINE",

    duration:
      safeDuration,

    total_scenes:
      sceneCount,

    aspect_ratio:
      aspectRatio ||
      "16:9",

    characters,

    story_objects:
      objects,

    total_events:
      events.length,

    scenes
  };
}

/* =========================================================
   API TEST
========================================================= */

app.get(
  "/api/test",
  (req, res) => {
    res.json({
      status: "success",
      app: "SANAPTAI",
      engine:
        ENGINE_VERSION,
      message:
        "SANAPTAI V39 Story Intelligence Engine is running.",
      gemini: "disabled",
      video_generation:
        "disabled"
    });
  }
);

/* =========================================================
   DEMO PROJECT
========================================================= */

app.post(
  "/api/demo-project",
  (req, res) => {
    try {
      const {
        prompt,
        duration,
        aspectRatio
      } = req.body || {};

      const project =
        generateProject(
          prompt,
          duration,
          aspectRatio
        );

      res.json(project);
    } catch (error) {
      console.error(
        "V39 ERROR:",
        error
      );

      res.status(500).json({
        status: "error",
        app: "SANAPTAI",
        engine:
          ENGINE_VERSION,
        message:
          "Project creation failed.",
        error:
          error?.message ||
          "Unknown error"
      });
    }
  }
);

/* =========================================================
   ROOT
========================================================= */

app.get(
  "/",
  (req, res) => {
    res.sendFile(
      process.cwd() +
        "/public/index.html"
    );
  }
);

/* =========================================================
   START
========================================================= */

app.listen(
  PORT,
  () => {
    console.log(
      `SANAPTAI ${ENGINE_VERSION} running on port ${PORT}`
    );
  }
);
