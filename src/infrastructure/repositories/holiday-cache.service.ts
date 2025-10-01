// /src/infrastructure/services/holiday-cache.service.ts
import { IHoliday } from '../../domain/holiday.entity';
import { IHolidayRepository } from '../../shared/interfaces/holiday.repository.interface';
import { config } from '../../shared/config';

/**
 * @class HolidayCacheService
 * This service acts as a strategic adapter, providing a cached layer for holiday data.
 * It decides whether to fetch holidays from the database (cache), or from the external API
 * if the cache is stale or empty. This significantly improves performance and resilience.
 */
export class HolidayCacheService implements IHolidayRepository {
  private lastFetchTime: Date | null = null;

  constructor(
    private readonly dbRepository: IHolidayRepository,
    private readonly apiRepository: IHolidayRepository,
  ) {}

  /**
   * The core method that implements the caching strategy.
   * It checks the cache's freshness and orchestrates fetching and saving data.
   * @returns {Promise<IHoliday[]>} A list of holidays.
   */
  async findAll(): Promise<IHoliday[]> {
    // 1. Check if cache is still valid based on TTL.
    if (this.isCacheValid()) {
      const holidaysFromDb = await this.dbRepository.findAll();
      if (holidaysFromDb.length > 0) {
        console.log('Serving holidays from cache (DB).');
        return holidaysFromDb;
      }
    }

    // 2. If cache is invalid or empty, fetch from the external API.
    console.log('Cache invalid or empty. Fetching from external API.');
    const holidaysFromApi = await this.apiRepository.findAll();

    // 3. Asynchronously save the fresh data to the database (our cache).
    if (holidaysFromApi.length > 0) {
      this.dbRepository.save(holidaysFromApi).then(() => {
        this.lastFetchTime = new Date();
        console.log('Successfully updated holiday cache in DB.');
      });
    }

    return holidaysFromApi;
  }

  // The save method delegates to the underlying DB repository.
  async save(holidays: IHoliday[]): Promise<void> {
    await this.dbRepository.save(holidays);
    this.lastFetchTime = new Date();
  }

  /**
   * Checks if the last fetch time is within the configured TTL (Time-To-Live).
   * This logic determines if the cached data is considered "fresh".
   * @private
   */
  private isCacheValid(): boolean {
    if (!this.lastFetchTime) return false;
    const now = new Date();
    const diffInSeconds = (now.getTime() - this.lastFetchTime.getTime()) / 1000;
    return diffInSeconds < config.holidayCacheTtl;
  }
}
