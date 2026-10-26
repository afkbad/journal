# Daymark

A calm, calendar-first day trading journal. Built with React, Vite, Lucide icons, and IndexedDB. No account, API key, or external service is required.

## Develop

Node.js 22.12+ or 24 is supported.

```sh
npm ci --cache /tmp/daymark-npm-cache
npm run dev -- --port 5173
```

## Validate

```sh
npm run build
npm test
```

Browser tests use `/usr/bin/chromium` by default. Set `CHROMIUM_PATH` to a different installed Chromium executable if needed. The test runner starts Vite automatically when no server is listening on port 5173.

## Journal workflow

- Click a date to record P&L, trade and win counts, mindset, setups, mistakes, and four trading-rule checks.
- Reflect on your pre-market plan, execution, lessons, and the next session.
- Upload up to 10 PNG/JPG/WebP/GIF images per entry, up to 10 MB each. View or remove individual images.
- Save explicitly; unsaved changes are protected with a discard prompt.
- Use Weekly review to see all seven days, P&L, win rate, setup and mistake patterns, and discipline across scored sessions. A session is scored when at least one rule is checked; unscored sessions are excluded from discipline percentage.
- Export a JSON backup including images. Restore merges entries by date after confirmation; backup entries win when a date exists in both.
- A clearly labeled example journal appears on first use. “Start your own” clears it after confirmation. Changes made while in example mode are also removed by this action.

## Storage and scope

Data stays in this browser's IndexedDB on this device and origin. Clearing site data removes entries. Export regularly; there is no cloud sync, login, broker import, trade-by-trade ledger, or brokerage connection. P&L is entered manually in USD, not calculated from fills. Win rate is winning trades / total trades; green and red days refer to daily net P&L. Rule checks and tags are self-reported. This is a reflection tool, not a source of trading advice.

See [comparison and design decisions](docs/comparison.md) for the competitor-informed changes and remaining gaps.
