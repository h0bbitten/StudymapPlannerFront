class Course 
{
    constructor(queue, size, name, examDate, ECTS, subjects) 
    {
        //Course info skal fetches her
        this.queue = [];
        this.size = -1;
        this.name = name;
        this.examDate = examDate;
        this.ECTS = ECTS;
        this.subjects = subjects;
    }
}

class CourseItem {
    constructor()
    {
        //Course info skal fetches her
    this.name;
    this.subjects;
    this.priority;
    }
}

for (var i = 0; i < 1000; i++)
{
    this.queue.push(new CourseItem);
}

let size = -1;

function enqueue(value, priority)
{
    this.size++;

    this.queue[size] = new CourseItem();
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

function studyBlock(date, duration)
{
    //Her skal empty timeslots indsættes når det er indhentet fra brugerens skema
    this.date = date;
    this.duration = duration;
}

function createSchedule(courses, availableTimes, Queues)
{
    const schedule = [];

    return schedule;
}

function sortExamsByDates()
{
    Course.examDate.sort();
}