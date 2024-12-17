import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

async function processFilteredNews(filePath = 'filtered_news.json') {
    try {
        if (!fsSync.existsSync(filePath)) {
            console.error(`File ${filePath} does not exist.`);
            return;
        }

        const fileContent = await fs.readFile(filePath, 'utf-8');

        // Check if content is JSON or plain text
        let rawContent;
        try {
            const parsedContent = JSON.parse(fileContent);
            rawContent = await processWithChatGPT(parsedContent);
        } catch {
            rawContent = fileContent.trim();
        }

        if (!rawContent || typeof rawContent !== "string") {
            console.error("Processed results are invalid or empty.");
            return;
        }

        // Split content into sections using headers like "Useful for Developers"
        const sections = rawContent.split(/\n\n(?=### )/); // Split at each '### ' line
        let formattedOutput = '';

        sections.forEach((section) => {
            if (section.trim()) {
                const lines = section.split('\n');
                const header = lines.shift().replace(/###\s*/, '').trim(); // Remove "###" and trim

                formattedOutput += `${header}\n`;
                formattedOutput += `${'-'.repeat(header.length)}\n\n`;

                lines.forEach((line) => {
                    formattedOutput += line.replace(/\\n/g, '\n').trim() + '\n';
                });

                formattedOutput += '\n';
            }
        });

        const outputPath = path.resolve('processed_results.txt');
        await fs.writeFile(outputPath, formattedOutput, 'utf-8');
        console.log(`Processed results saved to '${outputPath}'.`);
    } catch (error) {
        console.error("Error processing filtered news:", error);
    }
}

// Mock processWithChatGPT function (replace this with your real implementation)
async function processWithChatGPT(input) {
    // For simplicity, return the input content as plain text
    return input;
}

processFilteredNews();
