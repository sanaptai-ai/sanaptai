const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AI Video App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px 20px;
            background: #f5f5f5;
          }
          .box {
            max-width: 500px;
            margin: auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
          }
          h1 {
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>AI Video App</h1>
          <p>Server is running successfully.</p>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
