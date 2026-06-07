const REPO_URL = 'https://github.com/Sun-code2026/MSCSL-Lab-note';
const ISSUES_URL = `${REPO_URL}/issues/new`;
const STORAGE_KEY = 'mscsl.labNote.records';

const fields = {
  studentName: document.querySelector('#studentName'),
  submissionDate: document.querySelector('#submissionDate'),
  projectTitle: document.querySelector('#projectTitle'),
  labLocation: document.querySelector('#labLocation'),
  notebookText: document.querySelector('#notebookText'),
  issueUrl: document.querySelector('#issueUrl'),
  openIssueLink: document.querySelector('#openIssueLink'),
  recordIssueUrl: document.querySelector('#recordIssueUrl'),
  recordStatus: document.querySelector('#recordStatus'),
  advisorComment: document.querySelector('#advisorComment'),
  recordsBody: document.querySelector('#recordsBody'),
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

function loadRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function saveRecord() {
  const record = {
    id: crypto.randomUUID(),
    date: fields.submissionDate.value || today(),
    student: fields.studentName.value.trim(),
    project: fields.projectTitle.value.trim(),
    issueUrl: fields.recordIssueUrl.value.trim(),
    status: fields.recordStatus.value,
    comment: fields.advisorComment.value.trim(),
    createdAt: new Date().toISOString(),
  };

  if (!record.student || !record.project || !record.issueUrl) {
    showMessage('학생 이름, 프로젝트, GitHub Issue URL은 필수입니다.');
    return;
  }

  const records = [record, ...loadRecords()];
  saveRecords(records);
  renderRecords();
  showMessage('제출 기록을 저장했습니다.');
}

function renderRecords() {
  const records = loadRecords();
  fields.recordsBody.innerHTML = records
    .map(
      (record) => `<tr>
        <td>${escapeHtml(record.date)}</td>
        <td>${escapeHtml(record.student)}</td>
        <td>${escapeHtml(record.project)}</td>
        <td><span class="statusPill">${escapeHtml(record.status)}</span></td>
        <td><a href="${escapeAttribute(record.issueUrl)}" target="_blank" rel="noreferrer">open</a></td>
        <td>${escapeHtml(record.comment || '-')}</td>
      </tr>`,
    )
    .join('');
}

function exportRecords() {
  const records = loadRecords();
  const header = ['date', 'student', 'project', 'status', 'issueUrl', 'comment', 'createdAt'];
  const rows = records.map((record) =>
    header.map((key) => `"${String(record[key] || '').replaceAll('"', '""')}"`).join(','),
  );
  const csv = [header.join(','), ...rows].join('\n');
  downloadText('mscsl-lab-note-records.csv', csv);
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
renderRecords();

document.querySelector('#refreshTemplateButton').addEventListener('click', refreshTemplate);
document.querySelector('#copyTemplateButton').addEventListener('click', () => copyText(fields.notebookText.value, '템플릿을 복사했습니다.'));
document.querySelector('#downloadTemplateButton').addEventListener('click', () => {
  downloadText('daily-experiment-notebook.md', fields.notebookText.value);
});
document.querySelector('#createIssueLinkButton').addEventListener('click', createIssueUrl);
document.querySelector('#copyIssueUrlButton').addEventListener('click', () => copyText(fields.issueUrl.value, 'GitHub 제출 링크를 복사했습니다.'));
document.querySelector('#saveRecordButton').addEventListener('click', saveRecord);
document.querySelector('#exportRecordsButton').addEventListener('click', exportRecords);

