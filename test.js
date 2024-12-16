import dotenv from 'dotenv';
import Exa from 'exa-js';
import fs from 'fs';

dotenv.config();

const exa = new Exa(process.env.EXA_API_KEY);

async function fullSearch() {
  try {
    const result = await exa.searchAndContents("Latest AI updates released today", {
      type: "neural",
      useAutoprompt: true,
      numResults: 30,
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
      numResults: 30,
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
      numResults: 30,
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
      numResults: 30,
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
      numResults: 30,
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

    const addResultsToMap = (results) => {
      results.forEach((result) => {
        if (uniqueResultsMap.has(result.url)) {
          duplicates.push(result);
        } else {
          uniqueResultsMap.set(result.url, result);
        }
      });
    };

    addResultsToMap(results1);
    addResultsToMap(results2);
    addResultsToMap(results3);
    addResultsToMap(results4);
    addResultsToMap(results5);

    const uniqueResults = Array.from(uniqueResultsMap.values());

    await fs.promises.writeFile(
      'unique_results.json',
      JSON.stringify(uniqueResults, null, 2),
      'utf-8'
    );
    await fs.promises.writeFile(
      'duplicates.json',
      JSON.stringify(duplicates, null, 2),
      'utf-8'
    );

    console.log(`Unique results have been saved to 'unique_results.json'`);
    console.log(`Duplicate results have been saved to 'duplicates.json'`);
    console.log(`Total duplicate results evicted: ${duplicates.length}`);

    return uniqueResults;
  } catch (error) {
    console.error("Error in getUniqueResults:", error);
    throw error;
  }
}

getUniqueResults();




/* Based on the jsson provided please remove the redundant or the unrelated results. Below given is the 
  critersias to choose the results.
  
  - the resu;s should be related to AI updates or tools.
  - the updates or tools should be useful for business owners and developers who are looking for AI tools and updates.
  - the results should be relevant to the AI field.
  
  Based on the criteria given i also need  you to redifine the information to a json schema provided below:
  results = [
    {
      "url": "https://www.example.com/article1",(can be taken from the previous json)
      "title of update": "Article 1", (can be used from the previous josn)
      "headline of teh update": TAke the healdine of teh update from the content
      "summary": "Break down the summary from content into three bullet points", (can be taken from the previous json)
      "developer/non developer": based on the provided context carefully decide and label them as developer or non developer
      "pricing" : based on the context provided find thr pricing for the update/tool
      "helpful for work professionals" : based on the context provided find if the update/tool is helpful for work professionals
      "availability" : based on the context provided find the availability of the update/tool (waitlist , beta , public)
]
** Note that u have to refer only to the data provided and not make up or use up information from you memory. Please be concise and detailed 
** Everytime you select or deselect an update make sure to justify the decision and explain it. Then please reevaluavte based on the justification before making the final decison

*/