import { useMemo } from "react";
import { calculatePersonalRecords } from "../utils/personalRecords";
import type { Exercise, WorkoutEntry } from "../types";

interface Props {
  exercises: Exercise[];
  workouts: WorkoutEntry[];
}

export function PRsPage({ exercises, workouts }: Props) {
  const prs = useMemo(() => {
    return calculatePersonalRecords(workouts);
  }, [workouts]);

  const prList = useMemo(() => {
    return Array.from(prs.values())
      .map((pr) => ({
        ...pr,
        exercise: exercises.find((ex) => ex.id === pr.exerciseId),
      }))
      .filter((pr) => pr.exercise)
      .sort((a, b) => a.exercise!.name.localeCompare(b.exercise!.name));
  }, [prs, exercises]);

  if (prList.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">Personal Records</h2>
        <p className="muted">No personal records yet. Start lifting!</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="card">
        <h2 className="card-title">Personal Records</h2>
        <p className="muted">Your best weights for each exercise</p>
      </div>

      <div className="card">
        <ul className="pr-list">
          {prList.map((pr) => (
            <li key={pr.exerciseId} className="pr-item">
              <div className="pr-exercise-name">{pr.exercise!.name}</div>
              <div className="pr-details">
                <span className="pr-weight">{pr.bestWeight} kg</span>
                {pr.bestReps && <span className="pr-reps">× {pr.bestReps} reps</span>}
                <span className="pr-date">
                  {new Date(pr.bestWeightDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
