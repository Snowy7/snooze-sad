import { NextRequest, NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

export async function GET(req: NextRequest) {
  const workos = new WorkOS(process.env.WORKOS_API_KEY);
  const redirectUri = process.env.WORKOS_REDIRECT_URI as string;
  console.log(redirectUri);
  console.log(process.env.WORKOS_CLIENT_ID);
  const url = workos.userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID as string,
    provider: "GoogleOAuth",
    redirectUri,
  });
  return NextResponse.redirect(url);
}


