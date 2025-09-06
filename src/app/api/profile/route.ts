import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { id, username } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Create or update profile
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: id,
        username: username || `user_${id.substring(0, 8)}`,
        level: 1,
        xp: 0,
        coins: 100,
        streak_count: 0,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Profile creation error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: data[0] });
  } catch (error: any) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
