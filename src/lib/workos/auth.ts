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
  try {
    await authkitSignOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
  
  // Always redirect to /auth regardless of environment
  // The redirect URL should be configured in WorkOS dashboard
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
  const redirectUri = process.env.WORKOS_REDIRECT_URI || 
    (typeof window !== 'undefined' ? `${window.location.origin}/callback` : "http://snooze.snowydev.xyz/callback");
  
  const url = workos.userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID || "",
    provider: "GoogleOAuth",
    redirectUri,
  });
  redirect(url);
}

export async function startGitHubOAuth() {
  const redirectUri = process.env.WORKOS_REDIRECT_URI || 
    (typeof window !== 'undefined' ? `${window.location.origin}/callback` : "http://snooze.snowydev.xyz/callback");
  
  const url = workos.userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID || "",
    provider: "GitHubOAuth",
    redirectUri,
  });
  redirect(url);
}

// Email verification functions
export async function sendVerificationCode(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await workos.userManagement.sendVerificationEmail({ userId: email });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send verification email";
    return { success: false, error: message };
  }
}

export async function verifyEmailCode(userId: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    await workos.userManagement.verifyEmail({ userId, code });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid verification code";
    return { success: false, error: message };
  }
}


