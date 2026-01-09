import { useState } from "react";
import type { Exercise } from "../types";
import { isSupabaseConfigured } from "../supabaseClient";

interface Props {
  exercises: Exercise[];
  setExercises: (next: Exercise[]) => void;
  onManualSync?: () => Promise<void>;
  syncing?: boolean;
  lastSync?: Date | null;
}

const CATEGORIES = [
  "Arms",
  "Back",
  "Calves",
  "Chest",
  "Glutes",
  "Hamstrings",
  "Quads",
  "Shoulders",
  "Core",
  "Cardio",
  "Custom"
];

const UNIT_OPTIONS: { value: Exercise["unit"]; label: string }[] = [
  { value: "weight_reps", label: "Weight & Reps" },
  { value: "bodyweight_reps", label: "Bodyweight & Reps" },
  { value: "duration", label: "Duration (minutes)" },
  { value: "distance", label: "Distance" }
];

export function SettingsPage({ exercises, setExercises, onManualSync, syncing, lastSync }: Props) {
  // New exercise form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Custom");
  const [newUnit, setNewUnit] = useState<Exercise["unit"]>("weight_reps");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editUnit, setEditUnit] = useState<Exercise["unit"]>("weight_reps");

  // Advanced JSON section
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    const slug = (name: string) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const id = `${slug(newName)}-${Date.now().toString(36)}`;
    const newExercise: Exercise = {
      id,
      name: newName.trim(),
      category: newCategory,
      unit: newUnit
    };

    setExercises([...exercises, newExercise]);
    setNewName("");
    setNewCategory("Custom");
    setNewUnit("weight_reps");
  }

  function handleStartEdit(exercise: Exercise) {
    setEditingId(exercise.id);
    setEditName(exercise.name);
    setEditCategory(exercise.category);
    setEditUnit(exercise.unit);
  }

  function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;

    const updated = exercises.map((ex) =>
      ex.id === editingId
        ? { ...ex, name: editName.trim(), category: editCategory, unit: editUnit }
        : ex
    );
    setExercises(updated);
    setEditingId(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this exercise?")) {
      setExercises(exercises.filter((ex) => ex.id !== id));
    }
  }

  function handleImportJson() {
    try {
      const parsed = JSON.parse(jsonText) as any[];
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array");
      }

      const slug = (name: string) =>
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const mapped: Exercise[] = parsed.map((e, idx) => {
        if (e && e.name && e.muscle) {
          return {
            id: e.id || `${slug(e.name)}-${idx}`,
            name: e.name,
            category: e.muscle,
            unit: "weight_reps"
          };
        }
        if (e && e.id && e.name && e.unit) {
          return e as Exercise;
        }
        throw new Error(
          "Each exercise must have at least name and muscle (or existing id/name/unit)."
        );
      });

      setExercises(mapped);
      setJsonError(null);
      setJsonText("");
      setShowAdvanced(false);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  // Group exercises by category for display
  const groupedExercises = exercises.reduce((acc, ex) => {
    const cat = ex.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const sortedCategories = Object.keys(groupedExercises).sort();

  return (
    <div className="stack">
      {isSupabaseConfigured() && (
        <section className="card">
          <h2 className="card-title">Cloud Sync</h2>
          <p className="muted">
            Your workouts are automatically synced to the cloud. You can also manually sync now.
          </p>
          <div className="sync-info">
            {lastSync ? (
              <p className="sync-status-text">
                <span className="sync-icon">☁</span>
                Last synced: {lastSync.toLocaleString()}
              </p>
            ) : (
              <p className="sync-status-text">
                <span className="sync-icon">☁</span>
                Not yet synced
              </p>
            )}
          </div>
          <button
            className="primary-btn"
            onClick={onManualSync}
            disabled={syncing}
            type="button"
          >
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        </section>
      )}

      <section className="card">
        <h2 className="card-title">Add New Exercise</h2>
        <form onSubmit={handleAddExercise} className="add-exercise-form">
          <div className="form-row">
            <label className="field" style={{ flex: 2 }}>
              <span>Exercise Name</span>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Dumbbell Curl"
              />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Category</span>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Type</span>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value as Exercise["unit"])}
              >
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="primary-btn" type="submit" disabled={!newName.trim()}>
            Add Exercise
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="card-title">Exercise Library ({exercises.length})</h2>

        {sortedCategories.map((category) => (
          <div key={category} className="exercise-category-group">
            <h3 className="category-header">{category}</h3>
            <ul className="exercise-list">
              {groupedExercises[category]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((ex) => (
                  <li key={ex.id} className="exercise-item">
                    {editingId === ex.id ? (
                      <div className="exercise-edit-form">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="edit-name-input"
                        />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="edit-category-select"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <select
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value as Exercise["unit"])}
                          className="edit-unit-select"
                        >
                          {UNIT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <div className="edit-actions">
                          <button
                            type="button"
                            className="save-edit-btn"
                            onClick={handleSaveEdit}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="cancel-edit-btn"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="exercise-info">
                          <div className="exercise-name">{ex.name}</div>
                          <div className="exercise-meta">
                            <span>{UNIT_OPTIONS.find((o) => o.value === ex.unit)?.label || ex.unit}</span>
                          </div>
                        </div>
                        <div className="exercise-actions">
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => handleStartEdit(ex)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => handleDelete(ex.id)}
                            aria-label="Delete exercise"
                          >
                            ×
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}

        {exercises.length === 0 && <p className="muted">No exercises defined.</p>}
      </section>

      <section className="card">
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            setShowAdvanced(!showAdvanced);
            if (!showAdvanced) {
              setJsonText(JSON.stringify(exercises, null, 2));
            }
          }}
          style={{ width: "100%" }}
        >
          {showAdvanced ? "Hide Advanced Options" : "Advanced: Import/Export JSON"}
        </button>

        {showAdvanced && (
          <div style={{ marginTop: "1rem" }}>
            <p className="muted">
              Paste exercise list in JSON format or copy the current library.
            </p>
            <textarea
              className="json-textarea"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={10}
              spellCheck={false}
            />
            {jsonError && <p className="error-text">{jsonError}</p>}
            <div className="button-row">
              <button className="primary-btn" type="button" onClick={handleImportJson}>
                Import JSON
              </button>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => setJsonText(JSON.stringify(exercises, null, 2))}
              >
                Reset to Current
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
