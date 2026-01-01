import { useState } from "react";
import type { Exercise } from "../types";

interface Props {
  exercises: Exercise[];
  setExercises: (next: Exercise[]) => void;
}

export function SettingsPage({ exercises, setExercises }: Props) {
  const [jsonText, setJsonText] = useState(JSON.stringify(exercises, null, 2));
  const [error, setError] = useState<string | null>(null);

  function handleImport() {
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
        // If you paste objects like { name, muscle, type }
        if (e && e.name && e.muscle) {
          return {
            id: e.id || `${slug(e.name)}-${idx}`,
            name: e.name,
            category: e.muscle,
            unit: "weight_reps"
          };
        }

        // Already in internal shape with id/name/unit
        if (e && e.id && e.name && e.unit) {
          return e as Exercise;
        }

        throw new Error(
          "Each exercise must have at least name and muscle (or existing id/name/unit)."
        );
      });

      setExercises(mapped);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  function handleAddExercise() {
    const id = `ex-${Date.now().toString(36)}`;
    const next: Exercise = {
      id,
      name: "New exercise",
      category: "Custom",
      unit: "weight_reps"
    };
    const updated = [...exercises, next];
    setExercises(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  }

  function handleResetJson() {
    setJsonText(JSON.stringify(exercises, null, 2));
    setError(null);
  }

  return (
    <div className="stack">
      <section className="card">
        <h2 className="card-title">Exercise library</h2>
        <p className="muted">
          Paste your exercise list in JSON format. This is stored locally in your browser
          only.
        </p>
        <textarea
          className="json-textarea"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={14}
          spellCheck={false}
        />
        {error && <p className="error-text">{error}</p>}
        <div className="button-row">
          <button className="primary-btn" type="button" onClick={handleImport}>
            Save JSON
          </button>
          <button className="secondary-btn" type="button" onClick={handleResetJson}>
            Revert
          </button>
          <button className="ghost-btn" type="button" onClick={handleAddExercise}>
            Add exercise
          </button>
        </div>
      </section>

      <section className="card">
        <h3 className="card-subtitle">Current exercises</h3>
        <ul className="exercise-list">
          {exercises.map((ex) => (
            <li key={ex.id} className="exercise-item">
              <div>
                <div className="exercise-name">{ex.name}</div>
                <div className="exercise-meta">
                  <span>{ex.category}</span>
                  <span>{ex.unit}</span>
                </div>
              </div>
            </li>
          ))}
          {!exercises.length && <p className="muted">No exercises defined.</p>}
        </ul>
      </section>
    </div>
  );
}



