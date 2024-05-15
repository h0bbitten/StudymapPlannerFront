export default function exportCalendarFunction() {
    Export();
}

function Export() {
    console.log('Starting script...');

    const fs = require('fs');
    const path = require('path');
    const ical = require('ical-generator');

    console.log('Reading JSON file...');
    const dataPath = path.join(__dirname, '../database/147291.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log('Creating calendar...');
    const cal = ical({ name: 'Course Schedule' });

    console.log('Extracting schedule information...');
    data.courses.forEach(course => {
    course.contents.forEach(module => {
        if (module.summary) {
            const summary = module.summary;
            const startTimeMatch = summary.match(/startTime:\s*([^\s,]+)/);
            const endTimeMatch = summary.match(/endTime:\s*([^\s,]+)/);

            if (startTimeMatch && endTimeMatch) {
                    const startTime = new Date(startTimeMatch[1]);
                    const endTime = new Date(endTimeMatch[1]);
                    const title = module.name || 'No Title';

                    console.log(`Adding event: ${title} from ${startTime} to ${endTime}`);

                    // Add event to the calendar
                    cal.createEvent({
                        start: startTime,
                        end: endTime,
                        summary: title
                    });
                }
            }
        });
    });

    console.log('Saving iCal file...');
    const outputPath = path.join(__dirname, 'schedule.ics');
    fs.writeFileSync(outputPath, cal.toString());

    console.log('iCal file created successfully:', outputPath);
}
