import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { WorkoutEntry } from '../types';
import type { PersonalRecordData } from '../utils/personalRecords';

// Re-export for convenience
export { isSupabaseConfigured };

export interface SyncStatus {
  syncing: boolean;
  lastSync: Date | null;
  error: string | null;
}

// Fetch all workouts for a user from Supabase
export async function fetchWorkoutsFromSupabase(userId: string): Promise<WorkoutEntry[]> {
  if (!supabase || !isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    // Convert Supabase format to app format
    return (data || []).map((workout) => ({
      id: workout.id,
      date: workout.date,
      exercises: workout.exercises as any,
      notes: workout.notes || undefined,
    }));
  } catch (error) {
    console.error('Error fetching workouts from Supabase:', error);
    return [];
  }
}

// Save a workout to Supabase
export async function saveWorkoutToSupabase(
  userId: string,
  workout: WorkoutEntry
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured()) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('workouts')
      .upsert({
        id: workout.id,
        user_id: userId,
        date: workout.date,
        exercises: workout.exercises as any,
        notes: workout.notes || null,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving workout to Supabase:', error);
    return false;
  }
}

// Delete a workout from Supabase
export async function deleteWorkoutFromSupabase(
  userId: string,
  workoutId: string
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured()) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting workout from Supabase:', error);
    return false;
  }
}

// Sync all workouts from localStorage to Supabase (for migration)
export async function migrateWorkoutsToSupabase(
  userId: string,
  workouts: WorkoutEntry[]
): Promise<{ success: number; failed: number }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: 0, failed: workouts.length };
  }

  let success = 0;
  let failed = 0;

  for (const workout of workouts) {
    const result = await saveWorkoutToSupabase(userId, workout);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

// Check if data has been migrated for this user
export async function hasUserMigrated(userId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured()) {
    return true; // Assume migrated if Supabase not configured
  }

  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;

    // Check if user has any workouts in Supabase
    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

// Save migration status in localStorage
const MIGRATION_KEY = 'wt_migration_status';

export function setMigrationComplete(userId: string): void {
  const status = getMigrationStatus();
  status[userId] = true;
  localStorage.setItem(MIGRATION_KEY, JSON.stringify(status));
}

export function getMigrationStatus(): Record<string, boolean> {
  try {
    const status = localStorage.getItem(MIGRATION_KEY);
    return status ? JSON.parse(status) : {};
  } catch {
    return {};
  }
}

export function hasLocalMigrationFlag(userId: string): boolean {
  const status = getMigrationStatus();
  return status[userId] === true;
}
