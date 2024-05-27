import moment from 'moment';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import ICAL from 'ical.js';
import fetch from 'node-fetch';

export default calculateSchedule;

// Jest test exports
export { createLectureTimeBlock, PreAlgoMethods, getUNIXfromTimeOfDay };

const { promises: fsPromises } = fs;

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilename);
const HourMilliSec = 3600000;

// PreAlgoMethods class that contains all the necessary methods for the algorithm
class PreAlgoMethods {
  constructor(User, algorithm) {
    console.log('Calculating schedule for:', User.fullname);
    this.algorithm = algorithm;
    this.EarlyLectures = User.schedule.preferEarly;
    this.preparation = User.schedule.wantPrep;
    this.StartStudyTime = User.settings.startStudyTime;
    this.EndStudyTime = User.settings.endStudyTime;
    this.studyTimePrDay = this.studyTimePrDay(this.StartStudyTime, this.EndStudyTime);
    this.freeTimePrDay = (HourMilliSec * 24) - this.studyTimePrDay;
    this.Courses = this.prepCourses(User.courses);
    this.theTime = moment().valueOf();
    this.schedule = this.prepSchedule();
    this.id = User.userid;
    this.syncCalendars = User.settings.syncCalendars;
  }

  async init() {
    this.events = await getEvents(this.id, this.syncCalendars);
  }

  // Method that calculates the study time per day
  studyTimePrDay() {
    return moment.duration(moment(this.EndStudyTime, 'HH:mm')
      .diff(moment(this.StartStudyTime, 'HH:mm'))).asMilliseconds();
  }

  // Method that prepares the courses for the algorithm by filtering out the courses that are not chosen
  prepCourses(Courses) {
    let reverse = false;
    if (this.algorithm !== 'emptyFirstComeFirstServe') {
      reverse = true;
    }
    console.log('Prepping courses, reverse =', reverse);
    Courses = JSON.parse(JSON.stringify(Courses))
      .filter((course) => course.chosen === true)
      .sort((a, b) => {
        if (reverse) {
          return new Date(b.examDate) - new Date(a.examDate);
        }
        return new Date(a.examDate) - new Date(b.examDate);
      })
      .map((course) => {
        // ECTS point hardcoded to 5 if not present
        course.studyPeriodTotal = 10 * (course.ECTS ?? 5) * HourMilliSec; // 10 timer pr. ECTS point
        course.studyPeriodPrLecture = Math.ceil(course.studyPeriodTotal / course.contents.length);
        course.contents = course.contents.filter((lecture) => lecture.chosen === true);
        if (reverse) course.contents.reverse();
        return course;
      });
    return Courses;
  }

  // Method that prepares the schedule object by setting the algorithm and other properties
  prepSchedule() {
    return {
      algorithm: this.algorithm === 'default' ? 'addaptiveGapNoMixing' : this.algorithm,
      preferEarly: this.EarlyLectures,
      wantPrep: this.preparation,
      Timeblocks: [],
      CreateDate: this.theTime,
      outdated: false,
    };
  }

  // Method that returns the parameters for the algorithm based on the user's settings
  params() {
    return {
      courses: this.Courses,
      events: this.events,
      currentTime: this.theTime,
      startStudyTime: this.StartStudyTime,
      endStudyTime: this.EndStudyTime,
      preferEarlyLectures: this.EarlyLectures,
      eventGap: (this.freeTimePrDay * 2),
    };
  }
}

// Function that calculates the schedule based on the user's settings and chosen algorithm
async function calculateSchedule(User, algorithm) {
  const Algo = new PreAlgoMethods(User, algorithm);
  // Try with IIFE async constructor function later
  await Algo.init();

  createExamEvents(Algo.Courses, Algo.events, Algo.StartStudyTime, Algo.EndStudyTime, Algo.preparation);

  const AlgorithmStrategy = getAlgorithmStrategy(Algo.algorithm);

  const result = AlgorithmStrategy(Algo.params());
  if (result.error) {
    console.log('Error in schedule:', result);
    Algo.schedule.error = result.error;
    Algo.schedule.redirect = result.redirect;
    return Algo.schedule;
  }
  Algo.schedule.Timeblocks = result;
  Algo.schedule.Timeblocks = Algo.schedule.Timeblocks.concat(Algo.events);
  return Algo.schedule;
}

