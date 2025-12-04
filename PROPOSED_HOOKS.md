# 🪝 Proposed Kiro Hooks for Monday Painter

## What are Hooks?

Hooks allow automatic agent execution when events occur in the IDE. They can:
- Run when you save a file
- Execute when a message is sent
- Trigger on session creation
- Run manually via button click

## 🎯 Recommended Hooks for Monday Painter

### 1. Auto-Build on Save 🔨
**Trigger**: When you save a TypeScript file
**Action**: Automatically compile the project
**Benefit**: Catch errors immediately

```yaml
Name: Auto-Build Backend
Trigger: On file save
File Pattern: backend/src/**/*.ts
Action: Execute command
Command: cd backend && npm run build
```

```yaml
Name: Auto-Build Frontend
Trigger: On file save
File Pattern: frontend/src/**/*.ts
Action: Execute command
Command: cd frontend && npm run build
```

### 2. Run Tests on Save 🧪
**Trigger**: When you save a test file
**Action**: Run the specific test
**Benefit**: Immediate test feedback

```yaml
Name: Run Backend Tests
Trigger: On file save
File Pattern: backend/src/**/*.test.ts
Action: Execute command
Command: cd backend && npm test
```

```yaml
Name: Run Frontend Tests
Trigger: On file save
File Pattern: frontend/src/**/*.spec.ts
Action: Execute command
Command: cd frontend && npm test
```

### 3. Lint on Save 📝
**Trigger**: When you save any TypeScript file
**Action**: Run linter
**Benefit**: Maintain code quality

```yaml
Name: Lint Backend
Trigger: On file save
File Pattern: backend/src/**/*.ts
Action: Execute command
Command: cd backend && npm run lint
```

```yaml
Name: Lint Frontend
Trigger: On file save
File Pattern: frontend/src/**/*.ts
Action: Execute command
Command: cd frontend && npm run lint
```

### 4. Update Documentation 📚
**Trigger**: Manual button click
**Action**: Ask agent to update documentation
**Benefit**: Keep docs in sync

```yaml
Name: Update Docs
Trigger: Manual
Action: Send message to agent
Message: "Review recent changes and update CURRENT_STATUS_AND_TODOS.md"
```

### 5. Code Review Helper 👀
**Trigger**: Manual button click
**Action**: Ask agent to review current file
**Benefit**: Get instant code review

```yaml
Name: Review Current File
Trigger: Manual
Action: Send message to agent
Message: "Review the current file for bugs, improvements, and best practices"
```

### 6. Generate Component 🎨
**Trigger**: Manual button click
**Action**: Ask agent to create a new component
**Benefit**: Faster component scaffolding

```yaml
Name: New Angular Component
Trigger: Manual
Action: Send message to agent
Message: "Create a new Angular component with the name I provide, following the project structure"
```

### 7. Fix Compilation Errors 🔧
**Trigger**: When compilation fails
**Action**: Ask agent to fix errors
**Benefit**: Automatic error fixing

```yaml
Name: Fix Build Errors
Trigger: Manual (after build fails)
Action: Send message to agent
Message: "Fix the TypeScript compilation errors in the project"
```

### 8. Restart Servers 🔄
**Trigger**: Manual button click
**Action**: Restart backend and frontend
**Benefit**: Quick server restart

```yaml
Name: Restart All Servers
Trigger: Manual
Action: Execute command
Command: taskkill /F /IM node.exe && START_BACKEND.bat && START_FRONTEND.bat
```

### 9. Check Network Status 🌐
**Trigger**: Manual button click
**Action**: Display network information
**Benefit**: Quick network diagnostics

```yaml
Name: Show Network Info
Trigger: Manual
Action: Execute command
Command: GET_NETWORK_INFO.bat
```

### 10. Deploy to Production 🚀
**Trigger**: Manual button click
**Action**: Build and deploy
**Benefit**: One-click deployment

```yaml
Name: Deploy
Trigger: Manual
Action: Execute command
Command: npm run build && npm run deploy
```

---

## 🎯 Most Useful Hooks (Top 5)

