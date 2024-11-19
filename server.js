import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

let sentimentHistory = [];
const messageIdSet = new Set();
const messageContentSet = new Set();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

async function analyzeSentiment(text) {
  try {
    const sentimentPrompt = `Analyze the sentiment of the following text and return a JSON object with exactly these two properties:
    - "label": must be one of: "1 star", "2 stars", "3 stars", "4 stars", or "5 stars"
    - "score": the corresponding number (1-5)
    
    Text to analyze: "${text}"
    
    Return ONLY the raw JSON object, with NO markdown formatting, NO backticks, and NO "json" prefix. Example:
    {"label": "4 stars", "score": 4}`;

    const result = await model.generateContent(sentimentPrompt);
    const response = result.response
      .text()
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```/g, "")
      .replace(/\n/g, "")
      .trim();

    try {
      const parsed = JSON.parse(response);

      if (
        !parsed.label ||
        !parsed.score ||
        !parsed.label.match(/[1-5] stars?/) ||
        parsed.score < 1 ||
        parsed.score > 5
      ) {
        throw new Error("Invalid response format");
      }

      return parsed;
    } catch (parseError) {
      console.error("Failed to parse or validate JSON response:", response);
      return {
        label: "3 stars",
        score: 3,
      };
    }
  } catch (error) {
    console.error("Error in sentiment analysis:", error);
    throw error;
  }
}

app.post("/analyze-sentiment", async (req, res) => {
  const { message, messageId } = req.body;
  const normalizedContent = message.trim().toLowerCase();

  // Check for existing message with same content
  const existingMessage = sentimentHistory.find(
    (item) => item.message.trim().toLowerCase() === normalizedContent
  );

  // If duplicate content exists, return the existing sentiment
  if (existingMessage) {
    return res.json({
      sentiment: existingMessage.sentiment,
      isDuplicate: true,
    });
  }

  // Generate unique messageId if the provided one is duplicate
  let finalMessageId = messageId;
  if (messageIdSet.has(messageId)) {
    finalMessageId = `${messageId}_${Date.now()}`;
  }

  try {
    const sentiment = await analyzeSentiment(message);

    const sentimentData = {
      messageId: finalMessageId,
      message,
      timestamp: new Date().toISOString(),
      sentiment: {
        label: sentiment.label,
        score: sentiment.score,
      },
    };

    messageIdSet.add(finalMessageId);
    messageContentSet.add(normalizedContent);
    sentimentHistory.unshift(sentimentData);

    if (sentimentHistory.length > 100) {
      const removedItem = sentimentHistory.pop();
      if (removedItem) {
        messageIdSet.delete(removedItem.messageId);
        messageContentSet.delete(removedItem.message.trim().toLowerCase());
      }
    }

    res.json({
      sentiment: sentimentData.sentiment,
      isDuplicate: false,
    });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    res.status(500).json({ error: "Failed to analyze sentiment" });
  }
});

app.get("/sentiment-history", (req, res) => {
  try {
    res.json(sentimentHistory);
  } catch (error) {
    console.error("Error fetching sentiment history:", error);
    res.status(500).json({ error: "Failed to fetch sentiment history" });
  }
});

async function generateAIContent(prompt) {
  try {
    const contextPrompt = `As a helpful AI assistant, please respond to: ${prompt}
    Keep the response concise and natural, as it will be converted to speech.`;

    const result = await model.generateContent(contextPrompt);
    const response = result.response.text();

    return response
      .replace(/\*\*/g, "")
      .replace(/\n\n/g, " ")
      .replace(/\n/g, " ")
      .trim();
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw error;
  }
}

app.post("/generate-ai", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const aiResponse = await generateAIContent(prompt);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in /generate-ai:", error);
    res.status(500).json({ error: "Failed to generate AI content" });
  }
});

async function moderateContent(text) {
  try {
    console.log("Moderating content:", text);
    const moderationPrompt = `Please analyze the following message for appropriateness in a public Q&A setting during a live sales event for a new laptop.

Consider the following criteria:

    Is the content relevant to the product being discussed (a new laptop)?
    Is the content respectful, professional, and suitable for all audiences?
    Is the message related to the sales event or the laptop in a meaningful way?

Respond with either "APPROVED" if the content meets the criteria or "FLAGGED" if it does not.

Content to analyze: "${text}"`;

    const result = await model.generateContent(moderationPrompt);
    const response = result.response.text().trim().toUpperCase();
    console.log("Moderation response:", response);

    return response === "APPROVED" ? "approved" : "flagged";
  } catch (error) {
    console.error("Error in content moderation:", error);
    throw error;
  }
}

app.post("/moderate-question", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const moderationResult = await moderateContent(text);
    res.json({ status: moderationResult });
  } catch (error) {
    console.error("Error in /moderate-question:", error);
    res.status(500).json({ error: "Failed to moderate content" });
  }
});

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
