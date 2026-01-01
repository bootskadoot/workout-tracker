import type { Exercise, WorkoutEntry } from "../types";

interface Props {
  exercises: Exercise[];
  value: string | null;
  onChange: (exerciseId: string | null) => void;
  workouts: WorkoutEntry[];
}

export function ExerciseFilter({ exercises, value, onChange, workouts }: Props) {
  // Only show exercises that have been logged
  const exercisesWithData = exercises.filter((ex) =>
    workouts.some((w) => w.exercises.some((e) => e.exerciseId === ex.id))
  );

  return (
    <div className="filter-group">
      <label className="filter-label">Exercise</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="filter-select"
      >
        <option value="">All exercises</option>
        {exercisesWithData.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>
    </div>
  );
}
