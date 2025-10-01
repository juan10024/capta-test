//src/interfaces/validators/calendar.validator.ts
import { query, ValidationChain } from 'express-validator';

/**
 * An array of validation chains for the /calculate-date endpoint.
 * Using express-validator centralizes and declaratively defines input validation rules,
 * keeping the controller logic clean and focused on its primary responsibility.
 */
export const validateCalculateDate: ValidationChain[] = [
  // Rule: At least one of 'days' or 'hours' must be present.
  query().custom((value, { req }) => {
    // This custom validator checks the entire query object.
    if (!req.query?.days && !req.query?.hours) {
      throw new Error("At least one of 'days' or 'hours' must be provided.");
    }
    return true;
  }),

  // Rule: 'days' must be a non-negative integer if it exists.
  query('days')
    .optional()
    .isInt({ gt: -1 })
    .withMessage('The "days" parameter must be a positive integer.'),

  // Rule: 'hours' must be a non-negative integer if it exists.
  query('hours')
    .optional()
    .isInt({ gt: -1 })
    .withMessage('The "hours" parameter must be a positive integer.'),

  // Rule: 'date' must be a valid ISO 8601 string with a 'Z' if it exists.
  query('date')
    .optional()
    .isISO8601()
    .withMessage('The "date" parameter must be a valid ISO 8601 string.')
    .bail()
    .matches(/Z$/)
    .withMessage('The "date" parameter must be in UTC and end with "Z".'),
];

