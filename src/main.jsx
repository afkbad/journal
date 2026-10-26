import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/latin-800.css";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  ImagePlus,
  Leaf,
  Menu,
  Plus,
  Smile,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import {
  dateKey,
  fromKey,
  monday,
  daysFrom,
  readJournal,
  writeJournal,
  makeDemo,
} from "./store";
import "./styles.css";

const money = (n) =>
  `${n < 0 ? "−" : "+"}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const monthLabel = (d) =>
  d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
const longDate = (d) =>
  d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
const rules = [
  "Respected my risk limit",
  "Waited for my setup",
  "Followed my exit plan",
  "Avoided revenge trading",
];
const setups = [
  "Breakout",
  "Pullback",
  "Reversal",
  "Opening range",
  "Trend continuation",
];
const mistakes = [
  "Early entry",
  "Overtrading",
  "Moved stop",
  "Oversized",
  "Chased price",
];
const blank = (key) => ({
  tags: [],
  mistakes: [],
  rules: [],
  date: key,
  pnl: "",
  trades: "",
  wins: "",
  mood: "",
  plan: "",
  execution: "",
  lesson: "",
  tomorrow: "",
  images: [],
});
const moods = ["Focused", "Confident", "Patient", "Anxious", "Frustrated"];
function totals(entries) {
  return {
    pnl: entries.reduce((s, e) => s + Number(e.pnl), 0),
    trades: entries.reduce((s, e) => s + Number(e.trades), 0),
    wins: entries.reduce((s, e) => s + Number(e.wins), 0),
  };
}
function App() {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [view, setView] = useState("calendar");
  const [month, setMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [week, setWeek] = useState(monday(new Date())),
    [editing, setEditing] = useState(null),
    [help, setHelp] = useState(false),
    [reset, setReset] = useState(false),
    [mobile, setMobile] = useState(false);
  const addRef = useRef(null),
    importRef = useRef(null);
  const [importCandidate, setImportCandidate] = useState(null),
    [notice, setNotice] = useState("");
  useEffect(() => {
    readJournal()
      .then(async (saved) => {
        if (saved) setData(saved);
        else {
          const initial = makeDemo();
          await writeJournal(initial);
          setData(initial);
          setWeek(monday(fromKey(Object.keys(initial.entries)[0])));
        }
      })
      .catch(() =>
        setError(
          "Browser storage is unavailable. Allow site storage, then reload to use your journal.",
        ),
      );
  }, []);
  const persist = async (next) => {
    await writeJournal(next);
    setData(next);
  };
  const switchView = (v) => {
    setView(v);
    setMobile(false);
  };
  const navigate = (amount) =>
    view === "calendar"
      ? setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1))
      : setWeek(
          new Date(
            week.getFullYear(),
            week.getMonth(),
            week.getDate() + amount * 7,
          ),
        );
  const goToday = () => {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setWeek(monday(now));
  };
  if (!data)
    return (
      <div className="loading">
        <div className="brand-mark">
          <Activity size={23} />
        </div>
        <h2>Daymark</h2>
        <p role="status">{error || "Opening your journal…"}</p>
      </div>
    );
  const monthEntries = Object.values(data.entries).filter((e) =>
    e.date.startsWith(dateKey(month).slice(0, 7)),
  );
  const weekDays = daysFrom(week, 7),
    weekEntries = weekDays.map((d) => data.entries[dateKey(d)]).filter(Boolean);
  const visible = view === "calendar" ? monthEntries : weekEntries,
    stats = totals(visible);
  const wins = visible.filter((e) => Number(e.pnl) > 0).length,
    losses = visible.filter((e) => Number(e.pnl) < 0).length;
  const start = monday(month),
    count =
      Math.ceil(
        (((month.getDay() + 6) % 7) +
          new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) /
          7,
      ) * 7;
  const calendarDays = daysFrom(start, count);
  const edit = (key) => setEditing({ ...blank(key), ...data.entries[key] });
  const importData = async (file) => {
    if (!file) return;
    try {
      const next = JSON.parse(await file.text());
      if (
        !next.entries ||
        typeof next.entries !== "object" ||
        Array.isArray(next.entries)
      )
        throw new Error();
      for (const [key, e] of Object.entries(next.entries)) {
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(key) ||
          dateKey(fromKey(key)) !== key ||
          !e ||
          e.date !== key ||
          !Array.isArray(e.images) ||
          e.images.length > 10
        )
          throw new Error();
        for (const field of ["plan", "execution", "lesson", "tomorrow", "mood"])
          if (typeof e[field] !== "string") throw new Error();
        for (const field of ["pnl", "trades", "wins"])
          if (
            !["number", "string"].includes(typeof e[field]) ||
            !Number.isFinite(Number(e[field]))
          )
            throw new Error();
        if (
          Number(e.trades) < 0 ||
          Number(e.wins) < 0 ||
          !Number.isInteger(Number(e.trades)) ||
          !Number.isInteger(Number(e.wins)) ||
          Number(e.wins) > Number(e.trades)
        )
          throw new Error();
        for (const image of e.images)
          if (
            typeof image.id !== "string" ||
            typeof image.name !== "string" ||
            typeof image.url !== "string" ||
            !/^data:image\/(png|jpeg|webp|gif);base64,/.test(image.url)
          )
            throw new Error();
        for (const field of ["tags", "mistakes", "rules"])
          if (
            e[field] !== undefined &&
            (!Array.isArray(e[field]) ||
              e[field].some((v) => typeof v !== "string"))
          )
            throw new Error();
      }
      setImportCandidate(next);
    } catch {
      setNotice(
        "That file is not a valid Daymark backup. Your journal has not changed.",
      );
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };
  const exportData = () => {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { ...data, exportedAt: new Date().toISOString() },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `daymark-${dateKey(new Date())}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="app-shell">
      {mobile && (
        <div className="sidebar-scrim" onClick={() => setMobile(false)} />
      )}
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            switchView("calendar");
          }}
        >
          <span className="brand-mark">
            <Activity size={25} strokeWidth={2} />
          </span>
          daymark<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <div className="avatar">Y</div>
          <div>
            <strong>Your workspace</strong>
            <span>Personal trading journal</span>
          </div>
          <span className="personal-dot" />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          <button
            className={view === "calendar" ? "active" : ""}
            onClick={() => switchView("calendar")}
          >
            <CalendarDays size={19} />
            Journal<span className="nav-key">J</span>
          </button>
          <button
            className={view === "week" ? "active" : ""}
            onClick={() => switchView("week")}
          >
            <BookOpen size={19} />
            Weekly review
          </button>
        </nav>
        <div className="sidebar-note">
          <span className="small-leaf">
            <Leaf size={19} />
          </span>
          <h3>Progress, one day at a time.</h3>
          <p>Your edge grows when you take time to reflect.</p>
          <div className="tiny-line" />
        </div>
        <div className="sidebar-bottom">
          <button onClick={exportData}>
            <Download size={18} />
            Export journal
          </button>
          <button onClick={() => importRef.current?.click()}>
            <ArrowDownLeft size={18} />
            Restore backup
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => importData(e.target.files[0])}
          />
          <button onClick={() => setHelp(true)}>
            <CircleHelp size={18} />A little guidance
            <ArrowUpRight size={14} />
          </button>
          <div className="local-info">
            <span />
            Saved on this device
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {view === "calendar" ? "Trading journal" : "Weekly review"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="private-label">
              <span />
              Your personal space
            </span>
            <span className="profile">Y</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">REFLECT. REFINE. REPEAT.</div>
              <h1>
                {view === "calendar"
                  ? "Your trading journal"
                  : "See the bigger picture"}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {view === "calendar"
                  ? "Every session has a lesson. Make space to find yours."
                  : "Step back, connect the dots, and carry the lessons forward."}
              </p>
            </div>
            <button
              ref={addRef}
              className="primary"
              onClick={() => edit(dateKey(new Date()))}
            >
              <Plus size={18} />
              New entry
            </button>
          </div>
          {data.demo && (
            <div className="demo-banner">
              <span>
                <span className="demo-tag">EXAMPLE JOURNAL</span> A little
                inspiration for your own trading journey.
              </span>
              <button onClick={() => setReset(true)}>
                Start your own
                <ArrowRight size={15} />
              </button>
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button
                aria-label="Dismiss message"
                onClick={() => setNotice("")}
              >
                <X size={15} />
              </button>
            </div>
          )}
          <section className="stats-grid" aria-label="Journal statistics">
            <Stat
              label="Net P&L"
              value={money(stats.pnl)}
              icon={<TrendingUp size={18} />}
              positive={stats.pnl >= 0}
              caption={view === "calendar" ? "This month" : "This week"}
              trend
              series={visible
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((e) => Number(e.pnl))}
            />
            <Stat
              label="Win rate"
              value={
                stats.trades
                  ? `${Math.round((stats.wins / stats.trades) * 100)}%`
                  : "—"
              }
              icon={<Target size={18} />}
              caption={
                stats.trades
                  ? `${stats.wins} winning trades of ${stats.trades}`
                  : "Your next session starts here"
              }
              progress={stats.trades ? (stats.wins / stats.trades) * 100 : 0}
            />
            <Stat
              label="Trades taken"
              value={String(stats.trades).padStart(2, "0")}
              icon={<ChartNoAxesColumnIncreasing size={18} />}
              caption={`${wins} green ${wins === 1 ? "day" : "days"} · ${losses} red ${losses === 1 ? "day" : "days"}`}
            />
            <Stat
              label="Days journaled"
              value={String(visible.length).padStart(2, "0")}
              icon={<BookOpen size={18} />}
              caption="Small reflections. Lasting growth."
              dots={visible.length}
            />
          </section>
          <div className="content-grid">
            <section className="journal-panel">
              <div className="calendar-toolbar">
                <div className="period-title">
                  <h2>
                    {view === "calendar"
                      ? monthLabel(month)
                      : `${week.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                  </h2>
                  <div className="period-arrows">
                    <button
                      aria-label={
                        view === "calendar" ? "Previous month" : "Previous week"
                      }
                      onClick={() => navigate(-1)}
                    >
                      <ChevronLeft size={17} />
                    </button>
                    <button
                      aria-label={
                        view === "calendar" ? "Next month" : "Next week"
                      }
                      onClick={() => navigate(1)}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
                <div className="calendar-actions">
                  <button className="today-button" onClick={goToday}>
                    Today
                  </button>
                  <div className="view-switch">
                    <button
                      className={view === "calendar" ? "selected" : ""}
                      onClick={() => setView("calendar")}
                    >
                      Month
                    </button>
                    <button
                      className={view === "week" ? "selected" : ""}
                      onClick={() => setView("week")}
                    >
                      Week
                    </button>
                  </div>
                </div>
              </div>
              {view === "calendar" ? (
                <>
                  <div className="weekday-row">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                      (d) => (
                        <span key={d}>{d}</span>
                      ),
                    )}
                  </div>
                  <div className="calendar-grid">
                    {calendarDays.map((d) => {
                      const key = dateKey(d),
                        entry = data.entries[key],
                        isToday = key === dateKey(new Date()),
                        outside = d.getMonth() !== month.getMonth();
                      return (
                        <button
                          key={key}
                          className={`day-cell ${outside ? "outside" : ""} ${entry ? "has-entry" : ""} ${entry ? (Number(entry.pnl) > 0 ? "green-day" : Number(entry.pnl) < 0 ? "red-day" : "neutral-day") : ""} ${isToday ? "today-cell" : ""}`}
                          aria-label={`${longDate(d)}${entry ? `, ${money(Number(entry.pnl))}, ${entry.trades || 0} trades` : ", add journal entry"}`}
                          onClick={() => edit(key)}
                        >
                          <div className="day-top">
                            <span className={isToday ? "today-number" : ""}>
                              {d.getDate()}
                            </span>
                            {entry && <BookOpen size={12} />}
                          </div>
                          {entry ? (
                            <div className="day-content">
                              <strong>{money(Number(entry.pnl))}</strong>
                              <span>
                                {entry.trades || 0}{" "}
                                {Number(entry.trades) === 1
                                  ? "trade"
                                  : "trades"}
                              </span>
                              <div className="day-mood">
                                <span />
                                {entry.mood || "Journaled"}
                              </div>
                            </div>
                          ) : (
                            <span className="day-add">
                              <Plus size={15} />
                              <span>Add entry</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="weekly-list">
                  {weekDays.map((d) => {
                    const e = data.entries[dateKey(d)];
                    return (
                      <button
                        className="weekly-day"
                        key={dateKey(d)}
                        onClick={() => edit(dateKey(d))}
                      >
                        <div
                          className={`week-date ${dateKey(d) === dateKey(new Date()) ? "is-today" : ""}`}
                        >
                          <span>
                            {d.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </span>
                          <strong>{d.getDate()}</strong>
                        </div>
                        <div className="weekly-text">
                          <h3>
                            {e ? e.mood || "Session journal" : "A fresh page"}
                          </h3>
                          <p>
                            {e
                              ? e.lesson ||
                                e.execution ||
                                "Entry saved. Click to reflect on your session."
                              : "No entry yet. Take a moment to reflect on your day."}
                          </p>
                          {e && (
                            <span>
                              {e.trades || 0} trades
                              {e.images.length
                                ? ` · ${e.images.length} images`
                                : ""}
                            </span>
                          )}
                        </div>
                        <strong
                          className={
                            e
                              ? Number(e.pnl) < 0
                                ? "negative"
                                : "positive"
                              : "muted"
                          }
                        >
                          {e ? money(Number(e.pnl)) : "—"}
                        </strong>
                        <ChevronRight size={16} />
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="calendar-footer">
                <div className="legend">
                  <span>
                    <i className="green" />
                    Profitable day
                  </span>
                  <span>
                    <i className="red" />
                    Losing day
                  </span>
                  <span>
                    <i className="gray" />
                    No entry
                  </span>
                </div>
                <span className="footer-hint">
                  Click a day to reflect
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </section>
            <aside className="review-column">
              <section className="week-snapshot">
                <div className="card-eyebrow">
                  <span>YOUR WEEK AT A GLANCE</span>
                  <CalendarDays size={16} />
                </div>
                <h3>
                  {week.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  –{" "}
                  {weekDays[6].toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                <div
                  className={`week-profit ${totals(weekEntries).pnl < 0 ? "negative" : ""}`}
                >
                  {money(totals(weekEntries).pnl)}
                  <span>Net P&L</span>
                </div>
                <div className="mini-chart">
                  {weekDays.map((d) => {
                    const e = data.entries[dateKey(d)],
                      n = Number(e?.pnl || 0),
                      max = Math.max(
                        1,
                        ...weekEntries.map((e) => Math.abs(Number(e.pnl))),
                      );
                    return (
                      <button
                        aria-label={`Open ${longDate(d)}`}
                        key={dateKey(d)}
                        onClick={() => edit(dateKey(d))}
                      >
                        <div className="bar-track">
                          <div
                            className={`bar ${n < 0 ? "loss" : ""} ${!e ? "empty" : ""}`}
                            style={{
                              height: e
                                ? `${Math.max(10, (Math.abs(n) / max) * 65)}px`
                                : "5px",
                            }}
                          />
                        </div>
                        <span>
                          {d.toLocaleDateString("en-US", { weekday: "narrow" })}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="snapshot-bottom">
                  <span>
                    <strong>{weekEntries.length}</strong> days reflected
                  </span>
                  <span>
                    <strong>{totals(weekEntries).trades}</strong> trades
                  </span>
                </div>
                <button className="text-button" onClick={() => setView("week")}>
                  Open weekly review
                  <ArrowRight size={15} />
                </button>
              </section>
              <section className="focus-card">
                <div className="focus-icon">
                  <Leaf size={21} />
                </div>
                <span className="card-eyebrow">A MOMENT OF PERSPECTIVE</span>
                <h3>
                  Trade the plan.
                  <br />
                  Journal the process.
                </h3>
                <p>
                  The goal isn’t a perfect trading day. It’s understanding
                  yourself a little better after each one.
                </p>
                <div className="focus-divider" />
                <span>Consistency is your real edge.</span>
                <svg
                  className="plant-art"
                  viewBox="0 0 100 120"
                  aria-hidden="true"
                >
                  <path
                    d="M52 115Q42 60 78 12M48 89Q12 92 12 61Q44 56 48 89M53 68Q28 51 32 29Q60 30 59 55M64 43Q60 14 84 7Q95 30 64 43M47 104Q74 70 94 75Q91 104 47 104"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              </section>
            </aside>
          </div>
          {view === "week" && <WeeklyInsights entries={weekEntries} />}
          <footer className="page-footer">
            <span>
              <Activity size={14} />
              Built for the trader you’re becoming.
            </span>
            <span>Your process. Your progress.</span>
          </footer>
        </main>
      </div>
      {editing && (
        <EntryEditor
          key={editing.date}
          entry={editing}
          isNew={!data.entries[editing.date]}
          demo={data.demo}
          onClose={() => {
            setEditing(null);
            addRef.current?.focus();
          }}
          onSave={async (entry) => {
            await persist({
              ...data,
              entries: { ...data.entries, [entry.date]: entry },
            });
            setEditing(null);
          }}
          onDelete={async () => {
            const entries = { ...data.entries };
            delete entries[editing.date];
            await persist({ ...data, entries });
            setEditing(null);
          }}
        />
      )}
      {importCandidate && (
        <Modal
          title="Restore your journal"
          onClose={() => setImportCandidate(null)}
        >
          <p>
            This backup contains {Object.keys(importCandidate.entries).length}{" "}
            entries. They will merge with your current journal. For dates in
            both, the backup entry will replace the current entry.
          </p>
          <p className="storage-note">
            Export your current journal first if you want to keep both versions.
          </p>
          <button
            className="primary"
            onClick={async () => {
              try {
                await persist({
                  entries: { ...data.entries, ...importCandidate.entries },
                  demo: !!(data.demo && importCandidate.demo),
                });
                setImportCandidate(null);
                setNotice(
                  "Backup restored. Your entries and images are saved.",
                );
              } catch {
                setNotice(
                  "Restore failed. Your existing entries are unchanged; browser storage may be full.",
                );
                setImportCandidate(null);
              }
            }}
          >
            Restore entries
            <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {help && (
        <Modal title="Make reflection a habit" onClose={() => setHelp(false)}>
          <p>
            Choose any day on the calendar to open your journal. Record your
            results, work through the prompts, and add screenshots of your
            charts.
          </p>
          <div className="help-steps">
            <p>
              <strong>01 · Before the session</strong>Set your plan, key levels,
              and risk limits.
            </p>
            <p>
              <strong>02 · After the session</strong>Reflect on execution,
              mindset, and one lesson.
            </p>
            <p>
              <strong>03 · At the end of the week</strong>Open Weekly review to
              spot patterns across all seven days.
            </p>
          </div>
          <p className="storage-note">
            Entries and images are stored only in this browser on this device.
            Export your journal regularly for a backup. Clearing site data
            removes your journal. No cloud sync or brokerage connection is
            required.
          </p>
          <button className="primary" onClick={() => setHelp(false)}>
            Make today count
            <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {reset && (
        <Modal
          title="A fresh start, just for you"
          onClose={() => setReset(false)}
        >
          <p>
            This removes all entries in the example journal, including any
            changes you’ve made to them. Your calendar will be ready for your
            first session.
          </p>
          <p className="storage-note">
            You can export the current journal first using the sidebar.
          </p>
          <button
            className="primary"
            onClick={async () => {
              try {
                await persist({ entries: {}, demo: false });
                setReset(false);
              } catch {
                setError(
                  "Unable to clear journal. Your existing entries are safe.",
                );
              }
            }}
          >
            Start my journal
            <ArrowRight size={16} />
          </button>
          {error && <p role="alert">{error}</p>}
        </Modal>
      )}
    </div>
  );
}
function WeeklyInsights({ entries }) {
  const counts = (field) => {
    const all = {};
    entries.forEach((e) =>
      (e[field] || []).forEach((t) => {
        all[t] = (all[t] || 0) + 1;
      }),
    );
    return Object.entries(all).sort((a, b) => b[1] - a[1]);
  };
  const tagCounts = counts("tags"),
    mistakeCounts = counts("mistakes"),
    checked = entries.reduce((n, e) => n + (e.rules?.length || 0), 0),
    scored = entries.filter((e) => e.rules?.length).length;
  return (
    <section className="insights-panel">
      <div className="insights-heading">
        <div>
          <span className="eyebrow">BEYOND THE NUMBERS</span>
          <h2>Your weekly patterns</h2>
        </div>
        <span>Awareness is the first step.</span>
      </div>
      <div className="insights-grid">
        <div>
          <span className="insight-label">
            <Target size={16} />
            Plan discipline
          </span>
          <strong>
            {scored
              ? `${Math.round((checked / (scored * rules.length)) * 100)}%`
              : "—"}
          </strong>
          <p>
            {scored
              ? `${checked} of ${scored * rules.length} rules followed across ${scored} scored sessions.`
              : "Check off your trading rules in each entry to track your process."}
          </p>
        </div>
        <div>
          <span className="insight-label">
            <TrendingUp size={16} />
            Setups you traded
          </span>
          {tagCounts.length ? (
            <ul>
              {tagCounts.map(([tag, n]) => (
                <li key={tag}>
                  {tag}
                  <span>
                    {n} {n === 1 ? "day" : "days"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Tag your setups in each daily entry to see your most-used
              strategies here.
            </p>
          )}
        </div>
        <div>
          <span className="insight-label">
            <Activity size={16} />
            Patterns to work on
          </span>
          {mistakeCounts.length ? (
            <ul>
              {mistakeCounts.map(([tag, n]) => (
                <li key={tag}>
                  {tag}
                  <span>
                    {n} {n === 1 ? "day" : "days"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No mistakes tagged this week. Reflect honestly to find your next
              opportunity to improve.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
function Stat({
  label,
  value,
  icon,
  caption,
  positive,
  trend,
  progress,
  dots,
  series = [],
}) {
  let total = 0;
  const running = series.map((n) => (total += n)),
    min = Math.min(0, ...running),
    max = Math.max(1, ...running),
    points = running
      .map(
        (n, i) =>
          `${(i / (running.length - 1)) * 84 + 1},${28 - ((n - min) / (max - min)) * 26}`,
      )
      .join(" ");
  return (
    <div className="stat-card">
      <div className="stat-label">
        {label}
        <span>{icon}</span>
      </div>
      <div
        className={`stat-value ${trend ? (positive ? "positive" : "negative") : ""}`}
      >
        {value}
        {trend && series.length > 1 && (
          <svg
            width="86"
            height="30"
            viewBox="0 0 86 30"
            className="sparkline"
            aria-label="Cumulative P&L trend"
          >
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>
      <div className="stat-caption">
        {caption}
        {progress !== undefined && (
          <span className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </span>
        )}
        {dots !== undefined && (
          <span className="dot-track">
            {Array.from({ length: 7 }, (_, i) => (
              <i key={i} className={i < dots ? "filled" : ""} />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef(null),
    closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
      }
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll(
          'button, input, textarea, select, a[href], [tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className={`modal-backdrop ${wide ? "drawer-backdrop" : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={`modal ${wide ? "editor-drawer" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        tabIndex={-1}
      >
        <div className="modal-title">
          <h2>{title}</h2>
          <button
            aria-label="Close dialog"
            className="icon-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function EntryEditor({ entry, isNew, demo, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState({
      ...entry,
      tags: entry.tags || [],
      mistakes: entry.mistakes || [],
      rules: entry.rules || [],
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [confirmDelete, setConfirmDelete] = useState(false),
    [lightbox, setLightbox] = useState(null),
    [uploading, setUploading] = useState(false),
    [dirty, setDirty] = useState(false),
    [discard, setDiscard] = useState(false);
  const fileRef = useRef(null),
    change = (field, value) => {
      setDraft((d) => ({ ...d, [field]: value }));
      setDirty(true);
    };
  const close = () => {
    if (busy || uploading) return;
    if (dirty) setDiscard(true);
    else onClose();
  };
  const upload = async (files) => {
    setError("");
    setUploading(true);
    try {
      if (draft.images.length + files.length > 10)
        throw new Error("You can attach up to 10 images per day.");
      const images = await Promise.all(
        Array.from(files).map(
          (file) =>
            new Promise((resolve, reject) => {
              if (
                ![
                  "image/png",
                  "image/jpeg",
                  "image/webp",
                  "image/gif",
                ].includes(file.type)
              )
                return reject(
                  new Error("Please choose PNG, JPG, WebP, or GIF images."),
                );
              if (file.size > 10 * 1024 * 1024)
                return reject(
                  new Error("Each image must be smaller than 10 MB."),
                );
              const reader = new FileReader();
              reader.onload = () =>
                resolve({
                  id: crypto.randomUUID(),
                  name: file.name,
                  url: reader.result,
                });
              reader.onerror = () =>
                reject(
                  new Error("Could not read that image. Please try again."),
                );
              reader.readAsDataURL(file);
            }),
        ),
      );
      setDraft((d) => ({ ...d, images: [...d.images, ...images] }));
      setDirty(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const toggle = (field, value) =>
    change(
      field,
      draft[field].includes(value)
        ? draft[field].filter((v) => v !== value)
        : [...draft[field], value],
    );
  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (Number(draft.wins) > Number(draft.trades)) {
      setError("Winning trades cannot exceed total trades.");
      return;
    }
    setBusy(true);
    try {
      await onSave(draft);
    } catch {
      setError(
        "Your journal could not be saved. Browser storage may be full. Try removing an image or exporting a backup.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal wide title="Daily journal" onClose={close}>
      <form onSubmit={save}>
        <div className="editor-intro">
          <span className="eyebrow">
            {demo ? "EXAMPLE JOURNAL · " : ""}A SPACE TO REFLECT
          </span>
          <h2>
            {fromKey(draft.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            <span className="heading-dot">.</span>
          </h2>
          <p>A good session starts with intention and ends with reflection.</p>
        </div>
        <section className="editor-section">
          <h3>
            <ChartNoAxesColumnIncreasing size={18} />
            The numbers<span>01</span>
          </h3>
          <div className="input-row">
            <label>
              Net P&L ($)
              <input
                aria-label="Net P&L ($)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={draft.pnl}
                onChange={(e) => change("pnl", e.target.value)}
              />
            </label>
            <label>
              Total trades
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={draft.trades}
                onChange={(e) => change("trades", e.target.value)}
              />
            </label>
            <label>
              Winning trades
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={draft.wins}
                onChange={(e) => change("wins", e.target.value)}
              />
            </label>
          </div>
        </section>
        <section className="editor-section">
          <h3>
            <Smile size={18} />
            Your headspace<span>02</span>
          </h3>
          <p>How did you feel during the session?</p>
          <div className="mood-options">
            {moods.map((m) => (
              <button
                type="button"
                key={m}
                className={draft.mood === m ? "chosen" : ""}
                aria-pressed={draft.mood === m}
                onClick={() => change("mood", draft.mood === m ? "" : m)}
              >
                {m}
                {draft.mood === m && <Check size={13} />}
              </button>
            ))}
          </div>
        </section>
        <section className="editor-section">
          <h3>
            <Target size={18} />
            Your process<span>03</span>
          </h3>
          <label className="tag-heading">Setups traded</label>
          <div className="mood-options">
            {setups.map((tag) => (
              <button
                type="button"
                key={tag}
                aria-pressed={draft.tags.includes(tag)}
                className={draft.tags.includes(tag) ? "chosen" : ""}
                onClick={() => toggle("tags", tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <label className="tag-heading">Mistakes to learn from</label>
          <div className="mood-options mistake-tags">
            {mistakes.map((tag) => (
              <button
                type="button"
                key={tag}
                aria-pressed={draft.mistakes.includes(tag)}
                className={draft.mistakes.includes(tag) ? "chosen" : ""}
                onClick={() => toggle("mistakes", tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="rule-heading">
            <label>Did you follow your rules?</label>
            <span>
              {draft.rules.length} / {rules.length}
            </span>
          </div>
          <div className="rule-list">
            {rules.map((rule) => (
              <label key={rule}>
                <input
                  type="checkbox"
                  checked={draft.rules.includes(rule)}
                  onChange={() => toggle("rules", rule)}
                />
                <span>{rule}</span>
              </label>
            ))}
          </div>
        </section>
        <section className="editor-section">
          <h3>
            <BookOpen size={18} />
            The reflection<span>04</span>
          </h3>
          {[
            [
              "plan",
              "Pre-market plan",
              "What are your key levels, setups, and risk limits today?",
            ],
            [
              "execution",
              "Trade execution",
              "What did you trade? Did you follow your plan? What went well?",
            ],
            [
              "lesson",
              "Lessons & takeaways",
              "What could you improve? What did the market teach you?",
            ],
            [
              "tomorrow",
              "One thing for next session",
              "What will you keep doing or do differently tomorrow?",
            ],
          ].map(([field, title, placeholder]) => (
            <label className="reflection-label" key={field}>
              {title}
              <textarea
                rows={3}
                value={draft[field]}
                placeholder={placeholder}
                onChange={(e) => change(field, e.target.value)}
              />
            </label>
          ))}
        </section>
        <section className="editor-section">
          <h3>
            <ImagePlus size={18} />
            Charts & screenshots<span>05</span>
          </h3>
          <input
            ref={fileRef}
            className="file-input"
            id="chart-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            onChange={(e) => upload(e.target.files)}
          />
          <button
            disabled={uploading || busy}
            type="button"
            className="upload-zone"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!uploading && !busy) upload(e.dataTransfer.files);
            }}
          >
            <ImagePlus size={25} />
            <strong>
              {uploading
                ? "Reading your images…"
                : "Drop your charts here, or browse"}
            </strong>
            <span>PNG, JPG, WebP or GIF · Up to 10 MB each · 10 images</span>
          </button>
          <div className="image-grid">
            {draft.images.map((img) => (
              <div className="image-item" key={img.id}>
                <button
                  type="button"
                  onClick={() => setLightbox(img)}
                  aria-label={`View ${img.name}`}
                >
                  <img src={img.url} alt={img.name} />
                  <span>{img.name}</span>
                </button>
                <button
                  type="button"
                  className="remove-image"
                  aria-label={`Remove ${img.name}`}
                  onClick={() =>
                    change(
                      "images",
                      draft.images.filter((i) => i.id !== img.id),
                    )
                  }
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <div className="editor-save">
          <div>
            {!isNew && (
              <button
                type="button"
                aria-label="Delete entry"
                className="delete-button"
                disabled={busy || uploading}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={17} />
              </button>
            )}
            <span>Stored privately in this browser</span>
          </div>
          <button
            type="submit"
            disabled={busy || uploading}
            className="primary"
          >
            <Check size={17} />
            {busy ? "Saving…" : "Save entry"}
          </button>
        </div>
      </form>
      {discard && (
        <div className="inline-confirm" role="alert">
          <strong>Leave without saving?</strong>
          <p>Your unsaved changes will be lost.</p>
          <div>
            <button onClick={() => setDiscard(false)} className="secondary">
              Keep writing
            </button>
            <button onClick={onClose} className="danger">
              Discard changes
            </button>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="inline-confirm" role="alert">
          <strong>Delete this day’s entry?</strong>
          <p>This permanently removes the notes and images for this day.</p>
          <div>
            <button
              className="secondary"
              onClick={() => setConfirmDelete(false)}
            >
              Keep entry
            </button>
            <button
              className="danger"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onDelete();
                } catch {
                  setError("Could not delete this entry. Please try again.");
                  setConfirmDelete(false);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Delete entry
            </button>
          </div>
        </div>
      )}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button
            type="button"
            aria-label="Close image"
            className="icon-button"
            onClick={() => setLightbox(null)}
          >
            <X />
          </button>
          <img src={lightbox.url} alt={lightbox.name} />
          <span>{lightbox.name}</span>
        </div>
      )}
    </Modal>
  );
}

createRoot(document.getElementById("root")).render(<App />);
