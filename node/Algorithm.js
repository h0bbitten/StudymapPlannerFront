import moment from 'moment';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import ICAL from 'ical.js';
import fetch from 'node-fetch';

const { promises: fsPromises } = fs;
const currentFilename = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilename);

class PriorityQueue {
  constructor() {
    this.queue = [];
    this.size = 0;
  }

  enqueue(element) {
    this.queue.push(element);
    this.queue.sort((a, b) => b.priority - a.priority);
    this.size++;  
  }

  dequeue() {
    if (!this.isEmpty()) {
      this.size--;
      return this.queue.shift();
    }
  }

  peek() {
    return this.queue[0];
  }

  isEmpty() {
    return this.size === 0;
  }
}


function calculatePriority(ECTS, examDate) {
  const today = moment();
  const daysToExam = moment(examDate).diff(today, 'days');
  return (ECTS / Math.max(1, daysToExam)) * 100; 

async function mockAlgorithm(User) {
  console.log('Start mockAlgorithm with User:', User);
  try {
      console.log('Fetching iCal Events...');
      const icalEvents = await getEvents(User.userid, User.settings.syncCalendars);
      console.log('iCal Events:', icalEvents);

      console.log('Fetching Moodle Events...');
      const moodleEvents = parseMoodleCourses(User.courses);
      console.log('Moodle Events:', moodleEvents);

      console.log('Merging Events...');
      const combinedEvents = mergeEvents(icalEvents, moodleEvents);
      console.log('Combined Events:', combinedEvents);

      const queue = new PriorityQueue();
      combinedEvents.forEach(event => {
          queue.enqueue(event);  
          console.log('Enqueued Event:', event);
      });

      let lectures = [];
      while (!queue.isEmpty()) {
          let event = queue.dequeue();
          console.log('Dequeued Event:', event);
          lectures.push(event);
      }

      console.log('Final Scheduled Lectures:', lectures);
      return lectures;  
  } catch (error) {
      console.error('Error in mockAlgorithm:', error);
      throw error;  
  }
}



function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getEvents(userid, syncCalendars) {
  const urls = await retrieveICalURLs(userid, syncCalendars);
  return await parseICalFiles(urls);
}

async function retrieveICalURLs(userid, syncCalendars) {
  const directory = path.join(currentDir, '..', 'database', 'icals', userid.toString());
  await fsPromises.mkdir(directory, { recursive: true }).catch(() => {});

  let fileUrls = await fsPromises.readdir(directory);
  fileUrls = fileUrls.map(url => ({
    url: path.join(directory, url),
    name: url,
    color: '#FF0000',
    type: 'file',
  }));
  return fileUrls.concat(syncCalendars);
}


async function parseICalFiles(icalURLs) {
  console.log('Received iCal URLs:', icalURLs);  
  const eventPromises = icalURLs.map(async (url) => {
      console.log('Attempting to fetch and parse iCal file:', url.url);
      try {
          let icalData = url.type === 'file' ?
              await fsPromises.readFile(url.url, 'utf-8') :
              await fetch(url.url).then(response => response.text());

          console.log(`Fetched data from ${url.url}:`, icalData.substring(0, 200)); 
          const jcalData = ICAL.parse(icalData);
          const vcalendar = new ICAL.Component(jcalData);
          const events = vcalendar.getAllSubcomponents('vevent').map(vevent => ({
              title: vevent.getFirstPropertyValue('summary'),
              description: vevent.getFirstPropertyValue('description'),
              startTime: vevent.getFirstPropertyValue('dtstart').toUnixTime() * 1000,
              endTime: vevent.getFirstPropertyValue('dtend').toUnixTime() * 1000,
              color: url.color,
          }));
          console.log('Parsed events:', events);
          return events;
      } catch (error) {
          console.error('Error fetching or parsing iCal file:', error);
          return [];
      }
  });

  const parsedEvents = await Promise.all(eventPromises);
  const flatEvents = parsedEvents.flat();
  console.log('All parsed iCal events:', flatEvents);
  return flatEvents;
}

function parseMoodleCourses(courses) {
  let events = [];
  if (!courses) {
    console.error('No courses data available.');
    return events; 
  }

  courses.forEach(course => {
    if (course.chosen && course.contents) {
      console.log(`Processing course: ${course.fullname}`);
      course.contents.forEach(content => {
        if (content.dates && Array.isArray(content.dates) && content.dates.length > 0) {
          content.dates.forEach(date => {
            if (date.startTime && date.endTime) {  
              events.push({
                title: course.name,
                description: content.name || 'No description',  
                startTime: moment.unix(date.startTime).valueOf(),
                endTime: moment.unix(date.endTime).valueOf(),
                color: course.color || '#0000FF'  
              });
            }
          });
        } else {
          console.log(`No valid dates found for content in course: ${course.fullname}`);
        }
      });
    } else {
      console.log(`Course not chosen or missing content: ${course.fullname}`);
    }
  });
  console.log('Moodle Events Parsed:', events);
  return events;
}


function mergeEvents(icalEvents, moodleEvents) {
  return [...icalEvents, ...moodleEvents].sort((a, b) => a.startTime - b.startTime);
}

export { mockAlgorithm };
