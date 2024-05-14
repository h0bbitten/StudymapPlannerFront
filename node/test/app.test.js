import { checkIfLecturesDone } from '../app.js';

describe('checkIfLecturesDone function', () => {
  let testSchedule;
  let testUserCourses;

  beforeEach(() => {
    testSchedule = {
      Timeblocks: [{
        type: 'lecture',
        courseID: 333,
        ID: 321,
        startTime: 1620000000000,
        endTime: 1620003600000,
        description: 'Test Lecture 1',
        status: 'active',
      }, {
        type: 'lecture',
        courseID: 333,
        ID: 322,
        startTime: 1620007200000,
        endTime: 1715626742000,
        description: 'Test Lecture 2',
        status: 'active',
      }, {
        type: 'lecture',
        courseID: 444,
        ID: 421,
        startTime: 1620000000000,
        endTime: 1620003600000,
        description: 'Test Lecture 3',
        status: 'active',
      }, {
        type: 'lecture',
        courseID: 444,
        ID: 422,
        startTime: 1620007200000,
        endTime: 1715626742000,
        description: 'Test Lecture 4',
        status: 'active',
      }],
    };

    testUserCourses = [{
      id: 333,
      fullname: 'Test Course',
      contents: [{
        id: 321,
        name: 'Test Lecture',
        chosen: true,
      }, {
        id: 322,
        name: 'Test Lecture 2',
        chosen: true,
      }],
    }, {
      id: 444,
      fullname: 'Test Course 2',
      contents: [{
        id: 421,
        name: 'Test Lecture 3',
        chosen: true,
      }, {
        id: 422,
        name: 'Test Lecture 4',
        chosen: true,
      }],
    }];
  });

  it('marks lectures as done and unchecks them if endTime is in the past', () => {
    const currentTime = new Date().getTime(); // Current time in milliseconds
    // Set endTime of Lecture 1 to a past time
    testSchedule.Timeblocks[0].endTime = currentTime - 10000;

    const [updatedSchedule, updatedUserCourses] = checkIfLecturesDone(testSchedule, testUserCourses);

    // Check if Lecture 1 status is 'done' and Lecture 1 is unchecked in the user courses
    expect(updatedSchedule.Timeblocks[0].status).toBe('done');
    expect(updatedUserCourses[0].contents[0].chosen).toBe(false);
  });

  it('does not mark lectures as done if endTime is in the future', () => {
    const currentTime = new Date().getTime(); // Current time in milliseconds
    // Set endTime of Lecture 2 to a future time
    testSchedule.Timeblocks[1].endTime = currentTime + 10000;

    const [updatedSchedule, updatedUserCourses] = checkIfLecturesDone(testSchedule, testUserCourses);

    // Check if Lecture 2 status remains 'active' and Lecture 2 remains checked in the user courses
    expect(updatedSchedule.Timeblocks[1].status).toBe('active');
    expect(updatedUserCourses[0].contents[1].chosen).toBe(true);
  });

  it('marks lectures as done if endTime is equal to the current time', () => {
    const currentTime = new Date().getTime(); // Current time in milliseconds
    // Set endTime of Lecture 1 to the current time
    testSchedule.Timeblocks[0].endTime = currentTime;

    const [updatedSchedule, updatedUserCourses] = checkIfLecturesDone(testSchedule, testUserCourses);

    // Check if Lecture 1 status is 'done' and Lecture 1 is unchecked in the user courses
    expect(updatedSchedule.Timeblocks[0].status).toBe('done');
    expect(updatedUserCourses[0].contents[0].chosen).toBe(false);
  });

  it('does not mark lectures as done if endTime is in the past but already marked as done', () => {
    // Set Lecture 3 status to 'done'
    testSchedule.Timeblocks[2].status = 'done';

    const [updatedSchedule, updatedUserCourses] = checkIfLecturesDone(testSchedule, testUserCourses);

    // Check if Lecture 3 status remains 'done' and Lecture 3 remains unchecked in the user courses
    expect(updatedSchedule.Timeblocks[2].status).toBe('done');
    expect(updatedUserCourses[1].contents[0].chosen).toBe(true);
  });

// Add more it statements and test cases as needed to cover different scenarios
});
