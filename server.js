import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Create basic video project
app.post('/api/create-project', (req, res) => {
    const { prompt, duration } = req.body;

    if (!prompt) {
        return res.status(400).json({
            error: 'Video prompt is required'
        });
    }

    const totalSeconds = Number(duration) || 10;
    const sceneDuration = 10;
    const sceneCount = Math.ceil(totalSeconds / sceneDuration);

    const scenes = [];

    for (let i = 1; i <= sceneCount; i++) {
        scenes.push({
            scene: i,
            start: (i - 1) * 10,
            end: i * 10,
            duration: 10,
            prompt: prompt,
            status: 'pending'
        });
    }

    res.json({
        status: 'success',
        project: {
            duration: totalSeconds,
            sceneDuration: sceneDuration,
            totalScenes: sceneCount,
            scenes: scenes
        }
    });
});


// AI Scene Planner
app.post('/api/plan-scenes', async (req, res) => {

    const { prompt, duration } = req.body;

    if (!prompt) {
        return res.status(400).json({
            error: 'Video prompt is required'
        });
    }

    const totalSeconds = Number(duration) || 10;
    const sceneDuration = 10;
    const totalScenes = Math.ceil(totalSeconds / sceneDuration);

    try {

        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',

            contents: `Create a detailed ${totalScenes}-scene video story from this idea:

"${prompt}"

IMPORTANT CHARACTER CONSISTENCY RULES:

1. Identify all important characters in the story.

2. Create a permanent CHARACTER LOCK for every important character.

3. The same character must look exactly the same in every scene.

4. Keep the same:
- face
- age
- skin tone
- hairstyle
- hair color
- eye color
- body type
- clothing
- accessories
- distinguishing features

5. Never randomly change a character's appearance.

6. Every scene prompt must include the relevant character's locked appearance.

7. Maintain continuity of:
- location
- time
- weather
- lighting
- props
- character position
- story events

SCENE INTELLIGENCE RULES:

- Every scene is exactly 10 seconds.
- Every scene must logically continue from the previous scene.
- Never restart the story in a new scene.
- Maintain the same character identity and Character Lock throughout.
- Maintain continuity of location, time, weather, lighting, props, clothing, and character position.

For every scene, create:

1. VISUAL PROMPT
- Detailed cinematic visual description.
- Include character appearance from the Character Lock.
- Describe the environment and important objects.
- Describe the character's current action and emotion.

2. CAMERA
- Specify the camera shot, such as wide shot, medium shot, close-up, or over-the-shoulder.
- Specify camera movement, such as tracking, dolly, pan, tilt, push-in, or static.
- Camera movement must fit the action.

3. LIGHTING
- Describe the lighting appropriate to the environment and mood.
- Maintain lighting continuity between connected scenes.

4. ACTION
- Clearly describe what the character does during the 10-second scene.
- The action must be physically realistic and complete within 10 seconds.

5. DIALOGUE
- Use dialogue only when a character is actually speaking.
- Maximum approximately 18 spoken words per scene.
- Dialogue must fit naturally within 10 seconds.
- Never repeat dialogue.
- If nobody speaks, use an empty string.

6. VOICEOVER
- Use voiceover only when narration is useful.
- Keep voiceover short enough to fit naturally within 10 seconds.
- Do not repeat information already clearly communicated by dialogue.
- If no voiceover is needed, use an empty string.

7. CONTINUITY
- Check the previous scene before creating the next scene.
- The next scene must begin from the physical and emotional state established by the previous scene.

Do not put dialogue, voiceover, camera instructions, or technical notes inside the visual prompt.

Return all information in the JSON fields specified below.

Return ONLY valid JSON.

JSON FORMAT:

{
  "character_locks": [
    {
      "name": "Character name",
      "description": "Permanent detailed physical appearance and clothing description"
    }
  ],
  "scenes": [
    {
      "scene": 1,
      "start": 0,
      "end": 10,
      "duration": 10,
      "prompt": "Detailed cinematic video prompt including character consistency",
      "dialogue": "Short dialogue or empty string",
      "voiceover": "Short voiceover or empty string"
    }
  ]
}`
        });

        let text = response.text.trim();

        text = text.replace(/^```json\\s*/i, '');
        text = text.replace(/^```\\s*/i, '');
        text = text.replace(/\\s*```$/i, '');

        const aiData = JSON.parse(text);

        res.json({
            status: 'success',
            message: 'Gemini scene plan created successfully',

            project: {
                duration: totalSeconds,
                sceneDuration: sceneDuration,
                totalScenes: totalScenes,
                characterLocks: aiData.character_locks || [],
                scenes: aiData.scenes || []
            }
        });

    } catch (error) {

        console.error('Gemini Error:', error);

        res.status(500).json({
            error: 'Gemini scene planning failed',
            details: error.message
        });
    }
});


// Test API
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working perfectly!',
        timestamp: new Date()
    });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`SANAPTAI backend running on port ${PORT}`);
});
