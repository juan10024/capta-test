// /tests/unit/domain/working-date.value-object.test.ts
import { WorkingDate } from '../../../src/domain/working-date.value-object';

describe('WorkingDate Value Object', () => {
  const holidays = new Set<string>(['2025-04-17', '2025-04-18']);

  test('should advance 1 hour from Friday 5pm to Monday 9am', () => {
    const startDate = WorkingDate.fromISOUtc('2025-09-26T22:00:00Z');
    const result = startDate.snapToWorkingTime(holidays).addWorkHours(1, holidays);
    expect(result.toISOUtc()).toBe('2025-09-29T14:00:00Z');
  });

  test('should advance 1 day and 4 hours from Tuesday 3pm to Thursday 10am', () => {
    const startDate = WorkingDate.fromISOUtc('2025-09-23T20:00:00Z');
    const result = startDate
      .snapToWorkingTime(holidays)
      .addWorkDays(1, holidays)
      .addWorkHours(4, holidays);
    expect(result.toISOUtc()).toBe('2025-09-25T15:00:00Z');
  });

  test('should handle fixed date with holidays (PDF Example 9)', () => {
    const startDate = WorkingDate.fromISOUtc('2025-04-10T15:00:00Z');
    const result = startDate
      .snapToWorkingTime(holidays)
      .addWorkDays(5, holidays)
      .addWorkHours(4, holidays);
    expect(result.toISOUtc()).toBe('2025-04-21T20:00:00Z');
  });
});