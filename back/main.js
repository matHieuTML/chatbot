import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import './db.js';
import { spamForm } from './formSpammer.js';
import ChatMessage from './model/ChatMessage.js';
import SowDocument from './model/SowDocument.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

const port = 5000;

// Define a simple route
app.get('/', (req, res) => {
    res.send('Hello!');
});

// Initialize the OpenAI API client directly with the API key
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Function to get a response from the OpenAI API
async function getChatbotResponse(prompt) {
  if (!prompt) {
    throw new Error("Prompt cannot be null or undefined");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error fetching response from OpenAI:", error);
    throw error;
  }
}

// Endpoint to handle chat POST requests
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).send("Message is required");
  }

  try {
    const botResponse = await getChatbotResponse(userMessage);
    const userChatMessage = new ChatMessage({
      message: userMessage,
      sender: 'User',
    });
    await userChatMessage.save();
    const botChatMessage = new ChatMessage({
      message: botResponse,
      sender: 'Bot',
    });
    await botChatMessage.save();
    res.json({ userMessage, botResponse });
  } catch (error) {
    console.error("Error processing chat request:", error);
    res.status(500).send("Error processing request");
  }
});

// Endpoint to handle SoW POST requests
function isValidSoW(sow) {
  // List of required fields
  const requiredFields = ['projectTitle', 'projectDescription', 'deliverables', 'timeline', 'milestones'];

  // Check for presence and non-emptiness of required fields
  for (const field of requiredFields) {
    if (!sow.hasOwnProperty(field) || sow[field] === '') {
      console.log(`Missing or empty required field: ${field}`);
      return false;
    }
  }

  // Validate that 'timeline' contains 'startDate' and 'endDate' and they are correctly formatted
  if (typeof sow.timeline !== 'object' || !sow.timeline.startDate || !sow.timeline.endDate || !Date.parse(sow.timeline.startDate) || !Date.parse(sow.timeline.endDate)) {
    console.log('Invalid timeline format');
    return false;
  }

  // Validate 'deliverables' structure and due dates
  if (!Array.isArray(sow.deliverables) || sow.deliverables.some(deliverable => typeof deliverable !== 'object' || !Date.parse(deliverable.dueDate))) {
    console.log('Invalid deliverables format or due date');
    return false;
  }

  // Validate 'milestones' structure and dates
  if (!Array.isArray(sow.milestones) || sow.milestones.some(milestone => typeof milestone !== 'object' || !Date.parse(milestone.date))) {
    console.log('Invalid milestones format or date');
    return false;
  }

  // Passes all checks
  return true;
}

// Adjusted endpoint to include validation
app.post('/send-sow', async (req, res) => {
  const { briefDescription } = req.body;

  if (!briefDescription) {
    return res.status(400).send("Brief description is required");
  }

  let prompt = `Given a brief project description: "${briefDescription}", create a detailed Statement of Work (SoW) in JSON format including sections for projectTitle, projectDescription, deliverables, timeline, and milestones. Please format the response as a JSON object.`;

  try {
    let responseString = await getChatbotResponse(prompt);

    // Log the original response string
    console.log("Original OpenAI response:", responseString);

    // Remove Markdown code block syntax (```json and ```) to ensure it's clean JSON
    responseString = responseString.replace(/```json|```/g, '').trim();

    // Log the cleaned response string
    console.log("Cleaned OpenAI response:", responseString);

    let detailedSoW;
    try {
      detailedSoW = JSON.parse(responseString);
    } catch (error) {
      console.error("Error parsing response string to JSON:", error);
      return res.status(500).send("Received response is not a valid JSON string.");
    }

    if (!isValidSoW(detailedSoW)) {
      return res.status(400).send("Generated SoW does not meet the required structure or content standards.");
    }

    const sowDocument = new SowDocument({ sowData: detailedSoW });
    await sowDocument.save();

    res.json({ message: "Statement of Work generated and saved successfully", sowDocument });
  } catch (error) {
    console.error("Error processing SoW request:", error);
    res.status(500).send("Error processing request");
  }
});

spamForm(10, openai); 

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});