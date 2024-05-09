import calculateSchedule from '../Algorithm'; 
import PreAlgoMethods from '../Algorithm';

// Mocking necessary imports
jest.mock('moment', () => () => ({valueOf: () => 123456789, diff: () => 123456, duration: () => ({ asMilliseconds: () => 54000000 }), startOf: () => 123456789, unix: () => 123456}));
jest.mock('fs/promises');
jest.mock('node-fetch', () => jest.fn());

  describe('prepCourses', () => {
    it('should prepare courses correctly', () => {
      const userMock = {
        courses: [
          { chosen: true, examDate: '2021-12-15', ECTS: 3, contents: [{ chosen: true }, { chosen: false }] },
          { chosen: false }
        ]
      };
      const instance = new PreAlgoMethods(userMock, 'default');
      const result = instance.prepCourses(userMock.courses);
      expect(result.length).toBe(1);
      expect(result[0].contents.length).toBe(1);
    });
  });