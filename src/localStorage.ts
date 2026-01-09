import type { Exercise, ExerciseSet, WorkoutEntry } from "./types";

const EXERCISES_KEY = "wt_exercises_v1";

// Generate a deterministic ID from exercise name
export function slugifyExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getWorkoutsKey(userId: string): string {
  return `wt_workouts_${userId}_v1`;
}

export function loadExercises(): Exercise[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EXERCISES_KEY);
    if (!raw) return getDefaultExercises();
    const parsed = JSON.parse(raw) as Exercise[];
    if (!Array.isArray(parsed)) return getDefaultExercises();
    return parsed;
  } catch {
    return getDefaultExercises();
  }
}

export function saveExercises(exercises: Exercise[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
}

// Old workout format (for migration)
interface OldWorkoutEntry {
  id: string;
  date: string;
  exerciseId: string;
  sets: number;
  reps?: number;
  weightOrDuration?: number;
  notes?: string;
}

function isOldFormat(entry: any): entry is OldWorkoutEntry {
  return entry && "exerciseId" in entry && !("exercises" in entry);
}

function migrateWorkout(oldEntry: OldWorkoutEntry): WorkoutEntry {
  const exerciseSet: ExerciseSet = {
    exerciseId: oldEntry.exerciseId,
    sets: oldEntry.sets,
    reps: oldEntry.reps,
    weightOrDuration: oldEntry.weightOrDuration
  };

  return {
    id: oldEntry.id,
    date: oldEntry.date,
    exercises: [exerciseSet],
    notes: oldEntry.notes
  };
}

export function loadWorkouts(userId: string): WorkoutEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getWorkoutsKey(userId);
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    if (!Array.isArray(parsed)) return [];

    // Migrate old format to new format
    const migrated = parsed.map((entry) => {
      if (isOldFormat(entry)) {
        const migratedEntry = migrateWorkout(entry);
        return migratedEntry;
      }
      return entry as WorkoutEntry;
    });

    // Save migrated data back if migration occurred
    const needsMigration = parsed.some(isOldFormat);
    if (needsMigration) {
      saveWorkouts(userId, migrated);
    }

    return migrated;
  } catch {
    return [];
  }
}

export function saveWorkouts(userId: string, workouts: WorkoutEntry[]) {
  if (typeof window === "undefined") return;
  const key = getWorkoutsKey(userId);
  window.localStorage.setItem(key, JSON.stringify(workouts));
}

export function getDefaultExercises(): Exercise[] {
  // Default list based on your JSON, mapped into the internal Exercise shape.
  const base = [
    { name: "Barbell Bench Press", muscle: "Chest" },
    { name: "Dumbbell Bench Press", muscle: "Chest" },
    { name: "Push-Up", muscle: "Chest" },
    { name: "Dumbbell Fly (Flat)", muscle: "Chest" },
    { name: "Band Chest Fly", muscle: "Chest" },

    { name: "Pull-Up", muscle: "Back" },
    { name: "Chin-Up", muscle: "Back" },
    { name: "Chest-Supported Dumbbell Row", muscle: "Back" },
    { name: "One-Arm Dumbbell Row", muscle: "Back" },
    { name: "Band Row", muscle: "Back" },
    { name: "Inverted Row", muscle: "Back" },

    { name: "Dumbbell Overhead Press", muscle: "Shoulders" },
    { name: "Barbell Overhead Press", muscle: "Shoulders" },
    { name: "Dumbbell Lateral Raise", muscle: "Shoulders" },
    { name: "Front Raise", muscle: "Shoulders" },
    { name: "Band Face Pull", muscle: "Shoulders" },
    { name: "Rear Delt Dumbbell Fly", muscle: "Shoulders" },

    { name: "Barbell Curl", muscle: "Arms" },
    { name: "Dumbbell Curl", muscle: "Arms" },
    { name: "Hammer Curl", muscle: "Arms" },
    { name: "Band Curl", muscle: "Arms" },
    { name: "Close-Grip Bench Press", muscle: "Arms" },
    { name: "Dumbbell Skull Crusher", muscle: "Arms" },
    { name: "Overhead Dumbbell Triceps Extension", muscle: "Arms" },
    { name: "Band Triceps Pushdown", muscle: "Arms" },

    { name: "Back Squat", muscle: "Quads" },
    { name: "Front Squat", muscle: "Quads" },
    { name: "Goblet Squat", muscle: "Quads" },
    { name: "Box Squat", muscle: "Quads" },
    { name: "Split Squat", muscle: "Quads" },
    { name: "Spanish Squat", muscle: "Quads" },
    { name: "Band Leg Extension", muscle: "Quads" },

    { name: "Romanian Deadlift", muscle: "Hamstrings" },
    { name: "Single-Leg Romanian Deadlift", muscle: "Hamstrings" },
    { name: "Dumbbell Romanian Deadlift", muscle: "Hamstrings" },
    { name: "Hip Thrust", muscle: "Glutes" },
    { name: "Glute Bridge", muscle: "Glutes" },
    { name: "Trap Bar Deadlift (High Handles)", muscle: "Glutes" },
    { name: "Band Hamstring Curl", muscle: "Hamstrings" },
    { name: "Slider Hamstring Curl", muscle: "Hamstrings" },
    { name: "Good Morning", muscle: "Hamstrings" },

    { name: "Standing Calf Raise", muscle: "Calves" },
    { name: "Seated Calf Raise", muscle: "Calves" },
    { name: "Single-Leg Calf Raise", muscle: "Calves" }
  ];

  return base.map((e) => ({
    id: slugifyExerciseName(e.name),
    name: e.name,
    category: e.muscle,
    unit: "weight_reps" as const
  }));
}



