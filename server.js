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

VIDEO RULES:

- Exactly ${totalScenes} scenes.
- Every scene is exactly 10 seconds.
- Every scene must continue naturally from the previous scene.
- Create detailed cinematic video-generation prompts.
- Dialogue must fit naturally inside 10 seconds.
- Use voiceover when narration is needed.
- Avoid repetitive dialogue.
- Do not skip important story events.
- Keep the same characters consistent throughout the entire video.

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
