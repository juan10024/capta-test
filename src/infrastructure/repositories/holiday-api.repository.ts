// /src/infrastructure/repositories/holiday-api.repository.ts
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
   * @returns {Promise<IHoliday[]>} A promise that resolves to an array of holidays.
   */
  async findAll(): Promise<IHoliday[]> {
    try {
      const response = await axios.get<{ date: string; name: string }[]>(
        config.holidayApiUrl,
      );
      // The response data is validated and mapped to our internal IHoliday domain entity.
      // This mapping protects our domain from changes in the external API's data structure.
      return response.data
        .map((h) => {
          const holidayDate = DateTime.fromISO(h.date, {
            zone: 'America/Bogota',
          })
            .startOf('day')
            .toJSDate();

          
          if (isNaN(holidayDate.getTime())) {
            console.warn(`Invalid date format received from API: ${h.date}`);
            return null;
          }

          return {
            date: holidayDate,
            name: h.name,
          };
        })
        .filter((h): h is IHoliday => h !== null);
    } catch (error) {
      console.error('Failed to fetch holidays from API:', error);
      // In a real-world scenario, you might have more sophisticated error handling,
      // like retries or falling back to a different data source.
      return [];
    }
  }

  // The save method is not applicable for this read-only API source,
  // but it must be implemented to satisfy the interface contract.
  async save(holidays: IHoliday[]): Promise<void> {
    console.warn('ApiHolidayRepository does not support saving.');
    return Promise.resolve();
  }
}

