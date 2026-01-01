import type { Exercise, WorkoutEntry } from "../types";
import { WorkoutForm } from "../components/WorkoutForm";
import { WorkoutHistory } from "../components/WorkoutHistory";

interface Props {
  exercises: Exercise[];
  workouts: WorkoutEntry[];
  onAddWorkout: (entry: WorkoutEntry) => void;
}

export function HomePage({
  exercises,
  workouts,
  onAddWorkout,
  onDeleteWorkout
}: Props & { onDeleteWorkout: (id: string) => void }) {
  return (
    <div className="stack">
      <WorkoutForm exercises={exercises} workouts={workouts} onAddWorkout={onAddWorkout} />
      <WorkoutHistory
        exercises={exercises}
        workouts={workouts}
        onDeleteWorkout={onDeleteWorkout}
      />
    </div>
  );
}



