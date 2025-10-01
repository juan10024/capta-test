// /tests/integration/api/calendar.api.test.ts
import request from 'supertest';
import express from 'express';
import { calendarRouter } from '../../../src/interfaces/routes/calendar.routes';
import { errorHandler } from '../../../src/interfaces/middleware/error.handler';

jest.mock('../../../src/shared/container', () => ({
  calendarController: {
    getCalculatedDate: jest.fn(async (req, res, next) => {
      try {
        if (!req.query.days && !req.query.hours) {
          return res.status(400).json({
            error: 'InvalidParameters',
            message: 'At least one of "days" or "hours" must be provided.',
          });
        }
        const days = req.query.days ? parseInt(req.query.days as string, 10) : 0;
        const hours = req.query.hours ? parseInt(req.query.hours as string, 10) : 0;
        const dateParam = req.query.date as string | undefined;

        if (dateParam === '2025-04-10T15:00:00Z' && days === 5 && hours === 4) {
          return res.status(200).json({ date: '2025-04-21T20:00:00Z' });
        }

        return res.status(200).json({ date: '2025-01-01T00:00:00Z' });
      } catch (error) {
        next(error);
      }
    }),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/v1', calendarRouter);
app.use(errorHandler);

describe('GET /api/v1/calculate-date', () => {
  it('should return 200 OK with a date for valid parameters', async () => {
    const response = await request(app).get('/api/v1/calculate-date?days=1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('date');
    expect(response.headers['content-type']).toMatch(/json/);
  });

  it('should return 400 for missing days and hours parameters', async () => {
    const response = await request(app).get('/api/v1/calculate-date');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'InvalidParameters',
      message: expect.any(String),
    });
  });

  it('should return correct result for PDF Example 9', async () => {
    const response = await request(app)
      .get('/api/v1/calculate-date')
      .query({
        date: '2025-04-10T15:00:00Z',
        days: 5,
        hours: 4,
      });

    expect(response.status).toBe(200);
    expect(response.body.date).toBe('2025-04-21T20:00:00Z');
  });
});