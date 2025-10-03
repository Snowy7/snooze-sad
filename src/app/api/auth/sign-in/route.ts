import { NextRequest, NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";
import { saveSession } from "@workos-inc/authkit-nextjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const workos = new WorkOS(process.env.WORKOS_API_KEY);
    const { user, accessToken, refreshToken, impersonator } = await workos.userManagement.authenticateWithPassword({
      clientId: process.env.WORKOS_CLIENT_ID as string,
      email,
      password,
    });

    await saveSession({ user, accessToken, refreshToken, impersonator }, req);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign in failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}


