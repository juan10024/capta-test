import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * This function centralizes the database connection logic, making it easy to manage.
 * @param {string} uri - The MongoDB connection string.
 * @returns {Promise<void>}
 */
export const connectDB = async (uri: string): Promise<void> => {
  try {
    await mongoose.connect(uri);
  } catch (error) {
    console.error('Database connection error:', error);
    // Exit the process with an error code if the database connection fails,
    // as the application cannot function without it.
    process.exit(1);
  }
};
