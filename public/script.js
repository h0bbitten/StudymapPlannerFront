// Fetch the iCal data from your own server endpoint using fetch API
fetch("http://localhost:3000/ical")
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(data => {
    const schedule = parseICal(data);
    displaySchedule(schedule);
  })
  .catch(error => {
    console.error("Failed to fetch iCal data:", error);
  });

function parseICal(data) {
  return data.split("\n").reduce((schedule, line, i, lines) => {
    if (line.startsWith("BEGIN:VEVENT")) {
      let event = {};
      for (; i < lines.length && !lines[i].startsWith("END:VEVENT"); i++) {
        if (lines[i].startsWith("SUMMARY:")) event.summary = lines[i].substring(8);
        if (lines[i].startsWith("DTSTART;")) event.startDate = lines[i].substring(17, 25);
        if (lines[i].startsWith("DTEND;")) event.endDate = lines[i].substring(15, 23);
      }
      schedule.push(event);
    }
    return schedule;
  }, []);
}

function displaySchedule(schedule) {
  schedule.forEach(event => {
    $("#schedule").append($("<div>").append(`<h3>${event.summary}</h3><p>${event.startDate} - ${event.endDate}</p>`));
  });
}
