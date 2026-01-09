import { useEffect, useState, useRef } from "react";
import { loadExercises, loadWorkouts, saveExercises, saveWorkouts, getDefaultExercises } from "./localStorage";
import {
  fetchExercisesFromSupabase,
  fetchWorkoutsFromSupabase,
  saveWorkoutToSupabase,
  syncAllExercisesToSupabase,
  isSupabaseConfigured
} from "./services/supabaseService";
import type { Exercise, WorkoutEntry } from "./types";

export function useExerciseLibrary(userId: string) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Track the previous userId to detect profile switches
  const prevUserIdRef = useRef<string>(userId);
  const isInitialLoadRef = useRef<boolean>(true);

  // Load exercises on mount or when userId changes
  useEffect(() => {
    async function loadData() {
      // Clear exercises immediately when switching users
      if (prevUserIdRef.current !== userId) {
        setExercises([]);
        prevUserIdRef.current = userId;
      }

      setSyncing(true);
      isInitialLoadRef.current = true;

      try {
        // Try to fetch from Supabase first
        const supabaseExercises = await fetchExercisesFromSupabase(userId);

        if (supabaseExercises.length > 0) {
          // Supabase has data, use it
          setExercises(supabaseExercises);
          // Also save to localStorage as cache
          saveExercises(supabaseExercises);
        } else {
          // No Supabase data, load from localStorage
          const localExercises = loadExercises();
          if (localExercises.length > 0) {
            setExercises(localExercises);
            // Sync local exercises to Supabase
            if (isSupabaseConfigured()) {
              await syncAllExercisesToSupabase(userId, localExercises);
            }
          } else {
            // No local data either, load defaults
            const defaults = getDefaultExercises();
            setExercises(defaults);
            saveExercises(defaults);
            if (isSupabaseConfigured()) {
              await syncAllExercisesToSupabase(userId, defaults);
            }
          }
        }
      } catch (error) {
        console.error('Error loading exercises from Supabase, using localStorage:', error);
        const localExercises = loadExercises();
        if (localExercises.length > 0) {
          setExercises(localExercises);
        } else {
          const defaults = getDefaultExercises();
          setExercises(defaults);
          saveExercises(defaults);
        }
      } finally {
        setSyncing(false);
        isInitialLoadRef.current = false;
      }
    }

    loadData();
  }, [userId]);

  // Save to localStorage whenever exercises change (Supabase sync is done individually)
  useEffect(() => {
    // Skip saving during initial load
    if (isInitialLoadRef.current) {
      return;
    }

    if (exercises.length > 0) {
      saveExercises(exercises);
    }
  }, [exercises]);

  return { exercises, setExercises, syncing };
}

export function useWorkoutHistory(userId: string) {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Track the previous userId to detect profile switches
  const prevUserIdRef = useRef<string>(userId);
  const isInitialLoadRef = useRef<boolean>(true);

  // Load workouts on mount or when userId changes
  useEffect(() => {
    async function loadData() {
      // Clear workouts immediately when switching users to prevent stale data
      if (prevUserIdRef.current !== userId) {
        setWorkouts([]);
        setLastSync(null);
        prevUserIdRef.current = userId;
      }

      setSyncing(true);
      isInitialLoadRef.current = true;

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
        isInitialLoadRef.current = false;
      }
    }

    loadData();
  }, [userId]);

  // Save to both localStorage and Supabase whenever workouts change
  useEffect(() => {
    // Skip saving during initial load or if workouts is empty without prior sync
    if (isInitialLoadRef.current) {
      return;
    }

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
  }, [workouts, userId, lastSync]);

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



