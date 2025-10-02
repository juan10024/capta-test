import { Router } from 'express';
import { calendarController } from '../../shared/container';
import { validateCalculateDate } from '../validators/calendar.validator';

/**
 * Defines the routes for the calendar-related endpoints.
 * It wires up the controller methods and validation middleware to specific URL paths.
 * This separation keeps the routing configuration clean and organized.
 */
const router = Router();

router.get(
  '/calculate-date',
  validateCalculateDate, // Apply validation middleware before the controller.
  calendarController.getCalculatedDate.bind(calendarController),
);

export { router as calendarRouter };
