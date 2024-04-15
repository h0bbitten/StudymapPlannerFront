import Webscraper from './scraping.js';
import { promises as fs } from 'fs';

const filePath = 'database/courseDetails.txt'; // Adjust the path if necessary

async function runDailyScraping() {
  try {
    // læs eksisterende data fra filen
    const fileContent = await fs.readFile(filePath, { encoding: 'utf8' });
    const urls = fileContent.split('\n')
                           .filter(line => line.trim())  // Filter empty lines
                           .map(line => line.split(', ')[0]); // træk kun URL'en ud

    for (const url of urls) {
      console.log(`Updating: ${url}`);
      await Webscraper(url, true); // Pass true to force update
    }

    console.log('All URLs have been updated.');
  } catch (error) {
    console.error('Failed to read URLs from file:', error);
  }
}

runDailyScraping().catch(console.error);
