import moment from 'moment';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname, parse } from 'path';
import ICAL from 'ical.js';
import fetch from 'node-fetch';
import { decode } from 'punycode';
import { getUserData } from './app';

export { Algorithm, mockAlgorithm };

const { promises: fsPromises } = fs;

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilename);

async function mockAlgorithm(User) {
  console.log('Calculating schedule for:', User.fullname);

  const events = await getEvents(User.userid, User.settings.syncCalendars);
  let currentTime = moment().valueOf();
  let lectures = [];
  User.courses.forEach((course) => {
    if (course.chosen === true) {
      course.contents.forEach((lecture) => {
        if (lecture.chosen === true) {
          let startTime = currentTime;
          let endTime = currentTime + (getRandomInt(1, 5) * 3600000);
          events.forEach((event) => {
            if (!(endTime < event.startTime || event.endTime < startTime)) {
              const duration = (endTime - startTime);
              startTime = event.endTime + (15 * 60000);
              endTime = startTime + duration;
            }
          });
          const timeBlock = {
            title: course.fullname,
            description: lecture.name,
            startTime: startTime,
            endTime: endTime,
            color: course.color,
          };
          currentTime = endTime + (15 * 60000);
          lectures.push(timeBlock);
        }
      });
    }
  });

  lectures = lectures.concat(events);
  return lectures;
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
