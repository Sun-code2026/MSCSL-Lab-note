# Backup Scripts

Use these scripts on the advisor's computer to back up all submitted GitHub Issues.

## Requirements

- Node.js
- GitHub CLI
- Logged in GitHub CLI session:

```bash
gh auth login
```

## Run

From the repository root:

```bash
node scripts/backup-issues.mjs
```

Optional custom repository and output directory:

```bash
node scripts/backup-issues.mjs Sun-code2026/MSCSL-Lab-note backups
```

## Output

Each run creates a timestamped folder under `backups/` containing:

- `issues.json`: complete machine-readable export.
- `issues.csv`: spreadsheet-friendly table.
- `issues.md`: all issues combined into one Markdown file.
- `0001-title.md`, `0002-title.md`, ...: one Markdown file per submitted notebook.

The `backups/` folder is ignored by git so private exports do not get committed accidentally.
