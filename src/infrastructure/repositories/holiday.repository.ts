// /src/infrastructure/repositories/holiday.repository.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IHoliday } from '../../domain/holiday.entity';
import { IHolidayRepository } from '../../shared/interfaces/holiday.repository.interface';

// This defines the Mongoose document interface, extending our domain entity.
interface IHolidayDocument extends IHoliday, Document {}

// This is the Mongoose schema that maps our domain entity to a MongoDB collection.
const HolidaySchema: Schema = new Schema({
  date: { type: Date, required: true, unique: true },
  name: { type: String, required: true },
});

const HolidayModel = mongoose.model<IHolidayDocument>('Holiday', HolidaySchema);

/**
 * @class MongoHolidayRepository
 * An implementation of IHolidayRepository that uses MongoDB for persistence.
 * This class handles all the logic for storing and retrieving holiday data from the database.
 */
export class MongoHolidayRepository implements IHolidayRepository {
  async findAll(): Promise<IHoliday[]> {
    return await HolidayModel.find().sort({ date: 1 }).exec();
  }

  /**
   * Saves an array of holidays to the database.
   * It uses an "upsert" operation to avoid creating duplicates and to update existing entries if needed.
   * @param {IHoliday[]} holidays - The array of holidays to save.
   * @returns {Promise<void>}
   */
  async save(holidays: IHoliday[]): Promise<void> {
    if (holidays.length === 0) return;

    const bulkOps = holidays.map((holiday) => ({
      updateOne: {
        filter: { date: holiday.date },
        update: { $set: holiday },
        upsert: true,
      },
    }));

    await HolidayModel.bulkWrite(bulkOps);
  }
}
