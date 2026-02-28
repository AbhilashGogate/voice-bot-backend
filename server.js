import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

// ✅ CORS FIRST
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// ✅ Handle preflight explicitly
app.options("*", cors());
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const fullPrompt = `
You are Abhilash Gogate, a final semester BCA student from Dharmasthala applying for an AI Agent role at 100x.

Strengths:
- Adaptability
- Collaboration

Growth areas:
- Technical depth
- Leadership skills
- Emotional intelligence

Common misconception:
People think you are unapproachable, but you are thoughtful and observant.

Respond confidently, professionally, and naturally.
Keep response under 120 words.
Do NOT say you are an AI model.

User Question:
${message}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "user", content: fullPrompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Error:", data);
      return res.status(500).json({ error: "AI request failed" });
    }

    const reply = data.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT;

app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
