import { useMemo, useState, useEffect, useRef } from "react";
import type { Exercise, ExerciseSet, WorkoutEntry } from "../types";
import { getLastWeightUsed, getCommonSetsReps } from "../utils/workoutStats";
import { CopyWorkoutModal } from "./CopyWorkoutModal";

interface Props {
  exercises: Exercise[];
  workouts: WorkoutEntry[];
  onAddWorkout: (entry: WorkoutEntry) => void;
}

function WeightInput({
  value,
  onChange,
}: {
  value: number | "";
  onChange: (val: number | "") => void;
}) {
  const handleIncrement = (delta: number) => {
    const current = value === "" ? 0 : value;
    const newValue = Math.max(0, current + delta);
    onChange(newValue);
  };

  return (
    <div className="weight-input-group">
      <div className="increment-buttons">
        <button
          type="button"
          onClick={() => handleIncrement(-5)}
          className="increment-btn"
        >
          -5
        </button>
        <button
          type="button"
          onClick={() => handleIncrement(-2.5)}
          className="increment-btn"
        >
          -2.5
        </button>
      </div>
      <input
        type="number"
        min={0}
        step={0.5}
        value={value}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
        className="weight-input-main"
      />
      <div className="increment-buttons">
        <button
          type="button"
          onClick={() => handleIncrement(2.5)}
          className="increment-btn"
        >
          +2.5
        </button>
        <button
          type="button"
          onClick={() => handleIncrement(5)}
          className="increment-btn"
        >
          +5
        </button>
      </div>
    </div>
  );
}

export function WorkoutForm({ exercises, workouts, onAddWorkout }: Props) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(today);
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState<number | "">("");
  const [weightOrDuration, setWeightOrDuration] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [addedExercises, setAddedExercises] = useState<ExerciseSet[]>([]);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Track when we're editing to skip auto-fill
  const isEditingRef = useRef(false);

  const selectedExercise = exercises.find((e) => e.id === exerciseId);

  // Auto-fill last weight and common sets/reps when exercise changes
  useEffect(() => {
    if (!exerciseId) return;

    // Skip auto-fill if we're editing an exercise
    if (isEditingRef.current) {
      isEditingRef.current = false;
      return;
    }

    // Auto-fill last weight used
    const lastWeight = getLastWeightUsed(exerciseId, workouts);
    if (lastWeight !== undefined) {
      setWeightOrDuration(lastWeight);
    }

    // Auto-fill common sets/reps
    const common = getCommonSetsReps(exerciseId, workouts);
    setSets(common.sets);
    if (common.reps !== undefined) {
      setReps(common.reps);
    }
  }, [exerciseId, workouts]);

  function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseId || !selectedExercise) return;
    if (!sets || sets <= 0) return;

    const exerciseSet: ExerciseSet = {
      exerciseId,
      sets,
      reps: reps === "" ? undefined : Number(reps),
      weightOrDuration: weightOrDuration === "" ? undefined : Number(weightOrDuration)
    };

    setAddedExercises([...addedExercises, exerciseSet]);
    
    // Reset form fields
    setExerciseId(exercises[0]?.id ?? "");
    setSets(3);
    setReps("");
    setWeightOrDuration("");
  }

  function handleRemoveExercise(index: number) {
    setAddedExercises(addedExercises.filter((_, i) => i !== index));
  }

  function handleEditExercise(index: number) {
    const exerciseToEdit = addedExercises[index];

    // Set flag to prevent auto-fill from overwriting our values
    isEditingRef.current = true;

    // Load the exercise back into the form
    setExerciseId(exerciseToEdit.exerciseId);
    setSets(exerciseToEdit.sets);
    setReps(exerciseToEdit.reps ?? "");
    setWeightOrDuration(exerciseToEdit.weightOrDuration ?? "");

    // Remove it from the added list
    setAddedExercises(addedExercises.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (addedExercises.length === 0) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const entry: WorkoutEntry = {
      id,
      date,
      exercises: addedExercises,
      notes: notes || undefined
    };

    onAddWorkout(entry);

    // Reset everything
    setAddedExercises([]);
    setNotes("");
    setExerciseId(exercises[0]?.id ?? "");
    setSets(3);
    setReps("");
    setWeightOrDuration("");
  }

  function handleCopyWorkout(workout: WorkoutEntry) {
    setDate(new Date().toISOString().slice(0, 10)); // Today's date
    setAddedExercises([...workout.exercises]); // Copy all exercises
    setShowCopyModal(false);
  }

  const unitLabel =
    selectedExercise?.unit === "duration"
      ? "Duration (min)"
      : selectedExercise?.unit === "distance"
        ? "Distance"
        : "Weight (kg)";

  const getExerciseName = (id: string) =>
    exercises.find((e) => e.id === id)?.name ?? "Unknown";

  return (
    <div className="card workout-form">
      <h2 className="card-title">Log workout</h2>

      <button
        type="button"
        className="secondary-btn"
        onClick={() => setShowCopyModal(true)}
        style={{ marginBottom: "0.75rem" }}
      >
        Copy from recent workout
      </button>

      <form onSubmit={handleAddExercise}>
        <div className="form-grid">
          <label className="field">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span>Exercise</span>
            <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Sets</span>
            <input
              type="number"
              min={1}
              value={sets}
              onChange={(e) => setSets(Number(e.target.value) || 0)}
            />
          </label>
          {selectedExercise?.unit !== "duration" && (
            <label className="field">
              <span>Reps (per set)</span>
              <input
                type="number"
                min={1}
                value={reps}
                onChange={(e) => setReps(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </label>
          )}
          <label className="field">
            <span>{unitLabel}</span>
            <WeightInput
              value={weightOrDuration}
              onChange={setWeightOrDuration}
            />
          </label>
        </div>
        <button className="primary-btn" type="submit" disabled={!exerciseId || sets <= 0}>
          Add Exercise
        </button>
      </form>

      {addedExercises.length > 0 && (
        <div className="added-exercises">
          <h3>Exercises in this workout ({addedExercises.length})</h3>
          <ul className="exercise-list">
            {addedExercises.map((exSet, index) => {
              const ex = exercises.find((e) => e.id === exSet.exerciseId);
              const unit = ex?.unit === "duration" ? "min" : ex?.unit === "distance" ? "km" : "kg";
              return (
                <li key={index} className="exercise-item">
                  <div className="exercise-item-content">
                    <strong>{getExerciseName(exSet.exerciseId)}</strong>
                    <span>
                      {exSet.sets} sets
                      {typeof exSet.reps === "number" && ` × ${exSet.reps} reps`}
                      {typeof exSet.weightOrDuration === "number" && ` @ ${exSet.weightOrDuration} ${unit}`}
                    </span>
                  </div>
                  <div className="exercise-item-actions">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => handleEditExercise(index)}
                      aria-label="Edit exercise"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemoveExercise(index)}
                      aria-label="Remove exercise"
                    >
                      ×
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {addedExercises.length > 0 && (
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Workout Notes (optional)</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for entire workout (RPE, tempo, etc.)"
            />
          </label>
          <button className="primary-btn" type="submit">
            Save Workout ({addedExercises.length} {addedExercises.length === 1 ? "exercise" : "exercises"})
          </button>
        </form>
      )}

      {showCopyModal && (
        <CopyWorkoutModal
          exercises={exercises}
          workouts={workouts}
          onCopy={handleCopyWorkout}
          onClose={() => setShowCopyModal(false)}
        />
      )}
    </div>
  );
}
