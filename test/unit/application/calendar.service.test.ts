// /tests/unit/application/calendar.service.test.ts
import { CalendarService } from '../../../src/application/calendar.service';
import { IHolidayRepository } from '../../../src/shared/interfaces/holiday.repository.interface';

// This test demonstrates mocking dependencies. The service is tested in isolation
// from the actual repository implementations.
describe('CalendarService', () => {
  let calendarService: CalendarService;
  let mockHolidayRepository: jest.Mocked<IHolidayRepository>;

  beforeEach(() => {
    mockHolidayRepository = {
      findAll: jest.fn(),
      save: jest.fn(),
    };
    calendarService = new CalendarService(mockHolidayRepository);
  });

  it('should calculate the correct date by calling the repository and domain object', async () => {
    // Arrange
    mockHolidayRepository.findAll.mockResolvedValue([
      { name: 'Test Holiday', date: new Date('2025-09-29T00:00:00.000Z') },
    ]);

    const input = {
      days: 1,
      hours: 2,
      date: '2025-09-26T20:00:00Z', // Fri, 3pm BOG
    };

    // Act
    const result = await calendarService.calculateWorkingDate(input);

    // Assert
    expect(mockHolidayRepository.findAll).toHaveBeenCalledTimes(1);
    // Since Mon is a holiday, 1 day -> Tue 3pm. Then +2 hours -> Tue 5pm.
    expect(result).toBe('2025-09-30T22:00:00Z');
  });
});
