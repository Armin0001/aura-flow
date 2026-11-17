import { useState } from 'react';
import {
  CheckCircle2, Circle, Calendar, Trash2, Edit2, ChevronDown, ChevronUp,
  Flame, CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { dueDateBadge } from '../lib/dates';

const DUE_TONE_CLASSES = {
  overdue: 'text-rose-400 bg-rose-500/10 border border-rose-500/20',
  today: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
  tomorrow: 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20',
  later: 'text-slate-400 bg-slate-800/40 border border-slate-700/20',
};

export default function TodoItem({ 
  todo, 
  onToggleStatus, 
  onDelete, 
  onEdit, 
  onToggleSubtask, 
  onSelectFocusTask, 
  isFocused 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedSubtasks = todo.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;

  const handleMainToggle = () => {
    const nextStatus = todo.status === 'done' ? 'todo' : 'done';
    
    // Confetti effect on completion
    if (nextStatus === 'done') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#a78bfa', '#818cf8', '#34d399', '#f472b6']
      });
    }
    
    onToggleStatus(todo.id, nextStatus);
  };

  const handleSubtaskToggle = (subtaskId) => {
    onToggleSubtask(todo.id, subtaskId);
    
    // Trigger confetti if all subtasks are finished
    if (todo.subtasks) {
      const nextCompleted = todo.subtasks.map(s => 
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      );
      const allDone = nextCompleted.every(s => s.completed);
      const previouslyDone = todo.subtasks.every(s => s.completed);
      if (allDone && !previouslyDone && todo.status !== 'done') {
        confetti({
          particleCount: 50,
          spread: 45,
          colors: ['#34d399', '#6ee7b7', '#f472b6']
        });
      }
    }
  };

  // Due date badge (rules and the local-date parsing live in lib/dates.js)
  const getDueDateLabel = () => {
    const badge = dueDateBadge(todo.dueDate);
    return badge && { label: badge.label, colorClass: DUE_TONE_CLASSES[badge.tone] };
  };

  const dueLabel = getDueDateLabel();

  // Priority Styles
  const getPriorityStyle = () => {
    switch (todo.priority) {
      case 'high':
        return { 
          cardBorder: 'border-l-4 border-l-rose-500', 
          badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
        };
      case 'medium':
        return { 
          cardBorder: 'border-l-4 border-l-amber-500', 
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
        };
      default:
        return { 
          cardBorder: 'border-l-4 border-l-slate-500', 
          badge: 'bg-slate-800/50 text-slate-400 border border-slate-700/40' 
        };
    }
  };

  const priorityStyle = getPriorityStyle();

  const getStatusBadge = () => {
    switch (todo.status) {
      case 'in_progress':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full';
      case 'review':
        return 'bg-sky-500/15 text-sky-400 border border-sky-500/25 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full';
      case 'done':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700/40 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full';
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-slate-900/30 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
        priorityStyle.cardBorder
      } ${todo.status === 'done' ? 'opacity-60' : ''} ${isFocused ? 'ring-2 ring-violet-500/50 bg-slate-100/50 dark:bg-slate-900/55' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Checkbox and Text */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button 
            onClick={handleMainToggle}
            className="text-slate-400 hover:text-violet-500 dark:text-slate-500 dark:hover:text-violet-400 transition-colors flex-shrink-0"
          >
            {todo.status === 'done' ? (
              <CheckCircle2 className="w-6 h-6 text-violet-500 dark:text-violet-400 fill-violet-500/10" />
            ) : (
              <Circle className="w-6 h-6 hover:scale-105 transition-transform" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <h4 
              className={`text-sm font-bold text-slate-800 dark:text-white truncate ${
                todo.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }`}
            >
              {todo.title}
            </h4>
            
            {/* Tag details */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-lg">
                {todo.category}
              </span>
              
              {dueLabel && (
                <span className={`text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 ${dueLabel.colorClass}`}>
                  <Calendar className="w-3 h-3" />
                  {dueLabel.label}
                </span>
              )}

              {totalSubtasks > 0 && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" />
                  {completedSubtasks}/{totalSubtasks} Checklist
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {todo.status !== 'done' && (
            <button
              onClick={() => onSelectFocusTask(todo)}
              title={isFocused ? "Focused Task" : "Focus on this Task"}
              className={`p-1.5 rounded-xl border transition-all duration-200 ${
                isFocused 
                  ? 'bg-violet-600/20 border-violet-500/50 text-violet-500 dark:text-violet-400' 
                  : 'bg-white hover:bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/20 hover:border-violet-500/30 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400'
              }`}
            >
              <Flame className={`w-4 h-4 ${isFocused ? 'animate-pulse fill-violet-500/20' : ''}`} />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-4 animate-fadeIn">
          {todo.description && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{todo.description}</p>
            </div>
          )}

          {/* Subtask list */}
          {totalSubtasks > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Checklist</p>
              <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
                {todo.subtasks.map((subtask) => (
                  <label 
                    key={subtask.id}
                    className="flex items-center gap-2.5 cursor-pointer select-none group text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleSubtaskToggle(subtask.id)}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-violet-600 focus:ring-violet-500/30 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
                    />
                    <span className={subtask.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                      {subtask.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            {/* Status Flow Actions */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Status:</span>
              <span className={getStatusBadge()}>{todo.status.replace('_', ' ')}</span>
              {todo.status !== 'done' && (
                <div className="flex gap-1 ml-1.5">
                  {todo.status !== 'in_progress' && (
                    <button
                      onClick={() => onToggleStatus(todo.id, 'in_progress')}
                      className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md text-[10px] font-semibold transition-colors"
                    >
                      Start
                    </button>
                  )}
                  {todo.status !== 'review' && (
                    <button
                      onClick={() => onToggleStatus(todo.id, 'review')}
                      className="px-2 py-0.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 rounded-md text-[10px] font-semibold transition-colors"
                    >
                      Review
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Edit / Delete */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(todo)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700/30 text-xs font-semibold transition-all duration-200"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs font-semibold transition-all duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