// Function that returns the correct algorithm strategy based on the chosen algorithm
function getAlgorithmStrategy(algorithm) {
  switch (algorithm) {
  case 'emptyFirstComeFirstServe':
    return (params) => Algorithm(params);
  case 'fiveDayStudyPlan':
    return (params) => Algorithm(params, true, false);
  case 'addaptiveGapWithMixing':
    return (params) => Algorithm(params, true, true, true);
  case 'addaptiveGapNoMixing':
    return (params) => Algorithm(params, true, true, false);
  default:
    return (params) => Algorithm(params, true, true, false);
  }
}

// Function that calculates the schedule based on the user's settings and chosen algorithm
function Algorithm(params, reverse = false, addaptive = false, mixing = false) {
  const {
    courses,
    events,
    currentTime,
    startStudyTime,
    endStudyTime,
    preferEarlyLectures,
  } = params;
  const eventGap = addaptive ? params.eventGap : HourMilliSec;
  const originalCourses = JSON.parse(JSON.stringify(courses));

  console.log('Event gap in hours:', eventGap / HourMilliSec, 'hours');
  let lectures = [];
  let failed = false;
  let lastLectureStartTime = 0;

  courses.forEach((course, courseIndex) => {
    if (failed) return;
    processLectures(course, calcStartPoint(course.examDate, courseIndex));
  });

  tryAdaptiveGap();
  adjustLectures();
  console.log('Returning lectures:', lectures.length, lectures.error);
  return lectures;

  // Function that calculates the start point for the lectures based on the course index
  function calcStartPoint(examDate, courseIndex) {
    let studyStartPoint;
    if (courseIndex === 0 || mixing || !addaptive) {
      studyStartPoint = reverse ? moment(examDate).startOf('day').valueOf() : currentTime;
    } else {
      studyStartPoint = reverse ? Math.min(lastLectureStartTime, moment(examDate).startOf('day').valueOf()) : lastLectureStartTime;
    }
    return studyStartPoint;
  }

  // Function that processes the lectures for each course
  function processLectures(course, startPoint) {
    course.contents.forEach((lecture) => {
      if (failed) return;
      let endTime = reverse ? startPoint : startPoint + course.studyPeriodPrLecture;
      let startTime = reverse ? endTime - course.studyPeriodPrLecture : startPoint;
      [startTime, endTime] = checkOverlap(reverse, startTime, endTime, events, lectures, startStudyTime, endStudyTime, eventGap);

      if ((startTime < currentTime && reverse) || (!reverse && endTime > moment(course.examDate).startOf('day').valueOf())) {
        console.log('Not enough time to study for lectures, failed at:', course.fullname, 'Lecture:', lecture.name);
        failed = true;
        return;
      }
      startPoint = reverse ? startTime - eventGap : endTime + eventGap;
      lastLectureStartTime = startPoint;
      lectures.push(createLectureTimeBlock(course, lecture, startTime, endTime));
    });
  }

  // Function that tries to recalculate the schedule with a reduced event gap
  function tryAdaptiveGap() {
    if (addaptive && failed && eventGap > (HourMilliSec / 4)) {
      lectures = tryWithReducedEventGap(params, originalCourses, events, Algorithm, reverse, mixing);
    } else if ((addaptive && eventGap <= (HourMilliSec / 4)) || (!addaptive && failed)) {
      console.log('Failed to create schedule, not enough time to study for lectures');
      console.log(!lectures.error);
      lectures = {
        error: 'Failed to create schedule, not enough time to study for lectures',
        redirect: '/settings?error=notEnoughtTimeToStudyForLectures',
      };
      console.log(lectures, !lectures.error);
    }
  }

  // Function that adjusts the lectures based on the user's settings
  function adjustLectures() {
    if (preferEarlyLectures && !lectures.error) {
      lectures = prioritiseEarlyDayLectures(lectures, events, startStudyTime, endStudyTime);
    }
  }
}

