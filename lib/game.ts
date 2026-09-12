// Core game rules for the 75 Hard Showdown.
//
// The rules, spelled out:
//   - The challenge starts on CHALLENGE_START_DATE_STRING (calendar day 1)
//     and the finish line is TOTAL_DAYS days of progress later.
//   - Every player has their own list of daily activities. A day only
//     counts as "complete" if every single activity on that player's list
//     was checked off for that date.
//   - Each completed day moves a player's token forward by one step on the
//     trail (their "progressDay"). This is tracked separately from the
//     real calendar date, because a player can fall behind the calendar.
//   - Once a full calendar week (7 days) has passed, we look back at that
//     week. If more than 2 of those 7 days were incomplete, the player is
//     pushed back: their trail token retreats 7 steps and they lose one
//     life.
//   - Every player starts with STARTING_LIVES lives. Losing all of them
//     means elimination — they keep their spot on the trail but cannot
//     progress any further.

export const CHALLENGE_START_DATE_STRING = "2026-09-18";
export const TOTAL_DAYS = 75;
export const STARTING_LIVES = 3;
export const MAX_INCOMPLETE_DAYS_PER_WEEK = 2;
export const DAYS_PER_WEEK = 7;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export type DailyEntry = {
  [activityName: string]: boolean;
};

export type EntriesByDate = {
  [dateString: string]: DailyEntry;
};

export type PlayerProfile = {
  activities: string[];
  progressDay: number;
  lives: number;
  eliminated: boolean;
  creditedDates: string[];
  pushbackCount: number;
  lastEvaluatedCalendarDay: number;
};

// Whether a player's activity list can still be edited. The rule is
// simple: it's open right up until the challenge officially starts, then
// it's locked for the rest of the challenge. There is no stored "locked"
// flag — this is always computed fresh from today's date so it can never
// drift out of sync.
export function areActivitiesEditable(todayDateString: string): boolean {
  const challengeHasStarted = hasChallengeStarted(todayDateString);
  if (challengeHasStarted) {
    return false;
  }
  return true;
}

export function createDefaultProfile(): PlayerProfile {
  const defaultProfile: PlayerProfile = {
    activities: [],
    progressDay: 0,
    lives: STARTING_LIVES,
    eliminated: false,
    creditedDates: [],
    pushbackCount: 0,
    lastEvaluatedCalendarDay: 0,
  };
  return defaultProfile;
}

// Returns today's date (or any date) as a "YYYY-MM-DD" string in UTC.
// We treat the whole challenge in UTC to keep the math simple and avoid
// timezone drift between the three players.
export function toDateString(date: Date): string {
  const isoString = date.toISOString();
  const dateString = isoString.slice(0, 10);
  return dateString;
}

export function getTodayDateString(): string {
  const now = new Date();
  return toDateString(now);
}

// Calendar day 1 is the challenge start date. Days before that are 0 or
// negative (the challenge has not started yet for that date).
export function getCalendarDayNumber(dateString: string): number {
  const startDate = new Date(CHALLENGE_START_DATE_STRING + "T00:00:00.000Z");
  const currentDate = new Date(dateString + "T00:00:00.000Z");
  const differenceInMilliseconds = currentDate.getTime() - startDate.getTime();
  const differenceInDays = Math.round(differenceInMilliseconds / MILLISECONDS_PER_DAY);
  const calendarDayNumber = differenceInDays + 1;
  return calendarDayNumber;
}

// The inverse of getCalendarDayNumber: given calendar day 1, 2, 3, ...
// return the matching "YYYY-MM-DD" date string.
export function getDateStringForCalendarDay(calendarDayNumber: number): string {
  const startDate = new Date(CHALLENGE_START_DATE_STRING + "T00:00:00.000Z");
  const offsetInDays = calendarDayNumber - 1;
  const resultDate = new Date(startDate.getTime() + offsetInDays * MILLISECONDS_PER_DAY);
  const dateString = toDateString(resultDate);
  return dateString;
}

export function hasChallengeStarted(dateString: string): boolean {
  const calendarDayNumber = getCalendarDayNumber(dateString);
  if (calendarDayNumber >= 1) {
    return true;
  }
  return false;
}

// A day is "complete" only if the player has at least one activity AND
// every activity on their list is checked true for that day.
export function isDayComplete(entry: DailyEntry | undefined, activities: string[]): boolean {
  if (activities.length === 0) {
    return false;
  }
  if (entry === undefined) {
    return false;
  }
  for (let index = 0; index < activities.length; index = index + 1) {
    const activityName = activities[index];
    if (entry[activityName] !== true) {
      return false;
    }
  }
  return true;
}

