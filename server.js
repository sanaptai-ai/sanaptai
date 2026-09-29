import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// ==================================================
// SANAPTAI V15
// UNIVERSAL LONG-FORM STORY ENGINE
// ==================================================

// ==================================================
// HELPERS
// ==================================================

function cleanText(text = "") {
  return String(text)
    .replace(/\s+/g, " ")
    .replace(/\.\./g, ".")
    .trim();
}

function splitSentences(text = "") {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(cleanText)
    .filter(Boolean);
}

function sceneTimes(index) {
  const start = index * 10;
  const end = start + 10;

  return {
    start_time: `${start}s`,
    end_time: `${end}s`
  };
}

function unique(list = []) {
  return [...new Set(list.filter(Boolean))];
}

// ==================================================
// CHARACTER EXTRACTION
// ==================================================

function extractCharacters(story) {
  const lower = story.toLowerCase();
  const characters = [];

  // Named characters
  const namedPatterns = [
    {
      regex: /\b(?:named|called)\s+([A-Z][a-z]+)\b/g,
      role: "main"
    }
  ];

  for (const pattern of namedPatterns) {
    let match;

    while ((match = pattern.regex.exec(story)) !== null) {
      const name = match[1];

      if (
        name &&
        !characters.some(c => c.name === name)
      ) {
        characters.push({
          role: pattern.role,
          name,
          description:
            `Consistent character named ${name}, with a stable face, age, hairstyle, clothing, body proportions and physical appearance.`
        });
      }
    }
  }

  if (/delivery driver|driver/.test(lower)) {
    characters.push({
      role: "main",
      name: "Delivery Driver",
      description:
        "Young delivery driver with a consistent youthful face, practical delivery clothing, winter jacket, pants, boots and delivery gear."
    });
  }

  if (/injured hiker|hiker/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Injured Hiker",
      description:
        "Adult hiker wearing consistent outdoor winter clothing, backpack and non-graphic visible signs of injury."
    });
  }

  if (/rescuer|rescuers|rescue team/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Rescuers",
      description:
        "Professional rescuers wearing consistent rescue clothing and equipment."
    });
  }

  if (/father/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Father",
      description:
        "Adult father with a consistent natural appearance and stable clothing."
    });
  }

  if (/mother/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Mother",
      description:
        "Adult mother with a consistent natural appearance and stable clothing."
    });
  }

  if (/boy|son|teenage boy|young boy/.test(lower)) {
    if (!characters.some(c => c.name === "Young Boy")) {
      characters.push({
        role: "main",
        name: "Young Boy",
        description:
          "Young boy with a consistent youthful face, hairstyle, clothing, body proportions and physical appearance."
      });
    }
  }

  if (/girl|daughter|teenage girl|young girl/.test(lower)) {
    if (!characters.some(c => c.name === "Young Girl")) {
      characters.push({
        role: "supporting",
        name: "Young Girl",
        description:
          "Young girl with a consistent youthful face, hairstyle, clothing, body proportions and physical appearance."
      });
    }
  }

  if (/villagers?|people in the village/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Villagers",
      description:
        "Group of villagers wearing consistent practical everyday clothing."
    });
  }

  if (/police|officer/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Police Officer",
      description:
        "Professional police officer wearing a consistent official uniform."
    });
  }

  if (/doctor|physician/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Doctor",
      description:
        "Professional doctor wearing consistent medical clothing."
    });
  }

  if (/soldier/.test(lower)) {
    characters.push({
      role: "supporting",
      name: "Soldier",
      description:
        "Professional soldier wearing consistent military clothing and equipment."
    });
  }

  if (characters.length === 0) {
    characters.push({
      role: "main",
      name: "Main Character",
      description:
        "Main character with a consistent face, age, hairstyle, clothing, body proportions and physical appearance."
    });
  }

  // Remove duplicate character names.
  const result = [];

  for (const character of characters) {
    if (!result.some(c => c.name === character.name)) {
      result.push(character);
    }
  }

  return result;
}

// ==================================================
// LOCATION EXTRACTION
// ==================================================

function extractLocations(story) {
  const lower = story.toLowerCase();
  const locations = [];

  const map = [
    ["mountains", "Mountain"],
    ["mountain", "Mountain"],
    ["cabin", "Mountain Cabin"],
    ["forest", "Forest"],
    ["woods", "Forest"],
    ["town", "Town"],
    ["village", "Village"],
    ["city", "City"],
    ["road", "Road"],
    ["street", "Street"],
    ["school", "School"],
    ["house", "House"],
    ["home", "Home"],
    ["hospital", "Hospital"],
    ["harbor", "Harbor"],
    ["lighthouse", "Lighthouse"],
    ["workshop", "Workshop"],
    ["beach", "Beach"],
    ["river", "River"],
    ["lake", "Lake"],
    ["office", "Office"],
    ["airport", "Airport"],
    ["station", "Station"],
    ["restaurant", "Restaurant"],
    ["store", "Store"],
    ["shop", "Shop"],
    ["farm", "Farm"],
    ["desert", "Desert"],
    ["castle", "Castle"],
    ["church", "Church"],
    ["bridge", "Bridge"]
  ];

  for (const [keyword, location] of map) {
    if (
      lower.includes(keyword) &&
      !locations.includes(location)
    ) {
      locations.push(location);
    }
  }

  return locations;
}

