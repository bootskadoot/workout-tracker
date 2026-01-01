import type { Exercise, WorkoutEntry } from "../types";
import { isNewPR } from "../utils/personalRecords";

interface Props {
  exercises: Exercise[];
  workouts: WorkoutEntry[];
  onDeleteWorkout?: (id: string) => void;
}

export function WorkoutHistory({ exercises, workouts, onDeleteWorkout }: Props) {
  const sorted = [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1));

  // Helper to check if an exercise in a workout is a PR
  const isPRExercise = (workout: WorkoutEntry, exerciseId: string, weight: number) => {
    const previousWorkouts = workouts.filter(
      (w) => w.id !== workout.id && w.date < workout.date
    );
    return isNewPR(exerciseId, weight, previousWorkouts);
  };

  const getExerciseName = (id: string) =>
    exercises.find((e) => e.id === id)?.name ?? "Unknown exercise";

  if (!sorted.length) {
    return (
      <section className="card">
        <h2 className="card-title">History</h2>
        <p className="muted">No workouts logged yet.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2 className="card-title">History</h2>
      <ul className="history-list">
        {sorted.map((w) => {
          const getUnit = (exerciseId: string) => {
            const ex = exercises.find((e) => e.id === exerciseId);
            return ex?.unit === "duration" ? "min" : ex?.unit === "distance" ? "km" : "kg";
          };

          return (
            <li key={w.id} className="history-item">
              <div className="history-main">
                <div className="history-title">
                  <span className="history-date">
                    {new Date(w.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                  <span className="history-exercise-count">
                    {w.exercises.length} {w.exercises.length === 1 ? "exercise" : "exercises"}
                  </span>
                  {onDeleteWorkout && (
                    <button
                      type="button"
                      className="ghost-btn history-delete-btn"
                      onClick={() => onDeleteWorkout(w.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <ul className="workout-exercises">
                  {w.exercises.map((exSet, idx) => {
                    const isPR =
                      exSet.weightOrDuration !== undefined &&
                      isPRExercise(w, exSet.exerciseId, exSet.weightOrDuration);

                    return (
                      <li key={idx} className="workout-exercise-item">
                        <strong>{getExerciseName(exSet.exerciseId)}</strong>
                        <span className="exercise-details">
                          {exSet.sets} sets
                          {typeof exSet.reps === "number" && ` × ${exSet.reps} reps`}
                          {typeof exSet.weightOrDuration === "number" && (
                            <span> @ {exSet.weightOrDuration} {getUnit(exSet.exerciseId)}</span>
                          )}
                          {isPR && <span className="pr-badge">PR!</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {w.notes && <p className="history-notes">{w.notes}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
