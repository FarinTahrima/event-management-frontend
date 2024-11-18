import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { HfInference } from '@huggingface/inference';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

let sentimentHistory = [];
const messageIdSet = new Set();
app.post('/analyze-sentiment', async (req, res) => {
  const { message, messageId } = req.body;
  if (messageIdSet.has(messageId)) {
    return res.status(409).json({ error: "Duplicate message ID" });
  }
  
  try {
    const sentiment = await hf.textClassification({
      model: 'nlptown/bert-base-multilingual-uncased-sentiment',
      inputs: message,
    });

    const sentimentData = {
      messageId,
      message,
      timestamp: new Date().toISOString(),
      sentiment: {
        label: sentiment[0].label,
        score: parseFloat(sentiment[0].label.split(' ')[0])
      }
    };
    messageIdSet.add(messageId);
    sentimentHistory.unshift(sentimentData);
    if (sentimentHistory.length > 100) {
      const removedItem = sentimentHistory.pop();
      if (removedItem) {
        messageIdSet.delete(removedItem.messageId);
      }
    }
    
    res.json({ sentiment: sentimentData.sentiment });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    res.status(500).json({ error: "Failed to analyze sentiment" });
  }
});

app.get('/sentiment-history', (req, res) => {
  try {
    res.json(sentimentHistory);
  } catch (error) {
    console.error("Error fetching sentiment history:", error);
    res.status(500).json({ error: "Failed to fetch sentiment history" });
  }
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 

async function generateAIContent(prompt) {
  try {
    const contextPrompt = `As a helpful AI assistant, please respond to: ${prompt}
    Keep the response concise and natural, as it will be converted to speech.`;
    
    const result = await model.generateContent(contextPrompt);
    const response = result.response.text();

    return response
      .replace(/\*\*/g, '')
      .replace(/\n\n/g, ' ')
      .replace(/\n/g, ' ')
      .trim();
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw error;
  }
}

app.post('/generate-ai', async (req, res) => {
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
    const moderationPrompt = `Please analyze the following content for appropriateness in a public Q&A setting. 
    Consider factors like hate speech, explicit content, harassment, or other inappropriate content.
    Respond with either "APPROVED" or "FLAGGED".
    
    Content to analyze: "${text}"`;
    
    const result = await model.generateContent(moderationPrompt);
    const response = result.response.text().trim().toUpperCase();
    
    return response === "APPROVED" ? "approved" : "flagged";
  } catch (error) {
    console.error("Error in content moderation:", error);
    throw error;
  }
}

app.post('/moderate-question', async (req, res) => {
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

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
