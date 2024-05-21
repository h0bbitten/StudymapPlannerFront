import ICAL from 'ical.js';

export default generateIcal;

function generateIcal(events) {
  console.log('Creating calendar...');
  try {
    const calendar = new ICAL.Component(['vcalendar', [], []]);

    console.log('Extracting schedule information...');
    events.forEach((event) => {
      const vevent = new ICAL.Component('vevent');
      vevent.addPropertyWithValue('summary', event.title);
      vevent.addPropertyWithValue('description', event.description);
      const icalStartTime = new ICAL.Time();
      icalStartTime.fromUnixTime(event.startTime / 1000);
      const icalEndTime = new ICAL.Time();
      icalEndTime.fromUnixTime(event.endTime / 1000);
      vevent.addPropertyWithValue('dtstart', icalStartTime.toString());
      vevent.addPropertyWithValue('dtend', icalEndTime.toString());
      vevent.addPropertyWithValue('url', event.courseURL);

      calendar.addSubcomponent(vevent);
    });

    console.log('iCal file created successfully:');

    const calendarString = calendar.toString();
    return calendarString;
  } catch (err) {
    console.error('Error creating iCal file:', err);
    return null;
  }
}
