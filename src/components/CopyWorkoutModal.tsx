import type { Exercise, WorkoutEntry } from "../types";

interface Props {
  exercises: Exercise[];
  workouts: WorkoutEntry[];
  onCopy: (workout: WorkoutEntry) => void;
  onClose: () => void;
}

export function CopyWorkoutModal({ exercises, workouts, onCopy, onClose }: Props) {
  // Show last 10 workouts
  const recent = [...workouts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getExerciseName = (id: string) =>
    exercises.find((e) => e.id === id)?.name ?? "Unknown";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Copy from recent workout</h2>
        {recent.length === 0 ? (
          <p className="muted">No recent workouts to copy from.</p>
        ) : (
          <ul className="workout-select-list">
            {recent.map((workout) => (
              <li key={workout.id} onClick={() => onCopy(workout)}>
                <div>
                  <div className="workout-date">{formatDate(workout.date)}</div>
                  <div className="workout-summary">
                    {workout.exercises.map((ex, idx) => (
                      <span key={idx}>
                        {getExerciseName(ex.exerciseId)}
                        {idx < workout.exercises.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="workout-count">{workout.exercises.length} exercises</span>
              </li>
            ))}
          </ul>
        )}
        <button className="secondary-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
