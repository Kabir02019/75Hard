"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DailyEntry } from "@/lib/game";
import styles from "./ChecklistCard.module.css";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function ChecklistCard({
  token,
  activities,
  initialEntry,
  calendarDayNumber,
}: {
  token: string;
  activities: string[];
  initialEntry: DailyEntry;
  calendarDayNumber: number;
}) {
  const router = useRouter();

  const initialCheckedState: Record<string, boolean> = {};
  for (let index = 0; index < activities.length; index = index + 1) {
    const activityName = activities[index];
    initialCheckedState[activityName] = initialEntry[activityName] === true;
  }

  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(initialCheckedState);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  function handleToggle(activityName: string) {
    const nextCheckedState = { ...checkedState };
    nextCheckedState[activityName] = !nextCheckedState[activityName];
    setCheckedState(nextCheckedState);
    setSaveState("idle");
  }

  async function handleSave() {
    setSaveState("saving");

    const completedActivities: string[] = [];
    for (let index = 0; index < activities.length; index = index + 1) {
      const activityName = activities[index];
      if (checkedState[activityName]) {
        completedActivities.push(activityName);
      }
    }

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, completedActivities: completedActivities }),
      });

      if (response.ok) {
        setSaveState("saved");
        router.refresh();
      } else {
        setSaveState("error");
      }
    } catch (error) {
      setSaveState("error");
    }
  }

  let allChecked = true;
  for (let index = 0; index < activities.length; index = index + 1) {
    if (checkedState[activities[index]] !== true) {
      allChecked = false;
    }
  }

  let buttonLabel = "Save today's checklist";
  if (saveState === "saving") {
    buttonLabel = "Saving\u2026";
  } else if (saveState === "saved") {
    buttonLabel = "Saved";
  }

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h2 className={styles.dayLabel}>Day {calendarDayNumber}</h2>
        {allChecked ? <span className={styles.completeBadge}>All done</span> : null}
      </div>

      <ul className={styles.list}>
        {activities.map((activityName) => {
          const isChecked = checkedState[activityName] === true;
          return (
            <li key={activityName} className={styles.listItem}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(activityName)}
                  className={styles.checkbox}
                />
                <span className={isChecked ? styles.activityChecked : styles.activity}>
                  {activityName}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <button type="button" onClick={handleSave} className={styles.saveButton} disabled={saveState === "saving"}>
        {buttonLabel}
      </button>

      {saveState === "error" ? (
        <p className={styles.errorNote}>Something went wrong saving that. Try again.</p>
      ) : null}
    </div>
  );
}
