"use server";

import { WorkOS } from "@workos-inc/node";
import { redirect } from "next/navigation";
import { withAuth, signOut as authkitSignOut, saveSession, refreshSession } from "@workos-inc/authkit-nextjs";

const workos = new WorkOS(process.env.WORKOS_API_KEY);

interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  error?: string;
}

export async function signInWithPassword(prevState: any, formData: FormData): Promise<AuthResponse> {
  try {
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const authResponse = await workos.userManagement.authenticateWithPassword({
      clientId: process.env.WORKOS_CLIENT_ID || "",
      email,
      password,
    });

    if (!authResponse.user) {
      return { success: false, error: "Authentication failed" };
    }

    await saveSession(
      {
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        user: authResponse.user,
        impersonator: authResponse.impersonator,
      },
      process.env.WORKOS_REDIRECT_URI || "http://snooze.snowydev.xyz/callback"
    );

    await refreshSession();

    return {
      success: true,
      user: {
        id: authResponse.user.id,
        email: authResponse.user.email,
        firstName: authResponse.user.firstName || "",
        lastName: authResponse.user.lastName || "",
        avatar: authResponse.user.profilePictureUrl || "",
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred during sign in.";
    return { success: false, error: message };
  }
}

export async function signUpWithPassword(prevState: any, formData: FormData): Promise<AuthResponse> {
  try {
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const firstName = String(formData.get("firstName"));
    const lastName = String(formData.get("lastName"));

    const user = await workos.userManagement.createUser({
      email,
      password,
      firstName,
      lastName,
      emailVerified: false,
    });

    const authResponse = await workos.userManagement.authenticateWithPassword({
      clientId: process.env.WORKOS_CLIENT_ID || "",
      email,
      password,
    });

    if (!authResponse.user) {
      return { success: false, error: "Failed to authenticate after registration" };
    }

    await saveSession(
      {
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        user: authResponse.user,
        impersonator: authResponse.impersonator,
      },
      process.env.WORKOS_REDIRECT_URI || "http://snooze.snowydev.xyz/callback"
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        avatar: user.profilePictureUrl || "",
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred during sign up.";
    return { success: false, error: message };
  }
}

export async function signOut() {
  await authkitSignOut();
  redirect("/auth");
}

export async function getCurrentUser() {
  try {
    const { user } = await withAuth();
    return user;
  } catch {
    return null;
  }
}

export async function startGoogleOAuth() {
  const url = workos.userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID || "",
    provider: "GoogleOAuth",
    redirectUri: process.env.WORKOS_REDIRECT_URI || "http://snooze.snowydev.xyz/callback",
  });
  redirect(url);
}

export async function startGitHubOAuth() {
  const url = workos.userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID || "",
    provider: "GitHubOAuth",
    redirectUri: process.env.WORKOS_REDIRECT_URI || "http://snooze.snowydev.xyz/callback",
  });
  redirect(url);
}


