// Task rules, kept free of React so they can be tested on their own.

export const STATUS_ORDER = ['todo', 'in_progress', 'review', 'done'];

export const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

/** Tasks matching the search text (title or description) and the status, category and priority filters. */
export function filterTodos(todos, { query = '', status = 'all', category = 'all', priority = 'all' } = {}) {
  const needle = query.toLowerCase();
  return todos.filter(
    (todo) =>
      (todo.title.toLowerCase().includes(needle) || (todo.description ?? '').toLowerCase().includes(needle)) &&
      (status === 'all' || todo.status === status) &&
      (category === 'all' || todo.category === category) &&
      (priority === 'all' || todo.priority === priority),
  );
}

/**
 * A sorted copy. 'dueDate' is soonest first with undated tasks last, 'priority' is highest first,
 * 'title' is alphabetical and 'createdAt' is newest first. Ties keep their current order.
 */
export function sortTodos(todos, sortBy) {
  const compare = {
    dueDate: (a, b) => {
      if (!a.dueDate || !b.dueDate) return Number(!a.dueDate) - Number(!b.dueDate);
      return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0; // "YYYY-MM-DD" sorts correctly as text
    },
    priority: (a, b) => (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0),
    title: (a, b) => a.title.localeCompare(b.title),
    createdAt: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  }[sortBy];
  return compare ? [...todos].sort(compare) : [...todos];
}

/** The status one column to the left ('prev') or right ('next'), or null at either end of the board. */
export function moveStatus(status, direction) {
  const next = STATUS_ORDER.indexOf(status) + (direction === 'next' ? 1 : -1);
  return next >= 0 && next < STATUS_ORDER.length ? STATUS_ORDER[next] : null;
}

/** Flips one checklist item. */
export function toggleSubtask(todo, subtaskId) {
  return {
    ...todo,
    subtasks: todo.subtasks.map((sub) => (sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub)),
  };
}

/**
 * What a finished focus session does to the linked task: tick off the first open checklist item,
 * or, with nothing left to tick, move the task along (To Do to In Progress, In Progress to Review).
 * Review and Done are left for a person to decide.
 */
export function completeFocusSession(todo) {
  const open = todo.subtasks.findIndex((sub) => !sub.completed);
  if (open !== -1) return toggleSubtask(todo, todo.subtasks[open].id);
  if (todo.status === 'todo') return { ...todo, status: 'in_progress' };
  if (todo.status === 'in_progress') return { ...todo, status: 'review' };
  return todo;
}

/** The numbers behind the dashboard. Priority and category counts only include unfinished tasks. */
export function getTaskStats(todos) {
  const count = (predicate) => todos.filter(predicate).length;
  const open = todos.filter((t) => t.status !== 'done');
  const total = todos.length;
  const completed = count((t) => t.status === 'done');

  const perCategory = {};
  for (const t of open) perCategory[t.category] = (perCategory[t.category] ?? 0) + 1;
  const [topCategory = null] = Object.entries(perCategory).sort((a, b) => b[1] - a[1]);

  return {
    total,
    completed,
    todo: count((t) => t.status === 'todo'),
    inProgress: count((t) => t.status === 'in_progress'),
    review: count((t) => t.status === 'review'),
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    openByPriority: {
      high: open.filter((t) => t.priority === 'high').length,
      medium: open.filter((t) => t.priority === 'medium').length,
      low: open.filter((t) => t.priority === 'low').length,
    },
    topCategory: topCategory && { name: topCategory[0], count: topCategory[1] },
  };
}
