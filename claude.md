# CardWise - Claude Code Behavior Guide

## Project Overview

CardWise is an interactive flashcard web application built with vanilla JavaScript, Firebase/Firestore, and deployed on Firebase Hosting. It enables users to study subjects organized by units and chapters, take quizzes, and track their learning progress.

**Tech Stack:**
- Frontend: Vanilla JavaScript, HTML5, CSS3
- Backend: Firebase Authentication, Firestore Database
- Hosting: Firebase Hosting
- Testing: Playwright MCP for UI automation

**Production URL:** https://cardwise-80156.web.app
**Local Development:** `firebase serve` (port 5000) or `npx serve public`

---

## 🚨 CRITICAL: Local Testing Protocol

**NEVER deploy without local verification first!**

### Required Workflow for ALL Changes:
1. **Develop locally** - Make changes in `/public` directory
2. **Start local server** - `firebase serve` or `npx serve public`
3. **Test with Playwright MCP on localhost** - `http://localhost:5000`
   - Navigate to the page
   - Take screenshots
   - Check console errors
   - Test user flows
   - Verify responsiveness
4. **Fix issues found** - Repeat steps 2-3 until everything is perfect
5. **Wait for explicit deploy confirmation** - Ask user before deploying
6. **Deploy only after approval** - `firebase deploy`
7. **Post-deploy sanity check** - Quick smoke test (NOT full testing)

### Why This Matters:
- **Client safety first** - Production users should never encounter broken features
- **Local = safe testing ground** - Playwright MCP catches issues before they harm anyone
- **Deployment is intentional** - Only deploy when user explicitly confirms readiness

---

## Core Architecture

### File Structure
```
/public/              # Static assets and entry point
  - index.html        # Main HTML with inline styles
  - app.js           # Core application logic
  - answerChecker.js # Fuzzy answer matching
  - firebase/        # Firebase config
  - services/        # Auth and database services
  - components/      # UI components
/scripts/            # Backend scripts (data migration)
/firebase.json       # Firebase hosting config
/firestore.rules     # Security rules
```

### Data Model
- **Subjects** → **Units** → **Chapters** → **Flashcards/Quizzes**
- Firestore collections: `subjects`, `flashcards`, `quizzes`, `users`, `quiz_attempts`
- All indices are string-based in data structures

### Key Navigation States
```javascript
currentSubject       // Subject key (e.g., "economics")
currentSubjectName   // Display name
currentUnit          // Unit index (as number)
currentChapter       // Chapter index (as number)
```

---

## Development Guidelines

### Code Style
- Use ES6+ features (async/await, arrow functions, template literals)
- Maintain consistent indentation (2 spaces)
- Add meaningful comments for complex logic
- Use descriptive variable names
- Avoid global scope pollution

