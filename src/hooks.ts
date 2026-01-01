import { useEffect, useState } from "react";
import { loadExercises, loadWorkouts, saveExercises, saveWorkouts } from "./localStorage";
import {
  fetchWorkoutsFromSupabase,
  saveWorkoutToSupabase,
  isSupabaseConfigured
} from "./services/supabaseService";
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
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load workouts on mount - try Supabase first, fallback to localStorage
  useEffect(() => {
    async function loadData() {
      setSyncing(true);
      try {
        // Try to fetch from Supabase first
        const supabaseWorkouts = await fetchWorkoutsFromSupabase(userId);

        if (supabaseWorkouts.length > 0) {
          // Supabase has data, use it
          setWorkouts(supabaseWorkouts);
          // Also save to localStorage as cache
          saveWorkouts(userId, supabaseWorkouts);
          setLastSync(new Date());
        } else {
          // No Supabase data, load from localStorage
          const localWorkouts = loadWorkouts(userId);
          setWorkouts(localWorkouts);
        }
      } catch (error) {
        console.error('Error loading from Supabase, using localStorage:', error);
        setWorkouts(loadWorkouts(userId));
      } finally {
        setSyncing(false);
      }
    }

    loadData();
  }, [userId]);

  // Save to both localStorage and Supabase whenever workouts change
  useEffect(() => {
    if (workouts.length === 0 && !lastSync) {
      // Skip saving if we just initialized with empty array
      return;
    }

    // Always save to localStorage (instant, offline backup)
    saveWorkouts(userId, workouts);

    // Try to sync to Supabase (async, best effort)
    if (isSupabaseConfigured()) {
      // Note: We save individual workouts, not the whole array
      // This is handled when workouts are added/removed
    }
  }, [workouts, userId]);

  // Helper to manually sync all workouts to Supabase
  const syncToSupabase = async () => {
    if (!isSupabaseConfigured()) return;

    setSyncing(true);
    try {
      for (const workout of workouts) {
        await saveWorkoutToSupabase(userId, workout);
      }
      setLastSync(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  return {
    workouts,
    setWorkouts,
    syncing,
    lastSync,
    syncToSupabase,
    setLastSync
  };
}



