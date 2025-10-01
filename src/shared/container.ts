// /src/shared/container.ts
import { CalendarService } from '../application/calendar.service';
import { ApiHolidayRepository } from '../infrastructure/repositories/holiday-api.repository';
import { MongoHolidayRepository } from '../infrastructure/repositories/holiday.repository';
import { HolidayCacheService } from '../infrastructure/repositories/holiday-cache.service';
import { CalendarController } from '../infrastructure/controllers/calendar.controller';

/**
 * A simple, manual Dependency Injection (DI) container.
 * It instantiates and wires together all the major classes (services, repositories, controllers).
 * This decouples the classes from each other, making the system more modular and easier to test.
 */

// --- Infrastructure Layer ---
const mongoHolidayRepository = new MongoHolidayRepository();
const apiHolidayRepository = new ApiHolidayRepository();
const holidayCacheService = new HolidayCacheService(
  mongoHolidayRepository,
  apiHolidayRepository,
);

// --- Application Layer ---
const calendarService = new CalendarService(holidayCacheService);

// --- Interface Layer ---
export const calendarController = new CalendarController(calendarService);
