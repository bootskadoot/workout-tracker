import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProfileSelection } from "./components/ProfileSelection";
import { MigrationPrompt } from "./components/MigrationPrompt";
import { useExerciseLibrary, useWorkoutHistory } from "./hooks";
import { useUser } from "./userContext";
import { HomePage } from "./pages/HomePage";
import { SettingsPage } from "./pages/SettingsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ChartsPage } from "./pages/ChartsPage";
import { PRsPage } from "./pages/PRsPage";
import { saveWorkoutToSupabase, deleteWorkoutFromSupabase } from "./services/supabaseService";
import type { WorkoutEntry } from "./types";

export function App() {
  const { currentUser, setCurrentUser } = useUser();
  const { exercises, setExercises } = useExerciseLibrary();
  const { workouts, setWorkouts, syncing, lastSync, syncToSupabase, setLastSync } = useWorkoutHistory(currentUser?.id || "user1");

  const handleDeleteWorkout = async (id: string) => {
    // Update local state immediately
    setWorkouts(workouts.filter((w) => w.id !== id));

    // Try to delete from Supabase (best effort)
    if (currentUser) {
      const success = await deleteWorkoutFromSupabase(currentUser.id, id);
      if (success) {
        setLastSync(new Date());
      }
    }
  };

  const handleAddWorkout = async (entry: WorkoutEntry) => {
    // Update local state immediately
    setWorkouts([...workouts, entry]);

    // Try to save to Supabase (best effort)
    if (currentUser) {
      const success = await saveWorkoutToSupabase(currentUser.id, entry);
      if (success) {
        // Update sync indicator to show it just synced
        setLastSync(new Date());
      }
    }
  };

  // Show profile selection if no user is logged in
  if (!currentUser) {
    return <ProfileSelection onSelectUser={setCurrentUser} />;
  }

  return (
    <>
      <MigrationPrompt userId={currentUser.id} workouts={workouts} />
      <Layout syncing={syncing} lastSync={lastSync}>
        <Routes>
        <Route
          path="/"
          element={
            <HomePage
              exercises={exercises}
              workouts={workouts}
              onAddWorkout={handleAddWorkout}
              onDeleteWorkout={handleDeleteWorkout}
            />
          }
        />
        <Route
          path="/history"
          element={
            <HistoryPage
              exercises={exercises}
              workouts={workouts}
              onDeleteWorkout={handleDeleteWorkout}
            />
          }
        />
        <Route
          path="/charts"
          element={<ChartsPage exercises={exercises} workouts={workouts} />}
        />
        <Route
          path="/prs"
          element={<PRsPage exercises={exercises} workouts={workouts} />}
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              exercises={exercises}
              setExercises={setExercises}
              onManualSync={syncToSupabase}
              syncing={syncing}
              lastSync={lastSync}
            />
          }
        />
      </Routes>
      </Layout>
    </>
  );
}



