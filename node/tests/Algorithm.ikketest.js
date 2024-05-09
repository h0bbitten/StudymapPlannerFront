// Define mock courses with all necessary properties
const testCourseOne = {
  chosen: true, 
  examDate: '2024-12-15', 
  ECTS: 5, 
  contents: [
    { chosen: true, name: 'Lecture 1' }, 
    { chosen: false, name: 'Lecture 2' }
  ]
};

const testCourseTwo = {
  chosen: true, 
  examDate: '2024-12-10', 
  ECTS: 3, 
  contents: [
    { chosen: true, name: 'Lecture 1' }
  ]
};

const testCourseThree = {
  chosen: false, 
  examDate: '2024-12-20', 
  ECTS: 4, 
  contents: [
    { chosen: true, name: 'Lecture 1' }
  ]
};

const testCourseFour = {
  chosen: true, 
  examDate: '2024-11-25', 
  ECTS: 6, 
  contents: [
    { chosen: true, name: 'Lecture 1' },
    { chosen: true, name: 'Lecture 2' }
  ]
};

describe('PreAlgoMethods', () => {
  describe('prepCourses', () => {
    let algo;

    beforeEach(() => {
      const mockUser = {
        userid: '123',
        fullname: 'John Doe',
        schedule: {
          preferEarly: false,
          wantPrep: true
        },
        settings: {
          startStudyTime: '08:00',
          endStudyTime: '18:00',
          syncCalendars: []
        },
        courses: [testCourseOne, testCourseTwo, testCourseThree, testCourseFour]
      };
      algo = new PreAlgoMethods(mockUser, 'default');
    });

    it('should correctly sort courses by exam date in ascending order for default algorithm', () => {
      const sortedCourses = algo.prepCourses(algo.Courses);
      expect(sortedCourses.map(course => course.examDate)).toEqual(['2024-11-25', '2024-12-10', '2024-12-15']);
    });

    it('should correctly sort courses by exam date in descending order for non-default algorithms', () => {
      algo.algorithm = 'addaptiveGapNoMixing';
      const sortedCourses = algo.prepCourses(algo.Courses);
      expect(sortedCourses.map(course => course.examDate)).toEqual(['2024-12-15', '2024-12-10', '2024-11-25']);
    });

    it('should filter out non-chosen courses', () => {
      const sortedCourses = algo.prepCourses(algo.Courses);
      const allChosen = sortedCourses.every(course => course.chosen);
      expect(allChosen).toBeTruthy();
    });

    it('should process contents of each course based on the chosen status of lectures', () => {
      const sortedCourses = algo.prepCourses(algo.Courses);
      sortedCourses.forEach(course => {
        expect(course.contents.every(content => content.chosen)).toBeTruthy();
      });
    });

    it('should calculate correct study period per lecture based on ECTS points', () => {
      const sortedCourses = algo.prepCourses(algo.Courses);
      sortedCourses.forEach(course => {
        const expectedStudyPeriod = Math.ceil(10 * (course.ECTS ?? 5) * HourMilliSec / course.contents.length);
        expect(course.studyPeriodPrLecture).toBe(expectedStudyPeriod);
      });
    });
  });
});
