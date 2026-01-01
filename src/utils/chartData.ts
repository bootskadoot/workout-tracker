import type { WorkoutEntry } from "../types";

export interface ChartDataPoint {
  date: string;
  weight: number;
  reps?: number;
  displayDate: string;
}

/**
 * Transform workout data into chart-ready format for a specific exercise
 */
export function getExerciseChartData(
  exerciseId: string,
  workouts: WorkoutEntry[]
): ChartDataPoint[] {
  const dataPoints: ChartDataPoint[] = [];

  workouts.forEach((workout) => {
    const exerciseSet = workout.exercises.find((ex) => ex.exerciseId === exerciseId);
    if (exerciseSet?.weightOrDuration !== undefined) {
      dataPoints.push({
        date: workout.date,
        weight: exerciseSet.weightOrDuration,
        reps: exerciseSet.reps,
        displayDate: new Date(workout.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      });
    }
  });

  // Sort by date ascending for chart display
  return dataPoints.sort((a, b) => a.date.localeCompare(b.date));
}
