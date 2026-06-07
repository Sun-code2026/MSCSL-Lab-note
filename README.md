# MSCSL Lab Note

Daily experiment notebook workflow for MSCSL students and advisors.

This repository contains a lightweight browser app and a reusable notebook template for the end-of-day lab routine:

1. Students fill out the experiment notebook before leaving the lab.
2. Students submit the notebook through a GitHub Issue link.
3. GitHub Actions sync submitted notebooks into central `records/` files.

## Files

- `index.html`: standalone lab-note tracking app.
- `app.js`: template generation, GitHub submission link generation, and central record display.
- `styles.css`: app styling.
- `templates/daily-experiment-notebook.md`: student-facing notebook template.
- `.github/ISSUE_TEMPLATE/experiment-notebook.md`: GitHub issue template for submitted notebooks.
- `.github/workflows/sync-records.yml`: updates central record files whenever notebook issues change.
- `records/records.json`: central machine-readable notebook registry.
- `records/records.csv`: spreadsheet-friendly central notebook registry.
- `records/records.md`: readable central notebook archive.

## Local Use

Open `index.html` in a browser. No build step or server is required.

## Access Link

Use the GitHub Pages app:

```text
https://sun-code2026.github.io/MSCSL-Lab-note/
```

## GitHub Submission Flow

The app generates a GitHub Issue URL for:

```text
https://github.com/Sun-code2026/MSCSL-Lab-note/issues/new
```

Students can paste their completed notebook into the generated issue. After the issue is submitted, GitHub Actions updates the central registry files under `records/`.

## Where Notes Are Stored

Submitted lab notebook contents are stored as GitHub Issues in this repository:

```text
https://github.com/Sun-code2026/MSCSL-Lab-note/issues
```

The central registry is stored in this repository:

```text
records/records.json
records/records.csv
records/records.md
```

The browser app reads `records/records.json`, so every computer sees the same central record after GitHub Actions finishes syncing. No submission records are stored only on the student's computer.

## Advisor Backup

For an additional offline backup, export all GitHub Issues on the advisor's computer.

Run:

```bash
node scripts/backup-issues.mjs
```

This creates a timestamped folder under `backups/` with:

- `issues.json` for full machine-readable backup.
- `issues.csv` for Excel or Google Sheets.
- `issues.md` for a combined readable archive.
- one Markdown file per submitted notebook.

See `scripts/README.md` for details.

## Suggested Daily Routine

1. Before leaving the lab, the student opens the template.
2. The student records the day's schedule, performed experiments, results, files, blockers, and next plan.
3. The student creates a GitHub Issue using the generated submission link.
4. GitHub Actions writes the central files under `records/`.
5. The advisor reviews the issue and can use labels such as `reviewed` or `needs-revision` to update central status.
