import { DateTime } from 'luxon';

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

  private _preserveMilliseconds = false;
  public readonly date: DateTime;

  private constructor(date: DateTime) {
    this.date = date;
  }

  private cloneWith(newDate: DateTime): WorkingDate {
    const newInstance = new WorkingDate(newDate);
    newInstance._preserveMilliseconds = this._preserveMilliseconds;
    return newInstance;
  }

  public static fromISOUtc(
    isoDate?: string,
    preserveMilliseconds = false,
  ): WorkingDate {
    const dateTime = isoDate
      ? DateTime.fromISO(isoDate, { zone: 'utc' })
      : DateTime.now();
    const instance = new WorkingDate(dateTime.setZone(this.TIMEZONE));
    instance._preserveMilliseconds = preserveMilliseconds;
    return instance;
  }

  public snapToWorkingTime(holidays: Set<string>): WorkingDate {
    let current = this.date;

    if (!this.isWorkDay(current, holidays)) {
      do {
        current = current.minus({ days: 1 });
      } while (!this.isWorkDay(current, holidays));
      return this.cloneWith(
        current.set({
          hour: WorkingDate.WORK_END_HOUR,
          minute: 0,
          second: 0,
          millisecond: 0,
        }),
      );
    }

    if (current.hour < WorkingDate.WORK_START_HOUR) {
      let prev = current.minus({ days: 1 });
      while (!this.isWorkDay(prev, holidays)) {
        prev = prev.minus({ days: 1 });
      }
      return this.cloneWith(
        prev.set({
          hour: WorkingDate.WORK_END_HOUR,
          minute: 0,
          second: 0,
          millisecond: 0,
        }),
      );
    }

    if (current.hour >= WorkingDate.WORK_END_HOUR) {
      return this.cloneWith(
        current.set({
          hour: WorkingDate.WORK_END_HOUR,
          minute: 0,
          second: 0,
          millisecond: 0,
        }),
      );
    }

    if (
      current.hour >= WorkingDate.LUNCH_START_HOUR &&
      current.hour < WorkingDate.LUNCH_END_HOUR
    ) {
      return this.cloneWith(
        current.set({
          hour: WorkingDate.LUNCH_START_HOUR,
          minute: 0,
          second: 0,
          millisecond: 0,
        }),
      );
    }

    return this.cloneWith(current);
  }

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
    return this.cloneWith(newDate);
  }

  /**
   * Adds a specified number of working hours by converting them to minutes for precision.
   * This method uses a robust block-based calculation, avoiding floating-point inaccuracies
   * and correctly handling all boundary conditions like lunch and end-of-day.
   * @param {number} hours - The number of working hours to add.
   * @param {Set<string>} holidays - A set of holiday dates in 'yyyy-MM-dd' format.
   * @returns {WorkingDate} A new WorkingDate instance with the hours added.
   */
  public addWorkHours(hours: number, holidays: Set<string>): WorkingDate {
    if (hours <= 0) return this;

    let current = this.date;
    let remainingMinutes = hours * 60;

    while (remainingMinutes > 0) {
      if (
        !this.isWorkDay(current, holidays) ||
        current.hour >= WorkingDate.WORK_END_HOUR
      ) {
        current = this.findNextWorkMoment(current.plus({ days: 1 }), holidays);
        continue;
      }
      if (current.hour < WorkingDate.WORK_START_HOUR) {
        current = this.findNextWorkMoment(current, holidays);
        continue;
      }
      if (
        current.hour >= WorkingDate.LUNCH_START_HOUR &&
        current.hour < WorkingDate.LUNCH_END_HOUR
      ) {
        current = current.set({ hour: WorkingDate.LUNCH_END_HOUR, minute: 0 });
        continue;
      }

      const isMorning = current.hour < WorkingDate.LUNCH_START_HOUR;
      const blockEnd = isMorning
        ? current.set({ hour: WorkingDate.LUNCH_START_HOUR, minute: 0 })
        : current.set({ hour: WorkingDate.WORK_END_HOUR, minute: 0 });

      const availableMinutes = blockEnd.diff(current).as('minutes');
      const minutesToUse = Math.min(remainingMinutes, availableMinutes);

      current = current.plus({ minutes: minutesToUse });
      remainingMinutes -= minutesToUse;
    }

    return this.cloneWith(current);
  }

  public toISOUtc(): string {
    return this.date
      .toUTC()
      .toISO({ suppressMilliseconds: !this._preserveMilliseconds })!;
  }

  private isWorkDay(date: DateTime, holidays: Set<string>): boolean {
    const isWeekend = date.weekday >= 6; // Saturday is 6, Sunday is 7
    const isHoliday = holidays.has(date.toFormat('yyyy-MM-dd'));
    return !isWeekend && !isHoliday;
  }

  private findNextWorkMoment(date: DateTime, holidays: Set<string>): DateTime {
    let nextDate = date.set({ minute: 0, second: 0, millisecond: 0 });

    while (!this.isWorkDay(nextDate, holidays)) {
      nextDate = nextDate.plus({ days: 1 });
    }
    return nextDate.set({ hour: WorkingDate.WORK_START_HOUR });
  }
}