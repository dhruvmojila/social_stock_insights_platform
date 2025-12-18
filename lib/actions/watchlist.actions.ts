"use server";

import { connectToDatabase } from "@/database/mongoose";
import Watchlist from "@/database/models/watchlist.model";

export const getWatchlistSymbolsByEmail = async (
  email: string
): Promise<string[]> => {
  if (!email) return [];
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) throw new Error("Database connection not found");

    // Find user by email in Better Auth user collection
    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({
        email,
      });

    if (!user) {
      console.log(`No user found with email: ${email}`);
      return [];
    }

    const userId = (user.id as string) || user._id?.toString() || "";

    if (!userId) {
      console.error("User found but no valid ID");
      return [];
    }

    // Query Watchlist by userId and return symbols
    const watchlistItems = await Watchlist.find(
      { userId },
      { symbol: 1 }
    ).lean();

    return watchlistItems.map((item) => String(item.symbol));
  } catch (error) {
    console.error("Error fetching watchlist symbols by email:", error);
    return [];
  }
};
