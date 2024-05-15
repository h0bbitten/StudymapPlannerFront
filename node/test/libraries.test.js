import MockDate from 'mockdate';
import moment from 'moment';

describe('moment()', () => {
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
