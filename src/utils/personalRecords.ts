import type { WorkoutEntry } from "../types";

export interface PersonalRecordData {
  exerciseId: string;
  bestWeight: number;
  bestWeightDate: string;
  bestReps?: number;
  workoutId: string;
}

/**
 * Calculate all personal records (best weight for each exercise)
 */
export function calculatePersonalRecords(
  workouts: WorkoutEntry[]
): Map<string, PersonalRecordData> {
  const prs = new Map<string, PersonalRecordData>();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exerciseSet) => {
      if (exerciseSet.weightOrDuration === undefined) return;

      const current = prs.get(exerciseSet.exerciseId);

      if (!current || exerciseSet.weightOrDuration > current.bestWeight) {
        prs.set(exerciseSet.exerciseId, {
          exerciseId: exerciseSet.exerciseId,
          bestWeight: exerciseSet.weightOrDuration,
          bestWeightDate: workout.date,
          bestReps: exerciseSet.reps,
          workoutId: workout.id,
        });
      }
    });
  });

  return prs;
}

/**
 * Check if a weight is a new personal record for an exercise
 */
export function isNewPR(
  exerciseId: string,
  weight: number,
  workouts: WorkoutEntry[],
  currentWorkoutId?: string
): boolean {
  const prs = calculatePersonalRecords(
    workouts.filter((w) => w.id !== currentWorkoutId)
  );
  const currentPR = prs.get(exerciseId);

  return !currentPR || weight > currentPR.bestWeight;
}

/**
 * Check if a workout contains any personal records
 */
export function isPRWorkout(
  workout: WorkoutEntry,
  allWorkouts: WorkoutEntry[]
): boolean {
  const previousWorkouts = allWorkouts.filter(
    (w) => w.id !== workout.id && w.date <= workout.date
  );

  return workout.exercises.some((exerciseSet) => {
    if (exerciseSet.weightOrDuration === undefined) return false;
    return isNewPR(
      exerciseSet.exerciseId,
      exerciseSet.weightOrDuration,
      previousWorkouts
    );
  });
}
