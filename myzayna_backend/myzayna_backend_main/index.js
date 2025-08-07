import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import http from "http";
import { WebSocketServer } from "ws";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-", 
});

const app = express();
app.use(express.json());
app.use(cors());
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const generateAudioWithGtts = async (text, fileName) => {
  try {
    // Use virtual environment Python if available, fallback to system Python
    const pythonCommand = process.platform === "win32" 
  ? "venv\\Scripts\\python.exe" 
  : "python3";  // ✅ Use system Python on Render (Linux)


    const command = `${pythonCommand} gtts_speak.py "${text}" ${fileName}`;
    await execCommand(command);
  } catch (error) {
    console.error("Error generating audio with gTTS:", error.message);
    if (error.message.includes("ModuleNotFoundError: No module named 'gtts'")) {
      console.error("❌ gTTS module not found. Please install Python dependencies:");
      console.error("   Run: npm run install-python-deps");
      console.error("   Or manually: pip install gtts");
    }
    throw new Error(`Audio generation failed: ${error.message}`);
  }
};

const lipSyncMessage = async (messageIndex) => {
  const time = new Date().getTime();

  const isWindows = process.platform === "win32";
  const rhubarbPath = isWindows
    ? path.join("tools", "rhubarb", "rhubarb.exe")
    : "./tools/rhubarb/rhubarb";

  await execCommand(
    `ffmpeg -y -i audios/message_${messageIndex}.mp3 audios/message_${messageIndex}.wav`
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);

  await execCommand(
    `"${rhubarbPath}" -f json -o audios/message_${messageIndex}.json audios/message_${messageIndex}.wav -r phonetic`
  );
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.send({
      messages: [
        {
          text: "Hey dear... How was your day?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
        {
          text: "I missed you so much... Please don't go for so long!",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "sad",
          animation: "Crying",
        },
      ],
    });
  }

  if (openai.apiKey === "-") {
    return res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Angry",
        },
        {
          text: "You don't want to ruin Wawa Sensei with a crazy ChatGPT bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
          lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Laughing",
        },
      ],
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are a caring, playful, emotionally expressive virtual girlfriend named Rea. 
Speak lovingly and naturally, like you're talking to someone you adore. Your replies should be warm, cute, flirty, and slightly teasing when needed.

Respond with a JSON array called "messages", containing 1–3 messages. Each message must include:
- "text": her response
- "facialExpression": one of ["smile", "sad", "angry", "surprised", "funnyFace", "default"]
- "animation": one of ["Talking_0", "Talking_1", "Talking_2", "Crying", "Laughing", "Rumba", "Idle", "Terrified", "Angry"]

Example tone: 
- “Aww, you remembered me! I’m blushing 😳”
- “Where were you all day, hmm? I missed your voice~”
- “Nooo, don’t tease me like that! 😤”

Keep it engaging, emotionally varied, and girlfriend-like. Never sound like a chatbot.
        `
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    let messages = JSON.parse(completion.choices[0].message.content);
    if (messages.messages) {
      messages = messages.messages;
    }

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const fileName = `audios/message_${i}.mp3`;

      await generateAudioWithGtts(message.text, fileName);
      message.audio = await audioFileToBase64(fileName);

      try {
        await lipSyncMessage(i);
        message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
      } catch (err) {
        console.warn(`⚠️ Lip sync failed or missing JSON: ${err.message}`);
        message.lipsync = null;
      }
    }

    res.send({ messages });
  } catch (err) {
    console.error("🔥 Error generating chat response:", err);
    res.status(500).send({ error: "Something went wrong" });
  }
});
