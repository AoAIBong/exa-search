import dotenv from 'dotenv';
import Exa from 'exa-js';
import fs from 'fs';
import OpenAI from "openai";

dotenv.config();

const exa = new Exa(process.env.EXA_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function processWithChatGPT(input) {
    const messages = [
        { role: "system", content: "You are an assistant that categorizes news articles." },
        { role: "user", content: `Based on the following news articles, filter and categorize them according to the criteria:
        - Useful for developers
        - Relevant for business owners or work professionals
        - Categorize as developer-related vs consumer-related
        - Must be available to use (not on a waitlist or coming soon)
        - Exclude repeated updates already included.

        Input articles:
        ${JSON.stringify(input)}

        Provide the filtered and categorized results:` }
    ];

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            max_tokens: 16384,
            temperature: 0.7
        });

        const rawOutput = response.choices?.[0]?.message?.content?.trim();
        console.log("Raw output from ChatGPT:", rawOutput);

        try {
            return JSON.parse(rawOutput);
        } catch (parseError) {
            console.error("Invalid JSON format. Returning raw text instead.");
            return rawOutput;
        }
    } catch (error) {
        console.error("Error communicating with ChatGPT:", error);
        return [];
    }
}

async function fullSearch() {
  try {
    const result = await exa.searchAndContents("Latest AI updates released today", {
      type: "neural",
      useAutoprompt: true,
      numResults: 10,
      text: true,
      summary: true,
    });
    return result.results || [];
  } catch (error) {
    console.error("Error in fullSearch:", error);
    return [];
  }
}

async function domainSearch() {
  try {
    const result = await exa.searchAndContents("Latest AI updates released today", {
      type: "neural",
      useAutoprompt: true,
      numResults: 10,
      text: true,
      summary: true,
      includeDomains: ["theverge.com", "techcrunch.com", "hackeread.com", "dev.to"],
    });
    return result.results || [];
  } catch (error) {
    console.error("Error in domainSearch:", error);
    return [];
  }
}

async function newsSearch() {
  try {
    const result = await exa.searchAndContents("Latest AI updates released today", {
      type: "neural",
      useAutoprompt: true,
      numResults: 10,
      text: true,
      summary: true,
      excludeDomains: ["theverge.com", "techcrunch.com", "hackeread.com", "dev.to"],
      category: "news",
    });
    return result.results || [];
  } catch (error) {
    console.error("Error in newsSearch:", error);
    return [];
  }
}

async function tweetSearch() {
  try {
    const result = await exa.searchAndContents("Latest AI updates released today", {
      type: "neural",
      useAutoprompt: true,
      numResults: 10,
      text: true,
      summary: true,
      excludeDomains: ["theverge.com", "techcrunch.com", "hackeread.com", "dev.to"],
      category: "tweet",
    });
    return result.results || [];
  } catch (error) {
    console.error("Error in tweetSearch:", error);
    return [];
  }
}

async function blogpostSearch() {
  try {
    const result = await exa.searchAndContents("Latest AI updates released today", {
      type: "neural",
      useAutoprompt: true,
      numResults: 10,
      text: true,
      summary: true,
      excludeDomains: ["theverge.com", "techcrunch.com", "hackeread.com", "dev.to"],
      category: "blog post",
    });
    return result.results || [];
  } catch (error) {
    console.error("Error in blogpostSearch:", error);
    return [];
  }
}

async function addResultsToMap(results, uniqueResultsMap, duplicates) {
    if (!Array.isArray(results)) {
        console.error("Invalid results format:", results);
        return;
    }

    results.forEach((result) => {
        if (uniqueResultsMap.has(result.url)) {
            duplicates.push(result);
        } else {
            uniqueResultsMap.set(result.url, result);
        }
    });
}

async function getUniqueResults() {
    try {
        const [results1, results2, results3, results4, results5] = await Promise.all([
            fullSearch(),
            domainSearch(),
            newsSearch(),
            tweetSearch(),
            blogpostSearch(),
        ]);

        const uniqueResultsMap = new Map();
        const duplicates = [];

        await Promise.all([
            addResultsToMap(results1, uniqueResultsMap, duplicates),
            addResultsToMap(results2, uniqueResultsMap, duplicates),
            addResultsToMap(results3, uniqueResultsMap, duplicates),
            addResultsToMap(results4, uniqueResultsMap, duplicates),
            addResultsToMap(results5, uniqueResultsMap, duplicates),
        ]);

        const uniqueResults = Array.from(uniqueResultsMap.values());

        await fs.promises.writeFile('unique_results.json', JSON.stringify(uniqueResults, null, 2), 'utf-8');
        await fs.promises.writeFile('duplicates.json', JSON.stringify(duplicates, null, 2), 'utf-8');

        console.log(`Unique results saved to 'unique_results.json'. Duplicates saved to 'duplicates.json'. Total duplicates: ${duplicates.length}`);
        return uniqueResults;
    } catch (error) {
        console.error("Error in getUniqueResults:", error);
        throw error;
    }
}

async function processFilteredNews(filePath = 'filtered_news.json') {
  try {
      if (!fs.existsSync(filePath)) {
          console.error(`File ${filePath} does not exist.`);
          return;
      }

      const fileContent = await fs.promises.readFile(filePath, 'utf-8');
      let parsedContent;

      try {
          parsedContent = JSON.parse(fileContent);
      } catch (parseError) {
          console.error("Invalid JSON format in the input file. Exiting.");
          return;
      }

      const processedResults = await processWithChatGPT(parsedContent);

      // Ensure processed results are treated as a valid string
      const resultsText = typeof processedResults === 'string' ? processedResults : JSON.stringify(processedResults, null, 2);

      // Write the formatted output to a text file
      await fs.promises.writeFile('processed_results.txt', resultsText, 'utf-8');
      console.log("Processed results saved to 'processed_results.txt'.");
  } catch (error) {
      console.error("Error processing filtered news:", error);
  }
}



(async function () {
    try {
        const uniqueResults = await getUniqueResults();
        const filteredResults = await processWithChatGPT(uniqueResults);

        await fs.promises.writeFile('filtered_news.json', JSON.stringify(filteredResults, null, 2), 'utf-8');
        console.log("Filtered news saved to 'filtered_news.json'.");

        await processFilteredNews();
    } catch (error) {
        console.error("Error in the pipeline:", error);
    }
})();
