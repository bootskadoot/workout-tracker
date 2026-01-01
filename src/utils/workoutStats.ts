import type { WorkoutEntry } from "../types";

/**
 * Find the most recent weight used for a specific exercise (globally)
 */
export function getLastWeightUsed(
  exerciseId: string,
  workouts: WorkoutEntry[]
): number | undefined {
  // Sort workouts by date descending
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));

  // Find first workout containing this exercise
  for (const workout of sorted) {
    const exerciseSet = workout.exercises.find((ex) => ex.exerciseId === exerciseId);
    if (exerciseSet?.weightOrDuration !== undefined) {
      return exerciseSet.weightOrDuration;
    }
  }
  return undefined;
}

/**
 * Calculate the most common sets/reps combination for an exercise
 * Returns default values (3 sets, undefined reps) if no history exists
 */
export function getCommonSetsReps(
  exerciseId: string,
  workouts: WorkoutEntry[]
): { sets: number; reps: number | undefined } {
  const occurrences: { sets: number; reps: number | undefined }[] = [];

  workouts.forEach((workout) => {
    const exerciseSet = workout.exercises.find((ex) => ex.exerciseId === exerciseId);
    if (exerciseSet) {
      occurrences.push({ sets: exerciseSet.sets, reps: exerciseSet.reps });
    }
  });

  if (occurrences.length === 0) {
    return { sets: 3, reps: undefined };
  }

  // Find most common combination using frequency map
  const frequency = new Map<string, number>();
  occurrences.forEach(({ sets, reps }) => {
    const key = `${sets}-${reps}`;
    frequency.set(key, (frequency.get(key) || 0) + 1);
  });

  let maxCount = 0;
  let mostCommon = occurrences[0];
  frequency.forEach((count, key) => {
    if (count > maxCount) {
      maxCount = count;
      const [sets, reps] = key.split("-");
      mostCommon = {
        sets: Number(sets),
        reps: reps === "undefined" ? undefined : Number(reps),
      };
    }
  });

  return mostCommon;
}