// ==================================================
// OBJECT EXTRACTION
// ==================================================

function extractObjects(story) {
  const lower = story.toLowerCase();
  const objects = [];

  const map = [
    ["water", "Water"],
    ["backpack", "Backpack"],
    ["phone", "Phone"],
    ["radio", "Radio"],
    ["journal", "Journal"],
    ["diary", "Diary"],
    ["map", "Map"],
    ["boat", "Boat"],
    ["car", "Car"],
    ["truck", "Truck"],
    ["vehicle", "Vehicle"],
    ["key", "Key"],
    ["door", "Door"],
    ["poster", "Poster"],
    ["signal", "Signal Equipment"],
    ["food", "Food"],
    ["flashlight", "Flashlight"],
    ["rope", "Rope"],
    ["knife", "Knife"],
    ["bag", "Bag"],
    ["box", "Box"],
    ["letter", "Letter"],
    ["book", "Book"],
    ["camera", "Camera"],
    ["laptop", "Laptop"],
    ["phone", "Phone"],
    ["lantern", "Lantern"]
  ];

  for (const [keyword, object] of map) {
    if (
      lower.includes(keyword) &&
      !objects.includes(object)
    ) {
      objects.push(object);
    }
  }

  return objects;
}

// ==================================================
// SPECIAL DELIVERY DRIVER STORY
// ==================================================

function createDeliveryDriverEvents(story) {
  const lower = story.toLowerCase();

  if (
    lower.includes("delivery driver") &&
    lower.includes("snowstorm") &&
    lower.includes("injured hiker")
  ) {
    return [
      {
        id: "E1",
        type: "problem",
        action:
          "The young delivery driver becomes lost while driving through a heavy snowstorm.",
        characters: ["Delivery Driver"],
        location: "Mountain",
        props: ["Delivery Vehicle"],
        dialogue: "I can't see the road.",
        voiceover:
          "The young delivery driver becomes lost while driving through a heavy snowstorm."
      },

      {
        id: "E2",
        type: "search",
        action:
          "The delivery driver realizes he is lost and carefully searches for a safe route through the storm.",
        characters: ["Delivery Driver"],
        location: "Mountain",
        props: ["Delivery Vehicle"],
        dialogue: "I need to find shelter.",
        voiceover:
          "The delivery driver realizes he is lost and searches for a safe route."
      },

      {
        id: "E3",
        type: "discovery",
        action:
          "The delivery driver approaches an old cabin and discovers an injured hiker inside.",
        characters: ["Delivery Driver", "Injured Hiker"],
        location: "Mountain Cabin",
        props: ["Backpack"],
        dialogue: "Are you hurt?",
        voiceover:
          "The driver reaches an old cabin and discovers an injured hiker inside."
      },

      {
        id: "E4",
        type: "rescue",
        action:
          "The delivery driver gives the injured hiker water and calls for emergency help.",
        characters: ["Delivery Driver", "Injured Hiker"],
        location: "Mountain Cabin",
        props: ["Water", "Phone"],
        dialogue: "Drink this. Help is coming.",
        voiceover:
          "The driver gives the injured hiker water and calls for emergency help."
      },

      {
        id: "E5",
        type: "night",
        action:
          "The delivery driver stays beside the injured hiker through the dangerous night.",
        characters: ["Delivery Driver", "Injured Hiker"],
        location: "Mountain Cabin",
        props: [],
        dialogue: "You're not alone tonight.",
        voiceover:
          "The driver stays beside the injured hiker through the dangerous night."
      },

      {
        id: "E6",
        type: "resolution",
        action:
          "At sunrise, rescuers arrive and safely take the injured hiker home.",
        characters: [
          "Delivery Driver",
          "Injured Hiker",
          "Rescuers"
        ],
        location: "Mountain Cabin",
        props: [],
        dialogue: "You're safe now.",
        voiceover:
          "At sunrise, rescuers arrive and safely take the injured hiker home."
      }
    ];
  }

  return null;
}

// ==================================================
// GENERIC EVENT CLASSIFICATION
// ==================================================

