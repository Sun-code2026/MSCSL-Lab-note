import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repo = process.argv[2] || 'Sun-code2026/MSCSL-Lab-note';
const outputDir = process.argv[3] || 'backups';
const timestamp = new Date().toISOString().replaceAll(':', '-').slice(0, 19);
const backupDir = join(outputDir, timestamp);

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function frontMatter(issue) {
  const labels = (issue.labels || []).map((label) => label.name).join(', ');
  return `---
number: ${issue.number}
title: ${JSON.stringify(issue.title)}
state: ${issue.state}
author: ${issue.author?.login || ''}
createdAt: ${issue.createdAt}
updatedAt: ${issue.updatedAt}
url: ${issue.url}
labels: ${JSON.stringify(labels)}
---
`;
}

mkdirSync(backupDir, { recursive: true });

const fields = 'number,title,body,state,createdAt,updatedAt,author,labels,url';
const raw = runGh(['issue', 'list', '--repo', repo, '--limit', '1000', '--state', 'all', '--json', fields]);
const issues = JSON.parse(raw);

writeFileSync(join(backupDir, 'issues.json'), JSON.stringify(issues, null, 2), 'utf8');

const csvHeader = ['number', 'title', 'state', 'author', 'createdAt', 'updatedAt', 'labels', 'url', 'body'];
const csvRows = issues.map((issue) =>
  [
    issue.number,
    issue.title,
    issue.state,
    issue.author?.login || '',
    issue.createdAt,
    issue.updatedAt,
    (issue.labels || []).map((label) => label.name).join('; '),
    issue.url,
    issue.body || '',
  ]
    .map(csvCell)
    .join(','),
);
writeFileSync(join(backupDir, 'issues.csv'), [csvHeader.join(','), ...csvRows].join('\n'), 'utf8');

const markdown = issues
  .map((issue) => `${frontMatter(issue)}
# ${issue.title}

${issue.body || '_No body_'}
`)
  .join('\n\n---\n\n');
writeFileSync(join(backupDir, 'issues.md'), markdown, 'utf8');

for (const issue of issues) {
  const safeTitle = issue.title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').slice(0, 80).trim();
  const filename = `${String(issue.number).padStart(4, '0')}-${safeTitle || 'issue'}.md`;
  writeFileSync(join(backupDir, filename), `${frontMatter(issue)}
# ${issue.title}

${issue.body || '_No body_'}
`, 'utf8');
}

console.log(`Backed up ${issues.length} issues to ${backupDir}`);
