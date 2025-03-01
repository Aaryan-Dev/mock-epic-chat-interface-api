const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
const groq = new Groq({
  apiKey: process.env.API_KEY,
  dangerouslyAllowBrowser: true,
});

app.use(cors());
app.use(express.json());

app.post("/api/messages", async (req, res) => {
  try {
    const { content, source } = req.body;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await groq.chat.completions.create({
      messages: content,
      model: "gemma2-9b-it",
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95,
      stream: true,
      stop: null,
    });

    let finalContent = "";
    let id;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      id = chunk.id;
      finalContent = finalContent + content;
    }

    // Generate timestamp
    const timestamp = new Date().toLocaleTimeString("en-IN", {
      hour: "numeric",
      timeZone: "Asia/Kolkata",
      minute: "2-digit",
      hour12: true,
    });

    res.send({ id, content: finalContent, timestamp, type: "ai" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
