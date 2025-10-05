import { NextRequest, NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const workos = new WorkOS(process.env.WORKOS_API_KEY);
    
    // Send verification email
    await workos.userManagement.sendVerificationEmail({ 
      userId: email
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send verification email";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
