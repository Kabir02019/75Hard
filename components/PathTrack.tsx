import { TOTAL_DAYS } from "@/lib/game";
import styles from "./PathTrack.module.css";

export type PathTrackPlayer = {
  playerId: string;
  name: string;
  progressDay: number;
  eliminated: boolean;
  colorVariableName: string;
};

type TrackPoint = {
  x: number;
  y: number;
};

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 640;
const TOP_MARGIN = 40;
const BOTTOM_MARGIN = 40;
const TRACK_HEIGHT = VIEW_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;
const AMPLITUDE = VIEW_WIDTH * 0.24;
const CENTER_X = VIEW_WIDTH / 2;
const BEND_COUNT = 3.2;

// Both the drawn trail and every token on it come from this single
// function, so the tokens always sit exactly on the line — nothing is
// measured at render time, it's all one shared formula.
function getPointAtProgress(progressFraction: number): TrackPoint {
  const clampedFraction = Math.max(0, Math.min(1, progressFraction));
  const y = VIEW_HEIGHT - BOTTOM_MARGIN - clampedFraction * TRACK_HEIGHT;
  const x = CENTER_X + AMPLITUDE * Math.sin(clampedFraction * Math.PI * BEND_COUNT);
  return { x, y };
}

function buildTrailPath(): string {
  const sampleCount = 60;
  const pathCommands: string[] = [];
  for (let sampleIndex = 0; sampleIndex <= sampleCount; sampleIndex = sampleIndex + 1) {
    const fraction = sampleIndex / sampleCount;
    const point = getPointAtProgress(fraction);
    if (sampleIndex === 0) {
      pathCommands.push("M " + point.x.toFixed(1) + " " + point.y.toFixed(1));
    } else {
      pathCommands.push("L " + point.x.toFixed(1) + " " + point.y.toFixed(1));
    }
  }
  return pathCommands.join(" ");
}

function getInitials(name: string): string {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return "?";
  }
  const parts = trimmedName.split(" ");
  if (parts.length === 1) {
    return trimmedName.slice(0, 2).toUpperCase();
  }
  const firstInitial = parts[0].slice(0, 1);
  const lastInitial = parts[parts.length - 1].slice(0, 1);
  return (firstInitial + lastInitial).toUpperCase();
}

const CHECKPOINTS = [
  { day: 0, label: "Basecamp" },
  { day: 25, label: "Treeline" },
  { day: 50, label: "Ridge" },
  { day: 75, label: "Summit" },
];

export default function PathTrack({ players }: { players: PathTrackPlayer[] }) {
  const trailPathData = buildTrailPath();

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.svg}
        viewBox={"0 0 " + VIEW_WIDTH + " " + VIEW_HEIGHT}
        role="img"
        aria-label="Trail showing each player's progress toward day 75"
      >
        <path
          d={trailPathData}
          className={styles.trailLine}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {CHECKPOINTS.map((checkpoint) => {
          const point = getPointAtProgress(checkpoint.day / TOTAL_DAYS);
          const labelIsOnRight = point.x < CENTER_X;
          const labelX = labelIsOnRight ? point.x + 16 : point.x - 16;
          const textAnchor = labelIsOnRight ? "start" : "end";
          return (
            <g key={checkpoint.label}>
              <circle cx={point.x} cy={point.y} r={5} className={styles.checkpointDot} />
              <text
                x={labelX}
                y={point.y + 4}
                textAnchor={textAnchor}
                className={styles.checkpointLabel}
              >
                {checkpoint.label}
              </text>
            </g>
          );
        })}

        {players.map((player, playerIndex) => {
          const progressFraction = player.progressDay / TOTAL_DAYS;
          const point = getPointAtProgress(progressFraction);
          const horizontalJitter = (playerIndex - 1) * 20;
          const tokenX = point.x + horizontalJitter;
          const tokenY = point.y;
          const tokenClassName = player.eliminated ? styles.tokenEliminated : styles.token;

          return (
            <g key={player.playerId} className={tokenClassName}>
              <circle
                cx={tokenX}
                cy={tokenY}
                r={16}
                style={{ fill: "var(--" + player.colorVariableName + ")" }}
                className={styles.tokenCircle}
              />
              <text x={tokenX} y={tokenY + 5} textAnchor="middle" className={styles.tokenInitials}>
                {getInitials(player.name)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
