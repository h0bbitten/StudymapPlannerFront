import { createLectureTimeBlock, PreAlgoMethods, getUNIXfromTimeOfDay } from '../Algorithm.js';

describe('createLectureTimeBlock', () => {
  it('should create a lecture time block with the correct properties eg. title, description...', () => {
    const course = {
      id: '123',
      fullname: 'IWP - Lecture 4',
      color: '#00FF00',
      viewurl: 'https://www.youtube.com/watch?v=QrvV-R3y2xY&ab_channel=Virej',
    };
    const lecture = {
      id: '321',
      name: 'Lecture 4: How legens center divs',
    };
    const startTime = '2024-01-01T09:00:00Z';
    const endTime = '2024-01-01T10:00:00Z';

    const result = createLectureTimeBlock(course, lecture, startTime, endTime);

    expect(result).toEqual({
      ID: '321',
      courseID: '123',
      status: 'active',
      title: 'IWP - Lecture 4',
      description: 'Lecture 4: How legens center divs',
      startTime: '2024-01-01T09:00:00Z',
      endTime: '2024-01-01T10:00:00Z',
      color: '#00FF00',
      courseURL: 'https://www.youtube.com/watch?v=QrvV-R3y2xY&ab_channel=Virej',
      type: 'lecture',
    });
  });
});

// Define mock courses with all necessary properties
const testCourseOne = {
  chosen: true,
  examDate: '2024-12-15',
  ECTS: 5,
  contents: [
    { chosen: true, name: 'Lecture 1' },
    { chosen: false, name: 'Lecture 2' },
  ],
};

const testCourseTwo = {
  chosen: true,
  examDate: '2024-12-10',
  ECTS: 3,
  contents: [
    { chosen: true, name: 'Lecture 1' },
  ],
};

const testCourseThree = {
  chosen: false,
  examDate: '2024-12-20',
  ECTS: 4,
  contents: [
    { chosen: true, name: 'Lecture 1' },
  ],
};

const testCourseFour = {
  chosen: true,
  examDate: '2024-11-25',
  ECTS: 6,
  contents: [
    { chosen: true, name: 'Lecture 1' },
    { chosen: true, name: 'Lecture 2' },
  ],
};
const HourMilliSec = 3600000;

