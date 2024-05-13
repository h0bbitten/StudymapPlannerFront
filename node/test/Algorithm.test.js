import { createLectureTimeBlock, PreAlgoMethods, checkOverlap } from '../Algorithm.js';

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
      algo = new PreAlgoMethods(mockUser, 'default');
    });

    it('should correctly sort courses by exam date in ascending order for default algorithm', () => {
      algo.algorithm = 'default'; // Explicitly set to default to avoid ambiguity
      const sortedCourses = algo.prepCourses(algo.Courses);
      expect(sortedCourses.map((course) => course.examDate)).toEqual(['2024-11-25', '2024-12-10', '2024-12-15']);
    });

    it('should correctly sort courses by exam date in descending order for non-default algorithms', () => {
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
        const expectedStudyPeriod = Math.ceil(10 * (course.ECTS ?? 5) * HourMilliSec / course.contents.length);
        expect(course.studyPeriodPrLecture).toBe(expectedStudyPeriod);
      });
    });
  });
});

describe('checkOverlap', () => {
  it('should return true if intervals overlap', () => {
    expect(checkOverlap(10, 20, 15, 25)).toBe(true);
    expect(checkOverlap(10, 20, 5, 15)).toBe(true);
  });

  it('should return false if intervals do not overlap', () => {
    expect(checkOverlap(10, 20, 21, 30)).toBe(false);
    expect(checkOverlap(10, 20, 0, 5)).toBe(false);
  });

  it('should return false if intervals touch but do not overlap', () => {
    expect(checkOverlap(10, 20, 20, 30)).toBe(false);
    expect(checkOverlap(10, 20, 0, 10)).toBe(false);
  });

  it('should return true if one interval is completely within another', () => {
    expect(checkOverlap(10, 20, 12, 18)).toBe(true);
    expect(checkOverlap(10, 20, 10, 20)).toBe(true); // Exact same interval
  });
});
