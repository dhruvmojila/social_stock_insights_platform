"use server";

import { connectToDatabase } from "@/database/mongoose";
import Watchlist from "@/database/models/watchlist.model";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

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

export const getWatchlist = async () => {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return [];
    }

    const userId = session.user.id;
    const watchlist = await Watchlist.find({ userId })
      .sort({ addedAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(watchlist));
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
};

export const addToWatchlist = async (symbol: string, company: string) => {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = session.user.id;
    const cleanSymbol = symbol.toUpperCase().trim();
    const cleanCompany = company.trim();

    await Watchlist.create({
      userId,
      symbol: cleanSymbol,
      company: cleanCompany,
    });

    return { success: true };
  } catch (error: any) {
    console.error(`Error adding ${symbol} to watchlist:`, error);
    if (error?.code === 11000) {
      return { success: false, error: "Stock already in watchlist" };
    }
    return { success: false, error: "Failed to add to watchlist" };
  }
};

export const removeFromWatchlist = async (symbol: string) => {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = session.user.id;
    const cleanSymbol = symbol.toUpperCase().trim();

    await Watchlist.findOneAndDelete({ userId, symbol: cleanSymbol });

    return { success: true };
  } catch (error) {
    console.error(`Error removing ${symbol} from watchlist:`, error);
    return { success: false, error: "Failed to remove from watchlist" };
  }
};
