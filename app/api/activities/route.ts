import { NextRequest, NextResponse } from "next/server";
import { getPlayerByToken } from "@/lib/users";
import { loadProfile, saveProfile } from "@/lib/kv";
import { getTodayDateString, areActivitiesEditable } from "@/lib/game";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = body.token;
  const activities = body.activities;

  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const player = getPlayerByToken(token);
  if (player === null) {
    return NextResponse.json({ error: "Unknown player." }, { status: 404 });
  }

  const todayDateString = getTodayDateString();
  if (areActivitiesEditable(todayDateString) === false) {
    return NextResponse.json(
      { error: "Activity lists are locked once the challenge has started." },
      { status: 403 }
    );
  }

  if (Array.isArray(activities) === false) {
    return NextResponse.json({ error: "Activities must be a list of strings." }, { status: 400 });
  }

  const cleanedActivities: string[] = [];
  for (let index = 0; index < activities.length; index = index + 1) {
    const rawActivity = activities[index];
    if (typeof rawActivity === "string") {
      const trimmedActivity = rawActivity.trim();
      if (trimmedActivity.length > 0) {
        cleanedActivities.push(trimmedActivity);
      }
    }
  }

  if (cleanedActivities.length === 0) {
    return NextResponse.json({ error: "Add at least one activity." }, { status: 400 });
  }

  const profile = await loadProfile(player.playerId);
  profile.activities = cleanedActivities;
  await saveProfile(player.playerId, profile);

  return NextResponse.json({ success: true, activities: cleanedActivities });
}
