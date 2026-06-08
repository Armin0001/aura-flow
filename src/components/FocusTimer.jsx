import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Timer, CheckCircle, Flame } from 'lucide-react';

export default function FocusTimer({ activeTask, onCompleteFocusSession }) {
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [streak, setStreak] = useState(0);
  
  const timerRef = useRef(null);

  const modeTimes = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const onCompleteRef = useRef(null);
  useEffect(() => {
    onCompleteRef.current = handleTimerComplete;
  });

  useEffect(() => {
    setTimeLeft(modeTimes[mode]);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    if (mode === 'work') {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (activeTask && onCompleteFocusSession) {
        onCompleteFocusSession(activeTask.id);
      }
      // Switch to break automatically
      setMode(nextStreak % 4 === 0 ? 'longBreak' : 'shortBreak');
    } else {
      setMode('work');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modeTimes[mode]);
  };

  const skipTimer = () => {
    setIsRunning(false);
    handleTimerComplete();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = modeTimes[mode];
  const progressPercentage = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-200/50 dark:bg-slate-900/40 p-6 backdrop-blur-xl border border-slate-300 dark:border-slate-700/50 shadow-2xl transition-all duration-300">
      {/* Background Glow */}
      <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${
        mode === 'work' ? 'bg-violet-500' : 'bg-emerald-500'
      }`} />

      <div className="flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Timer className="w-4 h-4 text-violet-500 dark:text-violet-400" />
          <span className="text-slate-700 dark:text-slate-400">Focus Space</span>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/85 rounded-xl border border-slate-200 dark:border-slate-700/40 mb-6 w-full max-w-xs justify-between">
          {[
            { id: 'work', label: 'Focus', color: 'text-violet-600 dark:text-violet-400 border-violet-500/20 bg-violet-500/10' },
            { id: 'shortBreak', label: 'Short Break', color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
            { id: 'longBreak', label: 'Long Break', color: 'text-sky-600 dark:text-sky-400 border-sky-500/20 bg-sky-500/10' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                mode === item.id 
                  ? `${item.color} shadow-sm border` 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Circular Timer Display */}
        <div className="relative flex items-center justify-center w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="96"
              cy="96"
              r="84"
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress Ring */}
            <circle
              cx="96"
              cy="96"
              r="84"
              className={`transition-all duration-300 ${
                mode === 'work' ? 'stroke-violet-500' : mode === 'shortBreak' ? 'stroke-emerald-500' : 'stroke-sky-500'
              }`}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 84}
              strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercentage / 100)}
              strokeLinecap="round"
            />
          </svg>

          {/* Time Text */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white font-mono">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-wider">
              {isRunning ? 'Productive Time' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={resetTimer}
            title="Reset Timer"
            className="p-3 bg-white hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleTimer}
            className={`p-4 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
              isRunning 
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/20' 
                : mode === 'work'
                  ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-950/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20'
            }`}
          >
            {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
          </button>

          <button
            onClick={skipTimer}
            title="Skip Session"
            className="p-3 bg-white hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Context / Linked Task */}
        {mode === 'work' && (
          <div className="w-full border-t border-slate-200 dark:border-slate-800/80 pt-4 flex flex-col items-center">
            {activeTask ? (
              <div className="text-center max-w-[240px]">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">CURRENTLY FOCUSING ON</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Flame className="w-4.5 h-4.5 text-orange-500 animate-pulse flex-shrink-0" />
                  <p className="text-sm font-semibold text-violet-700 dark:text-violet-200 truncate">{activeTask.title}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center">
                Select a task to focus on it
              </p>
            )}
          </div>
        )}

        {/* Streaks */}
        <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-500 font-medium">
          <Flame className="w-4 h-4 fill-amber-500/20" />
          <span>Streak: {streak} {streak === 1 ? 'session' : 'sessions'}</span>
        </div>
      </div>
    </div>
  );
}
