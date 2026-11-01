import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { EntryType, TimelineEntry } from "../api";
import EntryCard from "./EntryCard";
import { Empty } from "./Status";

const filters: ("all" | EntryType)[] = ["all", "prescription", "bill", "lab_report"];

/** Filter buttons + entries grouped under year headings, newest first. Used by the patient and the doctor. */
export default function TimelineView({ entries, emptyText }: { entries: TimelineEntry[]; emptyText: string }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | EntryType>("all");
  const shown = entries.filter((e) => filter === "all" || e.type === filter).sort((a, b) => b.date.localeCompare(a.date));
  const years = [...new Set(shown.map((e) => e.date.slice(0, 4)))];
  return (
    <div>
      <div role="group" aria-label="Filter" className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}
            className={`btn ${filter === f ? "bg-brand text-white" : "border-2 border-brand text-brand"}`}>
            {f === "all" ? t("timeline.all") : t(`entry.${f}`)}
          </button>
        ))}
      </div>
      {shown.length === 0 && <Empty text={emptyText} />}
      {years.map((y) => (
        <section key={y} aria-label={y} className="mb-4">
          <h3 className="mb-2 text-xl font-bold text-brand">{y}</h3>
          <ul className="space-y-3 border-l-4 border-brand-soft pl-3">
            {shown.filter((e) => e.date.startsWith(y)).map((e) => <EntryCard key={e.id} e={e} />)}
          </ul>
        </section>
      ))}
    </div>
  );
}
