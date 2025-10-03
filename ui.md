---

# 🎨 UI & Theme Design Document  
_For Productivity Hub Prototype_  

---

## 🌗 Theme Philosophy  

The app should feel **clean, minimal, and focused**, with **two active modes**:  
- **Light Mode** → bright, airy, uplifting (good for daytime work).  
- **Dark Mode** → sleek, calming, focus-driven (good for late-night work).  

The UI should _not_ feel overwhelming — instead, it should guide the user to what matters **today**.  

---

## 🖌️ Core Principles  

1. **Minimal but beautiful** → Enough breathing room, *whitespace is as important as color*.  
2. **Focus-driven** → Subtle contrasts, highlight the “currently important” task/project.  
3. **Consistency** → Use the same spacing scale, same shadows, same font weights across pages.  
4. **Accessible** → Light/Dark modes with WCAG-compliant contrasts for readability.  

---

## 🌈 Color Palette  

**Light Mode**  
- Background: `#F9FAFB` (light gray, slightly off-white)  
- Surface / Cards: `#FFFFFF` (pure white with soft shadow)  
- Primary Text: `#111827` (slate black)  
- Secondary Text: `#6B7280` (cool gray)  
- Accent / Primary: `#3B82F6` (blue-500 Tailwind)  
- Done/Positive: `#10B981` (emerald-500)  
- Warning/Deadline: `#EF4444` (red-500)  

**Dark Mode**  
- Background: `#0F172A` (slate-900)  
- Surface / Cards: `#1E293B` (slate-800 with subtle shadow)  
- Primary Text: `#F1F5F9` (slate-100)  
- Secondary Text: `#94A3B8` (slate-400)  
- Accent / Primary: `#60A5FA` (blue-400)  
- Done/Positive: `#34D399` (emerald-400)  
- Warning/Deadline: `#F87171` (red-400)  

---

## 🔤 Typography  

- Font: **Inter** (modern, clean, widely used in productivity tools).  
- Sizes:  
  - Heading 1: `1.5rem` (bold, for section/page titles)  
  - Heading 2: `1.25rem` (medium, for card titles)  
  - Body text: `1rem` (normal, default text)  
  - Small text: `0.875rem` (secondary info, dates, metadata)  
- Font weights:  
  - Titles: `600` (semibold)  
  - Body: `400` (regular)  
  - Labels / Buttons: `500`  

---

## 📐 Layout & Components  

### **Sidebar**  
- Simple vertical nav with icons + text (Dashboard, Daily, Projects, Notes, Focus).  
- Collapsible on mobile.  
- Highlight active page with accent (blue).  

### **Main Content**  
- **Dashboard:** Grid of charts + task summary.  
- **Daily Tasks:** Checklist view (tasks with checkboxes, grouped as Daily vs Project).  
- **Projects:** Simple Kanban board (Backlog → In Progress → Done).  
- **Notes:** Editor with clean card layout.  
- **Focus Mode:** Centered task view with timer, minimal UI (just task title + buttons).  

---

## 🌙 Light/Dark Implementation  

Use **Tailwind’s dark mode** (`dark:` classes). Example:  

```tsx
<div className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
  <h1 className="text-xl font-semibold">Today’s Tasks</h1>
</div>
```

Dark mode toggle can live in the **top-right navbar**:  
- Toggle with `next-themes` package.  
- Sync with user device preference.  

---

## 🧩 Component Style Guide  

- **Buttons:**  
  - Primary: Blue background, white text  
  - Secondary: Gray outline, blend with mode  
  - Hover → subtle shadow + slightly stronger color  

- **Cards / Containers:**  
  - Rounded corners (`rounded-lg`)  
  - Light shadow in light mode (`shadow-sm`)  
  - Border instead of shadow in dark mode (`border border-slate-700`)  

- **Checkboxes (Tasks):**  
  - Custom with accent color when checked  
  - Strikethrough on completed task label  

- **Charts:**  
  - Use soft colors, not too flashy  
  - Support both light/dark themes  

---

## ✨ Final Feel  

- **Light Mode** → Fresh, motivating, modern workspace.  
- **Dark Mode** → Focused, minimal, distraction-free nighttime experience.  
- **Overall Aesthetic** → A blend of **Notion’s simplicity** + **Linear’s elegance** with enough personality to stand out.  

---