const REPO_URL = 'https://github.com/Sun-code2026/MSCSL-Lab-note';
const ISSUES_URL = `${REPO_URL}/issues/new`;
const RECORDS_JSON_URL = 'https://raw.githubusercontent.com/Sun-code2026/MSCSL-Lab-note/master/records/records.json';
const RECORDS_CSV_URL = 'https://raw.githubusercontent.com/Sun-code2026/MSCSL-Lab-note/master/records/records.csv';

const fields = {
  studentName: document.querySelector('#studentName'),
  submissionDate: document.querySelector('#submissionDate'),
  projectTitle: document.querySelector('#projectTitle'),
  labLocation: document.querySelector('#labLocation'),
  notebookText: document.querySelector('#notebookText'),
  issueUrl: document.querySelector('#issueUrl'),
  openIssueLink: document.querySelector('#openIssueLink'),
  recordIssueUrl: document.querySelector('#recordIssueUrl'),
  recordsBody: document.querySelector('#recordsBody'),
  recordsMeta: document.querySelector('#recordsMeta'),
  message: document.querySelector('#message'),
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function showMessage(text) {
  fields.message.textContent = text;
  fields.message.classList.add('visible');
}

function buildTemplate() {
  const student = fields.studentName.value.trim() || '[student]';
  const date = fields.submissionDate.value || today();
  const project = fields.projectTitle.value.trim() || '[project]';
  const location = fields.labLocation.value.trim() || '[lab / instrument]';

  return `# Daily Experiment Notebook

- Student: ${student}
- Date: ${date}
- Project: ${project}
- Lab / Bench / Instrument: ${location}
- Start time:
- End time:
- GitHub issue:

## 1. Today Before Leaving The Lab

- [ ] Bench/workspace cleaned
- [ ] Raw data, images, logs, and analysis files saved
- [ ] Samples/files labeled clearly
- [ ] Shared calendar, instrument log, or storage location updated

## 2. Experiment Schedule

| Time | Planned work | Actual work | Location / Instrument | Notes |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## 3. Experiment Purpose

- Research question:
- Reason for doing it today:
- Expected result:

## 4. Materials And Conditions

- Samples / cells / animals / datasets:
- Reagents / equipment / software:
- Protocol version:
- Key parameters:
- Controls or baseline:

## 5. Work Performed

Write enough detail that another lab member could repeat the work.

1.
2.
3.

## 6. Results And Files

- Main observations:
- Quantitative results:
- Figures / images / raw files:
- File paths or links:
- Unexpected findings:

## 7. Interpretation

- What do the results suggest?
- What alternative explanation is still possible?
- What is uncertain or weak?
- Are the controls sufficient?

## 8. Problems, Risks, And Help Needed

- Technical problems:
- Missing control or missing data:
- Safety or sample integrity issues:
- Help needed from advisor or lab members:

## 9. Tomorrow's Plan

| Priority | Task | Owner | Needed material / decision |
| --- | --- | --- | --- |
| High |  |  |  |
| Medium |  |  |  |

## 10. Questions For Advisor

1.
2.
3.
`;
}

function refreshTemplate() {
  fields.notebookText.value = buildTemplate();
}

async function copyText(text, message) {
  await navigator.clipboard.writeText(text);
  showMessage(message);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function createIssueUrl() {
  const student = fields.studentName.value.trim() || 'Student';
  const date = fields.submissionDate.value || today();
  const project = fields.projectTitle.value.trim() || 'Project';
  const title = `[Notebook] ${date} - ${student} - ${project}`;
  const body = fields.notebookText.value.trim() || buildTemplate();
  const params = new URLSearchParams({
    title,
    body,
    labels: 'experiment-notebook,daily-submission',
  });
  const url = `${ISSUES_URL}?${params.toString()}`;
  fields.issueUrl.value = url;
  fields.openIssueLink.href = url;
  fields.recordIssueUrl.value = url;
  showMessage('GitHub 제출 링크를 만들었습니다.');
}

async function loadCentralRecords() {
  const response = await fetch(`${RECORDS_JSON_URL}?t=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('중앙 기록 파일을 불러오지 못했습니다.');
  }
  return response.json();
}

function renderRecords(records, meta = {}) {
  fields.recordsBody.innerHTML = records
    .map(
      (record) => `<tr>
        <td>${escapeHtml(record.date)}</td>
        <td>${escapeHtml(record.student)}</td>
        <td>${escapeHtml(record.project)}</td>
        <td><span class="statusPill">${escapeHtml(record.status)}</span></td>
        <td><a href="${escapeAttribute(record.url)}" target="_blank" rel="noreferrer">open</a></td>
        <td>${escapeHtml((record.labels || []).join(', ') || '-')}</td>
      </tr>`,
    )
    .join('');

  fields.recordsMeta.textContent = `중앙 기록 ${records.length}건${meta.generatedAt ? ` · 마지막 동기화 ${meta.generatedAt}` : ''}`;
}

async function refreshCentralRecords() {
  try {
    fields.recordsBody.innerHTML = '<tr><td colspan="6">중앙 기록을 불러오는 중입니다.</td></tr>';
    const data = await loadCentralRecords();
    renderRecords(data.records || [], data);
    showMessage('GitHub repo의 중앙 기록을 불러왔습니다.');
  } catch (error) {
    fields.recordsBody.innerHTML = '<tr><td colspan="6">중앙 기록을 불러오지 못했습니다.</td></tr>';
    showMessage(error instanceof Error ? error.message : '중앙 기록을 불러오지 못했습니다.');
  }
}

function downloadCentralCsv() {
  window.open(RECORDS_CSV_URL, '_blank', 'noopener,noreferrer');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

fields.submissionDate.value = today();
refreshTemplate();
refreshCentralRecords();

document.querySelector('#refreshTemplateButton').addEventListener('click', refreshTemplate);
document.querySelector('#copyTemplateButton').addEventListener('click', () => copyText(fields.notebookText.value, '템플릿을 복사했습니다.'));
document.querySelector('#downloadTemplateButton').addEventListener('click', () => {
  downloadText('daily-experiment-notebook.md', fields.notebookText.value);
});
document.querySelector('#createIssueLinkButton').addEventListener('click', createIssueUrl);
document.querySelector('#copyIssueUrlButton').addEventListener('click', () => copyText(fields.issueUrl.value, 'GitHub 제출 링크를 복사했습니다.'));
document.querySelector('#refreshRecordsButton').addEventListener('click', refreshCentralRecords);
document.querySelector('#exportRecordsButton').addEventListener('click', downloadCentralCsv);
