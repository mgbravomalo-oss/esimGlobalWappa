import app from '../server';
import { connectToDatabase } from '../server/db';

export default async function handler(req: any, res: any) {
  try {
    await connectToDatabase();
  } catch (err) {
    console.error('MongoDB Atlas connection error in Vercel handler:', err);
  }
  return app(req, res);
}
