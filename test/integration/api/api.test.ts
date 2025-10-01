// /tests/integration/api/api.test.ts
import axios from 'axios';

/**
 * @interface ApiTestCase
 * Defines the strict shape for each test case object, ensuring type safety.
 */
interface ApiTestCase {
  name: string;
  params: {
    days?: number;
    hours?: number;
    date?: string;
  };
  // A fixed ISO string to simulate 'now' for reproducible tests.
  mockNow?: string;
  // The exact expected ISO string output for validation.
  expected?: string;
}

const API_BASE_URL = 'http://localhost:4000/api/v1/calculate-date';

// This array contains all examples from the PDF, typed according to the interface.
// test the millisecond logic.
const testCases: ApiTestCase[] = [
  {
    name: 'Example 1: Friday 5:00 PM + 1 hour → Monday 9:00 AM',
    params: { hours: 1 },
    mockNow: '2025-08-01T22:00:00Z',  // Fri 5pm BOG
    expected: '2025-08-04T14:00:00Z', // Mon 9am BOG
  },
  {
    name: 'Example 2: Saturday 2:00 PM + 1 hour → Monday 9:00 AM',
    params: { hours: 1 },
    mockNow: '2025-08-02T19:00:00Z',  // Sat 2pm BOG
    expected: '2025-08-04T14:00:00Z', // Mon 9am BOG
  },
  {
    name: 'Example 3: Tuesday 3:00 PM + 1 day, 4 hours → Thursday 10:00 AM',
    params: { days: 1, hours: 4 },
    mockNow: '2025-04-08T20:00:00Z',  // Tue 3pm BOG
    expected: '2025-04-10T15:00:00Z', // Thu 10am BOG
  },
  {
    name: 'Example 4: Sunday 6:00 PM + 1 day → Monday 5:00 PM',
    params: { days: 1 },
    mockNow: '2025-04-06T23:00:00Z',  // Sun 6pm BOG
    expected: '2025-04-07T22:00:00Z', // Mon 5pm BOG
  },
  {
    name: 'Example 5: Working day 8:00 AM + 8 hours → same day 5:00 PM',
    params: { hours: 8 },
    mockNow: '2025-04-09T13:00:00Z',  // Wed 8am BOG
    expected: '2025-04-09T22:00:00Z', // Wed 5pm BOG
  },
  {
    name: 'Example 6: Working day 8:00 AM + 1 day → next working day 8:00 AM',
    params: { days: 1 },
    mockNow: '2025-04-09T13:00:00Z',  // Wed 8am BOG
    expected: '2025-04-10T13:00:00Z', // Thu 8am BOG
  },
  {
    name: 'Example 7: Working day 12:30 PM + 1 day → next working day 12:00 PM',
    params: { days: 1 },
    mockNow: '2025-04-09T17:30:00Z',  // Wed 12:30pm BOG
    expected: '2025-04-10T17:00:00Z', // Thu 12pm BOG
  },
  {
    name: 'Example 8: Working day 11:30 AM + 3 hours → same day 3:30 PM',
    params: { hours: 3 },
    mockNow: '2025-04-09T16:30:00Z',  // Wed 11:30am BOG
    expected: '2025-04-09T20:30:00Z', // Wed 3:30pm BOG
  },
  {
    name: 'Example 9: Fixed date 2025-04-10T15:00:00.000Z + 5 days, 4 hours (with holidays)',
    params: { date: '2025-04-10T15:00:00.000Z', days: 5, hours: 4 },
    expected: '2025-04-21T20:00:00.000Z',
  },
];

describe('API Validation against Technical Test Examples', () => {
  testCases.forEach((testCase) => {
    it(testCase.name, async () => {
      const url = new URL(API_BASE_URL);

      const paramsForApi = { ...testCase.params };
      if (!paramsForApi.date && testCase.mockNow) {
        paramsForApi.date = testCase.mockNow;
      }

      for (const key of Object.keys(
        paramsForApi,
      ) as (keyof typeof paramsForApi)[]) {
        const value = paramsForApi[key];
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      }

      const response = await axios.get<{ date: string }>(url.toString());

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('date');

      const currentDate = response.data.date;

      if (testCase.expected) {
        expect(currentDate).toBe(testCase.expected);
      } else {
        expect(currentDate).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
        );
      }
    });
  });
});