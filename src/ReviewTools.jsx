import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Pencil,
  Search,
  Smile,
} from "lucide-react";
import Modal from "./Modal";
import { dateKey, fromKey, feelingsFor, daysFrom } from "./store";
const reviewFields = [
  [
    "wins",
    "What worked this week?",
    "Which decisions, habits, or setups are worth repeating?",
  ],
  [
    "improve",
    "What will you improve?",
    "What pattern did you notice? What could you do differently?",
  ],
  [
    "nextWeek",
    "Your focus for next week",
    "Choose one specific, realistic action for your next sessions.",
  ],
];
const amount = (n) =>
  `${n < 0 ? "−" : "+"}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const weekRange = (week) =>
  `${week.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${daysFrom(week, 7)[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
export function SearchJournal({ entries, onOpen, onClose }) {
  const [query, setQuery] = useState(""),
    [feeling, setFeeling] = useState(""),
    [outcome, setOutcome] = useState("all");
  const input = useRef(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => input.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);
  const all = Object.values(entries).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const feelings = [...new Set(all.flatMap(feelingsFor))].sort();
  const results = all.filter((e) => {
    const text = [
      e.date,
      fromKey(e.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      e.plan,
      e.execution,
      e.lesson,
      e.tomorrow,
      ...feelingsFor(e),
      ...(e.tags || []),
      ...(e.mistakes || []),
    ]
      .join(" ")
      .toLowerCase();
    return (
      query
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .every((word) => text.includes(word)) &&
      (!feeling || feelingsFor(e).includes(feeling)) &&
      (outcome === "all" ||
        (outcome === "profit" && Number(e.pnl) > 0) ||
        (outcome === "loss" && Number(e.pnl) < 0) ||
        (outcome === "flat" && Number(e.pnl) === 0))
    );
  });
  return (
    <Modal title="Search your journal" onClose={onClose}>
      <p>Find a past lesson by date, notes, setup, mistake, or feeling.</p>
      <label className="search-input">
        <Search size={20} />
        <input
          ref={input}
          aria-label="Search entries"
          placeholder="Try ‘pullback’, ‘patient’, or a date…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="search-filters">
        <label>
          Headspace
          <select
            aria-label="Filter by feeling"
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
          >
            <option value="">All feelings</option>
            {feelings.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          Daily result
          <select
            aria-label="Filter by result"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          >
            <option value="all">All results</option>
            <option value="profit">Profitable</option>
            <option value="loss">Losing</option>
            <option value="flat">Breakeven</option>
          </select>
        </label>
      </div>
      <p className="search-count" role="status">
        {results.length} {results.length === 1 ? "entry" : "entries"} found
      </p>
      <div className="search-results">
        {results.map((e) => (
          <button
            className="search-result"
            key={e.date}
            onClick={() => onOpen(e.date)}
          >
            <div>
              <strong>
                {fromKey(e.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </strong>
              <span>{feelingsFor(e).join(" · ") || "Session journal"}</span>
              <p>
                {e.lesson ||
                  e.execution ||
                  e.plan ||
                  "Open this session to review your notes."}
              </p>
            </div>
            <span className={Number(e.pnl) < 0 ? "negative" : "positive"}>
              {amount(Number(e.pnl))}
              <ArrowRight size={16} />
            </span>
          </button>
        ))}
        {!results.length && (
          <div className="search-empty">
            <BookOpen size={26} />
            <h3>No entries match yet</h3>
            <p>Try a different phrase or clear your filters.</p>
            <button
              className="secondary"
              onClick={() => {
                setQuery("");
                setFeeling("");
                setOutcome("all");
              }}
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
export function FeelingsInsights({ entries }) {
  const groups = Object.create(null);
  entries.forEach((entry) =>
    feelingsFor(entry).forEach((feeling) => {
      groups[feeling] ||= { count: 0, pnl: 0 };
      groups[feeling].count++;
      groups[feeling].pnl += Number(entry.pnl);
    }),
  );
  const rows = Object.entries(groups).sort(
    (a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]),
  );
  return (
    <section className="insights-panel feelings-panel">
      <div className="insights-heading">
        <div>
          <span className="eyebrow">NOTICE YOUR HEADSPACE</span>
          <h2>How your week felt</h2>
        </div>
        <Smile size={24} />
      </div>
      {rows.length ? (
        <>
          <div className="feelings-table-header">
            <span>Feeling</span>
            <span>Sessions</span>
            <span>Avg. daily P&L</span>
          </div>
          <div>
            {rows.map(([feeling, stats]) => (
              <div className="feelings-row" key={feeling}>
                <span>{feeling}</span>
                <span>{stats.count}</span>
                <strong className={stats.pnl < 0 ? "negative" : "positive"}>
                  {amount(stats.pnl / stats.count)}
                </strong>
              </div>
            ))}
          </div>
          <p className="insight-footnote">
            A session can include several feelings and appear in more than one
            row. These small, self-reported samples describe your week; they
            don’t show cause or predict returns.
          </p>
        </>
      ) : (
        <p className="insight-footnote">
          Select feelings in your daily entries to see your weekly headspace
          here.
        </p>
      )}
    </section>
  );
}
export function WeeklyReview({ week, review, onEdit }) {
  return (
    <section className="insights-panel weekly-reflection">
      <div className="insights-heading">
        <div>
          <span className="eyebrow">CLOSE THE WEEK WITH INTENTION</span>
          <h2>Your weekly reflection</h2>
        </div>
        <button className="secondary" onClick={onEdit}>
          <Pencil size={16} />
          {review ? "Edit weekly reflection" : "Write weekly reflection"}
        </button>
      </div>
      <p className="week-range-label">{weekRange(week)}</p>
      {review ? (
        <div className="review-notes">
          {reviewFields.map(([field, title]) => (
            <div key={field}>
              <h3>{title}</h3>
              <p>{review[field] || "No notes added yet."}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="insight-footnote">
          Capture what worked, what you’ll change, and one focus for next week.
          Your review saves with your journal and is included in backups.
        </p>
      )}
    </section>
  );
}
export function WeeklyReviewEditor({ weekKey, review, onClose, onSave }) {
  const [draft, setDraft] = useState(
      review || { wins: "", improve: "", nextWeek: "" },
    ),
    [dirty, setDirty] = useState(false),
    [discard, setDiscard] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const close = () => {
    if (busy) return;
    if (dirty) setDiscard(true);
    else onClose();
  };
  return (
    <Modal title="Weekly reflection" onClose={close} wide>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await onSave(draft);
          } catch {
            setError(
              "Could not save your weekly review. Please try again; your notes are still here.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="editor-intro">
          <span className="eyebrow">ONE WEEK. A LITTLE WISER.</span>
          <h2>{weekRange(fromKey(weekKey))}</h2>
          <p>Review the process, then choose one thing to carry forward.</p>
        </div>
        <div className="editor-section">
          {reviewFields.map(([field, title, placeholder]) => (
            <label className="reflection-label" key={field}>
              {title}
              <textarea
                rows={5}
                value={draft[field]}
                placeholder={placeholder}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, [field]: e.target.value }));
                  setDirty(true);
                }}
              />
            </label>
          ))}
        </div>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <div className="editor-save">
          <span>Saved privately with this week’s journal</span>
          <button className="primary" type="submit" disabled={busy}>
            <Check size={18} />
            {busy ? "Saving…" : "Save weekly reflection"}
          </button>
        </div>
      </form>
      {discard && (
        <div className="inline-confirm" role="alert">
          <strong>Leave without saving?</strong>
          <p>Your unsaved weekly review will be lost.</p>
          <div>
            <button className="secondary" onClick={() => setDiscard(false)}>
              Keep writing
            </button>
            <button className="danger" onClick={onClose}>
              Discard changes
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
