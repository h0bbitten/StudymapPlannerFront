import moment from 'moment';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname, parse } from 'path';
import ICAL from 'ical.js';
import fetch from 'node-fetch';
import { decode } from 'punycode';
import { type } from 'os';

export { Algorithm, mockAlgorithm };

const { promises: fsPromises } = fs;

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilename);
const HourMilliSec = 3600000;

async function mockAlgorithm(User) {
  console.log('Calculating schedule for:', User.fullname);

  const events = await getEvents(User.userid, User.settings.syncCalendars);
  const currentTime = moment().valueOf();
  let lectures = [];

  User.courses.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  // User.courses.reverse();

  let endofLastPeriod;
  User.courses.forEach((course, examIndex) => {
    if (course.chosen === true) {
      events.push(createExamEvent(course));

      const studyPeriodStart = examIndex === 0 ? currentTime : endofLastPeriod;
      const studyPeriodEnd = moment(course.examDate).startOf('day');
      const daysToExam = Math.floor(moment.duration(studyPeriodEnd - studyPeriodStart).asDays());
      // Lav logic for at udrenge tid tilgængeligt til eksamen - free time, og tid allerede sat af til lectures og events i perioden
      const studyTimePrDay = moment.duration(moment(User.settings.endStudyTime, 'HH:mm')
                            .diff(moment(User.settings.startStudyTime, 'HH:mm')))
                            .asMilliseconds();
      const freeTimePrDay = (HourMilliSec * 24) - studyTimePrDay;

      // console.log('Free time pr. day:', freeTimePrDay, 'Study time pr. day:', studyTimePrDay, 'Days to exam:', daysToExam);
      const studyPeriodDuration = (studyPeriodEnd - studyPeriodStart) - (freeTimePrDay * daysToExam);
      // Sætter værdien af studyTime til at være 10 timer pr. ECTS point
      // Harcoder ECTS point til 5, da webscraperen stadig ikke returnerer ECTS point
      const studyPeriod = 10 * 5 * HourMilliSec; // 10 timer pr. ECTS point

      const studyPeriodPrLecture = Math.ceil(studyPeriod / course.contents.length);
      // Check hbor mange lectures den skal æstte ind pr. dag, brug modulus, med lectures og dage til eksamen eller noget i den stil

      const sumOfChosenLecturesTime = course.contents.reduce((acc, lecture) => {
        if (lecture.chosen === true) {
          return acc + studyPeriodPrLecture;
        }
        return acc;
      }, 0);
      // console.log('Sum of chosen lectures time:', sumOfChosenLecturesTime, 'Time to study till exam:', studyPeriodDuration);
      if (sumOfChosenLecturesTime > studyPeriodDuration) {
        console.log('Not enough time to study for lectures:', course.fullname);
        // return null;
      }
      let start = studyPeriodStart;
      course.contents.forEach((lecture) => {
        if (lecture.chosen === true) {
          let startTime = start;
          let endTime = start + studyPeriodPrLecture;
          const duration = (endTime - startTime);
          events.forEach((event) => {
            if (!(endTime < event.startTime || event.endTime < startTime)) {
              startTime = event.endTime + HourMilliSec;
              endTime = startTime + duration;
            }
          });
          const startTimeOfDay = getUNIXfromTimeOfDay(startTime, User.settings.startStudyTime);
          const endTimeOfDay = getUNIXfromTimeOfDay(endTime, User.settings.endStudyTime);

          if (startTime < startTimeOfDay) {
            startTime = startTimeOfDay;
            endTime = startTime + duration;
          }
          if (endTime > endTimeOfDay) {
            startTime = (startTimeOfDay + (HourMilliSec * 24));
            endTime = startTime + duration;
          }
          const timeBlock = {
            title: course.fullname,
            description: lecture.name,
            startTime: startTime,
            endTime: endTime,
            color: course.color,
            type: 'lecture',
          };
          start = endTime + (15 * 60000);
          lectures.push(timeBlock);
        }
        if (lecture === course.contents[course.contents.length - 1]) {
          endofLastPeriod = start;
        }
      });
    }
  });
  lectures = lectures.concat(events);
  return lectures;
}

