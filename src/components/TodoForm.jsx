import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, Flag, Tag, CheckSquare, Layers } from 'lucide-react';

const CATEGORIES = ['Work', 'Personal', 'Study', 'Fitness', 'Shopping', 'Finance'];

export default function TodoForm({ onSubmit, initialTodo = null, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  useEffect(() => {
    if (initialTodo) {
      setTitle(initialTodo.title || '');
      setDescription(initialTodo.description || '');
      if (CATEGORIES.includes(initialTodo.category)) {
        setCategory(initialTodo.category);
        setShowCustomCat(false);
      } else {
        setCategory('Custom');
        setCustomCategory(initialTodo.category || '');
        setShowCustomCat(true);
      }
      setPriority(initialTodo.priority || 'medium');
      setDueDate(initialTodo.dueDate || '');
      setSubtasks(initialTodo.subtasks || []);
    }
  }, [initialTodo]);

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: Date.now().toString(), text: subtaskInput.trim(), completed: false }
    ]);
    setSubtaskInput('');
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter((sub) => sub.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;

    const todoData = {
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      priority,
      dueDate,
      subtasks,
      status: initialTodo ? initialTodo.status : 'todo',
    };

    onSubmit(todoData);
    
    // Reset form
    if (!initialTodo) {
      setTitle('');
      setDescription('');
      setCategory('Work');
      setCustomCategory('');
      setShowCustomCat(false);
      setPriority('medium');
      setDueDate('');
      setSubtasks([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-slate-200/60 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-300 dark:border-slate-700/50 backdrop-blur-xl shadow-2xl relative">
      <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800/80 pb-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {initialTodo ? 'Edit Task' : 'Create New Task'}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Task Name *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design app interface"
            className="w-full bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/40 focus:border-violet-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter details or notes..."
            rows={2}
            className="w-full bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/40 focus:border-violet-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 resize-none"
          />
        </div>

        {/* Priority & Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-slate-400" />
              Priority
            </label>
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/45 rounded-xl border border-slate-300 dark:border-slate-700/30">
              {[
                { id: 'low', label: 'Low', color: 'text-slate-500 dark:text-slate-400 border-slate-700/20 bg-slate-700/10' },
                { id: 'medium', label: 'Medium', color: 'text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/10' },
                { id: 'high', label: 'High', color: 'text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/10' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPriority(item.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    priority === item.id 
                      ? `${item.color} shadow-sm border` 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/40 focus:border-violet-500 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Category Tag
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setShowCustomCat(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                  category === cat && !showCustomCat
                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-600 dark:text-violet-300'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/30 border-slate-300 dark:border-slate-700/40 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setCategory('Custom');
                setShowCustomCat(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                showCustomCat
                  ? 'bg-violet-600/20 border-violet-500/50 text-violet-600 dark:text-violet-300'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/30 border-slate-300 dark:border-slate-700/40 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              + Custom
            </button>
          </div>
          
          {showCustomCat && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter custom tag..."
              className="w-full bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/40 focus:border-violet-500 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 animate-fadeIn"
            />
          )}
        </div>

        {/* Subtasks Builder */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
            Subtasks / Checklist
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              placeholder="Add checklist item..."
              className="flex-1 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/40 focus:border-violet-500 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(e)}
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700/40 hover:border-slate-400 dark:hover:border-slate-600 px-3.5 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
          </div>

          {subtasks.length > 0 && (
            <div className="bg-slate-100/50 dark:bg-slate-800/30 border border-slate-300 dark:border-slate-800/80 rounded-xl p-2.5 space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between bg-white dark:bg-slate-800/30 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/20 hover:border-slate-300 dark:hover:border-slate-700/40 group"
                >
                  <span className="text-xs text-slate-700 dark:text-slate-300 truncate pr-2">{sub.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition-colors opacity-60 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-300 dark:border-slate-800/85">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700/40 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-950/20 transition-all duration-200 hover:scale-102 active:scale-98"
        >
          {initialTodo ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
