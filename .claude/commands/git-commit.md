# Git Commit Command

Create a well-structured git commit and push to the remote repository.

## Instructions

When the user invokes `/git-commit [message]`, follow these steps:

### 1. Check Git Status
First, check what files are modified and untracked:
```bash
git status
```

### 2. Auto-Stage Safe Files
Automatically stage all modified and untracked files, EXCEPT:
- Sensitive files (see "CRITICAL: Blocked Files" section below)
- `.playwright-mcp/` directory
- `3d-objects-png/` directory
- Any files matching patterns in .gitignore

**Validation Process:**
1. Get list of all modified and untracked files
2. Filter out sensitive file patterns (serviceAccountKey.json, config.js, .env, *key*.json, *secret*.json, *credentials*.json)
3. Filter out excluded directories (.playwright-mcp/, 3d-objects-png/)
4. Stage remaining safe files with `git add`

**Command sequence:**
```bash
# Add all files except sensitive and excluded ones
git add .
# Remove sensitive files if accidentally staged
git reset HEAD scripts/serviceAccountKey.json public/firebase/config.js 2>/dev/null || true
git reset HEAD .env *.env 2>/dev/null || true
git reset HEAD .playwright-mcp/ 3d-objects-png/ 2>/dev/null || true
```

### 3. Show What Will Be Committed
Display the list of staged files to the user for transparency

### 4. Process Commit Message
- If a message was provided as an argument, use it
- If no message provided, ask the user to provide one
- Validate the message follows best practices:
  - Uses imperative mood (e.g., "Add feature" not "Added feature")
  - Starts with a verb (add, fix, update, remove, refactor, etc.)
  - Is concise but descriptive (50 characters or less for the first line)
  - Explains what the change does, not how it does it
  - Uses present tense

### 5. Create the Commit
Execute the git commit with the provided message:
```bash
git commit -m "MESSAGE_HERE

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 6. Push to Remote
Push the commit to the remote repository:
```bash
git push origin main
```

### 7. Confirm Success
- Verify the commit was created successfully
- Verify the push was successful
- Show the user the commit hash and summary

## Best Practices Guidance

### Good Commit Messages:
- "Add user authentication system"
- "Fix dropdown menu positioning issue"
- "Update API endpoint for user profiles"
- "Remove deprecated helper methods"
- "Refactor database connection logic"

### Bad Commit Messages:
- "stuff"
- "fixed it"
- "changes"
- "updates and fixes"

## Error Handling
- If no files staged: "No files staged for commit. Use 'git add' to stage files first."
- If commit fails: Show the error and suggest fixes
- If push fails: Show the error and suggest fixes (e.g., pull first if behind remote)

## Safety Checks
- NEVER commit without user approval
- NEVER push to main/master if there are merge conflicts
- NEVER commit files that likely contain secrets (.env, credentials.json, etc.)
- Warn the user if committing sensitive files

### 🔒 CRITICAL: Blocked Files (NEVER COMMIT)
The following files contain sensitive credentials and API keys and MUST NEVER be committed to GitHub:

**Absolutely Forbidden:**
- `scripts/serviceAccountKey.json` - Contains Firebase Admin SDK private key
- `public/firebase/config.js` - Contains Firebase API configuration and keys
- Any file matching: `*.env`, `*.env.*`, `.env*`
- Any file matching: `**/config.js` (except in node_modules)
- Any file matching: `**/*key*.json`, `**/*secret*.json`, `**/*credentials*.json`

**Pre-Commit Validation:**
Before committing, run:
```bash
git diff --cached --name-only | grep -E "(serviceAccountKey\.json|public/firebase/config\.js|\.env|config\.js|key.*\.json|secret.*\.json|credentials.*\.json)"
```

If ANY files match:
1. **STOP IMMEDIATELY** - Do not proceed with commit
2. **Unstage the sensitive files:**
   ```bash
   git reset HEAD <sensitive-file>
   ```
3. **Verify .gitignore contains:**
   - `scripts/serviceAccountKey.json`
   - `public/firebase/config.js`
   - `.env`
   - `*.env`
4. **Inform the user** that sensitive files were blocked from commit
5. **Continue with remaining safe files** only after removing sensitive files

**If sensitive files were previously committed:**
1. Alert the user immediately
2. Recommend using `git filter-branch` or BFG Repo-Cleaner to remove from history
3. Recommend rotating all exposed credentials immediately
