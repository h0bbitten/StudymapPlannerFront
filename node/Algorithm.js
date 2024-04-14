import moment from 'moment';

export { Algorithm, mockAlgorithm };

console.log('This time is on weekdayday number', moment(1712758261319).isoWeekday());

async function mockAlgorithm(User) {
  console.log('Calculating schedule for:', User.fullname);
  let currentTime = moment().valueOf();
  const lectures = [];
  User.courses.forEach((course) => {
    course.contents.forEach((lecture) => {
      let startTime = currentTime;
      let endTime = currentTime + (getRandomInt(1, 5) * 3600000);

      let timeBlock = {
        title: course.fullname,
        description: lecture.name,
        startTime: startTime,
        endTime: endTime,
        color: course.color,
      };

      currentTime = endTime + (15 * 60000);

      lectures.push(timeBlock);
    });
  });

  return lectures;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Course {
  constructor(queue, size, name, examDate, ECTS, subjects) {
    // Course info skal fetches her
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

function enqueue(value, priority, size) {
  size++;

  this.queue[size].value = value;
  this.queue[size].priority = priority;
}
function peek(value, priority) {
  let highestPriority = Number.MIN_SAFE_INTEGER;
  let index = -1;

  for (let i = 0; i <= this.size; i++) {
    // If priority is same choose
    // the element with the
    // highest value
    if (highestPriority == this.queue[i].priority && index > -1
            && this.queue[index].value < this.queue[i].value) {
      highestPriority = this.queue[i].priority;
      index = i;
    }
  }

  return index;
}

function dequeue() {
  const index = peek();

  // Shift the element one index before
  // from the position of the element
  // with highest priority is found
  for (let i = index; i < this.size; i++) {
    this.queue[i] = this.queue[i + 1];
  }

  // Decrease the size of the
  // priority queue by one
  this.size--;
}

function Algorithm(User) {
  User.courses.forEach((course) => {
    const courseSomething = new Course(course.queue, course.size, course.name, course.examDate, course.ECTS, course.subjects);

    course.contents.forEach((lecture, i) => {
      courseSomething.queue.push({ name: lecture.name, priority: i });
    });

    enqueue(courseSomething, courseSomething.priority, courseSomething.length);
  });
  console.log(User.queue);
  return User.queue;
}
