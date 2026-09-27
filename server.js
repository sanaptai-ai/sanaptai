import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Frontend serve करना
app.use(express.static(path.join(__dirname, 'public')));

// Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Create video project
app.post('/api/create-project', (req, res) => {
    const { prompt, duration } = req.body;

    if (!prompt) {
        return res.status(400).json({
            error: "Video prompt is required"
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
            status: "pending"
        });
    }

    res.json({
        status: "success",
        project: {
            duration: totalSeconds,
            sceneDuration: sceneDuration,
            totalScenes: sceneCount,
            scenes: scenes
        }
    });
});
// AI Scene Planner
app.post('/api/plan-scenes', (req, res) => {
    const { prompt, duration } = req.body;

    if (!prompt) {
        return res.status(400).json({
            error: "Video prompt is required"
        });
    }

    const totalSeconds = Number(duration) || 10;
    const sceneDuration = 10;
    const totalScenes = Math.ceil(totalSeconds / sceneDuration);

    const scenes = [];

    for (let i = 1; i <= totalScenes; i++) {
        scenes.push({
            scene: i,
            start: (i - 1) * 10,
            end: i * 10,
            duration: 10,
            prompt: `Create scene ${i} for this story: ${prompt}`,
            dialogue: "",
            voiceover: "",
            status: "planned"
        });
    }

    res.json({
        status: "success",
        message: "Scene plan created successfully",
        project: {
            duration: totalSeconds,
            sceneDuration: sceneDuration,
            totalScenes: totalScenes,
            scenes: scenes
        }
    });
});
// Test API
app.get('/api/test', (req, res) => {
    res.json({
        message: "API is working perfectly!",
        timestamp: new Date()
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`SANAPTAI backend running on port ${PORT}`);
});
