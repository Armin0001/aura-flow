import { describe, expect, it } from 'vitest';
import { completeFocusSession, filterTodos, getTaskStats, moveStatus, sortTodos, toggleSubtask } from './tasks.js';

const task = (overrides) => ({
  id: '1',
  title: 'Task',
  description: '',
  category: 'Work',
  priority: 'medium',
  dueDate: '',
  status: 'todo',
  subtasks: [],
  createdAt: '2026-11-01T10:00:00.000Z',
  ...overrides,
});

const titles = (todos) => todos.map((t) => t.title);

describe('filterTodos', () => {
  const todos = [
    task({ id: '1', title: 'Write report', description: 'Quarterly numbers', category: 'Work', priority: 'high', status: 'todo' }),
    task({ id: '2', title: 'Gym', description: 'Leg day', category: 'Fitness', priority: 'low', status: 'done' }),
    task({ id: '3', title: 'Buy milk', description: 'and REPORT the leak', category: 'Personal', priority: 'low', status: 'todo' }),
  ];

  it('returns everything with no filters', () => {
    expect(filterTodos(todos)).toHaveLength(3);
  });

  it('searches titles and descriptions, ignoring case', () => {
    expect(titles(filterTodos(todos, { query: 'report' }))).toEqual(['Write report', 'Buy milk']);
  });

  it('combines the status, category and priority filters', () => {
    expect(titles(filterTodos(todos, { status: 'todo', priority: 'low' }))).toEqual(['Buy milk']);
    expect(titles(filterTodos(todos, { category: 'Fitness' }))).toEqual(['Gym']);
  });

  it('copes with imported tasks that have no description', () => {
    expect(titles(filterTodos([task({ title: 'Imported', description: undefined })], { query: 'imp' }))).toEqual(['Imported']);
  });
});

describe('sortTodos', () => {
  it('puts the soonest due date first and undated tasks last, in their original order', () => {
    const todos = [
      task({ title: 'undated A' }),
      task({ title: 'December', dueDate: '2026-12-01' }),
      task({ title: 'undated B' }),
      task({ title: 'November', dueDate: '2026-11-20' }),
    ];
    expect(titles(sortTodos(todos, 'dueDate'))).toEqual(['November', 'December', 'undated A', 'undated B']);
  });

  it('puts the highest priority first', () => {
    const todos = [task({ title: 'low', priority: 'low' }), task({ title: 'high', priority: 'high' }), task({ title: 'medium' })];
    expect(titles(sortTodos(todos, 'priority'))).toEqual(['high', 'medium', 'low']);
  });

  it('sorts titles alphabetically and creation time newest first', () => {
    const todos = [
      task({ title: 'b', createdAt: '2026-11-01T00:00:00Z' }),
      task({ title: 'c', createdAt: '2026-11-03T00:00:00Z' }),
      task({ title: 'a', createdAt: '2026-11-02T00:00:00Z' }),
    ];
    expect(titles(sortTodos(todos, 'title'))).toEqual(['a', 'b', 'c']);
    expect(titles(sortTodos(todos, 'createdAt'))).toEqual(['c', 'a', 'b']);
  });

  it('returns a copy and leaves the original array alone', () => {
    const todos = [task({ title: 'b' }), task({ title: 'a' })];
    sortTodos(todos, 'title');
    expect(titles(todos)).toEqual(['b', 'a']);
  });
});

describe('moveStatus', () => {
  it('moves one column along the board', () => {
    expect(moveStatus('todo', 'next')).toBe('in_progress');
    expect(moveStatus('review', 'next')).toBe('done');
    expect(moveStatus('review', 'prev')).toBe('in_progress');
  });

  it('stops at either end of the board', () => {
    expect(moveStatus('todo', 'prev')).toBeNull();
    expect(moveStatus('done', 'next')).toBeNull();
  });
});

describe('completeFocusSession', () => {
  it('ticks off the first open checklist item and nothing else', () => {
    const before = task({
      status: 'in_progress',
      subtasks: [
        { id: 'a', text: 'done already', completed: true },
        { id: 'b', text: 'first open', completed: false },
        { id: 'c', text: 'second open', completed: false },
      ],
    });
    const after = completeFocusSession(before);
    expect(after.subtasks.map((s) => s.completed)).toEqual([true, true, false]);
    expect(after.status).toBe('in_progress');
    expect(before.subtasks[1].completed).toBe(false); // the original is not mutated
  });

  it('moves a task with nothing left to tick along the board, but never past Review', () => {
    expect(completeFocusSession(task({ status: 'todo' })).status).toBe('in_progress');
    expect(completeFocusSession(task({ status: 'in_progress' })).status).toBe('review');
    expect(completeFocusSession(task({ status: 'review' })).status).toBe('review');
    expect(completeFocusSession(task({ status: 'done' })).status).toBe('done');
  });
});

describe('toggleSubtask', () => {
  it('flips only the matching checklist item', () => {
    const todo = task({ subtasks: [{ id: 'a', completed: false }, { id: 'b', completed: false }] });
    expect(toggleSubtask(todo, 'b').subtasks.map((s) => s.completed)).toEqual([false, true]);
  });
});

describe('getTaskStats', () => {
  it('counts statuses and rounds the completion rate', () => {
    const stats = getTaskStats([
      task({ status: 'done' }),
      task({ status: 'todo' }),
      task({ status: 'in_progress' }),
    ]);
    expect(stats).toMatchObject({ total: 3, completed: 1, todo: 1, inProgress: 1, review: 0, completionRate: 33 });
  });

  it('counts only unfinished tasks by priority and category', () => {
    const stats = getTaskStats([
      task({ priority: 'high', category: 'Work', status: 'done' }),
      task({ priority: 'high', category: 'Study' }),
      task({ priority: 'low', category: 'Study' }),
      task({ priority: 'low', category: 'Work' }),
    ]);
    expect(stats.openByPriority).toEqual({ high: 1, medium: 0, low: 2 });
    expect(stats.topCategory).toEqual({ name: 'Study', count: 2 });
  });

  it('handles an empty list', () => {
    expect(getTaskStats([])).toMatchObject({ total: 0, completionRate: 0, topCategory: null });
  });
});
