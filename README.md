# Aura — Flow & Task Organizer

A feature-rich task management app built with React 19 and Tailwind CSS v4. Manage your work across a list view, Kanban board, and calendar, with a built-in Pomodoro focus timer.

> **Add a screenshot here** — `![App screenshot](screenshot.png)`

---

## Features

### Task Management
- **Four status stages** — To Do → In Progress → Review → Done
- **Priority levels** — High, Medium, Low with color-coded borders
- **Due dates** with overdue / due-today / upcoming badges
- **Subtasks / checklists** per task with progress tracking
- **Categories / tags** — built-in and custom
- Confetti burst when you mark a task complete 🎉

### Views
| View | Description |
|------|-------------|
| **List** | Filterable, sortable task feed with bulk selection |
| **Kanban** | Board with arrow controls to move cards between columns |
| **Calendar** | Monthly calendar with per-day task snippets |

### Focus Timer
- 25 / 5 / 15 minute Pomodoro cycles (Focus → Short Break → Long Break)
- Link any task to the active timer
- Auto-advances to the next break when a session ends
- Completing a session ticks off the task's first incomplete subtask
- Streak counter across sessions

### Productivity Dashboard
- Live completion rate ring
- Status breakdown (To Do / Active / Review / Done counts)
- Pending priority summary
- Top active category

### Other
- **Dark & light mode** toggle with no flash on load
- **Export / Import** tasks as JSON for backup or migration
- **Bulk actions** — complete or delete multiple tasks at once
- All data persisted in `localStorage` — no account needed

---

## Tech Stack

| | |
|---|---|
| Framework | [React 19](https://react.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Build tool | [Vite 8](https://vite.dev) |
| Icons | [Lucide React](https://lucide.dev) |
| Confetti | [canvas-confetti](https://github.com/catdad/canvas-confetti) |
| Font | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Clone the repo
git clone https://github.com/your-username/aura-todo.git
cd aura-todo

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other commands

```bash
npm run build    # Production build → dist/
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

---

## Project Structure

```
src/
├── App.jsx                  # Root component — state, filtering, routing between views
├── main.jsx                 # React entry point
├── index.css                # Tailwind imports + global styles
└── components/
    ├── TodoItem.jsx          # Single task card (expand, subtasks, status controls)
    ├── TodoForm.jsx          # Add / edit task form
    ├── TodoStats.jsx         # Dashboard stats row
    ├── FocusTimer.jsx        # Pomodoro timer widget
    ├── KanbanBoard.jsx       # Kanban column view
    └── CalendarView.jsx      # Monthly calendar view
```

---

## License

MIT
