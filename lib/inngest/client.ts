import { Inngest } from "inngest";

export const inngest = new Inngest({
  name: "Social Stock Insights Platform",
  id: "social-stock-insights-platform",
  ai: { gemini: { apiKey: process.env.GEMINI_API_KEY } },
});
