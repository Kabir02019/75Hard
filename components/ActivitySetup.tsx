"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ActivitySetup.module.css";

type SaveState = "idle" | "saving" | "saved" | "error";

const DEFAULT_SUGGESTIONS = [
  "Workout 1 (45 min)",
  "Workout 2 outdoors (45 min)",
  "Follow my diet",
  "Drink a gallon of water",
  "Read 10 pages",
  "Take a progress photo",
];

export default function ActivitySetup({
  token,
  initialActivities,
  daysUntilStart,
}: {
  token: string;
  initialActivities: string[];
  daysUntilStart: number;
}) {
  const router = useRouter();

  const startingList = initialActivities.length > 0 ? initialActivities : DEFAULT_SUGGESTIONS;
  const [activityInputs, setActivityInputs] = useState<string[]>(startingList);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  function handleChange(index: number, value: string) {
    const nextInputs = [...activityInputs];
    nextInputs[index] = value;
    setActivityInputs(nextInputs);
    setSaveState("idle");
  }

  function handleAddRow() {
    setActivityInputs([...activityInputs, ""]);
  }

  function handleRemoveRow(index: number) {
    const nextInputs = [...activityInputs];
    nextInputs.splice(index, 1);
    setActivityInputs(nextInputs);
  }

  async function handleSave() {
    setSaveState("saving");

    const cleanedActivities: string[] = [];
    for (let index = 0; index < activityInputs.length; index = index + 1) {
      const trimmedValue = activityInputs[index].trim();
      if (trimmedValue.length > 0) {
        cleanedActivities.push(trimmedValue);
      }
    }

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, activities: cleanedActivities }),
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

  let buttonLabel = "Save my list";
  if (saveState === "saving") {
    buttonLabel = "Saving\u2026";
  } else if (saveState === "saved") {
    buttonLabel = "Saved";
  }

  return (
    <div className={styles.card}>
      <p className={styles.intro}>
        Build the list of daily activities you're committing to for the Showdown. You can change this
        as many times as you like until the challenge starts
        {daysUntilStart > 0 ? " in " + daysUntilStart + " day" + (daysUntilStart === 1 ? "" : "s") : ""}
        . After that, it locks for all 75 days.
      </p>

      <div className={styles.rows}>
        {activityInputs.map((value, index) => (
          <div key={index} className={styles.row}>
            <input
              type="text"
              value={value}
              onChange={(event) => handleChange(index, event.target.value)}
              placeholder="e.g. Read 10 pages"
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => handleRemoveRow(index)}
              className={styles.removeButton}
              aria-label="Remove this activity"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <button type="button" onClick={handleAddRow} className={styles.addButton}>
        + Add another activity
      </button>

      <button type="button" onClick={handleSave} className={styles.saveButton} disabled={saveState === "saving"}>
        {buttonLabel}
      </button>

      {saveState === "error" ? (
        <p className={styles.errorNote}>Something went wrong saving that. Try again.</p>
      ) : null}
    </div>
  );
}
