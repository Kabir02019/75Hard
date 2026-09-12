import { NextRequest, NextResponse } from "next/server";
import { getAllPlayers } from "@/lib/users";
import { loadProfile, saveProfile, loadEntries } from "@/lib/kv";
import {
  getTodayDateString,
  getUnevaluatedCompletedWeeks,
  evaluateWeek,
  isDayComplete,
  TOTAL_DAYS,
} from "@/lib/game";
import { sendWhatsAppReminder } from "@/lib/callmebot";

function isAuthorizedCronRequest(request: NextRequest): boolean {
  const configuredSecret = process.env.CRON_SECRET;
  if (configuredSecret === undefined || configuredSecret.length === 0) {
    return false;
  }
  const authorizationHeader = request.headers.get("authorization");
  const expectedHeader = "Bearer " + configuredSecret;
  if (authorizationHeader === expectedHeader) {
    return true;
  }
  return false;
}

function buildReminderMessage(playerName: string, progressDay: number, lives: number): string {
  const livesRemaining = lives;
  const message =
    "75 Hard Showdown: hey " +
    playerName +
    ", you're on day " +
    progressDay +
    " of " +
    TOTAL_DAYS +
    " with " +
    livesRemaining +
    " lives left. Today's checklist isn't done yet \u2014 don't let the others catch up!";
  return message;
}

export async function GET(request: NextRequest) {
  const authorized = isAuthorizedCronRequest(request);
  if (authorized === false) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const players = getAllPlayers();
  const todayDateString = getTodayDateString();
  const resultsPerPlayer: Array<{ playerId: string; pushedBack: boolean; reminderSent: boolean }> = [];

  for (let index = 0; index < players.length; index = index + 1) {
    const player = players[index];
    let profile = await loadProfile(player.playerId);
    const entries = await loadEntries(player.playerId);

    let pushedBackThisRun = false;
    const weeksToEvaluate = getUnevaluatedCompletedWeeks(profile, todayDateString);
    for (let weekIndex = 0; weekIndex < weeksToEvaluate.length; weekIndex = weekIndex + 1) {
      const weekNumber = weeksToEvaluate[weekIndex];
      const livesBeforeEvaluation = profile.lives;
      profile = evaluateWeek(profile, entries, weekNumber);
      if (profile.lives < livesBeforeEvaluation) {
        pushedBackThisRun = true;
      }
    }
    await saveProfile(player.playerId, profile);

    let reminderSent = false;
    if (profile.eliminated === false) {
      const todayEntry = entries[todayDateString];
      const todayIsComplete = isDayComplete(todayEntry, profile.activities);
      if (todayIsComplete === false) {
        const message = buildReminderMessage(player.name, profile.progressDay, profile.lives);
        reminderSent = await sendWhatsAppReminder(player.phoneNumber, player.callMeBotApiKey, message);
      }
    }

    resultsPerPlayer.push({
      playerId: player.playerId,
      pushedBack: pushedBackThisRun,
      reminderSent: reminderSent,
    });
  }

  return NextResponse.json({ success: true, results: resultsPerPlayer });
}
