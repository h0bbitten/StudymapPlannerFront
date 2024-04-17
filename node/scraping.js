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
    if (error.code !== 'Error') {
      console.error('Error reading file:', error);
      return;
    }
  }

  // scrape hvis forceUpdate er true ELLER hvis url ikke er scraped før
  if (!forceUpdate && existingData.hasOwnProperty(url)) {
    // skip hvis url er scraped uden log
    return;
  }

  // start en ny browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Åben linket, networkkidle0 hører under puppeteer, fungerer således at når "network har været idle i 500 ms",
  // antag navigation som færdiggjort, sikrer at siden er loadet ordentligt
  await page.goto(url, { waitUntil: 'networkidle0' });

  // hent danske titel og ECTS point ved at finde <td> elementerne og nedhent teksten derimellem
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

  // luk siden og browseren
  await page.close();
  await browser.close();

  // opdater data i txt filen hvis det er en ny URL eller hvis forceUpdate tages i brug.
  existingData[url] = { title: `Title: ${data.titleValue}`, ects: `ECTS Points: ${data.ectsValue}` };
  const newDataArray = Object.entries(existingData).map(([url, { title, ects }]) => `${url}, ${title}, ${ects}`);
  await fs.writeFile(filePath, newDataArray.join('\n'));

  console.log(data.titleValue, 'ECTS:', data.ectsValue);
  return Number(data.ectsValue);
}