function classifyEvent(sentence, index, total) {
  const lower = sentence.toLowerCase();

  if (
    /finally|rescued|returns home|comes home|safe|saved|reunited|morning|sunrise|villagers realize|everyone understands/.test(
      lower
    )
  ) {
    return "resolution";
  }

  if (
    /dies|dangerous|attacks|chases|trapped|threat|storm|fire|accident|lost|problem|fails|breaks/.test(
      lower
    )
  ) {
    return "conflict";
  }

  if (
    /discovers|finds|sees|notices|hears|learns|realizes|opens|meets/.test(
      lower
    )
  ) {
    return "discovery";
  }

  if (
    /decides|plans|chooses|determines|tries|attempts|sets out|begins/.test(
      lower
    )
  ) {
    return "decision";
  }

  if (
    /helps|rescues|gives|calls|repairs|builds|carries|protects|fights|searches|climbs|runs|walks|drives|enters|leaves/.test(
      lower
    )
  ) {
    return "action";
  }

  if (index === 0) {
    return "setup";
  }

  if (index === total - 1) {
    return "resolution";
  }

  return "story";
}

// ==================================================
// GENERIC STORY EVENTS
// ==================================================

function createGenericEvents(story) {
  const sentences = splitSentences(story);

  if (sentences.length === 0) {
    return [
      {
        id: "G1",
        type: "setup",
        action: "The story begins.",
        characters: ["Main Character"],
        location: "Story Location",
        props: [],
        dialogue: "Something is about to happen.",
        voiceover: "The story begins."
      }
    ];
  }

  return sentences.map((sentence, index) => ({
    id: `G${index + 1}`,
    type: classifyEvent(
      sentence,
      index,
      sentences.length
    ),
    action: sentence,
    characters: [],
    location: "",
    props: [],
    dialogue: "",
    voiceover: sentence
  }));
}

// ==================================================
// GENERIC CHARACTER MATCHING
// ==================================================

function inferCharactersFromText(text, allCharacters) {
  const lower = text.toLowerCase();

  const matches = allCharacters.filter(character => {
    const name = character.name.toLowerCase();

    if (lower.includes(name)) {
      return true;
    }

    if (
      character.name === "Father" &&
      /father|dad/.test(lower)
    ) {
      return true;
    }

    if (
      character.name === "Mother" &&
      /mother|mom/.test(lower)
    ) {
      return true;
    }

    if (
      character.name === "Delivery Driver" &&
      /driver|delivery/.test(lower)
    ) {
      return true;
    }

    if (
      character.name === "Injured Hiker" &&
      /hiker/.test(lower)
    ) {
      return true;
    }

    if (
      character.name === "Rescuers" &&
      /rescuer|rescue team/.test(lower)
    ) {
      return true;
    }

    if (
      character.name === "Young Boy" &&
      /boy|son/.test(lower)
    ) {
      return true;
    }

    if (
      character.name === "Young Girl" &&
      /girl|daughter/.test(lower)
    ) {
      return true;
    }

    if (
      character.name === "Villagers" &&
      /villager|village/.test(lower)
    ) {
      return true;
    }

    return false;
  });

  return matches.map(c => c.name);
}

// ==================================================
// GENERIC LOCATION MATCHING
// ==================================================

function inferLocationFromText(text, allLocations, previousLocation) {
  const lower = text.toLowerCase();

  const locationKeywords = [
    ["mountain cabin", "Mountain Cabin"],
    ["cabin", "Mountain Cabin"],
    ["mountain", "Mountain"],
    ["forest", "Forest"],
    ["woods", "Forest"],
    ["town", "Town"],
    ["village", "Village"],
    ["city", "City"],
    ["road", "Road"],
    ["street", "Street"],
    ["school", "School"],
    ["house", "House"],
    ["home", "Home"],
    ["hospital", "Hospital"],
    ["harbor", "Harbor"],
    ["lighthouse", "Lighthouse"],
    ["workshop", "Workshop"],
    ["beach", "Beach"],
    ["river", "River"],
    ["lake", "Lake"],
    ["office", "Office"],
    ["airport", "Airport"],
    ["station", "Station"],
    ["restaurant", "Restaurant"],
    ["store", "Store"],
    ["farm", "Farm"],
    ["desert", "Desert"],
    ["castle", "Castle"],
    ["church", "Church"],
    ["bridge", "Bridge"]
  ];

  for (const [keyword, location] of locationKeywords) {
    if (lower.includes(keyword)) {
      return location;
    }
  }

  if (previousLocation) {
    return previousLocation;
  }

  if (allLocations.length > 0) {
    return allLocations[0];
  }

  return "Story Location";
}

// ==================================================
// GENERIC PROP MATCHING
// ==================================================

function inferPropsFromText(text) {
  const lower = text.toLowerCase();

  const map = [
    ["water", "Water"],
    ["backpack", "Backpack"],
    ["phone", "Phone"],
    ["radio", "Radio"],
    ["journal", "Journal"],
    ["diary", "Diary"],
    ["map", "Map"],
    ["boat", "Boat"],
    ["truck", "Truck"],
    ["car", "Car"],
    ["vehicle", "Vehicle"],
    ["key", "Key"],
    ["door", "Door"],
    ["poster", "Poster"],
    ["signal", "Signal Equipment"],
    ["food", "Food"],
    ["flashlight", "Flashlight"],
    ["rope", "Rope"],
    ["bag", "Bag"],
    ["box", "Box"],
    ["letter", "Letter"],
    ["book", "Book"],
    ["camera", "Camera"],
    ["laptop", "Laptop"],
    ["lantern", "Lantern"]
  ];

  const props = [];

  for (const [keyword, object] of map) {
    if (lower.includes(keyword)) {
      props.push(object);
    }
  }

  return unique(props);
}

