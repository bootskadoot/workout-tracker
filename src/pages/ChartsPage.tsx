import { useState, useMemo } from "react";
import { ExerciseChart } from "../components/ExerciseChart";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { ExerciseFilter } from "../components/ExerciseFilter";
import { filterWorkoutsByDateRange, filterWorkoutsByExercise } from "../utils/filters";
import type { Exercise, WorkoutEntry } from "../types";
import type { DateRange } from "../utils/filters";

interface Props {
  exercises: Exercise[];
  workouts: WorkoutEntry[];
}

export function ChartsPage({ exercises, workouts }: Props) {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Apply filters to workouts
  const filteredWorkouts = useMemo(() => {
    let filtered = workouts;
    filtered = filterWorkoutsByDateRange(filtered, dateRange);
    filtered = filterWorkoutsByExercise(filtered, selectedExercise);
    return filtered;
  }, [workouts, dateRange, selectedExercise]);

  // Find exercises that have been logged with weight data
  const exercisesWithData = useMemo(() => {
    const exerciseIds = new Set<string>();
    filteredWorkouts.forEach((workout) => {
      workout.exercises.forEach((ex) => {
        if (ex.weightOrDuration !== undefined) {
          exerciseIds.add(ex.exerciseId);
        }
      });
    });

    return exercises.filter((ex) => exerciseIds.has(ex.id));
  }, [exercises, filteredWorkouts]);

  if (exercisesWithData.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">Progress Charts</h2>
        <p className="muted">
          No workout data to display yet. Start logging workouts to see your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="card">
        <h2 className="card-title">Progress Charts</h2>
        <p className="muted">Track your weight progression over time for each exercise</p>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        <ExerciseFilter
          exercises={exercises}
          value={selectedExercise}
          onChange={setSelectedExercise}
          workouts={workouts}
        />
      </div>

      {exercisesWithData.map((exercise) => (
        <div key={exercise.id} className="card">
          <ExerciseChart
            exerciseId={exercise.id}
            exerciseName={exercise.name}
            workouts={filteredWorkouts}
          />
        </div>
      ))}
    </div>
  );
}
