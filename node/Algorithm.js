export {Algorithm, mockAlgorithm};

async function mockAlgorithm(User) {
    console.log('Calculating schedule for:', User.fullname);
    let currentTime = 1712730500;//Math.floor(Date.now() / 1000);
    const lectures = [];
    User.courses.forEach(course => {
      if (course.chosen === true) {
        course.contents.forEach(lecture => {
          if (lecture.chosen === true) {
            let startTime = currentTime;
            let min = 1;
            let max = 7;
            let endTime = currentTime + (Math.random() * (max - min) + min) * 60 * 60;
      
            let timeBlock = {
              title: course.fullname,
              description: lecture.name,
              startTime: startTime,
              endTime: endTime,
              color: course.color
            };
      
            currentTime = endTime + (15 * 60);
      
            lectures.push(timeBlock);
          }
        });
      }
      
    });
    return lectures;  
}

class Course {
    constructor(queue, size, name, examDate, ECTS, subjects) {
        //Course info skal fetches her
        this.queue = [];
        this.name = User.name;
        this.examDate = examDate;
        this.ECTS = User.ECTS;
        this.subjects = User.subjects;
        console.log(this.queue);
        console.log(this.ECTS);
    }
}

class studyBlock {
    constructor(date, duration) {
        this.date = date;
        this.duration = duration;
    }
}

function enqueue(value, priority, size)
{
    size++;

    this.queue[size].value = value;
    this.queue[size].priority = priority;

}
function peek(value, priority)
{
    let highestPriority = Number.MIN_SAFE_INTEGER;
    let index = -1

    for (var i = 0; i <= this.size; i++) 
    {
        // If priority is same choose
        // the element with the
        // highest value
        if (highestPriority == this.queue[i].priority && index > -1
            && this.queue[index].value < this.queue[i].value) 
        {
            highestPriority = this.queue[i].priority;
            index = i;
        }
        
        
    }

    return index;
}

function dequeue()
{
    let index = peek();
 
    // Shift the element one index before
    // from the position of the element
    // with highest priority is found
    for (var i = index; i < this.size; i++) 
    {
        this.queue[i] = this.queue[i + 1];
    }
 
    // Decrease the size of the
    // priority queue by one
    this.size--;
}

function Algorithm(User) {

User.courses.forEach(course => {
    let courseSomething = new Course(course.queue, course.size, course.name, course.examDate, course.ECTS, course.subjects);

    course.contents.forEach((lecture, i) => {
        courseSomething.queue.push( {name: lecture.name, priority: i} );
    } );
    
    enqueue(courseSomething, courseSomething.priority, courseSomething.length);
});
console.log(User.queue);
return User.queue;
}