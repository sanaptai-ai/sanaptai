import express from 'express';

const app = express();

app.use(express.json());

// 1. Root Route
app.get('/', (req, res) => {
    res.send({
        status: "success",
        message: "SANAPTAI backend is up and running successfully! 🚀",
        endpoints: {
            test: "/api/test"
        }
    });
});

// 2. Test API Route
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
