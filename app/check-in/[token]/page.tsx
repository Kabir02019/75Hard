import Link from "next/link";
import { getAllPlayers, getPlayerByToken } from "@/lib/users";
import { buildPlayerView } from "@/lib/playerView";
import { getTodayDateString, getCalendarDayNumber } from "@/lib/game";
import ActivitySetup from "@/components/ActivitySetup";
import ChecklistCard from "@/components/ChecklistCard";
import PlayerCard from "@/components/PlayerCard";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const PLAYER_COLOR_VARIABLES = ["color-player-1", "color-player-2", "color-player-3"];

export default async function CheckInPage({ params }: { params: { token: string } }) {
  const player = getPlayerByToken(params.token);

  if (player === null) {
    return (
      <main className="page-shell">
        <div className="page-header">
          <h1>Link not recognized</h1>
          <p>This check-in link doesn't match anyone in the Showdown.</p>
        </div>
      </main>
    );
  }

  const allPlayers = getAllPlayers();
  let colorVariableName = PLAYER_COLOR_VARIABLES[0];
  for (let index = 0; index < allPlayers.length; index = index + 1) {
    if (allPlayers[index].token === player.token) {
      colorVariableName = PLAYER_COLOR_VARIABLES[index % PLAYER_COLOR_VARIABLES.length];
    }
  }

  const view = await buildPlayerView(player);
  const todayDateString = getTodayDateString();
  const todayCalendarDayNumber = getCalendarDayNumber(todayDateString);
  const daysUntilStart = 1 - todayCalendarDayNumber;

  return (
    <main className="page-shell">
      <div className="page-header">
        <h1>Hey {view.name}</h1>
        <p>
          <Link href="/showdown" className={styles.showdownLink}>
            See the full Showdown &rarr;
          </Link>
        </p>
      </div>

      {view.activitiesAreEditable ? (
        <ActivitySetup
          token={player.token}
          initialActivities={view.activities}
          daysUntilStart={daysUntilStart > 0 ? daysUntilStart : 0}
        />
      ) : view.activities.length === 0 ? (
        <div className="panel">
          <p>
            The challenge already started and no activity list was ever locked in for you, so
            there's nothing to check off. Ask whoever's running the deploy to check the
            environment variables.
          </p>
        </div>
      ) : view.eliminated ? (
        <div className={styles.stack}>
          <div className="panel">
            <p>
              You've used up all {view.pushbackCount >= 3 ? "3" : String(view.pushbackCount)} lives
              and are out of the Showdown \u2014 but you can still watch how the other two finish.
            </p>
          </div>
          <PlayerCard view={view} colorVariableName={colorVariableName} />
        </div>
      ) : (
        <div className={styles.stack}>
          <ChecklistCard
            token={player.token}
            activities={view.activities}
            initialEntry={view.todayEntry}
            calendarDayNumber={todayCalendarDayNumber}
          />
          <PlayerCard view={view} colorVariableName={colorVariableName} />
        </div>
      )}
    </main>
  );
}
