import moment from 'moment';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname, parse } from 'path';
import ICAL from 'ical.js';
import fetch from 'node-fetch';

export default Algorithm;

const { promises: fsPromises } = fs;

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilename);
const HourMilliSec = 3600000;

async function Algorithm(User, algorithm) {
  console.log('Calculating schedule for:', User.fullname);
  const preferEarlyLectures = User.schedule.preferEarly;
  const startStudyTime = User.settings.startStudyTime;
  const endStudyTime = User.settings.endStudyTime;
  const Courses = JSON.parse(JSON.stringify(User.courses));

  const studyTimePrDay = moment.duration(moment(endStudyTime, 'HH:mm')
    .diff(moment(startStudyTime, 'HH:mm')))
    .asMilliseconds();
  const freeTimePrDay = (HourMilliSec * 24) - studyTimePrDay;

  console.log('Study time pr. day:', studyTimePrDay, 'in Hours:', (studyTimePrDay / HourMilliSec), 'Free time pr. day:',freeTimePrDay, 'in Hours:', (freeTimePrDay / HourMilliSec));

  const events = await getEvents(User.userid, User.settings.syncCalendars);
  const currentTime = moment().valueOf();
  Courses.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  const schedule = {
    algorithm: algorithm === 'default' ? 'addaptiveGapNoMixing' : algorithm,
    preferEarly: preferEarlyLectures,
    Timeblocks: [],
    CreateDate: currentTime,
    outdated: false,
  };
  console.log('Schedule Algorithm:', schedule.algorithm);
  switch (schedule.algorithm) {
  case 'emptyFirstComeFirstServe':
    schedule.Timeblocks = emptyFirstComeFirstServe(Courses, currentTime, events, startStudyTime, endStudyTime, preferEarlyLectures);
    break;
  case 'fiveDayStudyPlan':
    schedule.Timeblocks = fiveDayStudyPlan(Courses, currentTime, events, startStudyTime, endStudyTime, preferEarlyLectures);
    break;
  case 'addaptiveGapWithMixing':
    schedule.Timeblocks = addaptiveGapWithMixing(Courses, currentTime, events, startStudyTime, endStudyTime, preferEarlyLectures, freeTimePrDay);
    break;
  case 'addaptiveGapNoMixing':
    schedule.Timeblocks = addaptiveGapNoMixing(Courses, currentTime, events, startStudyTime, endStudyTime, preferEarlyLectures, freeTimePrDay);
    break;
  default:
    schedule.Timeblocks = addaptiveGapNoMixing(Courses, currentTime, events, startStudyTime, endStudyTime, preferEarlyLectures, freeTimePrDay);
    break;
  }

  return schedule;
}

