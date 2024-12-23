const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors()); // Enable CORS to allow frontend requests
app.use(bodyParser.json()); // Parse JSON request bodies

// API endpoint to handle keypress
app.post("/api/keypress", (req, res) => {
  const { key } = req.body;

  // Log the received key
  console.log(`Key received from frontend: ${key}`);

  // Process the key (convert "SPACE" to an actual space)
  const processedKey = key === "SPACE" ? " " : key;

  // Respond with the processed key
  console.log(`Responding with key: ${processedKey}`);
  res.json({ key: processedKey });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
