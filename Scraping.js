const puppeteer = require('puppeteer');
const fs = require('fs').promises;

//tilføj links til fag fundet på https://moduler.aau.dk/
const urls = [
  'https://moduler.aau.dk/course/2023-2024/DSNDATFB212?lang=en-GB',
  'https://moduler.aau.dk/course/2023-2024/DSNDATFB211',
  'https://moduler.aau.dk/course/2023-2024/DSNDATFB105',
  'https://moduler.aau.dk/course/2022-2023/DSNIDAK122',
  'https://moduler.aau.dk/course/2023-2024/DSNIXDB111'
];

//path til filen hvor scrapet data vil blive gemt
const filePath = 'courseDetails.txt';

//async tillader brugen af await funktionen, hvormed vi kan afvente til en handling er udført med at fortsætte funktionen
(async () => {

  // check om der er allerede eksisterende data fra hjemmesiden gemt i filen
  let existingData = {};
  try {
    //filecontent er en string, vi afventer som filen læses, filepath leder til courseDetails.txt, utf8 er tekstsprog og sikrer at filen bliver læst som teksstreng og ikke som tal-data
    const fileContent = await fs.readFile(filePath, 'utf8');
    //tag tekstindholdet og indel det i kategorierne URL, Titel og ECTS, adskilt af kommaer
    fileContent.split('\n').forEach(line => {
      const [url, title, ects] = line.split(', ');
      existingData[url] = { title, ects };
    });
//fejlbesked i tilfælde af fejl urelateret til om filen eksisterer
  } catch (error) {
    if (error.code !== 'Error') {
      console.error('Error reading file:', error);
      return;
    }
    // 
  }

  // start en ny browser
  const browser = await puppeteer.launch();

  for (const url of urls) {
    const page = await browser.newPage();

    // Åben linket, networkkidle0 hører under puppeteer, fungerer således at når "network har været idle i 500 ms", antag navigation som færdiggjort, sikrer at siden er loadet ordentligt
    await page.goto(url, { waitUntil: 'networkidle0' });

    // hent danske titel og ECTS point ved at finde <td> elementerne og nedhent teksten derimellem
    const data = await page.evaluate(() => {
      const tdElements = Array.from(document.querySelectorAll('td'));
      const titleIndex = tdElements.findIndex(td => td.textContent.includes('Danish title'));
      const ectsIndex = tdElements.findIndex(td => td.textContent.includes('ECTS'));

      const titleValue = titleIndex !== -1 ? tdElements[titleIndex + 1].textContent.trim() : 'Danish title not found';
      const ectsValue = ectsIndex !== -1 ? tdElements[ectsIndex + 1].textContent.trim() : 'ECTS points not found';

      return { titleValue, ectsValue };
    });

    // luk siden
    await page.close();

    // opdater data i txt filen hvis ECTS point har ændret sig (indser nu dette er ret unødvendigt, hvis ECTS pointene ændrer sig, har faget nok også ændret sig og hører under en ny URL)
    if (!existingData[url] || existingData[url].ects !== `ECTS Points: ${data.ectsValue}`) {
      existingData[url] = { title: `Danish Title: ${data.titleValue}`, ects: `ECTS Points: ${data.ectsValue}` };
    }
  }

  // luk browseren
  await browser.close();

  // konverter opdateret data fra et objekt til et string format så det kan skrives ind i txt filen
  const newDataArray = Object.entries(existingData).map(([url, { title, ects }]) => `${url}, ${title}, ${ects}`);
  //skriv ny eller opdateret information ind i txt filen
  await fs.writeFile(filePath, newDataArray.join('\n'));
})();
