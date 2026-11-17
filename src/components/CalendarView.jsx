import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { buildMonthGrid, toLocalDateString } from '../lib/dates';

export default function CalendarView({ todos, onEdit }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getLocalDateString = toLocalDateString;

  // Blank cells up to the first weekday, then one Date per day (tested in lib/dates.test.js).
  const calendarDays = buildMonthGrid(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getTodosForDate = (date) => {
    if (!date) return [];
    const dateStr = getLocalDateString(date);
    return todos.filter((todo) => todo.dueDate === dateStr);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return getLocalDateString(date) === getLocalDateString(today);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-rose-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl rounded-3xl p-6 shadow-xl w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-500 dark:text-violet-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {monthNames[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {weekDays.map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square bg-transparent rounded-2xl" />;
          }

          const dayTodos = getTodosForDate(date);
          const activeTodos = dayTodos.filter((t) => t.status !== 'done');
          const dayNum = date.getDate();
          const todayCheck = isToday(date);

          return (
            <div
              key={`day-${dayNum}`}
              className={`aspect-square p-2 rounded-2xl border transition-all duration-200 flex flex-col justify-between group min-h-[70px] ${
                todayCheck
                  ? 'bg-violet-50 dark:bg-violet-950/20 border-violet-400 dark:border-violet-500/40 text-violet-700 dark:text-violet-300'
                  : 'bg-white dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${todayCheck ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}>
                  {dayNum}
                </span>
                {activeTodos.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                )}
              </div>

              {/* Tasks List snippet */}
              <div className="flex-1 mt-1 overflow-y-auto space-y-1 max-h-[48px] custom-scrollbar scrollbar-thin">
                {dayTodos.map((todo) => (
                  <button
                    key={todo.id}
                    onClick={() => onEdit(todo)}
                    className="w-full text-left truncate text-[9px] px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                    title={todo.title}
                  >
                    <span className={`w-1 h-1 rounded-full ${getPriorityColor(todo.priority)} flex-shrink-0`} />
                    <span className={todo.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                      {todo.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
