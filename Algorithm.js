class CourseItem {
    constructor()
    {
        //Course info skal fetches her
    this.name;
    this.subjects;
    this.priority;
    }
}

let MainPriorityQueue = [];

for (var i = 0; i < 1000; i++)
{
    MainPriorityQueue.push(new CourseItem);
}

let sizeMP = -1;

function enqueue(queue, value, priority)
{
    this.queue = queue;
    sizeMP++;

    MainPriorityQueue[sizeMP] = new CourseItem();
    MainPriorityQueue[sizeMP].value = value;
    MainPriorityQueue[sizeMP].priority = priority;

}

function peek(queue, value, priority)
{
    this.queue = queue;
    let highestPriority = Number.MIN_SAFE_INTEGER;
    let index = -1

    for (var i = 0; i <= sizeMP; i++) 
    {
        // If priority is same choose
        // the element with the
        // highest value
        if (highestPriority == MainPriorityQueue[i].priority && index > -1
            && MainPriorityQueue[index].value < MainPriorityQueue[i].value) 
        {
            highestPriority = MainPriorityQueue[i].priority;
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
    for (var i = index; i < sizeMP; i++) {
        MainPriorityQueue[i] = MainPriorityQueue[i + 1];
    }
 
    // Decrease the size of the
    // priority queue by one
    sizeMP--;
}

function Course(name, examDate, ECTS, subjects)
{
    //Course info skal fetches her
    this.name = name;
    this.examDate = examDate;
    this.ECTS = ECTS;
    this.subjects = subjects;
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
    examDate
}