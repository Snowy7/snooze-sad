---

# Productivity Hub Prototype

**All-in-one productivity and project management platform** designed to unify personal daily routines, team projects, focus workflows, and analytics into a single streamlined interface. The platform helps individuals and teams stay organized, manage priorities, track time, and gain actionable insights into their productivity.

---

## 🌟 Project Overview

The system combines **two layers of task management**:

1. **Daily Tasks**

   * Simple, repeatable tasks for personal routines and habits (e.g., “Exercise”, “Check Emails”).
   * Configurable repeat rules: daily, weekly, or custom.
   * Provides a “what to do today” view to support focus and consistency.

2. **Project Tasks**

   * Structured tasks organized within projects.
   * Each task has a start and end date; tasks automatically appear in the Daily view if today falls within their timeline.
   * Supports statuses, priorities, and assignment to project members.
   * Helps teams track milestones and deadlines in a clear workflow.

The **Daily View** intelligently merges general daily routines and active project tasks, giving users a **single focused dashboard** for the day.

---

## 🚀 Features

### ✅ Daily Tasks

* Repeatable general tasks and one-off tasks.
* Customizable repetition (daily, weekly, specific days).
* Automatically includes project tasks active for the current day.

### 📂 Project Management

* Kanban-style boards (Backlog → In Progress → Done).
* Task metadata: start/end dates, assignees, estimated vs. tracked hours, status.
* Project members for collaboration.

### 🕑 Timers & Time Tracking

* Task-based timers to log work duration.
* Actual time tracked vs. estimated time.
* Enables focus sessions and productivity tracking.

### 📝 Notes

* Markdown or rich-text editor.
* Notes can be linked to projects or standalone.
* Pin important notes to the dashboard for quick access.

### 🎯 Focus Mode

* Single-task, distraction-free view.
* Shows current task, subtasks, and timer.
* Supports Pomodoro-style work cycles.

### 📅 Schedule & Calendar Views

* Daily, weekly, and monthly views.
* Tasks with start/end dates appear as timeline blocks.
* Integrated with timers to visualize active tasks in context.

### 📊 Analytics & Dashboard

* Visual charts showing:

  * Task completion trends (daily/weekly).
  * Time spent per project or per user.
  * Habit streaks for daily routines.
* Provides actionable insights for improving productivity.

---

## 🖼️ User & Project Interaction

* **Users** can manage personal routines and participate in projects.
* **Projects** have members, tasks, deadlines, and progress tracking.
* **Daily View** merges general tasks and active project tasks dynamically.
* **Focus Mode** and timers allow users to work intentionally, while analytics help them measure performance over time.

---

## 📁 Data Concept (Simplified)

```json
{
  "users": [{ "id": "u1", "name": "Alice" }, { "id": "u2", "name": "Bob" }],
  "projects": [
    {
      "id": "p1",
      "name": "Website Redesign",
      "members": ["u1", "u2"],
      "tasks": [
        {
          "id": "p1t1",
          "title": "Create wireframes",
          "status": "in-progress",
          "startDate": "2025-10-01",
          "endDate": "2025-10-05",
          "assignees": ["u1"],
          "estimatedHours": 4,
          "trackedHours": 2.5,
          "timerActive": false
        }
      ]
    }
  ],
  "dailyTasks": [
    {
      "id": "d1",
      "title": "Morning Exercise",
      "repeat": { "frequency": "daily" },
      "isDone": false,
      "date": "2025-10-03"
    }
  ],
  "notes": [
    { "id": "n1", "title": "Meeting notes", "content": "Some **markdown** text", "linkedProjectId": "p1" }
  ],
  "timelogs": [
    {
      "taskId": "p1t1",
      "userId": "u1",
      "start": "2025-10-03T10:00:00Z",
      "end": "2025-10-03T12:30:00Z",
      "duration": 2.5
    }
  ]
}
```

---

## 🧭 Navigation & UI

**Sidebar**

* Dashboard
* Daily Tasks
* Projects
* Calendar
* Notes
* Analytics
* Focus Mode

**Main Content**

* **Dashboard:** charts, task overview, and progress metrics.
* **Daily Tasks:** general + project tasks for today.
* **Projects:** Kanban boards, member assignment, and task timelines.
* **Calendar:** timeline view of tasks with integration to timers.
* **Notes:** markdown editor, project-linked notes, pinned notes.
* **Analytics:** charts visualizing productivity trends.
* **Focus Mode:** distraction-free single-task view with timer.

---

## 🎯 Goal

The goal of this project is to **unify personal productivity and team project management** in a single, modular system. Users can track daily habits, manage projects, focus on tasks, and analyze productivity trends — all from one centralized hub.

---