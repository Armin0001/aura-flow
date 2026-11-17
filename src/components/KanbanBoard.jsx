import { useState } from 'react';
import { ArrowLeft, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { moveStatus } from '../lib/tasks';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

const COLUMN_DOT = {
  todo: 'bg-slate-400',
  in_progress: 'bg-amber-400',
  review: 'bg-sky-400',
  done: 'bg-emerald-400',
};

export default function KanbanBoard({ todos, onToggleStatus, onEdit, onDelete }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const getTasksByStatus = (status) => todos.filter((t) => t.status === status);

  const moveTask = (taskId, currentStatus, direction) => {
    const next = moveStatus(currentStatus, direction); // null at either end of the board
    if (next) {
      onToggleStatus(taskId, next);
    }
  };

  const getPriorityBorder = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-rose-500';
      case 'medium': return 'border-l-4 border-l-amber-500';
      default: return 'border-l-4 border-l-slate-400 dark:border-l-slate-600';
    }
  };

  const handleDragStart = (e, taskId) => {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverColumn(columnId);
  };

  const handleDragLeave = (e) => {
    // Only clear if leaving the column entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOverColumn(null);
    }
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onToggleStatus(taskId, columnId);
    setDraggingId(null);
    setOverColumn(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full items-start">
      {COLUMNS.map((col) => {
        const tasks = getTasksByStatus(col.id);
        const isOver = overColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-3xl p-4 min-h-[450px] shadow-lg backdrop-blur-sm border transition-colors duration-150 ${
              isOver
                ? 'bg-violet-50 dark:bg-violet-950/20 border-violet-400 dark:border-violet-500/60'
                : 'bg-white/60 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/60'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${COLUMN_DOT[col.id]}`} />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{col.title}</h3>
              </div>
              <span className="text-xs bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {tasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
              {tasks.length === 0 ? (
                <div className={`flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed transition-colors duration-150 ${
                  isOver
                    ? 'border-violet-400 dark:border-violet-500/60 text-violet-400'
                    : 'border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-500'
                }`}>
                  <p className="text-xs italic">{isOver ? 'Drop here' : 'No tasks here'}</p>
                </div>
              ) : (
                tasks.map((task) => {
                  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                  const totalSubtasks = task.subtasks?.length || 0;
                  const isDragging = draggingId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 space-y-3 shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${getPriorityBorder(task.priority)} ${
                        isDragging
                          ? 'opacity-40 scale-95'
                          : 'hover:shadow-lg hover:scale-[1.01]'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2 leading-relaxed">{task.title}</h4>

                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium border border-slate-200 dark:border-slate-800">
                          {task.category}
                        </span>
                        {totalSubtasks > 0 && (
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium">
                            {completedSubtasks}/{totalSubtasks} Checklist
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
                        <div className="flex gap-1">
                          <button
                            onClick={() => onEdit(task)}
                            title="Edit task"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all duration-150"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDelete(task.id)}
                            title="Delete task"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-150"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() => moveTask(task.id, task.status, 'prev')}
                            disabled={col.id === 'todo'}
                            title="Move left"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 disabled:pointer-events-none transition-all duration-150"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveTask(task.id, task.status, 'next')}
                            disabled={col.id === 'done'}
                            title="Move right"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 disabled:pointer-events-none transition-all duration-150"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
