import MockDate from 'mockdate';
import moment from 'moment';
import puppeteer from 'puppeteer';
import ICAL from 'ical.js';

describe('moment library', () => {
  beforeEach(() => {
    MockDate.set('2024-05-10T12:00:00Z');
  });

  afterEach(() => {
    MockDate.reset();
  });

  it('should correctly retrieve the current date and time after being mocked', () => {
    const now = moment.utc();
    expect(now.format()).toEqual('2024-05-10T12:00:00Z');

    expect(now.year()).toEqual(2024);
    expect(now.month()).toEqual(4);
    expect(now.date()).toEqual(10);
    expect(now.hour()).toEqual(12);
    expect(now.minute()).toEqual(0);
    expect(now.second()).toEqual(0);
  });
});

describe('puppeteer library, Google Search Page', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should display "Google" text on the page', async () => {
    await page.goto('https://www.google.com');
    const title = await page.title();
    expect(title).toBe('Google');
  });

  it('should have a search input field', async () => {
    await page.goto('https://www.google.com');
    await page.waitForSelector('textarea[name="q"]');
    const searchInput = await page.$('textarea[name="q"]');
    expect(searchInput).toBeTruthy();
  });
});

describe('ICAL library', () => {
  it('should parse a valid iCalendar string', () => {
    const icalString = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp.//CalDAV Client//EN
BEGIN:VEVENT
UID:20180518T100000Z-123401@example.com
DTSTAMP:20180518T100000Z
DTSTART:20180518T100000Z
DTEND:20180518T120000Z
SUMMARY:Meeting
DESCRIPTION:Team meeting at 10am.
END:VEVENT
END:VCALENDAR`;

    const jcalData = ICAL.parse(icalString);
    const component = new ICAL.Component(jcalData);
    const event = component.getFirstSubcomponent('vevent');

    expect(event).toBeTruthy();
    expect(event.getFirstPropertyValue('summary')).toBe('Meeting');
    expect(event.getFirstPropertyValue('description')).toBe('Team meeting at 10am.');
  });

  it('should generate a valid iCalendar string from a VEVENT component', () => {
    const event = new ICAL.Component('vevent');
    event.addPropertyWithValue('summary', 'Meeting');
    event.addPropertyWithValue('dtstart', ICAL.Time.now());
    event.addPropertyWithValue('dtend', ICAL.Time.now().clone().adjust(1, 0, 0, 0));

    const calendar = new ICAL.Component('vcalendar');
    calendar.addSubcomponent(event);

    const generatedString = calendar.toString();
    expect(generatedString).toContain('BEGIN:VEVENT');
    expect(generatedString).toContain('SUMMARY:Meeting');
    expect(generatedString).toContain('DTSTART');
    expect(generatedString).toContain('DTEND');
    expect(generatedString).toContain('END:VEVENT');
  });
});
