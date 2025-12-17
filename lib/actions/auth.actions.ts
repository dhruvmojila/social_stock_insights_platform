"use server";

import { auth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";

export const signUpWithEmail = async ({
  email,
  password,
  fullName,
  country,
  investmentGoals,
  riskTolerance,
  preferredIndustry,
}: SignUpFormData) => {
  try {
    const response = await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    });

    if (response) {
      await inngest.send({
        name: "app/user.created",
        data: {
          country,
          investmentGoals,
          riskTolerance,
          preferredIndustry,
          email,
          name: fullName,
        },
      });
    }

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.log("Error signing up:", error);
    return {
      success: false,
      error: "Failed to sign up",
    };
  }
};
