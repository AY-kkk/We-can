import { TRACKS, type Track } from "@/theme/tokens";

export function TrackSwitcher({
  value,
  onChange,
}: {
  value: Track;
  onChange: (t: Track) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TRACKS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-full px-3.5 py-1.5 text-sm transition ${
            value === t.key
              ? "bg-brand-600 text-white"
              : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
