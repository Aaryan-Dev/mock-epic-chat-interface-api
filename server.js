const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
const groq = new Groq({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});

app.use(cors());
app.use(express.json());

app.post("/api/messages", async (req, res) => {
  try {
    const { messages } = req.body;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await groq.chat.completions.create({
      messages,
      model: "gemma2-9b-it",
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95,
      stream: true,
      stop: null,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      res.write(content);
    }

    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
