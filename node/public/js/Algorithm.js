export {Algorithm}; // Export the Algorithm function to be used in other files
import {User} from './schedule.js'; // Import the User object from schedule.js


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