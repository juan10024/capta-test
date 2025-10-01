// /src/shared/config/index.ts
import 'dotenv/config';

/**
 * Centralized configuration object for the application.
 * It safely reads environment variables and provides typed, default values,
 * preventing runtime errors from missing or misconfigured environment settings.
 */
export const config = {
  port: process.env.PORT || 3000,
  mongo: {
    uri:
      process.env.MONGO_URI ||
      'mongodb://localhost:27017/working_days_default',
  },
  holidayApiUrl:
    process.env.HOLIDAY_API_URL ||
    'https://content.capta.co/Recruitment/WorkingDays.json',
  holidayCacheTtl: process.env.HOLIDAY_CACHE_TTL_SECONDS
    ? parseInt(process.env.HOLIDAY_CACHE_TTL_SECONDS, 10)
    : 86400, // Default to 24 hours
};
