/* =========================================================
   7-Day Project Checklist — script.js
   Loads data from data/todo.json and saves progress
   in localStorage.
   ========================================================= */

'use strict';

/* ---------------------------------------------------------
   Configuration
   --------------------------------------------------------- */
const DATA_URL = './data/todo.json';
const FALLBACK_STORAGE_KEY = 'checklist.progress.v1';

/* ---------------------------------------------------------
   Runtime state
   --------------------------------------------------------- */
let plan = null;                 // parsed contents of todo.json
let progress = {};               // { [taskId]: true }
let storageKey = FALLBACK_STORAGE_KEY;

/** dayId -> { section, checkboxes, count, percent, bar, progress } */
const dayRefs = new Map();

/* ---------------------------------------------------------
   DOM references
   --------------------------------------------------------- */
const dom = {
  title: document.getElementById('project-title'),
  subtitle: document.getElementById('project-subtitle'),
  days: document.getElementById('days'),
  errorBox: document.getElementById('error-box'),
  resetAll: document.getElementById('reset-all'),
  overallPercent: document.getElementById('overall-percent'),
  overallBar: document.getElementById('overall-bar'),
  overallProgress: document.getElementById('overall-progress'),
  statCompleted: document.getElementById('stat-completed'),
  statRemaining: document.getElementById('stat-remaining'),
  statTotal: document.getElementById('stat-total')
};

/* =========================================================
   Boot
   ========================================================= */
async function init() {
  try {
    plan = await loadPlan();
  } catch (error) {
    showFatalError(error);
    return;
  }

  // Project meta
  const project = plan.project || {};
  storageKey = project.storageKey || FALLBACK_STORAGE_KEY;

  if (project.title) {
    dom.title.textContent = project.title;
    document.title = project.title;
  }
  if (project.subtitle) {
    dom.subtitle.textContent = project.subtitle;
  }

  // Progress + render
  progress = loadProgress();
  renderDays();
  refreshAll();

  dom.resetAll.addEventListener('click', handleResetAll);
}

/* =========================================================
   Data loading & validation
   ========================================================= */
async function loadPlan() {
  let response;

  try {
    response = await fetch(DATA_URL, { cache: 'no-store' });
  } catch (cause) {
    throw new Error(
      `The file "${DATA_URL}" could not be fetched. ` +
      'This usually happens when index.html is opened directly from disk (file://).'
    );
  }

  if (!response.ok) {
    throw new Error(
      `Could not load "${DATA_URL}" (HTTP ${response.status} ${response.statusText}).`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (cause) {
    throw new Error(`"${DATA_URL}" is not valid JSON. Check for missing commas or quotes.`);
  }

  validatePlan(data);
  return data;
}

/**
 * Throws a descriptive Error if the plan is malformed.
 * Guarantees: every day has a unique id, every task has a unique id,
 * and every task has a non-empty label.
 */
function validatePlan(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('todo.json must contain a single JSON object at the top level.');
  }

  if (!Array.isArray(data.days) || data.days.length === 0) {
    throw new Error('todo.json must contain a non-empty "days" array.');
  }

  const dayIds = new Set();
  const taskIds = new Set();

  data.days.forEach((day, dayIndex) => {
    const where = `days[${dayIndex}]`;

    if (!day || typeof day !== 'object') {
      throw new Error(`${where} must be an object.`);
    }
    if (!day.id || typeof day.id !== 'string') {
      throw new Error(`${where} is missing a string "id".`);
    }
    if (dayIds.has(day.id)) {
      throw new Error(`Duplicate day id "${day.id}". Every day id must be unique.`);
    }
    dayIds.add(day.id);

    if (!Array.isArray(day.tasks) || day.tasks.length === 0) {
      throw new Error(`Day "${day.id}" must contain a non-empty "tasks" array.`);
    }

    day.tasks.forEach((task, taskIndex) => {
      const taskWhere = `${where}.tasks[${taskIndex}]`;

      if (!task || typeof task !== 'object') {
        throw new Error(`${taskWhere} must be an object.`);
      }
      if (!task.id || typeof task.id !== 'string') {
        throw new Error(`${taskWhere} is missing a string "id".`);
      }
      if (taskIds.has(task.id)) {
        throw new Error(
          `Duplicate task id "${task.id}". Task ids must be unique across the entire file.`
        );
      }
      taskIds.add(task.id);

      if (typeof task.label !== 'string' || task.label.trim() === '') {
        throw new Error(`Task "${task.id}" is missing a non-empty "label".`);
      }
    });
  });
}

/* =========================================================
   localStorage
   ========================================================= */
function loadProgress() {
  let raw = null;

  try {
    raw = localStorage.getItem(storageKey);
  } catch (error) {
    console.warn('localStorage is not available. Progress will not be saved.', error);
    return {};
  }

  if (!raw) return {};

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.warn('Saved progress was corrupted and has been ignored.', error);
    return {};
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    console.warn('Saved progress had an unexpected shape and has been ignored.');
    return {};
  }

  // Keep only known task ids with a strictly true value.
  const known = new Set(collectTaskIds());
  const clean = {};

  Object.keys(parsed).forEach((key) => {
    if (parsed[key] === true && known.has(key)) {
      clean[key] = true;
    }
  });

  return clean;
}

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  } catch (error) {
    console.warn('Could not save progress to localStorage.', error);
  }
}

