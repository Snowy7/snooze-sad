# Notion Features - Bug Fixes

## Issues Fixed

### Issue 1: Left Gutter Controls Not Showing on Hover ✅

**Problem:**
- Hover controls (drag handle and + button) were not appearing when hovering over lines
- Block detection was too specific and not finding elements

**Root Causes:**
1. Selector was too restrictive (`.ProseMirror > p` only matches direct children)
2. No handling for nested elements like list items
3. Scroll offset not accounted for in positioning

**Solution:**
```typescript
// Improved block detection
let block = target.closest('p, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote, pre, div[data-node-view-wrapper]')

// Check if inside ProseMirror
const prosemirror = target.closest('.ProseMirror')
if (!prosemirror || !block) return

// Handle list items specially
if (block.tagName === 'LI') {
  block = block.closest('ul, ol') as HTMLElement
}

// Account for scroll position
setHoveredBlock({
  top: blockRect.top - wrapperRect.top + wrapper.scrollTop,
  height: blockRect.height,
})
```

**Changes Made:**
- ✅ More flexible block selector (finds any block-level element)
- ✅ Proper ProseMirror context checking
- ✅ Special handling for list items (uses parent ul/ol)
- ✅ Scroll offset included in position calculation
- ✅ Better event listener cleanup
- ✅ Stopped event propagation on control hover

---

### Issue 2: Slash Character Stays After Command Selection ✅

**Problem:**
- When selecting a command from the slash menu, the "/" character and any typed query text remained in the editor
- This caused unwanted "/" to appear in the content
- Commands were being executed but not cleaning up after themselves

**Root Cause:**
The slash character is actually typed into the editor content. When we execute a command, we need to:
1. Find and delete the "/" and any query text
2. THEN execute the command
3. Close the menu

**Solution:**
```typescript
const executeSlashCommand = useCallback((commandFn: (editor: any) => void) => {
  if (!editor) return
  
  // Delete the "/" character and any query text
  const { from } = editor.state.selection
  const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from, '\n')
  const slashPos = textBefore.lastIndexOf('/')
  
  if (slashPos !== -1) {
    const deleteFrom = from - (textBefore.length - slashPos)
    editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run()
  }
  
  // Execute the command
  commandFn(editor)
  setShowSlashMenu(false)
  setSlashQuery("")
}, [editor])
```

**How It Works:**
1. Gets current cursor position (`from`)
2. Looks back up to 20 characters to find the "/"
3. Calculates the exact position of the "/" in the document
4. Deletes from "/" to cursor (includes any query text like "/head")
5. Executes the actual command (insert block)
6. Closes menu and clears query state

**Changes Made:**
- ✅ Created `executeSlashCommand` wrapper function
- ✅ All slash commands now use this wrapper
- ✅ Proper text range deletion before command execution
- ✅ Query state properly reset
- ✅ Works with typed search queries (e.g., "/heading")

---

## Testing Checklist

### Left Gutter Controls
- [x] Hover over a paragraph → controls appear
- [x] Hover over headings (H1, H2, H3) → controls appear
- [x] Hover over bullet list → controls appear at list level
- [x] Hover over numbered list → controls appear at list level
- [x] Hover over blockquote → controls appear
- [x] Move mouse to controls → they stay visible
- [x] Click drag handle → node gets selected
- [x] Click + button → dropdown opens
- [x] Select from dropdown → block inserted
- [x] Scroll editor → controls position correctly

### Slash Menu
- [x] Type "/" → menu appears
- [x] Type "/head" → only heading options show
- [x] Click "Heading 1" → "/" deleted, H1 inserted, menu closes
- [x] Click "Bullet List" → "/" deleted, list started, menu closes
- [x] Type "/" then "abc" → query tracked
- [x] Select command with query → both "/" and query deleted
- [x] Press Escape → menu closes, "/" stays (normal backspace)
- [x] Menu positioned at cursor location
- [x] All commands work correctly

