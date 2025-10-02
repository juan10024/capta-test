import { Request, Response, NextFunction } from 'express';

/**
 * A centralized error handling middleware for the Express application.
 * It catches all errors passed to `next(error)` and formats them into a consistent
 * JSON response, preventing stack traces from leaking to the client.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  console.error(err.stack); // Log the full error for debugging.

  // Send a generic 500 Internal Server Error response.
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred on the server.',
  });
};
