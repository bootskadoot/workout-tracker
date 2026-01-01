import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getExerciseChartData } from "../utils/chartData";
import type { WorkoutEntry } from "../types";

interface Props {
  exerciseId: string;
  exerciseName: string;
  workouts: WorkoutEntry[];
}

export function ExerciseChart({ exerciseId, exerciseName, workouts }: Props) {
  const data = getExerciseChartData(exerciseId, workouts);

  if (data.length === 0) {
    return <div className="chart-empty">No data available for {exerciseName}</div>;
  }

  return (
    <div className="exercise-chart-container">
      <h3 className="chart-title">{exerciseName}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis
            dataKey="displayDate"
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            label={{
              value: "Weight (kg)",
              angle: -90,
              position: "insideLeft",
              fill: "#9ca3af",
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#020617",
              border: "1px solid rgba(148, 163, 184, 0.4)",
              borderRadius: "0.5rem",
              color: "#e5e7eb",
            }}
            formatter={(value: number, name: string) => {
              if (name === "weight") return [`${value} kg`, "Weight"];
              return [value, name];
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: "#22c55e", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
