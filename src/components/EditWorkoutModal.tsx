import { useState } from "react";
import type { Exercise, ExerciseSet, WorkoutEntry } from "../types";

interface Props {
  workout: WorkoutEntry;
  exercises: Exercise[];
  onSave: (updated: WorkoutEntry) => void;
  onClose: () => void;
}

export function EditWorkoutModal({ workout, exercises, onSave, onClose }: Props) {
  const [date, setDate] = useState(workout.date);
  const [editedExercises, setEditedExercises] = useState<ExerciseSet[]>([...workout.exercises]);
  const [notes, setNotes] = useState(workout.notes || "");

  // For adding new exercise
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExerciseId, setNewExerciseId] = useState(exercises[0]?.id ?? "");
  const [newSets, setNewSets] = useState(3);
  const [newReps, setNewReps] = useState<number | "">("");
  const [newWeight, setNewWeight] = useState<number | "">("");

  const getExerciseName = (id: string) =>
    exercises.find((e) => e.id === id)?.name ?? "Unknown exercise";

  const getUnit = (exerciseId: string) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    return ex?.unit === "duration" ? "min" : ex?.unit === "distance" ? "km" : "kg";
  };

  const handleExerciseChange = (index: number, field: keyof ExerciseSet, value: any) => {
    const updated = [...editedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setEditedExercises(updated);
  };

  const handleRemoveExercise = (index: number) => {
    setEditedExercises(editedExercises.filter((_, i) => i !== index));
  };

  const handleAddExercise = () => {
    if (!newExerciseId) return;

    const newExercise: ExerciseSet = {
      exerciseId: newExerciseId,
      sets: newSets,
      reps: newReps === "" ? undefined : Number(newReps),
      weightOrDuration: newWeight === "" ? undefined : Number(newWeight)
    };

    setEditedExercises([...editedExercises, newExercise]);
    setShowAddForm(false);
    setNewExerciseId(exercises[0]?.id ?? "");
    setNewSets(3);
    setNewReps("");
    setNewWeight("");
  };

  const handleSave = () => {
    if (editedExercises.length === 0) return;

    const updated: WorkoutEntry = {
      ...workout,
      date,
      exercises: editedExercises,
      notes: notes || undefined
    };

    onSave(updated);
  };

  // Group exercises by category for the dropdown
  const groupedExercises = exercises.reduce((acc, ex) => {
    const cat = ex.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ex);
    return acc;
  }, {} as Record<string, typeof exercises>);

  const sortedCategories = Object.keys(groupedExercises).sort();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-workout-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Workout</h2>

        <label className="field">
          <span>Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <div className="edit-exercises-section">
          <h3>Exercises</h3>

          {editedExercises.length === 0 ? (
            <p className="muted">No exercises. Add one below.</p>
          ) : (
            <ul className="edit-exercise-list">
              {editedExercises.map((exSet, index) => {
                const exercise = exercises.find((e) => e.id === exSet.exerciseId);
                const unit = getUnit(exSet.exerciseId);
                const showReps = exercise?.unit !== "duration";

                return (
                  <li key={index} className="edit-exercise-item">
                    <div className="edit-exercise-row">
                      <select
                        value={exSet.exerciseId}
                        onChange={(e) => handleExerciseChange(index, "exerciseId", e.target.value)}
                        className="edit-exercise-select"
                      >
                        {sortedCategories.map((category) => (
                          <optgroup key={category} label={category}>
                            {groupedExercises[category]
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((ex) => (
                                <option key={ex.id} value={ex.id}>
                                  {ex.name}
                                </option>
                              ))}
                          </optgroup>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleRemoveExercise(index)}
                        aria-label="Remove exercise"
                      >
                        ×
                      </button>
                    </div>
                    <div className="edit-exercise-fields">
                      <label className="field-inline">
                        <span>Sets</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          value={exSet.sets}
                          onChange={(e) => handleExerciseChange(index, "sets", Number(e.target.value) || 1)}
                        />
                      </label>
                      {showReps && (
                        <label className="field-inline">
                          <span>Reps</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={exSet.reps ?? ""}
                            onChange={(e) => handleExerciseChange(index, "reps", e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                        </label>
                      )}
                      <label className="field-inline">
                        <span>{unit === "min" ? "Duration" : unit === "km" ? "Distance" : "Weight"} ({unit})</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          step={0.5}
                          min={0}
                          value={exSet.weightOrDuration ?? ""}
                          onChange={(e) => handleExerciseChange(index, "weightOrDuration", e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {showAddForm ? (
            <div className="add-exercise-inline">
              <select
                value={newExerciseId}
                onChange={(e) => setNewExerciseId(e.target.value)}
                className="edit-exercise-select"
              >
                {sortedCategories.map((category) => (
                  <optgroup key={category} label={category}>
                    {groupedExercises[category]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <div className="add-exercise-fields">
                <label className="field-inline">
                  <span>Sets</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={newSets}
                    onChange={(e) => setNewSets(Number(e.target.value) || 1)}
                  />
                </label>
                <label className="field-inline">
                  <span>Reps</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </label>
                <label className="field-inline">
                  <span>Weight (kg)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step={0.5}
                    min={0}
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="add-exercise-actions">
                <button type="button" className="primary-btn" onClick={handleAddExercise}>
                  Add
                </button>
                <button type="button" className="ghost-btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowAddForm(true)}
              style={{ marginTop: "0.5rem" }}
            >
              + Add Exercise
            </button>
          )}
        </div>

        <label className="field" style={{ marginTop: "1rem" }}>
          <span>Notes (optional)</span>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for entire workout"
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="ghost-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleSave}
            disabled={editedExercises.length === 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
