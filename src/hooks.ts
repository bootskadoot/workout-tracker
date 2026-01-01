import { useEffect, useState } from "react";
import { loadExercises, loadWorkouts, saveExercises, saveWorkouts } from "./localStorage";
import type { Exercise, WorkoutEntry } from "./types";

export function useExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    setExercises(loadExercises());
  }, []);

  useEffect(() => {
    if (exercises.length) {
      saveExercises(exercises);
    }
  }, [exercises]);

  return { exercises, setExercises };
}

export function useWorkoutHistory(userId: string) {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  useEffect(() => {
    setWorkouts(loadWorkouts(userId));
  }, [userId]);

  useEffect(() => {
    if (workouts.length || workouts.length === 0) {
      saveWorkouts(userId, workouts);
    }
  }, [workouts, userId]);

  return { workouts, setWorkouts };
}



