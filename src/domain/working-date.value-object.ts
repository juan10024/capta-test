// /src/domain/working-date.value-object.ts
import { DateTime, Duration, Interval } from 'luxon';

/**
 * @class WorkingDate
 * A Value Object that encapsulates the business logic for date calculations.
 * It is immutable; all manipulation methods return a new WorkingDate instance.
 * This is the heart of the domain, containing all rules about working hours, days, and holidays.
 */
export class WorkingDate {
  private static readonly TIMEZONE = 'America/Bogota';
  private static readonly WORK_START_HOUR = 8;
  private static readonly LUNCH_START_HOUR = 12;
  private static readonly LUNCH_END_HOUR = 13;
  private static readonly WORK_END_HOUR = 17;

  public readonly date: DateTime;

  private constructor(date: DateTime) {
    // This constructor is private to enforce creation through static factory methods,
    // ensuring all instances are correctly configured with the Bogota timezone.
    this.date = date;
  }

  /**
   * Creates a new WorkingDate instance from a UTC ISO string or defaults to now.
   * This factory is the primary entry point for creating WorkingDate objects.
   * @param {string | undefined} isoDate - An optional UTC ISO date string.
   * @returns {WorkingDate} A new WorkingDate instance.
   */
  public static fromISOUtc(isoDate?: string): WorkingDate {
    const dateTime = isoDate
      ? DateTime.fromISO(isoDate, { zone: 'utc' })
      : DateTime.now().setZone('utc');

    // All internal calculations are done in Bogota time.
    return new WorkingDate(dateTime.setZone(this.TIMEZONE));
  }

  /**
   * Snaps the date backwards to the last valid working moment if it's outside working hours.
   * This enforces the rule that calculations must start from a valid working time.
   * @param {Set<string>} holidays - A set of holiday dates in 'yyyy-MM-dd' format.
   * @returns {WorkingDate} A new WorkingDate instance at a valid working time.
   */
  public snapToWorkingTime(holidays: Set<string>): WorkingDate {
    let currentDate = this.date;

    // Move backwards day by day until a working day is found
    while (!this.isWorkDay(currentDate, holidays)) {
      currentDate = currentDate.minus({ days: 1 }).endOf('day');
    }

    const isBeforeWork = currentDate.hour < WorkingDate.WORK_START_HOUR;
    const isAfterWork = currentDate.hour >= WorkingDate.WORK_END_HOUR;
    const isDuringLunch =
      currentDate.hour >= WorkingDate.LUNCH_START_HOUR &&
      currentDate.hour < WorkingDate.LUNCH_END_HOUR;

    if (isAfterWork || isDuringLunch) {
      // If after 5 PM or during lunch, snap to 5 PM
      return new WorkingDate(
        currentDate.set({
          hour: WorkingDate.WORK_END_HOUR,
          minute: 0,
          second: 0,
          millisecond: 0,
        }),
      );
    }

    if (isBeforeWork) {
      // If before 8 AM, snap to 5 PM of the previous working day
      let prevDay = currentDate.minus({ days: 1 });
      while (!this.isWorkDay(prevDay, holidays)) {
        prevDay = prevDay.minus({ days: 1 });
      }
      return new WorkingDate(
        prevDay.set({
          hour: WorkingDate.WORK_END_HOUR,
          minute: 0,
          second: 0,
          millisecond: 0,
        }),
      );
    }

    return new WorkingDate(currentDate);
  }

  /**
   * Adds a specified number of working days to the current date.
   * It intelligently skips weekends and holidays.
   * @param {number} days - The number of working days to add.
   * @param {Set<string>} holidays - A set of holiday dates in 'yyyy-MM-dd' format.
   * @returns {WorkingDate} A new WorkingDate instance with the days added.
   */
  public addWorkDays(days: number, holidays: Set<string>): WorkingDate {
    if (days <= 0) return this;

    let newDate = this.date;
    let daysAdded = 0;

    while (daysAdded < days) {
      newDate = newDate.plus({ days: 1 });
      if (this.isWorkDay(newDate, holidays)) {
        daysAdded++;
      }
    }

    return new WorkingDate(newDate);
  }

