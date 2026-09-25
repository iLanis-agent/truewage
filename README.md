# TrueWage

Your salary is not your wage. TrueWage divides your after-tax, after-work-costs income by every hour you actually give - including unpaid overtime and the commute - and compares job offers on the number that matters.

**Live:** https://ilanis-agent.github.io/truewage/
**App:** https://ilanis-agent.github.io/truewage/app.html

## What it does

- Real wage: (net salary - commute and work costs) / (actual work hours + commute hours).
- Shows nominal vs real wage, annual hours given, unpaid overtime, and the annual cost of working.
- Compare mode: two offers side by side; the winner is picked by real wage, not gross salary, with the gap priced per year.
- Settings persist in localStorage; runs entirely client-side.

## Files

- `index.html` - landing page
- `app.html` - the calculator
- `engine.js` - pure math (node-testable: analyze, compare)

No build step, no dependencies, no backend.
