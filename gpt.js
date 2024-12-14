import dotenv from 'dotenv';
import OpenAI from 'openai';
import { exampleSearch } from './test.js'; // Import the search result from test.js

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function performRAG() {
  try {
    // Get the search result from exa
    const exaResult = await exampleSearch("The latest ai and udpates released today");

    // Create the system and user prompt using the search result
    const systemPrompt = "You are a helpful AI assistant. Summarize the given search results about AI startups.";
    const userMessage = "Please provide a brief summary of the latest ai and udpates released today";

    // Call OpenAI with the search results from Exa
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Search results: ${JSON.stringify(exaResult)}\n\n${userMessage}` }
      ]
    });

    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

performRAG();
