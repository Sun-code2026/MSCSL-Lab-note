# MSCSL Lab Note

Daily experiment notebook workflow for MSCSL students and advisors.

This repository contains a lightweight browser app and a reusable notebook template for the end-of-day lab routine:

1. Students fill out the experiment notebook before leaving the lab.
2. Students submit the notebook through a GitHub Issue link.
3. The advisor records submitted notebooks, tracks review status, and exports the log.

## Files

- `index.html`: standalone lab-note tracking app.
- `app.js`: template generation, GitHub submission link generation, and local record storage.
- `styles.css`: app styling.
- `templates/daily-experiment-notebook.md`: student-facing notebook template.
- `.github/ISSUE_TEMPLATE/experiment-notebook.md`: GitHub issue template for submitted notebooks.

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

Students can paste their completed notebook into the generated issue. The advisor can then copy the issue URL into the registry section of the app.

## Where Notes Are Stored

Submitted lab notebook contents are stored as GitHub Issues in this repository:

```text
https://github.com/Sun-code2026/MSCSL-Lab-note/issues
```

The browser app's registry table stores only tracking metadata in the current browser's `localStorage`: student, date, project, issue URL, review status, and advisor comment. Export the table as CSV if you need a portable backup.

## Advisor Backup

For stable operation, treat GitHub Issues as the central storage and periodically export them on the advisor's computer.

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
4. The advisor reviews the issue and records it in the tracker.
5. The advisor marks status as `submitted`, `reviewed`, `needs revision`, or `closed`.
