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
