// Fetch the iCal data from your own server endpoint
$.ajax({
  url: "http://localhost:3000/ical", // Update to use your server endpoint
  dataType: "text",
  success: function(data) {
    var schedule = parseICal(data);
    displaySchedule(schedule);
  },
  error: function() {
    console.log("Failed to fetch iCal data.");
  }
});

function parseICal(data) {
  var schedule = [];
  var lines = data.split("\n");
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.startsWith("BEGIN:VEVENT")) {
      var event = {};
      while (i < lines.length && !lines[i].startsWith("END:VEVENT")) {
        var line = lines[i];
        if (line.startsWith("SUMMARY:")) {
          event.summary = line.substring(8);
        }
        if (line.startsWith("DTSTART;")) {
          event.startDate = line.substring(17, 25);
        }
        if (line.startsWith("DTEND;")) {
          event.endDate = line.substring(15, 23);
        }
        i++;
      }
      schedule.push(event);
    }
  }
  return schedule;
}

function displaySchedule(schedule) {
  var scheduleElement = $("#schedule");
  for (var i = 0; i < schedule.length; i++) {
    var event = schedule[i];
    var eventElement = $("<div>");
    eventElement.append("<h3>" + event.summary + "</h3>");
    eventElement.append("<p>" + event.startDate + " - " + event.endDate + "</p>");
    scheduleElement.append(eventElement);
  }
}