// Function that creates a lecture time block
function createLectureTimeBlock(course, lecture, startTime, endTime) {
  return {
    title: course.fullname,
    description: lecture.name,
    startTime: startTime,
    endTime: endTime,
    color: course.color,
    courseURL: course.viewurl,
    type: 'lecture',
    ID: lecture.id,
    courseID: course.id,
    status: 'active',
  };
}

// Function that tries to recalculate the schedule with a reduced event gap
function tryWithReducedEventGap(params, courses, events, retryFunction, reverse = true, mixing = false) {
  if (!params.firstCall) {
    params.firstCall = true;
    if (params.eventGap > (HourMilliSec * 4)) {
      params.eventGap = Math.floor(params.eventGap / HourMilliSec) * HourMilliSec;
    } else {
      params.eventGap = Math.floor(params.eventGap / (HourMilliSec / 4)) * (HourMilliSec / 4);
    }
  } else {
    params.eventGap = params.eventGap > (HourMilliSec * 4) ? params.eventGap - HourMilliSec : params.eventGap - (HourMilliSec / 4);
  }

  params.courses = courses;
  params.events = events;
  return retryFunction(params, reverse, true, mixing);
}

// Function that checks for overlap between events and lectures
function checkOverlap(reverse, startTime, endTime, eventArray, lectureArray, startStudyTime, endStudyTime, eventGap = HourMilliSec) {
  const duration = (endTime - startTime);

  let overlapEvents = false;
  let overlapLectures = false;
  let outsideStudyInterval = false;

  [startTime, endTime, overlapEvents] = adjustTimesByOverlapFromEvents(reverse, startTime, endTime, duration, eventArray, eventGap);

  [startTime, endTime, overlapLectures] = adjustTimesByOverlapFromEvents(reverse, startTime, endTime, duration, lectureArray, eventGap);

  [startTime, endTime, outsideStudyInterval] = adjustTimesByStudyInterval(reverse, startTime, endTime, duration, startStudyTime, endStudyTime);

  if (overlapEvents || overlapLectures || outsideStudyInterval) {
    [startTime, endTime] = checkOverlap(reverse, startTime, endTime, eventArray, lectureArray, startStudyTime, endStudyTime, eventGap);
  }

  return [startTime, endTime];
}

// Function that adjusts the times based on the study interval
function adjustTimesByStudyInterval(reverse, startTime, endTime, duration, studyStartTime, studyEndTime) {
  const startTimeOfDay = getUNIXfromTimeOfDay(endTime, studyStartTime);
  const endTimeOfDay = getUNIXfromTimeOfDay(endTime, studyEndTime);
  let outsideStudyInterval = false;

  if (startTime < startTimeOfDay) {
    outsideStudyInterval = true;
    if (reverse) {
      endTime = endTimeOfDay - (HourMilliSec * 24);
      startTime = endTime - duration;
    } else {
      startTime = startTimeOfDay;
      endTime = startTime + duration;
    }
  }
  if (endTime > endTimeOfDay) {
    outsideStudyInterval = true;
    if (reverse) {
      endTime = endTimeOfDay;
      startTime = endTime - duration;
    } else {
      startTime = startTimeOfDay + (HourMilliSec * 24);
      endTime = startTime + duration;
    }
  }
  return [startTime, endTime, outsideStudyInterval];
}

