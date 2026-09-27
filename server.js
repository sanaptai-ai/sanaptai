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

// Frontend
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create video project
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
            duration: sceneDuration,
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

// AI Scene Planner - Gemini
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
- First identify the main character(s) from the story.
- Create a permanent CHARACTER LOCK for every important character.
- The same character must look exactly the same in every scene.
- Keep the same face, age, skin tone, hairstyle, hair color, eye color, body type, clothing, accessories, and distinguishing features.
- Never randomly change clothing, hairstyle, age, face, body proportions, or appearance between scenes.
- Every scene prompt must repeat the relevant character's locked physical description.
- Maintain logical continuity of location, time, weather, lighting, props, and character position from scene to scene.

VIDEO RULES:
- Exactly ${totalScenes} scenes.
- Every scene is exactly 10 seconds.
- Every scene must continue naturally from the previous scene.
- Create cinematic, detailed video-generation prompts.
- Dialogue must be short enough to be spoken naturally within 10 seconds.
- Use voiceover when narration is needed.
- Avoid repetitive dialogue.
- Do not skip important story events.

Return ONLY valid JSON.

JSON format:
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
      "prompt": "Detailed cinematic video prompt including the relevant character lock",
      "dialogue": "Short dialogue or empty string",
      "voiceover": "Short voiceover or empty string"
    }
  ]
}`
{
  "scenes": [
    {
      "scene": 1,
      "start": 0,
      "end": 10,
      "duration": 10,
      "prompt": "detailed visual prompt",
      "dialogue": "short dialogue",
      "voiceover": "short voiceover"
    }
  ]
}`
        });

        let text = response.text.trim();

        text = text.replace(/^```json\s*/i, '');
        text = text.replace(/^```\s*/i, '');
        text = text.replace(/\s*```$/i, '');

        const aiData = JSON.parse(text);

        res.json({
            status: 'success',
            message: 'Gemini scene plan created successfully',
            project: {
                duration: totalSeconds,
                sceneDuration: sceneDuration,
                totalScenes: totalScenes,
                scenes: aiData.scenes
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
