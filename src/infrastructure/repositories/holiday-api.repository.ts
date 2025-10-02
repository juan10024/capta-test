import axios from 'axios';
import { DateTime } from 'luxon';
import { IHoliday } from '../../domain/holiday.entity';
import { IHolidayRepository } from '../../shared/interfaces/holiday.repository.interface';
import { config } from '../../shared/config';

/**
 * @class ApiHolidayRepository
 * An implementation of the IHolidayRepository that fetches holiday data from an external REST API.
 * This class isolates the logic for interacting with the third-party holiday service.
 */
export class ApiHolidayRepository implements IHolidayRepository {
  /**
   * Fetches all holidays from the configured external API URL.
   * It is designed to handle an array of date strings, as per the actual API response.
   * @returns {Promise<IHoliday[]>} A promise that resolves to an array of holidays.
   */
  async findAll(): Promise<IHoliday[]> {
    try {
      // The external API returns a simple array of strings, e.g., ["2025-01-01", ...].
      const response = await axios.get<string[]>(config.holidayApiUrl);

      // We must map this array of strings to our internal IHoliday domain entity structure.
      return response.data
        .map((dateString) => {
          // Use Luxon to safely parse the date string.
          const holidayDate = DateTime.fromISO(dateString, {
            zone: 'America/Bogota',
          })
            .startOf('day')
            .toJSDate();

          // Validate that the date is valid before returning it.
          if (isNaN(holidayDate.getTime())) {
            console.warn(
              `Invalid date format received from API: ${dateString}`,
            );
            return null;
          }

          // The external API does not provide a name, so we provide a default one.
          // The date is the critical piece of information for our domain logic.
          return {
            date: holidayDate,
            name: 'Holiday',
          };
        })
        .filter((h): h is IHoliday => h !== null); // Filter out any null/invalid dates.
    } catch (error) {
      console.error('Failed to fetch holidays from API:', error);
      return [];
    }
  }

  /**
   * The save method is not applicable for this read-only API source,
   * but it must be implemented to satisfy the interface contract.
   */
  async save(holidays: IHoliday[]): Promise<void> {
    console.warn('ApiHolidayRepository does not support saving.');
    return Promise.resolve();
  }
}