function emptyFirstComeFirstServe(courses, currentTime, events, startStudyTime, endStudyTime, prioEarly) {
  let endofLastPeriod;
  events.push(...createExamEvents(courses, startStudyTime, endStudyTime));

  let lectures = [];
  courses.forEach((course, examIndex) => {
    if (course.chosen === true) {
      const studyPeriodStart = examIndex === 0 ? currentTime : endofLastPeriod;
      const studyPeriodEnd = moment(course.examDate).startOf('day');
      const daysToExam = Math.floor(moment.duration(studyPeriodEnd - studyPeriodStart).asDays());

      const studyTimePrDay = moment.duration(moment(endStudyTime, 'HH:mm')
        .diff(moment(startStudyTime, 'HH:mm'))).asMilliseconds();
      const freeTimePrDay = (HourMilliSec * 24) - studyTimePrDay;

      const studyPeriodDuration = (studyPeriodEnd - studyPeriodStart) - (freeTimePrDay * daysToExam);
      const studyPeriod = 10 * 5 * HourMilliSec; // 10 timer pr. ECTS point

      const studyPeriodPrLecture = Math.ceil(studyPeriod / course.contents.length);

      const sumOfChosenLecturesTime = course.contents.reduce((acc, lecture) => {
        if (lecture.chosen === true) {
          return acc + studyPeriodPrLecture;
        }
        return acc;
      }, 0);

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
            courseURL: course.viewurl,
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
  if (prioEarly) {
    lectures = prioritiseEarlyDayLectures(lectures, events, startStudyTime, endStudyTime);
  }
  lectures = lectures.concat(events);
  console.log('Returning lectures:', lectures.length);
  return lectures;
}

function fiveDayStudyPlan(courses, currentTime, events, startStudyTime, endStudyTime, prioEarly, eventGap = HourMilliSec) {
  let lectures = [];
  events.push(...createExamEvents(courses, startStudyTime, endStudyTime));

  courses.reverse();
  courses.forEach((course) => {
    if (course.chosen === true) {
      // ECTS point hardcoded to 5
      const studyPeriod = 10 * 5 * HourMilliSec; // 10 timer pr. ECTS point
      const studyPeriodPrLecture = Math.ceil(studyPeriod / course.contents.length);

      let studyPeriodStart = moment(course.examDate).startOf('day').valueOf();
      course.contents.reverse();
      course.contents.forEach((lecture) => {
        if (lecture.chosen === true) {
          let endTime = studyPeriodStart;
          let startTime = endTime - studyPeriodPrLecture;

          const [newStartTime, newEndTime] = checkOverlap(startTime, endTime, events, lectures, startStudyTime, endStudyTime, eventGap);
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
          studyPeriodStart = startTime - eventGap;
          lectures.push(timeBlock);
        }
      });
    }
  });
  if (prioEarly) {
    lectures = prioritiseEarlyDayLectures(lectures, events, startStudyTime, endStudyTime);
  }
  lectures = lectures.concat(events);
  console.log('Returning lectures:', lectures.length);
  return lectures;
}

function addaptiveGapWithMixing(courses, currentTime, events, startStudyTime, endStudyTime, prioEarly, eventGap = HourMilliSec) {
  console.log('Event gap in hours:', eventGap / HourMilliSec, 'hours');
  const originalCourses = JSON.parse(JSON.stringify(courses));
  const originalEvents = JSON.parse(JSON.stringify(events));
  let lectures = [];
  let tryAgain = false;
  events.push(...createExamEvents(courses, startStudyTime, endStudyTime));

  courses.reverse();
  courses.forEach((course) => {
    if (tryAgain) return;
    if (course.chosen === true) {
      // ECTS point hardcoded to 5
      const studyPeriod = 10 * 5 * HourMilliSec; // 10 timer pr. ECTS point
      const studyPeriodPrLecture = Math.ceil(studyPeriod / course.contents.length);

      let studyPeriodStart = moment(course.examDate).startOf('day').valueOf();
      course.contents.reverse();
      course.contents.forEach((lecture) => {
        if (tryAgain) return;
        if (lecture.chosen === true) {
          let endTime = studyPeriodStart;
          let startTime = endTime - studyPeriodPrLecture;

          const [newStartTime, newEndTime] = checkOverlap(startTime, endTime, events, lectures, startStudyTime, endStudyTime, eventGap);
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
            tryAgain = true;
          }
          studyPeriodStart = startTime - eventGap;
          lectures.push(timeBlock);
        }
      });
    }
  });
  if (tryAgain) {
    if (eventGap > HourMilliSec) {
      eventGap -= HourMilliSec;
      console.log('Trying again with reduced event gap', eventGap / HourMilliSec, 'hours');
      lectures = addaptiveGapWithMixing(originalCourses, currentTime, originalEvents, startStudyTime, endStudyTime, prioEarly, eventGap);
      return lectures;
    }
  }
  if (prioEarly) {
    lectures = prioritiseEarlyDayLectures(lectures, events, startStudyTime, endStudyTime);
  }
  lectures = lectures.concat(events);
  console.log('Returning lectures:', lectures.length);
  return lectures;
}

function addaptiveGapNoMixing(courses, currentTime, events, startStudyTime, endStudyTime, prioEarly, eventGap = HourMilliSec) {
  console.log('Event gap in hours:', eventGap / HourMilliSec, 'hours');
  const originalCourses = JSON.parse(JSON.stringify(courses));
  const originalEvents = JSON.parse(JSON.stringify(events));

  events.push(...createExamEvents(courses, startStudyTime, endStudyTime));

  let lectures = [];
  let tryAgain = false;
  let lastLectureStartTime = 0;

  courses.reverse();
  courses.forEach((course, courseIndex) => {
    if (tryAgain) return;
    if (course.chosen === true) {
      // ECTS point hardcoded to 5
      const studyPeriod = 10 * 5 * HourMilliSec; // 10 timer pr. ECTS point
      const studyPeriodPrLecture = Math.ceil(studyPeriod / course.contents.length);
      let studyPeriodStart;
      if (courseIndex === 0) {
        studyPeriodStart = moment(course.examDate).startOf('day').valueOf();
      } else {
        studyPeriodStart = Math.min(lastLectureStartTime, moment(course.examDate).startOf('day').valueOf());
      }
      course.contents.reverse();
      course.contents.forEach((lecture) => {
        if (tryAgain) return;
        if (lecture.chosen === true) {
          let endTime = studyPeriodStart;
          let startTime = endTime - studyPeriodPrLecture;

          const [newStartTime, newEndTime] = checkOverlap(startTime, endTime, events, lectures, startStudyTime, endStudyTime, eventGap);
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
            tryAgain = true;
          }
          studyPeriodStart = startTime - eventGap;
          lastLectureStartTime = studyPeriodStart;
          lectures.push(timeBlock);
        }
      });
    }
  });
  if (tryAgain) {
    if (eventGap > HourMilliSec) {
      eventGap -= HourMilliSec;
      console.log('Trying again with reduced event gap', eventGap / HourMilliSec, 'hours');
      lectures = addaptiveGapNoMixing(originalCourses, currentTime, originalEvents, startStudyTime, endStudyTime, prioEarly, eventGap);
      return lectures;
    }
  }
  if (prioEarly) {
    lectures = prioritiseEarlyDayLectures(lectures, events, startStudyTime, endStudyTime);
  }
  lectures = lectures.concat(events);
  console.log('Returning lectures:', lectures.length);
  return lectures;
}

function checkOverlap(startTime, endTime, eventArray, lectureArray, startStudyTime, endStudyTime, eventGap = HourMilliSec) {
  const duration = (endTime - startTime);

  let overlapEvents = false;
  let overlapLectures = false;
  let outsideStudyInterval = false;

  [startTime, endTime, overlapEvents] = adjustTimesByOverlapFromEvents(startTime, endTime, duration, eventArray, eventGap);

  [startTime, endTime, overlapLectures] = adjustTimesByOverlapFromEvents(startTime, endTime, duration, lectureArray, eventGap);

  [startTime, endTime, outsideStudyInterval] = adjustTimesByStudyInterval(startTime, endTime, duration, startStudyTime, endStudyTime);

  if (overlapEvents || overlapLectures || outsideStudyInterval) {
    [startTime, endTime] = checkOverlap(startTime, endTime, eventArray, lectureArray, startStudyTime, endStudyTime, eventGap);
  }

  return [startTime, endTime];
}

function adjustTimesByStudyInterval(startTime, endTime, duration, studyStartTime, studyEndTime) {
  const startTimeOfDay = getUNIXfromTimeOfDay(endTime, studyStartTime);
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

function adjustTimesByOverlapFromEvents(startTime, endTime, duration, eventArray, eventGap) {
  let overlap = false;
  let earliestEvent = null;
  eventArray.forEach((event) => {
    if (!(endTime < event.startTime || event.endTime < startTime)) {
      overlap = true;
      if (!earliestEvent || event.startTime < earliestEvent.startTime) {
        earliestEvent = event;
        endTime = event.startTime - eventGap;
        startTime = endTime - duration;
      }
    }
  });
  return [startTime, endTime, overlap];
}

function checkForOverlapWithEvents(StartTime, EndTime, events) {
  let overlap = false;
  events.forEach((event) => {
    if (!(EndTime < event.startTime || event.endTime < StartTime)) {
      overlap = true;
    }
  });
  return overlap;
}

function prioritiseEarlyDayLectures(lectures, events, startStudyTime) {
  lectures = lectures.sort((a, b) => a.startTime - b.startTime);
  const lecturesByDay = groupEventsByDay(lectures);
  let newLectures = [];
  lecturesByDay.forEach((day) => {
    const earliestLecture = day.events.reduce((acc, lecture) => {
      if (lecture.startTime < acc.startTime) {
        return lecture;
      }
      return acc;
    }, { startTime: Infinity });
    const delta = earliestLecture.startTime - getUNIXfromTimeOfDay(earliestLecture.startTime, startStudyTime);
    let overlap = false;
    for (const lecture of day.events) {
      const newStartTime = lecture.startTime - delta;
      const newEndTime = lecture.endTime - delta;
      overlap = checkForOverlapWithEvents(newStartTime, newEndTime, events);
      if (overlap) break;
    }
    if (!overlap) {
      day.events.forEach((lecture) => {
        lecture.startTime -= delta;
        lecture.endTime -= delta;
      });
    }
    newLectures = newLectures.concat(day.events);
  });
  return newLectures;
}

function groupEventsByDay(events) {
  const groupedEvents = [];

  events.forEach((event) => {
    const date = moment.unix(event.startTime / 1000);

    const dayKey = date.startOf('day').valueOf();

    const indexDay = groupedEvents.findIndex((group) => group.key === dayKey);

    if (indexDay === -1) {
      groupedEvents.push({
        key: dayKey,
        events: [event],
      });
    } else {
      groupedEvents[indexDay].events.push(event);
    }
  });
  return groupedEvents;
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

function createExamEvents(courses, startStudyTime, endStudyTime) {
  const events = [];
  courses.forEach((course) => {
    if (course.chosen === true) {
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
      events.push(examRepetition, exam);
    }
  });
  return events;
}

function darkenColor(color, amount) {
  let [r, g, b] = color.match(/\w\w/g).map((x) => parseInt(x, 16));

  r = Math.floor(r * (1 - amount));
  g = Math.floor(g * (1 - amount));
  b = Math.floor(b * (1 - amount));

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
