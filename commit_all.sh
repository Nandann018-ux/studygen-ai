#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "==> Staging and committing all changes..."

# 1. Backend: User model
git add server/models/User.js
git commit -m "feat(server/models): add avatar field to User schema with default pixel-art seed" 2>/dev/null || echo "Nothing to commit for User.js"

# 2. Backend: Auth controller
git add server/controllers/auth.controller.js
git commit -m "feat(server/auth): expose and persist avatar across register, login, getMe, updateProfile" 2>/dev/null || echo "Nothing to commit for auth.controller.js"

# 3. Backend: ML service
git add server/services/mlService.js
git commit -m "feat(server/ml): harden neural heuristics to prevent false High Attention flags for mastery subjects" 2>/dev/null || echo "Nothing to commit for mlService.js"

# 4. Backend: Study plan generator  
git add server/utils/studyPlanGenerator.js
git commit -m "feat(server/planner): implement weighted difficulty-based subject prioritization" 2>/dev/null || echo "Nothing to commit for studyPlanGenerator.js"

# 5. Backend: Controllers
git add server/controllers/ml.controller.js
git commit -m "fix(server/ml): resolve prediction accuracy using historical exam performance baseline" 2>/dev/null || echo "Nothing to commit for ml.controller.js"

git add server/controllers/studyPlan.controller.js
git commit -m "feat(server/studyPlan): enforce daily study hour ceiling constraint" 2>/dev/null || echo "Nothing to commit for studyPlan.controller.js"

git add server/controllers/studySession.controller.js
git commit -m "feat(server/sessions): implement Mark as Completed study session tracking" 2>/dev/null || echo "Nothing to commit for studySession.controller.js"

git add server/controllers/subject.controller.js
git commit -m "fix(server/subjects): align subject controller with pluralized route standards" 2>/dev/null || echo "Nothing to commit for subject.controller.js"

# 6. Backend: Models
git add server/models/StudyPlan.js
git commit -m "feat(server/models): update StudyPlan schema for weighted session data" 2>/dev/null || echo "Nothing to commit for StudyPlan.js"

git add server/models/StudySession.js
git commit -m "feat(server/models): finalize StudySession schema for completion tracking" 2>/dev/null || echo "Nothing to commit for StudySession.js"

git add server/models/Subject.js
git commit -m "feat(server/models): add difficulty and proficiency fields to Subject schema" 2>/dev/null || echo "Nothing to commit for Subject.js"

# 7. Backend: Routes/Utils
git add server/routes/subject.routes.js
git commit -m "fix(server/routes): standardize subject routes to pluralized /subjects endpoints" 2>/dev/null || echo "Nothing to commit for subject.routes.js"

git add server/utils/seeds.js
git commit -m "chore(server/seeds): update seed data after schema changes" 2>/dev/null || echo "Nothing to commit for seeds.js"

git add server/subjects.test.js
git commit -m "test(server): update subject tests for updated schema and routes" 2>/dev/null || echo "Nothing to commit for subjects.test.js"

# 8. Frontend: Context
git add client/src/context/UserContext.jsx
git commit -m "feat(client/context): create global UserContext for real-time identity synchronization" 2>/dev/null || echo "Nothing to commit for UserContext.jsx"

git add client/src/context/ThemeContext.jsx
git commit -m "fix(client/theme): enforce light as default theme on initialization" 2>/dev/null || echo "Nothing to commit for ThemeContext.jsx"

# 9. Frontend: App entry
git add client/src/App.jsx
git commit -m "feat(client/app): wrap routing in UserProvider and redirect root to /auth" 2>/dev/null || echo "Nothing to commit for App.jsx"

# 10. Frontend: CSS
git add client/src/index.css
git commit -m "style(client/css): add neural-dot pulse and shimmer keyframe animations" 2>/dev/null || echo "Nothing to commit for index.css"

# 11. Frontend: Components - Navbar
git add client/src/components/Navbar.jsx
git commit -m "feat(client/navbar): rebrand to Neural Laboratory and display live user avatar" 2>/dev/null || echo "Nothing to commit for Navbar.jsx"

# 12. Frontend: Components - Sidebar
git add client/src/components/Sidebar.jsx
git commit -m "feat(client/sidebar): sync avatar via UserContext and make profile plate clickable" 2>/dev/null || echo "Nothing to commit for Sidebar.jsx"

# 13. Frontend: Pages - Settings
git add client/src/pages/Settings.jsx
git commit -m "feat(client/settings): add Neural Identity avatar grid with real-time persona sync" 2>/dev/null || echo "Nothing to commit for Settings.jsx"

# 14. Frontend: Pages - Dashboard
git add client/src/pages/Dashboard.jsx
git commit -m "ui(client/dashboard): add Neural Progress Sync shimmer loading indicator" 2>/dev/null || echo "Nothing to commit for Dashboard.jsx"

# 15. Frontend: Pages - Analytics
git add client/src/pages/Analytics.jsx
git commit -m "ui(client/analytics): integrate neural-dot loading pulse and theme-aware charts" 2>/dev/null || echo "Nothing to commit for Analytics.jsx"

# 16. Frontend: Pages - StudyPlan
git add client/src/pages/StudyPlan.jsx
git commit -m "ui(client/plan): add neural-pulse loading state and Mark as Completed flow" 2>/dev/null || echo "Nothing to commit for StudyPlan.jsx"

# 17. Frontend: Pages - Subjects
git add client/src/pages/Subjects.jsx
git commit -m "feat(client/subjects): align data entry with backend schema and proficiency tracking" 2>/dev/null || echo "Nothing to commit for Subjects.jsx"

# 18. Catch-all for any remaining tracked changes
git add -A
git diff --cached --quiet || git commit -m "chore: clean up remaining tracked changes across sanctuary modules"

echo ""
echo "==> All commits done. Pushing to remote..."
git push origin main

echo ""
echo "==> Done! All changes committed and pushed."
