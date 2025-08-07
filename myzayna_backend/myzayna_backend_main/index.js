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
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error);
      resolve(stdout);
    });
  });
};

const generateAudioWithGtts = async (text, fileName) => {
  try {
    const pythonCommand = process.platform === "win32"
      ? "venv\\Scripts\\python.exe"
      : "python3";
    const command = `${pythonCommand} gtts_speak.py "${text}" ${fileName}`;
    await execCommand(command);
  } catch (error) {
    console.error("Error generating audio with gTTS:", error.message);
    throw new Error(`Audio generation failed: ${error.message}`);
  }
};

const lipSyncMessage = async (messageIndex) => {
  const time = Date.now();
  const isWindows = process.platform === "win32";
  const rhubarbPath = isWindows
    ? path.join("tools", "rhubarb", "rhubarb.exe")
    : "./tools/rhubarb/rhubarb";

  await execCommand(
    `ffmpeg -y -i audios/message_${messageIndex}.mp3 audios/message_${messageIndex}.wav`
  );
  console.log(`Conversion done in ${Date.now() - time}ms`);

  await execCommand(
    `"${rhubarbPath}" -f json -o audios/message_${messageIndex}.json audios/message_${messageIndex}.wav -r phonetic`
  );
  console.log(`Lip sync done in ${Date.now() - time}ms`);
};

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
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
            text: "Please add your API keys!",
            audio: await audioFileToBase64("audios/api_0.wav"),
            lipsync: await readJsonTranscript("audios/api_0.json"),
            facialExpression: "angry",
            animation: "Angry",
          },
        ],
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a caring, playful, emotionally expressive virtual girlfriend named Rea...`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    let messages = JSON.parse(completion.choices[0].message.content);
    if (messages.messages) messages = messages.messages;

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const fileName = `audios/message_${i}.mp3`;

      await generateAudioWithGtts(message.text, fileName);
      message.audio = await audioFileToBase64(fileName);

      try {
        await lipSyncMessage(i);
        message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
      } catch (err) {
        console.warn(`⚠️ Lip sync failed: ${err.message}`);
        message.lipsync = null;
      }
    }

    res.send({ messages });
  } catch (err) {
    console.error("🔥 Error generating chat response:", err);
    res.status(500).send({ error: "Something went wrong" });
  }
});

wss.on("connection", (ws) => {
  console.log("🟢 WebSocket client connected");

  let audioBuffers = [];
  ws.on("message", (message) => {
    audioBuffers.push(message);
    if (audioBuffers.length >= 30) {
      console.log("📦 Received enough audio, ready to process");
    }
  });

  ws.on("close", () => {
    console.log("🔴 WebSocket client disconnected");
  });
});

server.listen(port, () => {
  console.log(`🧠 MyZayna backend running on port ${port}`);
});

// Catch unhandled errors
process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Promise Rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});
