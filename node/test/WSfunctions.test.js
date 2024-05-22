import jest from 'jest-mock';
import { WSfunctions } from '../app.js';

global.fetch = jest.fn();

describe('WSfunctions', () => {
  let ws;
  const originalConsoleError = console.error;

  beforeEach(() => {
    ws = new WSfunctions('test-token');
    fetch.mockClear();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should fetch enrolled courses', async () => {
    const mockResponse = { courses: [{ name: 'course1', id: 123 }, { name: 'course2', id: 321 }] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await ws.core_course_get_enrolled_courses_by_timeline_classification();
    expect(data).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=test-token&moodlewsrestformat=json&wsfunction=core_course_get_enrolled_courses_by_timeline_classification&classification=inprogress',
    );
  });

  it('should fetch site info', async () => {
    const mockResponse = { username: 'Allan Krog', userID: 111 };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await ws.core_webservice_get_site_info();
    expect(data).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=test-token&moodlewsrestformat=json&wsfunction=core_webservice_get_site_info',
    );
  });

  it('should fetch course contents', async () => {
    const courseID = 123;
    const mockResponse = { contents: ['contents1', 'contents2'] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await ws.core_course_get_contents(courseID);
    expect(data).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=test-token&moodlewsrestformat=json&wsfunction=core_course_get_contents&courseid=${courseID}`,
    );
  });

  it('should fetch course pages', async () => {
    const courseID = 123;
    const mockResponse = { pages: ['page1', 'page2'] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await ws.mod_page_get_pages_by_courses(courseID);
    expect(data).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=test-token&moodlewsrestformat=json&wsfunction=mod_page_get_pages_by_courses&courseids[0]=${courseID}`,
    );
  });

  it('should handle fetch errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network response error'));

    await expect(ws.core_course_get_enrolled_courses_by_timeline_classification())
      .rejects
      .toThrow('Network response error');

    expect(console.error).toHaveBeenCalledWith('Error fetching enrolled courses:', expect.any(Error));
  });

  it('should contruct Moodle date object correctly', async () => {
    const mockCourseResponse = [{ name: 'course1', id: 123 }, { name: 'course2', id: 321 }];
    const mockSiteResponse = { username: 'Allan Krog', userID: 111 };
    const mockContentsResponseForCourse123 = ['contents1', 'contents2'];
    const mockContentsResponseForCourse321 = ['contents3', 'contents4'];
    const mockPagesResponseForCourse123 = ['page1', 'page2'];
    const mockPagesResponseForCourse321 = ['page3', 'page4'];

    fetch.mockImplementation((url) => {
      if (url.includes('core_webservice_get_site_info')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSiteResponse,
        });
      }
      if (url.includes('core_course_get_enrolled_courses_by_timeline_classification')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCourseResponse,
        });
      }
      if (url.includes('core_course_get_contents&courseid=123')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockContentsResponseForCourse123,
        });
      }
      if (url.includes('core_course_get_contents&courseid=321')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockContentsResponseForCourse321,
        });
      }
      if (url.includes('mod_page_get_pages_by_courses&courseids[0]=123')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockPagesResponseForCourse123,
        });
      }
      if (url.includes('mod_page_get_pages_by_courses&courseids[0]=321')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockPagesResponseForCourse321,
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const moodleInfo = await ws.core_webservice_get_site_info();
    moodleInfo.courses = await ws.core_course_get_enrolled_courses_by_timeline_classification();
    await Promise.all(moodleInfo.courses.map(async (course) => {
      course.contents = await ws.core_course_get_contents(course.id);
      course.pages = await ws.mod_page_get_pages_by_courses(course.id);
    }));

    expect(moodleInfo).toEqual({
      username: 'Allan Krog',
      userID: 111,
      courses: [{
        name: 'course1', id: 123, contents: ['contents1', 'contents2'], pages: ['page1', 'page2'],
      },
      {
        name: 'course2', id: 321, contents: ['contents3', 'contents4'], pages: ['page3', 'page4'],
      },
      ],
    });
  });
});
