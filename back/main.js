import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 5000;

// Middleware to parse JSON requests
app.use(express.json());

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
      model: "gpt-3.5-turbo", // Use the correct model name
      messages: [{ role: "user", content: prompt }], // Use the messages parameter
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
      res.json({ response: botResponse });
    } catch (error) {
      res.status(500).send("Error processing request");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});