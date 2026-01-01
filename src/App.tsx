import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProfileSelection } from "./components/ProfileSelection";
import { useExerciseLibrary, useWorkoutHistory } from "./hooks";
import { useUser } from "./userContext";
import { HomePage } from "./pages/HomePage";
import { SettingsPage } from "./pages/SettingsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ChartsPage } from "./pages/ChartsPage";
import { PRsPage } from "./pages/PRsPage";

export function App() {
  const { currentUser, setCurrentUser } = useUser();
  const { exercises, setExercises } = useExerciseLibrary();
  const { workouts, setWorkouts } = useWorkoutHistory(currentUser?.id || "user1");

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(workouts.filter((w) => w.id !== id));
  };

  // Show profile selection if no user is logged in
  if (!currentUser) {
    return <ProfileSelection onSelectUser={setCurrentUser} />;
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              exercises={exercises}
              workouts={workouts}
              onAddWorkout={(entry) => setWorkouts([...workouts, entry])}
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
          element={<SettingsPage exercises={exercises} setExercises={setExercises} />}
        />
      </Routes>
    </Layout>
  );
}



