import { mkdirSync, writeFileSync } from 'node:fs';

const owner = process.env.GITHUB_REPOSITORY_OWNER || 'Sun-code2026';
const repoName = (process.env.GITHUB_REPOSITORY || 'Sun-code2026/MSCSL-Lab-note').split('/')[1];
const token = process.env.GITHUB_TOKEN;

if (!token) {
  throw new Error('GITHUB_TOKEN is required to sync central records.');
}

const apiBase = `https://api.github.com/repos/${owner}/${repoName}`;

async function github(path) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function listIssues() {
  const issues = [];
  let page = 1;

  while (true) {
    const batch = await github(`/issues?state=all&labels=experiment-notebook&per_page=100&page=${page}`);
    const onlyIssues = batch.filter((issue) => !issue.pull_request);
    issues.push(...onlyIssues);
    if (batch.length < 100) break;
    page += 1;
  }

  return issues;
}

function extractField(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`^-\\s*${escaped}:\\s*(.+)$`, 'im'),
    new RegExp(`^${escaped}:\\s*(.+)$`, 'im'),
  ];
  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return '';
}

function parseTitle(title) {
  const match = title.match(/^\[Notebook\]\s*(.*?)\s*-\s*(.*?)\s*-\s*(.*)$/);
  return {
    date: match?.[1]?.trim() || '',
    student: match?.[2]?.trim() || '',
    project: match?.[3]?.trim() || '',
  };
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function toRecord(issue) {
  const body = issue.body || '';
  const titleData = parseTitle(issue.title);
  const labels = issue.labels.map((label) => label.name);

  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    status: labels.includes('needs-revision')
      ? 'needs revision'
      : labels.includes('reviewed')
        ? 'reviewed'
        : issue.state === 'closed'
          ? 'closed'
          : 'submitted',
    student: extractField(body, 'Student') || titleData.student,
    date: extractField(body, 'Date') || titleData.date,
    project: extractField(body, 'Project') || titleData.project,
    labLocation: extractField(body, 'Lab / Bench / Instrument'),
    startTime: extractField(body, 'Start time'),
    endTime: extractField(body, 'End time'),
    labels,
    url: issue.html_url,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    author: issue.user?.login || '',
    body,
  };
}

const records = (await listIssues())
  .map(toRecord)
  .sort((a, b) => {
    const dateCompare = String(b.date || '').localeCompare(String(a.date || ''));
    return dateCompare || b.number - a.number;
  });

mkdirSync('records', { recursive: true });

writeFileSync(
  'records/records.json',
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      repository: `${owner}/${repoName}`,
      count: records.length,
      records,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

const csvHeader = [
  'number',
  'date',
  'student',
  'project',
  'status',
  'state',
  'labLocation',
  'startTime',
  'endTime',
  'labels',
  'url',
  'author',
  'createdAt',
  'updatedAt',
];

const csvRows = records.map((record) =>
  [
    record.number,
    record.date,
    record.student,
    record.project,
    record.status,
    record.state,
    record.labLocation,
    record.startTime,
    record.endTime,
    record.labels.join('; '),
    record.url,
    record.author,
    record.createdAt,
    record.updatedAt,
  ]
    .map(csvCell)
    .join(','),
);

writeFileSync('records/records.csv', `${[csvHeader.join(','), ...csvRows].join('\n')}\n`, 'utf8');

const markdown = records
  .map(
    (record) => `## #${record.number} ${record.date} - ${record.student} - ${record.project}

- Status: ${record.status}
- State: ${record.state}
- Issue: ${record.url}
- Labels: ${record.labels.join(', ') || '-'}

${record.body || '_No body_'}
`,
  )
  .join('\n---\n\n');

writeFileSync('records/records.md', `${markdown}\n`, 'utf8');

console.log(`Synced ${records.length} records to records/`);
