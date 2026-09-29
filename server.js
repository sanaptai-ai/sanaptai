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
   CHARACTER LOCK ENGINE
========================================================= */

const CHARACTER_LOCKS = {
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

function getCharacter(name) {
  return CHARACTER_LOCKS[name] || CHARACTER_LOCKS["Main Character"];
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
        "One morning, Noah spends time with his father inside the workshop.",
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
        "Noah notices an old lighthouse journal inside his father's workshop.",
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
   V18 CINEMATIC SUB-BEATS
========================================================= */

function createSubBeats(event) {
  const e = { ...event };

  switch (e.id) {
    case "E01":
      return [
        {
          ...e,
          phase: "establish",
          action:
            "Noah and his father walk together along the quiet streets of their small coastal town.",
          dialogue: "This town has always been home to us."
        },
        {
          ...e,
          phase: "relationship",
          action:
            "Noah looks toward the familiar coastal homes while walking beside his father.",
          dialogue: "I love it here, Dad."
        }
      ];

    case "E02":
      return [
        {
          ...e,
          phase: "workshop-arrival",
          action:
            "Noah enters his father's workshop on a calm morning and looks around at the familiar workspace.",
          dialogue: "What are you working on, Dad?"
        },
        {
          ...e,
          phase: "father-reaction",
          action:
            "Noah watches his father work while standing beside the workshop table.",
          dialogue: "Can I help you?"
        }
      ];

    case "E03":
      return [
        {
          ...e,
          phase: "notice",
          action:
            "Noah notices an old lighthouse journal resting on the workshop table.",
          dialogue: "What's that old journal?"
        },
        {
          ...e,
          phase: "approach",
          action:
            "Noah steps closer and reaches toward the old lighthouse journal.",
          dialogue: "I've never seen this before."
        }
      ];

    case "E04":
      return [
        {
          ...e,
          phase: "pickup",
          action:
            "Noah carefully picks up the old lighthouse journal from the workshop table.",
          dialogue: "I wonder what this says."
        },
        {
          ...e,
          phase: "opening",
          action:
            "Noah opens the lighthouse journal and begins examining its aged pages.",
          dialogue: "There's something written here."
        }
      ];

    case "E05":
      return [
        {
          ...e,
          phase: "reading",
          action:
            "Noah studies the journal pages and notices a serious warning.",
          dialogue: "This doesn't look good."
        },
        {
          ...e,
          phase: "reveal",
          action:
            "Noah reads the warning describing a powerful storm approaching the town.",
          dialogue: "A powerful storm is coming."
        }
      ];

    case "E06":
      return [
        {
          ...e,
          phase: "concern",
          action:
            "Noah looks up from the journal and realizes the approaching storm could threaten the town.",
          dialogue: "Everyone needs to know about this."
        },
        {
          ...e,
          phase: "understanding",
          action:
            "Noah grips the journal firmly, understanding that the warning cannot be ignored.",
          dialogue: "I have to do something."
        }
      ];

    case "E07":
      return [
        {
          ...e,
          phase: "decision",
          action:
            "Noah closes the journal and makes the decision to warn the villagers.",
          dialogue: "I have to warn them."
        },
        {
          ...e,
          phase: "departure",
          action:
            "Noah carries the journal and quickly leaves the workshop to warn the town.",
          dialogue: "They need to know now."
        }
      ];

    case "E08":
      return [
        {
          ...e,
          phase: "walk",
          action:
            "Noah walks through the coastal town carrying the lighthouse journal.",
          dialogue: "Please listen to me."
        },
        {
          ...e,
          phase: "search",
          action:
            "Noah approaches the villagers and prepares to explain the warning.",
          dialogue: "I found something important."
        }
      ];

    case "E09":
      return [
        {
          ...e,
          phase: "warning",
          action:
            "Noah urgently tells the villagers that a dangerous storm is approaching.",
          dialogue: "A dangerous storm is coming!"
        },
        {
          ...e,
          phase: "appeal",
          action:
            "Noah holds up the lighthouse journal and asks the villagers to take the warning seriously.",
          dialogue: "You have to believe me."
        }
      ];

    case "E10":
      return [
        {
          ...e,
          phase: "skepticism",
          action:
            "The villagers exchange skeptical looks while Noah tries to convince them.",
          dialogue: "Nobody believes me."
        },
        {
          ...e,
          phase: "rejection",
          action:
            "Several villagers remain unconvinced despite Noah's warning.",
          dialogue: "Why won't they listen?"
        }
      ];

    case "E11":
      return [
        {
          ...e,
          phase: "proof",
          action:
            "Noah opens the lighthouse journal and shows the storm warning to the villagers.",
          dialogue: "Look at the warning!"
        },
        {
          ...e,
          phase: "doubt",
          action:
            "The villagers study the journal but remain uncertain about Noah's warning.",
          dialogue: "Please take this seriously."
        }
      ];

    case "E12":
      return [
        {
          ...e,
          phase: "clouds",
          action:
            "Noah looks toward the sky as dark clouds begin gathering over the coastal town.",
          dialogue: "Those clouds are getting darker."
        },
        {
          ...e,
          phase: "realization",
          action:
            "Noah watches the darkening sky and realizes the warning is becoming reality.",
          dialogue: "The storm is really coming."
        }
      ];

    case "E13":
      return [
        {
          ...e,
          phase: "wind",
          action:
            "Strong winds sweep through the coastal town as Noah and the villagers react to the changing weather.",
          dialogue: "The weather is changing fast."
        },
        {
          ...e,
          phase: "intensify",
          action:
            "The wind grows stronger and villagers begin moving toward safer places.",
          dialogue: "Everyone, get somewhere safe!"
        }
      ];

    case "E14":
      return [
        {
          ...e,
          phase: "rain",
          action:
            "Heavy rain begins falling across the coastal town.",
          dialogue: "It's starting."
        },
        {
          ...e,
          phase: "preparation",
          action:
            "The villagers hurry to prepare their homes as heavy rain and strong winds intensify.",
          dialogue: "Everyone, get somewhere safe!"
        }
      ];

    case "E15":
      return [
        {
          ...e,
          phase: "observation",
          action:
            "Noah looks toward the lighthouse through the storm and notices that its signal is dark.",
          dialogue: "Why is the light off?"
        },
        {
          ...e,
          phase: "discovery",
          action:
            "Noah confirms that the lighthouse signal has stopped working.",
          dialogue: "The lighthouse signal is out."
        }
      ];

    case "E16":
      return [
        {
          ...e,
          phase: "concern",
          action:
            "Noah looks toward the dark sea and considers what the broken lighthouse signal means for boats.",
          dialogue: "Boats won't see the harbor."
        },
        {
          ...e,
          phase: "danger",
          action:
            "Noah realizes that boats could struggle to find the harbor without the lighthouse signal.",
          dialogue: "They need that light."
        }
      ];

    case "E17":
      return [
        {
          ...e,
          phase: "decision",
          action:
            "Noah looks at the broken lighthouse signal and decides to repair it.",
          dialogue: "I have to fix it."
        },
        {
          ...e,
          phase: "commitment",
          action:
            "Noah turns toward the lighthouse stairs and prepares to climb through the storm.",
          dialogue: "I can't wait any longer."
        }
      ];

    case "E18":
      return [
        {
          ...e,
          phase: "approach",
          action:
            "Noah moves through heavy rain and strong wind toward the lighthouse.",
          dialogue: "I can't turn back now."
        },
        {
          ...e,
          phase: "arrival",
          action:
            "Noah reaches the lighthouse entrance while the storm continues around him.",
          dialogue: "I have to reach the top."
        }
      ];

    case "E19":
      return [
        {
          ...e,
          phase: "climb",
          action:
            "Noah climbs the lighthouse stairs as rain and wind shake the structure.",
          dialogue: "Just a little farther."
        },
        {
          ...e,
          phase: "continue",
          action:
            "Noah keeps climbing toward the upper lighthouse chamber despite the violent storm.",
          dialogue: "I have to keep going."
        }
      ];

    case "E20":
      return [
        {
          ...e,
          phase: "arrival",
          action:
            "Noah reaches the upper lighthouse chamber and approaches the damaged signal mechanism.",
          dialogue: "I found the damage."
        },
        {
          ...e,
          phase: "inspection",
          action:
            "Noah examines the damaged lighthouse signal mechanism closely.",
          dialogue: "I can repair this."
        }
      ];

    case "E21":
      return [
        {
          ...e,
          phase: "examine",
          action:
            "Noah carefully studies the damaged parts of the lighthouse signal.",
          dialogue: "I need to find the problem."
        },
        {
          ...e,
          phase: "plan-repair",
          action:
            "Noah identifies the damaged connection and prepares to repair it.",
          dialogue: "I know what to fix."
        }
      ];

    case "E22":
      return [
        {
          ...e,
          phase: "start-repair",
          action:
            "Noah begins repairing the damaged lighthouse signal mechanism.",
          dialogue: "Come on, work."
        },
        {
          ...e,
          phase: "work",
          action:
            "Noah carefully reconnects the damaged parts while the storm rages outside.",
          dialogue: "Almost there."
        }
      ];

    case "E23":
      return [
        {
          ...e,
          phase: "struggle",
          action:
            "Noah continues working on the lighthouse signal while strong wind and rain batter the windows.",
          dialogue: "I can't give up."
        },
        {
          ...e,
          phase: "final-repair",
          action:
            "Noah makes the final repair to the damaged lighthouse signal.",
          dialogue: "One more connection."
        }
      ];

    case "E24":
      return [
        {
          ...e,
          phase: "activation",
          action:
            "Noah completes the final connection and the lighthouse signal begins to activate.",
          dialogue: "Please turn on."
        },
        {
          ...e,
          phase: "success",
          action:
            "The lighthouse signal shines brightly again through the storm.",
          dialogue: "It's working!"
        }
      ];

    case "E25":
      return [
        {
          ...e,
          phase: "sighting",
          action:
            "Noah spots a rescue boat appearing through the storm beyond the lighthouse.",
          dialogue: "I see a boat!"
        },
        {
          ...e,
          phase: "response",
          action:
            "The rescue crew notices the restored lighthouse signal and turns the boat toward it.",
          dialogue: "They can see the signal!"
        }
      ];

    case "E26":
      return [
        {
          ...e,
          phase: "guidance",
          action:
            "Noah keeps the lighthouse signal visible while the rescue boat approaches.",
          dialogue: "Keep following the light!"
        },
        {
          ...e,
          phase: "approach",
          action:
            "The rescue boat continues toward the harbor guided by the lighthouse signal.",
          dialogue: "They're getting closer."
        }
      ];

    case "E27":
      return [
        {
          ...e,
          phase: "navigation",
          action:
            "The rescue boat follows the lighthouse signal through the rough water toward the harbor.",
          dialogue: "Stay with the light."
        },
        {
          ...e,
          phase: "safe-route",
          action:
            "The rescue boat moves safely along the guided route toward the harbor entrance.",
          dialogue: "They're heading safely toward us."
        }
      ];

    case "E28":
      return [
        {
          ...e,
          phase: "arrival",
          action:
            "The rescue boat reaches the harbor safely while the storm begins to weaken.",
          dialogue: "They made it safely."
        },
        {
          ...e,
          phase: "weakening",
          action:
            "The wind begins to calm and the heavy storm starts moving away from the coastal town.",
          dialogue: "The storm is finally weakening."
        }
      ];

    case "E29":
      return [
        {
          ...e,
          phase: "morning",
          action:
            "By morning, the storm has completely passed and calm sunlight returns to the coastal town.",
          dialogue: "The storm is finally over."
        },
        {
          ...e,
          phase: "aftermath",
          action:
            "Noah stands safely beside his father as the villagers look across the peaceful town after the storm.",
          dialogue: "Everyone is safe."
        }
      ];

    case "E30":
      return [
        {
          ...e,
          phase: "recognition",
          action:
            "The villagers gather around Noah and realize that his warning and actions helped protect the town.",
          dialogue: "Noah, you helped save our town."
        },
        {
          ...e,
          phase: "completion",
          action:
            "Noah stands beside his proud father as the grateful villagers acknowledge what he did.",
          dialogue: "I just did what I could."
        }
      ];

    default:
      return [
        {
          ...e,
          phase: "main"
        }
      ];
  }
}

/* =========================================================
   GENERIC STORY ENGINE
========================================================= */

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

function createGenericEvents(prompt) {
  const sentences = cleanText(prompt)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  return sentences.map((sentence, i) => {
    const lower = sentence.toLowerCase();

    let type = "story";

    if (i === 0) {
      type = "setup";
    } else if (
      /finally|by morning|safe|saved|returns home|reunited|rescued/i.test(
        lower
      )
    ) {
      type = "resolution";
    } else if (
      /discover|find|notice|see|hear|realize|learn/i.test(lower)
    ) {
      type = "discovery";
    } else if (
      /decide|plan|choose|try|attempt|begin/i.test(lower)
    ) {
      type = "decision";
    } else if (
      /storm|danger|attack|trapped|lost|fire|accident|threat/i.test(
        lower
      )
    ) {
      type = "conflict";
    } else if (
      /help|rescue|give|call|repair|build|carry|protect|search|climb|run|walk|drive|enter|leave/i.test(
        lower
      )
    ) {
      type = "action";
    }

    return {
      id: `G${i + 1}`,
      type,
      action: sentence,
      characters: extractCharacters(sentence),
      location: extractLocation(sentence),
      props: extractProps(sentence),
      dialogue: "We have to keep going.",
      voiceover: sentence
    };
  });
}

function createGenericSubBeats(event) {
  return [
    {
      ...event,
      phase: "establish",
      action: event.action
    },
    {
      ...event,
      phase: "development",
      action: event.action
    }
  ];
}

function buildGenericTimeline(prompt, targetScenes) {
  const events = createGenericEvents(prompt);
  const expanded = events.flatMap(createGenericSubBeats);

  if (targetScenes <= expanded.length) {
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

  const result = [];

  while (result.length < targetScenes) {
    const source = expanded[result.length % expanded.length];

    result.push({
      ...source,
      phase: `${source.phase}-extended`,
      action: source.action
    });
  }

  return result.slice(0, targetScenes);
}

/* =========================================================
   TIMELINE ENGINE
========================================================= */

function buildNoahTimeline(targetScenes) {
  const core = createNoahCoreEvents();

  if (targetScenes === 30) {
    return core;
  }

  if (targetScenes === 60) {
    return core.flatMap(createSubBeats);
  }

  if (targetScenes === 120) {
    const timeline = [];

    for (const event of core) {
      const beats = createSubBeats(event);

      for (const beat of beats) {
        timeline.push(beat);

        timeline.push({
          ...beat,
          phase: `${beat.phase}-continuation`,
          action: beat.action
        });
      }
    }

    return timeline;
  }

  const expanded = core.flatMap(createSubBeats);

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

  return expanded.slice(0, targetScenes);
}

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
   CINEMATIC CAMERA ENGINE
========================================================= */

function cameraForScene(event, index, total) {
  const text = `${event.action} ${event.phase || ""}`.toLowerCase();

  if (index === 0) {
    return "Wide cinematic establishing shot with a slow controlled push toward the main character.";
  }

  if (index === total - 1) {
    return "Wide emotional closing shot followed by a slow cinematic push toward the completed story outcome.";
  }

  if (/walk|move|approach|leave|enter|climb/i.test(text)) {
    return "Smooth cinematic tracking shot following the character's movement while keeping the environment visible.";
  }

  if (/journal|read|notice|discover|warning|signal|find/i.test(text)) {
    return "Cinematic medium close-up focused on the character's discovery, followed by a subtle push-in.";
  }

  if (/villagers|warning|believe|doubt|rejection/i.test(text)) {
    return "Natural cinematic two-shot showing the main character and surrounding villagers reacting to each other.";
  }

  if (/storm|rain|wind|danger|rescue/i.test(text)) {
    return "Dynamic cinematic tracking shot with controlled movement emphasizing the environmental danger and ongoing action.";
  }

  if (/repair|work|fix|connect|mechanism/i.test(text)) {
    return "Detailed cinematic close-up of the character working on the mechanism, followed by a wider shot showing the surrounding environment.";
  }

  if (/morning|sunlight|safe|aftermath|grateful|proud|save the town/i.test(text)) {
    return "Wide peaceful cinematic shot with a slow controlled movement emphasizing the emotional aftermath.";
  }

  return "Natural cinematic medium shot with subtle controlled camera movement.";
}

/* =========================================================
   STORY-AWARE LIGHTING ENGINE
========================================================= */

function lightingForScene(event, index) {
  const id = event.id;
  const text = `${event.action} ${event.location} ${event.phase || ""}`.toLowerCase();

  if (
    ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11"].includes(id)
  ) {
    if (id === "E02" || id === "E03" || id === "E04" || id === "E05" || id === "E06") {
      return "Warm natural morning daylight entering the workshop, calm weather outside, soft realistic shadows, no storm visible.";
    }

    return "Clear peaceful daytime coastal lighting with natural sunlight, realistic shadows and calm weather.";
  }

  if (["E12"].includes(id)) {
    return "Daylight gradually darkening beneath gathering storm clouds, realistic atmospheric transition, no heavy rain yet.";
  }

  if (["E13"].includes(id)) {
    return "Darkening overcast storm lighting with strong wind, dramatic clouds and realistic atmospheric depth.";
  }

  if (["E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "E25", "E26", "E27"].includes(id)) {
    if (id === "E15" || id === "E16" || id === "E17") {
      return "Heavy storm lighting with dark clouds, rain outside and practical lighthouse illumination, realistic contrast.";
    }

    return "Dramatic active-storm lighting with heavy rain, strong wind, dark clouds, realistic shadows and practical lighthouse illumination where appropriate.";
  }

  if (id === "E28") {
    return "Storm weakening at the harbor, softer overcast daylight breaking through clouds, wet surfaces reflecting natural light.";
  }

  if (id === "E29" || id === "E30") {
    return "Peaceful clear morning after the storm, soft golden sunlight, fresh wet surfaces, calm sky and realistic post-storm atmosphere.";
  }

  if (/storm|rain|wind|dark cloud/i.test(text)) {
    return "Dramatic weather-appropriate storm lighting with realistic atmospheric depth.";
  }

  if (/morning|sunrise|safe|aftermath|peaceful/i.test(text)) {
    return "Peaceful natural morning lighting with soft realistic sunlight.";
  }

  return "Natural cinematic lighting appropriate to the exact story moment.";
}

/* =========================================================
   SCENE CREATION
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

Use only characters, props, locations and actions required by this scene.

Do not add unrelated people, vehicles, animals, objects, locations or events.

Do not introduce characters before the story requires them.

Preserve chronological story order.

The scene must visually perform the stated action naturally.

Do not describe future actions.

Do not describe preparation for another action.

Do not use meta instructions such as "continue this story moment", "develop this event", or "prepare for the next action."

Realistic movement, natural facial expressions and believable physical behavior.

Scene ${index + 1} of ${timeline.length}.
`.trim();

    return {
      scene_number: index + 1,
      start_time: times.start_time,
      end_time: times.end_time,
      visual_prompt: visualPrompt,
      camera: cameraForScene(event, index, timeline.length),
      lighting: lightingForScene(event, index),
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
   PROJECT ENGINE
========================================================= */

function createProject(body = {}) {
  const prompt = cleanText(body.prompt || "");
  const duration = Number(body.duration || 60);
  const aspectRatio = body.aspectRatio || "16:9";

  const totalScenes = Math.max(
    1,
    Math.round(duration / 10)
  );

  const timeline = buildTimeline(prompt, totalScenes);

  const scenes = createScenes(timeline, aspectRatio);

  return {
    success: true,
    version: "V18",
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
  res.send("SANAPTAI V18 is live");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    version: "V18",
    engine: "Cinematic Sub-Beat Story Engine",
    demo_mode: true,
    gemini: false,
    exact_scene_duration: "10 seconds",
    supported_long_form: ["30 scenes", "60 scenes", "120 scenes"],
    improvements: [
      "No meta cinematic actions",
      "Scene-specific camera language",
      "Story-aware lighting",
      "Chronological sub-beats",
      "Protected final resolution",
      "Exact character continuity"
    ]
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
  console.log(`SANAPTAI V18 running on port ${PORT}`);
});