### CSS Approach
- Critical styles are inline in `index.html` for performance
- Use CSS custom properties for theming
- Maintain responsive design (mobile-first)
- Slate gray (#2D3748) primary color with blue accents (#60A5FA)

### State Management
- All state in global variables in `app.js`
- Use transition functions for screen navigation
- Preserve breadcrumb navigation state
- Clear stale state when navigating

### Firebase Integration
- Always check user authentication before Firestore writes
- Use async/await for all Firebase operations
- Handle errors gracefully with try/catch
- Log Firebase operations for debugging

---

## Playwright MCP Workflows

### When to Use Playwright MCP

**Always test with Playwright MCP on localhost for:**
1. UI component changes (cards, buttons, modals)
2. Navigation flow modifications
3. Authentication screen updates
4. Responsive design adjustments
5. Before committing any frontend changes
6. After fixing console errors or bugs

### Testing Workflow (ALWAYS ON LOCALHOST)

#### 1. Quick Visual Check (Small Changes)
```bash
# Step 1: Start local server
firebase serve  # or: npx serve public

# Step 2: Navigate to localhost
mcp__playwright__browser_navigate --url="http://localhost:5000"

# Step 3: Test DESKTOP view (1920x1080)
mcp__playwright__browser_resize --width=1920 --height=1080
mcp__playwright__browser_snapshot  # Capture accessibility tree
mcp__playwright__browser_take_screenshot  # Visual verification
mcp__playwright__browser_console_messages  # Check for errors

# Step 4: Test TABLET view (768x1024)
mcp__playwright__browser_resize --width=768 --height=1024
mcp__playwright__browser_take_screenshot --filename="tablet-view.png"
mcp__playwright__browser_console_messages  # Check for errors

# Step 5: Test MOBILE view (375x667 - iPhone SE)
mcp__playwright__browser_resize --width=375 --height=667
mcp__playwright__browser_take_screenshot --filename="mobile-view.png"
mcp__playwright__browser_console_messages  # Check for errors

# Step 6: Verify responsive behavior
# - No horizontal scroll on mobile
# - Text is readable (min 14px)
# - Buttons are tappable (min 44x44px)
# - Cards stack vertically on mobile
# - No layout breaks or overlapping elements
```

#### 2. User Flow Testing (Navigation Changes)
```bash
# MUST run on localhost:5000
# Test on ALL THREE viewport sizes: Desktop, Tablet, Mobile

# DESKTOP (1920x1080)
mcp__playwright__browser_resize --width=1920 --height=1080
1. Navigate to http://localhost:5000
2. Click subject card
3. Verify units display correctly
4. Click unit card
5. Verify chapters display
6. Click chapter
7. Verify flashcards render
8. Start quiz
9. Submit answers
10. Verify results screen
11. Check console for errors at each step

# TABLET (768x1024)
mcp__playwright__browser_resize --width=768 --height=1024
Repeat steps 1-11, verify responsive layout

# MOBILE (375x667)
mcp__playwright__browser_resize --width=375 --height=667
Repeat steps 1-11, verify:
- No horizontal scroll
- Buttons are easily tappable
- Text is readable
- Flashcards flip correctly on mobile
```

#### 3. Search & Filter Testing
```bash
# Test search functionality on localhost:5000
# Test on ALL viewport sizes

# DESKTOP
mcp__playwright__browser_resize --width=1920 --height=1080
1. Navigate to http://localhost:5000
2. Enter search term in search input
3. Verify filtered results appear
4. Test subject/unit/chapter filters
5. Verify clear button functionality
6. Check search result navigation
7. Check console for errors

# MOBILE
mcp__playwright__browser_resize --width=375 --height=667
Repeat steps 1-7, verify:
- Search bar is usable on mobile keyboard
- Filter dropdowns work on mobile
- Search results display properly
- No layout breaks with keyboard open
```

#### 4. Authentication Flow Testing
```bash
# Test auth modal and user state on localhost:5000
# Test on ALL viewport sizes (auth modals must work on mobile!)

# DESKTOP
mcp__playwright__browser_resize --width=1920 --height=1080
1. Navigate to http://localhost:5000
2. Trigger auth modal
3. Test sign up flow
4. Test sign in flow
5. Verify authenticated user state
6. Test sign out
7. Check console for Firebase auth errors

# MOBILE
mcp__playwright__browser_resize --width=375 --height=667
Repeat steps 1-7, verify:
- Modal fits within mobile viewport
- Input fields are accessible
- Buttons are easily tappable
- No form field zoom issues on iOS
```

#### 5. Console Error Detection
```bash
mcp__playwright__browser_console_messages
# Check for JavaScript errors after each interaction
# Common issues: Firebase config, missing DOM elements, race conditions
```

### Automated UI Iteration with Playwright MCP

**Pattern for UI Improvements (ON LOCALHOST):**
1. Start local server: `firebase serve`
2. Navigate to `http://localhost:5000` with Playwright MCP
3. Take screenshot of current state
4. Identify visual/UX issues
5. Make code changes in `/public` directory
6. Reload localhost page
7. Take new screenshot
8. Compare and verify improvements
9. Repeat steps 5-8 until satisfactory
10. **Ask user for deployment approval**

**Example Checklist (TEST ON ALL VIEWPORTS):**
- [ ] Proper color contrast (WCAG AA)
- [ ] Smooth transitions between screens
- [ ] No layout shift on load
- [ ] Buttons have hover/active states (desktop) and tap states (mobile)
- [ ] **MOBILE (375x667):** No horizontal scroll, readable text, tappable buttons
- [ ] **TABLET (768x1024):** Proper layout adaptation, no element overlap
- [ ] **DESKTOP (1920x1080):** Full feature visibility, proper spacing
- [ ] Loading states for async operations
- [ ] Error messages are user-friendly on all devices

### Automated Test Generation

When implementing new features, use Playwright MCP to:
1. Record user interactions
2. Generate test scenarios
3. Document edge cases discovered
4. Create regression test checklist

---

## Common Tasks

### Adding New Flashcards
1. Flashcards stored in Firestore `flashcards` collection
2. Structure: `{ subjectKey, unitIndex, chapterIndex, question, answer }`
3. Use `scripts/migrateData.js` for bulk imports
4. Test search indexing after adding

### Adding New Subjects/Units/Chapters
1. Update Firestore `subjects` collection
2. Structure follows: `subjects → units → chapters`
3. Reload `loadSubjectsFromFirestore()` to verify
4. Test navigation breadcrumbs

### Modifying Quiz Logic
- Answer checking uses `AnswerChecker` class (fuzzy matching, 80% threshold)
- Quiz results saved to `quiz_attempts` collection
- Supports both textbook questions and flashcard-based quizzes
- Always preserve navigation state during quiz

### Styling Changes
- Inline styles in `<style>` tag (lines 12-623 in index.html)
- Subject-specific colors defined with `.subject-{name}` classes
- Test on multiple viewport sizes
- **Always verify with Playwright MCP after CSS changes**

---

## Debugging Protocol

### Step 1: Console Logs
- Check browser console for errors
- Verify Firebase initialization
- Check Firestore query results

### Step 2: Playwright MCP Snapshot
```bash
mcp__playwright__browser_snapshot      # Accessibility tree
mcp__playwright__browser_console_messages --onlyErrors=true
```

### Step 3: Network Inspection
```bash
mcp__playwright__browser_network_requests
# Verify Firebase API calls, CDN resources, Firestore queries
```

### Step 4: State Verification
- Add `console.log()` for navigation state variables
- Verify indices are correct type (string vs number)
- Check async data loading timing

---

## Playwright MCP Best Practices

### Navigation Testing
- Always wait for network idle before assertions
- Use `mcp__playwright__browser_wait_for` for dynamic content
- Verify breadcrumbs update correctly
- Test back button behavior

### Form Testing
```bash
# Use fill_form for multiple inputs
mcp__playwright__browser_fill_form
# Or type for individual inputs with validation
mcp__playwright__browser_type --slowly=true
```

### Screenshot Strategy
- Take full-page screenshots for landing page
- Take viewport screenshots for modal/card interactions
- Use element screenshots for isolated component testing
- Compare before/after for iterative improvements

### Error Reproduction
1. Get steps to reproduce from user
2. Use Playwright MCP to automate reproduction
3. Capture screenshots and console logs at failure point
4. Fix issue
5. Re-run automated reproduction to verify fix

---

## Testing Checklist

### Before Every Commit
- [ ] Start local server: `firebase serve`
- [ ] Run Playwright MCP visual check on `http://localhost:5000`
- [ ] **Test on DESKTOP (1920x1080)** - Take screenshot, check console
- [ ] **Test on TABLET (768x1024)** - Take screenshot, check console
- [ ] **Test on MOBILE (375x667)** - Take screenshot, check console
- [ ] No console errors on localhost (any viewport)
- [ ] Navigation works in all directions (all viewports)
- [ ] Search/filter functional (all viewports)
- [ ] Authentication works if changed (all viewports)
- [ ] Quiz flow completes successfully (all viewports)
- [ ] No horizontal scroll on mobile
- [ ] All interactive elements tappable on mobile (min 44x44px)

### Before Deploying (User Must Approve)
- [ ] All "Before Every Commit" checks passed on localhost
- [ ] Full user flow tested on `http://localhost:5000` (all viewports)
- [ ] Zero console errors on localhost (all viewports)
- [ ] Screenshots show UI is perfect on desktop, tablet, AND mobile
- [ ] Mobile responsiveness verified (no horizontal scroll, tappable buttons)
- [ ] User explicitly confirms: "ready to deploy"
- [ ] **ONLY THEN:** Run `firebase deploy`

### After Deploying (Quick Sanity Check Only)
- [ ] Navigate to production URL
- [ ] Quick smoke test (landing page loads, one feature works)
- [ ] Check for critical console errors
- [ ] **NOT for full testing - that was done on localhost!**

---

## Performance Optimization

### Firebase
- Use `.where()` queries to limit Firestore reads
- Cache subject data after first load
- Index flashcards for search (pre-build `allFlashcards`)

### Frontend
- Lazy load flashcard data per chapter
- Use CSS transforms for animations (not position)
- Minimize DOM manipulation (batch updates)
- Debounce search input

---

## Security Considerations

### Firestore Rules
- Users can only write to their own `users/{uid}` document
- Users can only write to their own `quiz_attempts/{uid}` subcollection
- All reads require authentication
- Validate data types in security rules

### Client-Side
- Never expose service account keys in client code
- Keep `firebase/config.js` secret (already in `.gitignore`)
- Sanitize user input before display
- Use Firebase Auth for all sensitive operations

---

## Deployment

### ⚠️ CRITICAL: Deployment is ONLY after localhost verification

### Pre-Deployment Checklist (MANDATORY)
- [ ] All changes tested on `http://localhost:5000` with Playwright MCP
- [ ] Zero console errors on localhost
- [ ] All user flows work perfectly on localhost
- [ ] Screenshots confirm UI is correct
- [ ] User explicitly says: "deploy now" or "ready to deploy"

### Firebase Hosting Commands
```bash
# ONLY run after user approval!

# Deploy everything
firebase deploy

# Deploy hosting only
firebase deploy --only hosting

# Deploy Firestore rules only
firebase deploy --only firestore:rules
```

### Post-Deploy Sanity Check (NOT Full Testing)
1. Navigate to production URL: https://cardwise-80156.web.app
2. Quick smoke test (landing page loads)
3. Check for critical console errors only
4. **Full testing was done on localhost - this is just verification**

---

## Common Issues & Solutions

### Issue: Flashcards not loading
- **Cause:** Async race condition, Firestore query fails
- **Debug:** Check `chapterFlashcards` object in console
- **Solution:** Add null checks, verify indices are strings

### Issue: Quiz navigation broken
- **Cause:** Navigation state not preserved
- **Debug:** Log `currentSubject`, `currentUnit`, `currentChapter`
- **Solution:** Ensure state set before `showScreenWithTransition()`

### Issue: Search results incorrect
- **Cause:** `allFlashcards` index not built or stale
- **Debug:** Call `buildAllFlashcardsIndex()` manually in console
- **Solution:** Rebuild index after data changes

### Issue: Authentication modal not appearing
- **Cause:** AuthModal not initialized or import failed
- **Debug:** Check `authModal` variable, verify module import
- **Solution:** Ensure `components/auth.js` loads before `app.js`

---

## Feature Development Template

### Adding a New Feature
1. **Plan:** Define requirements, data model changes, UI mockups
2. **Firestore:** Update collections/documents, security rules, indexes
3. **Backend:** Implement in `services/databaseService.js`
4. **Frontend:** Add UI in `index.html`, logic in `app.js`
5. **Test with Playwright MCP:**
   - Visual check
   - User flow test
   - Console error check
6. **Document:** Update this guide with new patterns
7. **Deploy:** Firebase deploy, post-deploy verification

---

## AI Assistant Instructions

### When Asked to Make Changes
1. Read relevant files first (don't assume structure)
2. Understand current implementation before modifying
3. Make changes in `/public` directory
4. Start local server: `firebase serve`
5. **Test on localhost:5000 with Playwright MCP**
6. **Test ALL three viewports:**
   - Desktop (1920x1080) - Take screenshot, check console
   - Tablet (768x1024) - Take screenshot, check console
   - Mobile (375x667) - Take screenshot, check console
7. Verify responsiveness:
   - No horizontal scroll on mobile
   - Buttons are tappable (min 44x44px)
   - Text is readable (min 14px)
   - Layouts adapt properly
8. Check console for errors on all viewports
9. Show all screenshots to user (desktop, tablet, mobile)
10. Fix any issues found
11. Repeat steps 5-10 until perfect on all devices
12. **Ask user: "Ready to deploy?" - wait for explicit approval**
13. Only deploy after user confirms

### When Debugging Issues
1. Ask for reproduction steps (which device/viewport?)
2. Start local server: `firebase serve`
3. Navigate to `http://localhost:5000` with Playwright MCP
4. Reproduce issue on localhost (test all viewports if device-specific)
5. Capture console logs and screenshots (all relevant viewports)
6. Identify root cause before proposing fix
7. Make fix in `/public` directory
8. Test fix on localhost with Playwright MCP (all three viewports)
9. Verify fix completely resolves issue on all devices
10. Take screenshots showing fix works on desktop, tablet, mobile
11. **Ask user: "Ready to deploy?" - wait for approval**
12. Document issue and solution in commit message

### Playwright MCP Integration Principles (ALL ON LOCALHOST)
- **Agentic UI Iteration:** Analyze localhost screenshots (all viewports) → identify issues → make changes → verify on localhost → repeat
- **Automated UI Fixes:** Use localhost console logs to find errors → fix in code → verify with Playwright MCP on localhost (all viewports)
- **Reproduce User Flows:** Record user steps → automate with Playwright MCP on localhost:5000 → verify expected behavior (all viewports)
- **Responsive Testing:** Always test desktop (1920x1080), tablet (768x1024), mobile (375x667) for every change
- **Test Generation:** Document interactions on localhost → create test scenarios → build regression checklist
- **Deploy Only After:** All localhost tests pass on all viewports + user approval

---

## Quick Reference

### Key Files
- `public/index.html` - Main entry point, inline styles
- `public/app.js` - Core application logic, navigation, quiz
- `public/answerChecker.js` - Fuzzy answer matching algorithm
- `public/firebase/config.js` - Firebase configuration (secret)
- `public/services/databaseService.js` - Firestore operations
- `public/services/authService.js` - Authentication operations
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Composite indexes

### Firestore Collections
- `subjects` - Subject metadata with units/chapters structure
- `flashcards` - All flashcard questions/answers
- `quizzes` - Textbook quiz questions
- `users` - User profiles and settings
- `quiz_attempts` - User quiz history

### Key Functions (app.js)
- `showScreenWithTransition(screenId)` - Navigate between screens
- `showSubjectUnitsScreen(key, name, desc)` - Show subject units
- `showChapterFlashcards(subj, unit, ch, title)` - Show flashcards
- `startQuiz()` - Initialize quiz mode
- `handleSearch()` - Execute search/filter
- `loadChapterFlashcardsFromFirestore()` - Load flashcards from DB

### CSS Classes
- `.screen` - Main screen containers
- `.subject-button` - Subject selection cards
- `.chapter-card` - Unit/chapter navigation cards
- `.flashcard` - Individual flashcard
- `.quiz-container` - Quiz screen wrapper

---

## Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Firestore Data Model:** https://firebase.google.com/docs/firestore/data-model
- **Playwright Documentation:** https://playwright.dev/
- **Playwright MCP Server:** https://github.com/microsoft/playwright-mcp
- **Project Repository:** [Internal]

---

**Last Updated:** October 2025
**Maintained By:** CardWise Development Team