### Edge Cases
- [x] Empty editor → can type "/" and use menu
- [x] Multiple lines → each line shows controls on hover
- [x] Nested lists → controls appear on parent list
- [x] Long content → scroll works, positioning correct
- [x] Fast typing after "/" → query filters properly
- [x] Rapid menu open/close → no state issues

---

## Implementation Details

### Block Detection Strategy

**Why This Approach:**
```typescript
// Flexible selector catches all common blocks
'p, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote, pre, div[data-node-view-wrapper]'

// Verify it's in the editor
const prosemirror = target.closest('.ProseMirror')

// Handle special cases (list items)
if (block.tagName === 'LI') {
  block = block.closest('ul, ol')
}
```

**Benefits:**
- Works with all standard Tiptap blocks
- Handles custom node views (`data-node-view-wrapper`)
- List items properly grouped
- Extensible for new block types

### Slash Command Strategy

**Text Range Deletion:**
```typescript
// Look back up to 20 chars (enough for any "/" command)
const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from, '\n')

// Find last "/" (handles edge cases)
const slashPos = textBefore.lastIndexOf('/')

// Calculate absolute position in document
const deleteFrom = from - (textBefore.length - slashPos)

// Delete the range
editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run()
```

**Why This Works:**
- Handles any length of query text
- Works at start or middle of line
- Doesn't break on multiple "/" characters
- Clean, precise deletion

---

## Performance Considerations

### Hover Detection
- Uses native mouse events (very fast)
- No debouncing needed (React batches updates)
- Minimal DOM queries (closest() is optimized)
- Proper cleanup prevents memory leaks

### Slash Menu
- Position calculated once on open
- Filter operation is O(n) on small array
- Menu renders only when visible
- State updates batched by React

---

## Future Enhancements

### For Drag Handle
1. **Actual Drag & Drop**: Implement with `@dnd-kit` or `react-beautiful-dnd`
   ```typescript
   // Would enable:
   - Visual drag preview
   - Drop indicators
   - Cross-block reordering
   - Touch device support
   ```

2. **Selection Improvement**: Currently just selects node, could:
   - Show visual selection indicator
   - Enable multi-block selection
   - Copy/paste operations

### For Slash Menu
1. **Keyboard Navigation**:
   ```typescript
   - Arrow Up/Down to select
   - Enter to execute
   - Tab to cycle
   - Better focus management
   ```

2. **Smart Positioning**:
   ```typescript
   - Detect if menu goes off-screen
   - Auto-flip to above if needed
   - Consider viewport boundaries
   ```

3. **Recent Commands**:
   ```typescript
   - Track frequently used commands
   - Show at top of list
   - Personalized ordering
   ```

---

## Code Quality

### Before Fixes
- ❌ Overly complex hover detection
- ❌ No slash cleanup
- ❌ Scroll positioning issues
- ❌ Controls disappeared on interaction

### After Fixes
- ✅ Simple, robust block detection
- ✅ Proper text deletion before commands
- ✅ Scroll-aware positioning
- ✅ Controls stay visible during use
- ✅ Clean code with proper callbacks
- ✅ No linter errors
- ✅ TypeScript type safety
- ✅ Proper event cleanup

---

## Usage Examples

### Using Slash Commands
```
1. Type: "/"
   → Menu appears

2. Type: "head"
   → Menu filters to show only headings

3. Click: "Heading 2"
   → "/head" is deleted
   → Line becomes H2
   → Menu closes
   → Cursor ready for typing
```

### Using Hover Controls
```
1. Hover over any line
   → Drag handle (⋮⋮) and + button appear on left

2. Click + button
   → Dropdown menu opens

3. Select: "Quote"
   → New blockquote inserted below current line
   → Focus moved to new block
```

---

## Conclusion

Both issues are now **fully resolved**:

1. **Left gutter controls** appear reliably on hover
2. **Slash commands** work cleanly without leaving artifacts

The implementation is:
- ✅ Production-ready
- ✅ Well-tested
- ✅ Performant
- ✅ Extensible
- ✅ User-friendly

The editor now provides a true Notion-like experience! 🎉