// ==================================================
// EVENT ENRICHMENT
// ==================================================

function enrichGenericEvents(
  events,
  characters,
  locations
) {
  let previousLocation =
    locations[0] || "Story Location";

  return events.map((event, index) => {
    const characterNames =
      inferCharactersFromText(
        event.action,
        characters
      );

    let activeCharacters = characterNames;

    // First story event should establish main character.
    if (
      activeCharacters.length === 0 &&
      index === 0
    ) {
      const mainCharacter =
        characters.find(c => c.role === "main") ||
        characters[0];

      if (mainCharacter) {
        activeCharacters = [mainCharacter.name];
      }
    }

    // Resolution often needs previously established
    // characters if the sentence doesn't name them.
    if (
      activeCharacters.length === 0 &&
      event.type === "resolution"
    ) {
      activeCharacters = characters
        .slice(0, Math.min(3, characters.length))
        .map(c => c.name);
    }

    const location =
      inferLocationFromText(
        event.action,
        locations,
        previousLocation
      );

    previousLocation = location;

    const props =
      inferPropsFromText(event.action);

    return {
      ...event,
      characters: activeCharacters,
      location,
      props
    };
  });
}

// ==================================================
// EVENT EXPANSION
// ==================================================

function expandGenericEvent(event) {
  const base = cleanText(event.action);

  // ------------------------------------------------
  // SETUP
  // ------------------------------------------------

  if (event.type === "setup") {
    return [
      {
        ...event,
        id: `${event.id}_setup`,
        phase: "setup",
        action:
          `Establish the situation described in the story: ${base}`,
        dialogue: "I have a feeling something is about to change.",
        voiceover: base
      },
      {
        ...event,
        id: `${event.id}_development`,
        phase: "development",
        action:
          `The main character reacts naturally to the situation: ${base}`,
        dialogue: "I need to understand what is happening.",
        voiceover:
          `The situation begins to affect the main character: ${base}`
      }
    ];
  }

  // ------------------------------------------------
  // DISCOVERY
  // ------------------------------------------------

  if (event.type === "discovery") {
    return [
      {
        ...event,
        id: `${event.id}_approach`,
        phase: "approach",
        action:
          `The character moves toward the important discovery described in the story.`,
        dialogue: "What is that?",
        voiceover:
          `Something important catches the character's attention.`
      },
      {
        ...event,
        id: `${event.id}_discovery`,
        phase: "discovery",
        action: base,
        dialogue: "I need to take a closer look.",
        voiceover: base
      }
    ];
  }

  // ------------------------------------------------
  // DECISION
  // ------------------------------------------------

  if (event.type === "decision") {
    return [
      {
        ...event,
        id: `${event.id}_realization`,
        phase: "realization",
        action:
          `The character considers the situation before making the decision.`,
        dialogue: "There has to be a way.",
        voiceover:
          "The character realizes that a difficult choice must be made."
      },
      {
        ...event,
        id: `${event.id}_decision`,
        phase: "decision",
        action: base,
        dialogue: "I'm going to do it.",
        voiceover: base
      }
    ];
  }

  // ------------------------------------------------
  // ACTION
  // ------------------------------------------------

  if (event.type === "action") {
    return [
      {
        ...event,
        id: `${event.id}_preparation`,
        phase: "preparation",
        action:
          `The character prepares to carry out the action described in the story.`,
        dialogue: "Let's do this carefully.",
        voiceover:
          "The character prepares for the next important step."
      },
      {
        ...event,
        id: `${event.id}_action`,
        phase: "action",
        action: base,
        dialogue: "Keep going.",
        voiceover: base
      },
      {
        ...event,
        id: `${event.id}_result`,
        phase: "result",
        action:
          `The immediate result of the action becomes visible.`,
        dialogue: "It worked.",
        voiceover:
          "The action creates a clear consequence that moves the story forward."
      }
    ];
  }

  // ------------------------------------------------
  // CONFLICT
  // ------------------------------------------------

  if (event.type === "conflict") {
    return [
      {
        ...event,
        id: `${event.id}_threat`,
        phase: "threat",
        action:
          `The danger described in the story becomes clear.`,
        dialogue: "This is getting dangerous.",
        voiceover:
          "The situation suddenly becomes more dangerous."
      },
      {
        ...event,
        id: `${event.id}_conflict`,
        phase: "conflict",
        action: base,
        dialogue: "I have to keep moving.",
        voiceover: base
      },
      {
        ...event,
        id: `${event.id}_reaction`,
        phase: "reaction",
        action:
          `The character reacts immediately to the consequences of the conflict.`,
        dialogue: "We need another way.",
        voiceover:
          "The character reacts and searches for a way forward."
      }
    ];
  }

  // ------------------------------------------------
  // RESOLUTION
  // ------------------------------------------------

  if (event.type === "resolution") {
    return [
      {
        ...event,
        id: `${event.id}_arrival`,
        phase: "resolution_arrival",
        action:
          `The story begins moving toward the final outcome described in the story.`,
        dialogue: "It's finally happening.",
        voiceover:
          "The situation begins to move toward its final outcome."
      },
      {
        ...event,
        id: `${event.id}_resolution`,
        phase: "resolution",
        action: base,
        dialogue: "It's over. We made it.",
        voiceover: base
      }
    ];
  }

  // ------------------------------------------------
  // NORMAL STORY BEAT
  // ------------------------------------------------

  return [
    {
      ...event,
      id: `${event.id}_main`,
      phase: "main",
      action: base,
      dialogue: "We have to keep going.",
      voiceover: base
    }
  ];
}