describe('PreAlgoMethods', () => {
  describe('constructor', () => {
    const mockUser = {
      userid: '123',
      fullname: 'John Doe',
      schedule: {
        preferEarly: false,
        wantPrep: true,
      },
      settings: {
        startStudyTime: '08:00',
        endStudyTime: '18:00',
        syncCalendars: [],
      },
      courses: [testCourseOne, testCourseTwo, testCourseThree, testCourseFour],
    };
    const algo = new PreAlgoMethods(mockUser, 'emptyFirstComeFirstServe');
    it('should set construcer properties correctly', () => {
      expect(algo.algorithm).toBe('emptyFirstComeFirstServe');
      expect(algo.EarlyLectures).toBe(false);
      expect(algo.preparation).toBe(true);
      expect(algo.StartStudyTime).toBe('08:00');
      expect(algo.EndStudyTime).toBe('18:00');
      expect(algo.studyTimePrDay).toBe(10 * HourMilliSec);
      expect(algo.freeTimePrDay).toBe(14 * HourMilliSec);
      expect(algo.theTime).toBeGreaterThan(0);
      expect(algo.id).toBe('123');
      expect(algo.syncCalendars).toEqual([]);
    });
  });
  describe('prepSchedule', () => {
    it('should correctly create and return a schedule object with the correct properties', () => {
      const mockUser = {
        userid: '123',
        fullname: 'John Doe',
        schedule: {
          preferEarly: false,
          wantPrep: true,
        },
        settings: {
          startStudyTime: '08:00',
          endStudyTime: '18:00',
          syncCalendars: [],
        },
        courses: [testCourseOne, testCourseTwo, testCourseThree, testCourseFour],
      };
      const algo = new PreAlgoMethods(mockUser, 'emptyFirstComeFirstServe');
      const schedule = algo.prepSchedule(algo.Courses);

      expect(schedule).toEqual({
        algorithm: 'emptyFirstComeFirstServe',
        preferEarly: false,
        wantPrep: true,
        Timeblocks: [],
        CreateDate: algo.theTime,
        outdated: false,
      });
    });
  });
  describe('prepCourses', () => {
    let algo;

    beforeEach(() => {
      const mockUser = {
        userid: '123',
        fullname: 'John Doe',
        schedule: {
          preferEarly: false,
          wantPrep: true,
        },
        settings: {
          startStudyTime: '08:00',
          endStudyTime: '18:00',
          syncCalendars: [],
        },
        courses: [testCourseOne, testCourseTwo, testCourseThree, testCourseFour],
      };
      algo = new PreAlgoMethods(mockUser, 'emptyFirstComeFirstServe');
    });

    it('should correctly sort courses by exam date in ascending order for emptyFirstComeFirstServe algorithm', () => {
      algo.algorithm = 'emptyFirstComeFirstServe';
      const sortedCourses = algo.prepCourses(algo.Courses);
      expect(sortedCourses.map((course) => course.examDate)).toEqual(['2024-11-25', '2024-12-10', '2024-12-15']);
    });

    it('should correctly sort courses by exam date in descending order for reverse algorithms', () => {
      algo.algorithm = 'addaptiveGapNoMixing';
      const sortedCourses = algo.prepCourses(algo.Courses);
      expect(sortedCourses.map((course) => course.examDate)).toEqual(['2024-12-15', '2024-12-10', '2024-11-25']);
    });

    it('should filter out non-chosen courses', () => {
      const sortedCourses = algo.prepCourses(algo.Courses);
      const allChosen = sortedCourses.every((course) => course.chosen);
      expect(allChosen).toBeTruthy();
    });

    it('should process contents of each course based on the chosen status of lectures', () => {
      const sortedCourses = algo.prepCourses(algo.Courses);
      sortedCourses.forEach((course) => {
        expect(course.contents.every((content) => content.chosen)).toBeTruthy();
      });
    });

    it('should calculate correct study period per lecture based on ECTS points', () => {
      const sortedCourses = algo.prepCourses(algo.Courses);
      sortedCourses.forEach((course) => {
        const expectedStudyPeriod = Math.ceil((10 * (course.ECTS ?? 5) * HourMilliSec) / course.contents.length);
        expect(course.studyPeriodPrLecture).toBe(expectedStudyPeriod);
      });
    });
  });
});

describe('getUNIXfromTimeOfDay function', () => {
  // Test case 1: Test with a time before the original timestamp
  test('Returns correct timestamp for time before original timestamp', () => {
    const originalTimestamp = 1621000000000;
    const timeOfDay = '05:30'; 
    const expectedTimestamp = 1620963000000;
    expect(getUNIXfromTimeOfDay(originalTimestamp, timeOfDay)).toBe(expectedTimestamp);
  });

  // Test case 2: Test with a time after the original timestamp
  test('Returns correct timestamp for time after original timestamp', () => {
    const originalTimestamp = 1621000000000;
    const timeOfDay = '15:45'; 
    const expectedTimestamp = 1620999900000; 
    expect(getUNIXfromTimeOfDay(originalTimestamp, timeOfDay)).toBe(expectedTimestamp);
  });

  // Test case 3: Test with a time on the same day as the original timestamp
  test('Returns correct timestamp for time on the same day as original timestamp', () => {
    const originalTimestamp = 1621000000000;
    const timeOfDay = '12:00';
    const expectedTimestamp = 1620986400000;
    expect(getUNIXfromTimeOfDay(originalTimestamp, timeOfDay)).toBe(expectedTimestamp);
  });
  // Test case 4: Test with a time as the same time as the original timestamp
  test('Returns correct timestamp for time as the same time as original timestamp', () => {
    const originalTimestamp = 1725000000000;
    const timeOfDay = '08:40';
    const expectedTimestamp = 1725000000000;
    expect(getUNIXfromTimeOfDay(originalTimestamp, timeOfDay)).toBe(expectedTimestamp);
  });
});
