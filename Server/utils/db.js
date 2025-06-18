import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected!');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected!');
      isConnected = true;
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export function getDB() {
  if (!isConnected) {
    throw new Error('Database not connected');
  }
  return mongoose.connection.db;
}
