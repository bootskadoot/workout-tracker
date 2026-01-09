import { useState, useMemo } from "react";
import type { Exercise, WorkoutEntry } from "../types";
import { WorkoutHistory } from "../components/WorkoutHistory";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { ExerciseFilter } from "../components/ExerciseFilter";
import { filterWorkoutsByDateRange, filterWorkoutsByExercise } from "../utils/filters";
import type { DateRange } from "../utils/filters";

interface Props {
  exercises: Exercise[];
  workouts: WorkoutEntry[];
  onDeleteWorkout: (id: string) => void;
  onEditWorkout: (updated: WorkoutEntry) => void;
}

export function HistoryPage({
  exercises,
  workouts,
  onDeleteWorkout,
  onEditWorkout
}: Props) {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Apply filters to workouts
  const filteredWorkouts = useMemo(() => {
    let filtered = workouts;
    filtered = filterWorkoutsByDateRange(filtered, dateRange);
    filtered = filterWorkoutsByExercise(filtered, selectedExercise);
    return filtered;
  }, [workouts, dateRange, selectedExercise]);

  return (
    <div className="stack">
      <div className="card">
        <h2 className="card-title">Workout History</h2>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        <ExerciseFilter
          exercises={exercises}
          value={selectedExercise}
          onChange={setSelectedExercise}
          workouts={workouts}
        />
      </div>

      <WorkoutHistory
        exercises={exercises}
        workouts={filteredWorkouts}
        onDeleteWorkout={onDeleteWorkout}
        onEditWorkout={onEditWorkout}
      />
    </div>
  );
}



