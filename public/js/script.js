// Fetch the iCal data from your own server endpoint using fetch API
let courses; //Array af kurser


function getCourses(token) {
  fetch(`http://localhost:3000/getcourses?token=${token}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    courses = data.courses;
    console.log(typeof(courses));
    console.log(courses);
    courses.forEach(course => {
      displayCourses(course);
      console.log(course.id);
      getCourse(course.id);
    })
  })
  .then(() => {
/*     for (const key in courses.courses) {
      console.log(key.id);
      getCourse(key.id);
    } */
  })
  .catch(error => {
    console.error("Failed to retrieve courses:", error);
  });
}

function getCourse(id) {
  console.log(`http://localhost:3000/getcourse?token=${token}&id=${id}`);
  fetch(`http://localhost:3000/getcourse?token=${token}&id=${id}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error("Failed to retrieve courses:", error);
  });
}


function displayCourses(course) {
  $("#schedule").append($(`<div id="${course.id}">`).append(`<h3>${course.fullnamedisplay}</h3><p>${new Date(course.startdate * 1000).toUTCString()} - ${new Date(course.enddate * 1000).toUTCString()}</p>`));
}

let token = sessionStorage.getItem("token");
getCourses(token);