// Function that adjusts the times based on the overlap between events
function adjustTimesByOverlapFromEvents(reverse, startTime, endTime, duration, eventArray, eventGap) {
  let overlap = false;
  let chosenEvent = null;
  eventArray.forEach((event) => {
    if (!(endTime < event.startTime || event.endTime < startTime)) {
      overlap = true;
      if (!chosenEvent || (event.startTime < chosenEvent.startTime && reverse) || (event.endTime > chosenEvent.endTime && !reverse)) {
        chosenEvent = event;
        endTime = reverse ? event.startTime - eventGap : event.endTime + eventGap + duration;
        startTime = reverse ? endTime - duration : event.endTime + eventGap;
      }
    }
  });
  return [startTime, endTime, overlap];
}

// Function that checks for overlap between events and time blocks
function checkForOverlapWithEvents(StartTime, EndTime, events) {
  let overlap = false;
  events.forEach((event) => {
    if (!(EndTime < event.startTime || event.endTime < StartTime)) {
      overlap = true;
    }
  });
  return overlap;
}

// Function that prioritises early day time blocks
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

// Function that groups events by day meaning that all events that are on the same day are grouped together
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

// Function that gets the UNIX timestamp from a time of day
function getUNIXfromTimeOfDay(originalTimestamp, timeOfDay) {
  const originalMoment = moment(originalTimestamp);
  const originalDate = originalMoment.format('YYYY-MM-DD');
  const combinedDateTime = `${originalDate} ${timeOfDay}`;
  const combinedMoment = moment(combinedDateTime, 'YYYY-MM-DD HH:mm');
  const newTimestamp = combinedMoment.unix() * 1000;
  return newTimestamp;
}

// Function that creates exam events
function createExamEvents(courses, events, startStudyTime, endStudyTime, preparation = false) {
  const examEvents = [];
  courses.forEach((course) => {
    const exam = {
      title: course.fullname,
      description: `Exam: ${course.fullname}`,
      startTime: moment(course.examDate).startOf('day').valueOf(),
      endTime: moment(course.examDate).endOf('day').valueOf(),
      color: darkenColor(course.color, 0.35),
      type: 'exam',
    };
    examEvents.push(exam);
    events.push(exam);
  });
  if (preparation) {
    examEvents.forEach((exam) => {
      const RepetitionStart = getUNIXfromTimeOfDay(exam.startTime - (12 * HourMilliSec), startStudyTime);
      const RepetitionEnd = getUNIXfromTimeOfDay(exam.startTime - (12 * HourMilliSec), endStudyTime);
      const examRepetition = {
        title: exam.title,
        description: `Exam Repetition: ${exam.title}`,
        startTime: RepetitionStart,
        endTime: RepetitionEnd,
        color: darkenColor(exam.color, 0.15),
        type: 'examRepetition',
      };
      let overlap = false;
      do {
        const duration = examRepetition.endTime - examRepetition.startTime;
        [, , overlap] = adjustTimesByOverlapFromEvents(
          true,
          examRepetition.startTime,
          examRepetition.endTime,
          duration,
          events,
          HourMilliSec,
        );
        if (overlap) {
          examRepetition.startTime -= (HourMilliSec * 24);
          examRepetition.endTime -= (HourMilliSec * 24);
        }
      } while (overlap);
      events.push(examRepetition);
    });
  }
  return events;
}

function darkenColor(color, amount) {
  let [r, g, b] = color.match(/\w\w/g).map((x) => parseInt(x, 16));

  r = Math.floor(r * (1 - amount));
  g = Math.floor(g * (1 - amount));
  b = Math.floor(b * (1 - amount));

  return `#${((256 ** 3) + (r * 256 ** 2) + (g * 256) + b).toString(16).slice(1)}`;
}

// Function that fetches the events from the user's calendars
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

// Function that retrieves the ICAL URLs from the user's calendars
async function retrieveICalURLs(userid, syncCalendars) {
  const parentDir = path.resolve(currentDir, '..');
  const directory = path.join(parentDir, 'database', 'icals', userid.toString());

  try {
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

// Function that parses the ICAL files
async function parseICalFiles(icalURLs) {
  try {
    console.log('Parsing ICAL files:', icalURLs);

    const eventPromises = icalURLs.map(async (url) => {
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
