// /src/shared/interfaces/holiday.repository.interface.ts
import { IHoliday } from '../../domain/holiday.entity';

/**
 * @interface IHolidayRepository
 * Defines the contract (methods) that any holiday repository must implement.
 * This is a key part of the Repository Pattern, allowing the application layer
 * to depend on this abstraction, not on a concrete implementation like MongoDB.
 */
export interface IHolidayRepository {
  findAll(): Promise<IHoliday[]>;
  save(holidays: IHoliday[]): Promise<void>;
}
