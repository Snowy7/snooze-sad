import { NextRequest, NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";
import { saveSession } from "@workos-inc/authkit-nextjs";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code required" }, { status: 400 });
    }

    const workos = new WorkOS(process.env.WORKOS_API_KEY);
    
    // Verify the email with the code
    await workos.userManagement.verifyEmail({ 
      userId: email,
      code 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
