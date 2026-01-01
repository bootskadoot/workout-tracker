import type { DateRange } from "../utils/filters";

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const RANGES: { value: DateRange; label: string }[] = [
  { value: "7days", label: "7 days" },
  { value: "30days", label: "30 days" },
  { value: "3months", label: "3 months" },
  { value: "all", label: "All time" },
];

export function DateRangeFilter({ value, onChange }: Props) {
  return (
    <div className="filter-group">
      <label className="filter-label">Time Range</label>
      <div className="filter-buttons">
        {RANGES.map((range) => (
          <button
            key={range.value}
            type="button"
            className={`filter-btn ${value === range.value ? "active" : ""}`}
            onClick={() => onChange(range.value)}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}