function collectTaskIds() {
  const ids = [];
  plan.days.forEach((day) => day.tasks.forEach((task) => ids.push(task.id)));
  return ids;
}

/* =========================================================
   Rendering
   ========================================================= */
function renderDays() {
  dayRefs.clear();
  dom.days.innerHTML = '';

  const fragment = document.createDocumentFragment();

  plan.days.forEach((day, index) => {
    const { element, refs } = createDaySection(day, index);
    dayRefs.set(day.id, refs);
    fragment.appendChild(element);
  });

  dom.days.appendChild(fragment);
}

function createDaySection(day, index) {
  const dayNumber = Number.isFinite(day.day) ? day.day : index + 1;
  const isOpen = day.open !== false; // open unless explicitly set to false

  /* ---------- Section ---------- */
  const section = document.createElement('section');
  section.className = 'day';
  section.dataset.dayId = day.id;

  /* ---------- Header (toggle button) ---------- */
  const header = document.createElement('button');
  header.type = 'button';
  header.className = 'day__header';
  header.dataset.action = 'toggle-day';
  header.setAttribute('aria-expanded', String(isOpen));
  header.setAttribute('aria-controls', `panel-${day.id}`);
  header.innerHTML = `
    <span class="day__badge">Day ${escapeHtml(dayNumber)}</span>
    <span class="day__heading">
      <span class="day__title">${escapeHtml(day.title || 'Untitled day')}</span>
      <span class="day__count" data-role="count">0 / 0 tasks</span>
    </span>
    <span class="day__chevron" aria-hidden="true"></span>
  `;

  /* ---------- Panel ---------- */
  const panel = document.createElement('div');
  panel.className = 'day__panel';
  panel.id = `panel-${day.id}`;
  panel.hidden = !isOpen;

  /* ---------- Day progress ---------- */
  const progressRow = document.createElement('div');
  progressRow.className = 'day__progress-row';
  progressRow.innerHTML = `
    <div class="progress progress--sm" role="progressbar"
         aria-label="Progress for day ${escapeHtml(dayNumber)}"
         aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div class="progress__fill" data-role="bar"></div>
    </div>
    <span class="day__percent" data-role="percent">0%</span>
  `;

  /* ---------- Task list ---------- */
  const list = document.createElement('ul');
  list.className = 'tasks';

  day.tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'task';
    item.dataset.taskId = task.id;

    const label = document.createElement('label');
    label.className = 'task__label';
    label.htmlFor = `chk-${task.id}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task__checkbox';
    checkbox.id = `chk-${task.id}`;
    checkbox.dataset.taskId = task.id;
    checkbox.checked = progress[task.id] === true;

    const text = document.createElement('span');
    text.className = 'task__text';
    text.textContent = task.label;

    label.appendChild(checkbox);
    label.appendChild(text);
    item.appendChild(label);
    list.appendChild(item);
  });

  /* ---------- Reset day button ---------- */
  const actions = document.createElement('div');
  actions.className = 'day__actions';

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'btn btn--ghost';
  resetButton.textContent = 'Reset this day';
  resetButton.dataset.action = 'reset-day';
  resetButton.dataset.dayId = day.id;

  actions.appendChild(resetButton);

  /* ---------- Assemble ---------- */
  panel.appendChild(progressRow);
  panel.appendChild(list);
  panel.appendChild(actions);

  section.appendChild(header);
  section.appendChild(panel);

  const refs = {
    section,
    checkboxes: Array.from(list.querySelectorAll('.task__checkbox')),
    count: header.querySelector('[data-role="count"]'),
    percent: progressRow.querySelector('[data-role="percent"]'),
    bar: progressRow.querySelector('[data-role="bar"]'),
    progress: progressRow.querySelector('.progress')
  };

  return { element: section, refs };
}

/* =========================================================
   Progress updates
   ========================================================= */
function refreshAll() {
  let doneTotal = 0;
  let taskTotal = 0;

  dayRefs.forEach((refs, dayId) => {
    const stats = updateDay(dayId);
    if (stats) {
      doneTotal += stats.done;
      taskTotal += stats.total;
    }
  });

  const percent = taskTotal === 0 ? 0 : Math.round((doneTotal / taskTotal) * 100);

  dom.overallPercent.textContent = `${percent}%`;
  dom.overallBar.style.width = `${percent}%`;
  dom.overallProgress.setAttribute('aria-valuenow', String(percent));

  dom.statCompleted.textContent = String(doneTotal);
  dom.statRemaining.textContent = String(taskTotal - doneTotal);
  dom.statTotal.textContent = String(taskTotal);
}

function updateDay(dayId) {
  const refs = dayRefs.get(dayId);
  if (!refs) return null;

  let done = 0;

  refs.checkboxes.forEach((checkbox) => {
    const isDone = progress[checkbox.dataset.taskId] === true;
    checkbox.checked = isDone;
    checkbox.closest('.task').classList.toggle('is-done', isDone);
    if (isDone) done += 1;
  });

  const total = refs.checkboxes.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  refs.count.textContent = `${done} / ${total} tasks`;
  refs.percent.textContent = `${percent}%`;
  refs.bar.style.width = `${percent}%`;
  refs.progress.setAttribute('aria-valuenow', String(percent));
  refs.section.classList.toggle('is-complete', total > 0 && done === total);

  return { done, total };
}

/* =========================================================
   Interactions
   ========================================================= */
dom.days.addEventListener('change', (event) => {
  const checkbox = event.target.closest('.task__checkbox');
  if (!checkbox) return;

  const taskId = checkbox.dataset.taskId;

  if (checkbox.checked) {
    progress[taskId] = true;
  } else {
    delete progress[taskId];
  }

  saveProgress();
  refreshAll();
});

dom.days.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-action="toggle-day"]');
  if (toggle) {
    toggleDay(toggle);
    return;
  }

  const resetButton = event.target.closest('[data-action="reset-day"]');
  if (resetButton) {
    resetDay(resetButton.dataset.dayId);
  }
});

function toggleDay(header) {
  const isExpanded = header.getAttribute('aria-expanded') === 'true';
  const panel = header.nextElementSibling;

  header.setAttribute('aria-expanded', String(!isExpanded));
  if (panel) panel.hidden = isExpanded;
}

function resetDay(dayId) {
  const day = plan.days.find((entry) => entry.id === dayId);
  if (!day) return;

  day.tasks.forEach((task) => {
    delete progress[task.id];
  });

  saveProgress();
  refreshAll();
}

function handleResetAll() {
  const confirmed = window.confirm(
    'Reset the entire checklist?\n\nAll completed tasks for every day will be cleared. This cannot be undone.'
  );
  if (!confirmed) return;

  progress = {};
  saveProgress();
  refreshAll();
}

/* =========================================================
   Error handling
   ========================================================= */
function showFatalError(error) {
  dom.days.innerHTML = '';
  dom.days.hidden = true;

  const isFileProtocol = window.location.protocol === 'file:';

  dom.errorBox.hidden = false;
  dom.errorBox.innerHTML = `
    <h2>Could not load the checklist data</h2>
    <p>${escapeHtml(error.message)}</p>
    ${
      isFileProtocol
        ? `<p>Browsers block reading local JSON files when you open <code>index.html</code>
             directly from disk. Start a small local server instead:</p>
           <pre><code>cd path/to/your/project
python3 -m http.server 8000</code></pre>
           <p>Then open <a href="http://localhost:8000">http://localhost:8000</a> in your browser.</p>`
        : `<p>Make sure <code>data/todo.json</code> exists and contains valid JSON.</p>`
    }
  `;
}

/* =========================================================
   Utilities
   ========================================================= */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* =========================================================
   Go
   ========================================================= */
init();