import { useState, useEffect } from 'react';
import {
  Plus, Search, ListTodo, LayoutGrid, Calendar, Sun, Moon,
  Download, Upload, Sparkles, Filter, ArrowUpDown, Trash2, CheckCircle2, X
} from 'lucide-react';
import FocusTimer from './components/FocusTimer';
import TodoStats from './components/TodoStats';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import { completeFocusSession, filterTodos, sortTodos, toggleSubtask } from './lib/tasks';

// Helper to format Date as YYYY-MM-DD
const formatDateOffset = (daysOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DEFAULT_TODOS = [
  {
    id: '1',
    title: 'Design app interface mockup',
    description: 'Review modern layout trends. Focus on vibrant colors, clean shapes, glassmorphic styling, and dark backgrounds.',
    category: 'Work',
    priority: 'high',
    dueDate: formatDateOffset(0), // Today
    status: 'in_progress',
    subtasks: [
      { id: '1-1', text: 'Select unified typography', completed: true },
      { id: '1-2', text: 'Assemble high-fidelity canvas', completed: false },
      { id: '1-3', text: 'Define color-scheme variables', completed: false }
    ],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: '2',
    title: 'Revise core React documentation',
    description: 'Revise hooks lifecycle, state hoisting strategies, and React v19 performance upgrades.',
    category: 'Study',
    priority: 'medium',
    dueDate: formatDateOffset(-1), // Yesterday (overdue)
    status: 'todo',
    subtasks: [
      { id: '2-1', text: 'Notes on useActionState', completed: false }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: '3',
    title: 'Weekly project update presentation',
    description: 'Present client-side deliverables and upcoming sprints roadmap to stakeholders.',
    category: 'Work',
    priority: 'high',
    dueDate: formatDateOffset(2), // In 2 days
    status: 'review',
    subtasks: [],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: '4',
    title: 'Gym - Leg day session',
    description: 'Squats, lunges, extensions, and core exercises.',
    category: 'Fitness',
    priority: 'low',
    dueDate: formatDateOffset(0), // Today
    status: 'done',
    subtasks: [],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: '5',
    title: 'Procure weekly grocery items',
    description: 'Fresh vegetables, milk, avocados, whole wheat bread, eggs.',
    category: 'Personal',
    priority: 'low',
    dueDate: formatDateOffset(1), // Tomorrow
    status: 'todo',
    subtasks: [
      { id: '5-1', text: 'Spinach and kale packs', completed: false },
      { id: '5-2', text: 'Greek yogurt cartons', completed: false }
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export default function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('ultra_todos');
    return saved ? JSON.parse(saved) : DEFAULT_TODOS;
  });

  const [activeView, setActiveView] = useState('list'); // 'list', 'kanban', 'calendar', 'analytics'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'todo', 'in_progress', 'review', 'done'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // 'dueDate', 'priority', 'title', 'createdAt'
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  
  const [selectedTodoIds, setSelectedTodoIds] = useState([]);
  const [activeFocusTask, setActiveFocusTask] = useState(null);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('ultra_todos', JSON.stringify(todos));
  }, [todos]);

  // Apply dark mode theme class and keep color-scheme meta in sync
  useEffect(() => {
    const root = window.document.documentElement;
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    if (theme === 'dark') {
      root.classList.add('dark');
      if (metaColorScheme) metaColorScheme.content = 'dark';
    } else {
      root.classList.remove('dark');
      if (metaColorScheme) metaColorScheme.content = 'light';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // List unique categories for filtering
  const categoriesList = ['all', ...new Set(todos.map((t) => t.category))];

  // Toggle light/dark
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Add / Edit submission
  const handleFormSubmit = (data) => {
    if (editingTodo) {
      // Edit
      setTodos(
        todos.map((t) => (t.id === editingTodo.id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t))
      );
      setEditingTodo(null);
    } else {
      // Add
      const newTodo = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setTodos([newTodo, ...todos]);
      setShowAddForm(false);
    }
  };

  // Toggle todo status
  const handleToggleStatus = (id, newStatus) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  // Toggle subtask completion
  const handleToggleSubtask = (todoId, subtaskId) => {
    setTodos(todos.map((todo) => (todo.id === todoId ? toggleSubtask(todo, subtaskId) : todo)));
  };

  // Focus Timer complete session callback (rules in lib/tasks.js)
  const handleCompleteFocusSession = (todoId) => {
    setTodos(todos.map((todo) => (todo.id === todoId ? completeFocusSession(todo) : todo)));
  };

  // Delete todo
  const handleDelete = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
    if (activeFocusTask && activeFocusTask.id === id) {
      setActiveFocusTask(null);
    }
    setSelectedTodoIds(selectedTodoIds.filter((selId) => selId !== id));
  };

  // Bulk Actions
  const handleSelectTodo = (id) => {
    if (selectedTodoIds.includes(id)) {
      setSelectedTodoIds(selectedTodoIds.filter((selId) => selId !== id));
    } else {
      setSelectedTodoIds([...selectedTodoIds, id]);
    }
  };

  const handleSelectAll = (filteredTodos) => {
    const filteredIds = filteredTodos.map((t) => t.id);
    const allSelected = filteredIds.every((id) => selectedTodoIds.includes(id));

    if (allSelected) {
      // Deselect all filtered
      setSelectedTodoIds(selectedTodoIds.filter((id) => !filteredIds.includes(id)));
    } else {
      // Select all filtered
      setSelectedTodoIds([...new Set([...selectedTodoIds, ...filteredIds])]);
    }
  };

  const handleBulkDelete = () => {
    setTodos(todos.filter((t) => !selectedTodoIds.includes(t.id)));
    setSelectedTodoIds([]);
  };

  const handleBulkComplete = () => {
    setTodos(
      todos.map((t) => (selectedTodoIds.includes(t.id) ? { ...t, status: 'done' } : t))
    );
    setSelectedTodoIds([]);
  };

  // Export data
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `focus_todos_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import data
  const handleImportData = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            setTodos([...parsed, ...todos]);
          } else {
            alert('Invalid backup file. Must be a JSON array of tasks.');
          }
        } catch {
          alert('Error reading file.');
        }
      };
    }
  };

  // Filter and Sort Tasks (rules in lib/tasks.js)
  const filteredTodos = sortTodos(
    filterTodos(todos, { query: searchQuery, status: filterStatus, category: filterCategory, priority: filterPriority }),
    sortBy
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500 font-sans selection:bg-violet-500/30 selection:text-violet-300 relative overflow-hidden pb-12">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] rounded-full bg-violet-300/20 dark:bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-300/20 dark:bg-emerald-950/15 blur-[120px] pointer-events-none" />

      {/* Main Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-900 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
                AURA <span className="text-[10px] bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-md text-violet-600 dark:text-violet-400 font-bold uppercase">v1.2</span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">FLOW & TASK ORGANIZER</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Backup Utility */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportData}
                title="Export Tasks (JSON)"
                className="p-2 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <label
                title="Import Tasks (JSON)"
                className="p-2 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>

            <span className="text-slate-300 dark:text-slate-800">|</span>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-8 relative z-10">
        
        {/* Statistics Dashboard */}
        <TodoStats todos={todos} />

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Workspace Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* View navigation & Add action bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-200/50 dark:bg-slate-900/30 border border-slate-300 dark:border-slate-800 p-3.5 rounded-3xl backdrop-blur-sm">
              
              {/* Views */}
              <div className="flex gap-1 p-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl w-fit">
                {[
                  { id: 'list', label: 'Tasks', icon: ListTodo },
                  { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
                  { id: 'calendar', label: 'Schedule', icon: Calendar },
                ].map((view) => {
                  const Icon = view.icon;
                  return (
                    <button
                      key={view.id}
                      onClick={() => setActiveView(view.id)}
                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                        activeView === view.id
                          ? 'bg-violet-600 text-white shadow-md'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      {view.label}
                    </button>
                  );
                })}
              </div>

              {/* Add task button */}
              {!showAddForm && !editingTodo && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-violet-950/20 transition-all duration-200 hover:scale-103 active:scale-97"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              )}
            </div>

            {/* Inline Add / Edit Forms */}
            {(showAddForm || editingTodo) && (
              <div className="animate-fadeIn">
                <TodoForm
                  key={editingTodo ? editingTodo.id : 'new'}
                  onSubmit={handleFormSubmit}
                  initialTodo={editingTodo}
                  onCancel={() => {
                    setShowAddForm(false);
                    setEditingTodo(null);
                  }}
                />
              </div>
            )}

            {/* Task list filter header */}
            {activeView === 'list' && (
              <div className="space-y-4 bg-slate-200/30 dark:bg-slate-900/10 border border-slate-300 dark:border-slate-800/50 p-4 rounded-3xl">
                
                {/* Search & Sort Row */}
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search tasks or descriptions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 focus:border-violet-500 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Sort Selector */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-2xl px-3 py-1.5">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none border-none cursor-pointer"
                      >
                        <option value="priority" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Sort: Priority</option>
                        <option value="dueDate" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Sort: Due Date</option>
                        <option value="title" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Sort: Name</option>
                        <option value="createdAt" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Sort: Newest</option>
                      </select>
                    </div>

                    {/* Filter Priority */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-2xl px-3 py-1.5">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="bg-transparent text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none border-none cursor-pointer"
                      >
                        <option value="all" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Priority: All</option>
                        <option value="high" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">High</option>
                        <option value="medium" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Medium</option>
                        <option value="low" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Low</option>
                      </select>
                    </div>

                    {/* Filter Category */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-2xl px-3 py-1.5">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-transparent text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none border-none cursor-pointer"
                      >
                        <option value="all" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Tag: All</option>
                        {categoriesList.filter(c => c !== 'all').map((cat) => (
                          <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status Tabs & Bulk Select Bar */}
                <div className="flex flex-wrap items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-3 gap-2">
                  <div className="flex gap-1">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'todo', label: 'To Do' },
                      { id: 'in_progress', label: 'Active' },
                      { id: 'review', label: 'Review' },
                      { id: 'done', label: 'Completed' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                          filterStatus === tab.id
                            ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {filteredTodos.length > 0 && (
                    <button
                      onClick={() => handleSelectAll(filteredTodos)}
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                      {filteredTodos.every(t => selectedTodoIds.includes(t.id)) 
                        ? 'Deselect All' 
                        : 'Select All Listed'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* View renders */}
            <div className="space-y-4">
              {activeView === 'list' && (
                <>
                  {filteredTodos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800/80 rounded-3xl">
                      <ListTodo className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-3 animate-pulse" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No tasks match the filters</p>
                      <p className="text-xs text-slate-500 mt-1">Try resetting search criteria or create a new task</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredTodos.map((todo) => (
                        <div key={todo.id} className="flex items-center gap-3">
                          {/* Bulk Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedTodoIds.includes(todo.id)}
                            onChange={() => handleSelectTodo(todo.id)}
                            className="rounded border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-violet-600 focus:ring-violet-500/30 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-950"
                          />
                          <div className="flex-1">
                            <TodoItem
                              todo={todo}
                              onToggleStatus={handleToggleStatus}
                              onDelete={handleDelete}
                              onEdit={(t) => {
                                setEditingTodo(t);
                                setShowAddForm(false);
                                window.scrollTo({ top: 180, behavior: 'smooth' });
                              }}
                              onToggleSubtask={handleToggleSubtask}
                              onSelectFocusTask={setActiveFocusTask}
                              isFocused={activeFocusTask?.id === todo.id}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeView === 'kanban' && (
                <KanbanBoard
                  todos={filteredTodos}
                  onToggleStatus={handleToggleStatus}
                  onEdit={(t) => {
                    setEditingTodo(t);
                    setShowAddForm(false);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  onDelete={handleDelete}
                />
              )}

              {activeView === 'calendar' && (
                <CalendarView
                  todos={filteredTodos}
                  onEdit={(t) => {
                    setEditingTodo(t);
                    setShowAddForm(false);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                />
              )}
            </div>

            {/* Bulk Selection Drawer */}
            {selectedTodoIds.length > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/60 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-md flex items-center gap-4 animate-slideUp">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {selectedTodoIds.length} Selected
                </span>
                <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800" />
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkComplete}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedTodoIds([])}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pomodoro Timer & Details Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            <FocusTimer
              activeTask={activeFocusTask}
              onCompleteFocusSession={handleCompleteFocusSession}
            />

            {/* Info and Shortcuts Guide */}
            <div className="bg-slate-200/40 dark:bg-slate-900/20 border border-slate-300 dark:border-slate-800 p-5 rounded-3xl backdrop-blur-sm">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">Productivity Guide</h4>
              <ul className="space-y-2.5 text-[11px] text-slate-600 dark:text-slate-400 leading-normal font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                  <span>Use the <strong className="text-slate-800 dark:text-slate-300">Flame button</strong> on a task to link it to the Focus timer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                  <span>A Focus session is <strong className="text-slate-800 dark:text-slate-300">25 minutes</strong>. Finishing completes the task's first checklist item automatically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                  <span>Tasks are prioritized visually and due dates show overdue flags to keep you on schedule.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                  <span>Utilize backup export/import (JSON) to save and load your workload database on other runtimes.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