// Applies today's checklist to a player's profile and returns the updated
// profile. Handles the "credit" bookkeeping so that toggling a checkbox
// back and forth does not double count trail progress, and so that
// un-checking a previously complete day correctly gives the step back.
export function applyEntryToProfile(
  profile: PlayerProfile,
  dateString: string,
  entry: DailyEntry
): PlayerProfile {
  const updatedProfile: PlayerProfile = {
    ...profile,
    creditedDates: [...profile.creditedDates],
  };

  if (updatedProfile.eliminated) {
    return updatedProfile;
  }

  const dayIsComplete = isDayComplete(entry, updatedProfile.activities);
  const alreadyCredited = updatedProfile.creditedDates.indexOf(dateString) !== -1;

  if (dayIsComplete && alreadyCredited === false) {
    updatedProfile.creditedDates.push(dateString);
    if (updatedProfile.progressDay < TOTAL_DAYS) {
      updatedProfile.progressDay = updatedProfile.progressDay + 1;
    }
  }

  if (dayIsComplete === false && alreadyCredited) {
    const indexToRemove = updatedProfile.creditedDates.indexOf(dateString);
    updatedProfile.creditedDates.splice(indexToRemove, 1);
    if (updatedProfile.progressDay > 0) {
      updatedProfile.progressDay = updatedProfile.progressDay - 1;
    }
  }

  return updatedProfile;
}

// Looks back at one completed 7-day calendar week (week 1 = calendar days
// 1-7, week 2 = days 8-14, and so on). If more than
// MAX_INCOMPLETE_DAYS_PER_WEEK days in that week were incomplete, the
// player is pushed back: they retreat 7 steps on the trail and lose a
// life. Returns the updated profile.
export function evaluateWeek(
  profile: PlayerProfile,
  entries: EntriesByDate,
  weekNumber: number
): PlayerProfile {
  const updatedProfile: PlayerProfile = { ...profile };

  if (updatedProfile.eliminated) {
    return updatedProfile;
  }

  const firstCalendarDayOfWeek = (weekNumber - 1) * DAYS_PER_WEEK + 1;
  const lastCalendarDayOfWeek = weekNumber * DAYS_PER_WEEK;

  let incompleteDayCount = 0;
  for (
    let calendarDay = firstCalendarDayOfWeek;
    calendarDay <= lastCalendarDayOfWeek;
    calendarDay = calendarDay + 1
  ) {
    const dateString = getDateStringForCalendarDay(calendarDay);
    const entryForDay = entries[dateString];
    const dayIsComplete = isDayComplete(entryForDay, updatedProfile.activities);
    if (dayIsComplete === false) {
      incompleteDayCount = incompleteDayCount + 1;
    }
  }

  if (incompleteDayCount > MAX_INCOMPLETE_DAYS_PER_WEEK) {
    updatedProfile.progressDay = updatedProfile.progressDay - DAYS_PER_WEEK;
    if (updatedProfile.progressDay < 0) {
      updatedProfile.progressDay = 0;
    }
    updatedProfile.pushbackCount = updatedProfile.pushbackCount + 1;
    updatedProfile.lives = updatedProfile.lives - 1;
    if (updatedProfile.lives <= 0) {
      updatedProfile.lives = 0;
      updatedProfile.eliminated = true;
    }
  }

  updatedProfile.lastEvaluatedCalendarDay = lastCalendarDayOfWeek;
  return updatedProfile;
}

// Given "today", figures out which fully-completed weeks have not yet been
// scored and returns their week numbers in order. A week is only scored
// once it is fully in the past (its last day is before today).
export function getUnevaluatedCompletedWeeks(profile: PlayerProfile, todayDateString: string): number[] {
  const todayCalendarDay = getCalendarDayNumber(todayDateString);
  const weekNumbersToEvaluate: number[] = [];

  let candidateWeekNumber = Math.floor(profile.lastEvaluatedCalendarDay / DAYS_PER_WEEK) + 1;

  while (true) {
    const lastCalendarDayOfCandidateWeek = candidateWeekNumber * DAYS_PER_WEEK;
    if (lastCalendarDayOfCandidateWeek >= todayCalendarDay) {
      break;
    }
    weekNumbersToEvaluate.push(candidateWeekNumber);
    candidateWeekNumber = candidateWeekNumber + 1;
  }

  return weekNumbersToEvaluate;
}

// Current streak of consecutive complete days, counting backwards from
// yesterday (today doesn't count until it's actually finished).
export function getCurrentStreak(profile: PlayerProfile, entries: EntriesByDate, todayDateString: string): number {
  const todayCalendarDay = getCalendarDayNumber(todayDateString);
  let streak = 0;
  let calendarDay = todayCalendarDay - 1;

  while (calendarDay >= 1) {
    const dateString = getDateStringForCalendarDay(calendarDay);
    const entryForDay = entries[dateString];
    const dayIsComplete = isDayComplete(entryForDay, profile.activities);
    if (dayIsComplete === false) {
      break;
    }
    streak = streak + 1;
    calendarDay = calendarDay - 1;
  }

  return streak;
}
