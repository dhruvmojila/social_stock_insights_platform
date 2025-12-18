"use server";

import { getDateRange, validateArticle, formatArticle } from "@/lib/utils";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const NEXT_PUBLIC_FINNHUB_API_KEY =
  process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? "";

async function fetchJSON<T>(
  url: string,
  revalidateSeconds?: number
): Promise<T> {
  const options: RequestInit = revalidateSeconds
    ? { cache: "force-cache", next: { revalidate: revalidateSeconds } }
    : { cache: "no-store" };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getNews(
  symbols?: string[]
): Promise<MarketNewsArticle[]> {
  try {
    const { from, to } = getDateRange(5);

    // Symbol-based news (round-robin)
    if (symbols && symbols.length > 0) {
      const cleanedSymbols = symbols
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      if (cleanedSymbols.length === 0) {
        // Fallback to general news if all symbols are invalid
        return getGeneralNews(from, to);
      }

      const collectedArticles: MarketNewsArticle[] = [];
      const maxRounds = 6;

      for (let round = 0; round < maxRounds; round++) {
        const symbolIndex = round % cleanedSymbols.length;
        const symbol = cleanedSymbols[symbolIndex];

        try {
          const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
          const articles = await fetchJSON<RawNewsArticle[]>(url);

          // Find the first valid article for this symbol in this round
          const validArticle = articles.find(validateArticle);

          if (validArticle) {
            collectedArticles.push(
              formatArticle(validArticle, true, symbol, round)
            );
          }

          // Stop if we have 6 articles
          if (collectedArticles.length >= 6) break;
        } catch (error) {
          console.error(`Error fetching news for symbol ${symbol}:`, error);
          // Continue with next symbol
        }
      }

      // Sort by datetime descending (most recent first)
      collectedArticles.sort((a, b) => b.datetime - a.datetime);

      return collectedArticles.slice(0, 6);
    }

    // General market news
    return getGeneralNews(from, to);
  } catch (error) {
    console.error("Error in getNews:", error);
    throw new Error("Failed to fetch news");
  }
}

async function getGeneralNews(
  from: string,
  to: string
): Promise<MarketNewsArticle[]> {
  try {
    const url = `${FINNHUB_BASE_URL}/news?category=general&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
    const articles = await fetchJSON<RawNewsArticle[]>(url);

    // Deduplicate by id, url, or headline
    const seen = new Set<string>();
    const uniqueArticles: RawNewsArticle[] = [];

    for (const article of articles) {
      if (!validateArticle(article)) continue;

      const key = `${article.id}-${article.url}-${article.headline}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueArticles.push(article);
      }

      // Stop collecting after we have enough unique articles
      if (uniqueArticles.length >= 6) break;
    }

    // Format and return top 6
    return uniqueArticles
      .slice(0, 6)
      .map((article, index) => formatArticle(article, false, undefined, index));
  } catch (error) {
    console.error("Error fetching general news:", error);
    throw new Error("Failed to fetch general market news");
  }
}
