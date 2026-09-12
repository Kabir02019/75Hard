import { HeatmapDay } from "@/lib/playerView";
import styles from "./Heatmap.module.css";

function getCellClassName(day: HeatmapDay): string {
  if (day.isInFuture) {
    return styles.cellFuture;
  }
  if (day.isComplete) {
    return styles.cellComplete;
  }
  return styles.cellIncomplete;
}

export default function Heatmap({ days }: { days: HeatmapDay[] }) {
  return (
    <div className={styles.grid} role="img" aria-label="75-day completion heatmap">
      {days.map((day) => {
        const cellClassName = getCellClassName(day);
        const todayClassName = day.isToday ? styles.cellToday : "";
        return (
          <div
            key={day.dateString}
            className={cellClassName + " " + todayClassName}
            title={"Day " + day.calendarDayNumber + " \u00b7 " + day.dateString}
          />
        );
      })}
    </div>
  );
}
