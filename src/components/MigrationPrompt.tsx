import { useState, useEffect } from "react";
import { isSupabaseConfigured } from "../supabaseClient";
import {
  migrateWorkoutsToSupabase,
  hasUserMigrated,
  setMigrationComplete,
  hasLocalMigrationFlag,
} from "../services/supabaseService";
import type { WorkoutEntry } from "../types";

interface Props {
  userId: string;
  workouts: WorkoutEntry[];
}

export function MigrationPrompt({ userId, workouts }: Props) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  useEffect(() => {
    async function checkMigrationNeeded() {
      // Only check if Supabase is configured
      if (!isSupabaseConfigured()) {
        return;
      }

      // If user already migrated (local flag), don't prompt
      if (hasLocalMigrationFlag(userId)) {
        return;
      }

      // If no local workouts, nothing to migrate
      if (workouts.length === 0) {
        setMigrationComplete(userId);
        return;
      }

      // Check if user already has data in Supabase
      const alreadyMigrated = await hasUserMigrated(userId);
      if (alreadyMigrated) {
        setMigrationComplete(userId);
        return;
      }

      // User has local data but no Supabase data - show prompt
      setShowPrompt(true);
    }

    checkMigrationNeeded();
  }, [userId, workouts.length]);

  async function handleMigrate() {
    setMigrating(true);
    try {
      const migrationResult = await migrateWorkoutsToSupabase(userId, workouts);
      setResult(migrationResult);
      setMigrationComplete(userId);

      // Auto-close after showing result for 3 seconds
      setTimeout(() => {
        setShowPrompt(false);
      }, 3000);
    } catch (error) {
      console.error("Migration failed:", error);
    } finally {
      setMigrating(false);
    }
  }

  function handleSkip() {
    setMigrationComplete(userId);
    setShowPrompt(false);
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content migration-modal">
        <h2 className="modal-title">☁ Upload to Cloud?</h2>

        {!result ? (
          <>
            <p className="modal-text">
              You have {workouts.length} workout{workouts.length !== 1 ? "s" : ""} stored locally.
            </p>
            <p className="modal-text">
              Would you like to upload them to the cloud for backup and sync across devices?
            </p>

            <div className="button-row">
              <button
                className="primary-btn"
                onClick={handleMigrate}
                disabled={migrating}
                type="button"
              >
                {migrating ? "Uploading..." : "Upload Now"}
              </button>
              <button className="secondary-btn" onClick={handleSkip} disabled={migrating} type="button">
                Skip
              </button>
            </div>
          </>
        ) : (
          <div className="migration-result">
            <p className="modal-text success">
              ✓ Successfully uploaded {result.success} workout{result.success !== 1 ? "s" : ""}!
            </p>
            {result.failed > 0 && (
              <p className="modal-text error">Failed to upload {result.failed} workouts.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