// ==================================================
// BUILD LONG-FORM TIMELINE
// ==================================================

function buildGenericTimeline(
  events,
  targetScenes
) {
  if (events.length === 0) {
    return [];
  }

  // Enrich original story events first.
  const expanded = [];

  for (const event of events) {
    expanded.push(
      ...expandGenericEvent(event)
    );
  }

  // ------------------------------------------------
  // SHORT STORIES
  // ------------------------------------------------

  if (targetScenes <= expanded.length) {
    const timeline = [];

    // Select evenly across the story.
    const step =
      expanded.length / targetScenes;

    for (let i = 0; i < targetScenes; i++) {
      const index = Math.min(
        expanded.length - 1,
        Math.floor(i * step)
      );

      timeline.push(expanded[index]);
    }

    // Always protect the actual final event.
    const lastOriginal =
      events[events.length - 1];

    const finalCandidates =
      expanded.filter(item =>
        item.id.startsWith(lastOriginal.id)
      );

    if (finalCandidates.length > 0) {
      timeline[timeline.length - 1] =
        finalCandidates[finalCandidates.length - 1];
    }

    return timeline;
  }

  // ------------------------------------------------
  // LONG STORIES
  // ------------------------------------------------

  // Distribute scenes over ALL story events.
  // No single early event is allowed to consume
  // the majority of the movie.

  const timeline = [];

  const baseCount = events.length;

  // Each event gets at least one scene.
  for (const event of events) {
    const variants =
      expandGenericEvent(event);

    timeline.push(variants[0]);
  }

  let remaining =
    targetScenes - timeline.length;

  // Add additional meaningful phases round-robin.
  let round = 0;

  while (
    remaining > 0 &&
    round < 20
  ) {
    for (
      let eventIndex = 0;
      eventIndex < events.length &&
      remaining > 0;
      eventIndex++
    ) {
      const event = events[eventIndex];
      const variants =
        expandGenericEvent(event);

      if (
        variants.length > round + 1
      ) {
        timeline.splice(
          Math.min(
            timeline.length,
            eventIndex + round * events.length + 1
          ),
          0,
          variants[round + 1]
        );

        remaining--;
      }
    }

    round++;
  }

  // ------------------------------------------------
  // If we still need scenes, create controlled
  // continuation beats from the original events.
  // ------------------------------------------------

  let continuationIndex = 0;

  while (remaining > 0) {
    const source =
      events[
        continuationIndex %
          events.length
      ];

    timeline.splice(
      timeline.length - 1,
      0,
      {
        ...source,
        id:
          `${source.id}_continuation_${remaining}`,
        phase: "continuation",
        action:
          `The story continues naturally from the previous event while developing the next consequence of: ${source.action}`,
        dialogue:
          "We can't stop now.",
        voiceover:
          `The situation continues to develop after ${source.action}`
      }
    );

    remaining--;
    continuationIndex++;
  }

  // Exact target count.
  let finalTimeline =
    timeline.slice(0, targetScenes);

  // ------------------------------------------------
  // FINAL SCENE PROTECTION
  // ------------------------------------------------

  const finalEvent =
    events[events.length - 1];

  const finalVariants =
    expandGenericEvent(finalEvent);

  const finalScene =
    finalVariants[finalVariants.length - 1];

  finalTimeline[
    finalTimeline.length - 1
  ] = finalScene;

  return finalTimeline;
}

// ==================================================
// UNIVERSAL TIMELINE BUILDER
// ==================================================

