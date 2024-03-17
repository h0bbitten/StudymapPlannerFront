    // Fetch the iCal data
    $.ajax({
      url: "https://www.moodle.aau.dk/local/planning/ical.php?fid=3249",
      dataType: "text",
      success: function(data) {
        // Parse the iCal data
        var schedule = parseICal(data);
  
        // Display the schedule
        displaySchedule(schedule);
      },
      error: function() {
        console.log("Failed to fetch iCal data.");
      }
    }); // Add a comma here

    $.ajax({
      url: "https://www.moodle.aau.dk/local/planning/ical.php?fid=3249",
      dataType: "text",
      headers: {
        "Authorization": "3528346e21ed517bf282eb4e46d35610"
      },
      success: function(data) {
        // Parse the iCal data
        var schedule = parseICal(data);

        // Display the schedule
        displaySchedule(schedule);
      },
      error: function() {
        console.log("Failed to fetch iCal data.");
      }
    });

    function parseICal(data) {
      var schedule = [];
  
      // Split the iCal data into lines
      var lines = data.split("\n");
  
      // Loop through the lines
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
  
        // Check if the line is an event
        if (line.startsWith("BEGIN:VEVENT")) {
          // Create a new event object
          var event = {};
  
          // Loop through the lines of the event
          while (i < lines.length && !lines[i].startsWith("END:VEVENT")) {
            // Get the line
            var line = lines[i];
  
            // Check if the line is a summary
            if (line.startsWith("SUMMARY:")) {
              // Get the summary
              var summary = line.substring(8);
  
              // Add the summary to the event
              event.summary = summary;
            }
  
            // Check if the line is a start date
            if (line.startsWith("DTSTART;")) {
              // Get the start date
              var startDate = line.substring(17, 25);
  
              // Add the start date to the event
              event.startDate = startDate;
            }
  
            // Check if the line is an end date
            if (line.startsWith("DTEND;")) {
              // Get the end date
              var endDate = line.substring(15, 23);
  
              // Add the end date to the event
              event.endDate = endDate;
            }
  
            // Move to the next line
            i++;
          }
  
          // Add the event to the schedule
          schedule.push(event);
        }
      }
  
      return schedule;
    }
  
    function displaySchedule(schedule) {
      // Get the schedule element
      var scheduleElement = $("#schedule");
  
      // Loop through the events
      for (var i = 0; i < schedule.length; i++) {
        var event = schedule[i];
  
        // Create a new event element
        var eventElement = $("<div>");
  
        // Add the summary to the event element
        eventElement.append("<h3>" + event.summary + "</h3>");
  
        // Add the start and end date to the event element
        eventElement.append("<p>" + event.startDate + " - " + event.endDate + "</p>");
  
        // Add the event element to the schedule
        scheduleElement.append(eventElement);
      }
    }
  