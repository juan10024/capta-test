import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { CalendarService } from '../../application/calendar.service';
import { CalculateDateDto } from '../../interfaces/DTOs/calendar.dto';

/**
 * @class CalendarController
 * This controller handles incoming HTTP requests for the calendar endpoint.
 * Its role is to parse the request, call the application service with valid data,
 * and format the HTTP response. It acts as the bridge between the web and the application layer.
 */
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  /**
   * The main handler for the GET /calculate-date endpoint.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  public async getCalculatedDate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    // Check for validation errors from the express-validator middleware.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'InvalidParameters',
        message: errors.array()[0].msg,
      });
      return;
    }

    try {
      // Sanitize and map query parameters to a DTO.
      const queryParams: CalculateDateDto = {
        days: req.query.days ? parseInt(req.query.days as string, 10) : 0,
        hours: req.query.hours ? parseInt(req.query.hours as string, 10) : 0,
        date: req.query.date as string | undefined,
      };

      // Call the application service to execute the business logic.
      const resultDate = await this.calendarService.calculateWorkingDate(
        queryParams,
      );

      // Send the successful response with the correct structure.
      res.status(200).json({ date: resultDate });
    } catch (error) {
      // Pass any unexpected errors to the centralized error handler.
      next(error);
    }
  }
}
