import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';

export default Webscraper;

// path til filen hvor scrapet data vil blive gemt
const filePath = 'database/courseDetails.txt';

// async tillader brugen af await funktionen,
// hvormed vi kan afvente til en handling er udført med at fortsætte funktionen
async function Webscraper(url, forceUpdate = false) {
  // check om der er allerede eksisterende data fra hjemmesiden gemt i filen
  const existingData = {};
  try {
    // filecontent er en string, vi afventer som filen læses, filepath leder til courseDetails.txt,
    // utf8 er tekstsprog og sikrer at filen bliver læst som teksstreng og ikke som tal-data
    const fileContent = await fs.readFile(filePath, { encoding: 'utf8' });
    // tag tekstindholdet og indel det i kategorierne URL, Titel og ECTS, adskilt af kommaer
    fileContent.split('\n').forEach((line) => {
      const [url, title, ects] = line.split(', ');
      existingData[url] = { title, ects };
    });
    // fejlbesked i tilfælde af fejl urelateret til om filen eksisterer
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error reading file:', error);
      return;
    }
  }

    // Initialize browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    for (let url of urls) {
      if (!forceUpdate && existingData.hasOwnProperty(url)) {
        console.log(`Skipping ${url}, already scraped.`);
        continue;
      }
  
      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle0' });
  
      // Scrape the data
      const data = await page.evaluate(() => {
        const tdElements = Array.from(document.querySelectorAll('td'));
        let titleIndex = tdElements.findIndex((td) => td.textContent.includes('Danish title'));
        if (titleIndex === -1) {
          titleIndex = tdElements.findIndex((td) => td.textContent.includes('English title'));
        }
        const ectsIndex = tdElements.findIndex((td) => td.textContent.includes('ECTS'));
  
        const titleValue = titleIndex !== -1 ? tdElements[titleIndex + 1].textContent.trim() : 'title not found';
        const ectsValue = ectsIndex !== -1 ? tdElements[ectsIndex + 1].textContent.trim() : 'ECTS points not found';
  
        return { titleValue, ectsValue };
      });
  
      // Store the new or updated data
      existingData[url] = { title: `Title: ${data.titleValue}`, ects: `ECTS Points: ${data.ectsValue}` };
      console.log(`Scraped ${url}: ${data.titleValue}, ECTS: ${data.ectsValue}`);
    }
  
    // Close the page and browser
    await page.close();
    await browser.close();
  
    // Save the updated data to the file
    const newDataArray = Object.entries(existingData).map(([url, { title, ects }]) => `${url}, ${title}, ${ects}`);
    await fs.writeFile(filePath, newDataArray.join('\n'));
  }