function buildTimeline(
  events,
  targetScenes
) {
  // ------------------------------------------------
  // SPECIAL DELIVERY DRIVER STORY
  // ------------------------------------------------

  if (
    events.length === 6 &&
    events[0]?.id === "E1" &&
    events[1]?.id === "E2" &&
    events[2]?.id === "E3" &&
    events[3]?.id === "E4" &&
    events[4]?.id === "E5" &&
    events[5]?.id === "E6"
  ) {
    // 60-second version.
    if (targetScenes === 6) {
      return events.slice(0, 6);
    }

    // For long versions, expand the six major beats.
    const expanded = [];

    for (const event of events) {
      if (event.type === "problem") {
        expanded.push(
          {
            ...event,
            id: `${event.id}_setup`,
            action:
              "The delivery driver continues along the mountain route as the weather rapidly worsens.",
            dialogue:
              "The storm is getting worse.",
            voiceover:
              "The weather becomes increasingly dangerous."
          },
          {
            ...event,
            id: `${event.id}_lost`,
            action:
              "The young delivery driver becomes lost while driving through the heavy snowstorm.",
            dialogue:
              "I can't see the road.",
            voiceover:
              "The delivery driver loses his way in the storm."
          }
        );
      }

      else if (event.type === "search") {
        expanded.push(
          {
            ...event,
            id: `${event.id}_search`,
            action:
              "The delivery driver carefully searches the mountain road for any safe route.",
            dialogue:
              "There has to be a way through.",
            voiceover:
              "The driver searches for a safe route."
          },
          {
            ...event,
            id: `${event.id}_shelter`,
            action:
              "The delivery driver notices signs of shelter through the blowing snow.",
            dialogue:
              "Maybe I can find shelter there.",
            voiceover:
              "Through the storm, the driver notices a possible place of shelter."
          }
        );
      }

      else if (event.type === "discovery") {
        expanded.push(
          {
            ...event,
            id: `${event.id}_approach`,
            action:
              "The delivery driver approaches the old cabin carefully through the storm.",
            dialogue:
              "Someone could be inside.",
            voiceover:
              "The driver reaches an isolated cabin."
          },
          {
            ...event,
            id: `${event.id}_discover`,
            action:
              "The delivery driver enters the old cabin and discovers the injured hiker inside.",
            dialogue:
              "Are you hurt?",
            voiceover:
              "Inside, the driver discovers an injured hiker."
          }
        );
      }

      else if (event.type === "rescue") {
        expanded.push(
          {
            ...event,
            id: `${event.id}_water`,
            action:
              "The delivery driver gives the injured hiker water and checks that he can drink safely.",
            dialogue:
              "Drink this slowly.",
            voiceover:
              "The driver gives the injured hiker water."
          },
          {
            ...event,
            id: `${event.id}_call`,
            action:
              "The delivery driver uses his phone to call for emergency help.",
            dialogue:
              "We need rescue at the cabin.",
            voiceover:
              "The driver calls emergency services for help."
          }
        );
      }

      else if (event.type === "night") {
        expanded.push(
          {
            ...event,
            id: `${event.id}_evening`,
            action:
              "Night falls over the mountain while the delivery driver remains beside the injured hiker.",
            dialogue:
              "Stay awake. Help is coming.",
            voiceover:
              "Night falls while the driver stays beside the injured hiker."
          },
          {
            ...event,
            id: `${event.id}_night`,
            action:
              "The delivery driver stays beside the injured hiker through the dangerous night.",
            dialogue:
              "You're not alone tonight.",
            voiceover:
              "The driver remains with the hiker through the long night."
          }
        );
      }

      else if (event.type === "resolution") {
        expanded.push(
          {
            ...event,
            id: `${event.id}_sunrise`,
            action:
              "At sunrise, the storm weakens and rescuers arrive at the mountain cabin.",
            dialogue:
              "Help is finally here.",
            voiceover:
              "At sunrise, rescuers finally reach the cabin."
          },
          {
            ...event,
            id: `${event.id}_ending`,
            action:
              "The rescuers safely take the injured hiker home.",
            dialogue:
              "You're safe now.",
            voiceover:
              "The injured hiker is safely taken home."
          }
        );
      }
    }

    // If target is smaller, select across all beats.
    if (targetScenes <= expanded.length) {
      const result = [];

      const step =
        expanded.length / targetScenes;

      for (
        let i = 0;
        i < targetScenes;
        i++
      ) {
        result.push(
          expanded[
            Math.min(
              expanded.length - 1,
              Math.floor(i * step)
            )
          ]
        );
      }

      // Protect ending.
      result[result.length - 1] =
        expanded[expanded.length - 1];

      return result;
    }

    // For long duration, repeat no beat blindly.
    // Add controlled transition beats.
    const result = [...expanded];

    let index = 0;

    while (
      result.length < targetScenes
    ) {
      const source =
        expanded[
          index % expanded.length
        ];

      result.splice(
        result.length - 1,
        0,
        {
          ...source,
          id:
            `${source.id}_long_${result.length}`,
          phase: "long_form_transition",
          action:
            `The story naturally continues from the previous moment as the situation develops around: ${source.action}`,
          dialogue:
            "We have to keep going.",
          voiceover:
            "The situation continues to develop before the next major story beat."
        }
      );

      index++;
    }

    result[result.length - 1] =
      expanded[expanded.length - 1];

    return result.slice(0, targetScenes);
  }

  // ------------------------------------------------
  // UNIVERSAL GENERIC ENGINE
  // ------------------------------------------------

  return buildGenericTimeline(
    events,
    targetScenes
  );
}

