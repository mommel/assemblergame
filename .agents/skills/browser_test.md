---
name: browser_test
description: Skill for testing web applications in the browser, capturing screenshots, and checking for console errors using the browser subagent.
---

# Browser Test Skill

Use this skill when you need to visually verify a web application in the browser, check for console errors, or take screenshots.

## When to Use
- After making code changes to a web application
- When verifying that visual changes look correct
- When checking for JavaScript errors in the browser console
- When taking screenshot proof of completed work

## Prerequisites
1. The dev server must be running (typically `npm run dev`)
2. Know the URL (usually `http://localhost:5173` for Vite)

## How to Use with browser_subagent

### Task Template for Browser Testing

```
Task: Open the browser at http://localhost:5173 and:
1. Wait for the page to fully load (2-3 seconds)
2. Take a screenshot of the full page
3. Open the browser developer tools console (F12)
4. Check if there are any errors in the console
5. Report:
   - What you see on screen (description)
   - List of any console errors (or "No errors")
   - The screenshot

Return when: you have captured a screenshot and checked the console.
```

### Task Template for Visual Verification

```
Task: Open the browser at http://localhost:5173 and verify:
1. [Specific visual element to check]
2. [Another element to check]
3. Take a screenshot
4. Check browser console for errors

Return: screenshot + console error list + whether the visual checks passed.
```

## Example browser_subagent Call

```javascript
browser_subagent({
  TaskName: "Verify Tile Rendering",
  Task: `Navigate to http://localhost:5173. 
  Wait 3 seconds for the page to load.
  Take a screenshot of the game world.
  Open F12 console and report any errors.
  Check if tiles show as images (not colored circles).
  Return: screenshot description + console errors`,
  TaskSummary: "Check if tile rendering works correctly",
  RecordingName: "tile_render_check"
})
```

## Tips
- Always wait 2-3 seconds after page load before taking screenshots
- Use `RecordingName` in snake_case, max 3 words
- Zoom out if the page is too large (Ctrl+-)
- For scrolling, specify the direction and amount clearly
- Check `MediaPaths` if you need to compare with reference images
