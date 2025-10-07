"use server";

import { WorkOS } from "@workos-inc/node";
import { redirect } from "next/navigation";
import { withAuth, signOut as authkitSignOut } from "@workos-inc/authkit-nextjs";

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
  pendingAuthenticationToken?: string;
  needsEmailVerification?: boolean;
}

export async function signInWithPassword(prevState: any, formData: FormData): Promise<AuthResponse> {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  
  try {
    const authResponse = await workos.userManagement.authenticateWithPassword({
      clientId: process.env.WORKOS_CLIENT_ID || "",
      email,
      password,
    });

    if (!authResponse.user) {
      return { success: false, error: "Authentication failed" };
    }

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
  } catch (error: any) {
    // Check if error is due to unverified email
    if (error.pendingAuthenticationToken) {
      // Get user by email to send verification
      try {
        const userEmail = email;
        const users = await workos.userManagement.listUsers({ email: userEmail });
        if (users.data.length > 0) {
          await workos.userManagement.sendVerificationEmail({ userId: users.data[0].id });
        }
      } catch (e) {
        console.error("Failed to send verification email:", e);
      }

      return {
        success: false,
        needsEmailVerification: true,
        pendingAuthenticationToken: error.pendingAuthenticationToken,
        error: "Please verify your email",
      };
    }

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

    // Create user with email verification required
    const user = await workos.userManagement.createUser({
      email,
      password,
      firstName,
      lastName,
      emailVerified: false,
    });

    // Try to authenticate to get pending token
    try {
      const authResponse = await workos.userManagement.authenticateWithPassword({
        clientId: process.env.WORKOS_CLIENT_ID || "",
        email,
        password,
      });

      // If successful, user doesn't need verification
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
    } catch (authError: any) {
      // If auth fails due to unverified email, we'll get a pending token
      if (authError.pendingAuthenticationToken) {
        // Send verification email
        await workos.userManagement.sendVerificationEmail({ userId: user.id });

        return {
          success: false,
          needsEmailVerification: true,
          pendingAuthenticationToken: authError.pendingAuthenticationToken,
          error: "Please verify your email",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            avatar: user.profilePictureUrl || "",
          },
        };
      }

      throw authError;
    }
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "An error occurred during sign up.";
    return { success: false, error: message };
  }
}

export async function signOut() {
  // Clear any client-side storage first
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('snooze_authenticated');
      localStorage.removeItem('onboarding_completed');
      localStorage.removeItem('spotlight_onboarding_completed');
      // Clear any cached data
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  }
  
  try {
    // Sign out from WorkOS
    await authkitSignOut();
  } catch (error) {
    // Check if this is a Next.js redirect (which is expected)
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      // Re-throw redirect errors so Next.js can handle them
      throw error;
    }
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
  const url = workos.userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID || "",
    provider: "GoogleOAuth",
    redirectUri: process.env.WORKOS_REDIRECT_URI || "",
  });
  redirect(url);
}

export async function startGitHubOAuth() {
  const url = workos.userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID || "",
    provider: "GitHubOAuth",
    redirectUri: process.env.WORKOS_REDIRECT_URI || "",
  });
  redirect(url);
}

// Email verification with pending token
export async function verifyEmailWithCode(
  code: string,
  pendingAuthenticationToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authResponse = await workos.userManagement.authenticateWithEmailVerification({
      clientId: process.env.WORKOS_CLIENT_ID || "",
      code,
      pendingAuthenticationToken,
    });

    if (!authResponse.user) {
      return { success: false, error: "Verification failed" };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid verification code";
    return { success: false, error: message };
  }
}


