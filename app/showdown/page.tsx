import { getAllPlayers } from "@/lib/users";
import { buildAllPlayerViews } from "@/lib/playerView";
import { getTodayDateString, getCalendarDayNumber, TOTAL_DAYS } from "@/lib/game";
import PathTrack, { PathTrackPlayer } from "@/components/PathTrack";
import PlayerCard from "@/components/PlayerCard";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const PLAYER_COLOR_VARIABLES = ["color-player-1", "color-player-2", "color-player-3"];

export default async function ShowdownPage() {
  const players = getAllPlayers();
  const playerViews = await buildAllPlayerViews(players);

  const todayDateString = getTodayDateString();
  const todayCalendarDayNumber = getCalendarDayNumber(todayDateString);

  let headerSubtitle = "";
  if (todayCalendarDayNumber < 1) {
    const daysUntilStart = 1 - todayCalendarDayNumber;
    headerSubtitle = "Starts in " + daysUntilStart + " day" + (daysUntilStart === 1 ? "" : "s");
  } else if (todayCalendarDayNumber > TOTAL_DAYS) {
    headerSubtitle = "The 75 days are up \u2014 check the trail below";
  } else {
    headerSubtitle = "Day " + todayCalendarDayNumber + " of " + TOTAL_DAYS + " on the calendar";
  }

  const pathTrackPlayers: PathTrackPlayer[] = playerViews.map((view, index) => {
    return {
      playerId: view.playerId,
      name: view.name,
      progressDay: view.progressDay,
      eliminated: view.eliminated,
      colorVariableName: PLAYER_COLOR_VARIABLES[index % PLAYER_COLOR_VARIABLES.length],
    };
  });

  return (
    <main className="page-shell">
      <div className="page-header">
        <h1>75 Hard Showdown</h1>
        <p>{headerSubtitle}</p>
      </div>

      <div className={styles.trackSection}>
        <PathTrack players={pathTrackPlayers} />
      </div>

      <div className={styles.cardsGrid}>
        {playerViews.map((view, index) => (
          <PlayerCard
            key={view.playerId}
            view={view}
            colorVariableName={PLAYER_COLOR_VARIABLES[index % PLAYER_COLOR_VARIABLES.length]}
          />
        ))}
      </div>
    </main>
  );
}
