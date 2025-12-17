"use server";

import { auth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";

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

export const signOut = async () => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return {
      success: true,
    };
  } catch (error) {
    console.log("Error signing out:", error);
    return {
      success: false,
      error: "Failed to sign out",
    };
  }
};

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
  try {
    const response = await auth.api.signInEmail({
      body: { email, password },
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.log("Error signing in:", error);
    return {
      success: false,
      error: "Failed to sign in",
    };
  }
};
