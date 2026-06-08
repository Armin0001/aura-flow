import React from 'react';
import { CheckCircle2, Circle, Clock, AlertTriangle, Layers, Percent, TrendingUp } from 'lucide-react';

export default function TodoStats({ todos }) {
  const total = todos.length;
  const completed = todos.filter((t) => t.status === 'done').length;
  const inProgress = todos.filter((t) => t.status === 'in_progress').length;
  const review = todos.filter((t) => t.status === 'review').length;
  const todoCount = todos.filter((t) => t.status === 'todo').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Priority counts
  const highPriority = todos.filter((t) => t.priority === 'high' && t.status !== 'done').length;
  const medPriority = todos.filter((t) => t.priority === 'medium' && t.status !== 'done').length;
  const lowPriority = todos.filter((t) => t.priority === 'low' && t.status !== 'done').length;

  // Category counts
  const categoryCounts = todos.reduce((acc, curr) => {
    if (curr.status !== 'done') {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
    }
    return acc;
  }, {});

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      {/* Completion Ring Widget */}
      <div className="bg-slate-200/50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700/50 backdrop-blur-xl rounded-3xl p-5 flex items-center justify-between shadow-xl">
        <div className="flex flex-col">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Progress</span>
          <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{completionRate}%</span>
          <span className="text-[10px] text-slate-500 mt-2 font-medium">
            {completed}/{total} Tasks Done
          </span>
        </div>
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              className="stroke-violet-500 transition-all duration-500"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 * (1 - completionRate / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
        </div>
      </div>

      {/* Task Status Overview */}
      <div className="bg-slate-200/50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700/50 backdrop-blur-xl rounded-3xl p-5 flex flex-col justify-between shadow-xl md:col-span-2">
        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 block">Task Status Summary</span>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-white dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">To Do</span>
            <span className="text-xl font-bold text-slate-800 dark:text-white">{todoCount}</span>
          </div>
          <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
            <span className="text-xs text-amber-600 dark:text-amber-400 block mb-1">Active</span>
            <span className="text-xl font-bold text-amber-700 dark:text-amber-300">{inProgress}</span>
          </div>
          <div className="bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/20">
            <span className="text-xs text-sky-600 dark:text-sky-400 block mb-1">Review</span>
            <span className="text-xl font-bold text-sky-700 dark:text-sky-300">{review}</span>
          </div>
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block mb-1">Done</span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{completed}</span>
          </div>
        </div>
      </div>

      {/* Active Workload info */}
      <div className="bg-slate-200/50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700/50 backdrop-blur-xl rounded-3xl p-5 flex flex-col justify-between shadow-xl">
        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Pending Priority</span>
        <div className="flex flex-col gap-2">
          {highPriority > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Urgent
              </span>
              <span className="text-slate-800 dark:text-white font-bold">{highPriority}</span>
            </div>
          )}
          {medPriority > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium
              </span>
              <span className="text-slate-800 dark:text-white font-bold">{medPriority}</span>
            </div>
          )}
          {lowPriority > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Low
              </span>
              <span className="text-slate-800 dark:text-white font-bold">{lowPriority}</span>
            </div>
          )}
          {highPriority === 0 && medPriority === 0 && lowPriority === 0 && (
            <span className="text-slate-400 dark:text-slate-500 italic text-xs text-center py-2">No active tasks</span>
          )}
        </div>
        {topCategory && (
          <div className="mt-2 pt-2 border-t border-slate-300 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            <span>Top Area:</span>
            <span className="text-violet-600 dark:text-violet-300 font-bold truncate max-w-[80px]">{topCategory[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
