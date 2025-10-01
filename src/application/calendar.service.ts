// /src/application/calendar.service.ts
import { WorkingDate } from '../domain/working-date.value-object';
import { IHolidayRepository } from '../shared/interfaces/holiday.repository.interface';
import { CalculateDateDto } from '../interfaces/DTOs/calendar.dto';

/**
 * @class CalendarService
 * This service class orchestrates the date calculation process.
 * It acts as the primary entry point for the application logic, decoupling the API interface
 * from the underlying domain objects. This is a core element of the Application layer.
 */
export class CalendarService {
  constructor(private readonly holidayRepository: IHolidayRepository) {}

  /**
   * Calculates the final working date based on the provided input.
   * It fetches holidays, creates a WorkingDate value object, and applies the business rules in order.
   * @param {CalculateDateDto} input - The DTO containing days, hours, and an optional start date.
   * @returns {Promise<string>} The calculated date as a UTC ISO string.
   */
  public async calculateWorkingDate(input: CalculateDateDto): Promise<string> {
    const { days = 0, hours = 0, date: isoDate } = input;

    // Fetch holidays and create a performant lookup Set.
    const holidays = await this.holidayRepository.findAll();
    const holidaySet = new Set(
      holidays.map((h) => h.date.toISOString().split('T')[0]),
    );

    // Detect if input date includes milliseconds (".000Z" or ".123Z")
    const hasMilliseconds = isoDate != null && /\.\d{3}Z$/.test(isoDate);

    // Create the initial WorkingDate object, which handles timezone conversion.
    let workingDate = WorkingDate.fromISOUtc(isoDate, hasMilliseconds);

    // Snap the start date to a valid working time as per business rules.
    workingDate = workingDate.snapToWorkingTime(holidaySet);

    // Add days first, then hours, as required.
    workingDate = workingDate.addWorkDays(days, holidaySet);
    workingDate = workingDate.addWorkHours(hours, holidaySet);

    // Convert the final result back to a UTC ISO string for the response.
    return workingDate.toISOUtc();
  }
}