  /**
   * Adds a specified number of working hours to the current date.
   * This method contains the core logic for advancing time, handling lunch breaks and end-of-day rollovers.
   * Its O(1)-like behavior for large hour additions is a key performance optimization.
   * @param {number} hours - The number of working hours to add.
   * @param {Set<string>} holidays - A set of holiday dates in 'yyyy-MM-dd' format.
   * @returns {WorkingDate} A new WorkingDate instance with the hours added.
   */
  public addWorkHours(hours: number, holidays: Set<string>): WorkingDate {
    if (hours <= 0) return this;

    let remainingDuration = Duration.fromObject({ hours });
    let currentDate = this.date;

    // Total working hours in a day is 8 (8-12 and 1-5).
    const hoursPerWorkDay =
      WorkingDate.WORK_END_HOUR -
      WorkingDate.WORK_START_HOUR -
      (WorkingDate.LUNCH_END_HOUR - WorkingDate.LUNCH_START_HOUR);

    // Optimization: Add full days for large hour values
    if (remainingDuration.as('hours') >= hoursPerWorkDay) {
      const fullDaysToAdd = Math.floor(
        remainingDuration.as('hours') / hoursPerWorkDay,
      );
      currentDate = this.addWorkDays(fullDaysToAdd, holidays).date;
      remainingDuration = remainingDuration.minus({
        hours: fullDaysToAdd * hoursPerWorkDay,
      });
    }

    // Add remaining hours minute by minute for precision
    while (remainingDuration.as('minutes') > 0) {
      currentDate = currentDate.plus({ minutes: 1 });

      // If we land on a non-working day, advance to the start of the next working day
      while (!this.isWorkDay(currentDate, holidays)) {
        currentDate = currentDate
          .plus({ days: 1 })
          .set({ hour: WorkingDate.WORK_START_HOUR, minute: 0 });
      }

      const isWorkTime = this.isWorkTime(currentDate);

      if (isWorkTime) {
        remainingDuration = remainingDuration.minus({ minutes: 1 });
      } else {
        // If outside work hours, jump to the next valid time slot
        if (currentDate.hour >= WorkingDate.WORK_END_HOUR) {
          // Jump to start of next day
          currentDate = currentDate
            .plus({ days: 1 })
            .set({ hour: WorkingDate.WORK_START_HOUR, minute: 0 });
        } else if (
          currentDate.hour >= WorkingDate.LUNCH_START_HOUR &&
          currentDate.hour < WorkingDate.LUNCH_END_HOUR
        ) {
          // Jump to end of lunch
          currentDate = currentDate.set({ hour: WorkingDate.LUNCH_END_HOUR, minute: 0 });
        } else if (currentDate.hour < WorkingDate.WORK_START_HOUR) {
          // Jump to start of work
          currentDate = currentDate.set({ hour: WorkingDate.WORK_START_HOUR, minute: 0 });
        }
      }
    }

    return new WorkingDate(currentDate);
  }

  /**
   * Converts the internal Bogota-time date to a UTC ISO string.
   * This is the final step before returning the data to the client.
   * @returns {string} The date in UTC ISO 8601 format with a 'Z' suffix.
   */
  public toISOUtc(): string {
    return this.date.setZone('utc').toISO({ suppressMilliseconds: true })!;
  }

  private isWorkDay(date: DateTime, holidays: Set<string>): boolean {
    const isWeekend = date.weekday > 5; // Saturday is 6, Sunday is 7
    const isHoliday = holidays.has(date.toFormat('yyyy-MM-dd'));
    return !isWeekend && !isHoliday;
  }

  private isWorkTime(date: DateTime): boolean {
    const morningWorkHours = Interval.fromISO(
      `${date.toISODate()}T08:00/${date.toISODate()}T12:00`,
    );
    const afternoonWorkHours = Interval.fromISO(
      `${date.toISODate()}T13:00/${date.toISODate()}T17:00`,
    );

    return morningWorkHours.contains(date) || afternoonWorkHours.contains(date);
  }
}
