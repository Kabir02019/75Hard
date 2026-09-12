import { PlayerConfig } from "./users";
import { loadProfile, loadEntries } from "./kv";
import {
  DailyEntry,
  getCalendarDayNumber,
  getDateStringForCalendarDay,
  getCurrentStreak,
  isDayComplete,
  getTodayDateString,
  areActivitiesEditable,
} from "./game";

export type HeatmapDay = {
  dateString: string;
  calendarDayNumber: number;
  isComplete: boolean;
  isToday: boolean;
  isInFuture: boolean;
};

export type PlayerView = {
  playerId: string;
  name: string;
  activities: string[];
  activitiesAreEditable: boolean;
  progressDay: number;
  lives: number;
  eliminated: boolean;
  pushbackCount: number;
  currentStreak: number;
  todayEntry: DailyEntry;
  todayIsComplete: boolean;
  heatmapDays: HeatmapDay[];
};

export async function buildPlayerView(player: PlayerConfig): Promise<PlayerView> {
  const profile = await loadProfile(player.playerId);
  const entries = await loadEntries(player.playerId);

  const todayDateString = getTodayDateString();
  const todayCalendarDayNumber = getCalendarDayNumber(todayDateString);
  const todayEntry = entries[todayDateString] === undefined ? {} : entries[todayDateString];
  const todayIsComplete = isDayComplete(todayEntry, profile.activities);
  const currentStreak = getCurrentStreak(profile, entries, todayDateString);

  const heatmapDays: HeatmapDay[] = [];
  let calendarDayNumber = 1;
  while (calendarDayNumber <= 75) {
    const dateString = getDateStringForCalendarDay(calendarDayNumber);
    const isInFuture = calendarDayNumber > todayCalendarDayNumber;
    const entryForDay = entries[dateString];
    let isComplete = false;
    if (isInFuture === false) {
      isComplete = isDayComplete(entryForDay, profile.activities);
    }
    const isToday = calendarDayNumber === todayCalendarDayNumber;

    heatmapDays.push({
      dateString: dateString,
      calendarDayNumber: calendarDayNumber,
      isComplete: isComplete,
      isToday: isToday,
      isInFuture: isInFuture,
    });

    calendarDayNumber = calendarDayNumber + 1;
  }

  const playerView: PlayerView = {
    playerId: player.playerId,
    name: player.name,
    activities: profile.activities,
    activitiesAreEditable: areActivitiesEditable(todayDateString),
    progressDay: profile.progressDay,
    lives: profile.lives,
    eliminated: profile.eliminated,
    pushbackCount: profile.pushbackCount,
    currentStreak: currentStreak,
    todayEntry: todayEntry,
    todayIsComplete: todayIsComplete,
    heatmapDays: heatmapDays,
  };

  return playerView;
}

export async function buildAllPlayerViews(players: PlayerConfig[]): Promise<PlayerView[]> {
  const views: PlayerView[] = [];
  for (let index = 0; index < players.length; index = index + 1) {
    const view = await buildPlayerView(players[index]);
    views.push(view);
  }
  return views;
}
