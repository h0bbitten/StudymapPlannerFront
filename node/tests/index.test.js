// Til funktionen der skal importeres må den først exporteres: module.exports = functionName;

// Import the necessary modules and functions
const calculateSchedule = require("../index.js");
import moment from 'moment';
import fs from 'fs';
import fetch from 'node-fetch';

// Mock the external dependencies
jest.mock('moment', () => {
  return () => jest.requireActual('moment')("2024-01-01T00:00:00.000Z");
});
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    readdir: jest.fn(),
    access: jest.fn(),
  }
}));
jest.mock('node-fetch', () => jest.fn());

// Describe the test suite for calculateSchedule
describe('calculateSchedule', () => {
  // Setup common variables
  let user;
  let algorithm;

  beforeEach(() => {
    user = {
      userid: '1',
      fullname: 'Test User',
      schedule: {
        preferEarly: true,
        wantPrep: true
      },
      settings: {
        startStudyTime: '08:00',
        endStudyTime: '20:00',
        syncCalendars: []
      },
      courses: [
        {
          fullname: 'Introduction to AI',
          chosen: true,
          examDate: '2024-02-01',
          ECTS: 3,
          contents: [{ name: 'Lecture 1', chosen: true }, { name: 'Lecture 2', chosen: true }]
        }
      ]
    };
    algorithm = 'default';

    // Mock fs methods
    fs.promises.readFile.mockResolvedValue('BEGIN:VCALENDAR...');
    fs.promises.readdir.mockResolvedValue(['calendar1.ics']);
    fs.promises.access.mockResolvedValue();

    // Mock fetch for external ICAL files
    fetch.mockResolvedValue({
      text: () => Promise.resolve('BEGIN:VCALENDAR...')
    });
  });

  it('should create a correct schedule', async () => {
    const result = await calculateSchedule(user, algorithm);
    expect(result).toEqual(expect.any(Object));
    expect(result.Timeblocks).toEqual(expect.any(Array));
    expect(result.CreateDate).toEqual(moment().valueOf());
    // Add more detailed assertions based on expected output
  });

  it('handles no courses selected', async () => {
    user.courses = [];
    const result = await calculateSchedule(user, algorithm);
    expect(result.Timeblocks.length).toBe(0);
  });

  // Add more test cases as needed
});
