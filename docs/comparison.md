# Trading journal comparison and improvements

Prepared October 26, 2026. Direct requests to the official sites below were rejected by this environment's egress proxy (403). The comparison uses established product positioning and common trading-journal workflows, not a verified audit of their current plans or feature availability. Pricing and current feature claims are intentionally omitted.

| Reference                                 | Established emphasis                                   | What Daymark borrows                                                       | Current Daymark gap                                                |
| ----------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [TradeZella](https://www.tradezella.com/) | Trading performance review and structured journaling   | Results alongside guided reflection, screenshot attachments, weekly review | No trade replay, execution analytics, or automated broker import   |
| [TraderSync](https://tradersync.com/)     | Performance analytics and identifying trading patterns | Setup and mistake tags, mindset tracking, weekly pattern counts            | No execution-level analysis, strategy backtesting, or integrations |
| [Tradervue](https://www.tradervue.com/)   | Trade journaling, review, and reporting                | Date-based navigation, chart images, reusable reflection structure         | No fill imports, sharing, or trade-level reports                   |

## Improvements implemented

1. **Reflection first:** a calendar opens directly to the selected day; all seven days remain visible in the weekly review.
2. **A repeatable process:** pre-market plan, execution, lessons, and next-session intention provide structure beyond a blank notes box.
3. **Process alongside results:** a four-rule checklist reports discipline across scored sessions, rather than equating a profitable day with good execution. Unscored sessions are explicitly excluded.
4. **Patterns without a complex dashboard:** setup tags and mistake tags aggregate by day in weekly review. These counts describe frequency, not strategy profitability or causation.
5. **Visual context:** screenshots are stored with the session and can be enlarged or removed.
6. **Ownership and recovery:** local storage needs no account; backup export includes images, and validated restore merges by date after confirmation.
7. **Safer editing:** explicit save, storage-failure feedback, numeric validation, delete confirmation, and unsaved-change protection.
8. **Responsive design:** the same calendar and review work on mobile; navigation collapses into a drawer.

## Suggested next stage

Cloud sync with authentication and conflict handling, a trade-by-trade ledger, CSV imports with a preview/mapping step, configurable trading rules, and a custom reporting range. Those need separate product and storage decisions; the current build does not imply those capabilities.
