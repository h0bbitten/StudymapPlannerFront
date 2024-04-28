import moment from 'moment';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname, parse } from 'path';
import ICAL from 'ical.js';
import fetch from 'node-fetch';

export { Algorithm };

const { promises: fsPromises } = fs;

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilename);
const HourMilliSec = 3600000;

async function Algorithm(User) {
  console.log('Calculating schedule for:', User.fullname);

  const events = await getEvents(User.userid, User.settings.syncCalendars);
  const currentTime = moment().valueOf();
  User.courses.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  let lectures = [];
  switch (User.settings.algorithm) {
  case 'emptyFirstComeFirstServe':
    emptyFirstComeFirstServe(User.courses, currentTime, events, lectures, User.settings.startStudyTime, User.settings.endStudyTime);
    break;
  case 'fiveDayStudyPlan':
    fiveDayStudyPlan(User.courses, currentTime, events, lectures, User.settings.startStudyTime, User.settings.endStudyTime);
    break;
  case 'someOtherAlgorithm':
    emptyFirstComeFirstServe(User.courses, currentTime, events, lectures, User.settings.startStudyTime, User.settings.endStudyTime);
    break;
  default:
    fiveDayStudyPlan(User.courses, currentTime, events, lectures, User.settings.startStudyTime, User.settings.endStudyTime);
    break;
  }

  lectures = lectures.concat(events);
  return lectures;
}

