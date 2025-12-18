import { inngest } from "@/lib/inngest/client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "./prompt";
import { success } from "better-auth";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer";
import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews } from "../actions/finnhub.actions";
import { getFormattedTodayDate } from "../utils";

export const sendSignUpEmail = inngest.createFunction(
  { id: "sign-up-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    const userProfile = `
        - Country: ${event.data.country}
        - Investment Goals: ${event.data.investmentGoals}
        - Risk Tolerance: ${event.data.riskTolerance}
        - Preferred Industry: ${event.data.preferredIndustry}
    `;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile
    );

    const response = await step.ai.infer("generate-welcome-info", {
      model: step.ai.models.gemini({
        model: "gemini-2.5-flash-lite",
      }),
      body: {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
    });

    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining Social Stock Insights! You now have tools to track market news, get personalized insights, and make informed decisions.";

      const {
        data: { email, name },
      } = event;

      return await sendWelcomeEmail({
        email,
        name,
        intro: introText,
      });
    });

    return {
      success: true,
      message: "Welcome email sent successfully",
    };
  }
);

export const sendDailyNewsSummary = inngest.createFunction(
  {
    id: "daily-news-summary",
  },
  [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
  async ({ event, step }) => {
    const users = await step.run("get-all-users", getAllUsersForNewsEmail);

    if (!users || users?.length === 0) {
      return {
        success: false,
        message: "No users found",
      };
    }

    // Step 2: For each user, get watchlist symbols and fetch news
    const userNewsData = await step.run("fetch-user-news", async () => {
      const newsPromises = users.map(async (user) => {
        try {
          const symbols = await getWatchlistSymbolsByEmail(user.email);
          const news = await getNews(symbols.length > 0 ? symbols : undefined);

          return {
            user,
            news,
            symbols,
          };
        } catch (error) {
          console.error(`Error fetching news for user ${user.email}:`, error);
          return {
            user,
            news: [],
            symbols: [],
          };
        }
      });

      return Promise.all(newsPromises);
    });

    const userNewsSummaries: { user: User; newsContent: string | null }[] = [];

    for (const { user, news, symbols } of userNewsData) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(news, null, 2)
        );
        const reponse = await step.ai.infer(`summarize-news-${user.email}`, {
          model: step.ai.models.gemini({
            model: "gemini-2.5-flash-lite",
          }),
          body: {
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          },
        });

        const part = reponse.candidates?.[0]?.content?.parts?.[0];
        const summaryText =
          (part && "text" in part ? part.text : null) || "No summary available";

        userNewsSummaries.push({ user, newsContent: summaryText });
      } catch (error) {
        console.error(`Error summarizing news for user ${user.email}:`, error);
        userNewsSummaries.push({ user, newsContent: null });
      }
    }

    await step.run("send-news-summary-email", async () => {
      await Promise.all(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) {
            return false;
          }

          return await sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent,
          });
        })
      );
    });

    return {
      success: true,
      message: `Processed news for ${users.length} users`,
    };
  }
);
