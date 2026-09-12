import { PlayerView } from "@/lib/playerView";
import { STARTING_LIVES, TOTAL_DAYS } from "@/lib/game";
import Heatmap from "./Heatmap";
import styles from "./PlayerCard.module.css";

function renderHearts(lives: number): React.ReactNode {
  const hearts: React.ReactNode[] = [];
  for (let heartIndex = 0; heartIndex < STARTING_LIVES; heartIndex = heartIndex + 1) {
    const heartIsFilled = heartIndex < lives;
    const heartClassName = heartIsFilled ? styles.heartFilled : styles.heartEmpty;
    hearts.push(
      <span key={heartIndex} className={heartClassName}>
        &#9829;
      </span>
    );
  }
  return hearts;
}

export default function PlayerCard({
  view,
  colorVariableName,
}: {
  view: PlayerView;
  colorVariableName: string;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <span className={styles.colorDot} style={{ backgroundColor: "var(--" + colorVariableName + ")" }} />
        <h3 className={styles.name}>{view.name}</h3>
        <div className={styles.hearts}>{renderHearts(view.lives)}</div>
      </div>

      {view.eliminated ? (
        <p className={styles.eliminatedNote}>
          Eliminated \u2014 out of lives after {view.pushbackCount} pushback
          {view.pushbackCount === 1 ? "" : "s"}.
        </p>
      ) : (
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {view.progressDay} / {TOTAL_DAYS}
            </span>
            <span className={styles.statLabel}>on the trail</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{view.currentStreak}</span>
            <span className={styles.statLabel}>day streak</span>
          </div>
          {view.pushbackCount > 0 ? (
            <div className={styles.stat}>
              <span className={styles.statValue}>{view.pushbackCount}</span>
              <span className={styles.statLabel}>pushback{view.pushbackCount === 1 ? "" : "s"}</span>
            </div>
          ) : null}
        </div>
      )}

      <div className={styles.heatmapWrapper}>
        <Heatmap days={view.heatmapDays} />
      </div>
    </div>
  );
}