function emptyFirstComeFirstServe(courses, currentTime, events, lectures, startStudyTime, endStudyTime) {
  let endofLastPeriod;
  courses.forEach((course, examIndex) => {
    if (course.chosen === true) {
      events.push(createExamEvent(course));

      const studyPeriodStart = examIndex === 0 ? currentTime : endofLastPeriod;
      const studyPeriodEnd = moment(course.examDate).startOf('day');
      const daysToExam = Math.floor(moment.duration(studyPeriodEnd - studyPeriodStart).asDays());
      // Lav logic for at udrenge tid tilgængeligt til eksamen - free time, og tid allerede sat af til lectures og events i perioden
      const studyTimePrDay = moment.duration(moment(endStudyTime, 'HH:mm')
                            .diff(moment(startStudyTime, 'HH:mm')))
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
          const startTimeOfDay = getUNIXfromTimeOfDay(startTime, startStudyTime);
          const endTimeOfDay = getUNIXfromTimeOfDay(endTime, endStudyTime);

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
}

function fiveDayStudyPlan(courses, currentTime, events, lectures, startStudyTime, endStudyTime) {
  courses.reverse();

  courses.forEach((course) => {
    if (course.chosen === true) {
      events.push(...createExamEvent(course, startStudyTime, endStudyTime));
      // ECTS point hardcoded to 5
      const studyPeriod = 10 * 5 * HourMilliSec; // 10 timer pr. ECTS point
      const studyPeriodPrLecture = Math.ceil(studyPeriod / course.contents.length);

      let studyPeriodStart = moment(course.examDate).startOf('day').valueOf();
      course.contents.reverse();
      course.contents.forEach((lecture) => {
        if (lecture.chosen === true) {
          let endTime = studyPeriodStart;
          let startTime = endTime - studyPeriodPrLecture;

          const [newStartTime, newEndTime] = checkOverlap(startTime, endTime, events, lectures, startStudyTime, endStudyTime);
          startTime = newStartTime;
          endTime = newEndTime;

          const timeBlock = {
            title: course.fullname,
            description: lecture.name,
            startTime: startTime,
            endTime: endTime,
            color: course.color,
            type: 'lecture',
          };
          if (startTime < currentTime) {
            console.log('Not enough time to study for lectures, failed at:', course.fullname, 'Lecture:', lecture.name);
            return null;
          }
          studyPeriodStart = startTime - (HourMilliSec / 4);
          lectures.push(timeBlock);
        }
      });
    }
  });
}

function checkOverlap(startTime, endTime, eventArray, lectureArray, startStudyTime, endStudyTime) {
  const duration = (endTime - startTime);
  let overlapEvents = false;
  let overlapLectures = false;
  let outsideStudyInterval = false;

  [startTime, endTime, overlapEvents] = adjustTimesByOverlapFromEvents(startTime, endTime, duration, eventArray);

  [startTime, endTime, overlapLectures] = adjustTimesByOverlapFromEvents(startTime, endTime, duration, lectureArray);

  [startTime, endTime, outsideStudyInterval] = adjustTimesByStudyInterval(startTime, endTime, duration, startStudyTime, endStudyTime);

  if (overlapEvents || overlapLectures || outsideStudyInterval) {
    return checkOverlap(startTime, endTime, eventArray, lectureArray, startStudyTime, endStudyTime);
  }

  return [startTime, endTime];
}

function adjustTimesByStudyInterval(startTime, endTime, duration, studyStartTime, studyEndTime) {
  const startTimeOfDay = getUNIXfromTimeOfDay(startTime, studyStartTime);
  const endTimeOfDay = getUNIXfromTimeOfDay(endTime, studyEndTime);
  let outsideStudyInterval = false;

  if (startTime < startTimeOfDay) {
    endTime = endTimeOfDay - (HourMilliSec * 24);
    startTime = endTime - duration;
    outsideStudyInterval = true;
  }
  if (endTime > endTimeOfDay) {
    endTime = endTimeOfDay;
    startTime = endTime - duration;
    outsideStudyInterval = true;
  }
  return [startTime, endTime, outsideStudyInterval];
}

function adjustTimesByOverlapFromEvents(startTime, endTime, duration, eventArray) {
  let overlap = false;

  let earliestEvent = null;
  eventArray.forEach((event) => {
    if (!(endTime < event.startTime || event.endTime < startTime)) {
      overlap = true;
      // console.log('Overlap:', event.description, 'Start:', event.startTime, 'End:', event.endTime, 'New start:', startTime, 'New end:', endTime);
      if (!earliestEvent || event.startTime < earliestEvent.startTime) {
        earliestEvent = event;
        endTime = event.startTime - (HourMilliSec / 4);
        startTime = endTime - duration;
      }
    }
  });
  if (overlap) {
    overlap = adjustTimesByOverlapFromEvents(startTime, endTime, duration, eventArray);
  }
  return [startTime, endTime, overlap];
}

function getUNIXfromTimeOfDay(originalTimestamp, timeOfDay) {
  const originalMoment = moment(originalTimestamp);
  const originalDate = originalMoment.format('YYYY-MM-DD');
  const combinedDateTime = originalDate + ' ' + timeOfDay;
  const combinedMoment = moment(combinedDateTime, 'YYYY-MM-DD HH:mm');
  const newTimestamp = combinedMoment.unix() * 1000; // Multiply by 1000 to get milliseconds
  // console.log('Original timestamp:', originalTimestamp, 'Time of day:', timeOfDay, 'New timestamp:', newTimestamp);
  return newTimestamp;
}

function createExamEvent(course, startStudyTime, endStudyTime) {
  const exam = {
    title: course.fullname,
    description: `Exam: ${course.fullname}`,
    startTime: moment(course.examDate).startOf('day').valueOf(),
    endTime: moment(course.examDate).endOf('day').valueOf(),
    color: darkenColor(course.color, 0.35),
    type: 'exam',
  };
  const RepetitionStart = getUNIXfromTimeOfDay(exam.startTime - (12 * HourMilliSec), startStudyTime);
  const RepetitionEnd = getUNIXfromTimeOfDay(exam.startTime - (12 * HourMilliSec), endStudyTime);
  const examRepetition = {
    title: course.fullname,
    description: `Exam Repetition: ${course.fullname}`,
    startTime: RepetitionStart,
    endTime: RepetitionEnd,
    color: darkenColor(course.color, 0.15),
    type: 'examRepetition',
  };
  return [examRepetition, exam];
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