### 1. **Auto-Build on Save** ⭐⭐⭐⭐⭐
Catches errors immediately while coding

### 2. **Update Documentation** ⭐⭐⭐⭐⭐
Keeps docs in sync with code changes

### 3. **Code Review Helper** ⭐⭐⭐⭐
Get instant feedback on your code

### 4. **Fix Compilation Errors** ⭐⭐⭐⭐
Automatic error fixing

### 5. **Restart Servers** ⭐⭐⭐
Quick server restart during development

---

## 📋 Hook Categories

### Development Workflow
- Auto-Build on Save
- Run Tests on Save
- Lint on Save
- Fix Compilation Errors

### Code Quality
- Code Review Helper
- Lint on Save
- Run Tests on Save

### Documentation
- Update Documentation
- Generate Component

### Operations
- Restart Servers
- Check Network Status
- Deploy to Production

---

## 🚀 How to Create These Hooks

### Method 1: Command Palette
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Search for "Open Kiro Hook UI"
3. Click to open the hook creation interface
4. Fill in the details from above

### Method 2: Explorer View
1. Look for "Agent Hooks" section in Explorer
2. Click the "+" button to create new hook
3. Configure trigger, action, and command

### Method 3: Ask Kiro
Simply say: "Create a hook that builds the backend when I save TypeScript files"

---

## 💡 Custom Hook Ideas

### For Your Workflow
- **Auto-format on save** - Run Prettier
- **Commit reminder** - Remind to commit after X changes
- **Backup on save** - Auto-backup important files
- **Screenshot on error** - Capture errors automatically

### For Team Collaboration
- **Notify team** - Send message when deploying
- **Update changelog** - Auto-update CHANGELOG.md
- **Run security scan** - Check for vulnerabilities
- **Generate API docs** - Update API documentation

### For Testing
- **Run integration tests** - Full test suite
- **Performance test** - Benchmark on save
- **Visual regression** - Screenshot comparison
- **Load test** - Stress test the backend

---

## 🎨 Monday Painter Specific Hooks

### 1. Test Game Flow
```yaml
Name: Test Full Game
Trigger: Manual
Action: Send message to agent
Message: "Start backend and frontend, then guide me through testing a complete game flow"
```

### 2. Check Disconnect Handling
```yaml
Name: Test Disconnects
Trigger: Manual
Action: Send message to agent
Message: "Help me test disconnect scenarios: lobby disconnect, host disconnect, and in-game disconnect"
```

### 3. Validate Network Setup
```yaml
Name: Validate Network
Trigger: Manual
Action: Execute command
Command: GET_NETWORK_INFO.bat && echo "Check if ports 4200 and 8080 are accessible"
```

### 4. Update Game Status
```yaml
Name: Update Status Doc
Trigger: Manual
Action: Send message to agent
Message: "Review all recent changes and update CURRENT_STATUS_AND_TODOS.md with current completion status"
```

### 5. Generate Component Boilerplate
```yaml
Name: New Game Component
Trigger: Manual
Action: Send message to agent
Message: "Create a new game phase component following the existing pattern (input/draw/guess)"
```

---

## 📊 Recommended Setup

### Essential (Set up first)
1. ✅ Auto-Build on Save (Backend)
2. ✅ Auto-Build on Save (Frontend)
3. ✅ Update Documentation
4. ✅ Code Review Helper

### Nice to Have
5. ⚠️ Run Tests on Save
6. ⚠️ Lint on Save
7. ⚠️ Restart Servers
8. ⚠️ Fix Compilation Errors

### Advanced
9. ⚠️ Deploy to Production
10. ⚠️ Check Network Status

---

## 🎯 Next Steps

1. **Open Kiro Hook UI**: `Ctrl+Shift+P` → "Open Kiro Hook UI"
2. **Create your first hook**: Start with "Auto-Build on Save"
3. **Test it**: Save a file and watch it build automatically
4. **Add more**: Gradually add hooks as you need them

---

**Tip**: Start with 2-3 hooks and add more as you get comfortable with them!
