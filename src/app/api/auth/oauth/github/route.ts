import { NextRequest, NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

export async function GET(req: NextRequest) {
  const workos = new WorkOS(process.env.WORKOS_API_KEY);
  const redirectUri = process.env.WORKOS_REDIRECT_URI as string;
  const url = workos.userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID as string,
    provider: "GitHub",
    redirectUri,
    // you can add providerScopes, prompt, etc.
  });
  return NextResponse.redirect(url);
}


