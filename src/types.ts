export type ExerciseCategory = string;

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  unit: "weight_reps" | "duration" | "distance" | "bodyweight_reps";
}

export interface ExerciseSet {
  exerciseId: string;
  sets: number;
  reps?: number;
  weightOrDuration?: number;
}

export interface WorkoutEntry {
  id: string;
  date: string; // ISO date string yyyy-mm-dd
  exercises: ExerciseSet[]; // Array of exercises in this workout
  notes?: string;
}

export interface PersonalRecord {
  exerciseId: string;
  bestWeight?: number;
  bestReps?: number;
}



