import { NextRequest, NextResponse } from "next/server";
import { getPlayerByToken } from "@/lib/users";
import { loadProfile, saveProfile, loadEntries, saveEntries } from "@/lib/kv";
import { getTodayDateString, applyEntryToProfile, DailyEntry } from "@/lib/game";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = body.token;
  const completedActivities = body.completedActivities;

  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const player = getPlayerByToken(token);
  if (player === null) {
    return NextResponse.json({ error: "Unknown player." }, { status: 404 });
  }

  if (Array.isArray(completedActivities) === false) {
    return NextResponse.json({ error: "completedActivities must be a list." }, { status: 400 });
  }

  const profile = await loadProfile(player.playerId);

  if (profile.eliminated) {
    return NextResponse.json({ error: "This player has been eliminated." }, { status: 403 });
  }

  const todayDateString = getTodayDateString();
  const todaysEntry: DailyEntry = {};
  for (let index = 0; index < profile.activities.length; index = index + 1) {
    const activityName = profile.activities[index];
    const isCompleted = completedActivities.indexOf(activityName) !== -1;
    todaysEntry[activityName] = isCompleted;
  }

  const entries = await loadEntries(player.playerId);
  entries[todayDateString] = todaysEntry;
  await saveEntries(player.playerId, entries);

  const updatedProfile = applyEntryToProfile(profile, todayDateString, todaysEntry);
  await saveProfile(player.playerId, updatedProfile);

  return NextResponse.json({
    success: true,
    progressDay: updatedProfile.progressDay,
    lives: updatedProfile.lives,
  });
}
