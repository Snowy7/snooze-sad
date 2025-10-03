# 🎯 Spotlight Onboarding Guide

## Overview

The new spotlight-style onboarding provides an interactive, guided tour of Snooze with a dark overlay and spotlights highlighting specific UI elements.

## Features

### 🎬 **Spotlight Effect**
- **Dark Overlay**: 80% black backdrop with blur for focus
- **Blue Ring Highlight**: 4px blue ring around the target element
- **Smooth Transitions**: All animations are 300ms for smooth UX
- **Click-to-Dismiss**: Click anywhere on the dark overlay to skip

### 📍 **Tour Steps**

1. **Welcome** (center screen)
   - Introduction to Snooze
   - Overview of what to expect

2. **Sidebar Navigation** (highlight sidebar)
   - Shows where all main features are located
   - Dashboard, Tasks, Projects, Habits, etc.

3. **Command Menu** (highlight search bar)
   - Explains Cmd/Ctrl + K shortcut
   - Power user feature introduction

4. **Quick Actions** (highlight action buttons)
   - Focus Session, Daily Tasks, New Note buttons
   - Fast access to common actions

5. **Statistics Cards** (highlight stats grid)
   - Progress tracking overview
   - Completion rates and active projects

### 🎨 **Visual Design**

- **Progress Indicators**: 
  - Blue (current step)
  - Green (completed steps)
  - Gray (upcoming steps)
- **Animated Tooltip**: Fades in from bottom
- **Step Counter**: "X of Y" at the bottom
- **Navigation Buttons**: Back/Next with icons

### 💾 **Persistence**

- **localStorage Keys**:
  - `spotlight_onboarding_completed`: Set when tour is finished
  - `onboarding_dismissed`: Set when user skips the tour
- **Auto-trigger**: Shows automatically on first visit
- **500ms Delay**: Waits for page to fully render before starting

## Testing

### To Test the Onboarding:

```javascript
// In browser console:
localStorage.removeItem('spotlight_onboarding_completed')
localStorage.removeItem('onboarding_dismissed')
location.reload()
```

### To Skip Permanently:

```javascript
localStorage.setItem('spotlight_onboarding_completed', 'true')
```

### To Reset Everything:

```javascript
localStorage.clear()
location.reload()
```

## Technical Details

### Data Attributes

The onboarding targets elements using `data-onboarding` attributes:

- `data-onboarding="sidebar"` - Sidebar navigation
- `data-onboarding="search"` - Command menu search bar
- `data-onboarding="quick-actions"` - Quick action buttons
- `data-onboarding="stats"` - Statistics cards grid

### Position Calculation

The tooltip automatically positions itself relative to the highlighted element:
- **Bottom**: Below the element (default for horizontal elements)
- **Right**: To the right of the element (for sidebar)
- **Top**: Above the element
- **Left**: To the left of the element

### Z-Index

The onboarding overlay uses `z-index: 9999` to ensure it appears above all other content.

## User Experience

### Navigation

- **Next Button**: Advances to the next step
- **Back Button**: Returns to the previous step (hidden on first step)
- **X Button**: Closes and dismisses the tour
- **Click Overlay**: Alternative way to dismiss
- **Finish Button**: Completes the tour on the last step

### Accessibility

- Clear visual hierarchy
- Large touch targets for mobile
- Keyboard-accessible buttons
- Screen reader friendly (can be enhanced further)

## Future Enhancements

Potential improvements:
- Add "Don't show again" checkbox
- Track which steps users skip most often
- Add more granular steps for complex features
- Allow users to replay the tour from settings
- Add keyboard navigation (Arrow keys, Escape)

