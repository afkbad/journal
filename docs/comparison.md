# Day 1: trading-journal research and improvements

Research checked October 26, 2026. This pass reviewed the maintainers’ published GitHub documentation linked below. It did not run those products or independently verify their hosted services. Direct requests to TradeZella, TraderSync, Tradervue’s commercial site, and Edgewonk were rejected by this environment’s egress proxy (403), so their latest UI, subscription tiers, and pricing were not verified. Earlier general positioning is not presented as fresh research.

## Sources and useful lessons

| Primary source reviewed                                                         | What its documentation describes                                                                                                                    | Practical lesson for Day 1                                                                                                           |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [TradeNote README](https://github.com/Eleven-Trading/TradeNote#readme)          | A journal emphasizing privacy, simplicity, flexibility, recollecting trade patterns, and broker imports                                             | Make past reflections easy to find while keeping the local workflow simple                                                           |
| [TradeTally README](https://github.com/GeneBO98/tradetally#readme)              | Trading analytics, behavior analysis, overconfidence/revenge-trading tracking, and health/performance analysis                                      | Review headspace alongside session results; do not reduce a session to one emotion                                                   |
| [Deltalytix README](https://github.com/hugodemenez/deltalytix#readme)           | Rich journal entries with images and session tags, filtered reporting, and recurring-pattern review                                                 | Use notes, tags, and feelings as practical ways to retrieve and review sessions                                                      |
| [LuxAlgo Trade Journal README](https://github.com/LuxAlgo/trade-journal#readme) | Searchable notes, templates, attachments, routines, rule checklists, adherence analysis, exports, and broker/CSV import with preview and validation | Combine reflection with a repeatable review routine, make scores explicit, and preserve data portability                             |
| [Tradervue API documentation](https://github.com/tradervue/api-docs#readme)     | Separate APIs for trades, executions, journal entries, journal notes, and imports, with authentication requirements                                 | Keep session reflections distinct from execution-level data; importing fills and computing trade metrics needs a separate data model |

These are documentation observations, not endorsements or claims of feature parity. No competitor code or visual assets were copied.

## Implemented in this update

1. **Multiple feelings per session.** Select or deselect any combination of ten feelings. Existing single-feeling entries open with their original selection retained. Multi-feeling data persists across reload and backup/restore; the legacy `mood` string remains alongside `moods` for compatibility.
2. **Weekly headspace summary.** Count sessions under each selected feeling and show their average daily net P&L. A session with multiple feelings appears under each; these overlapping groups must not be added together. This is descriptive, self-reported data with small samples, not causal analysis or a predictor.
3. **Searchable journal.** Search all daily entries across dates, reflection text, feelings, setups, and mistakes. Filter by feeling and positive/negative/zero daily result. Open a matching day directly to review or edit it. Search runs entirely in the browser.
4. **Saved weekly reflection.** Record what worked, what to improve, and one focus for next week. Each Monday-to-Sunday week has its own review. Drafts have a discard confirmation; saved reviews persist and are included in validated JSON backup export/restore. Old backups without reviews still import.
5. **More honest discipline scores.** Explicitly mark a session’s rules reviewed. A reviewed session with no rules followed contributes 0/4 rather than disappearing from the denominator. Unreviewed sessions are excluded. Legacy entries with checked rules continue to count unless explicitly marked unreviewed. Only recognized rule checks affect the score.

## Retained strengths

The charcoal/grey interface, larger click targets, calendar navigation, seven-day overview, four guided daily reflection sections, chart screenshots, setup/mistake tags, explicit save, and local JSON backups remain in place. No account or third-party data transfer is required.

## Best next additions, in order

1. **Trade-by-trade ledger.** Record symbol, direction, quantity, entry/exit, timestamps, fees, and planned risk. Only then calculate profit factor, expectancy, average wins/losses, and R multiples from actual trade data. Do not invent these metrics from daily totals.
2. **Custom playbooks and prompts.** Let the trader define setup rules and reflection sections. Store a version or snapshot of the rules used on each day so historical discipline scores remain meaningful after rules change.
3. **CSV import with mapping and preview.** Validate timestamps/timezones, fees, quantities, and instruments; show errors and duplicates before saving. Avoid claiming universal broker support without tested sample formats.
4. **Date-range reports.** Compare months or selected periods, with explicit sample counts and consistent session/trade-level definitions.
5. **Optional cloud sync.** Add authentication, attachment storage, conflict handling, backups, and account deletion. This requires a backend and a hosting/privacy decision; it is not part of the current browser-only app.

Broker sync, AI coaching, trade replay, automatic trade detection, and cloud sync are not implemented. Advanced features should follow reliable records and useful review habits rather than add complexity to the daily editor.
