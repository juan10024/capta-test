// /tests/unit/application/calendar.service.test.ts
import { CalendarService } from '../../../src/application/calendar.service';
import { IHolidayRepository } from '../../../src/shared/interfaces/holiday.repository.interface';

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
    mockHolidayRepository.findAll.mockResolvedValue([
      { name: 'Test Holiday', date: new Date('2025-09-29T00:00:00.000Z') },
    ]);

    const input = {
      days: 1,
      hours: 2,
      date: '2025-09-26T20:00:00Z',
    };

    const result = await calendarService.calculateWorkingDate(input);

    expect(mockHolidayRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toBe('2025-09-30T22:00:00Z');
  });

  it('should correctly handle PDF Example 9 with holidays', async () => {
    mockHolidayRepository.findAll.mockResolvedValue([
      { name: 'Maundy Thursday', date: new Date('2025-04-17T00:00:00.000Z') },
      { name: 'Good Friday', date: new Date('2025-04-18T00:00:00.000Z') },
    ]);

    const input = {
      days: 5,
      hours: 4,
      date: '2025-04-10T15:00:00Z',
    };

    const result = await calendarService.calculateWorkingDate(input);

    expect(result).toBe('2025-04-21T20:00:00Z');
  });
});