function calculateStudyPeriods(course, examIndex, currentTime, User) {

}

function getUNIXfromTimeOfDay(originalTimestamp, timeOfDay) {
  // Create a moment object from the original timestamp
  const originalMoment = moment(originalTimestamp);

  // Extract the date part from the original timestamp
  const originalDate = originalMoment.format('YYYY-MM-DD');

  // Combine the date part with the provided time of day
  const combinedDateTime = originalDate + ' ' + timeOfDay;

  // Convert the combined date and time to a moment object
  const combinedMoment = moment(combinedDateTime, 'YYYY-MM-DD HH:mm');

  // Get the UNIX timestamp of the combined date and time
  const newTimestamp = combinedMoment.unix() * 1000; // Multiply by 1000 to get milliseconds

  // console.log('Original timestamp:', originalTimestamp, 'Time of day:', timeOfDay, 'New timestamp:', newTimestamp);
  return newTimestamp;
}

function createExamEvent(course) {
  const exam = {
    title: course.fullname,
    description: `Exam: ${course.fullname}`,
    startTime: moment(course.examDate).startOf('day').valueOf(),
    endTime: moment(course.examDate).endOf('day').valueOf(),
    color: darkenColor(course.color, 0.35),
    type: 'exam',
  };
  return exam;
}

function darkenColor(color, amount) {
  let [r, g, b] = color.match(/\w\w/g).map(x => parseInt(x, 16));

  r = Math.floor(r * (1 - amount));
  g = Math.floor(g * (1 - amount));
  b = Math.floor(b * (1 - amount));

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getEvents(userid, syncCalendars) {
  try {
    const urls = await retrieveICalURLs(userid, syncCalendars);
    const events = await parseICalFiles(urls);
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

async function retrieveICalURLs(userid, syncCalendars) {
  const parentDir = path.resolve(currentDir, '..');
  const directory = path.join(parentDir, 'database', 'icals', userid.toString());

  try {
    // Check if the directory exists
    const directoryExists = await fsPromises.access(directory, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);

    if (!directoryExists) {
      console.error('Directory does not exist:', directory);
      return syncCalendars;
    }

    let fileUrls = await fsPromises.readdir(directory);
    fileUrls = fileUrls.map((url) => {
      const fileInfo = {
        url: path.join(directory, url),
        name: url,
        color: '#FF0000',
        type: 'file',
      };
      return fileInfo;
    });
    console.log(fileUrls);
    const linkUrls = syncCalendars;
    const Urls = fileUrls.concat(linkUrls);
    return Urls;
  } catch (error) {
    console.error('Error reading directory:', directory, error);
    throw error;
  }
}

async function parseICalFiles(icalURLs) {
  try {
    console.log('Parsing ICAL files:', icalURLs);

    const eventPromises = icalURLs.map(async (url, index) => {
      try {
        console.log('Parsing ICAL file:', url.url);
        let icalData;
        if (url.type === 'file') {
          console.log('Reading local ICAL file:', url.url);
          icalData = await fs.promises.readFile(url.url, 'utf-8');
        } else {
          console.log('Fetching external ICAL file:', url.url);
          const response = await fetch(url.url);
          icalData = await response.text();
        }
        const jcalData = ICAL.parse(icalData);
        const vcalendar = new ICAL.Component(jcalData);
        const vevents = vcalendar.getAllSubcomponents();
        const events = vevents.map((vevent) => {
          const event = {
            title: vevent.getFirstPropertyValue('summary'),
            description: vevent.getFirstPropertyValue('description'),
            startTime: vevent.getFirstPropertyValue('dtstart').toUnixTime() * 1000,
            endTime: vevent.getFirstPropertyValue('dtend').toUnixTime() * 1000,
            color: url.color,
            type: 'event',
          };
          return event;
        });
        return events;
      } catch (error) {
        console.error('Error parsing ICAL file:', url.url, error);
        return [];
      }
    });
    const eventsArray = await Promise.all(eventPromises);
    const events = eventsArray.flat();
    return events;
  } catch (error) {
    console.error('Error parsing ICAL files:', error);
    throw error;
  }
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
