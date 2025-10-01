// /tests/integration/api/calendar.api.test.ts
import request from 'supertest';
import express from 'express';
import { calendarRouter } from '../../../src/interfaces/routes/calendar.routes';
import { errorHandler } from '../../../src/interfaces/middleware/error.handler';
// Mock the DI container to prevent real DB calls
jest.mock('../../../src/shared/container', () => ({
  calendarController: {
    getCalculatedDate: jest.fn(async (req, res) => {
      // Provide a fixed, predictable response for API contract testing
      if (!req.query.days && !req.query.hours) {
        return res.status(400).json({
          error: 'InvalidParameters',
          message: 'Error',
        });
      }
      return res.status(200).json({ date: '2025-01-01T00:00:00Z' });
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

  // ... more integration tests for validation rules
});