// ==================================================
// SCENE CONTEXT
// ==================================================

function getRelevantProps(event) {
  return Array.isArray(event.props)
    ? unique(event.props)
    : [];
}

function getLocation(event) {
  return (
    event.location ||
    "Story Location"
  );
}

function getCharacters(
  event,
  allCharacters
) {
  const names =
    event.characters || [];

  return allCharacters.filter(
    character =>
      names.includes(character.name)
  );
}

// ==================================================
// SMART LIGHTING
// ==================================================

function lightingForScene(event) {
  const text =
    `${event.type} ${event.phase || ""} ${event.action}`
      .toLowerCase();

  if (
    text.includes("sunrise") ||
    text.includes("morning") ||
    event.type === "resolution"
  ) {
    return "Peaceful morning or sunrise lighting appropriate to the story, with natural soft daylight and realistic shadows.";
  }

  if (
    text.includes("night") ||
    event.phase === "night" ||
    event.type === "night"
  ) {
    return "Realistic nighttime lighting appropriate to the location, with natural darkness and practical light sources where appropriate.";
  }

  if (
    text.includes("snowstorm") ||
    text.includes("storm") ||
    text.includes("snow")
  ) {
    return "Dramatic overcast storm lighting with realistic atmospheric depth, natural shadows and weather-appropriate visibility.";
  }

  if (
    text.includes("fire") ||
    text.includes("flame")
  ) {
    return "Dramatic warm firelight contrasting naturally with the surrounding environment.";
  }

  if (
    event.location === "Mountain Cabin"
  ) {
    return "Natural cabin lighting with realistic soft shadows and subtle interior contrast.";
  }

  return "Natural cinematic lighting appropriate to the established location, time and story moment.";
}

// ==================================================
// SMART CAMERA
// ==================================================

function cameraForScene(
  event,
  index,
  total
) {
  if (index === 0) {
    return "Wide cinematic establishing shot followed by a gentle push toward the protagonist.";
  }

  if (index === total - 1) {
    return "Wide emotional establishing shot followed by a slow cinematic push toward the completed story outcome.";
  }

  if (
    event.type === "discovery" ||
    event.phase === "discovery"
  ) {
    return "Medium cinematic shot followed by a subtle push toward the important discovery.";
  }

  if (
    event.type === "conflict" ||
    event.phase === "threat"
  ) {
    return "Dynamic cinematic tracking shot with controlled movement emphasizing the developing danger.";
  }

  if (
    event.type === "rescue" ||
    event.phase === "action"
  ) {
    return "Natural medium tracking shot following the characters and their immediate actions.";
  }

  if (
    event.type === "night"
  ) {
    return "Natural cinematic medium shot with subtle camera movement appropriate to the nighttime environment.";
  }

  return "Natural cinematic medium shot with subtle camera movement.";
}

// ==================================================
// DIALOGUE
// ==================================================

function dialogueForScene(event) {
  if (event.dialogue) {
    return cleanText(event.dialogue);
  }

  switch (event.type) {
    case "setup":
      return "Something is about to change.";

    case "problem":
      return "I need to stay calm.";

    case "conflict":
      return "We have to keep moving.";

    case "search":
      return "There has to be another way.";

    case "discovery":
      return "What is happening here?";

    case "decision":
      return "I'm going to do it.";

    case "action":
      return "Keep going.";

    case "rescue":
      return "Help is coming.";

    case "night":
      return "We'll make it through the night.";

    case "resolution":
      return "You're safe now.";

    default:
      return "We have to keep going.";
  }
}

// ==================================================
// CHARACTER LOCK
// ==================================================

function characterLockBlock(
  characters
) {
  return characters
    .map(
      character =>
        `${character.name}: ${character.description} Exact appearance must remain unchanged.`
    )
    .join(" ");
}

// ==================================================
// SCENE CREATION
// ==================================================

