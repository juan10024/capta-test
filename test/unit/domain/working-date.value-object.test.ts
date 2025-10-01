// /tests/unit/domain/working-date.value-object.test.ts
import { WorkingDate } from '../../../src/domain/working-date.value-object';

describe('WorkingDate Value Object', () => {
  const holidays = new Set<string>(['2025-04-17', '2025-04-18']); // Maundy Thursday, Good Friday

  // Test case based on PDF Example 1 & 2
  test('should advance 1 hour from Friday 5pm to Monday 9am', () => {
    const startDate = WorkingDate.fromISOUtc('2025-09-26T22:00:00Z'); // Fri 5pm BOG
    const result = startDate.snapToWorkingTime(holidays).addWorkHours(1, holidays);
    expect(result.toISOUtc()).toBe('2025-09-29T14:00:00Z'); // Mon 9am BOG
  });

  // Test case based on PDF Example 3
  test('should advance 1 day and 4 hours from Tuesday 3pm to Thursday 10am', () => {
    const startDate = WorkingDate.fromISOUtc('2025-09-23T20:00:00Z'); // Tue 3pm BOG
    const result = startDate
      .snapToWorkingTime(holidays)
      .addWorkDays(1, holidays)
      .addWorkHours(4, holidays);
    expect(result.toISOUtc()).toBe('2025-09-25T15:00:00Z'); // Thu 10am BOG
  });
  
  // ... more tests for all PDF examples and edge cases
});
