import type { WorkoutEntry } from "../types";

export type DateRange = "7days" | "30days" | "3months" | "all";

/**
 * Filter workouts by date range
 */
export function filterWorkoutsByDateRange(
  workouts: WorkoutEntry[],
  range: DateRange
): WorkoutEntry[] {
  if (range === "all") return workouts;

  const now = new Date();
  const cutoffDate = new Date();

  switch (range) {
    case "7days":
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case "30days":
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case "3months":
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
  }

  return workouts.filter((workout) => new Date(workout.date) >= cutoffDate);
}

/**
 * Filter workouts by exercise ID
 */
export function filterWorkoutsByExercise(
  workouts: WorkoutEntry[],
  exerciseId: string | null
): WorkoutEntry[] {
  if (!exerciseId) return workouts;

  return workouts.filter((workout) =>
    workout.exercises.some((ex) => ex.exerciseId === exerciseId)
  );
}