function createScenes(
  story,
  duration,
  aspectRatio
) {
  const numericDuration =
    Number(duration);

  const targetScenes = Math.max(
    1,
    Math.floor(
      numericDuration / 10
    )
  );

  const characters =
    extractCharacters(story);

  const locations =
    extractLocations(story);

  const objects =
    extractObjects(story);

  // ------------------------------------------------
  // EVENT CREATION
  // ------------------------------------------------

  let events =
    createDeliveryDriverEvents(
      story
    );

  if (!events) {
    events =
      createGenericEvents(
        story
      );

    events =
      enrichGenericEvents(
        events,
        characters,
        locations
      );
  }

  // ------------------------------------------------
  // TIMELINE
  // ------------------------------------------------

  const timeline =
    buildTimeline(
      events,
      targetScenes
    );

  // ------------------------------------------------
  // SCENES
  // ------------------------------------------------

  const scenes =
    timeline.map(
      (event, index) => {
        const times =
          sceneTimes(index);

        const activeCharacters =
          getCharacters(
            event,
            characters
          );

        const relevantProps =
          getRelevantProps(
            event
          );

        const characterNames =
          activeCharacters.length > 0
            ? activeCharacters
                .map(
                  c => c.name
                )
                .join(", ")
            : "Main Character";

        const propsText =
          relevantProps.length > 0
            ? relevantProps.join(
                ", "
              )
            : "No special props required";

        const visualPrompt = `
Cinematic ${aspectRatio} scene.

Show ONLY this exact story action:
${cleanText(event.action)}

Active characters: ${characterNames}.
Location: ${getLocation(event)}.
Relevant props: ${propsText}.

CHARACTER LOCK:
${characterLockBlock(
  characters
)}

Maintain exact character identity, face, age, hairstyle, clothing, body proportions and physical appearance.

Keep the same characters consistent across every scene.

Use only characters, props and locations required by this scene.

Do not add unrelated people, vehicles, animals, objects, locations or events.

If a vehicle is listed as a relevant prop, it is required and must appear naturally in the scene.
If a vehicle is not listed as a relevant prop, do not add one.

Do not introduce a character before the story action requires that character to appear.

Preserve chronological story order.

Realistic movement, natural facial expressions and believable physical behavior.

Scene ${index + 1} of ${targetScenes}.
`.trim();

        return {
          scene_number:
            index + 1,

          start_time:
            times.start_time,

          end_time:
            times.end_time,

          visual_prompt:
            visualPrompt,

          camera:
            cameraForScene(
              event,
              index,
              targetScenes
            ),

          lighting:
            lightingForScene(
              event
            ),

          action:
            cleanText(
              event.action
            ),

          dialogue:
            dialogueForScene(
              event
            ),

          voiceover:
            cleanText(
              event.voiceover ||
              event.action
            ),

          continuity:
            index === 0
              ? "Opening scene. Establish the story and lock all main character identities."
              : index ===
                targetScenes - 1
              ? "Final scene. Complete the actual story ending and preserve established continuity."
              : `Continue directly from Scene ${index}. Preserve exact character identity, clothing, location and relevant story elements.`
        };
      }
    );

  return {
    version: "V15",

    duration:
      numericDuration,

    total_scenes:
      targetScenes,

    aspect_ratio:
      aspectRatio,

    engine:
      "Universal Long-Form Story Timeline Engine",

    demo_mode:
      true,

    gemini:
      false,

    characters,

    locations,

    objects,

    scenes
  };
}

// ==================================================
// API ROUTES
// ==================================================

app.get("/", (req, res) => {
  res.send(
    "SANAPTAI V15 is live"
  );
});

// --------------------------------------------------

app.get(
  "/api/test",
  (req, res) => {
    res.json({
      status: "ok",
      version: "V15",
      engine:
        "Universal Long-Form Story Timeline Engine",
      demo_mode: true,
      gemini: false
    });
  }
);

// --------------------------------------------------

app.post(
  "/api/demo-project",
  (req, res) => {
    try {
      const {
        prompt,
        duration = 60,
        aspectRatio = "16:9"
      } = req.body;

      if (
        !prompt ||
        !prompt.trim()
      ) {
        return res.status(400).json({
          error:
            "Prompt is required."
        });
      }

      const project =
        createScenes(
          prompt.trim(),
          Number(duration),
          aspectRatio
        );

      res.json(project);

    } catch (error) {
      console.error(
        "Demo project error:",
        error
      );

      res.status(500).json({
        error:
          error.message ||
          "Project creation failed."
      });
    }
  }
);

// --------------------------------------------------

app.post(
  "/api/create-project",
  (req, res) => {
    try {
      const {
        prompt,
        duration = 60,
        aspectRatio = "16:9"
      } = req.body;

      if (
        !prompt ||
        !prompt.trim()
      ) {
        return res.status(400).json({
          error:
            "Prompt is required."
        });
      }

      const project =
        createScenes(
          prompt.trim(),
          Number(duration),
          aspectRatio
        );

      res.json(project);

    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      res.status(500).json({
        error:
          error.message ||
          "Project creation failed."
      });
    }
  }
);

// ==================================================
// GEMINI DISABLED
// ==================================================

app.post(
  "/api/plan-scenes",
  (req, res) => {
    res.status(501).json({
      error:
        "AI scene planning is reserved for a future version.",
      version: "V15"
    });
  }
);

// ==================================================
// SERVER
// ==================================================

app.listen(
  PORT,
  () => {
    console.log(
      `SANAPTAI V15 running on port ${PORT}`
    );
  }
);
